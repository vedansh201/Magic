import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {noise,planeVertex,fireFragment,torusVertex,torusFragment,sparkVertex,sparkFragment,membraneFragment,heatShader} from './shaders';

export function createPortal(host,{onComplete,onFailure,image}){
 const compact=matchMedia('(max-width:700px)').matches;
 const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,compact?1.15:1.5));
 renderer.setClearColor(0x000000);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x000000,.06);
 const camera=new THREE.PerspectiveCamera(48,1,.06,60);camera.position.set(0,.1,7.6);
 const resources=[];const own=x=>{resources.push(x);return x;};
 const shared={uTime:{value:0},uSweep:{value:0},uIgnition:{value:0}};
 const group=new THREE.Group();scene.add(group);
 const fireMat=own(new THREE.ShaderMaterial({uniforms:shared,vertexShader:planeVertex,fragmentShader:fireFragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
 const fire=new THREE.Mesh(own(new THREE.PlaneGeometry(6,6)),fireMat);fire.position.z=.035;group.add(fire);
 const torusMat=own(new THREE.ShaderMaterial({uniforms:shared,vertexShader:torusVertex,fragmentShader:torusFragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
 const core=new THREE.Mesh(own(new THREE.TorusGeometry(1.8,.017,8,compact?200:360)),torusMat);group.add(core);
 // A second offset filament provides a physical edge and parallax at the rim.
 const filament=new THREE.Mesh(own(new THREE.TorusGeometry(1.815,.006,5,200)),torusMat);filament.rotation.x=.025;filament.rotation.y=.018;group.add(filament);
 const placeholder=own(new THREE.DataTexture(new Uint8Array([12,19,24,255]),1,1));placeholder.needsUpdate=true;
 const membraneUniforms={uImage:{value:placeholder},uHasImage:{value:0},uReveal:{value:0},uTime:shared.uTime,uResolution:{value:new THREE.Vector2()},uImageSize:{value:new THREE.Vector2(2,1)}};
 const membrane=new THREE.Mesh(own(new THREE.PlaneGeometry(3.57,3.57)),own(new THREE.ShaderMaterial({uniforms:membraneUniforms,vertexShader:planeVertex,fragmentShader:membraneFragment,transparent:true,depthWrite:true})));membrane.position.z=-.035;group.add(membrane);
 const count=compact?1800:4200;const seed=new Float32Array(count*2*4),tail=new Float32Array(count*2),positions=new Float32Array(count*2*3);
 for(let i=0;i<count;i++){const s=[Math.random(),Math.random(),Math.random(),Math.random()];seed.set(s,i*8);seed.set(s,i*8+4);tail[i*2]=0;tail[i*2+1]=1;}
 const sparkGeo=own(new THREE.BufferGeometry());sparkGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));sparkGeo.setAttribute('aSeed',new THREE.BufferAttribute(seed,4));sparkGeo.setAttribute('aTail',new THREE.BufferAttribute(tail,1));
 const sparks=new THREE.LineSegments(sparkGeo,own(new THREE.ShaderMaterial({uniforms:shared,vertexShader:sparkVertex,fragmentShader:sparkFragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));sparks.frustumCulled=false;group.add(sparks);
 // The travelling ignition point gives the ring a definite origin.
 const head=new THREE.Mesh(own(new THREE.SphereGeometry(.023,12,8)),own(new THREE.MeshBasicMaterial({color:new THREE.Color(9,4,1)})));group.add(head);head.visible=false;
 const floorMat=own(new THREE.MeshStandardMaterial({color:0x15100d,roughness:.73,metalness:.12}));
 const floor=new THREE.Mesh(own(new THREE.PlaneGeometry(60,60)),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-1.98;scene.add(floor);
 const stone=document.createElement('canvas');stone.width=stone.height=128;const ctx=stone.getContext('2d');const pixels=ctx.createImageData(128,128);for(let i=0;i<pixels.data.length;i+=4){const v=85+Math.random()*80;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);
 const stoneTex=own(new THREE.CanvasTexture(stone));stoneTex.wrapS=stoneTex.wrapT=THREE.RepeatWrapping;stoneTex.repeat.set(30,30);floorMat.bumpMap=stoneTex;floorMat.bumpScale=.035;
 const point=new THREE.PointLight(0xff7d24,0,12,2);scene.add(point);
 const spill=new THREE.PointLight(0xffa94a,0,10,2);spill.position.set(0,-1.4,.7);scene.add(spill);
 const room=new THREE.Group();scene.add(room);
 const wallMat=own(new THREE.MeshStandardMaterial({color:0x11131a,roughness:.85}));
 for(const x of [-4.5,4.5]){const wall=new THREE.Mesh(own(new THREE.BoxGeometry(.3,8,18)),wallMat);wall.position.set(x,1,-4);room.add(wall);}
 // Low, animated haze makes the emitted light occupy space around the opening.
 const haze=new THREE.Mesh(own(new THREE.PlaneGeometry(8,6)),own(new THREE.ShaderMaterial({uniforms:shared,vertexShader:planeVertex,fragmentShader:`${noise} varying vec2 vUv;uniform float uTime,uIgnition;void main(){vec2 p=(vUv-.5)*vec2(8.,6.);float n=fbm(vec3(p*.8+vec2(uTime*.1,0),uTime*.13));float a=exp(-dot(p,p)*.3)*pow(n,3.)*.10*uIgnition;gl_FragColor=vec4(.65,.19,.035,a);}`,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));haze.position.z=.2;scene.add(haze);
 const composer=new EffectComposer(renderer);const renderPass=new RenderPass(scene,camera);composer.addPass(renderPass);
 const bloom=new UnrealBloomPass(new THREE.Vector2(800,600),.5,.32,1.2);composer.addPass(bloom);
 const heat=new ShaderPass(heatShader);composer.addPass(heat);const output=new OutputPass();composer.addPass(output);
 let frame,disposed=false,elapsed=0,last=performance.now(),texture=null,textureGeneration=0,slowFrames=0,lowered=false;
 let baseDistance=7.6;
 const pointer={x:0,y:0};
 const move=e=>{pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5;};
 const resize=()=>{const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;renderer.setSize(w,h);composer.setSize(w,h);camera.aspect=w/h;baseDistance=Math.max(7.6,1.8/(.72*Math.tan(THREE.MathUtils.degToRad(24))*camera.aspect));camera.updateProjectionMatrix();renderer.getDrawingBufferSize(membraneUniforms.uResolution.value);heat.uniforms.uAspect.value=w/h;};
 resize();const ro=new ResizeObserver(resize);ro.observe(host);window.addEventListener('pointermove',move);
 const fail=e=>{e.preventDefault();if(!disposed)onFailure();};renderer.domElement.addEventListener('webglcontextlost',fail);
 function setImage(url){const generation=++textureGeneration;if(!url){membraneUniforms.uHasImage.value=0;return;}new THREE.TextureLoader().load(url,loaded=>{if(disposed||generation!==textureGeneration){loaded.dispose();return;}texture?.dispose();texture=loaded;texture.colorSpace=THREE.SRGBColorSpace;membraneUniforms.uImage.value=texture;membraneUniforms.uHasImage.value=1;membraneUniforms.uImageSize.value.set(texture.image.width,texture.image.height);},undefined,()=>{/* The surgeon scene still works without a photograph. */});}
 setImage(image);
 const smooth=(a,b,x)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 // Compile the dark frame before starting the timed entrance.
 composer.render();last=performance.now();
 function draw(now){if(disposed)return;const dt=(now-last)/1000;last=now;if(document.hidden){frame=requestAnimationFrame(draw);return;}elapsed+=Math.min(dt,.25);const t=elapsed;
  if(!lowered&&t>1.2&&t<5.){slowFrames=dt>.065?slowFrames+1:Math.max(0,slowFrames-1);if(slowFrames>7){lowered=true;renderer.setPixelRatio(compact?.8:.9);composer.setPixelRatio(renderer.getPixelRatio());resize();host.dataset.quality='adaptive';}}
  const ignition=smooth(.65,1.05,t),sweep=smooth(1.1,3.65,t),flight=smooth(5.2,8.1,t);
  shared.uTime.value=t;shared.uIgnition.value=ignition;shared.uSweep.value=sweep;
  const angle=sweep*Math.PI*2;head.visible=t>.65&&t<3.8;head.position.set(Math.sin(angle)*1.8,Math.cos(angle)*1.8,.02);
  head.scale.setScalar(t<1.1?.55+.25*Math.sin(t*38.):1.1);point.position.copy(head.position);point.position.z=.35;point.intensity=ignition*(7+Math.sin(t*29.)*.5)*(1-flight*.8);spill.intensity=ignition*sweep*6;
  membraneUniforms.uReveal.value=smooth(2.8,4.,t);
  camera.position.z=THREE.MathUtils.lerp(baseDistance,.45,Math.pow(flight,1.6));camera.position.x+=(pointer.x*.12*(1-flight)-camera.position.x)*.04;camera.position.y+=(pointer.y*-.07*(1-flight)-camera.position.y)*.04;
  camera.lookAt(0,0,-.2);
  group.rotation.y=Math.sin(t*.4)*.008*(1-flight);
  heat.uniforms.uTime.value=t;heat.uniforms.uRadius.value=1.8/(2*Math.tan(THREE.MathUtils.degToRad(24))*camera.position.z);heat.uniforms.uStrength.value=ignition*(1-flight*.7);
  bloom.strength=.5+Math.sin(t*8.)*.018;
  host.parentElement.style.opacity=String(1-smooth(7.55,8.25,t));
  host.dataset.portalTime=t.toFixed(2); // Used for repeatable visual checks.
  composer.render();if(t>=8.3){onComplete();return;}frame=requestAnimationFrame(draw);
 }
 frame=requestAnimationFrame(draw);
 return {setImage,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();window.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('webglcontextlost',fail);texture?.dispose();for(const r of resources)r.dispose();bloom.dispose();heat.dispose();output.dispose();composer.dispose();renderer.dispose();renderer.domElement.remove();host.parentElement?.style.removeProperty('opacity');}};
}
