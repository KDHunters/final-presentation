import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {TeamStage} from './TeamStage';
import live from './livecut.json';
import letterData from './letters.json';

// 시연 뒤 장면(21~31번). 앞부분과 같은 네이비 무대에 숫자와 근거를 그림으로 받친다.
// 수치·답장 문구·피드백 원문은 그대로 두고 배치만 한다. 노랑 강조는 화면마다 하나.
const navy = '#2B2C43', rail = '#53556E', ink = '#392D28', cream = '#FEF8E8', paper = '#FFFDF4';
const muted = '#BBC0D3', dim = '#A3A6BA', gold = '#F3D97F', mark = '#FFE98A', memoInk = '#85754c';
const clamp = (v: number) => Math.min(1, Math.max(0, v));
// 줄이 그어지면 글자가 크림에서 옅은 회청색으로 물러난다.
const mixInk = (p: number) => { const c = Math.min(1, Math.max(0, p)), m = (x: number, y: number) => Math.round(x + (y - x) * c); return `rgb(${m(254, 187)}, ${m(248, 192)}, ${m(232, 211)})`; };
const ease = (x: number) => { const c = clamp(x); return c * c * (3 - 2 * c); };
const seg = (f: number, a: number, b: number) => ease((f - a) / (b - a));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const at = (left: number, top: number, width: number | string, height: number | string, s: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left, top, width, height, ...s});
const Txt = ({x, y, w, size, children, color, align = 'left', style = {}}: any) => (
  <div style={at(x, y, w, 'auto', {fontSize: size, letterSpacing: '-.035em', color, textAlign: align, lineHeight: 1.3, ...style})}>{children}</div>
);
// 출처·집계 기준. 본문 아래에 작게.
const Foot = ({y, children}: any) => <Txt x={140} y={y} w={1000} size={24} color={dim} align="center">{children}</Txt>;

// 대사에서 낱말이 나오는 프레임(장면 시작 기준). 못 찾으면 장면 길이의 fallback 비율 지점.
type Cue = {from: number; n: number; text?: string; kind?: string};
const when = (k: string, words: string[], fallback: number, end = false) => {
  const v = live.views.find((x) => x.key === k);
  if (!v) return 0;
  for (const c of live.cues as Cue[]) {
    if (c.kind !== 'say' || !c.text || c.from < v.from || c.from >= v.from + v.n) continue;
    for (const w of words) { const i = c.text.indexOf(w); if (i >= 0) return c.from - v.from + (c.n * (i + (end ? w.length : 0))) / c.text.length; }
  }
  return v.n * fallback;
};

