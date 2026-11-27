import React from 'react';
import {createRoot} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {FrameCtx} from './shim';
import live from './src/livecut.json';
import base from './src/score.json';
import paint from './src/caption-paint.json';
import {OpeningScenes} from './src/OpeningScenes';
import {TeamStage} from './src/TeamStage';
import {View} from './src/Film';
import {EndScenes, END_KEYS} from './src/EndScenes';
import slides from '../slides-data.json';

type Cue = {from: number; n: number; text: string; kind: string; old?: number; oldN?: number; beat?: number};
const cues = live.cues as Cue[];
const OPENING = ['flash', 'tax', 'question', 'lost', 'forgot', 'visible', 'beside'];
// 영상 시간표에 없는 덱 전용 장면. 길이는 장면 안 연출이 끝나는 프레임보다 넉넉하게.
const DECK_ONLY: Record<string, number> = {mailbox: 300, demoTitle: 20, reach: 60, week: 80, retention: 160, ads: 100, cpi: 100, usage: 110, daily: 90};
const isLetters = (k: string) => /^letters\d+$/.test(k);
const viewOf = (k: string) => (isLetters(k) ? {key: k, chapter: 0, from: -1, n: 70, delay: 0} : DECK_ONLY[k] ? {key: k, chapter: 0, from: -1, n: DECK_ONLY[k], delay: 0} : live.views.find((v) => v.key === k)!);
const cueAt = (k: string, f: number) => {
  const v = viewOf(k), g = v.from + Math.min(v.n - 1, Math.max(0, Math.floor(f)));
  if (DECK_ONLY[k] || isLetters(k)) return {from: 0, n: v.n, text: '', kind: 'say'} as Cue;
  return cues.find((c) => c.from <= g && g < c.from + c.n) ?? cues.filter((c) => c.from >= v.from && c.from < v.from + v.n).pop()!;
};

// 한 장면의 한 프레임. Remotion의 Frame과 같은 갈래로 그린다(자막·영상 제외).
const Scene = ({k, f}: {k: string; f: number}) => {
  const v = viewOf(k), c = cueAt(k, f), old = base.views.find((b) => b.key === k);
  const fi = Math.min(v.n - 1, Math.max(0, f));
  let body: React.ReactNode = null;
  if (k === 'demoTitle') body = <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2B2C43', color: '#FFFFFF', fontSize: 150, fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1, opacity: Math.min(1, Math.max(0, f / 8))}}>시연</div>;
  else if (k === 'interview') body = <TeamStage view="interview" t={f / 24} revision />;
  else if (OPENING.includes(k)) body = <OpeningScenes k={k} i={c.beat ?? 0} f={fi} />;
  else if (END_KEYS.includes(k) || isLetters(k)) body = <EndScenes k={k} f={fi} />;
  else if (old) {
    const g = v.from + Math.floor(fi);
    const t = c.old !== undefined ? c.old + Math.min(c.oldN! - 1, Math.floor(((g - c.from) * c.oldN!) / c.n)) : Math.min(old.n - 1, Math.floor((fi / v.n) * old.n));
    body = <View v={old as any} captions={false} frameOverride={t} />;
  }
  return <FrameCtx.Provider value={Math.floor(fi)}><div style={{position: 'absolute', inset: 0, fontFamily: "TeamPretendard,'Apple SD Gothic Neo',sans-serif", fontWeight: 500, background: '#2B2C43'}}>{body}</div></FrameCtx.Provider>;
};

