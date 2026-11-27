// Sentence-by-sentence stage pictures. `i` is the spoken line inside the scene, `p` seconds into it.
import React from 'react';
import {Img, staticFile} from 'remotion';
const cl=(x:number)=>Math.max(0,Math.min(1,x));
const ez=(x:number)=>{x=cl(x);return x*x*(3-2*x)};
const inn=(p:number,at=0,d=.45)=>ez((p-at)/d);
const mix=(a:number,b:number,k:number)=>a+(b-a)*k;
const CREAM='#FAF7E9',BROWN='#392A20',BUTTER='#FFE98A',CARD='#FFFDF4';
export type BeatProps={k:string;i:number;p:number;d:number;t:number;ink:string;bg:string;sub:string};
const at=(l:number,t:number,w:number|string,h:number|string,s:React.CSSProperties={}):React.CSSProperties=>({position:'absolute',left:l,top:t,width:w,height:h,...s});
const Dog:React.FC<{t:number;x:number;y:number;size?:number;mail?:boolean;o?:number}>=({t,x,y,size=120,mail=false,o=1})=><Img src={staticFile(`pet/${mail?'mailalert':'idle'}-${Math.floor(t*3.2)%4}.png`)} style={at(x,y,size,size,{objectFit:'contain',imageRendering:'pixelated',opacity:o})}/>;
const Handset:React.FC<{x:number;y:number;w?:number;on?:number;children?:React.ReactNode}>=({x,y,w=200,on=1,children})=><div style={at(x,y,w,w*2.05,{borderRadius:w*.16,background:'#15100C',boxShadow:'0 0 0 2px #4a3f36'})}><div style={at(w*.04,w*.04,w*.92,w*2.05-w*.08,{borderRadius:w*.13,overflow:'hidden',background:'#0c0a08'})}><div style={{position:'absolute',inset:0,background:CREAM,opacity:on}}>{children}</div></div></div>;
const Tiles:React.FC<{w:number;o?:number}>=({w,o=1})=><>{Array.from({length:12},(_,n)=><div key={n} style={at(w*.1+(n%3)*w*.27,w*.22+Math.floor(n/3)*w*.3,w*.2,w*.2,{borderRadius:w*.05,background:'#D9D2BF',opacity:o})}/>)}</>;
const Bubble:React.FC<{x:number;y:number;w:number;o?:number;dashed?:boolean;size?:number;tail?:'down'|'none';children?:React.ReactNode}>=({x,y,w,o=1,dashed=false,size=34,tail='down',children})=><div style={at(x,y,w,size*2.3,{opacity:o})}><div style={{position:'absolute',inset:0,borderRadius:size*1.15,background:dashed?'transparent':CARD,border:dashed?`3px dashed ${CARD}`:'none',color:BROWN,fontSize:size,display:'flex',alignItems:'center',justifyContent:'center',letterSpacing:'-.02em'}}>{children}</div>{tail==='down'&&<><div style={at(w*.62,size*2.45,18,18,{borderRadius:9,background:dashed?'transparent':CARD,border:dashed?`3px dashed ${CARD}`:'none'})}/><div style={at(w*.62+26,size*2.45+24,10,10,{borderRadius:5,background:dashed?'transparent':CARD,border:dashed?`2px dashed ${CARD}`:'none'})}/></>}</div>;
const Envelope:React.FC<{x:number;y:number;w?:number;o?:number}>=({x,y,w=70,o=1})=><svg viewBox="0 0 70 48" style={at(x,y,w,w*48/70,{opacity:o})}><rect x="1.5" y="1.5" width="67" height="45" rx="5" fill={CARD} stroke={BROWN} strokeWidth="3"/><path d="M3 4 L35 28 L67 4" fill="none" stroke={BROWN} strokeWidth="3"/></svg>;
const Memo:React.FC<{x:number;y:number;w:number;h:number;o?:number;lines?:number}>=({x,y,w,h,o=1,lines=4})=><div style={at(x,y,w,h,{background:BUTTER,borderRadius:Math.min(w,h)*.08,opacity:o,boxShadow:'0 4px 12px rgba(0,0,0,.18)'})}>{Array.from({length:lines},(_,n)=><div key={n} style={at(w*.12,h*.16+n*(h*.68/lines),w*(n===lines-1?.45:.76),Math.max(3,h*.035),{background:BROWN,opacity:.45,borderRadius:3})}/>)}</div>;
const Ring:React.FC<{x:number;y:number;k:number;c?:string}>=({x,y,k,c=BROWN})=><div style={at(x-40,y-40,80,80,{borderRadius:40,border:`4px solid ${c}`,transform:`scale(${.4+k*.9})`,opacity:k<=0||k>=1?0:1-k})}/>;
const Person:React.FC<{x:number;y:number;ink:string;label:string;work:number}>=({x,y,ink,label,work})=><div style={at(x,y,300,330)}><div style={at(123,0,54,54,{borderRadius:27,background:ink})}/><div style={at(95,62,110,78,{borderRadius:'38px 38px 10px 10px',background:ink})}/><div style={at(0,150,300,14,{borderRadius:7,background:ink,opacity:.55})}/><div style={at(75,176,150,104,{borderRadius:8,background:CARD,boxShadow:'0 3px 8px rgba(0,0,0,.14)'})}>{[0,1,2,3].map(n=><div key={n} style={at(16,18+n*21,118*cl(work*4-n),7,{background:BROWN,opacity:.6,borderRadius:4})}/>)}</div><div style={at(0,292,300,40,{textAlign:'center',fontSize:30,color:ink})}>{label}</div></div>;
const Step:React.FC<{x:number;y:number;on:number;ink:string;children:React.ReactNode;dash?:boolean}>=({x,y,on,ink,children,dash})=><div style={at(x,y,260,84,{borderRadius:16,border:`3px ${dash?'dashed':'solid'} ${ink}`,background:on>0?ink:'transparent',opacity:.35+.65*Math.max(on,dash?.3:0),color:on>0?'#2B2C43':ink,fontSize:32,display:'flex',alignItems:'center',justifyContent:'center',letterSpacing:'-.02em'})}>{children}</div>;
const Days:React.FC<{ink:string;accent:string;track:string;fill:number;seven:number}>=({ink,accent,track,fill,seven})=><>{Array.from({length:8},(_,n)=>{const hit=n===7?seven:cl(fill*7-n+1);return <div key={n} style={at(170+n*100-(n===7?8*seven:0),250-(n===7?8*seven:0),40+(n===7?16*seven:0),40+(n===7?16*seven:0),{borderRadius:40,background:hit>0?accent:track,opacity:hit>0?.45+.55*hit:1})}/>})}<div style={at(170,270,740,0,{borderTop:`3px solid ${track}`,zIndex:-1})}/><div style={at(110,318,160,40,{textAlign:'center',fontSize:28,color:ink})}>처음 쓴 날</div><div style={at(810,318,160,40,{textAlign:'center',fontSize:28,color:ink})}>7일 뒤</div></>;

