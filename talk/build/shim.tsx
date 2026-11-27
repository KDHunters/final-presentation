// Remotion 없이 같은 장면 코드를 돌리기 위한 최소 대체품. 프레임은 덱이 직접 넣는다.
import React from 'react';
export const FrameCtx = React.createContext(0);
export const useCurrentFrame = () => React.useContext(FrameCtx);
export const AbsoluteFill = ({style, children, ...rest}: any) => <div {...rest} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', ...style}}>{children}</div>;
export const Img = (p: any) => <img draggable={false} {...p} />;
export const staticFile = (p: string) => 'assets/' + p;
export const delayRender = (_?: string) => 0;
export const continueRender = (_: number) => {};
export const Sequence = ({children}: any) => <>{children}</>;
export const Freeze = ({children}: any) => <>{children}</>;
export const Audio = (_: any) => null;
export const OffthreadVideo = (_: any) => null;
export const getRemotionEnvironment = () => ({isStudio: false, isRendering: false});
export const getInputProps = () => ({});
