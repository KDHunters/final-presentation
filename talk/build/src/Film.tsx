import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Sequence,staticFile,useCurrentFrame,delayRender,continueRender} from 'remotion';
import score from './score.json';
import captionPaint from './caption-paint.json';
import {Slide,palette as P} from './Slides';
import {toneFor} from './stage-tones';
import {Beat,hasBeat,beatBg} from './Beats';
import {Phone} from './Phone';
import {originalKind,originalBg,TeamStage} from './TeamStage';
const phoneViews=new Set('yard insideMemo homeEmpty homePet quick shopping voiceReady voiceListen voiceWait voiceResult invite captureWait captureResult searchType searchResult boundary proto autoOn ticket ticketPrompt ticketSaved gmail gmailPrompt gmailSaved chatAsk chatAgree chatPrompt recallAsk recallWait recallPrompt recallReply'.split(' '));
const mid=score.views.find(v=>v.key==='interview')!,poc=score.views.find(v=>v.key==='proto')!.from;
type V=typeof score.views[number];
export const Font=()=>{const [gate]=useState(()=>delayRender('팀 Pretendard 글꼴'));useEffect(()=>{let live=true;const done=()=>{if(live)continueRender(gate)};document.fonts.load('500 32px TeamPretendard').then(done,done);return()=>{live=false}},[gate]);return <style>{`@font-face{font-family:TeamPretendard;src:url('${staticFile('team/Pretendard-Medium.woff2')}') format('woff2');font-style:normal;font-weight:500;font-display:block;} *{box-sizing:border-box;}`}</style>};
export const View:React.FC<{v:V;captions:boolean;frameOverride?:number}>=({v,captions,frameOverride})=>{const clock=useCurrentFrame(),f=frameOverride??clock,t=f/score.fps,global=v.from+f,key=v.key;const says=score.cues.filter(c=>c.kind==='say'&&c.from>=v.from&&c.from<v.from+v.n);let bi=0;says.forEach((c,n)=>{if(c.from<=global)bi=n});const line=says[bi],beat=!!line&&hasBeat(key,bi),bp=line?Math.max(0,(global-line.from)/score.fps):0;const firstPlain=says.find((_,n)=>!hasBeat(key,n));const original=beat?undefined:originalKind(key),phone=!beat&&phoneViews.has(key),isProto=v.chapter===5&&global>=poc;const tone=(beat&&beatBg(key))||toneFor(key),bg=original?originalBg(key):tone.bg,ink=original?(bg===P.paper?P.brown:P.lite):tone.ink;
 const cap=captions?score.cues.find(c=>c.from<=global&&global<c.from+c.n):undefined;
 const screen=key==='boundary'?'searchResult':key==='proto'?'autoOn':key;
 const freeze=key==='boundary'||key==='proto';const phoneTime=key==='boundary'?3:key==='proto'?0:t;
 const mark=isProto?(phone?'출시 전 시제품 · 재현 화면':''):phone?(v.chapter>=4?'시연 빌드 · 재현 화면':'출시판 · 재현 화면'):'';
 const h=captions?620:720;
 return <AbsoluteFill data-view={key} style={{background:bg,color:ink,fontFamily:"TeamPretendard,'Apple SD Gothic Neo',sans-serif",fontWeight:500,overflow:'hidden'}}>
 {beat?<div style={{position:'absolute',inset:0,bottom:captions?69:0}}><Beat k={key} i={bi} p={bp} d={line.n/score.fps} t={t} ink={ink} bg={bg} sub={tone.secondary}/></div>:original?<TeamStage view={key} t={key==='tax'&&firstPlain?Math.max(0,(global-firstPlain.from)/score.fps):t}/>:phone?<Phone view={screen} t={phoneTime} duration={v.n/score.fps} height={h} frozenCamera={freeze} stageBackground={bg}/>:<div style={{position:'absolute',inset:0,bottom:captions?69:0}}><Slide k={key} t={t}/></div>}
 {mark&&<div data-demo-status style={{position:'absolute',left:44,bottom:captions?108:34,fontSize:21,lineHeight:1.4,color:tone.secondary,whiteSpace:'nowrap'}}>{mark}</div>}
 {cap&&cap.kind!=='clip'&&<div data-rehearsal-caption style={{position:'absolute',left:24,right:24,bottom:14,height:50,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',textAlign:'center'}}><span data-caption-role={key==='voiceListen'?'dictation':'presenter'} style={{...(key==='voiceListen'?{background:bg}:captionPaint),borderRadius:key==='voiceListen'?0:2,padding:'4px 12px',fontSize:cap.kind==='wait'?23:29,letterSpacing:'-.025em',lineHeight:1.35,whiteSpace:'nowrap'}}>{cap.kind==='wait'?'['+cap.text+']':cap.text}</span></div>}
 </AbsoluteFill>};
export const Film:React.FC<{captions:boolean}>=({captions})=><AbsoluteFill
 style={{
  background: P.paper
 }}
><Font/>{score.chapters.map((ch,i)=><Sequence key={ch.title} from={ch.from} durationInFrames={ch.n} name={`${String(i+1).padStart(2,'0')} · ${ch.title}`}>{score.views.filter(v=>v.chapter===i).map(v=><Sequence key={v.key} from={v.from-ch.from} durationInFrames={v.n} name={v.action}><View v={v} captions={captions}/></Sequence>)}</Sequence>)}<Sequence from={mid.from} durationInFrames={mid.n} name="팀 인터뷰 원음 · 11.7초"><Audio src={staticFile('team/interview.m4a')}/></Sequence></AbsoluteFill>;
