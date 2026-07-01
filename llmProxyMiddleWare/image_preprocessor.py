"""
image-preprocessor — VLM Image Replacing Proxy

拦截 Claude Code 发出的 POST /v1/messages 请求，
将图片 content block 替换为 VLM 文字描述或标记文本，转发给不支持多模态的后端 LLM。
"""

import asyncio
import json
import re
import subprocess
import time
from datetime import datetime
from pathlib import Path

import aiohttp
from aiohttp import web

# 日志目录（脚本同级 logs/）
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# ============================================================
# 配置（可通过命令行参数覆盖）
# ============================================================

# --- VLM 线路选择 ---
# "minimax" 或 "mimo"
VLM_PROVIDER = "mimo"


# --- Mimo VLM (Anthropic 兼容) ---
MIMO_VLM_URL = "https://token-plan-sgp.xiaomimimo.com/anthropic/v1/messages"
MIMO_VLM_KEY = "tp-cotwwr2hdv66tm8toqs5jb1k9hx2gzlxomejmtq7f37mqv3g"
MIMO_VLM_MODEL = "mimo-v2.5"

# 端口，转发目标地址（当前默认为 mimo 新加坡站地址）
PORT = 8765
UPSTREAM_URL = "https://token-plan-sgp.xiaomimimo.com/anthropic"

# 黑名单：强制处理图片（优先级最高）。支持前缀匹配和 /regex/ 格式
BLACKLIST_MODELS = ["mimo-v2.5-pro"]

# 白名单：直接放通，不做处理（多模态模型）
WHITELIST_MODELS = [
    "claude-opus-4",
    "claude-sonnet-4",
    "claude-haiku-4",
    "mimo-v2.5",
]

# 是否处理历史消息中的图片（True=标记替换，False=保留原样）
STRIP_HISTORY_IMAGES = True

# vlm处理并行度
VLM_CONCURRENCY = 5

# ============================================================
# 通知 & 日志
# ============================================================

def notify(title, message):
    """Windows 系统通知（通过 PowerShell Toast）"""
    try:
        ps_cmd = f"""
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
        $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
        $template.GetElementsByTagName('text')[0].AppendChild($template.CreateTextNode('{title}')) > $null
        $template.GetElementsByTagName('text')[1].AppendChild($template.CreateTextNode('{message.replace("'", "''")}')) > $null
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Image Preprocessor').Show([Windows.UI.Notifications.ToastNotification]::new($template))
        """
        subprocess.Popen(["powershell", "-Command", ps_cmd],
                         creationflags=subprocess.CREATE_NO_WINDOW)
    except Exception:
        pass


def generate_vlm_id(base_time, seq):
    """生成全局唯一 VLM 图片 ID: img_MMDD_HHMMSS_NNN"""
    return f"img_{base_time.strftime('%m%d_%H%M%S')}_{seq:03d}"


def log_file_write(model, line):
    """写入当日日志文件"""
    log_file = LOG_DIR / f"proxy_{datetime.now().strftime('%Y-%m-%d')}.log"
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def log_vlm_terminal(model, provider, img_id, path, img_size_kb, elapsed, is_error):
    """终端输出 VLM 处理信息（不输出描述内容）"""
    ts = datetime.now().strftime("%H:%M:%S")
    path_str = path or "无路径"
    status = "失败" if is_error else "成功"
    print(f"[{ts}] [{model}] [{provider}] VLM {img_id}: {path_str} {img_size_kb}KB → {elapsed:.1f}s {status}", flush=True)


def log_vlm_file(model, provider, img_id, path, img_size_kb, elapsed, desc, is_error):
    """日志文件记录 VLM 处理信息"""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    path_str = f"路径={path}" if path else "路径=无路径"
    status = "失败" if is_error else "成功"
    line = f"[{ts}] [{model}] [{provider}] [{img_id}] VLM: {path_str}, {img_size_kb}KB → {elapsed:.1f}s, 状态={status}"
    log_file_write(model, line)


