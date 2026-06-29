/**
 * MIMO ASR 语音识别模块
 *
 * 使用浏览器 MediaRecorder 录音，调用后端 /api/asr 接口进行语音识别
 * 不依赖 Google 服务，国内可用
 */

/**
 * 启动 MIMO ASR 语音识别
 * @param {Object} options
 * @param {Function} options.onResult - 识别结果回调 (text: string) => void
 * @param {Function} options.onError - 错误回调 (msg: string) => void
 * @param {string} options.language - 语言代码，默认 "auto"
 * @param {number} options.maxDuration - 最大录音时长（秒），默认 60
 * @returns {{ start: () => Promise<void>, stop: () => void }}
 */
export function startMimoAsr({
  onResult,
  onError,
  language = "auto",
  maxDuration = 60,
} = {}) {
  let mediaStream = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let stopTimeout = null;
  let stopped = false;

  /**
   * 释放麦克风流
   */
  function releaseStream() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
  }

  /**
   * Blob 转 Base64
   */
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        // 取逗号后的部分
        const base64 = dataUrl.split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("音频数据转换失败"));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * WebM Blob 转 WAV Base64
   * 使用 Web Audio API 解码后重新编码为 WAV
   */
  async function convertToWav(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // 转换为 WAV
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    let interleaved;
    if (numChannels === 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      interleaved = new Float32Array(left.length + right.length);
      for (let i = 0; i < left.length; i++) {
        interleaved[i * 2] = left[i];
        interleaved[i * 2 + 1] = right[i];
      }
    } else {
      interleaved = audioBuffer.getChannelData(0);
    }

    const dataLength = interleaved.length * (bitDepth / 8);
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // WAV header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    // 写入音频数据
    const offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
      const sample = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }

    audioContext.close();

    // 转 Base64
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
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
      body: JSON.stringify({
        audioBase64,
        mimeType,
        language,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "语音识别请求失败");
    }

    return data.text || "";
  }

  /**
   * 停止录音
   */
  function stop() {
    if (stopped) return;
    stopped = true;

    if (stopTimeout) {
      clearTimeout(stopTimeout);
      stopTimeout = null;
    }

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    releaseStream();
  }

  /**
   * 开始录音
   */
  async function start() {
    stopped = false;
    audioChunks = [];

    // 检查浏览器支持
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      onError?.("当前浏览器不支持录音功能");
      return;
    }

    // MediaRecorder 使用浏览器支持的格式（webm），后续会转换为 wav
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : null;

    if (!mimeType) {
      onError?.("当前浏览器不支持录音功能");
      return;
    }

    try {
      // 获取麦克风
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        onError?.("麦克风权限被拒绝，请在浏览器设置中允许");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        onError?.("未找到麦克风设备");
      } else {
        onError?.(`无法访问麦克风: ${err.message}`);
      }
      return;
    }

    try {
      // 创建 MediaRecorder
      mediaRecorder = new MediaRecorder(mediaStream, { mimeType });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        releaseStream();

        if (stopTimeout) {
          clearTimeout(stopTimeout);
          stopTimeout = null;
        }

        // 合并音频数据
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        audioChunks = [];

        // 检查是否有数据
        if (audioBlob.size === 0) {
          onError?.("未检测到语音，请靠近麦克风说话");
          return;
        }

        try {
          // 转换为 WAV 格式（MIMO ASR 支持的格式）
          const base64 = await convertToWav(audioBlob);

          // 调用 ASR API（使用 wav 格式）
          const text = await callAsrApi(base64, "audio/wav");

          if (text) {
            onResult?.(text);
          } else {
            onError?.("未识别到语音内容，请重试");
          }
        } catch (err) {
          onError?.(err.message || "语音识别失败");
        }
      };

      mediaRecorder.onerror = (e) => {
        releaseStream();
        onError?.(`录音错误: ${e.error?.message || "未知错误"}`);
      };

      // 开始录音
      mediaRecorder.start(1000); // 每秒收集一次数据

      // 设置最大录音时长
      stopTimeout = setTimeout(() => {
        stop();
      }, maxDuration * 1000);

    } catch (err) {
      releaseStream();
      onError?.(`启动录音失败: ${err.message}`);
    }
  }

  return { start, stop };
}