// 핥기 한 번: 앱과 같은 그림 순서·박자(web/app.js clips.lick). 24fps 기준 약 27프레임.
const LICK: [number, number][] = [[3, 200], [0, 150], [1, 150], [2, 120], [0, 100], [3, 400]];
const lickAt = (f: number, start: number): number | null => { let t = ((f - start) / 24) * 1000; if (t < 0) return null; for (const [n, d] of LICK) { if (t < d) return n; t -= d; } return null; };
const Dog = ({x, y, size, bark = false, lick = null}: any) => <Img src={staticFile(lick !== null ? `pet/lick-${lick}.png` : bark ? 'pet/mailalert-1.png' : 'pet/idle-0.png')} style={at(x, y, size, size, {imageRendering: 'pixelated', objectFit: 'contain'})} />;
const Envelope = ({x, y, w = 70, o = 1, style = {}}: any) => (
  <svg viewBox="0 0 70 50" style={at(x, y, w, (w * 50) / 70, {opacity: o, ...style})}>
    <rect x="2" y="2" width="66" height="46" rx="6" fill={cream} />
    <path d="M6 8l29 22L64 8" fill="none" stroke={memoInk} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Note = ({x, y, s = 90, o = 1}: any) => (
  <div style={at(x, y, s, s, {borderRadius: s * 0.14, background: gold, opacity: o})}>
    {[0.62, 0.42, 0.54].map((w, j) => <div key={j} style={at(s * 0.18, s * (0.26 + j * 0.2), s * w, s * 0.08, {background: memoInk, borderRadius: s * 0.04})} />)}
  </div>
);
// 처음 쓴 날 → 7일 뒤. p = 선이 채워진 정도, hi = 7일째 점 강조.
const Week = ({y, p, hi = 0, children}: {y: number; p: number; hi?: number; children?: React.ReactNode}) => {
  const x0 = 200, W = 880;
  return (
    <div style={at(0, y, 1280, 120)}>
      <div style={at(x0, 16, W, 6, {background: rail, borderRadius: 3})} />
      <div style={at(x0, 16, W * clamp(p), 6, {background: cream, borderRadius: 3})} />
      {Array.from({length: 8}, (_, d) => {
        const on = p >= d / 7 - 0.001, big = d === 0 || d === 7, r = big ? 17 : 10;
        return <div key={d} style={at(x0 + (W * d) / 7 - r, 19 - r, r * 2, r * 2, {boxSizing: 'border-box', borderRadius: r, background: on ? cream : navy, border: `4px solid ${on ? cream : rail}`, boxShadow: d === 7 && hi > 0 ? `0 0 0 ${10 * hi}px ${gold}55, 0 0 0 ${5 * hi}px ${gold}` : undefined})} />;
      })}
      <Txt x={x0 - 150} y={52} w={300} size={34} align="center" color={cream}>처음 쓴 날</Txt>
      <Txt x={x0 + W - 150} y={52} w={300} size={34} align="center" color={cream}>7일 뒤</Txt>
      {children}
    </div>
  );
};
const Card = ({children, foot, o = 1}: any) => (
  <div style={at(90, 140, 1100, 'auto', {boxSizing: 'border-box', minHeight: 420, padding: '66px 72px 50px', borderRadius: 30, background: paper, color: ink, boxShadow: '0 14px 36px #12141b55', opacity: o, transform: `translateY(${(1 - o) * 18}px)`})}>
    <div style={{fontSize: 54, fontWeight: 600, lineHeight: 1.6, letterSpacing: '-.045em', whiteSpace: 'nowrap'}}>{children}</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 46, fontSize: 29, letterSpacing: '-.03em', color: '#6a6861'}}>
      <svg viewBox="0 0 70 50" width="46" height="33"><rect x="2" y="2" width="66" height="46" rx="6" fill="#E9E2CC" /><path d="M6 8l29 22L64 8" fill="none" stroke={memoInk} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {foot}
    </div>
  </div>
);
const Hi = ({children}: any) => <span style={{background: mark, padding: '2px 8px', margin: '0 -2px', borderRadius: 6}}>{children}</span>;