// ── 단계 만들기 ──────────────────────────────────────────
// seg: 장면 안 프레임 구간 [시작, 끝]. 한 단계는 구간 여러 개를 이어서 재생하고 마지막 프레임에서 멈춘다.
type Sub = {kind: 'scene' | 'clip' | 'interview' | 'team'; team?: {path: string; step: number; dyn?: boolean; reset?: boolean}; slide: number; k: string; segs?: [number, number][]; realtime?: boolean; fade?: boolean; clip?: {file: string; from: number; to: number}; label?: string; caps: string[]};
// 손으로 정한 나눔. 구간은 그 박자가 시작한 프레임 기준. 바깥 배열 한 칸이 스페이스 한 번.
const HAND: Record<string, {subs: [number, number][][]; caps?: string[][]; realtime?: boolean; fade?: boolean}> = {
  'flash': {subs: [[[0, 0]]]},
  'tax:0': {subs: [[[0, 52]]]},
  'tax:1': {subs: [[[0, 24]]]},
  'tax:2': {subs: [[[0, 46]]]},
  'question': {subs: [[[0, 32]]]},
  'lost:0': {subs: [[[0, 12]]]},
  'lost:1': {subs: [[[0, -1]]]},
  'lost:2': {subs: [[[0, 36]]]},
  'forgot:0': {subs: [[[0, 58]]]},
  'forgot:1': {subs: [[[0, 58]]]},
  'forgot:2': {subs: [[[0, 122]]], realtime: true},
  'beside:0': {subs: [[[0, 12]], [[50, 100]]], caps: [['그렇다고 메모장이 하루 종일 화면을 가리면'], ['저부터 꺼버릴 것 같았습니다.']]},
  'beside:1': {subs: [[[0, 40]]]},
  'beside:3': {subs: [[[22, 22]]], fade: true},
  'beside:4': {subs: [[[0, 56]], [[78, 138]]], caps: [['메모장 대신 작은 강아지를 곁에 두고,'], ['필요할 때만 눌러 메모를 열도록 했습니다.']], realtime: true},
  'beside:5': {subs: [[[0, 10]], [[12, 26]]], caps: [['잊기 쉬우니 눈앞에 두자,'], ['사용자 입장에서 최대한 단순하게 느끼도록 만들자.']]},
  'beside:6': {subs: [[[0, 0]]]},
  'demoTitle': {subs: [[[0, 8]]]},
  'reach': {subs: [[[0, 30]]]},
  'week': {subs: [[[0, 66]]], realtime: true},
  'retention': {subs: [[[0, 40]], [[58, 76]]]},
  'feedback': {subs: [[[115, 116]], [[315, 316]]]},
  'usage': {subs: [[[0, 46]]]},
  'daily': {subs: [[[0, 54]]]},
};
const MERGE_TAIL = ['friend'];
// 자동으로 나눈 단계에 문장을 순서대로 붙일 때의 묶음(문장 번호).
const CAP_SPLIT: Record<string, number[][]> = {feedback: [[0], [1]], mailbox: [[0, 1], [2], [3]], friend: [[0], [1, 2]], heavy: [[0], [1], [2]], retention: [[0], [1]], letterKR: [[0], [1], [2]]};
const AUTO_CAPS: Record<string, string[][]> = {visible: [['그래서 이렇게 생각했습니다. 눈앞에 없으면 잊는데,'], ['항상 눈앞에 있으면 어떨까?']]};

