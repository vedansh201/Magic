import {useEffect,useRef} from 'react';
export default function MysticCursor({reduced}){
 const ref=useRef();
 useEffect(()=>{
  if(reduced||!matchMedia('(pointer:fine)').matches)return;
  const el=ref.current;document.documentElement.classList.add('mystic-pointer');
  let x=-100,y=-100,fx=x,fy=y,frame;
  const move=e=>{x=e.clientX;y=e.clientY;el.style.opacity='1';el.classList.toggle('hovering',!!e.target.closest('button,a,input,label,video'));};
  const leave=()=>el.style.opacity='0';const down=()=>el.classList.add('pressed');const up=()=>el.classList.remove('pressed');
  const draw=()=>{fx+=(x-fx)*.28;fy+=(y-fy)*.28;el.style.transform=`translate3d(${fx}px,${fy}px,0)`;frame=requestAnimationFrame(draw);};draw();
  document.addEventListener('pointermove',move);document.addEventListener('pointerleave',leave);document.addEventListener('pointerdown',down);document.addEventListener('pointerup',up);
  return()=>{cancelAnimationFrame(frame);document.documentElement.classList.remove('mystic-pointer');document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);document.removeEventListener('pointerdown',down);document.removeEventListener('pointerup',up);};
 },[reduced]);
 return <div className="mystic-cursor" ref={ref} aria-hidden="true"><i/><b/><span/></div>;
}
