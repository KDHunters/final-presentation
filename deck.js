(() => {
  'use strict';

  const stage = document.querySelector('#stage');
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  const position = document.querySelector('#position');
  // Paths are resolved from index.html, including when deployed under a subdirectory.
  const root = new URL('.', window.location.href);
  const cache = new Map();
  let order = [];
  let current = -1;
  let request = 0;

  async function read(path, format) {
    const response = await fetch(new URL(path, root));
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response[format]();
  }

  function updateNav() {
    previous.disabled = current <= 0;
    next.disabled = current < 0 || current >= order.length - 1;
    if (current >= 0) {
      position.textContent = `${current + 1} / ${order.length}`;
      position.setAttribute('aria-label', `전체 ${order.length}장 중 ${current + 1}번째 슬라이드`);
    }
  }

  function showError(message) {
    const error = document.createElement('p');
    error.className = 'deck-message';
    error.setAttribute('role', 'alert');
    error.textContent = message;
    stage.replaceChildren(error);
    stage.setAttribute('aria-busy', 'false');
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
    if (index < 0 || index >= order.length) return;
    const id = ++request;
    current = index;
    updateNav();
    stage.setAttribute('aria-busy', 'true');
    try {
      const section = await loadSlide(order[index]);
      if (id !== request) return;
      stage.replaceChildren(section);
      stage.setAttribute('aria-busy', 'false');
    } catch {
      if (id !== request) return;
      showError('이 슬라이드를 열지 못했습니다. 파일 경로와 슬라이드 형식을 확인해 주세요.');
    }
  }

  previous.addEventListener('click', () => void show(current - 1));
  next.addEventListener('click', () => void show(current + 1));
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    if (!step || current < 0) return;
    event.preventDefault();
    void show(current + step);
  });

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
