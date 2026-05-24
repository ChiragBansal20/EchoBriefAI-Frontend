import { useEffect, useRef } from "react";
import {
  Color, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial,
  Vector2, Vector3, WebGLRenderer,
} from "three";

const vert = `void main(){gl_Position=vec4(position,1.0);}`;

const frag = `
precision mediump float;
uniform float uTime; uniform vec2 uResolution;
uniform float uFlakeSize; uniform float uMinFlakeSize;
uniform float uPixelResolution; uniform float uSpeed;
uniform float uDepthFade; uniform float uFarPlane;
uniform vec3 uColor; uniform float uBrightness; uniform float uGamma;
uniform float uDensity; uniform float uDirection;
#define PI 3.14159265
#define M1 1597334677U
#define M2 3812015801U
#define M3 3299493293U
#define F0 2.3283064e-10
#define hash(n) (n * (n ^ (n >> 15)))
#define coord3(p) (uvec3(p).x * M1 ^ uvec3(p).y * M2 ^ uvec3(p).z * M3)
const vec3 camK = vec3(0.57735027,0.57735027,0.57735027);
const vec3 camI = vec3(0.70710678,0.0,-0.70710678);
const vec3 camJ = vec3(-0.40824829,0.81649658,-0.40824829);
vec3 hash3(uint n){uvec3 h=hash(n)*uvec3(1U,511U,262143U);return vec3(h)*F0;}
void main(){
  float invPx=1.0/uPixelResolution;
  float pixelSize=max(1.0,floor(0.5+uResolution.x*invPx));
  float invPS=1.0/pixelSize;
  vec2 fc=floor(gl_FragCoord.xy*invPS);
  vec2 res=uResolution*invPS;
  float invX=1.0/res.x;
  vec3 ray=normalize(vec3((fc-res*0.5)*invX,1.0));
  ray=ray.x*camI+ray.y*camJ+ray.z*camK;
  float ts=uTime*uSpeed;
  float wx=cos(uDirection)*0.4, wy=sin(uDirection)*0.4;
  vec3 camPos=(wx*camI+wy*camJ+0.1*camK)*ts;
  vec3 pos=camPos;
  vec3 absRay=max(abs(ray),vec3(0.001));
  vec3 strides=1.0/absRay;
  vec3 raySign=step(ray,vec3(0.0));
  vec3 phase=fract(pos)*strides;
  phase=mix(strides-phase,phase,raySign);
  float invDot=1.0/dot(ray,camK);
  float invFade=1.0/uDepthFade;
  float halfX=0.5*invX;
  vec3 timeAnim=ts*0.1*vec3(7.0,8.0,5.0);
  float t=0.0;
  for(int i=0;i<96;i++){
    if(t>=uFarPlane) break;
    vec3 fp=floor(pos);
    uint c=coord3(fp);
    float ch=hash3(c).x;
    if(ch<uDensity){
      vec3 h=hash3(c);
      vec3 fpos=0.5-0.5*cos(4.0*sin(fp.yzx*0.073)+4.0*sin(fp.zxy*0.27)+2.0*h+timeAnim);
      fpos=fpos*0.8+0.1+fp;
      float ti=dot(fpos-pos,camK)*invDot;
      if(ti>0.0){
        vec3 tp=pos+ray*ti-fpos;
        float tx=dot(tp,camI), ty=dot(tp,camJ);
        vec2 tu=abs(vec2(tx,ty));
        float depth=dot(fpos-camPos,camK);
        float fs=max(uFlakeSize,uMinFlakeSize*depth*halfX);
        float dist=max(tu.x,tu.y);
        if(dist<fs){
          float r=uFlakeSize/fs;
          float intensity=exp2(-(t+ti)*invFade)*min(1.0,r*r)*uBrightness;
          gl_FragColor=vec4(uColor*pow(vec3(intensity),vec3(uGamma)),1.0);
          return;
        }
      }
    }
    float ns=min(min(phase.x,phase.y),phase.z);
    vec3 sel=step(phase,vec3(ns));
    phase=phase-ns+strides*sel;
    t+=ns;
    pos=mix(pos+ray*ns,floor(pos+ray*ns+0.5),sel);
  }
  gl_FragColor=vec4(0.0);
}`;

interface Props {
  color?: string;
  density?: number;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PixelSnow = ({ color = "#ffffff", density = 0.25, speed = 1, className = "", style }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance", depth: false, stencil: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.offsetWidth, el.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    const tc = new Color(color);
    const mat = new ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vector2(el.offsetWidth, el.offsetHeight) },
        uFlakeSize: { value: 0.012 },
        uMinFlakeSize: { value: 1.5 },
        uPixelResolution: { value: 220 },
        uSpeed: { value: speed },
        uDepthFade: { value: 8 },
        uFarPlane: { value: 16 },
        uColor: { value: new Vector3(tc.r, tc.g, tc.b) },
        uBrightness: { value: 1 },
        uGamma: { value: 0.4545 },
        uDensity: { value: density },
        uDirection: { value: (125 * Math.PI) / 180 },
      },
    });
    scene.add(new Mesh(new PlaneGeometry(2, 2), mat));
    const start = performance.now();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      mat.uniforms.uTime.value = (performance.now() - start) * 0.001;
      renderer.render(scene, camera);
    };
    loop();
    const onResize = () => {
      renderer.setSize(el.offsetWidth, el.offsetHeight);
      mat.uniforms.uResolution.value.set(el.offsetWidth, el.offsetHeight);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose(); mat.dispose();
    };
  }, [color, density, speed]);
  return <div ref={ref} className={className} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, pointerEvents: "none", ...style }} />;
};

export default PixelSnow;