// 강아지 숨쉬기처럼 계속 도는 스프라이트 번호는 화면 변화로 치지 않는다.
const markup = (k: string, f: number) => renderToStaticMarkup(<Scene k={k} f={f} />).replace(/(idle|mailalert|greet)-\d\.png/g, '$1.png');
// 화면이 바뀌는 프레임 묶음을 찾는다. 1초 넘게 가만히 있으면 거기서 스페이스를 기다린다.
const detect = (k: string, a: number, b: number): [number, number][][] => {
  const changed: number[] = [];
  let prev = markup(k, a);
  for (let f = a + 1; f < b; f++) { const m = markup(k, f); if (m !== prev) changed.push(f); prev = m; }
  if (!changed.length) return [[[a, a]]];
  const runs: [number, number][] = [];
  for (const f of changed) { const last = runs[runs.length - 1]; if (last && f - last[1] <= 8) last[1] = f; else runs.push([f - 1, f]); }
  const subs: [number, number][][] = [];
  if (runs[0][0] - a >= 24) subs.push([[a, a]]);
  for (const r of runs) { const cur = subs[subs.length - 1], lastEnd = cur ? cur[cur.length - 1][1] : -999; if (cur && r[0] - lastEnd < 24 && !(cur.length === 1 && cur[0][0] === cur[0][1] && cur[0][0] === a && r[0] - a >= 24)) cur.push(r); else subs.push([r]); }
  return subs;
};
const share = (caps: string[], n: number, starts: number[], a: number, b: number): string[][] => {
  if (n === 1) return [caps];
  const total = caps.join('').length || 1, out: string[][] = Array.from({length: n}, () => []);
  let acc = 0;
  for (const s of caps) { const at = a + ((acc + s.length / 2) / total) * (b - a); let idx = 0; starts.forEach((st, i) => { if (st <= at) idx = i; }); out[idx].push(s); acc += s.length; }
  for (let i = 0; i < n; i++) if (!out[i].length) out[i] = i ? out[i - 1] : [];
  return out;
};

const SUBS: Sub[] = [];
const built = new Set<number>();
const stepRange = (k: string, beat: number | undefined): [number, number] => {
  const v = viewOf(k);
  if (beat === undefined) return [0, v.n];
  const cs = cues.filter((c) => c.from >= v.from && c.from < v.from + v.n && (c.beat ?? 0) === beat);
  if (!cs.length) return [0, v.n];
  return [cs[0].from - v.from, cs[cs.length - 1].from + cs[cs.length - 1].n - v.from];
};
(slides as any[]).forEach((sl, si) => {
  for (const st of sl.steps) {
    // 합본: 서영님 조각을 그대로 띄우는 장(시연 제목 → s07-demo).
    if (sl.team) { SUBS.push({kind: 'team', slide: si, k: sl.key, team: {path: sl.team, step: 0}, caps: st.captions}); continue; }
    if (st.clip) { SUBS.push({kind: 'clip', slide: si, k: sl.key, clip: st.clip, label: st.label ?? sl.label, caps: st.captions}); continue; }
    if (sl.key === 'interview') { SUBS.push({kind: 'interview', slide: si, k: 'interview', caps: []}); continue; }
    const [a, b] = stepRange(sl.key, st.beat), id = st.beat === undefined ? sl.key : sl.key + ':' + st.beat, hand = HAND[id];
    let groups: [number, number][][];
    if (isLetters(sl.key)) groups = [[[a, a + 40]]];
    else if (hand) groups = hand.subs.map((g) => g.map(([s, e]) => [a + s, e < 0 ? b - 1 : Math.min(b - 1, a + e)] as [number, number]));
    else if (['cover', 'personal'].includes(sl.key)) groups = [[[a, a]]];
    else groups = detect(sl.key, a, b);
    // 한 문장 안에서 이어지는 변화는 한 번에 보여 준다(21번: 카드가 나온 뒤 곧바로 메일 다시 찾기에 줄).
    if (MERGE_TAIL.includes(id) && groups.length > 2) groups = [groups[0], groups.slice(1).flat() as [number, number][]];
    const caps = hand?.caps ?? (CAP_SPLIT[id] && CAP_SPLIT[id].length === groups.length ? CAP_SPLIT[id].map((g) => g.map((n) => st.captions[n]).filter(Boolean)) : AUTO_CAPS[id] && AUTO_CAPS[id].length === groups.length ? AUTO_CAPS[id] : share(st.captions, groups.length, groups.map((g) => g[0][0]), a, b));
    if (id === 'lost:2') { const g = groups[0][0]; while (Math.floor(g[1] / 12) % 2) g[1]++; }
    groups.forEach((g, i) => SUBS.push({kind: 'scene', slide: si, k: sl.key, segs: g, realtime: hand?.realtime, fade: hand?.fade, caps: caps[i] ?? []}));
  }
  built.add(si);
});

