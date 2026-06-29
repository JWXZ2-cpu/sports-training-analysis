/**
 * MIMO ASR 语音识别模块
 *
 * 三层降级策略：
 * 1. MediaRecorder（Chrome/Edge 完整支持）
 * 2. getUserMedia + AudioContext 手动录音（微信/国产浏览器）
 * 3. 文件上传录音（兜底，所有浏览器）
 */

/**
 * 检测浏览器录音能力
 */
export function detectRecordingSupport() {
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const hasMediaRecorder = typeof MediaRecorder !== "undefined";
  const hasAudioContext = !!(window.AudioContext || window.webkitAudioContext);

  if (hasMediaRecorder && hasGetUserMedia) return "mediarecorder";
  if (hasGetUserMedia && hasAudioContext) return "audiocontext";
  if (hasGetUserMedia) return "getUserMedia-only";
  return "none";
}

/**
 * 启动语音识别
 * @param {Object} options
 * @param {Function} options.onResult - 识别结果回调 (text: string) => void
 * @param {Function} options.onError - 错误回调 (msg: string) => void
 * @param {Function} options.onStatus - 状态回调 (status: string) => void
 * @param {string} options.language - 语言代码，默认 "zh"
 * @param {number} options.maxDuration - 最大录音时长（秒），默认 60
 * @returns {{ start: () => Promise<void>, stop: () => void }}
 */
export function startMimoAsr({
  onResult,
  onError,
  onStatus,
  language = "zh",
  maxDuration = 60,
} = {}) {
  let mediaStream = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let stopTimeout = null;
  let stopped = false;

  // AudioContext 手动录音相关
  let audioContext = null;
  let scriptProcessor = null;
  let audioBuffers = [];
  let recordingSampleRate = null;

  function releaseStream() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
    if (scriptProcessor) {
      scriptProcessor.disconnect();
      scriptProcessor = null;
    }
    if (audioContext && audioContext.state !== "closed") {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
  }

  /**
   * 将 Float32Array 音频缓冲区转为 WAV Base64
   */
  function buffersToWavBase64(buffers, sampleRate) {
    // 合并所有缓冲区
    let totalLength = 0;
    for (const buf of buffers) totalLength += buf.length;
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      merged.set(buf, offset);
      offset += buf.length;
    }

    // 转 16-bit PCM
    const numChannels = 1;
    const bitDepth = 16;
    const dataLength = merged.length * (bitDepth / 8);
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // WAV header
    const writeStr = (off, str) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeStr(36, "data");
    view.setUint32(40, dataLength, true);

    for (let i = 0; i < merged.length; i++) {
      const s = Math.max(-1, Math.min(1, merged[i]));
      view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    // 转 Base64
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  /**
   * 调用后端 ASR 接口
   */
  async function callAsrApi(audioBase64, mimeType) {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/asr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ audioBase64, mimeType, language }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "语音识别请求失败");
    return data.text || "";
  }

  /**
   * 处理录音结果（统一入口）
   */
  async function processAudio(audioBase64, mimeType) {
    if (!audioBase64 || audioBase64.length < 100) {
      onError?.("录音数据为空，请靠近麦克风重试");
      return;
    }
    onStatus?.("识别中...");
    try {
      const text = await callAsrApi(audioBase64, mimeType);
      if (text) {
        onResult?.(text);
      } else {
        onError?.("未识别到语音内容，请重试");
      }
    } catch (err) {
      onError?.(err.message || "语音识别失败");
    }
  }

  /**
   * 停止录音
   */
  function stop() {
    if (stopped) return;
    stopped = true;

    if (stopTimeout) { clearTimeout(stopTimeout); stopTimeout = null; }

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    // AudioContext 模式：手动停止
    if (audioContext && audioBuffers.length > 0) {
      const base64 = buffersToWavBase64(audioBuffers, recordingSampleRate);
      audioBuffers = [];
      releaseStream();
      processAudio(base64, "audio/wav");
      return;
    }

    releaseStream();
  }

  /**
   * 方案 A：MediaRecorder 录音
   */
  async function startWithMediaRecorder() {
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      releaseStream();
      if (audioChunks.length === 0) { onError?.("未检测到语音"); return; }
      const blob = new Blob(audioChunks, { type: mimeType });
      audioChunks = [];
      if (blob.size === 0) { onError?.("未检测到语音"); return; }

      // WebM 转 WAV
      onStatus?.("处理音频...");
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);
        const base64 = buffersToWavBase64([channelData], audioBuffer.sampleRate);
        ctx.close();
        await processAudio(base64, "audio/wav");
      } catch (err) {
        onError?.("音频处理失败: " + err.message);
      }
    };

    mediaRecorder.onerror = (e) => {
      releaseStream();
      onError?.("录音错误: " + (e.error?.message || "未知"));
    };

    mediaRecorder.start(1000);
  }

  /**
   * 方案 B：AudioContext 手动录音（兼容微信等）
   */
  async function startWithAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    recordingSampleRate = audioContext.sampleRate;
    audioBuffers = [];

    const source = audioContext.createMediaStreamSource(mediaStream);
    // bufferSize 4096, 1 channel input, 1 channel output
    scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    scriptProcessor.onaudioprocess = (e) => {
      if (stopped) return;
      const inputData = e.inputBuffer.getChannelData(0);
      // 复制一份（inputBuffer 会被回收）
      audioBuffers.push(new Float32Array(inputData));
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
  }

  /**
   * 开始录音
   */
  async function start() {
    stopped = false;
    audioBuffers = [];
    audioChunks = [];

    // 检查 getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      onError?.("当前浏览器不支持录音，请使用 Chrome 或在微信中点击右上角用浏览器打开");
      return;
    }

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        onError?.("麦克风权限被拒绝，请在浏览器设置中允许");
      } else if (err.name === "NotFoundError") {
        onError?.("未找到麦克风设备");
      } else {
        onError?.("无法访问麦克风: " + err.message);
      }
      return;
    }

    const support = detectRecordingSupport();

    try {
      if (support === "mediarecorder") {
        await startWithMediaRecorder();
      } else {
        await startWithAudioContext();
      }

      // 最大录音时长
      stopTimeout = setTimeout(() => stop(), maxDuration * 1000);
    } catch (err) {
      releaseStream();
      onError?.("启动录音失败: " + err.message);
    }
  }

  return { start, stop };
}
