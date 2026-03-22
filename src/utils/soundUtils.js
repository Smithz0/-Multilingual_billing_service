/**
 * Sound utility functions using Web Audio API.
 * Provides audio feedback for voice capture, barcode scan, and item addition.
 * No external audio files needed — generates tones programmatically.
 */

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a beep tone at the specified frequency and duration.
 */
export function playBeep(frequency = 800, duration = 150, volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = volume;

    // Fade out to avoid click
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
}

/** Success tone — two ascending beeps */
export function playSuccess() {
  playBeep(600, 100, 0.2);
  setTimeout(() => playBeep(900, 150, 0.2), 120);
}

/** Scan detected tone — quick high beep */
export function playScan() {
  playBeep(1200, 100, 0.25);
}

/** Error tone — low descending beep */
export function playError() {
  playBeep(400, 200, 0.2);
  setTimeout(() => playBeep(300, 250, 0.2), 220);
}

/** Item added tone — pleasant chime */
export function playItemAdded() {
  playBeep(523, 80, 0.15);  // C5
  setTimeout(() => playBeep(659, 80, 0.15), 100);  // E5
  setTimeout(() => playBeep(784, 120, 0.15), 200);  // G5
}
