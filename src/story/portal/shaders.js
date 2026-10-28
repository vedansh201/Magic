export const noise = `
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise3(p);p=p*2.03+vec3(4.1,7.3,2.8);a*=.5;}return v;}
`;
export const planeVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const fireFragment = `
${noise}
varying vec2 vUv;uniform float uTime,uSweep,uIgnition;
void main(){
 vec2 p=(vUv-.5)*6.;float r=length(p);float angle=mod(atan(p.x,p.y)+6.2831853,6.2831853);
 float gate=1.-smoothstep(uSweep*6.2831853-.04,uSweep*6.2831853+.025,angle);
 if(uSweep>.997)gate=1.;
 vec3 flow=vec3(p*7.,uTime*1.7);float turbulent=fbm(flow+vec3(sin(angle*7.+uTime*4.)*.5));
 float radius=1.8+(turbulent-.5)*.065;
 float d=abs(r-radius);
 float core=exp(-d*140.)*(1.3+noise3(vec3(p*42.,uTime*14.))*1.4);
 float filaments=pow(max(0.,1.-d/.13),2.)*pow(fbm(vec3(angle*13.,r*43.-uTime*3.,uTime*2.)),3.)*12.;
 float flame=pow(max(0.,1.-d/.26),2.)*smoothstep(.38,.75,turbulent)*.7;
 vec3 col=vec3(2.8,.75,.08)*core+vec3(2.,.45,.025)*filaments+vec3(.6,.09,.002)*flame;
 float alpha=clamp(core+filaments+flame,0.,1.)*gate*uIgnition;
 gl_FragColor=vec4(col,alpha);
}`;
export const torusVertex=`${noise}
varying vec2 vUv;uniform float uTime;void main(){vUv=uv;vec3 p=position+normal*(noise3(position*25.+vec3(0,0,uTime*3.))-.5)*.025;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
export const torusFragment=`${noise}
varying vec2 vUv;uniform float uTime,uSweep,uIgnition;
void main(){float arc=mod(.25-vUv.x+1.,1.);if(arc>uSweep&&uSweep<.998)discard;float n=fbm(vec3(vUv.x*160.-uTime*4.,vUv.y*5.,uTime*2.));vec3 col=mix(vec3(.7,.12,.008),vec3(5.,2.3,.6),pow(n,2.));gl_FragColor=vec4(col,uIgnition*.9);}`;
export const sparkVertex=`
attribute vec4 aSeed;attribute float aTail;uniform float uTime,uSweep,uIgnition;varying float vHeat,vAlpha;
void main(){
 float life=.45+aSeed.z*1.1;float age=mod(uTime+aSeed.y*life,life);float trailAge=max(0.,age-aTail*(.018+aSeed.w*.032));
 float angle=aSeed.x*6.2831853;vec3 radial=vec3(sin(angle),cos(angle),0.);vec3 tangent=vec3(cos(angle),-sin(angle),0.);
 vec3 velocity=radial*(.15+aSeed.w*.85)+tangent*(.5+aSeed.z*1.4)+vec3(0,0,(aSeed.y-.5)*1.9);
 vec3 p=radial*(1.8+(aSeed.w-.5)*.035)+velocity*trailAge;
 p.y-=1.8*trailAge*trailAge;
 if(p.y < -1.94){p.y=-1.94+abs(p.y+1.94)*.12;p.x+=sin(aSeed.z*80.)*trailAge*.35;}
 vHeat=1.-age/life;vAlpha=pow(vHeat,1.5)*(1.-aTail*.45)*step(aSeed.x,uSweep)*uIgnition;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
export const sparkFragment=`varying float vHeat,vAlpha;void main(){gl_FragColor=vec4(mix(vec3(1.8,.22,.008),vec3(4.,1.8,.3),vHeat*vHeat),vAlpha);}`;
export const membraneFragment=`${noise}
varying vec2 vUv;uniform sampler2D uImage;uniform float uHasImage,uReveal,uTime;uniform vec2 uResolution,uImageSize;
void main(){vec2 p=(vUv-.5)*2.;float r=length(p);if(r>1.)discard;
 vec2 uv=gl_FragCoord.xy/uResolution;float screenAspect=uResolution.x/uResolution.y,imageAspect=uImageSize.x/uImageSize.y;
 vec2 photoUV=uv;
 if(imageAspect>screenAspect){float span=screenAspect/imageAspect;photoUV.x=uv.x*span+(1.-span)*(screenAspect<.85?.5:0.);}else{float span=imageAspect/screenAspect;photoUV.y=uv.y*span+(1.-span)*.6;}
 float edge=smoothstep(.5,1.,r);float turbulence=fbm(vec3(p*6.,uTime*.65));photoUV+=vec2(sin(p.y*19.+uTime),cos(p.x*17.-uTime))*.006*edge;
 vec3 photo=texture2D(uImage,photoUV).rgb;photo=mix(vec3(dot(photo,vec3(.2126,.7152,.0722))),photo,.65)*.7;
 vec3 world=mix(vec3(.013,.021,.03),vec3(.075,.13,.16),1.-r)+vec3(.035,.06,.07)*turbulence;
 vec3 color=mix(world,photo,uHasImage);
 color*=.65+.35*(1.-edge);color+=vec3(.18,.055,.008)*pow(edge,5.)*turbulence;
 gl_FragColor=vec4(color,smoothstep(1.,.98,r)*uReveal);
}`;
export const heatShader={uniforms:{tDiffuse:{value:null},uTime:{value:0},uRadius:{value:.3},uAspect:{value:1},uStrength:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`${noise}
uniform sampler2D tDiffuse;uniform float uTime,uRadius,uAspect,uStrength;varying vec2 vUv;
void main(){vec2 p=vUv-.5;p.x*=uAspect;float d=abs(length(p)-uRadius);float zone=exp(-d*35.);vec2 wave=vec2(fbm(vec3(p*35.,uTime*2.)),fbm(vec3(p*31.+9.,uTime*2.)))-.5;vec2 uv=vUv+wave*.014*zone*uStrength;vec3 col=texture2D(tDiffuse,uv).rgb;gl_FragColor=vec4(col,1.);}`};