def write_vlm_md(model, provider, img_id, path, img_size_kb, elapsed, desc):
    """追加 VLM 完整描述到 md 文件"""
    ts = datetime.now().strftime("%H:%M:%S")
    path_str = path or "无路径"
    md_file = LOG_DIR / f"vlm_descs_{datetime.now().strftime('%Y-%m-%d')}.md"
    try:
        mode = "a" if md_file.exists() else "w"
        with open(md_file, mode, encoding="utf-8") as f:
            if mode == "w":
                f.write(f"# VLM 图片描述记录 — {datetime.now().strftime('%Y-%m-%d')}\n\n")
            f.write(f"## {img_id}\n")
            f.write(f"- **时间**: {ts}\n")
            f.write(f"- **模型**: {model}\n")
            f.write(f"- **VLM 线路**: {provider}\n")
            f.write(f"- **原图路径**: {path_str}\n")
            f.write(f"- **图片大小**: {img_size_kb}KB\n")
            f.write(f"- **耗时**: {elapsed:.1f}s\n\n")
            f.write(f"{desc}\n\n---\n\n")
    except Exception:
        pass

# ============================================================
# Header 处理
# ============================================================

HOP_BY_HOP = frozenset({
    "connection", "keep-alive", "proxy-authenticate",
    "proxy-authorization", "te", "trailers",
    "transfer-encoding", "upgrade", "content-length",
})


def filter_headers(headers):
    """过滤 hop-by-hop headers"""
    return {k: v for k, v in headers.items() if k.lower() not in HOP_BY_HOP}


# ============================================================
# 模型匹配
# ============================================================

def match_model(model, patterns):
    """前缀匹配 + /regex/ 匹配"""
    for p in patterns:
        if p.startswith("/") and p.endswith("/") and len(p) > 2:
            if re.search(p[1:-1], model):
                return True
        elif model.startswith(p):
            return True
    return False


def should_process(model):
    """
    判断模型是否需要图片处理。
    优先级：黑名单 > 白名单 > 默认处理（走代理就是要处理）
    """
    if match_model(model, BLACKLIST_MODELS):
        return True
    if match_model(model, WHITELIST_MODELS):
        return False
    return True  # 默认处理


# ============================================================
# 图片扫描与替换
# ============================================================

IMAGE_PATH_RE = re.compile(r"^\[Image: source:\s*(.+)\]$")


def find_images_in_content(content):
    """
    扫描 content 数组，找到所有 image block。
    递归扫描 tool_result 中的嵌套 content。
    图片和路径按顺序配对（支持多图连续排列的场景）。
    返回 [(index, image_block, path_or_None, path_block_index_or_None, is_nested), ...]
    """
    if not isinstance(content, list):
        return []

    # 收集顶层图片和路径
    image_positions = []
    path_blocks = {}  # {path_text: block_index}

    for i, block in enumerate(content):
        if isinstance(block, dict) and block.get("type") == "image":
            image_positions.append((i, block))
        elif (isinstance(block, dict) and block.get("type") == "text"
              and IMAGE_PATH_RE.match(block.get("text", ""))):
            m = IMAGE_PATH_RE.match(block.get("text", ""))
            if m:
                path_blocks[m.group(1)] = i

    # 按顺序配对图片和路径（同路径文本按出现顺序分配）
    used_paths = set()
    path_order = list(path_blocks.keys())
    positions = []
    path_idx = 0
    for i, img_block in image_positions:
        path = None
        path_bi = None
        if path_idx < len(path_order):
            path = path_order[path_idx]
            path_bi = path_blocks[path]
            path_idx += 1
        positions.append((i, img_block, path, path_bi, False))

    # 递归扫描 tool_result 的嵌套 content
    for i, block in enumerate(content):
        if isinstance(block, dict) and block.get("type") == "tool_result":
            nested = block.get("content")
            if isinstance(nested, list):
                for ni, nblock in enumerate(nested):
                    if isinstance(nblock, dict) and nblock.get("type") == "image":
                        positions.append((ni, nblock, None, None, True))

    return positions


