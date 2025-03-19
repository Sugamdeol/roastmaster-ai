
/**
 * Service for handling audio streaming and playback
 */
export class PCM16AudioManager {
  private audioContext: AudioContext;
  private playbackTimeOffset: number;
  private sampleRate: number = 24000;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private audioChunks: Uint8Array[] = [];
  private onPlayingChange?: (isPlaying: boolean) => void;

  constructor(onPlayingChange?: (isPlaying: boolean) => void) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.playbackTimeOffset = this.audioContext.currentTime;
    this.onPlayingChange = onPlayingChange;
  }

  public reset(): void {
    this.audioChunks = [];
    this.playbackTimeOffset = this.audioContext.currentTime;
    this.isPlaying = false;
    this.isPaused = false;
    if (this.onPlayingChange) {
      this.onPlayingChange(false);
    }
  }

  public addChunk(pcmData: Int16Array): void {
    // Convert Int16Array to Uint8Array for storage
    const uint8Data = new Uint8Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
    this.audioChunks.push(uint8Data);
    
    if (this.isPlaying && !this.isPaused) {
      this.playChunk(pcmData);
    }
  }

  public startPlayback(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.isPaused = false;
      this.playbackTimeOffset = this.audioContext.currentTime;
      
      // Play all accumulated chunks
      for (const chunk of this.audioChunks) {
        // Convert stored Uint8Array back to Int16Array for playback
        const int16Data = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.byteLength / 2);
        this.playChunk(int16Data);
      }
      
      if (this.onPlayingChange) {
        this.onPlayingChange(true);
      }
    } else if (this.isPaused) {
      this.isPaused = false;
      this.playbackTimeOffset = this.audioContext.currentTime;
      
      if (this.onPlayingChange) {
        this.onPlayingChange(true);
      }
    }
  }

  public pausePlayback(): void {
    if (this.isPlaying && !this.isPaused) {
      this.isPaused = true;
      
      if (this.onPlayingChange) {
        this.onPlayingChange(false);
      }
    }
  }

  public togglePlayback(): void {
    if (!this.isPlaying || this.isPaused) {
      this.startPlayback();
    } else {
      this.pausePlayback();
    }
  }

  public setMuted(muted: boolean): void {
    if (this.audioContext.destination) {
      (this.audioContext.destination as any).muted = muted;
    }
  }

  private playChunk(pcmData: Int16Array): void {
    if (this.isPaused) return;
    
    const numSamples = pcmData.length;
    const floatData = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      floatData[i] = pcmData[i] / 32768; // Normalize to [-1, 1]
    }
    
    const audioBuffer = this.audioContext.createBuffer(1, numSamples, this.sampleRate);
    audioBuffer.copyToChannel(floatData, 0);
    
    const now = this.audioContext.currentTime;
    if (this.playbackTimeOffset < now) {
      this.playbackTimeOffset = now;
    }
    
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start(this.playbackTimeOffset);
    this.playbackTimeOffset += audioBuffer.duration;
  }
}
