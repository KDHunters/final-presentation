import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {TeamStage} from './TeamStage';
import live from './livecut.json';

// 4~10번 장면. 말로 한 내용을 글자로 옮기지 않고 그림과 시간 변화로 받친다.
// 조사 수치·Threads 원문·팀 인터뷰 원본은 그대로 두고 배치만 바꾼다.
const navy = '#2B2C43', panel = '#3A3C58', rail = '#53556E', ink = '#392D28', cream = '#FEF8E8';
const muted = '#BBC0D3', dim = '#8F90A3', gold = '#F3D97F', rose = '#FF8C88', memoInk = '#85754c';
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (x: number) => { const c = clamp(x); return c * c * (3 - 2 * c); };
const seg = (f: number, a: number, b: number) => ease((f - a) / (b - a));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const at = (left: number, top: number, width: number | string, height: number | string, s: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left, top, width, height, ...s});

// 장면 안에서 각 박자가 시작하는 프레임. 음성 타이밍(livecut.json)을 그대로 따른다.
type Cue = {from: number; n: number; beat?: number};
const beatStart = (k: string, i: number) => {
  const v = live.views.find((x) => x.key === k);
  if (!v) return 0;
  const c = (live.cues as Cue[]).find((x) => x.from >= v.from && x.from < v.from + v.n && (x.beat ?? 0) === i);
  return c ? c.from - v.from : 0;
};

// 장면 대사에서 낱말이 나오는 프레임(장면 시작 기준). cue 안 글자 비율로 어림한다. end = 낱말이 끝나는 지점.
const wordAt = (k: string, words: string[], end = false, fallback = 0) => {
  const v = live.views.find((x) => x.key === k);
  if (!v) return fallback;
  for (const c of live.cues as (Cue & {text?: string; kind?: string})[]) {
    if (c.kind !== 'say' || !c.text || c.from < v.from || c.from >= v.from + v.n) continue;
    for (const w of words) {
      const at = c.text.indexOf(w);
      if (at >= 0) return c.from - v.from + (c.n * (at + (end ? w.length : 0))) / c.text.length;
    }
  }
  return fallback;
};

const Txt = ({x, y, w, size, children, color, align = 'left', style = {}}: any) => (
  <div style={at(x, y, w, 'auto', {fontSize: size, letterSpacing: '-.035em', color, textAlign: align, lineHeight: 1.35, ...style})}>{children}</div>
);
// 출처·기준일처럼 아래쪽에 작게 두는 줄
const Foot = ({y = 590, children}: any) => <Txt x={140} y={y} w={1000} size={23} color={dim} align="center">{children}</Txt>;

// 휴대폰. 안쪽 화면은 197×408 좌표를 쓴다.
const PW = 215, PH = 426, SW = 197, SH = 408, MEMO = 10;
const Phone = ({x, y, scale = 1, children}: any) => (
  <div style={at(x, y, PW, PH, {transform: `scale(${scale})`, transformOrigin: '0 0', boxSizing: 'border-box', background: '#16151B', borderRadius: 30, padding: 9, boxShadow: '0 8px 24px #12141b55'})}>
    <div style={{position: 'relative', width: SW, height: SH, borderRadius: 22, background: '#FBFBFA', overflow: 'hidden'}}>{children}</div>
  </div>
);
// 홈 화면은 한산하게: 위쪽 다섯 개(0~4)와 아래 독 세 개(9~11)만 둔다. 메모 앱(MEMO)은 독 가운데.
const cell = (n: number) => ({x: 20 + (n % 3) * 58, y: n >= 9 ? 336 : 44 + Math.floor(n / 3) * 72});
const MemoMark = ({x, y, s = 42}: any) => (
  <div style={at(x, y, s, s, {borderRadius: s * 0.26, background: '#F4D980', boxShadow: '0 2px 5px #12141b22'})}>
    {[0.62, 0.42].map((w, j) => <div key={j} style={at(s * 0.19, s * (0.3 + j * 0.24), s * w, s * 0.09, {background: memoInk, borderRadius: 2})} />)}
  </div>
);
const Grid = ({memo = true, ring = -1, fade = 1}: {memo?: boolean; ring?: number; fade?: number}) => (
  <>
    <div style={at(10, 324, SW - 20, 66, {background: '#EEEEEE', borderRadius: 22})} />
    {[0, 1, 2, 3, 4, 9, 10, 11].map((n) => {
      const p = cell(n);
      return n === MEMO && memo ? <MemoMark key={n} x={p.x} y={p.y} /> : <div key={n} style={at(p.x, p.y, 42, 42, {background: ['#D2B8A1', '#A4B8B1', '#D5CE9D', '#C9B7C6'][n % 4], borderRadius: 11, opacity: fade})} />;
    })}
    {ring >= 0 && <div style={at(cell(ring).x - 7, cell(ring).y - 7, 56, 56, {boxSizing: 'border-box', border: '4px solid #E0843A', borderRadius: 17})} />}
  </>
);
// 메모 앱 화면. p 0 = 아이콘 크기, 1 = 화면 가득. written = 적힌 정도.
const Page = ({p, written = 0, cursor = false, f = 0}: {p: number; written?: number; cursor?: boolean; f?: number}) => {
  if (p <= 0) return null;
  const c = cell(MEMO);
  return (
    <div style={at(mix(c.x, 0, p), mix(c.y, 0, p), mix(42, SW, p), mix(42, SH, p), {background: '#FFFDF4', borderRadius: mix(11, 0, p), overflow: 'hidden', opacity: clamp(p * 5)})}>
      <div style={at(0, 0, SW, 44, {background: '#F4D980'})} />
      <div style={{opacity: seg(p, 0.6, 1)}}>
        {[0.8, 0.56, 0.7].map((w, j) => <div key={j} style={at(22, 78 + j * 32, 150 * w * clamp(written * 3 - j), 9, {background: memoInk, borderRadius: 4.5})} />)}
        {cursor && <div style={at(22, 70, 3, 26, {background: ink, opacity: Math.floor(f / 12) % 2 ? 0.15 : 1})} />}
      </div>
    </div>
  );
};

