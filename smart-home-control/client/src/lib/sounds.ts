// Shared AudioContext for all sounds (avoid hitting browser's AudioContext limit)
let sharedAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume context if it's suspended (browsers require user interaction)
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
};

// Create padlock click sound using Web Audio API
export const playButtonClick = () => {
  try {
    const audioContext = getAudioContext();
    
    // Create noise for metallic click sound
    const bufferSize = audioContext.sampleRate * 0.05; // 50ms
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise for metallic sound
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    // Filter for metallic character
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2000; // Metallic frequency range
    bandpass.Q.value = 5;
    
    const gainNode = audioContext.createGain();
    
    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Sharp attack for "click", instant decay
    gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.04);
    
    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.05);
  } catch (error) {
    // Silently fail if audio context is not available
    console.error('Audio context error:', error);
  }
};

// Higher-pitched click sound (for On and Plus buttons)
export const playHighPitchClick = () => {
  try {
    const audioContext = getAudioContext();
    
    // Create noise for metallic click sound
    const bufferSize = audioContext.sampleRate * 0.05; // 50ms
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise for metallic sound
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    // Filter for higher-pitched metallic character
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 3200; // Higher pitch like unlock second click
    bandpass.Q.value = 5;
    
    const gainNode = audioContext.createGain();
    
    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Sharp attack for "click", instant decay
    gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.04);
    
    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.05);
  } catch (error) {
    // Silently fail if audio context is not available
    console.error('Audio context error:', error);
  }
};

// Double-click sound for unlock (two rapid clicks)
export const playUnlockClick = () => {
  try {
    const audioContext = getAudioContext();
    
    const bufferSize = audioContext.sampleRate * 0.05;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    // First click
    const noise1 = audioContext.createBufferSource();
    noise1.buffer = buffer;
    
    const bandpass1 = audioContext.createBiquadFilter();
    bandpass1.type = 'bandpass';
    bandpass1.frequency.value = 2000;
    bandpass1.Q.value = 5;
    
    const gainNode1 = audioContext.createGain();
    
    noise1.connect(bandpass1);
    bandpass1.connect(gainNode1);
    gainNode1.connect(audioContext.destination);
    
    gainNode1.gain.setValueAtTime(0.6, audioContext.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.04);
    
    noise1.start(audioContext.currentTime);
    noise1.stop(audioContext.currentTime + 0.05);
    
    // Second click (50ms later, higher pitch like iPad 1 unlock)
    const noise2 = audioContext.createBufferSource();
    noise2.buffer = buffer;
    
    const bandpass2 = audioContext.createBiquadFilter();
    bandpass2.type = 'bandpass';
    bandpass2.frequency.value = 3200; // Higher pitch for second click
    bandpass2.Q.value = 5;
    
    const gainNode2 = audioContext.createGain();
    
    noise2.connect(bandpass2);
    bandpass2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    gainNode2.gain.setValueAtTime(0.6, audioContext.currentTime + 0.05);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.09);
    
    noise2.start(audioContext.currentTime + 0.05);
    noise2.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error('Audio context error:', error);
  }
};

// Traditional Phone Ring (incoming call ringtone)
export function playIncomingRingtone() {
  const audioContext = getAudioContext();
  
  const createRingTone = (startTime: number) => {
    // Classic phone ring uses two tones: 440 Hz and 480 Hz
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc1.frequency.value = 440; // A4
    osc2.frequency.value = 480; // Slightly sharp
    osc1.type = "sine";
    osc2.type = "sine";
    
    // Ring pattern: 2 seconds on, 4 seconds off
    // Two rings with a brief pause between
    const ringDuration = 0.4;
    const pauseBetweenRings = 0.2;
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // First ring
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.15, startTime + ringDuration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + ringDuration);
    
    osc1.start(startTime);
    osc1.stop(startTime + ringDuration);
    osc2.start(startTime);
    osc2.stop(startTime + ringDuration);
    
    // Second ring
    const osc3 = audioContext.createOscillator();
    const osc4 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    osc3.frequency.value = 440;
    osc4.frequency.value = 480;
    osc3.type = "sine";
    osc4.type = "sine";
    
    osc3.connect(gainNode2);
    osc4.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    const secondRingStart = startTime + ringDuration + pauseBetweenRings;
    gainNode2.gain.setValueAtTime(0, secondRingStart);
    gainNode2.gain.linearRampToValueAtTime(0.15, secondRingStart + 0.05);
    gainNode2.gain.linearRampToValueAtTime(0.15, secondRingStart + ringDuration - 0.05);
    gainNode2.gain.linearRampToValueAtTime(0, secondRingStart + ringDuration);
    
    osc3.start(secondRingStart);
    osc3.stop(secondRingStart + ringDuration);
    osc4.start(secondRingStart);
    osc4.stop(secondRingStart + ringDuration);
  };
  
  const now = audioContext.currentTime;
  createRingTone(now);
  
  return 1.0; // Total duration of ring pattern
}