// 자막: 한 번에 두 줄(약 84자)까지. 넘치면 스페이스로 다음 쪽.
const pagesOf = (caps: string[]) => {
  const pages: string[] = [];
  let cur = '';
  for (const s of caps) { if (cur && (cur + " " + s).length > 100) { pages.push(cur); cur = s; } else cur = cur ? cur + ' ' + s : s; }
  if (cur) pages.push(cur);
  return pages.length ? pages : [''];
};

// ── 무대 ────────────────────────────────────────────────
const $ = (id: string) => document.getElementById(id)!;
const stage = $('stage'), sceneEl = $('scene'), demoEl = $('demo'), labelEl = $('demo-label'), capEl = $('caption'), capText = $('caption-text'), hint = $('hint');
const root = createRoot(sceneEl);
// 합본: 내 장면이 끝난 뒤 서영님 슬라이드(seoyoung/)를 안쪽 창으로 이어 붙인다. 장 목록과 단계 수는 안쪽 창이 알려 준다.
const teamEl = $('team') as HTMLIFrameElement;
const teamWin = () => teamEl.contentWindow as any;
const teamLoad = new Promise<void>((res) => {
  const giveUp = setTimeout(res, 8000);
  const finish = () => { clearTimeout(giveUp); res(); };
  const wait = () => {
    const ready = (() => { try { return teamWin()?.teamReady; } catch { return null; } })();
    if (!ready) { setTimeout(wait, 50); return; }
    ready.then((metas: {i: number; path: string; steps: number; dyn?: boolean; reset?: boolean}[]) => {
      metas.forEach((m, j) => { for (let st = 0; st <= m.steps; st++) SUBS.push({kind: 'team', slide: (slides as any[]).length + j, k: 'team:' + m.path.split('/').pop()!.replace(/\.html$/, ''), team: {path: m.path, step: st, dyn: m.dyn, reset: m.reset}, caps: []}); });
      finish();
    }, finish);
  };
  wait();
});
const vids: Record<string, HTMLVideoElement> = {};
for (const file of Array.from(new Set(SUBS.filter((s) => s.clip).map((s) => s.clip!.file)))) {
  const v = document.createElement('video');
  v.src = file; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.className = 'clip'; v.style.visibility = 'hidden';
  $('demo-phone').appendChild(v); vids[file] = v;
}
// 발표자 창(자막 있음)과 발표 창(자막 없음)을 같은 방 번호로 묶는다. 발표 창은 ?view=audience&room=…
const qs = new URLSearchParams(location.search), AUD = qs.get('view') === 'audience';
const room = qs.get('room') || sessionStorage.getItem('deck-room') || Math.random().toString(36).slice(2, 10);
if (!AUD) sessionStorage.setItem('deck-room', room);
const bc: BroadcastChannel | null = 'BroadcastChannel' in window ? new BroadcastChannel('stickypet-deck-' + room) : null;
const audio = new window.Audio('assets/interview-soft-in.wav');
audio.preload = 'auto';
// 인터뷰 소리는 발표자 창에서만 낸다(두 창에서 겹쳐 들리지 않게).
audio.muted = AUD;
if (AUD) { document.title = '스티키펫 발표 (발표)'; hint.textContent = '이 창을 발표 화면으로 옮긴 뒤 클릭하면 전체 화면'; }
else hint.textContent += '　P 발표 창';
Object.assign(capText.style, paint);

