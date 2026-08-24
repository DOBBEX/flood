// lib/buzzerAudio.ts — Web Audio API 2,200 Hz Piezo Buzzer Synthesizer
// Mirrors Arduino Pin 3 tone(PIN_BUZZ, 2200) with automatic pause during GSM transmission

class BuzzerSoundController {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isMuted: boolean = true; // Default muted to respect browser autoplay policies
  private isBeeping: boolean = false;
  private isGsmTransmitting: boolean = false;
  private pulseInterval: NodeJS.Timeout | null = null;

  public init() {
    if (typeof window === 'undefined') return;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setGsmActive(active: boolean) {
    this.isGsmTransmitting = active;
    // PDF Rule: "Pause SOS tone during GSM communication to protect SoftwareSerial timing"
    if (active && this.gainNode) {
      this.gainNode.gain.setValueAtTime(0, this.audioCtx ? this.audioCtx.currentTime : 0);
    }
  }

  public startSosPulse(freq: number = 2200) {
    if (typeof window === 'undefined' || this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.isBeeping) return;
    this.isBeeping = true;

    // Fast 200ms pulsed tone for SOS
    let onPhase = true;
    this.pulseInterval = setInterval(() => {
      if (this.isMuted || this.isGsmTransmitting || !this.audioCtx) {
        if (this.gainNode) {
          this.gainNode.gain.setValueAtTime(0, this.audioCtx?.currentTime || 0);
        }
        return;
      }

      if (onPhase) {
        this.playTone(freq, 0.15);
      } else {
        this.stopTone();
      }
      onPhase = !onPhase;
    }, 200);
  }

  private playTone(freq: number, volume: number = 0.1) {
    if (!this.audioCtx || this.isMuted || this.isGsmTransmitting) return;

    try {
      if (!this.oscillator) {
        this.oscillator = this.audioCtx.createOscillator();
        this.gainNode = this.audioCtx.createGain();

        this.oscillator.type = 'sine'; // Clean piezo square/sine tone
        this.oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
        this.oscillator.start();
      }

      if (this.gainNode) {
        this.gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      }
    } catch {
      // Ignore audio synthesis errors on locked browsers
    }
  }

  private stopTone() {
    if (this.gainNode && this.audioCtx) {
      try {
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      } catch {
        // Safe fail
      }
    }
  }

  public stop() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
    this.stopTone();
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {
        // Safe fail
      }
      this.oscillator = null;
    }
    this.isBeeping = false;
  }
}

export const buzzerAudio = new BuzzerSoundController();
