/**
 * NEON PONG - Audio Engine (Web Audio API Synthesizer)
 * Zero external audio files required. All sound effects are procedurally generated in real time.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.volume = 0.75;
        this.isMuted = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported or blocked:', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.masterGain && this.ctx && !this.isMuted) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // Paddle Hit SFX: Frequency pitches up with higher rallies/speeds
    playPaddleHit(rallyCount = 0, isHyper = false) {
        if (!this.initialized || this.isMuted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseFreq = isHyper ? 620 : 380;
        const pitchIncrease = Math.min(rallyCount * 25, 450);
        const startFreq = baseFreq + pitchIncrease;

        osc.type = isHyper ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Wall Bounce SFX: Low punchy blip
    playWallHit() {
        if (!this.initialized || this.isMuted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.07);
    }

    // Goal Scored SFX: Deep bass impact + high chime
    playScore(isP1 = true) {
        if (!this.initialized || this.isMuted) return;
        this.resume();

        // 1. Sub bass boom
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(140, this.ctx.currentTime);
        subOsc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.45);

        subGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

        subOsc.connect(subGain);
        subGain.connect(this.masterGain);
        subOsc.start();
        subOsc.stop(this.ctx.currentTime + 0.5);

        // 2. Chime
        const notes = isP1 ? [523.25, 659.25, 783.99] : [440, 554.37, 659.25];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);

            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.25, this.ctx.currentTime + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(this.ctx.currentTime + i * 0.08);
            osc.stop(this.ctx.currentTime + i * 0.08 + 0.25);
        });
    }

    // Power-up Spawn: Mysterious shimmer
    playPowerupSpawn() {
        if (!this.initialized || this.isMuted) return;
        this.resume();

        const chords = [587.33, 739.99, 880.00, 1174.66];
        chords.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

            gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(this.ctx.currentTime + idx * 0.05);
            osc.stop(this.ctx.currentTime + idx * 0.05 + 0.25);
        });
    }

    // Power-up Collection: Energetic power surge
    playPowerupCollect() {
        if (!this.initialized || this.isMuted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    // Victory Fanfare
    playWin() {
        if (!this.initialized || this.isMuted) return;
        this.resume();

        const fanfare = [
            { freq: 523.25, time: 0.0, dur: 0.15 },
            { freq: 659.25, time: 0.15, dur: 0.15 },
            { freq: 783.99, time: 0.3, dur: 0.15 },
            { freq: 1046.50, time: 0.45, dur: 0.5 }
        ];

        fanfare.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq, this.ctx.currentTime + note.time);

            gain.gain.setValueAtTime(0.3, this.ctx.currentTime + note.time);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + note.time + note.dur);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(this.ctx.currentTime + note.time);
            osc.stop(this.ctx.currentTime + note.time + note.dur);
        });
    }

    // Defeat Fanfare
    playDefeat() {
        if (!this.initialized || this.isMuted) return;
        this.resume();

        const sadNotes = [
            { freq: 440.00, time: 0.0, dur: 0.2 },
            { freq: 415.30, time: 0.2, dur: 0.2 },
            { freq: 392.00, time: 0.4, dur: 0.2 },
            { freq: 349.23, time: 0.6, dur: 0.5 }
        ];

        sadNotes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(note.freq, this.ctx.currentTime + note.time);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime + note.time);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + note.time + note.dur);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(this.ctx.currentTime + note.time);
            osc.stop(this.ctx.currentTime + note.time + note.dur);
        });
    }

    // Countdown Blip
    playCountdown(isFinal = false) {
        if (!this.initialized || this.isMuted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const freq = isFinal ? 880 : 440;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (isFinal ? 0.3 : 0.12));

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + (isFinal ? 0.3 : 0.12));
    }
}

window.soundEngine = new SoundEngine();