// ── 우편함 답장 페이지 ───────────────────────────────────
// 문안은 letters.json 그대로(본문·형광 구절·출처 줄). 한 페이지에는 같은 묶음의 카드만 둔다.
type Letter = {id: string; src: string; text: string; hl: string; more?: string[]; original?: string};
const LETTERS: Record<string, Letter> = Object.fromEntries((letterData.groups as {cards: Letter[]}[]).flatMap((g) => g.cards.map((c) => [c.id, c])));
// 페이지 나눔: 카드 id와 본문 글자 크기. 덱은 letters1…, 영상은 letterKR·letterBR 구간을 고르게 나눠 쓴다.
export const LETTER_PAGES: {ids: string[]; size: number}[] = [{ids:["8413ab57","9ada3f30","c166862c"],size:30},{ids:["0f94f97a","7a120b7b","37f5cc1b"],size:30},{ids:["6f39fde1","0a1cec16","c1232236"],size:30},{ids:["f6c1846d","0166ec8c"],size:34},{ids:["8460243a","bd331bc2"],size:38},{ids:["67543935"],size:34}];
const Marked = ({text, hl, more}: {text: string; hl: string; more?: string[]}) => {
  // 형광 구절은 카드당 하나가 기본이고, 필요한 카드만 more로 더 칠한다.
  const marks = [hl, ...(more ?? [])].filter((m) => !!m && text.includes(m)).sort((x, y) => text.indexOf(x) - text.indexOf(y));
  const out: React.ReactNode[] = []; let pos = 0;
  marks.forEach((m, n) => {const i = text.indexOf(m, pos); if (i < 0) return; out.push(text.slice(pos, i)); out.push(<span key={n} style={{background: mark, borderRadius: 5, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', padding: '1px 0'}}>{m}</span>); pos = i + m.length;});
  out.push(text.slice(pos));
  return <>{out}</>;
};
const LetterPage = ({page, f}: {page: number; f: number}) => {
  const p = LETTER_PAGES[Math.max(0, Math.min(LETTER_PAGES.length - 1, page))], solo = p.ids.length === 1 && !!LETTERS[p.ids[0]].original;
  return (
    <div data-letter-page={page} style={at(50, 0, 1180, 720, {display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14})}>
      {p.ids.map((id, n) => {
        const c = LETTERS[id], on = seg(f, n * 5, n * 5 + 10);
        return (
          <div key={id} data-letter={id} style={{boxSizing: 'border-box', padding: solo ? '34px 46px 28px' : '18px 38px 14px', borderRadius: 24, background: paper, color: ink, boxShadow: '0 8px 24px #12141b55', opacity: on, transform: `translateY(${(1 - on) * 16}px)`}}>
            <div data-letter-text style={{fontSize: p.size, fontWeight: 600, lineHeight: solo ? 1.5 : 1.42, letterSpacing: '-.04em', wordBreak: 'keep-all'}}><Marked text={c.text} hl={c.hl} more={c.more} /></div>
            {c.original && <div data-letter-original style={{fontSize: 21, lineHeight: 1.45, letterSpacing: '-.01em', color: '#8a8478', marginTop: 16}}>{c.original}</div>}
            <div data-letter-src style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: solo ? 16 : 6, fontSize: 21, letterSpacing: '-.03em', color: '#6a6861'}}>
              {c.src}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const END_KEYS = ['friend', 'back', 'countries', 'reach', 'week', 'retention', 'ads', 'cpi', 'usage', 'daily', 'feedback', 'mailbox', 'letterKR', 'letterBR', 'heavy', 'personalEnd', 'handoff'];

export const EndScenes = ({k, f}: {k: string; f: number}) => {
  const stage = (child: React.ReactNode) => (
    <AbsoluteFill data-ending={k} style={{background: navy, color: cream, fontFamily: "TeamPretendard,'Apple SD Gothic Neo',sans-serif", fontWeight: 500, overflow: 'hidden'}}>{child}</AbsoluteFill>
  );

  // 21. 강아지 한 마리 → 강아지가 기억해 둔 작은 쪽지 → 메일 다시 찾기에 줄이 그어진다(이 장의 요점).
  if (k === 'friend' || k === 'back') {
    const done = k === 'back', tNote = when(k, ['방금'], 0.27), tCut = when(k, ['메일'], 0.55);
    const note = done ? 1 : seg(f, tNote, tNote + 14), word = done ? 1 : seg(f, tCut - 10, tCut), cut = done ? 1 : seg(f, tCut, tCut + 14);
    return stage(<>
      <Dog x={mix(490, 96, note)} y={210} size={300} />
      <div style={at(372, 150, 196, 150, {boxSizing: 'border-box', borderRadius: 16, background: gold, color: ink, boxShadow: '0 8px 20px #12141b55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 700, letterSpacing: '-.04em', opacity: note, transform: `translate(${(1 - note) * -40}px, ${(1 - note) * 30}px) rotate(-5deg)`})}>발표 시간</div>
      <Txt x={612} y={292} w={640} size={104} style={{fontWeight: 700, letterSpacing: '-.05em', lineHeight: 1.2, opacity: word, whiteSpace: 'nowrap'}}>
        <span style={{position: 'relative', display: 'inline-block', color: mixInk(cut)}}>메일 다시 찾기<span style={{position: 'absolute', left: -10, top: '52%', height: 10, borderRadius: 5, background: cream, width: `calc(${cut * 100}% + ${cut * 20}px)`}} /></span>
      </Txt>
    </>);
  }

  // 22. 누적 다운로드와 최근 7일 평균 DAU. 두 숫자를 같은 무게로 나란히.
  if (k === 'reach' || k === 'countries') {
    const p = k === 'countries' ? 1 : ease(clamp(f / 22)), sub = k === 'countries' ? 1 : seg(f, 16, 30);
    const stat = (x: number, n: number, label: string) => (
      <>
        <Txt x={x} y={176} w={560} size={156} align="center" color={gold} style={{fontWeight: 700, letterSpacing: '-.05em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'}}>{Math.round(n * p).toLocaleString('en-US')}<span style={{fontSize: 88, marginLeft: 8}}>명</span></Txt>
        <Txt x={x} y={362} w={560} size={46} align="center" style={{fontWeight: 600}}>{label}</Txt>
      </>
    );
    return stage(<>
      {stat(60, 7880, '누적 다운로드')}
      <div style={at(639, 190, 3, 230, {background: rail})} />
      {stat(660, 1922, '7일 평균 DAU')}
      <Txt x={140} y={500} w={1000} size={36} align="center" color={muted} style={{opacity: sub}}>22개 국가·지역에 배포</Txt>
    </>);
  }

  // 23. 처음 쓴 날의 강아지 → 7일 뒤에는? 다음 장의 7일 리텐션으로 이어진다.
  if (k === 'week') {
    // 합본: 이 단계는 실제 속도로 재생한다(deck.tsx HAND week realtime). 예전에 1.6초로 줄여 틀던 속도에 맞춰 구간을 줄였고,
    // 물음표가 뜬 직후(38프레임) 강아지가 한 번 핥고 다시 가만히 있는다.
    const p = seg(f, 4, 30), q = seg(f, 27, 37);
    return stage(<>
      {[0, 1, 2, 3].map((n) => <Img key={n} src={staticFile(`pet/lick-${n}.png`)} style={at(0, 0, 1, 1, {opacity: 0})} />)}
      <Dog x={200 - 110} y={184} size={220} lick={lickAt(f, 38)} />
      <Txt x={1080 - 150} y={160} w={300} size={230} align="center" color={gold} style={{fontWeight: 700, lineHeight: 1.1, opacity: q, transform: `scale(${mix(0.7, 1, q)})`}}>?</Txt>
      <Week y={432} p={p} />
    </>);
  }

  // 24. 7일 뒤 리텐션: 업계 평균 11% 대 스티키펫 28.9%. 오른쪽에 DAU/MAU는 보조로 두었다가 다음 단계에서 밝힌다.
  if (k === 'retention') {
    const g = seg(f, 0, 16), s = seg(f, 14, 36), d = seg(f, 60, 74), base = 500, H = 330;
    return stage(<>
      <div style={at(190, base - (H * 11) / 28.9 * g, 190, (H * 11) / 28.9 * g, {background: '#8F90A3', borderRadius: '16px 16px 0 0'})} />
      <div style={at(450, base - H * s, 190, H * s, {background: gold, borderRadius: '16px 16px 0 0'})} />
      <div style={at(150, base, 530, 4, {background: rail})} />
      <Txt x={135} y={base - (H * 11) / 28.9 - 92} w={300} size={72} align="center" color={muted} style={{fontWeight: 700, opacity: g}}>11%</Txt>
      <Txt x={345} y={base - H - 142} w={400} size={118} align="center" color={gold} style={{fontWeight: 700, letterSpacing: '-.05em', opacity: s}}>28.9%</Txt>
      <Txt x={135} y={base + 20} w={300} size={38} align="center" color={muted} style={{fontWeight: 600}}>업계 평균</Txt>
      <Txt x={395} y={base + 20} w={300} size={38} align="center" style={{fontWeight: 600}}>스티키펫</Txt>
      <Txt x={65} y={base + 88} w={700} size={24} align="center" color={dim} style={{whiteSpace: 'nowrap'}}>7일 뒤 리텐션 · 업계 평균: Adjust 2024 · 안드로이드 중앙값</Txt>
      <div style={at(770, 150, 3, 420, {background: rail})} />
      <div style={{opacity: mix(0.3, 1, d)}}>
        <Txt x={820} y={196} w={400} size={120} style={{fontWeight: 700, letterSpacing: '-.05em', lineHeight: 1.1}}>29.1%</Txt>
        <Txt x={824} y={336} w={400} size={40} style={{fontWeight: 600}}>DAU / MAU</Txt>
        <Txt x={824} y={412} w={400} size={30} color={muted}>20% 좋음 · 25% 뛰어남</Txt>
        <Txt x={824} y={462} w={420} size={22} color={dim}>기준: Business of Apps · AppsFlyer</Txt>
      </div>
    </>);
  }

  // 광고 효율. 광고비 → 광고로 들어온 설치 → 설치 한 건당 비용.
  if (k === 'ads') {
    const a = seg(f, 0, 12), b = seg(f, 22, 34), c = seg(f, 60, 74);
    const item = (o: number, big: boolean, num: string, unit: string, label: string) => (
      <div style={{opacity: o, textAlign: 'center', transform: `translateY(${(1 - o) * 14}px)`}}>
        <div style={{fontSize: big ? 150 : 92, fontWeight: 700, letterSpacing: '-.05em', lineHeight: 1.05, color: big ? gold : cream, whiteSpace: 'nowrap'}}>{num}<span style={{fontSize: big ? 84 : 54, marginLeft: 6}}>{unit}</span></div>
        <div style={{fontSize: 34, letterSpacing: '-.03em', color: muted, marginTop: 14, whiteSpace: 'nowrap'}}>{label}</div>
      </div>
    );
    const arrow = (o: number) => <svg viewBox="0 0 70 60" width="64" height="55" style={{opacity: o, marginBottom: 66, flex: 'none'}}><path d="M6 30h54M40 10l22 20-22 20" fill="none" stroke={rail} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    return stage(
      <div style={at(30, 228, 1220, 240, {display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 34})}>
        {item(a, false, '431', '만 원', '광고비')}{arrow(b)}{item(b, false, '6,915', '건', '광고로 들어온 설치')}{arrow(c)}{item(c, true, '624', '원', '설치 한 건당')}
      </div>
    );
  }

  // 국가별 설치당 비용. 막대는 참고 범위, 점은 스티키펫. 가로축은 로그 눈금.
  if (k === 'cpi') {
    const lx = (v: number) => 340 + (830 * Math.log(v / 100)) / Math.log(60);
    const rows: [string, string, number, number, number][] = [['브라질', '48.9만 원 · 2,431건', 201, 280, 980], ['필리핀', '42.0만 원 · 970건', 433, 140, 630], ['일본', '32.5만 원 · 294건', 1104, 2800, 5600], ['한국', '103.4만 원 · 904건', 1144, 2800, 5600]];
    return stage(<>
      {[100, 300, 1000, 3000].map((v) => (
        <React.Fragment key={v}>
          <div style={at(lx(v) - 1, 112, 2, 468, {background: rail, opacity: 0.45})} />
          <Txt x={lx(v) - 80} y={76} w={160} size={24} align="center" color={dim}>{v.toLocaleString('en-US')}원</Txt>
        </React.Fragment>
      ))}
      {rows.map(([name, sub, v, lo, hi], r) => {
        const y = 178 + r * 116, s = r === 0 ? seg(f, 0, 14) : seg(f, 30 + (r - 1) * 10, 44 + (r - 1) * 10);
        return (
          <React.Fragment key={name}>
            <Txt x={96} y={y - 42} w={230} size={46} style={{fontWeight: 700}}>{name}</Txt>
            <Txt x={98} y={y + 20} w={240} size={23} color={dim}>{sub}</Txt>
            <div style={at(lx(lo), y - 11, lx(hi) - lx(lo), 22, {background: rail, borderRadius: 11})} />
            <Txt x={(lx(lo) + lx(hi)) / 2 - 150} y={y + 18} w={300} size={23} align="center" color={dim}>{lo.toLocaleString('en-US')}~{hi.toLocaleString('en-US')}원</Txt>
            <div style={at(lx(v) - 15, y - 15, 30, 30, {borderRadius: 15, background: gold, boxShadow: `0 0 0 5px ${navy}`, opacity: s, transform: `scale(${mix(0.4, 1, s)})`})} />
            <Txt x={lx(v) - 120} y={y - 70} w={240} size={40} align="center" color={gold} style={{fontWeight: 700, opacity: s}}>{v.toLocaleString('en-US')}원</Txt>
          </React.Fragment>
        );
      })}
      <Foot y={612}>막대: 설치당 참고 범위 · 점: 스티키펫 · 광고비 추정분 포함</Foot>
    </>);
  }

  // 사용 지표. 주간 사용자 3,439 → 4,886, +42.1%.
  if (k === 'usage') {
    const b1 = seg(f, 0, 22), b2 = seg(f, 10, 34), up = seg(f, 30, 44), H = 330, base = 528;
    return stage(<>
      <div style={at(250, base - (H * 3439) / 4886 * b1, 190, (H * 3439) / 4886 * b1, {background: '#8F90A3', borderRadius: '16px 16px 0 0'})} />
      <div style={at(490, base - H * b2, 190, H * b2, {background: cream, borderRadius: '16px 16px 0 0'})} />
      <div style={at(210, base, 510, 4, {background: rail})} />
      <Txt x={195} y={base - (H * 3439) / 4886 - 80} w={300} size={60} align="center" color={muted} style={{fontWeight: 700, opacity: b1}}>3,439</Txt>
      <Txt x={435} y={base - H - 100} w={300} size={80} align="center" style={{fontWeight: 700, opacity: b2}}>4,886</Txt>
      <Txt x={210} y={base + 22} w={510} size={36} align="center" color={muted} style={{fontWeight: 600}}>주간 사용자 (WAU)</Txt>
      <Txt x={760} y={270} w={440} size={136} color={gold} style={{fontWeight: 700, letterSpacing: '-.05em', lineHeight: 1.1, opacity: up, transform: `translateY(${(1 - up) * 16}px)`}}>+42.1%</Txt>
    </>);
  }

  // 매일 사용. 첫 실행일부터 달력 칸이 하루도 빠짐없이 채워진다.
  if (k === 'daily') {
    const num = seg(f, 30, 46);
    return stage(<>
      {Array.from({length: 28}, (_, n) => { const s = seg(f, n * 1.6, n * 1.6 + 8); return <div key={n} style={at(120 + (n % 7) * 76, 196 + Math.floor(n / 7) * 76, 62, 62, {boxSizing: 'border-box', borderRadius: 14, border: `3px solid ${rail}`, background: s > 0.5 ? gold : 'transparent', borderColor: s > 0.5 ? gold : rail})} />; })}
      <Txt x={120} y={512} w={520} size={30} color={muted}>첫 실행일부터 →</Txt>
      <Txt x={700} y={176} w={520} size={190} color={gold} style={{fontWeight: 700, letterSpacing: '-.05em', lineHeight: 1.1, opacity: num}}>12.4%</Txt>
      <Txt x={708} y={400} w={520} size={46} style={{fontWeight: 600, lineHeight: 1.4, opacity: num}}>하루도 빠짐없이 사용</Txt>
    </>);
  }

  // 25. 팀 원본 중간평가 피드백. 배경만 네이비. 의견마다 반영 내용이 하나씩 붙는다.
  if (k === 'feedback') {
    const t1 = when(k, ['중간평가'], 0.23) + 12, t2 = when(k, ['광고'], 0.64) + 12, step = f < t1 ? 0 : f < t2 ? 1 : 2;
    const t = step === 0 ? Math.min(6.5, f / 24) : step === 1 ? Math.min(14.9, 6.6 + (f - t1) / 24) : 15 + (f - t2) / 24;
    return stage(<div data-feedback-step={step} data-feedback-in={Math.min(13, Math.floor(f))} style={at(0, 0, 1280, 720)}><TeamStage view="feedback" t={t} revision /></div>);
  }

  // 26. 우리가 먼저 보낸 편지 한 통 → 돌아온 답장.
  if (k === 'mailbox') {
    // 편지 한 통이 나가고 → 답장 약 440건 → 리뷰·문의까지 합치면 약 540건(봉투 한 줄이 더 붙고 숫자가 올라간다).
    const go = clamp((f - 6) / 40), tBack = when(k, ['답장'], 0.75), tMore = tBack + 62, back = (n: number) => seg(f, tBack + n * 0.8, tBack + n * 0.8 + 10), num = seg(f, tBack + 14, tBack + 30);
    const more = seg(f, tMore, tMore + 24), extra = (n: number) => seg(f, tMore + n * 1.2, tMore + n * 1.2 + 10), count = Math.round(mix(440, 540, more));
    const ex = mix(360, 930, ease(go)), ey = 400 - Math.sin(ease(go) * Math.PI) * 90;
    return stage(<>
      <Dog x={120} y={300} size={230} />
      <svg viewBox="0 0 200 260" style={at(930, 260, 200, 260)}>
        <rect x="88" y="130" width="24" height="126" rx="6" fill={muted} />
        <path d="M20 140V86a60 60 0 01120 0v54z" fill={cream} />
        <rect x="140" y="86" width="44" height="54" rx="6" fill={cream} />
        <rect x="46" y="96" width="70" height="10" rx="5" fill={navy} />
        <rect x="160" y="40" width="10" height="56" rx="4" fill={go >= 1 ? gold : muted} /><rect x="160" y="40" width="34" height="24" rx="4" fill={go >= 1 ? gold : muted} />
      </svg>
      {go > 0 && go < 1 && <Envelope x={ex} y={ey} w={90} />}
      {Array.from({length: 40}, (_, n) => { const b = n < 30 ? back(n) : extra(n - 30), col = n % 10, row = Math.floor(n / 10); return <Envelope key={n} x={mix(930, 392 + col * 52, b)} y={mix(350, 150 + row * 46, b)} w={42} o={b} />; })}
      <Txt x={360} y={346} w={560} size={130} align="center" color={gold} style={{fontWeight: 700, letterSpacing: '-.05em', lineHeight: 1.1, opacity: num, fontVariantNumeric: 'tabular-nums'}}>약 {count}건</Txt>
      <Txt x={360} y={514} w={560} size={34} align="center" color={muted} style={{opacity: num * (1 - seg(f, tMore, tMore + 8))}}>앱 안 우편함으로 받은 답장</Txt>
      <Txt x={360} y={514} w={560} size={34} align="center" color={muted} style={{opacity: seg(f, tMore + 8, tMore + 18)}}>리뷰·문의까지 합치면</Txt>
    </>);
  }

  // 27·28. 우편함 답장 페이지들. 영상에서는 두 구간(letterKR·letterBR)을 이어 붙여 페이지 수만큼 고르게 나눈다.
  if (k.startsWith('letters')) return stage(<LetterPage page={parseInt(k.slice(7), 10) - 1} f={f} />);
  if (k === 'letterKR' || k === 'letterBR') {
    const n1 = live.views.find((x) => x.key === 'letterKR')?.n ?? 170, n2 = live.views.find((x) => x.key === 'letterBR')?.n ?? 170;
    const g = k === 'letterKR' ? f : n1 + f, each = (n1 + n2) / LETTER_PAGES.length, page = Math.min(LETTER_PAGES.length - 1, Math.floor(g / each));
    return stage(<LetterPage page={page} f={g - page * each} />);
  }

  // 29. ADHD를 직접 밝힌 26명 → 사용량 중앙값이 전체 상위 9.4% → 매일 쓰는 비율 57%(전체 16%).
  if (k === 'heavy') {
    const t2 = when(k, ['그분들', '따로'], 0.4), t3 = when(k, ['열두', '상위'], 0.7), in1 = seg(f, 0, 10), s2 = seg(f, t2, t2 + 16), s3 = seg(f, t3, t3 + 16);
    const bx = 590, bw = 610, mx = bx + bw * 0.094, bar = (p: number) => seg(f, t3 + 6, t3 + 30) * p * 5.6;
    return stage(<>
      <div style={at(70, 196, 400, 320, {transformOrigin: '200px 160px', transform: `translate(${mix(370, 0, s2)}px, ${mix(44, 0, s2)}px) scale(${mix(1.85, 1, s2)})`})}>
        {Array.from({length: 26}, (_, n) => (
          <svg key={n} viewBox="0 0 60 80" style={at(5 + (n % 13) * 30, Math.floor(n / 13) * 44, 25, 33, {opacity: seg(f, n * 0.5, n * 0.5 + 8)})}>
            <circle cx="30" cy="20" r="17" fill={muted} /><path d="M4 80v-8a26 26 0 0152 0v8z" fill={muted} />
          </svg>
        ))}
        <Txt x={0} y={96} w={400} size={110} align="center" style={{fontWeight: 700, letterSpacing: '-.05em', lineHeight: 1.1, opacity: in1}}>26명</Txt>
        <Txt x={0} y={228} w={400} size={28} align="center" color={muted} style={{opacity: in1, whiteSpace: 'nowrap'}}>ADHD가 있다고 직접 밝힌 분</Txt>
      </div>
      <div style={{opacity: s2}}>
        <div style={at(500, 150, 3, 400, {background: rail})} />
        <Txt x={bx} y={92} w={bw} size={112} color={s3 > 0.5 ? cream : gold} style={{fontWeight: 700, letterSpacing: '-.05em', lineHeight: 1.1}}>상위 9.4%</Txt>
        <Txt x={bx + 4} y={222} w={bw} size={30} color={muted}>사용량 중앙값</Txt>
        <div style={at(bx, 290, bw, 30, {background: rail, borderRadius: 15})} />
        <div style={at(bx, 290, mx - bx, 30, {background: cream, borderRadius: '15px 0 0 15px'})} />
        <div style={at(mx - 4, 276, 8, 58, {background: s3 > 0.5 ? cream : gold, borderRadius: 4})} />
        <Txt x={bx} y={330} w={120} size={22} color={dim}>상위</Txt>
        <Txt x={bx + bw - 120} y={330} w={120} size={22} align="right" color={dim}>하위</Txt>
      </div>
      <div style={{opacity: s3}}>
        <Txt x={bx + 4} y={388} w={bw} size={30} color={muted}>매일 사용</Txt>
        <Txt x={bx} y={442} w={110} size={30} style={{fontWeight: 600}}>26명</Txt>
        <div style={at(bx + 110, 440, bar(57), 46, {background: gold, borderRadius: 10})} />
        <Txt x={bx + 124 + 57 * 5.6} y={428} w={200} size={56} color={gold} style={{fontWeight: 700, letterSpacing: '-.04em'}}>57%</Txt>
        <Txt x={bx} y={512} w={110} size={30} color={muted} style={{fontWeight: 600}}>전체</Txt>
        <div style={at(bx + 110, 510, bar(16), 46, {background: '#8F90A3', borderRadius: 10})} />
        <Txt x={bx + 124 + 16 * 5.6} y={504} w={200} size={46} color={muted} style={{fontWeight: 700, letterSpacing: '-.04em'}}>16%</Txt>
      </div>
      <Txt x={140} y={600} w={1000} size={22} align="center" color={dim} style={{opacity: s2}}>11월 9~22일 · 하루 평균 사용 점수 · 앱 사용자 6,436명 기준</Txt>
      <Txt x={140} y={632} w={1000} size={22} align="center" color={dim} style={{opacity: s3}}>매일 사용: 설치 3일 이상 사용자 기준</Txt>
    </>);
  }

  // 30. 여기저기 흩어져 있던 메모는 흐려지고, 강아지 곁으로 편지가 모인다.
  if (k === 'personalEnd') {
    const t1 = when(k, ['이제'], 0.25), t2 = when(k, ['우편함'], 0.54), old = seg(f, t1, t1 + 14) * (1 - seg(f, t2 - 30, t2 - 6));
    const far = [[150, 70], [330, 440], [90, 380], [1020, 80], [900, 430], [1100, 300]], near = [[330, 150], [270, 320], [370, 480], [860, 150], [930, 320], [830, 480], [520, 540], [690, 540]];
    return stage(<>
      {far.map(([x, y], n) => <Note key={n} x={x} y={y} s={96} o={0.55 * old} />)}
      {near.map(([x, y], n) => { const b = seg(f, t2 + n * 3, t2 + n * 3 + 16), a = (n / near.length) * Math.PI * 2; return <Envelope key={n} x={mix(x + Math.cos(a) * 260, x, b)} y={mix(y + Math.sin(a) * 200, y, b)} w={96} o={b} />; })}
      <Dog x={510} y={200} size={260} />
    </>);
  }

  // 31. 마이크를 넘기는 장. 이름표와 강아지만.
  return stage(<>
    <Dog x={530} y={150} size={220} />
    <Img src={staticFile('team/sticky-pet-wordmark.png')} style={at(356, 410, 568, 128, {imageRendering: 'pixelated'})} />
  </>);
};
