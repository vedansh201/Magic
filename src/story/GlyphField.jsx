import {useEffect,useRef} from 'react';
// Invented geometric glyphs; these are not characters from a written language.
const paths=['M-10 -14L10 14M10 -14L-10 14M0 -19V19M-13 0H13','M0 -18L12 0L0 18L-12 0ZM-5 -8V8M5 -8V8','M-10 -16H10L-10 16H10M0 -20V20','M-12 -12L0 -19L12 -12V12L0 19L-12 12ZM-8 0H8','M-12 17V-17L12 0ZM0 -20V20M-5 -7H8','M-12 -15H12M0 -15V18M-12 0H12M-8 12L0 18L8 12'];
export default function GlyphField({reduced,progress}){
 const ref=useRef();
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas.getContext('2d');if(!ctx)return;
  const shapes=paths.map(p=>new Path2D(p));let w,h,frame,visible=false,pressed=0;
  const pointer={x:0,y:0};let time=0,last=performance.now();
  const count=innerWidth<700?32:65;
  const particles=Array.from({length:count},(_,i)=>({x:((i*73.13)%101)/101,y:((i*37.71)%97)/97,z:.25+(i%7)/7,rotation:i*.71,shape:i%shapes.length,speed:.3+(i%5)*.14}));
  const resize=()=>{const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);if(reduced)draw(performance.now());};
  const move=e=>{const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/w-.5;pointer.y=(e.clientY-r.top)/h-.5;};
  const cast=()=>{if(reduced)draw(performance.now());};
  function draw(now){
   if(!reduced)frame=requestAnimationFrame(draw);
   const dt=Math.min(.05,(now-last)/1000);last=now;
   if((!visible&&!reduced)||document.hidden)return;
   const phase=progress?.current||0;
   // Drift time freezes as soon as the pinned section starts scrolling.
   if(!reduced&&phase===0)time+=dt;
   const spin=phase*Math.PI*1.4+Math.pow(Math.max(0,(phase-.55)/.45),3)*Math.PI*8;
   canvas.dataset.frozen=String(phase>0);canvas.dataset.rotation=String(reduced?0:spin);
   ctx.clearRect(0,0,w,h);
   const angle=reduced?0:spin,cs=Math.cos(angle),sn=Math.sin(angle);
   const objects=particles.map((p,i)=>{
    const drift=reduced?0:time*p.speed;
    const entry=reduced?0:Math.max(0,1-time/2.8)*w*.65;
    const x=((p.x*w-time*13*p.speed+w*5)%(w+120))-60+Math.sin(drift*.5+i)*32+entry-w/2;
    const y=(p.y-.5)*h*.86+Math.cos(drift*.4+i)*27;
    const z=Math.sin(i*2.399)*Math.min(w,h)*.36;
    const rx=x*cs+z*sn,rz=-x*sn+z*cs;
    const perspective=900/Math.max(260,900+rz);
    return {p,i,x:w/2+rx*perspective,y:h/2+y*perspective,z:rz,scale:perspective*(.35+p.z*.85)};
   }).sort((a,b)=>b.z-a.z);
   objects.forEach(({p,i,x,y,scale})=>{
    ctx.save();ctx.translate(x,y);ctx.rotate(p.rotation+Math.sin(time*p.speed*.2)*.25);ctx.scale(scale,scale);
    const blend=Math.min(1,phase*2.5),red=Math.round(255*(1-blend)+75*blend),green=Math.round((150+i%4*12)*(1-blend)+245*blend);
    ctx.strokeStyle=`rgba(${red},${green},${Math.round(58+blend*75)},${.25+p.z*.5})`;
    ctx.shadowColor=blend>.4?'#52ff83':'#ff791f';ctx.shadowBlur=p.z>.7?14:4;ctx.lineWidth=1.2;ctx.stroke(shapes[p.shape]);ctx.restore();
   });
  }
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(reduced&&visible)draw(performance.now());});observer.observe(canvas);const ro=new ResizeObserver(resize);ro.observe(canvas);resize();const scroll=()=>{if(reduced)draw(performance.now());};window.addEventListener('scroll',scroll,{passive:true});if(!reduced)frame=requestAnimationFrame(draw);canvas.parentElement.addEventListener('pointermove',move);canvas.parentElement.addEventListener('click',cast);const parent=canvas.parentElement;
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);observer.disconnect();ro.disconnect();parent.removeEventListener('pointermove',move);parent.removeEventListener('click',cast);};
 },[reduced]);
 return <canvas ref={ref} className="glyph-canvas" aria-hidden="true"/>;
}
