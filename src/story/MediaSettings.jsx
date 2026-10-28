import {useEffect,useRef,useState} from 'react';
import {defaultMedia} from './media';
import {mediaCandidates} from './mediaPaths';
import {toPNG,downloadPNG} from './png';
const DB='mystic-story-media';
async function database(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>req.result.createObjectStore('assets');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function stored(key,value){const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('assets',value===undefined?'readonly':'readwrite');const store=tx.objectStore('assets');const request=value===undefined?store.get(key):value===null?store.delete(key):store.put(value,key);let result;request.onsuccess=()=>result=request.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);});}finally{db.close();}}
async function discover(key,signal){
 if(defaultMedia[key])return defaultMedia[key];
 for(const path of mediaCandidates[key]){
  try{const response=await fetch(path,{method:'HEAD',signal});if(response.ok&&response.headers.get('content-type')?.startsWith(key==='video'?'video/':'image/'))return path;}catch{if(signal.aborted)return null;}
 }
 return null;
}
export function useMedia(){
 const [media,setMedia]=useState({...defaultMedia,stone:defaultMedia.stone||null});const urls=useRef({}),defaults=useRef({...defaultMedia}),generation=useRef({image:0,video:0,stone:0});
 const set=async(key,file,persist=true)=>{
  if(key==='stone'&&file&&file.type!=='image/png')file=await toPNG(file);
  generation.current[key]++;if(urls.current[key])URL.revokeObjectURL(urls.current[key]);
  const url=file?URL.createObjectURL(file):defaults.current[key];urls.current[key]=file?url:null;
  setMedia(m=>({...m,[key]:url}));if(persist)await stored(key,file||null);
 };
 useEffect(()=>{
  let alive=true;const controller=new AbortController();
  for(const key of ['image','video','stone']){const current=generation.current[key];(async()=>{
   const bundled=await discover(key,controller.signal);defaults.current[key]=bundled;
   let file;try{file=await stored(key);}catch{/* Browser storage is optional. */}
   if(!alive||generation.current[key]!==current)return;
   if(file)await set(key,file,false);else if(key==='stone'&&bundled){try{const response=await fetch(bundled,{signal:controller.signal});const png=await toPNG(await response.blob());if(alive&&generation.current[key]===current)await set(key,png,false);}catch{if(alive)setMedia(m=>({...m,[key]:null}));}}else setMedia(m=>({...m,[key]:bundled}));
  })();}
  return()=>{alive=false;controller.abort();Object.values(urls.current).forEach(u=>u&&URL.revokeObjectURL(u));};
 },[]);
 return [media,set];
}
export default function MediaSettings({open,onClose,media,setMedia}){
 const dialog=useRef();const [status,setStatus]=useState('');
 useEffect(()=>{if(open&&!dialog.current.open)dialog.current.showModal();else if(!open&&dialog.current.open)dialog.current.close();},[open]);
 const choose=async(e,key)=>{const file=e.target.files[0];if(!file)return;if(!file.type.startsWith(key==='video'?'video/':'image/')){setStatus('Choose a supported image or video file.');return;}try{await setMedia(key,file);setStatus(`${key==='image'?'Surgeon image':key==='stone'?'Time Stone image':'Film clip'} saved in this browser.`);}catch{setStatus('Loaded for this visit. Your browser could not save the file for later.');}};
 return <dialog ref={dialog} className="media-dialog" onCancel={onClose} onClose={onClose}><button className="dialog-close" onClick={onClose} aria-label="Close scene media">×</button><p className="eyebrow">YOUR EDITION</p><h2>Bring your<br/><em>story to life.</em></h2><p>Add a Strange film still for the surgeon chapter and the butterfly scene for the next chapter. Selections stay in this browser. For every visitor, put the originals in public/media as surgeon.jpg and awakening.mp4.</p><label className="media-label">Surgeon scene image<input type="file" accept="image/*" onChange={e=>choose(e,'image')}/></label><label className="media-label">Butterfly / astral journey clip<input type="file" accept="video/*" onChange={e=>choose(e,'video')}/></label><label className="media-label">Strange holding the Time Stone<input type="file" accept="image/*" onChange={e=>choose(e,'stone')}/></label>{media.stone&&<button className="text-button" onClick={async()=>{try{await downloadPNG(media.stone);setStatus('PNG download started.');}catch{setStatus('Could not convert this image. Please select the original again.');}}}>SAVE TIME-STONE.PNG</button>}<p className="media-status" role="status">{status}</p><div className="dialog-actions"><button onClick={async()=>{try{await setMedia('image',null);await setMedia('video',null);await setMedia('stone',null);setStatus('Local selections cleared. Using project media.');}catch{setStatus('Media cleared for this visit.');}}} disabled={!media.image&&!media.video&&!media.stone}>Clear local media</button><button className="text-button" onClick={onClose}>RETURN TO THE STORY ↗</button></div></dialog>;
}
