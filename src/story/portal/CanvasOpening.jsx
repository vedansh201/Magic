import {useEffect,useRef} from 'react';

// A black canvas is cut away by an expanding portal. All sparks are drawn live.
export default function Opening({reduced,onComplete}){
 const ref=useRef();
 useEffect(()=>{
  if(reduced){onComplete();return;}
  const canvas=ref.current,ctx=canvas.getContext('2d');
  if(!ctx){onComplete();return;}
  let w=innerWidth,h=innerHeight,frame;
  const resize=()=>{w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);};resize();
  const sparks=Array.from({length:w<700?650:1500},()=>({a:Math.random()*Math.PI*2,age:Math.random(),speed:.5+Math.random(),len:Math.random()*5+1}));
  const start=performance.now();
  const draw=now=>{
   const t=(now-start)/1000;
   ctx.globalCompositeOperation='source-over';ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
   const base=Math.min(w*.28,h*.3),grow=Math.max(0,Math.min(1,(t-3.6)/1.6));
   const radius=base+Math.pow(grow,3)*Math.hypot(w,h);
   const sweep=Math.max(0,Math.min(1,(t-1.05)/2.1))*Math.PI*2;
   if(t>2.5){ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(w/2,h/2,Math.max(0,radius-5),0,Math.PI*2);ctx.globalAlpha=Math.min(1,(t-2.5)/.9);ctx.fill();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
   if(t>.6){
    const angle=-Math.PI/2+sweep;
    const x=w/2+Math.cos(angle)*radius,y=h/2+Math.sin(angle)*radius;
    const halo=ctx.createRadialGradient(x,y,0,x,y,24);halo.addColorStop(0,'#fff2bb');halo.addColorStop(.1,'#ffa33f');halo.addColorStop(1,'#ff790000');ctx.fillStyle=halo;ctx.fillRect(x-24,y-24,48,48);
   }
   if(t>1.05){
    ctx.strokeStyle='#ffbc68';ctx.lineWidth=1.4;ctx.shadowColor='#ff8e27';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(w/2,h/2,radius,-Math.PI/2,-Math.PI/2+sweep);ctx.stroke();ctx.shadowBlur=0;
    sparks.forEach(s=>{if(s.a>sweep)return;const life=(s.age+t*s.speed)%1;const a=s.a-Math.PI/2+t*.08;const r=radius+life*life*42;const x=w/2+Math.cos(a)*r,y=h/2+Math.sin(a)*r;ctx.strokeStyle=`rgba(255,${120+Math.floor(s.age*100)},${45+Math.floor(s.age*80)},${(1-life)*.9})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a+.8)*s.len*(1+life*3),y+Math.sin(a+.8)*s.len*(1+life*3));ctx.stroke();});
   }
   if(t>5.3){onComplete();return;}frame=requestAnimationFrame(draw);
  };frame=requestAnimationFrame(draw);window.addEventListener('resize',resize);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);};
 },[reduced,onComplete]);
 return <div className="opening" role="region" aria-label="Opening portal"><canvas ref={ref} aria-hidden="true"/><button className="skip-opening" onClick={onComplete}>Skip opening</button></div>;
}
