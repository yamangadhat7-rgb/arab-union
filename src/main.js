import * as THREE from 'three';
import './style.css';

const root = document.querySelector('#world');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91b5bd);
scene.fog = new THREE.FogExp2(0x91b5bd, 0.0022);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 1100);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xd9efff, 0x625744, 2.0));
const sun = new THREE.DirectionalLight(0xffe2b0, 2.8);
sun.position.set(-90, 150, 80);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -170; sun.shadow.camera.right = 170;
sun.shadow.camera.top = 170; sun.shadow.camera.bottom = -170;
scene.add(sun);

const material = (color, roughness = .82, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const mats = {
  sand: material(0xc8b38b), road: material(0x343e44), stone: material(0xb6a58a),
  white: material(0xe8e2d1), glass: material(0x4d7180, .28, .3),
  green: material(0x315d42), trunk: material(0x65472e), gold: material(0xc4a15e)
};
function addBox(w,h,d,mat,x,y,z,shadow=true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z); mesh.castShadow=shadow; mesh.receiveShadow=true; scene.add(mesh); return mesh;
}
function addCylinder(rt,rb,h,mat,x,y,z,segments=20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat);
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh); return mesh;
}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1100,1100),mats.sand);
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const sea = new THREE.Mesh(new THREE.PlaneGeometry(1100,280),material(0x28677a,.3,.15));
sea.rotation.x=-Math.PI/2; sea.position.set(0,-.15,-420); scene.add(sea);
addBox(28,.12,720,mats.road,0,.04,0); addBox(720,.12,25,mats.road,0,.05,0);
for(let z=-340;z<350;z+=18) addBox(.22,.025,8,material(0xe7d9b4),0,.12,z,false);
for(let x=-340;x<350;x+=18) addBox(8,.025,.22,material(0xe7d9b4),x,.13,0,false);

// Central Union Plaza and 22 flagpoles.
addCylinder(30,30,.3,material(0x9e9a8a),0,.17,0,96);
addCylinder(22,22,.32,mats.green,0,.36,0,96);
addCylinder(14,14,.45,mats.stone,0,.72,0,96);
addCylinder(8,8,.5,mats.gold,0,1.1,0,64);
addCylinder(1.5,2.3,16,mats.white,0,9,0,12);
const globe = new THREE.Mesh(new THREE.OctahedronGeometry(3),material(0xd8bd83,.35,.35));
globe.position.set(0,18,0); scene.add(globe);
const flagColors = [[0x111111,0xffffff,0x16834b],[0xce2028,0xffffff,0x16834b],[0x007a3d,0xffffff,0x111111],[0xce1126,0xffffff,0x111111],[0xd4af37,0xffffff,0x111111]];
for(let i=0;i<22;i++){
  const a=i/22*Math.PI*2,x=Math.cos(a)*26,z=Math.sin(a)*26;
  addCylinder(.09,.12,9,material(0xd7d8d4,.3,.7),x,4.7,z,8);
  for(let j=0;j<3;j++) addBox(3.3,.72,.07,material(flagColors[i%flagColors.length][j]),x+1.55,7.3-j*.74,z,false);
}

// Residential districts, royal palace, palms and forest.
const buildingMats=[0xd9c6a4,0xcab596,0xe0d3bc,0xb9a88e,0xd6c4a5].map(c=>material(c));
function building(x,z,w,d,h,k=0){
  addBox(w,h,d,buildingMats[k%5],x,h/2,z);
  addBox(w+1,.5,d+1,mats.white,x,h+.25,z);
  for(let y=3;y<h-1;y+=3) for(const side of [-1,1]){
    addBox(w*.68,.9,.12,mats.glass,x,y,z+side*(d/2+.07),false);
    addBox(w*.72,.13,.28,mats.stone,x,y-.53,z+side*(d/2+.14),false);
  }
}
for(let x=-105;x<=105;x+=35) for(let z=-125;z<=150;z+=42)
  if(!(Math.abs(x)<40&&Math.abs(z)<45)) building(x,z,18+(Math.abs(x+z)%3)*2,18,12+(Math.abs(x*3+z)%4)*3,Math.abs(x+z)%5);
