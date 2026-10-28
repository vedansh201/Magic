import {useEffect,useRef,useState} from 'react';
import CanvasOpening from './portal/CanvasOpening';

export default function Opening({reduced,onComplete,image}){
 const host=useRef(),engine=useRef(),latestImage=useRef(image);const [fallback,setFallback]=useState(false);
 useEffect(()=>{latestImage.current=image;engine.current?.setImage(image);},[image]);
 useEffect(()=>{
  if(reduced){onComplete();return;}
  if(fallback)return;
  let cancelled=false;
  import('./portal/createPortal').then(({createPortal})=>{
   if(cancelled)return;
   try{engine.current=createPortal(host.current,{image:latestImage.current,onComplete,onFailure:()=>setFallback(true)});}
   catch{if(!cancelled)setFallback(true);}
  }).catch(()=>{if(!cancelled)setFallback(true);});
  return()=>{cancelled=true;engine.current?.dispose();engine.current=null;};
 },[reduced,onComplete,fallback]);
 if(fallback)return <CanvasOpening reduced={reduced} onComplete={onComplete}/>;
 return <div className="opening realistic-opening" role="region" aria-label="Opening portal"><div className="portal-viewport" ref={host} aria-hidden="true"/><button className="skip-opening" onClick={onComplete}>Skip opening</button></div>;
}