let idx = 0, page = 0, capsOn = !AUD, raf = 0, token = 0;
// ── 쪽 번호 ─────────────────────────────────────────────
// 위치·글꼴은 서영님 common.css의 .slide-folio와 같다(deck.css #folio). 번호는 합본 전체를 처음부터 센다.
// 화면이 같은 표지·시작 인사는 한 쪽으로 치고, 첫 쪽에는 번호를 붙이지 않는다(서영님 덱과 같은 규칙).
const folioEl = $('folio');
let pageNo: number[] = [], pageTotal = 0;
const countPages = () => {
  pageNo = []; pageTotal = 0;
  let last = '';
  SUBS.forEach((s, i) => { const key = s.kind === 'team' ? 'T' + s.slide : 'S' + (s.k === 'personal' ? 'cover' : s.k); if (key !== last) { pageTotal++; last = key; } pageNo[i] = pageTotal; });
};
const two = (n: number) => String(n).padStart(2, '0');
const folioText = (i: number) => (pageNo[i] > 1 ? two(pageNo[i]) + ' / ' + two(pageTotal) : '');
// 번호 색은 그 자리 배경이 어두우면 밝은 색, 밝으면 갈색(서영님 덱의 두 가지 색).
const paintFolio = () => {
  const r = stage.getBoundingClientRect();
  let el = document.elementFromPoint(r.left + r.width * 0.9, r.top + r.height * 0.975) as HTMLElement | null, dark = true;
  for (; el && el !== document.documentElement; el = el.parentElement) {
    const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(getComputedStyle(el).backgroundColor);
    if (m && (m[4] === undefined || +m[4] > 0.5)) { dark = 0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3] < 140; break; }
  }
  folioEl.style.setProperty('--ink', dark ? '#F2E4C9' : '#392A20');
};
const showFolio = (i: number, mine: boolean) => {
  const t = mine ? folioText(i) : '';
  folioEl.textContent = t; folioEl.style.display = t ? 'block' : 'none';
  if (t) { requestAnimationFrame(() => requestAnimationFrame(paintFolio)); setTimeout(paintFolio, 400); }
};
const fit = () => { const s = Math.min(innerWidth / 1280, innerHeight / 720); stage.style.transform = `translate(-50%,-50%) scale(${s})`; };
addEventListener('resize', fit); fit();

// 표지와 시작 인사는 같은 화면이라 다시 만들지 않는다(다시 만들면 폰 그림이 한 번 깜빡인다).
const sceneKey = (k: string) => (k === 'personal' ? 'cover' : k);
const draw = (k: string, f: number) => root.render(<Scene key={sceneKey(k)} k={k} f={f} />);
const showCaption = () => {
  const p = pagesOf(SUBS[idx].caps), text = p[Math.min(page, p.length - 1)];
  capText.textContent = text;
  capEl.style.display = capsOn && text ? 'flex' : 'none';
};
const stopAll = () => { cancelAnimationFrame(raf); token++; audio.pause(); for (const v of Object.values(vids)) v.pause(); };
const seekTo = (v: HTMLVideoElement, t: number) => { try { v.currentTime = t; } catch {} };