// 강아지. 짖는 동작은 두 번씩 두 묶음(t 0~55, 80~135)만 돌고 그 밖에는 가만히 앉아 있다.
const Dog = ({t, x, y, size}: any) => {
  const u = t >= 0 && t < 56 ? t : t >= 80 && t < 136 ? t - 80 : -1;
  return <Img src={staticFile(u < 0 ? 'pet/idle-0.png' : `pet/mailalert-${Math.floor(u / 7) % 4}.png`)} style={at(x, y, size, size, {imageRendering: 'pixelated', objectFit: 'contain'})} />;
};
// 생각 풍선 모양(현석님이 준 구름 그림에서 딴 외곽선, 512×512 좌표). 다듬지 않고 그대로 쓴다.
const CLOUD_PATH = 'M339.0 7.5L341.0 7.3L343.0 7.1L345.0 7.0L347.0 7.0L349.0 7.0L351.0 7.0L353.0 7.1L355.0 7.3L357.0 7.4L359.0 7.7L361.0 7.9L363.0 8.2L365.0 8.5L367.0 8.8L369.0 9.1L371.0 9.5L373.0 9.9L374.9 10.4L376.7 10.8L378.5 11.3L380.2 11.7L381.8 12.1L383.5 12.5L385.1 13.0L386.7 13.6L388.2 14.1L389.8 14.8L391.3 15.4L392.9 16.1L394.4 16.9L395.9 17.6L397.4 18.5L398.8 19.3L400.2 20.2L401.6 21.2L403.0 22.1L404.3 23.1L405.6 24.2L407.0 25.3L408.3 26.5L409.8 27.9L411.4 29.3L413.2 30.9L415.0 32.6L416.9 34.4L418.7 36.2L420.5 38.1L422.3 40.0L424.0 42.0L425.6 44.0L427.2 46.0L428.7 48.0L430.1 50.0L431.4 52.0L432.7 54.0L433.9 56.0L435.1 58.0L436.2 60.0L437.2 62.0L438.2 64.0L439.1 66.0L440.0 68.0L440.8 70.0L441.5 72.0L442.2 74.0L442.9 76.0L443.6 78.0L444.4 79.8L445.5 81.5L446.7 83.0L448.3 84.2L450.1 85.2L452.0 86.0L454.0 86.8L456.0 87.5L458.0 88.4L460.0 89.3L462.0 90.3L464.0 91.3L466.0 92.4L468.0 93.5L470.0 94.8L472.0 96.0L474.0 97.4L476.0 98.9L478.0 100.4L480.0 102.0L482.0 103.6L483.9 105.4L485.7 107.2L487.5 109.1L489.2 111.0L490.9 113.0L492.5 115.0L494.0 117.0L495.5 119.0L496.8 121.0L498.1 123.0L499.2 125.0L500.3 127.0L501.4 129.0L502.3 131.0L503.2 133.0L504.1 135.0L504.9 137.0L505.6 139.0L506.3 141.0L506.9 143.0L507.5 145.0L508.1 147.0L508.6 149.0L509.0 151.0L509.5 153.0L509.8 155.0L510.1 157.0L510.4 159.0L510.7 161.0L510.8 163.0L510.9 165.0L511.0 167.0L511.0 169.0L511.0 171.0L510.9 173.0L510.7 175.0L510.5 177.0L510.3 179.0L510.0 181.0L509.7 183.0L509.3 185.0L509.0 187.0L508.5 189.0L508.0 191.0L507.5 193.0L506.9 195.0L506.2 197.0L505.5 199.0L504.8 201.0L504.0 203.0L503.1 205.0L502.2 207.0L501.2 209.0L500.2 211.0L499.0 213.0L497.9 215.0L496.6 217.0L495.2 219.0L493.8 221.0L492.2 223.0L490.6 225.0L488.8 227.0L486.9 229.0L485.0 231.0L483.0 232.9L481.0 234.8L479.1 236.7L477.4 238.4L476.0 240.3L475.0 242.1L474.4 244.0L474.1 246.0L474.0 248.0L474.0 250.0L473.9 252.0L473.8 254.0L473.6 256.0L473.4 258.0L473.1 260.0L472.7 262.0L472.3 264.0L471.9 266.0L471.5 268.0L470.9 270.0L470.2 272.0L469.5 274.0L468.7 276.0L467.8 278.0L466.8 280.0L465.8 282.0L464.7 284.0L463.5 286.0L462.2 288.0L460.8 290.0L459.3 292.0L457.7 294.0L455.9 296.0L454.0 298.0L452.0 299.9L450.0 301.7L448.0 303.4L446.0 305.0L444.0 306.5L442.0 307.8L440.0 309.0L438.0 310.2L436.0 311.2L434.0 312.2L432.0 313.0L430.0 313.9L428.0 314.6L426.0 315.3L424.0 315.9L422.0 316.5L420.0 316.9L418.0 317.3L416.0 317.7L414.0 318.0L412.0 318.3L410.0 318.5L408.0 318.7L406.0 318.8L404.0 318.8L402.0 318.7L400.0 318.5L398.0 318.3L396.0 318.0L394.1 318.0L392.3 318.1L390.6 318.7L389.1 319.8L387.8 321.3L386.5 323.0L385.2 325.0L383.9 327.0L382.5 329.0L381.0 331.0L379.4 333.0L377.7 335.0L375.9 337.0L374.0 339.0L372.0 341.0L370.0 342.9L368.0 344.8L366.0 346.6L364.0 348.2L362.0 349.7L360.0 351.1L358.0 352.4L356.0 353.7L354.0 354.9L352.0 356.0L350.0 357.1L348.0 358.1L346.0 359.1L344.0 360.0L342.0 360.8L340.0 361.5L338.0 362.3L336.0 363.0L334.0 363.6L332.0 364.2L330.0 364.8L328.0 365.3L326.0 365.7L324.0 366.1L322.0 366.4L320.0 366.7L318.0 366.9L316.0 367.2L314.0 367.4L312.0 367.7L310.0 367.8L308.0 367.9L306.0 367.9L304.0 367.8L302.0 367.7L300.0 367.4L298.0 367.2L296.0 367.0L294.0 366.8L292.0 366.5L290.0 366.1L288.0 365.8L286.0 365.3L284.0 364.8L282.0 364.2L280.0 363.6L278.0 363.0L276.0 362.3L274.0 361.5L272.0 360.8L270.0 360.0L268.0 359.1L266.0 358.1L264.0 357.1L262.0 356.0L260.0 354.9L258.0 353.6L256.0 352.3L254.0 350.9L252.0 349.5L250.0 348.0L248.0 346.4L246.0 344.8L244.0 343.2L242.0 342.0L240.0 341.4L238.0 341.4L236.0 342.0L234.0 343.0L232.0 344.1L230.0 345.4L228.0 346.5L226.0 347.6L224.0 348.7L222.0 349.6L220.0 350.5L218.0 351.3L216.0 352.0L214.0 352.8L212.0 353.4L210.0 354.1L208.0 354.7L206.0 355.2L204.0 355.7L202.0 356.1L200.0 356.6L198.0 356.9L196.0 357.2L194.0 357.5L192.0 357.7L190.0 357.9L188.0 358.0L186.0 358.0L184.0 358.0L182.0 358.0L180.0 358.0L178.0 358.0L176.0 357.9L174.0 357.7L172.0 357.5L170.0 357.2L168.0 356.9L166.0 356.5L164.0 356.1L162.0 355.6L160.0 355.1L158.0 354.5L156.0 353.9L154.0 353.3L152.0 352.6L150.0 351.9L148.0 351.1L146.0 350.3L144.0 349.4L142.0 348.4L140.0 347.4L138.0 346.3L136.0 345.1L134.0 343.9L132.0 342.6L130.0 341.2L128.0 339.8L126.0 338.3L124.0 336.7L122.0 335.1L120.1 333.4L118.3 331.6L116.5 329.8L114.7 327.9L113.0 326.0L111.3 324.0L109.8 322.0L108.2 320.0L106.8 318.0L105.4 316.0L104.1 314.0L103.0 312.0L101.8 310.0L100.8 308.0L99.8 306.0L98.8 304.0L97.8 302.0L96.9 300.0L95.8 298.2L94.7 296.5L93.3 295.1L91.7 294.1L89.9 293.5L88.0 293.1L86.0 292.9L84.0 292.6L82.0 292.3L80.0 292.0L78.0 291.6L76.0 291.2L74.0 290.7L72.0 290.2L70.0 289.6L68.0 289.0L66.0 288.3L64.0 287.6L62.0 286.9L60.0 286.1L58.0 285.2L56.0 284.3L54.0 283.3L52.0 282.3L50.0 281.2L48.0 280.1L46.0 278.9L44.0 277.6L42.0 276.3L40.0 274.9L38.0 273.4L36.0 271.9L34.0 270.2L32.0 268.5L30.0 266.7L28.1 264.9L26.3 263.0L24.5 261.0L22.9 259.0L21.2 257.0L19.7 255.0L18.2 253.0L16.8 251.0L15.5 249.0L14.3 247.1L13.2 245.2L12.1 243.4L11.2 241.8L10.3 240.3L9.4 238.8L8.6 237.3L7.9 235.8L7.1 234.3L6.4 232.8L5.7 231.3L5.1 229.7L4.5 228.2L4.0 226.6L3.5 225.0L3.0 223.4L2.6 221.8L2.2 220.2L1.9 218.5L1.6 216.9L1.4 215.2L1.1 213.5L0.9 211.7L0.7 209.9L0.5 208.0L0.3 206.0L0.1 204.0L0.0 202.0L0.0 200.0L0.0 198.0L0.0 196.0L0.0 194.0L0.1 192.0L0.3 190.0L0.4 188.0L0.7 186.0L0.9 184.0L1.2 182.0L1.5 180.0L1.9 178.0L2.2 176.0L2.7 174.0L3.2 172.0L3.8 170.0L4.4 168.0L5.0 166.0L5.7 164.0L6.4 162.0L7.1 160.0L8.0 158.0L8.8 156.0L9.8 154.0L10.8 152.0L11.8 150.0L13.0 148.0L14.1 146.0L15.4 144.0L16.7 142.0L18.1 140.0L19.5 138.0L21.0 136.0L22.6 134.0L24.3 132.0L26.1 130.0L28.0 128.0L30.0 126.1L32.0 124.2L34.0 122.4L36.0 120.8L38.0 119.2L40.0 117.8L42.0 116.4L44.0 115.0L45.9 113.6L47.6 112.1L49.2 110.5L50.4 108.8L51.3 106.9L52.1 105.0L52.8 103.0L53.4 101.0L54.0 99.0L54.8 97.0L55.5 95.0L56.4 93.0L57.3 91.0L58.3 89.0L59.4 87.0L60.5 85.0L61.7 83.0L62.9 81.0L64.3 79.0L65.8 77.0L67.4 75.0L69.2 73.0L71.1 71.0L73.0 69.0L75.0 67.1L77.0 65.3L79.0 63.6L81.0 62.0L83.0 60.5L85.0 59.2L87.0 57.9L89.0 56.8L91.0 55.7L93.0 54.6L95.0 53.7L97.0 52.8L99.0 51.9L101.0 51.1L103.0 50.4L105.0 49.8L107.0 49.2L109.0 48.7L111.0 48.2L113.0 47.9L115.0 47.5L117.0 47.3L119.0 47.1L121.0 46.9L123.0 46.8L125.0 46.7L127.0 46.6L129.0 46.6L131.0 46.7L133.0 46.8L135.0 47.0L137.0 47.2L139.0 47.4L141.0 47.7L143.0 48.0L145.0 48.5L147.0 49.0L149.0 49.5L151.0 50.1L153.0 50.8L155.0 51.5L157.0 52.2L159.0 52.7L160.8 53.0L162.6 52.7L164.2 51.9L165.6 50.6L167.0 48.9L168.2 47.0L169.5 45.0L170.9 43.0L172.3 41.0L173.9 39.0L175.5 37.0L177.3 35.0L179.1 33.0L181.0 31.1L183.0 29.3L185.0 27.6L187.0 26.0L189.0 24.5L191.0 23.1L193.0 21.8L195.0 20.5L197.0 19.4L199.0 18.3L201.0 17.3L203.0 16.4L205.0 15.5L207.0 14.7L209.0 13.9L211.0 13.2L213.0 12.6L215.0 12.0L217.0 11.5L219.0 11.1L221.0 10.7L223.0 10.4L225.0 10.2L227.0 10.0L229.0 9.8L231.0 9.7L233.0 9.5L235.0 9.4L237.0 9.5L239.0 9.6L241.0 9.8L243.0 10.0L245.0 10.2L247.0 10.4L249.0 10.8L251.0 11.2L253.0 11.7L255.0 12.2L257.0 12.8L259.0 13.4L261.0 14.0L263.0 14.8L265.0 15.5L267.0 16.4L269.0 17.3L271.0 18.3L273.0 19.4L275.0 20.5L277.0 21.8L279.0 23.1L281.0 24.4L283.0 25.5L285.0 26.2L287.0 26.3L289.0 25.8L291.0 25.0L293.0 23.8L295.0 22.5L297.0 21.2L299.0 20.0L301.0 18.9L303.0 17.9L305.0 16.9L307.0 15.9L309.0 15.0L311.0 14.2L313.0 13.5L315.0 12.8L317.0 12.1L319.0 11.5L321.0 10.9L323.0 10.4L325.0 9.9L327.0 9.4L329.0 9.0L331.0 8.7L333.0 8.3L335.0 8.0L337.0 7.7Z';
// 생각하는 사람. 머리에서 방울 두 개로 이어진 생각 풍선. note = 풍선 속 메모가 선명한 정도, say = 풍선 속 글자.
const Thinker = ({show = 1, cloud = 1, note = 0, say = '', sayOn = 0}: {show?: number; cloud?: number; note?: number; say?: string; sayOn?: number}) => (
  <>
    <svg viewBox="0 0 1280 720" style={at(0, 8, 1280, 720)}>
      <g fill={muted}>
        <circle cx="285" cy="462" r="64" />
        <path d="M150 640v-22a135 86 0 01270 0v22z" />
      </g>
      <g fill={navy}><circle cx="304" cy="452" r="7" /><circle cx="333" cy="452" r="7" /></g>
      <g fill={cream} opacity={show * cloud}>
        <g transform="translate(283 0) scale(0.754)"><circle cx="103" cy="404" r="43.2" /><circle cx="30.8" cy="474.1" r="31.1" /></g>
        <g transform={`translate(476 141) scale(${mix(0.8, 1, show)}) translate(-476 -141) translate(283 0) scale(0.754)`}><path d={CLOUD_PATH} /></g>
      </g>
      <g opacity={show * clamp(note)}>
        <rect x="401" y="61" width="150" height="160" rx="16" fill={gold} />
        {[100, 70, 86].map((w, j) => <rect key={j} x="425" y={97 + j * 36} width={w} height="13" rx="6.5" fill={memoInk} />)}
      </g>
    </svg>
    {say && <div style={at(256, 92, 440, 110, {textAlign: 'center', whiteSpace: 'nowrap', fontSize: say.length > 6 ? 64 : 72, lineHeight: '110px', letterSpacing: '-.05em', fontWeight: 700, color: ink, opacity: sayOn})}>{say}</div>}
  </>
);
// 10번용 세로 폰(약 9:19.5). 바깥 284×612, 안쪽 화면은 TW×TH 좌표. 0·1·4박자에서 같은 자리에 둔다.
// 홈 화면은 한산하게: 위 한 줄 네 개 + 둘째 줄 두 개(0~5), 아래 독 네 개(6~9).
const TW = 262, TH = 590;
const tcell = (n: number) => (n >= 6 ? {x: 21 + (n - 6) * 58, y: 514} : {x: 21 + (n % 4) * 58, y: 44 + Math.floor(n / 4) * 86});
const TallPhone = ({x = 498, skip = -1, children}: any) => (
  <div style={at(x, 34, TW + 22, TH + 22, {boxSizing: 'border-box', background: '#16151B', borderRadius: 46, padding: 11, boxShadow: '0 8px 24px #12141b55'})}>
    <div style={{position: 'relative', width: TW, height: TH, borderRadius: 36, background: '#FBFBFA', overflow: 'hidden'}}>
      <div style={at(11, 500, TW - 22, 74, {background: '#EEEEEE', borderRadius: 26})} />
      {Array.from({length: 10}, (_, n) => n === skip ? null : <div key={n} style={at(tcell(n).x, tcell(n).y, 46, 46, {background: ['#D2B8A1', '#A4B8B1', '#D5CE9D', '#C9B7C6'][(n + (n >= 6 ? 1 : 0)) % 4], borderRadius: 13})} />)}
      {children}
    </div>
  </div>
);
// 포스트잇 모양 메모. 제목 한 줄, 체크박스 줄 셋, 접힌 모서리. 크기가 달라도 같은 생김새로 줄어든다.
const Memo = ({x, y, w, h, style = {}, children}: any) => {
  const u = w / 100, c = 17 * u;
  return (
    <div style={at(x, y, w, h, {filter: 'drop-shadow(0 5px 9px #12141b66)', ...style})}>
      <div style={at(0, 0, w, h, {background: '#F4D980', borderRadius: 3 * u, clipPath: `polygon(0 0, 100% 0, 100% ${h - c}px, ${w - c}px 100%, 0 100%)`})}>
        <div style={at(10 * u, 7 * u, 70 * u, 'auto', {fontSize: 15 * u, lineHeight: 1.3, fontWeight: 700, letterSpacing: '-.03em', color: ink})}>할 일</div>
        {[58, 40, 50].map((len, j) => {
          const top = h * 0.38 + j * h * 0.19;
          return (
            <React.Fragment key={j}>
              <div style={at(10 * u, top, 10 * u, 10 * u, {boxSizing: 'border-box', border: `${1.7 * u}px solid ${memoInk}`, borderRadius: 2 * u})} />
              <div style={at(27 * u, top + 3 * u, len * u, 4 * u, {background: memoInk, borderRadius: 2 * u})} />
            </React.Fragment>
          );
        })}
        <div style={at(w - c, h - c, c, c, {background: '#CDB25A', clipPath: 'polygon(0 0, 100% 0, 0 100%)'})} />
      </div>
      {children}
    </div>
  );
};

