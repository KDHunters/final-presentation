// The original team slides and everything drawn inside the phone keep their own colours.
const warm={bg:'#FAF7E9',ink:'#392A20',secondary:'#65594c'};
const warmNight={bg:'#392A20',ink:'#F2E4C9',secondary:'#F2E4C9'};
const prototype={bg:'#2B3045',ink:'#F4F3EE',secondary:'#D4DAE3'};
const figures={bg:'#EDF2F5',ink:'#233947',secondary:'#485E6B'};
const prototypeScenes=new Set('proto autoOn ticket ticketPrompt ticketSaved gmail gmailPrompt gmailSaved chatAsk chatAgree chatPrompt recallAsk recallWait recallPrompt recallReply friend back'.split(' '));
const figureScenes=new Set(['countries','reach','week','retention','heavy']);
export const toneFor=(key:string)=>prototypeScenes.has(key)?prototype:figureScenes.has(key)?figures:['personalEnd','handoff'].includes(key)?warmNight:warm;
export const dataAccent='#356684',dataTrack='#C7D5DE';
