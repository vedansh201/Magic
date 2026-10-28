import {useRef,useCallback,useEffect} from 'react';
export default function useSound(enabled){
 const context=useRef();
 useEffect(()=>{if(!enabled)context.current?.suspend();},[enabled]);
 useEffect(()=>()=>{context.current?.close();},[]);
 return useCallback((frequency=160)=>{
  if(!enabled)return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  const ctx=context.current??=new Audio();ctx.resume();
  [1,1.5,2.01].forEach((multiple,i)=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency*multiple,ctx.currentTime);oscillator.frequency.exponentialRampToValueAtTime(frequency*multiple*.65,ctx.currentTime+1.2);gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.035/(i+1),ctx.currentTime+.04);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+1.4);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start();oscillator.stop(ctx.currentTime+1.5);});
 },[enabled]);
}