const Flash:React.FC<BeatProps>=({i,p,d,ink})=>{const note='관리비 내기';
 if(i<=1){const on=i===0?inn(p,2.3,.5):1;const gone=i===1?inn(p,.2,1.3):0;return <>
  <Bubble x={180} y={96} w={290} o={1-gone}>{note}</Bubble>
  <Bubble x={180} y={96} w={290} o={i===1?inn(p,1.3,.5):0} dashed><span style={{color:CARD,fontSize:46}}>?</span></Bubble>
  <Handset x={600} y={40} w={210} on={on}><Tiles w={193}/></Handset></>}
 const g=i===2?p/d*.42:i===3?.42+p/d*.2:i===4?.62+p/d*.2:.82;const fade=i<4?1:i===4?1-inn(p,.9,1.6):0;
 return <div style={{position:'absolute',left:0,top:56}}>
  <div style={at(110,214,860,0,{borderTop:`4px solid ${ink}`,opacity:i>=3?(i===3?inn(p,1.7,.5):1)*(i>=4?.35+.65*fade:1):0})}/>
  <div style={at(110,152,860,50,{textAlign:'center',fontSize:38,color:ink,opacity:i>=3?(i===3?inn(p,1.7,.5):1)*(i>=4?.35+.65*fade:1):0})}>작업 기억</div>
  <Bubble x={mix(100,620,g)} y={20} w={270} o={fade} tail="none">{note}</Bubble>
  <Step x={110} y={300} on={1} ink={ink}>휴대폰 꺼내기</Step><Step x={410} y={300} on={g>.4?1:0} ink={ink}>메모 앱 찾기</Step><Step x={710} y={300} on={0} ink={ink} dash>{i===5?<span style={{opacity:inn(p,.3,.5)}}>?</span>:'적기'}</Step>
  <div style={at(372,326,36,36,{fontSize:30,color:ink,textAlign:'center'})}>→</div><div style={at(672,326,36,36,{fontSize:30,color:ink,textAlign:'center'})}>→</div></div>};