def replace_content_blocks(content, replacements, nested_replacements=None, remove_indices=None):
    """
    替换 content 中的 image blocks。
    replacements: {original_index: replacement_text_block} — 顶层
    nested_replacements: {parent_index: {child_index: replacement}} — tool_result 嵌套
    remove_indices: set of indices to remove (e.g. [Image: source] path blocks)
    """
    # 先处理 tool_result 嵌套中的图片（在原 content 上原地修改）
    new_content = list(content)
    if nested_replacements:
        for parent_idx, child_repls in nested_replacements.items():
            parent = new_content[parent_idx]
            if isinstance(parent, dict) and parent.get("type") == "tool_result":
                child_content = parent.get("content")
                if isinstance(child_content, list):
                    new_child = list(child_content)
                    for child_idx in sorted(child_repls.keys(), reverse=True):
                        new_child[child_idx:child_idx + 1] = [child_repls[child_idx]]
                    parent["content"] = new_child

    # 收集需要删除的索引：显式 remove_indices + 路径 text block
    all_remove = set(remove_indices) if remove_indices else set()
    if replacements:
        for orig_idx in replacements:
            next_idx = orig_idx + 1
            if (next_idx < len(new_content)
                    and isinstance(new_content[next_idx], dict)
                    and new_content[next_idx].get("type") == "text"
                    and IMAGE_PATH_RE.match(new_content[next_idx].get("text", ""))):
                all_remove.add(next_idx)

    # 单次遍历重建，避免 pop 导致的 index shifting
    result = []
    for i, block in enumerate(new_content):
        if i in all_remove:
            continue
        if i in replacements:
            result.append(replacements[i])
        else:
            result.append(block)

    return result


# ============================================================
# VLM API 调用
# ============================================================

SEM = asyncio.Semaphore(VLM_CONCURRENCY)


VLM_PROMPT_TEMPLATE = """图片代理：根据用户消息，描述 [Image #{image_num}] 的内容。
用户消息：{user_text}
要求：结合用户问题描述图片内容，重点描述标记/框选区域，给出足够上下文让下游LLM回答问题。简洁回答。"""


def _build_vlm_prompt(user_text, image_num):
    """构建 VLM prompt，包含完整用户消息和当前图片编号"""
    return VLM_PROMPT_TEMPLATE.format(
        user_text=user_text if user_text else "（无文本内容）",
        image_num=image_num,
    )


