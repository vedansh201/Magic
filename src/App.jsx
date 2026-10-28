import {useCallback,useEffect,useState} from 'react';
import Opening from './story/Opening';
import MysticCursor from './story/MysticCursor';
import Surgeon from './story/Surgeon';
import FilmScene from './story/FilmScene';
import TimeScene from './story/TimeScene';
import MediaSettings,{useMedia} from './story/MediaSettings';

export default function App(){
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [entered,setEntered]=useState(false),[muted,setMuted]=useState(true),[settings,setSettings]=useState(false),[fold,setFold]=useState(0);
 const [media,setMedia]=useMedia();const finish=useCallback(()=>setEntered(true),[]);
 useEffect(()=>{scrollTo({top:0,behavior:'instant'});},[]);
 useEffect(()=>{document.documentElement.dataset.motion=reduced?'reduced':'full';},[reduced]);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const update=e=>setReduced(e.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 useEffect(()=>{const previous=document.body.style.overflow;if(!entered)document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[entered]);
 return <><MysticCursor reduced={reduced}/>{!entered&&<Opening reduced={reduced} onComplete={finish} image={media.image}/>}
 <div className={`story ${entered?'story-entered':''}`} inert={!entered}>
 <a className="skip-story" href="#mystic">Skip to the mystic arts</a>
 <header className="story-header"><a className="story-brand" href="#surgeon" aria-label="Back to Stephen Strange"><span>✧</span><span>STRANGE<small>AN ORIGIN STORY</small></span></a><div className="story-controls"><button onClick={()=>setSettings(true)}>SCENE MEDIA</button><button onClick={()=>setMuted(!muted)} aria-pressed={!muted}>SOUND {muted?'OFF':'ON'}</button><button onClick={()=>setReduced(!reduced)} aria-pressed={reduced}>MOTION {reduced?'LOW':'FULL'}</button></div></header>
 <main><Surgeon image={media.image} reduced={reduced} onProgress={setFold}/><FilmScene src={media.video} muted={muted} reduced={reduced} revealed={reduced||fold>.3} onChoose={()=>setSettings(true)}/><TimeScene reduced={reduced} stone={media.stone} onChoose={()=>setSettings(true)}/></main>
 <div className="chapter-progress" aria-hidden="true"><span style={{transform:`scaleY(${Math.max(.015,fold)})`}}/></div>
 <footer className="story-footer"><span>An independent Doctor Strange fan experience.</span><span>Marvel characters belong to their respective owners.</span><button onClick={()=>{scrollTo({top:0,behavior:'instant'});setEntered(false);}}>REPLAY THE ENTRANCE ↗</button></footer>
 <MediaSettings open={settings} onClose={()=>setSettings(false)} media={media} setMedia={setMedia}/>
 </div></>;
}
