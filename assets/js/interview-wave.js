const SVG = 'http://www.w3.org/2000/svg';
const COUNT = 37;
const MIDDLE = (COUNT - 1) / 2;
const CENTER_Y = 56;
const REST = 1.5;

// Each cue stays visible once its start time has been reached.
const CAPTIONS = [
  [0.00, '그냥 반짝하고 없어지는 것 같아요'],
  [2.15, '떠올랐다가 그런 생각을 했던 것도 까먹을 만큼'],
  [6.63, '까먹었다는 사실도 잊을 만큼'],
  [8.50, '그냥 완전 없는 기억이 되는 것 같아요'],
];

export function mountInterviewWave(section, root) {
  const signal = section.querySelector('.interview-wave__signal');
  const audio = section.querySelector('[data-interview-audio]');
  const caption = section.querySelector('[data-interview-caption]');
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const levels = new Float32Array(COUNT);
  let context, analyser, source, spectrum, samples;
  let frame = 0;
  let lastPaint = 0;
  let active = true;
  let pending = false;
  let blocked = false;
  let visibleCaptions = 0;

  const bars = Array.from({ length: COUNT }, (_, index) => {
    const bar = document.createElementNS(SVG, 'line');
    const x = 12 + index * 11;
    bar.setAttribute('x1', x);
    bar.setAttribute('x2', x);
    signal.append(bar);
    return bar;
  });

  function setBar(bar, halfHeight) {
    bar.setAttribute('y1', (CENTER_Y - halfHeight).toFixed(1));
    bar.setAttribute('y2', (CENTER_Y + halfHeight).toFixed(1));
  }

  function resetWave() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastPaint = 0;
    levels.fill(0);
    bars.forEach((bar) => setBar(bar, REST));
  }

  function syncCaption() {
    if (!active || (audio.paused && !audio.ended)) return;
    const time = audio.currentTime;
    while (visibleCaptions < CAPTIONS.length && time >= CAPTIONS[visibleCaptions][0]) {
      const line = document.createElement('p');
      line.textContent = CAPTIONS[visibleCaptions++][1];
      caption.append(line);
    }
  }

  function tick(now) {
    frame = 0;
    if (!active || audio.paused || audio.ended) return;
    frame = requestAnimationFrame(tick);
    syncCaption();
    if (!analyser || context.state !== 'running' || now - lastPaint < (reducedMotion.matches ? 140 : 28)) return;
    lastPaint = now;
    analyser.getFloatTimeDomainData(samples);
    analyser.getByteFrequencyData(spectrum);
    let power = 0;
    for (const sample of samples) power += sample * sample;
    const rms = Math.sqrt(power / samples.length);
    const volume = Math.min(1, Math.max(0, (rms - 0.004) * 7));
    const hzPerBin = context.sampleRate / analyser.fftSize;

    bars.forEach((bar, index) => {
      const distance = Math.abs(index - MIDDLE) / MIDDLE;
      const hz = 160 * 28 ** distance;
      const low = Math.max(1, Math.floor((hz * 0.84) / hzPerBin));
      const high = Math.min(spectrum.length - 1, Math.ceil((hz * 1.16) / hzPerBin));
      let peak = 0;
      for (let bin = low; bin <= high; bin++) peak = Math.max(peak, spectrum[bin]);
      const energy = Math.max(0, (peak - 30) / 225);
      const target = volume * (0.12 + 0.88 * energy) * (1 - 0.55 * distance);
      const easing = target > levels[index] ? 0.8 : 0.32;
      levels[index] += (target - levels[index]) * easing;
      setBar(bar, REST + levels[index] * (reducedMotion.matches ? 18 : 48));
    });
  }

  function updateWave() {
    if (active && !audio.paused && !audio.ended) {
      if (!frame) frame = requestAnimationFrame(tick);
    } else resetWave();
  }

  function enableAnalysis() {
    if (!AudioContext) return;
    try {
      context ??= new AudioContext();
      const connect = () => {
        if (!active || source || context.state !== 'running') return;
        const node = context.createAnalyser();
        node.fftSize = 2048;
        node.smoothingTimeConstant = 0.46;
        node.minDecibels = -82;
        node.maxDecibels = -24;
        node.connect(context.destination);
        source = context.createMediaElementSource(audio);
        source.connect(node);
        analyser = node;
        spectrum = new Uint8Array(analyser.frequencyBinCount);
        samples = new Float32Array(analyser.fftSize);
        updateWave();
      };
      // Never route the media into a suspended graph; the native element remains audible.
      if (context.state === 'running') connect();
      else void context.resume().then(connect).catch(() => {});
    } catch {
      // Browsers without a usable Web Audio graph can still play the clip.
    }
  }

  function start() {
    if (!active || pending || !audio.paused || audio.ended) return;
    pending = true;
    blocked = false;
    // Invocation stays in the navigation/first trusted gesture, before any await.
    enableAnalysis();
    void audio.play().catch((error) => {
      if (!active) return;
      blocked = error.name === 'NotAllowedError';
      resetWave();
      syncCaption();
    }).finally(() => { pending = false; });
  }

  function unlock(event) {
    if (!active || !event.isTrusted) return;
    // Navigation keys should leave the current slide, not start a blocked clip.
    if (event.type === 'keydown' && (event.repeat ||
      ['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key))) return;
    if (blocked) start();
    else if (!audio.paused && !audio.ended && !source) enableAnalysis();
  }

  document.addEventListener('click', unlock, options);
  document.addEventListener('keydown', unlock, options);
  audio.addEventListener('playing', () => {
    syncCaption();
    updateWave();
  }, options);
  // Keep caption synchronization independent of AudioContext and animation throttling.
  audio.addEventListener('timeupdate', syncCaption, options);
  audio.addEventListener('seeked', syncCaption, options);
  audio.addEventListener('waiting', resetWave, options);
  function resetPlayback() {
    resetWave();
    syncCaption();
  }
  audio.addEventListener('pause', resetPlayback, options);
  audio.addEventListener('ended', resetPlayback, options);

  resetWave();
  audio.src = new URL(audio.dataset.interviewAudio, root).href;
  start();

  return () => {
    active = false;
    listeners.abort();
    audio.pause();
    audio.currentTime = 0;
    resetWave();
    caption.replaceChildren();
    audio.removeAttribute('src');
    audio.load();
    if (context) void context.close().catch(() => {});
  };
}
