import {useEffect, useRef} from 'react';
export default function Atmosphere({reduced}) {
 const ref=useRef();
 useEffect(()=>{
  if(reduced)return;
  const canvas=ref.current, ctx=canvas.getContext('2d');let w,h,frame;const sparks=[];
  const size=()=>{w=canvas.width=innerWidth;h=canvas.height=innerHeight;};size();
  const move=e=>{if(sparks.length<65)sparks.push({x:e.clientX,y:e.clientY,vx:(Math.random()-.5)*1.6,vy:-Math.random()*1.8,life:1});};
  window.addEventListener('resize',size);window.addEventListener('pointermove',move);
  const draw=()=>{ctx.clearRect(0,0,w,h);if(!document.hidden){for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.x+=p.vx;p.y+=p.vy;p.life-=.025;ctx.fillStyle=`rgba(255,178,91,${Math.max(0,p.life)*.6})`;ctx.fillRect(p.x,p.y,1.5,1.5);if(p.life<=0)sparks.splice(i,1);}for(let i=0;i<22;i++){const t=performance.now()*.00005;ctx.fillStyle=`rgba(222,161,90,${.12+(i%3)*.08})`;ctx.fillRect((i*173.7)%w,(h+i*103-t*(30+i))%h,1,2);}}frame=requestAnimationFrame(draw);};draw();
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',size);window.removeEventListener('pointermove',move);};
 },[reduced]);return <canvas ref={ref} className="atmosphere" aria-hidden="true"/>;
}
