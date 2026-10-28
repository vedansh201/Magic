import {useEffect,useRef} from 'react';
import GlyphField from './GlyphField';
import StoneReveal from './StoneReveal';
export default function TimeScene({reduced,stone,onChoose}){
 const root=useRef(),progress=useRef(0);
 useEffect(()=>{
  const clamp=v=>Math.max(0,Math.min(1,v));
  const update=()=>{
   const el=root.current,r=el.getBoundingClientRect();
   const spinTravel=reduced?0:innerHeight*2;
   const storyTravel=Math.max(1,el.offsetHeight-innerHeight-spinTravel);
   const p=clamp(-r.top/storyTravel);
   const spin=reduced?0:clamp((-r.top-storyTravel)/spinTravel);
   el.style.setProperty('--stone-rotation',String(spin));
   progress.current=clamp(p/.52);
   const lift=clamp((p-.66)/.30),light=reduced?0:Math.min(clamp((p-.48)/.05),1-clamp((p-.57)/.07));
   el.style.setProperty('--time-progress',progress.current);
   el.style.setProperty('--burst-light',light);
   document.documentElement.style.setProperty('--scene-light',String(light));
   el.style.setProperty('--stone-lift',lift);
   el.style.setProperty('--stone-photo-opacity',clamp(1-lift*1.65));
   el.style.setProperty('--stone-copy-opacity',clamp((lift-.35)/.4));
   el.dataset.phase=spin>0?'stone-rotate':p>=.66?'stone-lift':p>=.54?'stone-image':progress.current>.55?'accelerating':p>0?'time':'magic';
   const reveal=el.querySelector('.stone-reveal');reveal.style.visibility=p>=.54?'visible':'hidden';reveal.inert=p<.54;
   el.querySelector('.time-copy').style.visibility=p>=.54?'hidden':'visible';
  };
  update();addEventListener('scroll',update,{passive:true});addEventListener('resize',update);
  return()=>{removeEventListener('scroll',update);removeEventListener('resize',update);document.documentElement.style.removeProperty('--scene-light');};
 },[reduced]);
 return <section id="mystic" className={`time-chapter stone-chapter ${reduced?'time-reduced':''}`} ref={root}><div className="time-stage"><GlyphField reduced={reduced} progress={progress}/><div className="time-copy"><div className="magic-words"><h2>Magic has<br/><em>no limits.</em></h2></div><div className="time-words"><h2>Even time<br/><em>can bend.</em></h2></div></div><StoneReveal src={stone} onChoose={onChoose}/><div className="time-burst" aria-hidden="true"/></div></section>;
}
