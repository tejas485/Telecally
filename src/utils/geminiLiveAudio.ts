/**
 * Gemini Live API Bidirectional Audio Client
 * 
 * Establishes a real-time full-duplex audio stream via WebSocket to the server:
 * - Captures candidate microphone audio at 16kHz raw PCM little-endian.
 * - Streams audio chunks in real-time to Google's gemini-3.8-live model on backend.
 * - Receives model's 24kHz raw PCM little-endian audio response chunks.
 * - Schedules gapless audio playback with sub-second latency.
 * - Supports instant barge-in/interruption handling when user speaks.
 */

export interface GeminiLiveCallbacks {
  onStatusChange?: (status: 'idle' | 'connecting' | 'connected_live' | 'fallback_mode' | 'error') => void;
  onMicLevel?: (level: number) => void;
  onAiSpeakingChange?: (isSpeaking: boolean) => void;
  onInterrupted?: () => void;
  onAiText?: (text: string) => void;
  onError?: (error: string) => void;
  onLog?: (msg: string) => void;
}

export class GeminiLiveVoiceClient {
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private callbacks: GeminiLiveCallbacks;
  
  // Playback scheduling for gapless 24kHz audio
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isConnected = false;
  private isLiveModelActive = false;
  private isSpeaking = false;

  constructor(callbacks: GeminiLiveCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public async startSession(options: {
    candidateName?: string;
    company?: string;
    role?: string;
  }): Promise<boolean> {
    try {
      this.callbacks.onStatusChange?.('connecting');
      this.callbacks.onLog?.('Initiating WebSocket bridge to /api/live-voice...');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-voice`;
      
      this.ws = new WebSocket(wsUrl);

      return new Promise((resolve) => {
        if (!this.ws) return resolve(false);

        this.ws.onopen = () => {
          this.callbacks.onLog?.('WebSocket connected to backend. Requesting Gemini 3.8 Live session...');
          this.isConnected = true;
          this.ws?.send(JSON.stringify({
            type: 'start',
            candidateName: options.candidateName || 'Tejas Mali',
            company: options.company || 'TelcoVibe',
            role: options.role || 'Full Stack Developer (VoIP & Messaging Platforms)'
          }));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data, resolve);
          } catch (err) {
            console.error('[GeminiLiveClient] JSON parse error:', err);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('[GeminiLiveClient] WebSocket error:', err);
          this.callbacks.onLog?.('WebSocket error connecting to Live voice bridge.');
          this.callbacks.onStatusChange?.('fallback_mode');
          resolve(false);
        };

        this.ws.onclose = () => {
          this.callbacks.onLog?.('WebSocket connection closed.');
          this.cleanup();
          this.callbacks.onStatusChange?.('idle');
        };

        // Safety timeout: if server doesn't respond in 4s, fallback
        setTimeout(() => {
          if (!this.isLiveModelActive) {
            resolve(false);
          }
        }, 4000);
      });
    } catch (err: any) {
      console.error('[GeminiLiveClient] Start error:', err);
      this.callbacks.onError?.(err?.message || 'Failed to start Live Voice session');
      this.callbacks.onStatusChange?.('fallback_mode');
      return false;
    }
  }

  private handleServerMessage(data: any, resolveSessionPromise?: (success: boolean) => void) {
    switch (data.type) {
      case 'live_session_started':
        this.isLiveModelActive = true;
        this.callbacks.onStatusChange?.('connected_live');
        this.callbacks.onLog?.(`Gemini Live connected! Model: ${data.model}, Voice: ${data.voice}`);
        this.startMicrophoneCapture();
        if (resolveSessionPromise) resolveSessionPromise(true);
        break;

      case 'fallback_mode':
        this.isLiveModelActive = false;
        this.callbacks.onStatusChange?.('fallback_mode');
        this.callbacks.onLog?.(`Server note: ${data.message || 'Operating in optimized edge mode'}`);
        if (resolveSessionPromise) resolveSessionPromise(false);
        break;

      case 'audio':
        if (data.audio) {
          this.playAudioChunk(data.audio);
        }
        break;

      case 'text':
        if (data.text) {
          this.callbacks.onAiText?.(data.text);
        }
        break;

      case 'interrupted':
        this.callbacks.onLog?.('⚡ Barge-in: Candidate voice interrupted AI. Pausing playback.');
        this.stopAudioPlayback();
        this.callbacks.onInterrupted?.();
        break;

      case 'session_closed':
        this.callbacks.onLog?.('Gemini Live session concluded.');
        this.stopAudioPlayback();
        break;

      case 'error':
        this.callbacks.onError?.(data.message || 'Error from Gemini Live backend');
        break;
    }
  }

  /**
   * Initializes 16kHz microphone capture and streams raw PCM to server
   */
  public async startMicrophoneCapture() {
    try {
      if (this.micStream) return;

      this.callbacks.onLog?.('Activating 16kHz microphone stream for continuous active listening...');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      this.micStream = stream;

      // Input AudioContext at 16000Hz (per Gemini Live requirements)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioCtx({ sampleRate: 16000 });
      if (this.inputAudioCtx.state === 'suspended') {
        await this.inputAudioCtx.resume();
      }

      this.micSource = this.inputAudioCtx.createMediaStreamSource(stream);
      // ScriptProcessor with 4096 buffer size (~256ms chunk at 16kHz)
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);
        
        // Compute volume level for VU meter
        let sum = 0;
        let peak = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          const val = Math.abs(inputChannelData[i]);
          sum += val;
          if (val > peak) peak = val;
        }
        const avg = sum / inputChannelData.length;
        const level = Math.min(100, Math.round(((avg * 0.4 + peak * 0.6) / 0.4) * 100));
        this.callbacks.onMicLevel?.(level);

        // Convert Float32Array to 16-bit PCM Little Endian
        const pcmBuffer = this.floatTo16BitPCM(inputChannelData);
        const base64Audio = this.arrayBufferToBase64(pcmBuffer);

        // Stream raw PCM chunk to Gemini Live over WebSocket
        this.ws.send(JSON.stringify({
          type: 'audio',
          audio: base64Audio
        }));
      };

      this.micSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioCtx.destination);

    } catch (err: any) {
      console.error('[GeminiLiveClient] Failed to acquire microphone for Live stream:', err);
      this.callbacks.onError?.('Microphone access denied or unavailable.');
    }
  }

  /**
   * Decodes 24kHz raw PCM little-endian audio returned by Gemini Live
   * and schedules gapless, jitter-free playback
   */
  private playAudioChunk(base64Data: string) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.outputAudioCtx) {
        this.outputAudioCtx = new AudioCtx({ sampleRate: 24000 });
      }
      if (this.outputAudioCtx.state === 'suspended') {
        this.outputAudioCtx.resume();
      }

      const audioBuffer = this.pcm24kToAudioBuffer(base64Data, this.outputAudioCtx);
      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioCtx.destination);

      const currentTime = this.outputAudioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.activeSources.push(source);

      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.callbacks.onAiSpeakingChange?.(true);
      }

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) this.activeSources.splice(idx, 1);
        if (this.activeSources.length === 0) {
          this.isSpeaking = false;
          this.callbacks.onAiSpeakingChange?.(false);
        }
      };

    } catch (err) {
      console.warn('[GeminiLiveClient] Audio playback error:', err);
    }
  }

  /**
   * Stop active audio playback immediately (e.g. when user interrupts)
   */
  public stopAudioPlayback() {
    this.activeSources.forEach((source) => {
      try { source.stop(); } catch {}
    });
    this.activeSources = [];
    this.nextStartTime = 0;
    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.callbacks.onAiSpeakingChange?.(false);
    }
  }

  /**
   * Sends text input over the live channel
   */
  public sendText(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'text',
        text
      }));
    }
  }

  /**
   * Cleanup all resources and close stream
   */
  public cleanup() {
    this.stopAudioPlayback();

    if (this.scriptProcessor) {
      try { this.scriptProcessor.disconnect(); } catch {}
      this.scriptProcessor = null;
    }
    if (this.micSource) {
      try { this.micSource.disconnect(); } catch {}
      this.micSource = null;
    }
    if (this.micStream) {
      try { this.micStream.getTracks().forEach(t => t.stop()); } catch {}
      this.micStream = null;
    }
    if (this.inputAudioCtx) {
      try { this.inputAudioCtx.close(); } catch {}
      this.inputAudioCtx = null;
    }
    if (this.outputAudioCtx) {
      try { this.outputAudioCtx.close(); } catch {}
      this.outputAudioCtx = null;
    }
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'end' }));
        }
        this.ws.close();
      } catch {}
      this.ws = null;
    }

    this.isConnected = false;
    this.isLiveModelActive = false;
    this.nextStartTime = 0;
  }

  // --- Audio Helpers ---

  private floatTo16BitPCM(input: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private pcm24kToAudioBuffer(base64: string, ctx: AudioContext): AudioBuffer {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const dataView = new DataView(bytes.buffer);
    const sampleCount = Math.floor(len / 2);
    const audioBuffer = ctx.createBuffer(1, sampleCount, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      channelData[i] = int16 / 32768.0;
    }
    return audioBuffer;
  }
}