const TaxStory:React.FC<BeatProps>=({i,p,d,ink})=>{const today=i===0?mix(2,6,ez(p/Math.max(1,d-.6))):6;const bill=i>=1?(i===1?inn(p,2.2,.5):1):0;return <>
 {Array.from({length:10},(_,n)=><div key={n} style={at(64+n*96,150,84,84,{borderRadius:12,background:n===2?BUTTER:n===9&&bill>0?'#E9C9C6':'#ECE5D2',color:BROWN,fontSize:28,display:'flex',alignItems:'center',justifyContent:'center',opacity:n<today-.5?.5:1})}>{n+1}</div>)}
 <div style={at(64+2*96-48,96,180,44,{textAlign:'center',fontSize:28,color:ink})}>해지하려던 날</div>
 <div style={at(64+today*96-18,244,120,44,{textAlign:'center',fontSize:28,color:ink})}>오늘</div>
 <div style={at(64+9*96-48,96,180,44,{textAlign:'center',fontSize:28,color:'#9c3b37',opacity:bill})}>결제일</div>
 {[2,1,0].map(n=>{const o=n===0?bill:i===2?inn(p,.6+n*.5,.4):0;return <div key={n} style={at(700-n*46,330+n*14+(1-o)*30,290,120,{borderRadius:14,background:CARD,border:`3px solid ${BROWN}`,opacity:o,color:BROWN,padding:'18px 22px',fontSize:28,lineHeight:1.45})}>구독 요금<br/><span style={{color:'#9c3b37'}}>결제 완료</span></div>})}
 <div style={at(64,356,520,80,{fontSize:58,color:ink,letterSpacing:'-.03em',opacity:i===2?inn(p,1.6,.5):0})}>ADHD 택스</div></>};

const Beside:React.FC<BeatProps>=({i,p,t,ink})=>{
 if(i<=1){const away=i===1?inn(p,1.3,.6):0;return <><Handset x={440} y={40} w={200}><Tiles w={184}/><div style={{position:'absolute',inset:0,transform:`translateY(${away*400}px)`}}><Memo x={8} y={30} w={168} h={340} lines={7}/></div></Handset>
  <div style={at(690,196,90,90,{fontSize:84,lineHeight:'90px',color:ink,opacity:i===1?inn(p,.5,.4)*(1-inn(p,2.2,.5)):0})}>×</div></>}
 if(i<=5){const mine=i<3?0:i===3?p/3.4:1;return <><Person x={150} y={60} ink={ink} label="나" work={mine}/><Person x={630} y={60} ink={ink} label="옆 사람" work={(t%9)/9+.25}/>
  <div style={at(0,430,1080,70,{textAlign:'center',fontSize:50,letterSpacing:'-.03em',color:ink,opacity:i<5?0:inn(p,.7,.5)})}>바디 더블링</div></>}
 if(i<=7){const k=i===6?inn(p,2.5,1.1):1;const tap=i===7?p-2.1:-1;const open=i===7?inn(p,2.5,.4):0;return <><Handset x={440} y={40} w={200}><Tiles w={184}/><div style={{position:'absolute',inset:0,opacity:1-k,transform:`translate(${k*60}px,${k*20}px) scale(${1-k*.75})`,transformOrigin:'100% 50%'}}><Memo x={8} y={30} w={168} h={340} lines={7}/></div></Handset>
  <Dog t={t} x={584} y={196} size={84} o={k}/><Ring x={626} y={238} k={tap/.6} c={ink}/>
  <div style={{position:'absolute',left:0,top:0,opacity:open,transform:`scale(${.7+.3*open})`,transformOrigin:'600px 240px'}}><Memo x={420} y={150} w={160} h={150}/></div></>}
 return <><Handset x={210} y={40} w={200}><Tiles w={184}/></Handset><Dog t={t} x={354} y={196} size={84}/>
  {[0,1,2].map(n=>{const o=i===8?inn(p,1.9+n*.5,.4):1;const ok=i===9?inn(p,.5+n*.45,.35):0;return <div key={n} style={at(540,70+n*130,360,96,{borderRadius:'26px 26px 26px 6px',background:CARD,opacity:o,transform:`translateX(${(1-o)*30}px)`})}><div style={at(28,30,220-n*30,9,{background:BROWN,opacity:.5,borderRadius:5})}/><div style={at(28,56,150+n*20,9,{background:BROWN,opacity:.5,borderRadius:5})}/><div style={at(296,22,52,52,{fontSize:40,lineHeight:'52px',color:'#3F7A4F',opacity:ok,textAlign:'center'})}>✓</div></div>})}</>};