building(92,-65,48,35,25,2);
for(const x of [75,92,109]){
  addCylinder(2,2,10,mats.white,x,30,-65,16);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(2.8,16,12,0,Math.PI*2,0,Math.PI/2),mats.gold);
  dome.position.set(x,35,-65); scene.add(dome);
}
function palm(x,z,s=1){
  addCylinder(.45*s,.8*s,7*s,mats.trunk,x,3.5*s,z,9);
  for(let j=0;j<7;j++){
    const a=j/7*Math.PI*2;
    const leaf=new THREE.Mesh(new THREE.ConeGeometry(.65*s,6*s,5),mats.green);
    leaf.position.set(x+Math.cos(a)*2*s,7*s,z+Math.sin(a)*2*s);
    leaf.rotation.z=Math.cos(a)*-.8; leaf.rotation.x=Math.sin(a)*.8; scene.add(leaf);
  }
}
for(let i=0;i<100;i++){
  const x=(Math.random()-.5)*270,z=(Math.random()-.5)*300;
  if(Math.abs(x)>36&&Math.abs(z)>32) palm(x,z,.65+Math.random()*.5);
}
for(let i=0;i<130;i++){
  const x=-210+Math.random()*85,z=-160+Math.random()*320,h=5+Math.random()*7;
  addCylinder(.25,.45,h*.55,mats.trunk,x,h*.275,z,8);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(3,9,7),mats.green);
  crown.position.set(x,h*.8,z); scene.add(crown);
}

// Player avatar.
const player=new THREE.Group(); scene.add(player);
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.95,5,10),material(0xe8e2d4));
body.position.y=1.45; player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),material(0x9a6847));
head.position.y=2.35; player.add(head);
const headCover=new THREE.Mesh(new THREE.SphereGeometry(.37,16,8,0,Math.PI*2,0,Math.PI*.55),mats.white);
headCover.position.y=2.48; player.add(headCover);
for(const side of [-1,1]){
  const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.65,4,8),material(0x1b2830));
  leg.position.set(side*.22,.48,0); player.add(leg);
}
player.position.set(0,0,42);

// Driveable starter vehicle.
const car=new THREE.Group(); scene.add(car); car.position.set(9,.6,35);
const chassis=new THREE.Mesh(new THREE.BoxGeometry(3.5,1,6),material(0x9b2e2d,.35,.35));
chassis.position.y=.65; car.add(chassis);
const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.8,1.1,2.8),mats.glass);
cabin.position.set(0,1.55,-.2); car.add(cabin);
for(const x of [-1.65,1.65]) for(const z of [-1.9,1.9]){
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.3,16),material(0x1b2830));
  wheel.rotation.z=Math.PI/2; wheel.position.set(x,.45,z); car.add(wheel);
}
for(let z=-170;z<=170;z+=35) for(const x of [-19,19]){
  addCylinder(.12,.18,6,material(0x1b2830),x,3,z,8);
  addBox(.8,.12,.35,material(0xffe4a1),x+(x<0?.3:-.3),6,z,false);
}