// Calling tone (outgoing call) - simple beep
export function playCallingTone() {
  const audioContext = getAudioContext();
  
  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  osc.frequency.value = 400; // Single tone
  osc.type = "sine";
  
  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  const now = audioContext.currentTime;
  const duration = 0.5;
  
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
  gainNode.gain.linearRampToValueAtTime(0.1, now + duration - 0.05);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);
  
  osc.start(now);
  osc.stop(now + duration);
  
  return 0.5;
}

let ringtoneInterval: number | null = null;

export function startRingtone() {
  stopRingtone();
  playIncomingRingtone();
  ringtoneInterval = window.setInterval(() => {
    playIncomingRingtone();
  }, 2000); // Ring every 2 seconds
}

export function stopRingtone() {
  if (ringtoneInterval !== null) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}

let callingInterval: number | null = null;

export function startCallingTone() {
  stopCallingTone();
  playCallingTone();
  callingInterval = window.setInterval(() => {
    playCallingTone();
  }, 3000); // Beep every 3 seconds
}

export function stopCallingTone() {
  if (callingInterval !== null) {
    clearInterval(callingInterval);
    callingInterval = null;
  }
}

// DSC Touchscreen keypad beep (authentic 2850 Hz piezo buzzer)
export const playDSCKeypadBeep = () => {
  try {
    const audioContext = getAudioContext();
    
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc.frequency.value = 2850; // DSC piezo buzzer frequency
    osc.type = "square"; // Square wave for that piezo sound
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const now = audioContext.currentTime;
    const duration = 0.05; // Very short beep like real DSC
    
    // Quick attack and decay for that piezo click
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.005);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
  } catch (error) {
    console.error('Audio context error:', error);
  }
};

// DSC Success beep pattern (3 quick ascending beeps)
export const playDSCSuccessBeep = () => {
  try {
    const audioContext = getAudioContext();
    const now = audioContext.currentTime;
    
    // Three ascending beeps like real DSC
    const beeps = [
      { freq: 2700, time: 0 },
      { freq: 2850, time: 0.12 },
      { freq: 3000, time: 0.24 }
    ];
    
    beeps.forEach((beep) => {
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.frequency.value = beep.freq;
      osc.type = "square";
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const startTime = now + beep.time;
      const duration = 0.08;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.005);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (error) {
    console.error('Audio context error:', error);
  }
};

// DSC Error beep pattern (long low beep)
export const playDSCErrorBeep = () => {
  try {
    const audioContext = getAudioContext();
    
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc.frequency.value = 2000; // Lower frequency for error
    osc.type = "square";
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const now = audioContext.currentTime;
    const duration = 0.5; // Longer beep for error
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.2, now + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
  } catch (error) {
    console.error('Audio context error:', error);
  }
};

// DSC Arm mode beep pattern (9 quick beeps)
export const playDSCArmBeeps = () => {
  try {
    const audioContext = getAudioContext();
    const now = audioContext.currentTime;
    
    // 9 beeps when arming
    for (let i = 0; i < 9; i++) {
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      osc.frequency.value = 2850;
      osc.type = "square";
      
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const startTime = now + (i * 0.08); // 80ms between beeps
      const duration = 0.08;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.005);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    }
  } catch (error) {
    console.error('Audio context error:', error);
  }
};