const Boundary:React.FC<BeatProps>=({i,p,t,ink})=>{const pass=i===2?ez(p/4.6):0;return <>
 <Handset x={440} y={40} w={200}>{i===2?<div style={at(18,mix(300,-150,pass),148,120,{borderRadius:12,background:'#fff',boxShadow:'0 3px 8px rgba(0,0,0,.16)'})}><div style={at(16,22,116,10,{background:'#356684',borderRadius:5})}/><div style={at(16,52,84,9,{background:BROWN,opacity:.4,borderRadius:5})}/><div style={at(16,78,100,9,{background:BROWN,opacity:.4,borderRadius:5})}/></div>:<Tiles w={184} o={i>=3?.5:1}/>}</Handset>
 <Dog t={t} x={584} y={196} size={84}/>
 <Bubble x={90} y={110} w={320} size={32} o={i===0?inn(p,.5,.4):i===1?1:0}>이거 적어야겠다</Bubble>
 <Bubble x={90} y={110} w={320} size={32} o={i===2?.55:0} dashed/>
 <Ring x={626} y={238} k={i===1?(p-.9)/.6:i===3?((p%1.4)/1.1):-1} c={ink}/>
 <div style={{position:'absolute',left:0,top:0,opacity:i===1?inn(p,1.4,.4):0}}><Memo x={420} y={150} w={160} h={150}/></div>
 <div style={at(690,176,300,84,{borderRadius:'28px 28px 28px 6px',background:CARD,color:BROWN,fontSize:34,display:'flex',alignItems:'center',justifyContent:'center',opacity:i===4?inn(p,2.1,.4):0,transform:`scale(${i===4?.8+.2*inn(p,2.1,.4):1})`,transformOrigin:'0 100%'})}>적어둘까요?</div></>};

const Friend:React.FC<BeatProps>=({i,p,t,ink,sub})=>{
 if(i===0)return <><Img src={staticFile('demo/yard-topdown.webp')} style={at(380,70,320,320,{objectFit:'cover',borderRadius:28})}/><Dog t={t} x={480} y={180} size={120}/></>;
 if(i<=2){const k=i===1?inn(p,.3,.5):1;const strike=i===2?inn(p,1.5,.6):0;return <><Dog t={t} x={220} y={150} size={150}/>
  <div style={at(430,130,420,150,{borderRadius:22,background:CARD,color:BROWN,opacity:k,transform:`translateX(${(1-k)*-40}px)`,padding:'24px 30px'})}><div style={{fontSize:44,letterSpacing:'-.03em'}}>토요일 오후 4시</div><div style={{display:'inline-block',marginTop:14,fontSize:24,background:BUTTER,borderRadius:20,padding:'4px 16px'}}>Gmail · 발표 일정 안내</div></div>
  <div style={at(430,330,420,50,{fontSize:34,color:sub,opacity:i===2?inn(p,.6,.4):0})}><span style={{position:'relative'}}>메일 다시 찾기<span style={{position:'absolute',left:0,top:'54%',height:3,width:`${strike*100}%`,background:ink}}/></span></div></>}
 return <Dog t={t} x={465} y={150} size={150}/>};

const Week:React.FC<BeatProps>=({i,p,d,t,ink,sub})=>{const fill=i===1?p/d*.5:i===2?.5+p/d*.5:1;const q=i>=3?(i===3?inn(p,.3,.5):1):0;return <><Days ink={ink} accent="#356684" track="#C7D5DE" fill={fill} seven={q}/>
 <Dog t={t} x={148} y={150} size={84} o={1}/>
 <div style={at(850,138,80,90,{fontSize:76,lineHeight:'90px',textAlign:'center',color:ink,opacity:q})}>?</div></>};