// Local demo progress only. Online accounts and server-authoritative economy are not wired yet.
let save={wood:0,fish:0,coins:500};
try{save={...save,...JSON.parse(localStorage.getItem('arab-union-demo-save')||'{}')}}catch{}
let driving=false,carSpeed=0,carYaw=0,yaw=0,pitch=.24,third=true,running=false,jumping=false;
const keys={},joy={x:0,y:0};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['w','a','s','d',' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='e'&&!e.repeat)interact()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
const canvas=renderer.domElement;
let drag=false,lx=0,ly=0;
canvas.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch+dy*.003,-.05,.8)});
canvas.addEventListener('pointerup',()=>drag=false);
document.querySelector('#cameraBtn').onclick=()=>{third=!third};
document.querySelector('#cameraLabel').onclick=()=>{third=!third};
document.querySelector('#runBtn').onpointerdown=()=>running=true;
document.querySelector('#runBtn').onpointerup=()=>running=false;
document.querySelector('#jumpBtn').onclick=jump;
document.querySelector('#interactMobile').onclick=interact;
const joystick=document.querySelector('#joystick'),stick=document.querySelector('#stick');
let joystickActive=false;
joystick.addEventListener('pointerdown',e=>{joystickActive=true;joystick.setPointerCapture(e.pointerId);moveJoystick(e)});
joystick.addEventListener('pointermove',e=>{if(joystickActive)moveJoystick(e)});
joystick.addEventListener('pointerup',()=>{joystickActive=false;joy.x=0;joy.y=0;stick.style.transform='translate(0,0)'});
function moveJoystick(e){
  const r=joystick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
  const len=Math.hypot(dx,dy),scale=Math.min(1,34/(len||1));joy.x=dx*scale/34;joy.y=dy*scale/34;
  stick.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;
}
function jump(){if(jumping||driving)return;jumping=true;player.position.y=.85;setTimeout(()=>{player.position.y=0;jumping=false},420)}
function persist(){localStorage.setItem('arab-union-demo-save',JSON.stringify(save))}
function interact(){
  if(driving){driving=false;player.visible=true;player.position.copy(car.position);return}
  if(player.position.distanceTo(car.position)<12){driving=true;player.visible=false;carYaw=car.rotation.y;carSpeed=0;return}
  if(player.position.x < -120 && Math.abs(player.position.z)<190){save.wood++;persist();return}
  if(player.position.z < -285){save.fish++;persist();return}
}
let last=performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-last)/1000,.04);last=now;
  const forward=(keys.w||keys.arrowup?-1:0)+(keys.s||keys.arrowdown?1:0)-joy.y;
  const sideways=(keys.d||keys.arrowright?1:0)+(keys.a||keys.arrowleft?-1:0)+joy.x;
  if(!driving){
    const moving=Math.hypot(forward,sideways)>.08;
    const speed=(running||keys.shift?13:7)*dt;
    const dir=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
    const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    if(moving){
      player.position.addScaledVector(dir,forward*speed);
      player.position.addScaledVector(right,sideways*speed);
      player.rotation.y=Math.atan2(sideways,forward)+yaw+Math.PI;
      body.position.y=1.45+Math.sin(now*.012)*.045;
    }
  } else {
    const steer=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
    carYaw+=steer*dt*1.8;
    const throttle=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0);
    carSpeed=THREE.MathUtils.damp(carSpeed,throttle*24,2.2,dt);
    car.rotation.y=carYaw;
    car.position.x+=Math.sin(carYaw)*carSpeed*dt;
    car.position.z+=Math.cos(carYaw)*carSpeed*dt;
    player.position.copy(car.position);
  }
  player.position.x=THREE.MathUtils.clamp(player.position.x,-300,300);
  player.position.z=THREE.MathUtils.clamp(player.position.z,-330,330);
  const focus=driving?car.position:player.position;
  const target=new THREE.Vector3(focus.x,third?4.4:2.1,focus.z);
  if(third){
    camera.position.lerp(target.clone().add(new THREE.Vector3(Math.sin(yaw)*10,5+pitch*7,Math.cos(yaw)*10)),1-Math.pow(.001,dt));
    camera.lookAt(focus.x,2,focus.z);
  } else {camera.position.copy(target);camera.rotation.set(pitch,yaw,0,'YXZ')}
  const distance=Math.hypot(player.position.x,player.position.z);
  document.querySelector('#locationName').textContent=distance<45?'ساحة الاتحاد':player.position.z < -285?'واجهة البحر':player.position.x < -120?'الغابة العربية':player.position.z < -50&&player.position.x>55?'القصر الملكي':'الحي السكني';
  const nearCar=player.position.distanceTo(car.position)<12;
  document.querySelector('#missionTitle').textContent=save.wood+save.fish>0?'اجمع موارد العالم':'اكتشف ساحة الاتحاد';
  document.querySelector('#missionText').textContent=driving?'قد السيارة واستكشف الطرق':nearCar?'اضغط E لركوب السيارة':player.position.x < -120?'اضغط E لجمع الخشب':player.position.z < -285?'اضغط E لصيد السمك':'تحرك نحو السيارة أو الغابة أو الشاطئ';
  document.querySelector('#missionProgress').style.width=Math.min(100,(save.wood+save.fish)*10)+'%';
  renderer.render(scene,camera);
}
camera.position.set(0,7,54);camera.lookAt(0,2,42);
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6))});
setTimeout(()=>document.querySelector('#loading').classList.add('hide'),1200);
