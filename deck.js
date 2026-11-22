(() => {
  'use strict';

  const stage = document.querySelector('#stage');
  const position = document.querySelector('#position');
  // Paths are resolved from index.html, including when deployed under a subdirectory.
  const root = new URL('.', window.location.href);
  const cache = new Map();
  let order = [];
  let current = -1;
  let request = 0;
  let touchStart = null;
  const interactive = 'a[href], button, input, textarea, select, summary, video, audio, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="slider"]';

  async function read(path, format) {
    const response = await fetch(new URL(path, root));
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response[format]();
  }

  function showError(message) {
    const error = document.createElement('p');
    error.className = 'deck-message';
    error.setAttribute('role', 'alert');
    error.textContent = message;
    stage.replaceChildren(error);
    stage.setAttribute('aria-busy', 'false');
    window.scrollTo(0, 0);
  }

  async function loadSlide(path) {
    if (!cache.has(path)) {
      const html = await read(path, 'text');
      const fragment = document.createElement('template');
      fragment.innerHTML = html.trim();
      const section = fragment.content.firstElementChild;
      const extraText = [...fragment.content.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      );
      if (fragment.content.childElementCount !== 1 || extraText || !section.matches('section.slide')) {
        throw new Error(`${path}: section.slide 하나가 필요합니다.`);
      }
      cache.set(path, section);
    }
    return cache.get(path).cloneNode(true);
  }

  async function show(index) {
    if (index < 0 || index >= order.length || index === current) return;
    const id = ++request;
    current = index;
    stage.setAttribute('aria-busy', 'true');
    try {
      const section = await loadSlide(order[index]);
      if (id !== request) return;
      stage.replaceChildren(section);
      stage.setAttribute('aria-busy', 'false');
      window.scrollTo(0, 0);
      const heading = section.querySelector('h1, h2');
      position.textContent = `전체 ${order.length}장 중 ${index + 1}번째 슬라이드${heading ? ': ' + heading.textContent.trim() : ''}`;
    } catch {
      if (id !== request) return;
      showError('이 슬라이드를 열지 못했습니다. 파일 경로와 슬라이드 형식을 확인해 주세요.');
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
      else await document.documentElement.requestFullscreen?.();
    } catch {
      // Some browsers or embedded contexts do not allow fullscreen.
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof Element && event.target.closest(interactive)) return;
    if (event.shiftKey && event.key !== ' ') return;
    if (event.key.toLowerCase() === 'f' || event.code === 'KeyF') {
      event.preventDefault();
      if (!event.repeat) void toggleFullscreen();
      return;
    }
    if (current < 0) return;
    let target;
    switch (event.key) {
      case 'ArrowLeft':
      case 'PageUp': target = current - 1; break;
      case 'ArrowRight':
      case 'PageDown': target = current + 1; break;
      case ' ': target = current + (event.shiftKey ? -1 : 1); break;
      case 'Home': target = 0; break;
      case 'End': target = order.length - 1; break;
      default: return;
    }
    event.preventDefault();
    if (!event.repeat) void show(target);
  });

  stage.addEventListener('touchstart', (event) => {
    touchStart = null;
    if (event.touches.length !== 1 || (event.target instanceof Element && event.target.closest(interactive))) return;
    const { identifier, clientX, clientY } = event.touches[0];
    touchStart = { identifier, clientX, clientY };
  }, { passive: true });

  stage.addEventListener('touchend', (event) => {
    const start = touchStart;
    touchStart = null;
    if (!start || event.touches.length !== 0 || current < 0) return;
    const touch = Array.from(event.changedTouches).find(({ identifier }) => identifier === start.identifier);
    if (!touch) return;
    const dx = touch.clientX - start.clientX;
    const dy = touch.clientY - start.clientY;
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy) * 1.5) return;
    void show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  stage.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

  async function init() {
    if (window.location.protocol === 'file:') {
      showError('이 덱은 슬라이드 파일을 따로 읽습니다. 저장소 루트를 정적 HTTP 서버로 열어 주세요.');
      position.textContent = '슬라이드 없음';
      return;
    }
    try {
      const paths = await read('order.json', 'json');
      const isSlidePath = (path) => typeof path === 'string' &&
        /^slides\/(?:[^/\\?#:%]+\/)*[^/\\?#:%]+\.html$/i.test(path) &&
        !path.split('/').some((part) => part === '.' || part === '..');
      if (!Array.isArray(paths) || paths.length === 0 || !paths.every(isSlidePath)) {
        throw new Error('order.json: 슬라이드 경로 배열이 필요합니다.');
      }
      order = paths;
      await show(0);
    } catch {
      showError('슬라이드 목록을 열지 못했습니다. order.json에 올바른 슬라이드 경로가 있는지 확인해 주세요.');
      position.textContent = '슬라이드 없음';
    }
  }

  void init();
})();
