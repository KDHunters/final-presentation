import React from 'react';
import {AbsoluteFill,Audio,Sequence,staticFile,useCurrentFrame} from 'remotion';
import {View,Font} from './Film';
import score from './score.json';
import edit from './narrated.json';
const clip=edit.views.find(v=>v.key==='interview')!;
export const Narrated:React.FC<{captions:boolean}>=({captions})=>{const f=useCurrentFrame(),c=edit.cues.find(c=>f>=c.from&&f<c.from+c.n)!;const old=c.old+(c.n===1?0:Math.round((f-c.from)*(c.oldN-1)/(c.n-1)));const v=score.views.find(v=>old>=v.from&&old<v.from+v.n)!;return <AbsoluteFill><Font/><View v={v} captions={captions} frameOverride={old-v.from}/><Audio src={staticFile('noeul/narration.m4a')}/><Sequence from={clip.from} durationInFrames={clip.n}><Audio src={staticFile('team/interview.m4a')}/></Sequence></AbsoluteFill>};
