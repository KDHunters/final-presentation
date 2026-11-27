import React from 'react';
import {Img, staticFile} from 'remotion';

const BROWN = '#392A20';
const CREAM = '#FAF7E9';
const YELLOW = '#FFE98A';
const FONT = 'PretendardDemo, Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
const seg = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const typed = (s: string, t: number, start: number, cps = 7) =>
  s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - start) * cps))));
const caret = (t: number) => (Math.floor(t * 2) % 2 === 0 ? 1 : 0);

const SW = 360;
const SH = 760;
const BZ = 8;

// camera targets: scale, focus point (screen coords)
type Cam = [number, number, number];
const CAM: Record<string, Cam> = {
  yard: [0.66, 180, 380],
  insideMemo: [0.95, 180, 300],
  homeEmpty: [0.66, 180, 380],
  homePet: [0.8, 180, 420],
  quick: [1.0, 180, 270],
  shopping: [1.0, 180, 270],
  voiceReady: [0.92, 180, 510],
  voiceListen: [0.95, 180, 500],
  voiceWait: [0.95, 180, 500],
  voiceResult: [1.15, 180, 252],
  invite: [0.85, 180, 380],
  captureWait: [0.85, 180, 380],
  captureResult: [1.0, 180, 480],
  searchType: [1.0, 180, 230],
  searchResult: [1.0, 180, 260],
  autoOn: [1.0, 180, 260],
  ticket: [1.0, 180, 290],
  ticketPrompt: [1.0, 180, 430],
  ticketSaved: [1.0, 180, 340],
  gmail: [1.0, 180, 320],
  gmailPrompt: [1.0, 180, 450],
  gmailSaved: [1.0, 180, 340],
  chatAsk: [1.14, 180, 247],
  chatAgree: [1.0, 180, 480],
  chatPrompt: [1.0, 180, 480],
  recallAsk: [1.14, 180, 247],
  recallWait: [1.0, 180, 480],
  recallPrompt: [1.0, 180, 480],
  recallReply: [1.15, 180, 365],
};
const ORDER = Object.keys(CAM);

const sprite = (kind: 'idle' | 'mailalert' | 'greet', t: number, fps = 6) =>
  staticFile(`demo/${kind}-${Math.floor(t * fps) % 4}.png`);

const Pet: React.FC<{
  kind?: 'idle' | 'mailalert' | 'greet';
  t: number;
  size?: number;
  flip?: boolean;
  style?: React.CSSProperties;
}> = ({kind = 'idle', t, size = 96, flip, style}) => (
  <Img
    src={sprite(kind, t)}
    style={{
      width: size,
      height: size,
      imageRendering: 'pixelated',
      transform: flip ? 'scaleX(-1)' : undefined,
      filter: 'drop-shadow(0 4px 3px rgba(57,42,32,0.28))',
      ...style,
    }}
  />
);

const abs = (l: number, tp: number, w?: number, h?: number, s: React.CSSProperties = {}): React.CSSProperties => ({
  position: 'absolute',
  left: l,
  top: tp,
  width: w,
  height: h,
  ...s,
});

const StatusBar: React.FC<{dark?: boolean}> = ({dark}) => {
  const c = dark ? '#fff' : BROWN;
  return (
    <div style={abs(0, 0, SW, 30, {color: c, fontSize: 13, fontWeight: 700})}>
      <div style={abs(24, 7)}>9:41</div>
      <div style={abs(SW / 2 - 9, 8, 18, 18, {borderRadius: 9, background: '#111'})} />
      <div style={abs(SW - 86, 8, 64, 16, {display: 'flex', gap: 6, alignItems: 'center'})}>
        <div style={{width: 14, height: 11, background: c, clipPath: 'polygon(0 100%,100% 0,100% 100%)'}} />
        <div style={{width: 14, height: 11, background: c, clipPath: 'polygon(0 100%,100% 0,100% 100%)', opacity: 0.8}} />
        <div style={{width: 22, height: 11, borderRadius: 3, border: `1.5px solid ${c}`, padding: 1, boxSizing: 'border-box'}}>
          <div style={{width: '78%', height: '100%', background: c, borderRadius: 1}} />
        </div>
      </div>
    </div>
  );
};

const NavBar: React.FC<{dark?: boolean}> = ({dark}) => (
  <div style={abs(SW / 2 - 55, SH - 14, 110, 4, {borderRadius: 2, background: dark ? '#fff' : BROWN, opacity: 0.55})} />
);