const Desk = ({cx, work, o = 1}: {cx: number; work: number; o?: number}) => (
  <g transform={`translate(${cx} 0)`} opacity={o}>
    <circle cx="0" cy="60" r="28" fill={cream} />
    <path d="M-52 170v-35a52 52 0 01104 0v35z" fill={cream} />
    <rect x="-84" y="175" width="168" height="10" rx="5" fill={cream} />
    <rect x="-36" y="116" width="72" height="54" rx="6" fill={work > 0.02 ? gold : '#8F90A3'} />
    {[50, 34, 44].map((w, j) => <rect key={j} x="-26" y={128 + j * 13} width={w * clamp(work * 3 - j)} height="5" rx="2.5" fill={memoInk} />)}
  </g>
);

export const OpeningScenes = ({k, i, f}: {k: string; i: number; f: number; phase?: number; post?: boolean}) => {
  const stage = (child: React.ReactNode) => (
    <AbsoluteFill data-opening={k + ':' + i} style={{background: navy, color: cream, fontFamily: "TeamPretendard,'Apple SD Gothic Neo',sans-serif", overflow: 'hidden'}}>{child}</AbsoluteFill>
  );
  // b(n): n번 박자가 시작한 뒤 지난 프레임. 아직이면 음수.
  const b = (n: number) => f - beatStart(k, n);

  // 인터뷰 뒤 한 문장. 메모 예시는 이 구간에 넣지 않는다.
  if (k === 'flash') return stage(
    <div style={at(0, 0, 1280, 720, {display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20})}>
      <div style={{fontSize: 124, fontWeight: 700, letterSpacing: '-.035em', lineHeight: 1}}>작업 기억</div>
      <svg viewBox="0 0 80 68" width="80" height="68"><path d="M8 8h64L40 60z" fill={cream} stroke={cream} strokeWidth="10" strokeLinejoin="round" /></svg>
    </div>
  );

  // 5. 결제 알림을 보고 떠올림 → ADHD Tax → 설문 결과.
  if (k === 'tax') {
    if (i === 2) {
      const p = seg(b(2), 4, 40);
      return stage(<>
        <Txt x={148} y={150} w={980} size={78}>월 10만 원 이상</Txt>
        <div style={at(148, 318, 984, 40, {background: rail, borderRadius: 20, overflow: 'hidden'})}><div style={{width: 57.1 * p + '%', height: '100%', background: rose, borderRadius: 20}} /></div>
        <Txt x={148} y={388} w={900} size={48} color={rose} style={{opacity: seg(b(2), 26, 42)}}>응답자의 57.1%</Txt>
        <Foot>팀 설문 결과</Foot>
      </>);
    }
    // 0박자: 놓친 일의 알림 두 장이 차례로 쌓이고, 그걸 본 사람 머리 위로 생각 풍선이 올라온다.
    // 1박자: 풍선이 꺼지고 알림 아래에 용어만 남는다. 사람과 알림은 자리를 지켜 컷이 튀지 않는다.
    const t = b(1), drop = (a0: number) => (i === 0 ? seg(f, a0, a0 + 9) : 1), up = i === 0 ? 0 : seg(t, 0, 14);
    const pop = (a0: number) => (i === 0 ? seg(f, a0, a0 + 7) : 1 - seg(t, 0, 8));
    const cloud = i === 0 ? seg(f, 36, 48) : 1 - seg(t, 0, 9);
    const cardY = mix(196, 122, up);
    const alerts: [string, string, number][] = [['결제 알림', '구독 요금 결제 완료', 0], ['마감 알림', '지원서 접수 마감', 12]];
    return stage(<>
      <svg viewBox="0 0 1280 720" style={at(0, 0, 1280, 720)}>
        <g fill={muted}>
          <circle cx="285" cy="462" r="64" />
          <path d="M150 640v-22a135 86 0 01270 0v22z" />
        </g>
        <g fill={navy}><circle cx="304" cy="452" r="7" /><circle cx="333" cy="452" r="7" /></g>
        <g fill={cream}>
          <circle cx="290" cy="377" r={12 * pop(24)} />
          <circle cx="306" cy="338" r={21 * pop(30)} />
          <g opacity={cloud} transform={`translate(345 172) scale(${mix(0.8, 1, cloud)})`}>
            <ellipse cx="0" cy="0" rx="222" ry="92" />
            {[[-160, -52, 62], [-55, -78, 70], [70, -74, 72], [168, -38, 60], [172, 46, 58], [70, 76, 66], [-60, 80, 64], [-166, 44, 60]].map(([x, y, r], n) => <circle key={n} cx={x} cy={y} r={r} />)}
          </g>
        </g>
      </svg>
      <div style={at(125, 112, 440, 120, {textAlign: 'center', fontSize: 96, lineHeight: '120px', letterSpacing: '-.04em', fontWeight: 700, color: ink, opacity: cloud, transform: `scale(${mix(0.8, 1, cloud)})`})}>아, 맞다!</div>
      {alerts.map(([label, text, a0], n) => (
        <div key={n} style={at(620, cardY + n * 176, 580, 152, {boxSizing: 'border-box', padding: '24px 40px', borderRadius: 32, background: '#fff', color: ink, boxShadow: '0 14px 36px #12141b55', opacity: drop(a0), transform: `translateY(${(1 - drop(a0)) * -50}px)`})}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, letterSpacing: '-.03em', color: '#6a6861'}}><div style={{width: 18, height: 18, borderRadius: 9, background: rose}} />{label}</div>
          <div style={{fontSize: 56, fontWeight: 700, marginTop: 4, lineHeight: 1.25, letterSpacing: '-.045em', whiteSpace: 'nowrap'}}>{text}</div>
        </div>
      ))}
      {i === 1 && <Txt x={620} y={474} w={580} size={96} color={gold} align="center" style={{fontWeight: 700, opacity: seg(t, 8, 20), transform: `translateY(${(1 - seg(t, 8, 20)) * 16}px)`}}>ADHD Tax</Txt>}
    </>);
  }

  // 6. Threads 원문 캡처를 그대로 보여 준다. 작성자·날짜·반응은 캡처 안에 있다.
  if (k === 'question') return stage(
    // 형광펜 위치는 캡처 원본(1178x514)에서 잰 글자 좌표다. 곱하기 혼합이라 글자는 그대로 보인다.
    <div style={at(70, 111, 1140, 'auto', {borderRadius: 22, overflow: 'hidden', boxShadow: '0 12px 34px #12141b66', opacity: seg(f, 0, 8), lineHeight: 0})}>
      <Img src={staticFile('team/threads-swan-post.png')} style={{width: '100%', display: 'block'}} />
      {[[381, 146, 406, 33, 12], [142, 314, 322, 33, 20]].map(([x, y, w, h, t]) => (
        <div key={y} style={{position: 'absolute', left: (x / 1178) * 100 + '%', top: (y / 514) * 100 + '%', width: (w / 1178) * 100 + '%', height: (h / 514) * 100 + '%', background: '#FFE14D', mixBlendMode: 'multiply', borderRadius: 4, transformOrigin: 'left center', transform: `scaleX(${seg(f, t, t + 10)})`}} />
      ))}
    </div>
  );

  // 7. 적을 게 떠오른다 → 메모 앱을 찾는 동안 흐려진다 → 앱이 열렸을 때는 비어 있다.
  if (k === 'lost') {
    // 메모 앱 아이콘은 한 자리에 그대로 있고, 3박자에서 딱 한 번 열린다. 그 사이 풍선 속 메모만 흐려진다.
    // 풍선이 생기는 모션은 이 장면 맨 처음 한 번뿐이다. 그 뒤로 풍선은 그대로 있고 안의 내용만 바뀐다(8번까지).
    const hunt = b(1), open = b(2), huntLen = beatStart(k, 2) - beatStart(k, 1) || 117;
    const note = i === 0 ? 1 : i === 1 ? mix(1, 0.3, clamp(hunt / huntLen)) : mix(0.3, 0, seg(open, 0, 16));
    return stage(<>
      <Thinker show={i === 0 ? seg(f, 0, 10) : 1} note={note} say={i === 2 ? '뭐였더라?' : ''} sayOn={seg(open, 14, 28)} />
      <Phone x={770} y={42} scale={1.4}>
        <Grid />
        {i === 2 && <Page p={seg(open, 2, 20)} cursor f={f} />}
      </Phone>
    </>);
  }

  // 8. 적어 뒀다 → 앱을 닫으니 어디 뒀는지 모른다 → 인터뷰 원본.
  if (k === 'forgot') {
    if (i >= 2) return stage(<>
      <TeamStage view="forgot" t={Math.max(0, b(2)) / 24} revision />
      <Txt x={240} y={590} w={800} size={36} color={muted} align="center">팀 설문 조사</Txt>
    </>);
    const c = b(1), closed = i === 1;
    return stage(<>
      <Thinker show={1} note={closed ? 1 - seg(c, 22, 40) : 1} say="어디 뒀더라?" sayOn={closed ? seg(c, 40, 54) : 0} />
      <Phone x={770} y={42} scale={1.4}>
        <Grid />
        <Page p={closed ? 1 - seg(c, 2, 22) : 1} written={seg(f, 6, 54)} />
        {closed && <div style={at(0, 0, SW, SH, {background: '#1B1C2E', opacity: 0.4 * seg(c, 24, 44)})} />}
      </Phone>
    </>);
  }

  // 9. 앱 안에 있던 메모가 화면 앞으로 나온다.
  if (k === 'visible') {
    // 첫 줄만 보이다가 '잊는데,'가 끝나면 화살표, '항상'이 시작되면 둘째 줄. 세 요소는 처음부터 제자리라 첫 줄이 움직이지 않는다.
    // 메모 아이콘 하나가 제자리에서 커져 화면 앞으로 나온다. 같은 조각이 움직이므로 메모가 둘로 보이지 않는다.
    const tArrow = wordAt(k, ['잊는데,', '잊는데'], true, 100), tLine = Math.max(tArrow + 6, wordAt(k, ['항상', '처음부터'], false, tArrow + 6));
    const arrow = seg(f, tArrow, tArrow + 8), line = seg(f, tLine, tLine + 12), out = seg(f, tLine, tLine + 32), m = tcell(5);
    return stage(<>
      <Txt x={84} y={222} w={840} size={66} style={{fontWeight: 600}}>눈앞에 없으면 잊는데,</Txt>
      <svg viewBox="0 0 60 68" style={at(322, 331, 60, 68, {opacity: arrow, transform: `translateY(${(1 - arrow) * -14}px)`})}><path d="M30 6v54M8 38l22 24 22-24" fill="none" stroke={cream} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <Txt x={84} y={410} w={840} size={66} color={gold} style={{fontWeight: 600, opacity: line}}>항상 눈앞에 있다면?</Txt>
      <TallPhone x={930} skip={5}>
        <MemoMark x={mix(m.x, 36, out)} y={mix(m.y, 200, out)} s={mix(46, 190, out)} />
      </TallPhone>
    </>);
  }

  // 10. 화면을 덮는 메모장 → 곁에 있는 사람 → 작은 강아지 → 두 원칙.
  if (i <= 1) {
    // 메모는 포스트잇 비율 그대로 폰 화면 가운데를 가린다. 위로 아이콘 줄, 아래로 독이 보인다.
    const t1 = b(1), off = i === 0 ? seg(f, 66, 96) : 1, small = i === 1 ? seg(t1, 8, 34) : 0, tap = i === 0 ? clamp((f - 54) / 14) : 0;
    return stage(<TallPhone>
      {i === 0 && <Memo x={12} y={150} w={238} h={270} style={{opacity: seg(f, 0, 10) * (1 - off), transform: `translateY(${off * 300}px) scale(${mix(0.94, 1, seg(f, 0, 10))})`}}>
        <div style={at(196, 12, 30, 30, {borderRadius: 15, background: memoInk, color: '#F4D980', fontSize: 25, lineHeight: '28px', textAlign: 'center', fontWeight: 700})}>×</div>
        {tap > 0 && tap < 1 && <div style={at(211 - 38 * tap, 27 - 38 * tap, 76 * tap, 76 * tap, {boxSizing: 'border-box', borderRadius: '50%', border: '5px solid #E0843A', opacity: 1 - tap})} />}
      </Memo>}
      {small > 0 && <Memo x={mix(12, 160, small)} y={mix(150, 388, small)} w={mix(238, 88, small)} h={mix(270, 100, small)} style={{opacity: clamp(small * 3)}} />}
    </TallPhone>);
  }
  if (i <= 3) {
    const t = i === 2 ? b(2) : 999, up = i === 3 ? seg(b(3), 0, 14) : 0, word = seg(b(3), 6, 18);
    return stage(<>
      <svg viewBox="0 28 372 161" style={at(90, 122, 1100, 476, {transform: `translateY(${34 * up}px) scale(${mix(1, 0.52, up)})`, transformOrigin: '50% 0'})}>
        <Desk cx={86} work={seg(t, 40, 76)} />
        <Desk cx={286} work={1} o={seg(t, 8, 30)} />
      </svg>
      {i === 3 && <Txt x={40} y={428} w={1200} size={124} align="center" color={gold} style={{fontWeight: 700, opacity: word, lineHeight: 1.2}}>바디 더블링</Txt>}
    </>);
  }
  if (i === 4) {
    const t4 = b(4), pop = seg(t4, 96, 112), tap = clamp((t4 - 80) / 16);
    return stage(<TallPhone>
      <Memo x={14} y={166} w={190} h={214} style={{opacity: pop, transform: `scale(${mix(0.2, 1, pop)})`, transformOrigin: '100% 100%'}} />
      {tap > 0 && tap < 1 && <div style={at(206 - 78 * tap, 452 - 78 * tap, 156 * tap, 156 * tap, {boxSizing: 'border-box', borderRadius: '50%', border: '6px solid #E0843A', opacity: 1 - tap})} />}
      <Dog x={144} y={388} size={124} t={t4} />
    </TallPhone>);
  }
  // 5·6박자: 두 원칙만. 6박자에서도 화면은 그대로 둔다.
  const t5 = i === 5 ? b(5) : 999;
  const Num = ({n}: {n: number}) => <div style={{flex: '0 0 92px', height: 92, borderRadius: 46, background: gold, color: navy, fontSize: 60, fontWeight: 700, lineHeight: '92px', textAlign: 'center', marginTop: 4}}>{n}</div>;
  const row: React.CSSProperties = {display: 'flex', gap: 32, fontSize: 76, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-.04em', whiteSpace: 'nowrap'};
  return stage(
    <div style={at(0, 0, 1280, 720, {display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
      <div>
        <div style={{...row, opacity: seg(t5, 0, 10)}}><Num n={1} /><div>눈앞에 있어야 한다</div></div>
        <div style={{...row, marginTop: 44, opacity: seg(t5, 12, 24)}}><Num n={2} /><div>최대한 단순하게 느껴져야 한다</div></div>
      </div>
    </div>
  );
};
