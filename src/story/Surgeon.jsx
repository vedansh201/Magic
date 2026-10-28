import {useEffect,useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
export function SurgeonScene({image,clone=false}){
 return <div className={`surgeon-scene ${image?'with-image':''}`}>
 {image&&<img className="surgeon-photo" src={image} alt={clone?'':'User-selected Doctor Strange surgeon scene'}/>}
 <div className="hospital-light"/><div className="hospital-grid"/>
 <div className="clinical-visual" aria-hidden="true"><div className="scan scan-one"/><div className="scan scan-two"/><svg viewBox="0 0 700 120"><path d="M0 65H160L172 50L185 78L200 12L218 110L233 65H340L352 50L365 78L380 12L398 110L413 65H700"/></svg><span>NEUROSURGERY / NEW YORK</span></div>
 <div className="surgeon-copy">{clone?<div className="surgeon-title">A brilliant mind.<br/>A fragile <em>world.</em></div>:<h1 className="surgeon-title">A brilliant mind.<br/>A fragile <em>world.</em></h1>}<div className="surgeon-biography"><span className="fine-rule"/><p>DR. STEPHEN STRANGE</p><p>His hands could do what others thought impossible.<br/>His mind left no room for anything he couldn’t explain.</p><p>A celebrated neurosurgeon. A life measured in precision,<br/>prestige, and the absolute certainty of being right.</p></div></div>
 <div className="scroll-invitation"><span>SCROLL TO LET GO</span><i/></div>
 </div>;
}
export default function Surgeon({image,reduced,onProgress}){
 const section=useRef(),sheet=useRef(),tiles=useRef();
 useEffect(()=>{
  if(reduced)return;
  const ctx=gsap.context(()=>{
   const tl=gsap.timeline({scrollTrigger:{trigger:section.current,start:'top top',end:'bottom bottom',scrub:.65,onUpdate:s=>onProgress(s.progress)}});
   tl.to('.intact-sheet',{opacity:0,duration:.01},.2).set(tiles.current,{visibility:'visible'},.2);
   gsap.utils.toArray('.paper-tile').forEach((tile,i)=>{
    const col=i%4,row=Math.floor(i/4),sign=col%2?1:-1;
    tl.to(tile,{rotationX:(row-1)*70+sign*35,rotationY:sign*(65+(i%3)*24),rotationZ:(i%2?1:-1)*18,xPercent:(1.5-col)*40,yPercent:(1-row)*35,z:-(i%3)*100,duration:.54,ease:'power2.inOut'},.22+(i%4)*.025);
   });
   tl.to(sheet.current,{scale:.055,rotation:27,yPercent:-7,duration:.6,ease:'power2.in'},.4).to(sheet.current,{opacity:0,duration:.12},.9);
  },section);
  return()=>{ctx.revert();onProgress(0);};
 },[reduced,onProgress]);
 return <section ref={section} id="surgeon" className={`fold-chapter ${reduced?'no-fold':''}`}><div className="fold-sticky"><div className="paper-sheet" ref={sheet}><div className="intact-sheet"><SurgeonScene image={image}/></div>{!reduced&&<div className="paper-tiles" ref={tiles} aria-hidden="true">{Array.from({length:12},(_,i)=><div key={i} className="paper-tile" style={{left:`${i%4*25}%`,top:`${Math.floor(i/4)*100/3}%`,transformOrigin:`${i%4%2?'0':'100%'} ${Math.floor(i/4)%2?'0':'100%'}`}}><div className="tile-content" style={{left:`-${i%4*100}%`,top:`-${Math.floor(i/4)*100}%`}}><SurgeonScene image={image} clone/></div><div className="crease"/></div>)}</div>}</div></div></section>;
}