const Chip: React.FC<{children: React.ReactNode; on?: boolean; bg?: string; color?: string; size?: number}> = ({
  children,
  on,
  bg,
  color,
  size = 13,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 11px',
      borderRadius: 14,
      fontSize: size,
      fontWeight: 700,
      background: bg ?? (on ? BROWN : 'rgba(57,42,32,0.08)'),
      color: color ?? (on ? CREAM : BROWN),
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

const Keyboard: React.FC<{press?: number}> = ({press = -1}) => {
  const rows = [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['⇧', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', '⌫'],
  ];
  return (
    <div style={abs(0, SH - 262, SW, 262, {background: '#E9E4D2', borderTop: '1px solid rgba(57,42,32,0.12)'})}>
      <div style={abs(0, 10, SW, 200)}>
        {rows.map((r, i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 9}}>
            {r.map((k, j) => {
              const special = k === '⇧' || k === '⌫';
              const hot = i * 20 + j === press;
              return (
                <div
                  key={j}
                  style={{
                    width: special ? 42 : 30,
                    height: 42,
                    borderRadius: 7,
                    background: hot ? YELLOW : special ? '#D5CEB6' : '#FFFDF4',
                    boxShadow: '0 1px 0 rgba(57,42,32,0.25)',
                    color: BROWN,
                    fontSize: 17,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {k}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{display: 'flex', justifyContent: 'center', gap: 5}}>
          {['!#1', ',', '', '.', '↵'].map((k, j) => (
            <div
              key={j}
              style={{
                width: j === 2 ? 130 : 42,
                height: 42,
                borderRadius: 7,
                background: j === 4 ? YELLOW : j === 2 ? '#FFFDF4' : '#D5CEB6',
                boxShadow: '0 1px 0 rgba(57,42,32,0.25)',
                color: BROWN,
                fontSize: 15,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {k}
            </div>
          ))}
        </div>
      </div>
      <div style={abs(SW / 2 - 55, 245, 110, 4, {borderRadius: 2, background: BROWN, opacity: 0.55})} />
    </div>
  );
};

// ---------- Launcher (android home) ----------
const APPS: [string, string][] = [
  ['전화', '#6FB07A'],
  ['메시지', '#6C9BD2'],
  ['카메라', '#8E8E93'],
  ['갤러리', '#E59A72'],
  ['메일', '#D96B64'],
  ['브라우저', '#7FA8D8'],
  ['지도', '#8DBE7B'],
  ['캘린더', '#E8C15A'],
];

const Launcher: React.FC<{dim?: number; children?: React.ReactNode}> = ({dim = 0, children}) => (
  <div style={abs(0, 0, SW, SH, {background: 'linear-gradient(170deg,#F6E7B8 0%,#EBCB8F 45%,#D79D74 100%)', overflow: 'hidden'})}>
    <div style={abs(0, 56, SW, 80, {textAlign: 'center', color: BROWN})}>
      <div style={{fontSize: 56, fontWeight: 300, lineHeight: '60px'}}>9:41</div>
      <div style={{fontSize: 14, fontWeight: 600, opacity: 0.8}}>11월 27일 금요일</div>
    </div>
    <div style={abs(24, 250, SW - 48, 300, {display: 'flex', flexWrap: 'wrap', rowGap: 26})}>
      {APPS.map(([n, c]) => (
        <div key={n} style={{width: '25%', textAlign: 'center', color: BROWN, fontSize: 12, fontWeight: 600}}>
          <div style={{width: 52, height: 52, margin: '0 auto 6px', borderRadius: 16, background: c, boxShadow: '0 2px 5px rgba(57,42,32,0.25)'}} />
          {n}
        </div>
      ))}
    </div>
    <div style={abs(16, SH - 104, SW - 32, 74, {borderRadius: 28, background: 'rgba(255,253,244,0.45)', display: 'flex', justifyContent: 'space-around', alignItems: 'center'})}>
      {[['전화', '#6FB07A'], ['메시지', '#6C9BD2'], ['스티키펫', YELLOW], ['브라우저', '#7FA8D8']].map(([n, c]) => (
        <div key={n} style={{width: 52, height: 52, borderRadius: 16, background: c, boxShadow: '0 2px 5px rgba(57,42,32,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {n === '스티키펫' && <div style={{width: 24, height: 24, borderRadius: 6, background: BROWN}} />}
        </div>
      ))}
    </div>
    {children}
    <div style={abs(0, 0, SW, SH, {background: '#1b130d', opacity: dim})} />
  </div>
);

// ---------- App chrome ----------
const AppBar: React.FC<{title: string; back?: boolean}> = ({title, back}) => (
  <div style={abs(0, 30, SW, 52, {display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12, color: BROWN})}>
    {back && <div style={{fontSize: 22, fontWeight: 700}}>‹</div>}
    <div style={{fontSize: 20, fontWeight: 800}}>{title}</div>
  </div>
);

const MemoCard: React.FC<{
  title: string;
  tag?: string;
  sub?: string;
  y: number;
  hl?: boolean;
  op?: number;
  dx?: number;
  h?: number;
}> = ({title, tag, sub, y, hl, op = 1, dx = 0, h = 66}) => (
  <div
    style={abs(16, y, SW - 32, h, {
      borderRadius: 14,
      background: hl ? YELLOW : '#FFFDF4',
      boxShadow: '0 2px 6px rgba(57,42,32,0.15)',
      padding: '10px 14px',
      boxSizing: 'border-box',
      opacity: op,
      transform: `translateX(${dx}px)`,
      color: BROWN,
    })}
  >
    <div style={{fontSize: 16, fontWeight: 800, lineHeight: '22px'}}>{title}</div>
    <div style={{display: 'flex', gap: 6, marginTop: 6, alignItems: 'center'}}>
      {tag && (
        <div style={{fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9, background: hl ? 'rgba(57,42,32,0.12)' : YELLOW}}>{tag}</div>
      )}
      {sub && <div style={{fontSize: 12, fontWeight: 600, opacity: 0.65}}>{sub}</div>}
    </div>
  </div>
);

const TabBar: React.FC<{active: number}> = ({active}) => (
  <div style={abs(0, SH - 74, SW, 60, {display: 'flex', background: '#FFFDF4', borderTop: '1px solid rgba(57,42,32,0.1)'})}>
    {['마당', '메모', '설정'].map((n, i) => (
      <div key={n} style={{flex: 1, textAlign: 'center', paddingTop: 10, fontSize: 12, fontWeight: 800, color: BROWN, opacity: i === active ? 1 : 0.45}}>
        <div style={{width: 26, height: 5, borderRadius: 3, margin: '0 auto 6px', background: i === active ? BROWN : 'transparent'}} />
        {n}
      </div>
    ))}
  </div>
);

const Yard: React.FC<{t: number}> = ({t}) => {
 const p=0.6*Math.sin(t*.55);const down=seg(t,5,6);const lift=(1-seg(t,2.1,2.8))*seg(t,1.5,1.8);
 return <div style={abs(0,0,SW,SH,{background:'#739e5c',overflow:'hidden',fontFamily:'YardPixel, PretendardDemo, sans-serif'})}>
 <style>{`@font-face{font-family:YardPixel;src:url('${staticFile('demo/Galmuri11.woff2')}') format('woff2');}`}</style>
 <Img src={staticFile('demo/yard-topdown.webp')} style={{...abs(0,30,SW,SW*2859/1344,{}),imageRendering:'pixelated'}}/>
 <div style={abs(SW-44,40,32,32,{background:'#fff8d3',border:'2px solid #4b563b',textAlign:'center',color:'#455b3d',fontSize:21})}>⚙</div>
 <div style={abs(125+p*26,315-lift*9,96,96,{})}><Pet t={t} size={96} flip={Math.cos(t*.55)<0}/></div>
 <div style={abs(139+p*26,403,76,28,{display:'grid',placeItems:'center',background:'#fff9df',border:'2px solid #4a5e40',color:'#354b36',fontSize:13})}>인절미</div>
 <Img src={staticFile('demo/yard-ball-small.png')} style={abs(225,387,22,22,{imageRendering:'pixelated'})}/>
 <div style={abs(18,555-down*5,324,126,{background:'#fffae8',border:'3px solid #675e44',boxShadow:'3px 4px #44573b66',padding:'12px 16px',color:'#3e4d38'})}><div style={{fontSize:15,opacity:.7,marginBottom:9}}>메모</div><div style={{fontSize:21,lineHeight:1.35}}>장볼 것</div><div style={{fontSize:16,marginTop:3,opacity:.8}}>우유 사기</div></div>
 <div style={abs(31,693,298,39,{border:'2px solid #384b32',background:'#f6edcd',display:'grid',placeItems:'center',color:'#344b31',fontSize:16})}>함께 나가기 ↗</div><NavBar/>
 </div>;
};

const MemoList: React.FC<{t: number; extra?: React.ReactNode; chip?: number; highlight?: number; shop?: boolean; pet?: boolean}> = ({t, extra, chip = 0, highlight = -1}) => {
  const items: [string, string, string][] = [
    ['팀 회의 자료 정리', '할일', '오늘'],
    ['엄마께 전화', '할일', '오늘'],
    ['우유, 달걀', '장보기', '어제'],
    ['도서관 책 반납', '할일', '월요일'],
  ];
  return (
    <div style={abs(0, 0, SW, SH, {background: CREAM, overflow: 'hidden'})}>
      <AppBar title="메모" />
      <div style={abs(16, 90, SW - 32, 34, {display: 'flex', gap: 8})}>
        {['전체', '할일', '장보기', '일정'].map((c, i) => (
          <Chip key={c} on={i === chip}>{c}</Chip>
        ))}
      </div>
      {extra}
      {items.map((it, i) => (
        <MemoCard
          key={it[0]}
          title={it[0]}
          tag={it[1]}
          sub={it[2]}
          y={144 + i * 78}
          hl={i === highlight}
          op={seg(t, 0.1 + i * 0.1, 0.5 + i * 0.1)}
          dx={(1 - seg(t, 0.1 + i * 0.1, 0.5 + i * 0.1)) * 20}
        />
      ))}
      <div style={abs(SW - 76, SH - 150, 56, 56, {borderRadius: 18, background: BROWN, color: YELLOW, fontSize: 30, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(57,42,32,0.35)'})}>+</div>
      <TabBar active={1} />
      <NavBar />
    </div>
  );
};

// ---------- Prompt (pet suggestion) ----------
const PetPrompt: React.FC<{
  t: number;
  at: number;
  title: string;
  sub: string;
  source?: string;
  primary: string;
  y?: number;
  pressed?: number; // time at which primary is pressed
}> = ({t, at, title, sub, source, primary, y = 420, pressed}) => {
  const k = seg(t, at, at + 0.5);
  const press = pressed !== undefined && t >= pressed;
  return (
    <div style={abs(12, y + (1 - k) * 30, SW - 24, 0, {opacity: k})}>
      <div
        style={{
          borderRadius: 20,
          background: '#FFFDF4',
          border: `2.5px solid ${BROWN}`,
          boxShadow: '0 8px 20px rgba(57,42,32,0.35)',
          padding: '14px 16px 14px 84px',
          position: 'relative',
          color: BROWN,
          minHeight: 98,
          boxSizing: 'border-box',
        }}
      >
        <div style={abs(-6, 4, 80, 80)}>
          <Pet kind="mailalert" t={t} size={84} />
        </div>
        <div style={{fontSize: 16, fontWeight: 800, lineHeight: '22px'}}>{title}</div>
        <div style={{fontSize: 13, fontWeight: 600, marginTop: 2, opacity: 0.75}}>{sub}</div>
        {source && (
          <div style={{marginTop: 6}}>
            <Chip bg={YELLOW} size={11}>{source}</Chip>
          </div>
        )}
        <div style={{display: 'flex', gap: 8, marginTop: 10}}>
          <div
            style={{
              padding: '7px 16px',
              borderRadius: 12,
              background: press ? YELLOW : BROWN,
              color: press ? BROWN : CREAM,
              fontSize: 14,
              fontWeight: 800,
              transform: press ? 'scale(0.94)' : undefined,
              border: `2px solid ${BROWN}`,
            }}
          >
            {primary}
          </div>
          <div style={{padding: '7px 14px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'rgba(57,42,32,0.08)'}}>나중에</div>
        </div>
      </div>
    </div>
  );
};

const Toast: React.FC<{t: number; at: number; text: string; y?: number}> = ({t, at, text, y = 640}) => {
  const k = seg(t, at, at + 0.4);
  return (
    <div style={abs(40, y + (1 - k) * 14, SW - 80, 40, {opacity: k, borderRadius: 20, background: BROWN, color: CREAM, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
      {text}
    </div>
  );
};

// ---------- Quick memo / shopping ----------
const QuickMemo: React.FC<{t:number;mode:'quick'|'shopping'}>=({t,mode})=>{
 const open=seg(t,0,.32),shop=mode==='shopping',switched=shop&&t>5.4; const words=shop?typed('우유, 달걀',t,.25,4.7):'';
 return <Launcher dim={.27}><style>{`@font-face{font-family:YardPixel;src:url('${staticFile('demo/Galmuri11.woff2')}') format('woff2');}`}</style>
 <div style={abs(25,148,309,321,{opacity:open,transform:'translateY('+((1-open)*9)+'px)',fontFamily:'YardPixel, PretendardDemo,sans-serif',color:'#514433'})}>
 <div style={abs(16,-37,64,61,{})}><Pet t={t} kind="greet" size={61}/></div>
 <div style={abs(0,0,259,304,{border:'2px solid #695940',borderRadius:'4px 1px 4px 4px',boxShadow:'3px 3px #392a2040',background:'#fcf8e9',padding:'12px 12px 9px',zIndex:2})}>
 <div style={{fontSize:19,lineHeight:1.3,marginBottom:8,display:'flex',justifyContent:'space-between'}}><b>{switched?'장보기':'할 일'}</b><span style={{fontSize:17,opacity:.63}}>↶　↷　×</span></div>
 <div style={{height:219,background:'repeating-linear-gradient(transparent 0px, transparent 29px, #d9d1bc 29px, #d9d1bc 30px)',fontSize:18,lineHeight:'30px'}}>{switched?<><div>☐ 우유</div><div>☐ 달걀</div></>:<div>{words}{(!shop||t<3)&&<span style={{opacity:caret(t)}}>|</span>}</div>}</div>
 <div style={{marginTop:8,fontSize:15,color:'#6b604c'}}>☑　♧</div></div>
 {['할 일','장보기','메모'].map((s,i)=><div key={s} style={abs(256,25+i*62,47,55,{background:(switched?i===1:i===0)?'#9c514d':'#d7cfb9',color:(switched?i===1:i===0)?'#fff4de':'#5b5141',border:'2px solid #695940',borderRadius:'0 5px 5px 0',display:'grid',placeItems:'center',fontSize:15,writingMode:'vertical-rl'})}>{s}</div>)}
 </div></Launcher>;
};

// ---------- Voice ----------
const VOICE_TEXT = '내일 오후 3시 치과, 세탁물 찾기, 서영에게 자료 보내기';

const Voice: React.FC<{t: number; stage: 'ready' | 'listen' | 'wait' | 'result'}> = ({t, stage}) => {
  const listening = stage === 'listen';
  const text = stage === 'ready' ? '' : stage === 'listen' ? typed(VOICE_TEXT, t, 0.3, 9) : VOICE_TEXT;
  const items: [string, string, string][] = [
    ['내일 오후 3시 치과', '일정', '내일 15:00'],
    ['세탁물 찾기', '할일', '오늘'],
    ['서영에게 자료 보내기', '할일', '오늘'],
  ];
  if (stage === 'result') {
    return (
      <div style={abs(0, 0, SW, SH, {background: CREAM, overflow: 'hidden'})}>
        <AppBar title="메모" />
        <div style={abs(16, 92, SW - 32, 24, {fontSize: 13, fontWeight: 700, color: BROWN, opacity: 0.7})}>음성으로 3개를 나눠 담았어요</div>
        {items.map((it, i) => {
          const k = seg(t, 0.2 + i * 0.35, 0.6 + i * 0.35);
          return <MemoCard key={it[0]} title={it[0]} tag={it[1]} sub={it[2]} y={126 + i * 80} hl={i === 0} op={k} dx={(1 - k) * 24} h={68} />;
        })}
        <TabBar active={1} />
        <NavBar />
      </div>
    );
  }
  const bars = 21;
  return (
    <Launcher dim={0.45}>
      <div style={abs(0, 320, SW, SH - 320, {borderRadius: '28px 28px 0 0', background: CREAM, boxShadow: '0 -8px 26px rgba(0,0,0,0.3)', color: BROWN})}>
        <div style={abs(SW / 2 - 20, 10, 40, 4, {borderRadius: 2, background: BROWN, opacity: 0.3})} />
        <div style={abs(24, 30, SW - 48, 90, {fontSize: 20, fontWeight: 800, lineHeight: '30px', minHeight: 90})}>
          {text || <span style={{opacity: 0.45}}>마이크를 눌러 말해 보세요</span>}
          {listening && <span style={{opacity: caret(t)}}>|</span>}
        </div>
        <div style={abs(24, 140, SW - 48, 50, {display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5})}>
          {Array.from({length: bars}).map((_, i) => {
            const amp = listening ? 0.25 + 0.75 * Math.abs(Math.sin(t * 7 + i * 0.9) * Math.cos(t * 3 + i * 0.4)) : 0.1;
            return <div key={i} style={{width: 6, height: 6 + amp * 40, borderRadius: 3, background: listening ? BROWN : 'rgba(57,42,32,0.25)'}} />;
          })}
        </div>
        <div style={abs(SW / 2 - 44, 210, 88, 88, {borderRadius: 44, background: stage === 'wait' ? '#FFFDF4' : listening ? '#D9534F' : YELLOW, border: `3px solid ${BROWN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: listening ? `scale(${1 + 0.04 * Math.sin(t * 8)})` : undefined})}>
          {stage === 'wait' ? (
            <div style={{width: 36, height: 36, borderRadius: 18, border: `5px solid rgba(57,42,32,0.2)`, borderTopColor: BROWN, transform: `rotate(${t * 360}deg)`}} />
          ) : (
            <div style={{width: 26, height: 40, borderRadius: 13, background: listening ? '#fff' : BROWN}} />
          )}
        </div>
        <div style={abs(0, 310, SW, 24, {textAlign: 'center', fontSize: 14, fontWeight: 800, opacity: 0.8})}>
          {stage === 'ready' ? '대기 중' : listening ? '듣는 중…' : `인식 중${'.'.repeat(1 + (Math.floor(t * 3) % 3))}`}
        </div>
      </div>
      <div style={abs(SW / 2 - 48, 226, 96, 96)}>
        <Pet kind="greet" t={t} size={96} />
      </div>
    </Launcher>
  );
};

// ---------- Invitation / capture ----------
const Invitation: React.FC<{t: number; stage: 'idle' | 'wait' | 'result'}> = ({t, stage}) => {
  const flash = stage === 'wait' ? 1 - seg(t, 0, 0.35) : 0;
  const scan = stage === 'wait' ? seg(t, 0.3, Math.max(1.6, 1.8)) : 0;
  const sheet = stage === 'result' ? seg(t, 0.1, 0.7) : 0;
  return (
    <div style={abs(0, 0, SW, SH, {background: '#17120E', overflow: 'hidden'})}>
      <div style={abs(0, 30, SW, 50, {color: '#fff', fontSize: 17, fontWeight: 800, padding: '12px 20px', boxSizing: 'border-box'})}>‹ 갤러리</div>
      <div style={abs(30, 110, SW - 60, 420, {background: CREAM, borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', textAlign: 'center', color: BROWN, overflow: 'hidden'})}>
        <div style={abs(10, 10, SW - 80, 400, {border: `1.5px solid ${BROWN}`, opacity: 0.6})} />
        <div style={{marginTop: 46, fontSize: 12, letterSpacing: 4, fontWeight: 700}}>WEDDING INVITATION</div>
        <div style={{marginTop: 22, fontSize: 24, fontWeight: 300}}>♥</div>
        <div style={{marginTop: 14, fontSize: 28, fontWeight: 800}}>김하늘 · 이도윤</div>
        <div style={{marginTop: 16, fontSize: 14, fontWeight: 600, lineHeight: '24px'}}>
          저희 두 사람이 사랑으로<br />하나가 되는 날 초대합니다
        </div>
        <div style={{margin: '24px auto 0', width: 36, height: 2, background: BROWN, opacity: 0.4}} />
        <div style={{marginTop: 20, fontSize: 20, fontWeight: 800}}>2026년 12월 19일 토요일</div>
        <div style={{marginTop: 6, fontSize: 20, fontWeight: 800}}>오후 1시 30분</div>
        <div style={{marginTop: 14, fontSize: 14, fontWeight: 600}}>소담웨딩홀 3층 그랜드홀</div>
        {stage === 'wait' && (
          <div style={abs(0, 40 + scan * 330, SW - 60, 3, {background: YELLOW, boxShadow: `0 0 14px 4px ${YELLOW}`})} />
        )}
      </div>
      <div style={abs(0, 0, SW, SH, {background: '#fff', opacity: flash * 0.8})} />
      {stage === 'idle' && (
        <div style={abs(SW / 2 - 110, 590, 220, 44, {borderRadius: 22, background: YELLOW, color: BROWN, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${BROWN}`})}>
          화면 캡처해서 저장
        </div>
      )}
      {stage === 'wait' && (
        <div style={abs(SW / 2 - 100, 590, 200, 44, {borderRadius: 22, background: '#FFFDF4', color: BROWN, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
          읽는 중{'.'.repeat(1 + (Math.floor(t * 3) % 3))}
        </div>
      )}
      {stage === 'result' && (
        <div style={abs(0, SH - 330 + (1 - sheet) * 330, SW, 330, {borderRadius: '26px 26px 0 0', background: CREAM, color: BROWN, boxShadow: '0 -8px 26px rgba(0,0,0,0.4)'})}>
          <div style={abs(24, 22, SW - 48, 26, {fontSize: 18, fontWeight: 800})}>캡처에서 찾은 일정</div>
          <div style={abs(24, 62, SW - 48, 150, {borderRadius: 16, background: YELLOW, padding: 16, boxSizing: 'border-box'})}>
            <div style={{fontSize: 12, fontWeight: 800, opacity: 0.65}}>예식 일시</div>
            <div style={{fontSize: 22, fontWeight: 800, marginTop: 4}}>12월 19일 (토) 오후 1:30</div>
            <div style={{fontSize: 13, fontWeight: 700, marginTop: 12, opacity: 0.7}}>장소</div>
            <div style={{fontSize: 16, fontWeight: 800}}>소담웨딩홀 3층 그랜드홀</div>
          </div>
          <div style={abs(24, 232, SW - 48, 46, {borderRadius: 14, background: BROWN, color: CREAM, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'})}>메모로 저장</div>
          <div style={abs(SW / 2 - 55, 308, 110, 4, {borderRadius: 2, background: BROWN, opacity: 0.55})} />
        </div>
      )}
    </div>
  );
};

// ---------- Search ----------
const Search: React.FC<{t: number; stage: 'type' | 'result'}> = ({t, stage}) => {
  const q = stage === 'type' ? typed('병원', t, 0.5, 3) : '병원';
  return (
    <div style={abs(0, 0, SW, SH, {background: CREAM, overflow: 'hidden'})}>
      <AppBar title="메모 검색" />
      <div style={abs(16, 92, SW - 32, 48, {borderRadius: 24, background: '#FFFDF4', border: `2.5px solid ${BROWN}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10, fontSize: 18, fontWeight: 700, color: BROWN, boxSizing: 'border-box'})}>
        <div style={{width: 14, height: 14, borderRadius: 7, border: `2.5px solid ${BROWN}`}} />
        <div>
          {q}
          {stage === 'type' && <span style={{opacity: caret(t)}}>|</span>}
        </div>
      </div>
      {stage === 'result' && (
        <>
          <div style={abs(18, 156, SW - 36, 20, {fontSize: 13, fontWeight: 700, color: BROWN, opacity: 0.65})}>검색 결과 1개</div>
          <MemoCard title="내일 오후 3시 치과" tag="일정" sub="내일 15:00" y={184} hl op={seg(t, 0.15, 0.6)} dx={(1 - seg(t, 0.15, 0.6)) * 20} h={72} />
        </>
      )}
      {stage === 'type' && <Keyboard press={t > 0.5 && Math.floor((t - 0.5) * 3) < 2 ? (Math.floor((t - 0.5) * 3) === 0 ? 7 : 22) : -1} />}
      {stage === 'result' && <NavBar />}
    </div>
  );
};

// ---------- Settings ----------
const AutoSettings: React.FC<{t: number}> = ({t}) => {
  const k = seg(t, 0.7, 1.1);
  const Row: React.FC<{y: number; title: string; sub: string; on: number}> = ({y, title, sub, on}) => (
    <div style={abs(16, y, SW - 32, 82, {borderRadius: 16, background: '#FFFDF4', boxShadow: '0 2px 6px rgba(57,42,32,0.12)', padding: '14px 16px', boxSizing: 'border-box', color: BROWN})}>
      <div style={{fontSize: 16, fontWeight: 800, width: 220}}>{title}</div>
      <div style={{fontSize: 12, fontWeight: 600, opacity: 0.7, marginTop: 4, width: 230, lineHeight: '17px'}}>{sub}</div>
      <div style={abs(SW - 32 - 16 - 54, 24, 54, 32, {borderRadius: 16, background: on > 0.5 ? BROWN : '#CFC8AE', boxSizing: 'border-box', transition: 'none'})}>
        <div style={abs(4 + on * 22, 4, 24, 24, {borderRadius: 12, background: on > 0.5 ? YELLOW : '#fff'})} />
      </div>
    </div>
  );
  return (
    <div style={abs(0, 0, SW, SH, {background: CREAM, overflow: 'hidden'})}>
      <AppBar title="설정" back />
      <Row y={100} title="자동 추천" sub="화면에서 약속·예매 정보를 찾으면 저장을 제안해요" on={k} />
      <Row y={196} title="화면 읽기 동의" sub="이 기기에서 시연용으로 동의한 상태예요" on={1} />
      <Row y={292} title="알림 말풍선" sub="펫이 말풍선으로 알려줘요" on={1} />
      <div style={abs(24, 400, SW - 48, 40, {fontSize: 13, fontWeight: 700, color: BROWN, opacity: seg(t, 1.2, 1.6) * 0.8})}>
        자동 추천이 켜졌어요
      </div>
      <TabBar active={2} />
      <NavBar />
    </div>
  );
};

// ---------- Ticket ----------
const Ticket: React.FC<{t: number; stage: 'view' | 'prompt' | 'saved'}> = ({t, stage}) => {
  return (
    <div style={abs(0, 0, SW, SH, {background: '#EEF1F5', overflow: 'hidden'})}>
      <div style={abs(0, 30, SW, 52, {background: '#1F3A6E', color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', padding: '0 18px', marginTop: -30, paddingTop: 30, boxSizing: 'content-box'})}>
        예매 내역
      </div>
      <div style={abs(16, 100, SW - 32, 250, {borderRadius: 18, background: '#fff', boxShadow: '0 3px 10px rgba(0,0,0,0.12)', padding: 18, boxSizing: 'border-box', color: '#18243D'})}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#3E67B3'}}>
          <span>KTX 105</span>
          <span>결제 완료</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16}}>
          <div>
            <div style={{fontSize: 30, fontWeight: 800}}>부산</div>
            <div style={{fontSize: 22, fontWeight: 800, marginTop: 4}}>09:20</div>
          </div>
          <div style={{fontSize: 22, fontWeight: 800, color: '#98A5BE'}}>→</div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: 30, fontWeight: 800}}>서울</div>
            <div style={{fontSize: 22, fontWeight: 800, marginTop: 4}}>11:51</div>
          </div>
        </div>
        <div style={{height: 1, background: '#E1E6EF', margin: '16px 0'}} />
        <div style={{fontSize: 15, fontWeight: 700}}>11월 28일 (토) · 5호차 12A</div>
        <div style={{fontSize: 13, fontWeight: 600, color: '#6B7894', marginTop: 4}}>일반실 · 성인 1명</div>
      </div>
      <div style={abs(16, 370, SW - 32, 46, {borderRadius: 12, background: '#3E67B3', color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'})}>승차권 확인</div>
      {stage === 'view' && (
        <div style={abs(SW - 120, 560 + Math.abs(Math.sin(t * 5)) * -3, 96, 96)}>
          <Pet t={t} size={96} flip />
        </div>
      )}
      {stage === 'prompt' && <PetPrompt t={t} at={0.3} title="서울행 KTX 09:20" sub="예매 내역을 메모로 저장할까요?" source="예매 내역 화면" primary="저장" y={470} pressed={Math.max(2.6, 0)} />}
      {stage === 'saved' && (
        <>
          <div style={abs(0, 0, SW, SH, {background: 'rgba(27,19,13,0.35)'})} />
          <div style={abs(16, 330 + (1 - seg(t, 0.1, 0.6)) * 40, SW - 32, 220, {opacity: seg(t, 0.1, 0.6), borderRadius: 22, background: CREAM, border: `3px solid ${BROWN}`, boxShadow: '0 12px 26px rgba(0,0,0,0.35)', padding: 18, boxSizing: 'border-box', color: BROWN})}>
            <div style={{fontSize: 13, fontWeight: 800, opacity: 0.65}}>저장됨</div>
            <div style={{fontSize: 22, fontWeight: 800, marginTop: 4}}>서울행 KTX 09:20</div>
            <div style={{fontSize: 14, fontWeight: 700, marginTop: 6}}>11월 28일 (토) · 부산 → 서울 · 5호차 12A</div>
            <div style={{marginTop: 14, display: 'flex', gap: 8}}>
              <Chip bg={YELLOW}>예매 내역</Chip>
              <Chip>일정</Chip>
            </div>
            <div style={{fontSize: 12, fontWeight: 700, marginTop: 14, opacity: 0.6}}>출처 · 예매 내역 화면 캡처</div>
          </div>
        </>
      )}
      <NavBar />
    </div>
  );
};

// ---------- Gmail ----------
const Gmail: React.FC<{t: number; stage: 'view' | 'prompt' | 'saved'}> = ({t, stage}) => {
  const hl = stage !== 'view' || t > 1.4;
  return (
    <div style={abs(0, 0, SW, SH, {background: '#fff', overflow: 'hidden', color: '#222'})}>
      <div style={abs(0, 30, SW, 50, {display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 22, color: '#555'})}>‹</div>
      <div style={abs(18, 84, SW - 36, 70, {fontSize: 21, fontWeight: 800, lineHeight: '29px'})}>[공지] 중간 발표 일정 안내</div>
      <div style={abs(18, 160, SW - 36, 48, {display: 'flex', gap: 10, alignItems: 'center'})}>
        <div style={{width: 38, height: 38, borderRadius: 19, background: '#8DBE7B', color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>운</div>
        <div>
          <div style={{fontSize: 14, fontWeight: 800}}>운영팀</div>
          <div style={{fontSize: 12, color: '#777', fontWeight: 600}}>받는 사람: 나</div>
        </div>
      </div>
      <div style={abs(18, 222, SW - 36, 200, {fontSize: 16, lineHeight: '27px', fontWeight: 500})}>
        안녕하세요, 팀 여러분.<br />
        중간 발표는{' '}
        <span style={{background: hl ? YELLOW : 'transparent', fontWeight: 800, padding: '1px 2px'}}>금요일 오후 2시</span>에 진행합니다.
        <br />
        발표 자료는 전날까지 공유 폴더에 올려 주세요.
      </div>
      {stage === 'prompt' && <PetPrompt t={t} at={0.3} title="금요일 오후 2시 발표" sub="일정으로 저장할까요?" source="Gmail · 발표 공지" primary="저장" y={470} pressed={2.6} />}
      {stage === 'saved' && (
        <>
          <div style={abs(0, 0, SW, SH, {background: 'rgba(27,19,13,0.35)'})} />
          <div style={abs(16, 360 + (1 - seg(t, 0.1, 0.6)) * 40, SW - 32, 200, {opacity: seg(t, 0.1, 0.6), borderRadius: 22, background: CREAM, border: `3px solid ${BROWN}`, boxShadow: '0 12px 26px rgba(0,0,0,0.35)', padding: 18, boxSizing: 'border-box', color: BROWN})}>
            <div style={{fontSize: 13, fontWeight: 800, opacity: 0.65}}>저장됨</div>
            <div style={{fontSize: 22, fontWeight: 800, marginTop: 4}}>중간 발표</div>
            <div style={{fontSize: 16, fontWeight: 800, marginTop: 6}}>금요일 오후 2시</div>
            <div style={{marginTop: 14, display: 'flex', gap: 8}}>
              <Chip bg={YELLOW}>Gmail</Chip>
              <Chip>일정</Chip>
            </div>
            <div style={{fontSize: 12, fontWeight: 700, marginTop: 14, opacity: 0.6}}>출처 · [공지] 중간 발표 일정 안내</div>
          </div>
        </>
      )}
      <NavBar />
    </div>
  );
};

// ---------- Chat ----------
const Bubble: React.FC<{me?: boolean; y: number; text: string; k?: number}> = ({me, y, text, k = 1}) => (
  <div
    style={abs(me ? SW - 16 - 200 : 16, y + (1 - k) * 10, 200, undefined, {
      opacity: k,
      display: 'flex',
      justifyContent: me ? 'flex-end' : 'flex-start',
    })}
  >
    <div
      style={{
        maxWidth: 200,
        padding: '10px 14px',
        borderRadius: me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: me ? YELLOW : '#fff',
        color: BROWN,
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '23px',
        boxShadow: '0 1px 3px rgba(57,42,32,0.15)',
      }}
    >
      {text}
    </div>
  </div>
);

const Chat: React.FC<{t: number; view: string}> = ({t, view}) => {
  const ask = view === 'chatAsk' || view === 'chatAgree' || view === 'chatPrompt';
  const typedAgree = view === 'chatAgree' ? typed('좋아', t, 0.13, 4.0) : '';
  const sent = view === 'chatAgree' ? t > 0.85 : view === 'chatPrompt';
  const input = view === 'chatAgree' && !sent ? typedAgree : view === 'recallReply' ? (t < 2.0 ? typed('금요일 두 시야', t, 0.4, 6) : '') : '';
  const replySent = view === 'recallReply' && t >= 2.0;
  let prompt: React.ReactNode = null;
  if (view === 'chatPrompt') {
    prompt = <PetPrompt t={t} at={0.4} title="금요일 오후 6시 저녁" sub="합의한 약속으로 저장할까요?" source="친구와의 대화" primary="저장" y={470} pressed={3} />;
  }
  if (view === 'recallPrompt') {
    prompt = <PetPrompt t={t} at={0.4} title="금요일 오후 2시" sub="메일에서 찾았어요. 답장에 넣을까요?" source="Gmail · 발표 공지" primary="넣기" y={470} pressed={3} />;
  }
  return (
    <div style={abs(0, 0, SW, SH, {background: '#EDE7D2', overflow: 'hidden'})}>
      <div style={abs(0, 30, SW, 56, {background: CREAM, borderBottom: '1px solid rgba(57,42,32,0.12)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', boxSizing: 'border-box', color: BROWN})}>
        <div style={{fontSize: 22, fontWeight: 700}}>‹</div>
        <div style={{width: 34, height: 34, borderRadius: 17, background: '#E59A72', color: '#fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{ask?'친':'팀'}</div>
        <div style={{fontSize: 17, fontWeight: 800}}>{ask?'친구':'발표 준비팀'}</div>
      </div>
      {ask && (
        <>
          <Bubble y={110} text="오늘 발표 준비 고생했어" />
          <Bubble me y={166} text="응, 고마워!" />
          <Bubble y={222} text="금요일 오후 6시에 저녁 어때?" k={view === 'chatAsk' ? seg(t, 0.3, 0.8) : 1} />
          {sent && <Bubble me y={296} text="좋아" k={view === 'chatAgree' ? seg(t, 0.85, 1.12) : 1} />}
        </>
      )}
      {!ask && (
        <>
          <Bubble y={110} text="오늘 발표 준비 고생했어" />
          <Bubble me y={166} text="응, 고마워!" />
          <Bubble y={222} text="우리 발표 몇 시였지?" k={view === 'recallAsk' ? seg(t, 0.3, 0.8) : 1} />
          {replySent && <Bubble me y={296} text="금요일 두 시야" k={seg(t, 2.0, 2.4)} />}
        </>
      )}
      {view === 'recallWait' && (
        <div style={abs(SW - 150, 560, 132, 132, {})}>
          <Pet kind="mailalert" t={t} size={96} style={{marginLeft: 20}} />
          <div style={abs(-30, -4, 110, 34, {borderRadius: 17, background: '#FFFDF4', border: `2px solid ${BROWN}`, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center'})}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 8, height: 8, borderRadius: 4, background: BROWN, opacity: 0.25 + 0.75 * (Math.floor(t * 3) % 3 === i ? 1 : 0.3)}} />
            ))}
          </div>
        </div>
      )}
      {prompt}
      <div style={abs(12, SH - 78, SW - 24, 48, {borderRadius: 24, background: '#FFFDF4', border: '1.5px solid rgba(57,42,32,0.2)', display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 16, fontWeight: 600, color: BROWN, boxSizing: 'border-box'})}>
        {input ? (
          <span>
            {input}
            <span style={{opacity: caret(t)}}>|</span>
          </span>
        ) : (
          <span style={{opacity: 0.4}}>메시지 입력</span>
        )}
      </div>
      <NavBar />
    </div>
  );
};

// ---------- Compose screens ----------
const renderScreen = (view: string, t: number): React.ReactNode => {
  switch (view) {
    case 'yard':
      return <Yard t={t} />;
    case 'insideMemo':
      return <MemoList t={t} highlight={-1} />;
    case 'homeEmpty':
      return <Launcher />;
    case 'homePet': {
      const k = seg(t, 0.3, 0.9);
      return (
        <Launcher>
          <div style={abs(230, 520 - (1 - k) * 20 + Math.abs(Math.sin(t * 5)) * -3, 96, 96, {opacity: k, transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: '50% 100%'})}>
            <Pet kind="greet" t={t} size={96} />
          </div>
        </Launcher>
      );
    }
    case 'quick':
      return <QuickMemo t={t} mode="quick" />;
    case 'shopping':
      return <QuickMemo t={t} mode="shopping" />;
    case 'voiceReady':
      return <Voice t={t} stage="ready" />;
    case 'voiceListen':
      return <Voice t={t} stage="listen" />;
    case 'voiceWait':
      return <Voice t={t} stage="wait" />;
    case 'voiceResult':
      return <Voice t={t} stage="result" />;
    case 'invite':
      return <Invitation t={t} stage="idle" />;
    case 'captureWait':
      return <Invitation t={t} stage="wait" />;
    case 'captureResult':
      return <Invitation t={t} stage="result" />;
    case 'searchType':
      return <Search t={t} stage="type" />;
    case 'searchResult':
      return <Search t={t} stage="result" />;
    case 'autoOn':
      return <AutoSettings t={t} />;
    case 'ticket':
      return <Ticket t={t} stage="view" />;
    case 'ticketPrompt':
      return <Ticket t={t} stage="prompt" />;
    case 'ticketSaved':
      return <Ticket t={t} stage="saved" />;
    case 'gmail':
      return <Gmail t={t} stage="view" />;
    case 'gmailPrompt':
      return <Gmail t={t} stage="prompt" />;
    case 'gmailSaved':
      return <Gmail t={t} stage="saved" />;
    default:
      return <Chat t={t} view={view} />;
  }
};

export const Phone: React.FC<{view: string; t: number; duration: number; height:number; frozenCamera?:boolean; stageBackground?:string}> = ({view, t, height, frozenCamera=false, stageBackground=CREAM}) => {
  const target = CAM[view] ?? CAM.yard;
  const idx = ORDER.indexOf(view);
  const prev = idx > 0 ? CAM[ORDER[idx - 1]] : target;
  // gentle camera: ease from previous framing, then slow drift; settle before end
  const k = frozenCamera ? 1 : seg(t, 0, 0.9);
  const drift = 1; // Hold steady once a target is in focus.
  const S = lerp(prev[0], target[0], k) * drift * (height / 545);
  const fx = lerp(prev[1], target[1], k);
  const fy = lerp(prev[2], target[2], k);
  const fadeIn = 1;

  return (
    <div style={{position: 'relative', width: 1280, height, overflow: 'hidden', fontFamily: FONT, background: stageBackground}}>
      <style>{`@font-face{font-family:'PretendardDemo';src:url('${staticFile('team/Pretendard-Medium.woff2')}') format('woff2');font-weight:100 900;}`}</style>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: SW + BZ * 2,
          height: SH + BZ * 2,
          transformOrigin: '0 0',
          transform: `translate(640px, ${height / 2}px) scale(${S}) translate(${-(fx + BZ)}px, ${-(fy + BZ)}px)`,
        }}
      >
        <div style={{position: 'absolute', inset: 0, borderRadius: 50, background: '#15100C', boxShadow: '0 0 0 1.5px #3a3029'}} />
        <div style={{position: 'absolute', left: BZ, top: BZ, width: SW, height: SH, borderRadius: 42, overflow: 'hidden', background: CREAM, opacity: 0.2 + 0.8 * fadeIn, fontFamily: FONT}}>
          {renderScreen(view, t)}
          <StatusBar dark={/^(invite|capture|ticket)/.test(view)} />
        </div>
      </div>
    </div>
  );
};
