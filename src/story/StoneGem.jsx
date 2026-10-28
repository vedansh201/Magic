import {useEffect,useRef,useState} from 'react';
export default function StoneGem(){
 const host=useRef();const [fallback,setFallback]=useState(false);
 useEffect(()=>{let cancelled=false,dispose;import('./stone/createGem').then(({createGem})=>{if(cancelled)return;try{dispose=createGem(host.current);}catch{setFallback(true);}}).catch(()=>!cancelled&&setFallback(true));return()=>{cancelled=true;dispose?.();};},[]);
 return <div ref={host} className="stone-webgl" aria-hidden="true">{fallback&&<svg className="gem-fallback" viewBox="0 0 160 220"><path d="M80 8L135 48L155 112L118 187L80 214L28 182L7 105L28 42Z" fill="#206e44" stroke="#92eab2"/><path d="M80 8L113 65L135 48M113 65L155 112L108 160L80 214M108 160L28 182L50 65L28 42M50 65L113 65L108 160L50 65" fill="#53c488" stroke="#b3f5c8"/></svg>}</div>;
}
