import {useEffect,useRef} from 'react';
import StoneGem from './StoneGem';
// Anchor measured from the supplied 590 × 350 composition. All coordinates scale
// with the *contained image*, so the stone remains at the fingers on every screen.
const crop={x:46,y:82,w:30,h:36};
export default function StoneReveal({src,onChoose}){
 const root=useRef(),photo=useRef();
 useEffect(()=>{
  const update=()=>{const el=root.current;if(!el)return;const w=el.clientWidth,h=el.clientHeight;
   const ratio=photo.current?.naturalWidth/photo.current?.naturalHeight||590/350;
   const pw=Math.min(w,h*ratio),ph=pw/ratio;
   el.style.setProperty('--anchor-x',`${(w-pw)/2+(crop.x+crop.w/2)/590*pw}px`);
   el.style.setProperty('--anchor-y',`${(h-ph)/2+(crop.y+crop.h/2)/350*ph}px`);
   el.style.setProperty('--anchor-w',`${crop.w/590*pw}px`);
  };const ro=new ResizeObserver(update);ro.observe(root.current);photo.current?.addEventListener('load',update);update();
  const img=photo.current;return()=>{ro.disconnect();img?.removeEventListener('load',update);};
 },[src]);
 return <div className="stone-reveal" ref={root}>
  {src?<>
   <img className="stone-photo" ref={photo} src={src} alt="Doctor Strange holding the Time Stone between his fingers"/>
   <div className="stone-source-shade" aria-hidden="true"/>
   <div className="stone-object" aria-hidden="true"><div className="stone-aura"/><StoneGem/></div>
  </>:<div className="stone-missing"><h2>The Time Stone</h2><button className="text-button" onClick={onChoose}>CHOOSE STRANGE’S IMAGE ↗</button></div>}
  <div className="stone-copy stone-copy-left"><h2>A moment.<br/><em>An eternity.</em></h2><p>The Time Stone grants control over the flow of time: a moment can be slowed, reversed, or held in a repeating loop.</p></div>
  <div className="stone-copy stone-copy-right"><h3>One stone.<br/>Countless possibilities.</h3><p>Once protected within the Eye of Agamotto, it allowed Strange to glimpse possible futures—and choose a path through them.</p><span>THE TIME STONE</span></div>
 </div>;
}
