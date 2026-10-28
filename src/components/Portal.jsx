import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Real-time annular spark field. No image assets or frame-by-frame textures.
export default function Portal({ reduced, burst, variant = 0 }) {
  const host = useRef(null);
  useEffect(() => {
    const element = host.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' }); }
    catch { element.classList.add('no-webgl'); return; }
    element.appendChild(renderer.domElement);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
    camera.position.z = 7;
    const count = matchMedia('(max-width: 700px)').matches ? 1400 : 3200;
    const positions = new Float32Array(count * 3), seeds = [];
    for(let i = 0; i < count; i++) seeds.push([Math.random()*Math.PI*2, Math.random(), Math.random()]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: variant ? '#b09bff' : '#ffad50', size: .018, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false });
    const points = new THREE.Points(geometry, material); scene.add(points);
    let pointer = { x: 0, y: 0 }, frame, visible = true;
    const move = e => { const r=element.getBoundingClientRect(); pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5}; };
    element.addEventListener('pointermove', move);
    const resize = new ResizeObserver(() => { const width=element.clientWidth, height=element.clientHeight; renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix(); if(reduced) requestAnimationFrame(draw); });resize.observe(element);
    const observer = new IntersectionObserver(([e]) => { visible=e.isIntersecting; if(visible && reduced) requestAnimationFrame(draw); });observer.observe(element);
    const start=performance.now();
    function draw(now) {
      if(!reduced) frame=requestAnimationFrame(draw); if(!visible || document.hidden) return;
      const t=reduced ? 3 : (now-start)/1000;
      const opening=reduced ? 1 : Math.max(0,Math.min(1,(t-.8)/1.7));
      seeds.forEach(([a,b,c],i) => {
        const phase=(b+t*.25)%1, angle=a+t*(.12+c*.1);
        const ring=(1.76 + phase*phase*.55)*(.08+.92*opening);
        const r=!reduced && t<.8 ? (3*b+.2)*(1-t/.8)+.15*(t/.8) : ring;
        positions[i*3]=Math.cos(angle)*r;positions[i*3+1]=Math.sin(angle)*r;
        positions[i*3+2]=Math.sin(a*3+t)*.06;
      });
      geometry.attributes.position.needsUpdate=true;
      points.rotation.x += ((reduced?0:pointer.y*.16)-points.rotation.x)*.03;
      points.rotation.y += ((reduced?0:pointer.x*.16)-points.rotation.y)*.03;
      renderer.render(scene,camera);
    } frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();element.removeEventListener('pointermove',move);geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();};
  }, [reduced, variant]);
  return <div ref={host} className={`portal ${burst?'portal-burst':''}`} aria-hidden="true"><div className="portal-core"/><div className="sigil sigil-outer"/><div className="sigil sigil-inner"/><div className="portal-window"><div className="mountain mountain-one"/><div className="mountain mountain-two"/><div className="temple"><i/><i/><i/></div><div className="portal-floor"/><svg className="sorcerer" viewBox="0 0 180 250"><defs><linearGradient id={`cape-${variant}`} x2="1" y2="1"><stop stopColor="#a94749"/><stop offset=".5" stopColor="#571f36"/><stop offset="1" stopColor="#241a2d"/></linearGradient></defs><ellipse cx="90" cy="238" rx="57" ry="6" fill="#060913" opacity=".6"/><path d="M76 155L70 237H84L92 175L99 237H112L107 155" fill="#141b2a"/><path d="M64 65L53 40L78 55H103L128 39L116 70L126 99L156 213Q121 198 110 227Q80 207 36 223L57 101Z" fill={`url(#cape-${variant})`} stroke="#c87d6b" strokeWidth=".7"/><path d="M79 66L105 67L115 159L68 159Z" fill="#23394d"/><path d="M74 71L93 110L109 73M71 147L111 142" fill="none" stroke="#95774f" strokeWidth="3"/><path d="M73 36Q68 11 90 10Q113 11 108 35L102 50H80Z" fill="#a88c7d"/><path d="M73 28Q68 4 92 6Q115 7 109 32L102 19L91 22L80 17Z" fill="#191923"/><path d="M103 34L102 46L92 51L81 46L80 37L87 42H97Z" fill="#29202a"/><path d="M70 80L43 123L27 111M110 80L131 114L151 97" fill="none" stroke="#23394d" strokeWidth="13"/><path d="M27 111L20 99M151 97L159 86" stroke="#a88c7d" strokeWidth="8"/><g fill="none" stroke="#efb36b"><ellipse cx="159" cy="86" rx="19" ry="23"/><ellipse cx="159" cy="86" rx="15" ry="19" strokeDasharray="2 2"/><path d="M145 73L173 99M145 99L173 73"/></g><path d="M64 65Q78 111 49 207M116 70Q100 147 137 205" fill="none" stroke="#e0a08a" strokeWidth=".6" opacity=".5"/></svg></div><span className="portal-runes">ᚷ · ᛟ · ᛞ · ᚹ · ᚱ · ᛉ · ᛟ · ᚷ</span></div>;
}
