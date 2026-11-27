import {PriorTalk} from './PriorTalk';import {InitialTalk} from './InitialTalk';import prior from './livecut-prior.json';import initial from './livecut-initial.json';
import {FoldPresentation} from './FoldPresentation';
import fullTalk from './livecut.json';
import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import score from './score.json';
import {Narrated} from './Narrated';
import narrated from './narrated.json';
export const Root: React.FC=()=> <>
 <Composition id="Hyunseok-Rehearsal" component={Film} durationInFrames={score.total} fps={score.fps} width={1280} height={720} defaultProps={{captions:true}}/>
 <Composition id="Audience-Screen" component={Film} durationInFrames={score.total} fps={score.fps} width={1280} height={720} defaultProps={{captions:false}}/>
 <Composition id="Noeul-Narrated" component={Narrated} durationInFrames={narrated.total} fps={24} width={1280} height={720} defaultProps={{captions:true}}/>
 <Composition id="Fold5-Full-Talk" component={FoldPresentation} durationInFrames={fullTalk.total} fps={24} width={1280} height={720}/>
 <Composition id="Fold5-Prior" component={PriorTalk} durationInFrames={prior.total} fps={24} width={1280} height={720}/>
 <Composition id="Fold5-Original" component={InitialTalk} durationInFrames={initial.total} fps={24} width={1280} height={720}/>
</>;