const Counted:React.FC<BeatProps>=({i,p,ink,sub})=>{
 if(i<=1)return <><Days ink={ink} accent="#356684" track="#C7D5DE" fill={1} seven={1}/>{['앱 다시 열기','메모 보기','메모 고치기'].map((s,n)=>{const o=i===0?inn(p,1.7+n*.5,.4):1;return <div key={s} style={at(170+n*250,400,226,70,{borderRadius:35,border:`3px solid ${ink}`,color:ink,fontSize:30,display:'flex',alignItems:'center',justifyContent:'center',opacity:o,letterSpacing:'-.02em'})}>{s}</div>})}</>;
 const a=i===3?inn(p,.3,.5):1,b=i===4?inn(p,.2,.5):i>4?1:0;return <>
  <div style={at(110,130,860,110,{borderRadius:18,border:'3px dashed #9AAAB4',color:'#6B7C86',fontSize:36,display:'flex',alignItems:'center',padding:'0 34px',opacity:a,letterSpacing:'-.02em'})}><span style={{flex:1,textDecoration:'line-through'}}>강아지가 화면에 떠 있기만 한 날</span><span style={{fontSize:30}}>세지 않음</span></div>
  <div style={at(110,280,860,110,{borderRadius:18,background:'#356684',color:'#fff',fontSize:36,display:'flex',alignItems:'center',padding:'0 34px',opacity:b,letterSpacing:'-.02em'})}><span style={{flex:1}}>앱을 다시 열거나 메모를 쓴 날</span><span style={{fontSize:44,fontVariantNumeric:'tabular-nums'}}>23.5%</span></div></>};

const Mailbox:React.FC<BeatProps>=({i,p,d,t,ink})=>{const fly=i===0?ez((p-1.2)/2.2):1;return <><Dog t={t} x={170} y={150} size={150} mail/>
 <Handset x={740} y={50} w={180}>{i>=1&&<div style={at(22,90,122,150,{borderRadius:10,background:CARD,border:`3px solid ${BROWN}`,opacity:i===1?inn(p,.2,.5):1})}><div style={at(16,26,84,8,{background:BROWN,opacity:.5,borderRadius:4})}/><div style={at(16,50,66,8,{background:BROWN,opacity:.5,borderRadius:4})}/><div style={at(16,82,90,44,{fontSize:40,lineHeight:'44px',color:BROWN,textAlign:'center'})}>?</div></div>}</Handset>
 {i===0&&<Envelope x={mix(330,740,fly)} y={200-Math.sin(fly*Math.PI)*70} o={fly<=0||fly>=1?0:1}/>}
 {i===2&&Array.from({length:14},(_,n)=>{const k=ez((p-.2-n*.13)/1.3);const row=n%4,col=Math.floor(n/4);return <Envelope key={n} w={58} x={mix(740,340+col*74+(row%2)*20,k)} y={mix(220,70+row*74,k)} o={k<=0?0:1}/>})}
 <div style={at(310,420,560,60,{textAlign:'center',fontSize:42,color:ink,letterSpacing:'-.02em',opacity:i===2?inn(p,1.6,.5):0})}>답장 약 300건</div></>};

const Closing:React.FC<BeatProps>=({i,p,t,ink})=>{const spots=[[150,60],[300,250],[120,330],[800,70],[700,270],[880,320]];const o=i===1?1:i===2?1-inn(p,2.0,1.2):0;const near=[[300,120],[250,250],[330,360],[690,110],[740,250],[660,360],[470,400],[540,400]];return <>
 {spots.map(([x,y],n)=><div key={n} style={at(x,y,96,96,{borderRadius:22,background:ink,opacity:o*(i===1?inn(p,.2+n*.3,.4):1)*.28})}><Memo x={22} y={20} w={52} h={56} lines={3}/></div>)}
 <Dog t={t} x={465} y={150} size={150} mail={i>=3}/>
 {i>=3&&near.map(([x,y],n)=>{const k=i===3?ez((p-1.4-n*.3)/.7):1;return <Envelope key={n} x={x} y={y+(1-k)*24} w={62} o={k}/>})}</>};

const table:Record<string,[React.FC<BeatProps>,(i:number)=>boolean]>={flash:[Flash,()=>true],tax:[TaxStory,i=>i<=2],beside:[Beside,()=>true],boundary:[Boundary,()=>true],friend:[Friend,()=>true],week:[Week,i=>i>=1],retention:[Counted,i=>i!==2],mailbox:[Mailbox,()=>true],personalEnd:[Closing,()=>true]};
export const hasBeat=(k:string,i:number)=>!!table[k]&&table[k][1](i);
export const beatBg=(k:string)=>k==='flash'?{bg:'#2B2C43',ink:'#F2E4C9',secondary:'#C9C3B4'}:null;
export const Beat:React.FC<BeatProps>=(props)=>{const C=table[props.k][0];return <div data-beat={props.k+':'+props.i} style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{position:'relative',width:1080,height:500,flex:'none',transform:'scale(1.15)',color:props.ink,fontFamily:'inherit'}}><C {...props}/></div></div>};
