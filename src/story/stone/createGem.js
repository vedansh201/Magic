import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

function cutGeometry(){
 const n=12,positions=[];
 const rings=[{r:.48,z:.35},{r:.87,z:.17},{r:1,z:0},{r:.78,z:-.25},{r:.035,z:-.68}];
 const point=(ring,i)=>{const a=i/n*Math.PI*2;return [Math.cos(a)*.72*ring.r,Math.sin(a)*1.08*ring.r,ring.z];};
 const tri=(a,b,c)=>positions.push(...a,...b,...c);
 for(let i=0;i<n;i++)tri([0,0,.35],point(rings[0],i),point(rings[0],i+1));
 for(let k=0;k<rings.length-1;k++)for(let i=0;i<n;i++){const a=point(rings[k],i),b=point(rings[k],i+1),c=point(rings[k+1],i),d=point(rings[k+1],i+1);tri(a,c,b);tri(b,c,d);}
 for(let i=0;i<n;i++)tri([0,0,-.69],point(rings.at(-1),i+1),point(rings.at(-1),i));
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;
}
export function createGem(host){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;host.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,20);camera.position.set(0,0,4.8);
 const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 const geometry=cutGeometry();const material=new THREE.MeshPhysicalMaterial({color:0x60e88a,metalness:0,roughness:.055,transmission:.86,thickness:.8,ior:1.72,dispersion:.08,attenuationColor:new THREE.Color(0x20a744),attenuationDistance:.85,clearcoat:1,clearcoatRoughness:.025,envMapIntensity:1.55,flatShading:true});
 const gem=new THREE.Mesh(geometry,material);scene.add(gem);
 const key=new THREE.DirectionalLight(0xe8fff4,3.5);key.position.set(-3,4,5);scene.add(key);const rim=new THREE.DirectionalLight(0x86ffb2,2);rim.position.set(4,-1,-2);scene.add(rim);
 const coreGeometry=new THREE.IcosahedronGeometry(.28,1),coreMaterial=new THREE.MeshBasicMaterial({color:0x53f77e,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false});const core=new THREE.Mesh(coreGeometry,coreMaterial);core.scale.set(.8,1.4,.6);core.position.z=-.1;gem.add(core);
 let disposed=false,visible=false,rotation=0,reduced=false,frame;
 const render=()=>{frame=null;if(disposed||!visible||document.hidden)return;gem.rotation.set(-.12+(reduced?0:Math.sin(rotation*Math.PI*2)*.18),-.22+(reduced?0:rotation*Math.PI*4),-.13);renderer.render(scene,camera);host.dataset.rotation=gem.rotation.y.toFixed(4);};
 const request=()=>{if(!frame)frame=requestAnimationFrame(render);};
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();request();};
 const observer=new ResizeObserver(resize);observer.observe(host);const section=host.closest('.time-chapter');
 const sync=()=>{visible=section.dataset.phase.startsWith('stone');rotation=Number(section.style.getPropertyValue('--stone-rotation'))||0;reduced=document.documentElement.dataset.motion==='reduced';request();};
 const change=new MutationObserver(sync);change.observe(section,{attributes:true,attributeFilter:['style','data-phase']});
 const mode=new MutationObserver(sync);mode.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 const visibility=()=>{if(!document.hidden)request();};document.addEventListener('visibilitychange',visibility);
 resize();sync();
 return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();change.disconnect();mode.disconnect();document.removeEventListener('visibilitychange',visibility);geometry.dispose();material.dispose();coreGeometry.dispose();coreMaterial.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();};
}