const enter = (animate: boolean) => {
  stopAll();
  const my = token, s = SUBS[idx];
  page = animate ? 0 : pagesOf(s.caps).length - 1;
  if (!capsOn) page = 0;
  showCaption();
  (window as any).__deck = {idx, total: SUBS.length, slide: s.slide, kind: s.kind, k: s.k, done: false};
  const done = () => { (window as any).__deck.done = true; };
  showFolio(idx, s.kind !== 'team');
  demoEl.style.display = s.kind === 'clip' ? 'block' : 'none';
  sceneEl.style.display = s.kind === 'clip' || s.kind === 'team' ? 'none' : 'block';
  teamEl.style.visibility = s.kind === 'team' ? 'visible' : 'hidden';
  if (s.kind === 'team') { Promise.resolve(teamWin()?.teamShow?.(s.team!.path, s.team!.step, {silent: AUD, folio: folioText(idx)})).then(done, done); return; }
  try { teamWin()?.teamHide?.(); } catch {}
  if (s.kind === 'clip') {
    const c = s.clip!, v = vids[c.file];
    for (const o of Object.values(vids)) o.style.visibility = o === v ? 'visible' : 'hidden';
    labelEl.textContent = s.label ?? '';
    const end = c.to - 1 / 48;
    if (!animate) { seekTo(v, end); done(); return; }
    seekTo(v, c.from);
    const tick = () => { if (my !== token) return; if (v.currentTime >= end || v.ended) { v.pause(); seekTo(v, end); done(); return; } raf = requestAnimationFrame(tick); };
    v.play().then(() => { if (my === token) raf = requestAnimationFrame(tick); }, () => { if (my === token) { (window as any).__deck.playError = true; raf = requestAnimationFrame(tick); } });
    return;
  }
  if (s.kind === 'interview') {
    const n = viewOf('interview').n;
    if (!animate) { draw('interview', n - 1); done(); return; }
    audio.currentTime = 0;
    const tick = () => { if (my !== token) return; const f = Math.min(n - 1, audio.currentTime * 24); draw('interview', f); if (audio.ended || f >= n - 1) { done(); return; } raf = requestAnimationFrame(tick); };
    draw('interview', 0);
    audio.play().then(() => { (window as any).__deck.audio = true; }, () => { (window as any).__deck.audio = false; });
    raf = requestAnimationFrame(tick);
    return;
  }
  const segs = s.segs!, last = segs[segs.length - 1][1];
  if (!animate) { draw(s.k, last); done(); return; }
  // 구간을 이어 붙인 재생표. 구간 사이는 0.3초 쉬고, 전체가 1.6초를 넘으면 빠르게 돌린다(realtime 제외).
  const parts: [number, number, number][] = [];
  segs.forEach(([a, b], i) => { parts.push([a, b, Math.max(0, b - a) / 24]); if (i < segs.length - 1) parts.push([b, b, 0.3]); });
  const raw = parts.reduce((t, p) => t + p[2], 0), speed = s.realtime || raw <= 1.6 ? 1 : raw / 1.6, t0 = performance.now();
  const tick = () => {
    if (my !== token) return;
    let t = ((performance.now() - t0) / 1000) * speed, f = last;
    for (const [a, b, d] of parts) { if (t <= d) { f = d ? a + ((b - a) * t) / d : a; break; } t -= d; }
    if ((performance.now() - t0) / 1000 * speed >= raw) { draw(s.k, last); done(); return; }
    draw(s.k, f); raf = requestAnimationFrame(tick);
  };
  draw(s.k, segs[0][0]);
  // 앞 단계와 그림이 이어지지 않는 단계는 화면 전체를 짧게 페이드인한다.
  if (s.fade) sceneEl.animate([{opacity: 0}, {opacity: 1}], {duration: 380, easing: "ease-out"});
  if (raw <= 0) { done(); return; }
  raf = requestAnimationFrame(tick);
};
const next = () => {
  const p = pagesOf(SUBS[idx].caps);
  if (capsOn && page < p.length - 1) { page++; showCaption(); return; }
  if (idx >= SUBS.length - 1) return;
  const s = SUBS[idx];
  // 서영님 원본과 같게: 단계가 아직 열리지 않은 장(영상 4개가 끝나야 단계가 생기는 4분할)에서 누르면 다음 장으로 간다.
  if (s.kind === 'team' && s.team!.dyn && !((() => { try { return teamWin()?.teamLive?.() ?? 0; } catch { return 0; } })() > s.team!.step)) {
    let j = idx + 1;
    while (j < SUBS.length && SUBS[j].slide === s.slide) j++;
    if (j < SUBS.length) { idx = j; enter(true); }
    return;
  }
  idx++; enter(true);
};
const prev = () => {
  if (idx <= 0) return;
  const from = SUBS[idx];
  idx--;
  // 서영님 원본과 같게: 뒤 장에서 돌아올 때 처음 단계부터 다시 시작하는 장(data-step-entry="reset")은 첫 단계로 간다.
  if (SUBS[idx].kind === 'team' && SUBS[idx].team!.reset && SUBS[idx].slide !== from.slide) while (idx > 0 && SUBS[idx - 1].slide === SUBS[idx].slide) idx--;
  enter(false);
};
const go = (i: number, animate = false) => { idx = Math.max(0, Math.min(SUBS.length - 1, i)); enter(animate); };
(window as any).deck = {next, prev, go, audio, vids, state: () => ({idx, page, capsOn}), list: () => SUBS.map((s, i) => ({i, slide: s.slide + 1, key: s.k, kind: s.kind, caps: s.caps, pages: pagesOf(s.caps).length, segs: s.segs, clip: s.clip})), toggleCaptions: () => { capsOn = !capsOn; showCaption(); return capsOn; }};

