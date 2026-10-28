import {useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export default function FilmScene({src,muted,reduced,revealed,onChoose}){
 const video=useRef(),section=useRef(),stage=useRef();
 const [needsPlay,setNeedsPlay]=useState(false),[error,setError]=useState(false),[sealed,setSealed]=useState(false),[playing,setPlaying]=useState(false);
 useEffect(()=>{setError(false);setNeedsPlay(false);},[src]);
 useEffect(()=>{
  if(reduced){setSealed(false);return;}
  const ctx=gsap.context(()=>{
   const tl=gsap.timeline({scrollTrigger:{
    trigger:section.current,
    start:()=>`top -${Math.max(0,document.querySelector('#surgeon').offsetHeight-innerHeight)}`,
    end:'bottom bottom',scrub:.65,invalidateOnRefresh:true,
    onUpdate:s=>{setSealed(s.progress>=.54);section.current.dataset.sealProgress=s.progress.toFixed(3);},
   }});
   tl.to('.film-quote',{y:-35,opacity:0,duration:.22,ease:'power1.inOut'},.31);
   for(let i=0;i<10;i++){
    const horizontal=i%2===0;
    const prop=horizontal?'xPercent':'yPercent', axis=horizontal?'x':'y';
    for(let side=0;side<2;side++)tl.fromTo(`.seal-wave-${i} .seal-half-${side}`,{[axis]:0,[prop]:side?101:-101},{[axis]:0,[prop]:0,duration:.044,ease:'power2.inOut'},.50+i*.049);
   }
   // Explicit end keeps both completed closures on screen before the next scene.
   tl.to({}, {duration:.03},.99);
  },section);
  return()=>ctx.revert();
 },[reduced]);
 useEffect(()=>{
  if(!src)return;
  const el=video.current;let visible=false,active=true;
  const sync=()=>{
   if(visible&&revealed&&!sealed&&!document.hidden&&!reduced){
    el.play().then(()=>{if(active)setNeedsPlay(false);}).catch(()=>{if(active)setNeedsPlay(true);});
   }else el.pause();
  };
  // Observe the sticky viewport, not the several-screen-long scroll container.
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting&&e.intersectionRatio>=.35;sync();},{threshold:.35});
  observer.observe(stage.current);document.addEventListener('visibilitychange',sync);
  return()=>{active=false;observer.disconnect();document.removeEventListener('visibilitychange',sync);el.pause();};
 },[src,reduced,revealed,sealed]);
 return <section id="awakening" className={`film-chapter ${reduced?'film-no-motion':''}`} ref={section} aria-label="The awakening">
  <div className="film-stage" ref={stage}>
   <div className="film-content" inert={sealed||!revealed}>
    {src?<><video ref={video} src={src} muted={muted} playsInline preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setError(true)} aria-label="Butterfly and astral journey film clip"/>
     <button className="quiet-playback" aria-label={playing?'Pause film':'Play film'} onClick={()=>{const el=video.current;if(el.paused)el.play().catch(()=>setNeedsPlay(true));else el.pause();}}>{playing?'Pause':'Play'}</button>
     {needsPlay&&<button className="play-film" onClick={()=>video.current.play().then(()=>setNeedsPlay(false)).catch(()=>setError(true))}>PLAY THE SCENE</button>}
     {error&&<div className="film-unavailable"><p>This clip could not be played.</p><button className="text-button" onClick={onChoose}>Choose another video</button></div>}
    </>:<div className="film-unavailable"><p>Add the butterfly scene to bring this moment to life.</p><button className="text-button" onClick={onChoose}>CHOOSE THE FILM CLIP ↗</button></div>}
    <div className="film-shade" aria-hidden="true"/>
    <div className="film-quote"><p>Everything you know</p><h2>is only<br/>a <em>fraction</em></h2><span>of what is.</span></div>
   </div>
   {!reduced&&<div className="seal-panels" aria-hidden="true">{Array.from({length:10},(_,i)=><div key={i} className={`seal-wave seal-wave-${i} ${i%2?'vertical':'horizontal'}`} style={{zIndex:i+1,'--panel-color':i===9?'#000':`rgb(${Math.round(21-i*2)},${Math.round(20-i*2)},${Math.round(17-i*1.8)})`}}>{[0,1].map(side=><div key={side} className={`seal-panel seal-half-${side}`}/>)}</div>)}</div>}
  </div>
 </section>;
}