async def _call_minimax_vlm(session, base64_data, media_type, prompt):
    """调用 MiniMax VLM API"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {MINIMAX_VLM_KEY}",
        "MM-API-Source": "Minimax-MCP",
    }
    body = {
        "prompt": prompt,
        "image_url": f"data:{media_type};base64,{base64_data}",
        "max_tokens": 1024,
    }
    async with session.post(
        MINIMAX_VLM_URL,
        json=body,
        headers=headers,
        timeout=aiohttp.ClientTimeout(total=120),
    ) as resp:
        if resp.status != 200:
            err = await resp.text()
            return (f"HTTP {resp.status}: {err[:200]}", True)
        result = await resp.json()
        desc = result.get("content", "")
        if not desc:
            return ("空描述", True)
        return (desc, False)


async def _call_mimo_vlm(session, base64_data, media_type, prompt):
    """调用 Mimo VLM API (Anthropic 兼容)"""
    headers = {
        "Content-Type": "application/json",
        "x-api-key": MIMO_VLM_KEY,
        "anthropic-version": "2023-06-01",
    }
    body = {
        "model": MIMO_VLM_MODEL,
        "max_tokens": 1024,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": base64_data,
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    }
    async with session.post(
        MIMO_VLM_URL,
        json=body,
        headers=headers,
        timeout=aiohttp.ClientTimeout(total=120),
    ) as resp:
        if resp.status != 200:
            err = await resp.text()
            return (f"HTTP {resp.status}: {err[:200]}", True)
        result = await resp.json()
        content = result.get("content", [])
        if not content:
            return ("空描述", True)
        desc = content[0].get("text", "")
        if not desc:
            return ("空描述", True)
        return (desc, False)


async def call_vlm(session, base64_data, media_type, user_text="", image_num=1):
    """调用 VLM API 获取图片描述。返回 (描述, 耗时秒, 是否失败)"""
    t0 = time.monotonic()
    async with SEM:
        prompt = _build_vlm_prompt(user_text, image_num)
        try:
            if VLM_PROVIDER == "mimo":
                desc, is_error = await _call_mimo_vlm(
                    session, base64_data, media_type, prompt)
            else:
                desc, is_error = await _call_minimax_vlm(
                    session, base64_data, media_type, prompt)
            elapsed = time.monotonic() - t0
            return (desc, elapsed, is_error)
        except Exception as e:
            elapsed = time.monotonic() - t0
            return (f"异常: {e}", elapsed, True)


# ============================================================
# 请求处理
# ============================================================

async def proxy_handler(request):
    # HEAD 请求 → 健康检查
    if request.method == "HEAD":
        return web.Response(status=200)

    path = request.path

    # 非 /v1/messages → 透明转发
    if path != "/v1/messages":
        return await forward_request(request)

    # 仅拦截 POST /v1/messages
    if request.method != "POST":
        return await forward_request(request)

    # 读取并解析 body
    raw_body = await request.read()
    try:
        body = json.loads(raw_body)
    except (json.JSONDecodeError, ValueError):
        return await forward_request(request, raw_body)

    if not isinstance(body, dict) or "messages" not in body:
        return await forward_request(request, raw_body)

    model = body.get("model", "")

    # 检查模型是否需要处理
    if not should_process(model):
        print(f"[{model}] 白名单放通", flush=True)
        return await forward_request(request, raw_body)

    # 找最后一条 user 消息的 index
    messages = body["messages"]
    last_user_idx = None
    for i in range(len(messages) - 1, -1, -1):
        if messages[i].get("role") == "user":
            last_user_idx = i
            break

    if last_user_idx is None:
        return await forward_request(request, raw_body)

    # 提取最后一条 user 消息中的文本（过滤掉 [Image: source] 路径块）
    user_text = ""
    last_user_content = messages[last_user_idx].get("content")
    if isinstance(last_user_content, list):
        text_parts = []
        for block in last_user_content:
            if isinstance(block, dict) and block.get("type") == "text":
                text = block.get("text", "")
                if not IMAGE_PATH_RE.match(text):
                    text_parts.append(text)
        user_text = "\n".join(text_parts).strip()
    elif isinstance(last_user_content, str):
        user_text = last_user_content.strip()

    # 扫描所有 messages，按出现顺序分配全局图片编号
    # all_images: [(msg_idx, content_idx, image_block, path, is_nested, global_num), ...]
    all_images = []
    global_img_num = 0

    for mi, msg in enumerate(messages):
        content = msg.get("content")
        if not isinstance(content, list):
            continue

        images = find_images_in_content(content)
        for orig_idx, img_block, path, path_bi, is_nested in images:
            global_img_num += 1
            all_images.append((mi, orig_idx, img_block, path, path_bi, is_nested, global_img_num))

    # 分离最新消息图片和历史消息图片
    # 元组: (msg_idx, orig_idx, img_block, path, path_bi, is_nested, global_num)
    latest_images = [t for t in all_images if t[0] == last_user_idx]
    history_images = [t for t in all_images if t[0] != last_user_idx]

    if not latest_images and not history_images:
        return await forward_request(request, raw_body)

    ts = datetime.now().strftime("%H:%M:%S")
    parts_scan = []
    if latest_images:
        nums = ", ".join(f"#{gn}" for _, _, _, _, _, _, gn in latest_images)
        parts_scan.append(f"{len(latest_images)}张VLM({nums})")
    if history_images:
        parts_scan.append(f"{len(history_images)}张历史")
    print(f"[{ts}] [{model}] 扫描: {' + '.join(parts_scan)}", flush=True)
    log_file_write(model, f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [{model}] 扫描: {' + '.join(parts_scan)}")

    req_t0 = time.monotonic()
    base_time = datetime.now()
    vlm_seq = 0

    # 并发调用 VLM（仅最新消息的图片）
    vlm_descriptions = {}
    vlm_fail_count = 0
    if latest_images:
        async with aiohttp.ClientSession() as vlm_session:
            tasks = []
            for _, _, img_block, _, _, _, global_num in latest_images:
                source = img_block.get("source", {})
                tasks.append(call_vlm(
                    vlm_session,
                    source.get("data", ""),
                    source.get("media_type", "image/png"),
                    user_text,
                    global_num,
                ))
            results = await asyncio.gather(*tasks)

        for idx, (_, _, img_block, path, _, _, global_num) in enumerate(latest_images):
            desc, elapsed, is_error = results[idx]
            source = img_block.get("source", {})
            img_size_kb = len(source.get("data", "")) * 3 // 4 // 1024
            vlm_seq += 1
            img_id = generate_vlm_id(base_time, vlm_seq)
            log_vlm_terminal(model, VLM_PROVIDER, img_id, path, img_size_kb, elapsed, is_error)
            log_vlm_file(model, VLM_PROVIDER, img_id, path, img_size_kb, elapsed, desc, is_error)
            if not is_error:
                write_vlm_md(model, VLM_PROVIDER, img_id, path, img_size_kb, elapsed, desc)
            else:
                vlm_fail_count += 1
                notify("VLM 调用失败", f"[{model}] {img_id}: {desc[:80]}")
                desc = f"[VLM调用失败] {desc}"
            path_line = f"\n原图路径：{path}" if path else ""
            desc_text = f"[VLM图片理解 #{global_num}]\n{desc}{path_line}\n[/VLM图片理解 #{global_num}]"
            vlm_descriptions[id(img_block)] = desc_text

    # 替换最新消息中的图片
    if latest_images:
        msg_content = messages[last_user_idx]["content"]
        replacements = {}
        nested_replacements = {}
        path_remove = set()
        for _, orig_idx, img_block, path, path_bi, is_nested, _ in latest_images:
            desc_text = vlm_descriptions[id(img_block)]
            if is_nested:
                for ci, block in enumerate(msg_content):
                    if (isinstance(block, dict) and block.get("type") == "tool_result"
                            and isinstance(block.get("content"), list)
                            and orig_idx < len(block["content"])
                            and block["content"][orig_idx] is img_block):
                        nested_replacements.setdefault(ci, {})[orig_idx] = {"type": "text", "text": desc_text}
                        break
            else:
                replacements[orig_idx] = {"type": "text", "text": desc_text}
                if path_bi is not None:
                    path_remove.add(path_bi)
        messages[last_user_idx]["content"] = replace_content_blocks(
            msg_content, replacements, nested_replacements or None, path_remove)

        # 追加 fallback 提示到消息末尾
        fallback_note = (
            "\n\n（注：以上图片内容为代理前置 VLM 理解结果，CLI 工具实际不存储，后续会被清理。"
            "如需保留，请自行完整复述需要的内容。"
            "若理解不够清晰，请使用 MCP/Skill 工具读取对应原图路径重新分析）"
        )
        content = messages[last_user_idx]["content"]
        if isinstance(content, list) and content:
            last_block = content[-1]
            if isinstance(last_block, dict) and last_block.get("type") == "text":
                last_block["text"] = last_block.get("text", "") + fallback_note
            else:
                content.append({"type": "text", "text": fallback_note.strip()})

    # 替换历史消息中的图片（仅标记，不调 VLM）
    if STRIP_HISTORY_IMAGES and history_images:
        # 按 msg_idx 分组
        by_msg = {}
        for mi, orig_idx, img_block, path, path_bi, is_nested, global_num in history_images:
            by_msg.setdefault(mi, []).append((orig_idx, path, path_bi, is_nested, global_num))

        for mi, items in by_msg.items():
            msg_content = messages[mi]["content"]
            replacements = {}
            nested_replacements = {}
            for orig_idx, path, _, is_nested, global_num in items:
                path_line = f"\n原图路径：{path}" if path else ""
                repl_block = {
                    "type": "text",
                    "text": f"[历史图片 #{global_num} 已跳过]{path_line}\n如需理解此图片，请使用 MCP/Skill 工具读取原图路径重新分析\n[/历史图片 #{global_num} 已跳过]",
                }
                if is_nested:
                    for ci, block in enumerate(msg_content):
                        if (isinstance(block, dict) and block.get("type") == "tool_result"
                                and isinstance(block.get("content"), list)
                                and orig_idx < len(block["content"])
                                and block["content"][orig_idx] is img_block):
                            nested_replacements.setdefault(ci, {})[orig_idx] = repl_block
                            break
                else:
                    replacements[orig_idx] = repl_block
            messages[mi]["content"] = replace_content_blocks(msg_content, replacements, nested_replacements or None)

    # 处理完成日志
    total_elapsed = time.monotonic() - req_t0
    vlm_ok = len(latest_images) - vlm_fail_count
    parts = []
    if vlm_ok:
        parts.append(f"{vlm_ok}张VLM成功")
    if vlm_fail_count:
        parts.append(f"{vlm_fail_count}张VLM失败")
    if STRIP_HISTORY_IMAGES and history_images:
        parts.append(f"{len(history_images)}张历史标记")
    ts_now = datetime.now().strftime("%H:%M:%S")
    ts_log = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts_now}] [{model}] 处理完成: {', '.join(parts)}, 总耗时 {total_elapsed:.1f}s", flush=True)
    log_file_write(model, f"[{ts_log}] [{model}] 处理完成: {', '.join(parts)}, 总耗时 {total_elapsed:.1f}s")

    # 重新序列化并转发
    new_body = json.dumps(body, ensure_ascii=False).encode("utf-8")
    return await forward_request(request, new_body)


# ============================================================
# 透明转发
# ============================================================

async def forward_request(request, body=None):
    """透明转发请求到上游"""
    ctx = request.app["proxy_ctx"]
    session = ctx["session"]
    upstream_url = ctx["upstream_url"]

    # 构建上游 URL
    target = upstream_url + request.path_qs

    # 处理 headers
    headers = dict(request.headers)
    headers.pop("Host", None)

    # 剥离 Content-Encoding（aiohttp 自动解压了请求体）
    ce = headers.pop("Content-Encoding", "").lower()
    if ce in ("zstd", "gzip", "deflate", "br"):
        headers.pop("Content-Length", None)

    # 不请求压缩响应（简化 SSE 处理）
    headers["Accept-Encoding"] = "identity"

    # 过滤 hop-by-hop headers
    headers = filter_headers(headers)

    if body is None:
        body = await request.read()

    # 发送到上游
    try:
        async with session.request(
            request.method,
            target,
            headers=headers,
            data=body,
        ) as upstream_resp:
            # 判断是否流式
            is_stream = False
            if body and isinstance(body, (bytes, bytearray)):
                try:
                    req_json = json.loads(body)
                    is_stream = req_json.get("stream", False)
                except (json.JSONDecodeError, ValueError):
                    pass

            if is_stream and upstream_resp.status == 200:
                return await handle_streaming(request, upstream_resp)
            else:
                return await handle_non_streaming(upstream_resp)

    except Exception as e:
        return web.Response(status=502, text=f"Upstream error: {e}")


async def handle_streaming(request, upstream_resp):
    """SSE 流式转发"""
    resp = web.StreamResponse(
        status=upstream_resp.status,
        headers=filter_headers(dict(upstream_resp.headers)),
    )
    resp.content_type = "text/event-stream"
    await resp.prepare(request)

    async for chunk in upstream_resp.content.iter_any():
        if chunk:
            await resp.write(chunk)

    await resp.write_eof()
    return resp


async def handle_non_streaming(upstream_resp):
    """非流式响应转发"""
    body = await upstream_resp.read()
    headers = filter_headers(dict(upstream_resp.headers))
    return web.Response(
        status=upstream_resp.status,
        headers=headers,
        body=body,
    )


# ============================================================
# 启动
# ============================================================

def parse_args():
    import argparse
    parser = argparse.ArgumentParser(description="VLM Image Replacing Proxy")
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--upstream", default=UPSTREAM_URL)
    parser.add_argument("--vlm-provider", default=VLM_PROVIDER,
                        choices=["minimax", "mimo"],
                        help="VLM 线路: minimax 或 mimo")
    parser.add_argument("--vlm-url", default=None,
                        help="自定义 VLM API 地址（覆盖线路默认值）")
    parser.add_argument("--vlm-key", default=None,
                        help="自定义 VLM API Key（覆盖线路默认值）")
    parser.add_argument("--no-strip-history", action="store_true",
                        help="不处理历史消息中的图片")
    parser.add_argument("--blacklist", default=None,
                        help="替换黑名单模型（逗号分隔），优先级高于代码定义")
    parser.add_argument("--whitelist", default=None,
                        help="替换白名单模型（逗号分隔），优先级高于代码定义")
    parser.add_argument("--add-blacklist", default="",
                        help="追加黑名单模型（逗号分隔）")
    parser.add_argument("--add-whitelist", default="",
                        help="追加白名单模型（逗号分隔）")
    return parser.parse_args()


async def on_startup(app):
    ctx = app["proxy_ctx"]
    ctx["session"] = aiohttp.ClientSession(
        trust_env=True,
        timeout=aiohttp.ClientTimeout(total=600, sock_read=300),
    )


async def on_cleanup(app):
    session = app["proxy_ctx"].get("session")
    if session:
        await session.close()


def main():
    global VLM_PROVIDER, MINIMAX_VLM_URL, MINIMAX_VLM_KEY
    global MIMO_VLM_URL, MIMO_VLM_KEY, STRIP_HISTORY_IMAGES
    global BLACKLIST_MODELS, WHITELIST_MODELS

    args = parse_args()

    # 设置 VLM 线路
    VLM_PROVIDER = args.vlm_provider
    if VLM_PROVIDER == "mimo":
        if args.vlm_url:
            MIMO_VLM_URL = args.vlm_url
        if args.vlm_key:
            MIMO_VLM_KEY = args.vlm_key
    else:
        if args.vlm_url:
            MINIMAX_VLM_URL = args.vlm_url
        if args.vlm_key:
            MINIMAX_VLM_KEY = args.vlm_key

    if args.no_strip_history:
        STRIP_HISTORY_IMAGES = False

    # --blacklist 替换整个列表，--add-blacklist 追加
    if args.blacklist is not None:
        BLACKLIST_MODELS = [m.strip() for m in args.blacklist.split(",") if m.strip()]
    if args.add_blacklist:
        BLACKLIST_MODELS.extend(m.strip() for m in args.add_blacklist.split(",") if m.strip())

    if args.whitelist is not None:
        WHITELIST_MODELS = [m.strip() for m in args.whitelist.split(",") if m.strip()]
    if args.add_whitelist:
        WHITELIST_MODELS.extend(m.strip() for m in args.add_whitelist.split(",") if m.strip())

    print(f"上游地址: {args.upstream}", flush=True)
    print(f"VLM 线路: {VLM_PROVIDER}", flush=True)
    vlm_url = MIMO_VLM_URL if VLM_PROVIDER == "mimo" else MINIMAX_VLM_URL
    print(f"VLM 地址: {vlm_url}", flush=True)
    print(f"黑名单: {BLACKLIST_MODELS}", flush=True)
    print(f"白名单: {WHITELIST_MODELS}", flush=True)
    print(f"处理历史图片: {STRIP_HISTORY_IMAGES}", flush=True)

    app = web.Application(client_max_size=0)
    app["proxy_ctx"] = {"upstream_url": args.upstream.rstrip("/")}

    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)
    app.router.add_route("*", "/{path_info:.*}", proxy_handler)

    runner = web.AppRunner(app)
    loop = asyncio.new_event_loop()
    loop.run_until_complete(runner.setup())
    site = web.TCPSite(runner, "127.0.0.1", args.port)
    loop.run_until_complete(site.start())

    print(f"代理已启动: http://127.0.0.1:{args.port}", flush=True)
    print(f"使用方式: .claude/settings.json配置 \"ANTHROPIC_BASE_URL\": \"http://127.0.0.1:{args.port}\" ", flush=True)

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        print("\n正在关闭...", flush=True)
    finally:
        loop.run_until_complete(runner.cleanup())
        loop.close()


if __name__ == "__main__":
    main()