// 넘김은 발표자 창이 정하고 발표 창은 따라온다. 발표 창에서 키를 눌러도 발표자 창으로 보내서 처리한다.
const flash = (msg: string) => { hint.textContent = msg; hint.classList.remove('gone'); setTimeout(() => hint.classList.add('gone'), 3000); };
const run = (c: string) => { const b = idx; if (c === 'next') next(); else if (c === 'prev') prev(); else go(0); bc?.postMessage({t: 'state', from: AUD ? 'a' : 'p', idx, animate: c === 'next' && idx !== b}); };
const timers: number[] = [];
let booted = false;
const cmd = (c: string) => { if (!AUD || !bc) { run(c); return; } bc.postMessage({t: 'cmd', c}); timers.push(window.setTimeout(() => run(c), 250)); };
if (bc) bc.onmessage = (e) => {
  const m = e.data || {};
  if (AUD) { if (m.from !== 'p') return; timers.splice(0).forEach((t) => clearTimeout(t)); if (m.t === 'state' && m.idx !== idx) { idx = m.idx; if (booted) enter(!!m.animate); } return; }
  if (m.t === 'cmd') run(m.c);
  else if (m.t === 'hello') { bc.postMessage({t: 'state', from: 'p', idx, animate: false}); flash('발표 창 연결됨'); }
  else if (m.t === 'state' && m.from === 'a' && m.idx !== idx) { idx = m.idx; enter(!!m.animate); }
};
if (AUD) bc?.postMessage({t: 'hello'});
const openAudience = () => window.open(location.pathname + '?view=audience&room=' + room + '&t=' + Date.now(), 'stickypet-audience', 'popup,width=1280,height=720');
const fullscreen = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); };
let focusedAt = -1e9;
addEventListener('focus', () => { focusedAt = performance.now(); });

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  if (k === ' ' || k === 'ArrowRight' || k === 'Enter' || k === 'PageDown') { e.preventDefault(); cmd('next'); }
  else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); cmd('prev'); }
  else if (k === 'Home') { e.preventDefault(); cmd('home'); }
  else if (!AUD && (k === 'c' || k === 'C' || k === 'ㅊ')) { capsOn = !capsOn; if (!capsOn) page = 0; showCaption(); }
  else if (k === 'f' || k === 'F' || k === 'ㄹ') fullscreen();
  else if (!AUD && (k === 'p' || k === 'P' || k === 'ㅔ')) openAudience();
});
// 발표 창은 클릭하면 전체 화면. 발표자 창은 클릭하면 다음(다른 창에서 돌아오려고 누른 첫 클릭은 넘기지 않는다).
addEventListener('click', () => { if (AUD) fullscreen(); else if (performance.now() - focusedAt > 400) cmd('next'); });
setTimeout(() => hint.classList.add('gone'), 6000);
// 첫 화면. 그 전에 발표자 창이 알려 준 단계가 있으면 그 단계에서 시작한다.
const boot = () => { countPages(); booted = true; go(idx, idx === 0); };
Promise.all([document.fonts.load('500 32px TeamPretendard').catch(() => {}), teamLoad]).then(boot, boot);
