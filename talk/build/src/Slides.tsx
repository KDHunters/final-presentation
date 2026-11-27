import React from 'react';
import {Img, staticFile} from 'remotion';
import {toneFor,dataAccent,dataTrack} from './stage-tones';
export const palette={paper:'#FAF7E9',brown:'#392A20',navy:'#2B2C43',lite:'#F2E4C9',butter:'#FFE98A'};
const {paper,brown,lite}=palette, secondary='#655a4e';
const center:React.CSSProperties={position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'};
const block:React.CSSProperties={width:865,margin:'0 auto',letterSpacing:'-.025em',lineHeight:1.44};
const source:React.CSSProperties={fontSize:24,color:secondary,marginTop:22,lineHeight:1.45};
const dataSource:React.CSSProperties={...source,color:toneFor('retention').secondary};
function Dog({t,mail=false,size=128}:{t:number;mail?:boolean;size?:number}){return <Img src={staticFile(`pet/${mail?'mailalert':'idle'}-${Math.floor(t*3.2)%4}.png`)} style={{width:size,height:size,objectFit:'contain',imageRendering:'pixelated'}}/>}
function Reach({showNumber}:{showNumber:boolean}){return <div style={block}><div style={{fontSize:35}}>구글 플레이 출시 <span style={{marginLeft:14}}>22개 국가·지역</span></div><div style={{marginTop:22,visibility:showNumber?'visible':'hidden'}}><div style={{fontSize:42}}>누적 사용자 <span style={{fontSize:56,marginLeft:12,fontVariantNumeric:'tabular-nums'}}>7,770명</span></div><div style={{...dataSource,marginTop:8}}>11월 26일 기준</div></div></div>}
function Retention(){return <figure style={{...block,margin:0}}><figcaption style={{fontSize:36}}>처음 쓴 날로부터 7일 뒤, 다시 앱이나 메모를 연 비율</figcaption><div style={{fontSize:61,lineHeight:1.2,margin:'22px 0 14px',fontVariantNumeric:'tabular-nums'}}>23.5%</div><svg width={730} height={18} role="img" aria-label="전체 설치 중 23.5퍼센트"><rect width="730" height="18" fill={dataTrack}/><rect width={730*1120/4770} height="18" fill={dataAccent}/></svg><div style={dataSource}>4,770개 설치 중 1,120개 · 11월 25일 집계</div></figure>}
function Letter({br}:{br:boolean}){return <figure style={{...block,margin:0}}><div style={{fontSize:br?38:41,lineHeight:1.57,whiteSpace:'pre-line'}}>{br?'본인뿐 아니라 상담받는 분들에게도\n도움이 됐다고 적어주셨습니다.':'“처음 써보는데, 제가 워낙 깜빡하는 편이라\n한번 사용해 보려고요.”'}</div><figcaption style={source}>{br?'브라질에서 심리교육 일을 한다고 밝힌 사용자 · 답장 요지':'한국 사용자 · 앱 우편함에 남긴 답장'}</figcaption></figure>}
function Respondents(){return <figure style={{...block,margin:0}}><figcaption style={{fontSize:35,lineHeight:1.55}}>답장에서 ADHD를 직접 밝힌 26명 가운데<br/><span style={{fontSize:42}}>12명이 사용량 상위 10%에 들었습니다.</span></figcaption><svg role="img" aria-label="26명 중 12명" width="780" height="30" viewBox="0 0 780 30" style={{display:'block',marginTop:26}}>{Array.from({length:26},(_,i)=><rect key={i} x={i*29+1} y={3} width={20} height={20} fill={i<12?dataAccent:dataTrack}/>)}</svg><div style={dataSource}>11월 9~22일 하루 평균 사용 점수 기준</div></figure>}
export const darkKeys=new Set(['friend','back','personalEnd','handoff']);
export const Slide:React.FC<{k:string;t:number}>=({k,t})=>{let child:React.ReactNode;
 switch(k){case 'beside':case 'friend':case 'back':case 'personalEnd':case 'handoff':child=<Dog t={t}/>;break;
 case 'countries':case 'reach':case 'week':child=<Reach showNumber={k!=='countries'}/>;break;
 case 'retention':child=<Retention/>;break;
 case 'mailbox':child=<div style={{display:'flex',alignItems:'center',gap:24}}><Dog t={t} mail size={100}/><span style={{fontSize:37}}>우편함에 온 답장 약 300건</span></div>;break;
 case 'letterKR':case 'letterBR':child=<Letter br={k==='letterBR'}/>;break;
 case 'heavy':child=<Respondents/>;break;
 default:throw Error('지정되지 않은 발표 화면: '+k);}
 return <div style={{...center,background:toneFor(k).bg,color:toneFor(k).ink}}>{child}</div>;
};
