'use strict';
const $=id=>document.getElementById(id),{C,step,settle,distance}=CapPhysics;
const MAX_PLAYERS=20;
const designs=[{name:'코카콜라'},{name:'칠성사이다'},{name:'환타 오렌지'},{name:'펩시'},{name:'웰치스 포도'},{name:'밀키스'},{name:'레몬 소다'},{name:'체리 소다'},{name:'자몽 토닉'},{name:'블루 레몬에이드'},{name:'진저에일'},{name:'루트비어'},{name:'크림소다'},{name:'콜드브루'},{name:'복숭아 아이스티'},{name:'청포도 소다'},{name:'자두 소다'},{name:'오렌지 크림'},{name:'라임 토닉'},{name:'바닐라 콜라'}];
let count=2,players=[],caps=[],turn=0,phase='setup',holding=false,angle=0,power=0,osc=0,overview=false,camera=1700,targetCamera=1700,lastTime=0,accumulator=0,settledTime=0;
const canvas=$('game'),ctx=canvas.getContext('2d');let w=0,h=0,scale=1,ox=0,viewHeight=900;
function icon(i){return `<span class="numbered-cap"><img class="cap-icon" src="${capTextures[i%capTextures.length].src}" alt="${designs[i%designs.length].name} 병뚜껑"><span class="cap-number">${i+1}</span></span>`;}
function preview(){ $('playerCount').textContent=count;$('minus').disabled=count<=1;$('plus').disabled=count>=MAX_PLAYERS;$('capPreview').innerHTML=Array.from({length:count},(_,i)=>icon(i)).join(''); }
function setPhase(next){phase=next;holding=false;document.body.classList.toggle('playing',next!=='setup');$('setupPanel').hidden=next!=='setup';$('instruction').hidden=['setup','finished'].includes(next);$('resultsPanel').hidden=next!=='finished';$('restartButton').hidden=['setup','finished'].includes(next);$('viewButton').hidden=['setup','finished'].includes(next);document.body.dataset.phase=next;$('fieldMeter').hidden=!['aim','power'].includes(next);canvas.dataset.phase=next;if(next==='aim'){$('meterLabel').textContent='SHOT ANGLE';$('powerValue').textContent='0°';$('powerFill').style.width='50%';}if(next==='power'){$('meterLabel').textContent='SHOT POWER';$('powerValue').textContent='0%';$('powerFill').style.width='0%';}canvas.setAttribute('aria-label',next==='place'?'출발 구역을 눌러 병뚜껑 배치':next==='aim'?'필드를 누르고 손을 떼어 방향 결정':next==='power'?'필드를 누르고 손을 떼어 발사':'병뚜껑 컬링 경기장');
 const messages={setup:['연습보다 실전이지.','선수 수를 정하고 시작하세요'],place:['출발 위치를 선택하세요','출발 구역을 터치해 병뚜껑을 놓으세요'],aim:['방향을 정하세요','필드 어디든 누르고, 원하는 방향에서 손을 떼세요'],power:['얼마나 멀리 보낼까요?','필드를 다시 누르고, 원하는 파워에서 손을 떼세요'],moving:['병뚜껑이 이동하고 있어요','모든 병뚜껑이 멈출 때까지 기다려주세요'],between:['이번 샷이 끝났어요','잠시 후 다음 선수가 자동으로 시작합니다'],finished:['오늘의 승부가 끝났어요','끝까지 살아남은 병뚜껑을 확인하세요']};
 $('arenaLabel').textContent=(['place','aim','power'].includes(next)?`선수 ${turn+1} · `:'')+messages[next][0];$('hint').textContent=messages[next][1];}
function start(){players=Array.from({length:count},(_,id)=>({id}));caps=[];turn=0;overview=false;updateViewButton();beginTurn();}
function beginTurn(){angle=0;power=0;osc=0;camera=targetCamera=1700;overview=false;updateViewButton();$('powerFill').style.width='0%';$('powerValue').textContent='0%';$('meterLabel').textContent='SHOT POWER';setPhase('place');window.scrollTo({top:0,behavior:'instant'});}
function finish(){
  const ranked=settle(caps),best=ranked[0],winners=best?ranked.filter(c=>distance(c).toFixed(2)===distance(best).toFixed(2)):[];
  const retired=caps.filter(c=>c.retired).sort((a,b)=>a.id-b.id);
  $('resultSummary').textContent=best?`${winners.map(c=>`선수 ${c.id+1}`).join(' · ')} ${winners.length>1?'공동 우승!':'우승!'}`:'이번 경기는 모두 리타이어했어요.';
  function row(c,rank){return `<div class="score-row"><b class="rank">${rank}</b>${icon(c.id)}<div class="score-name">선수 ${c.id+1}<small>${designs[c.id%designs.length].name}</small></div><strong class="score-value ${c.retired?'retired':''}">${c.retired?c.reason:distance(c).toFixed(2)+' m'}</strong></div>`;}
  $('rankedPlayers').innerHTML=ranked.length?ranked.map(c=>row(c,1+ranked.filter(other=>Number(distance(other).toFixed(2))>Number(distance(c).toFixed(2))).length)).join(''):'<p class="empty-result">기록을 인정받은 선수가 없습니다.</p>';
  $('retiredSection').hidden=!retired.length;
  $('retiredPlayers').innerHTML=retired.map(c=>row(c,'—')).join('');
  overview=true;updateViewButton();setPhase('finished');
}
function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
function transform(){scale=overview?Math.min((w-50)/C.width,(h-35)/C.length):Math.min((w-70)/C.width,h/770);viewHeight=h/scale;ox=(w-C.width*scale)/2;if(overview)camera=-((h/scale-C.length)/2);else if(['setup','place','aim','power'].includes(phase))camera=targetCamera=Math.max(0,C.start-viewHeight*.8);}
function worldPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left-ox)/scale,y:(e.clientY-r.top)/scale+camera};}
let fieldPointer=null;
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||fieldPointer!==null||$('helpDialog').open)return;
  if(phase==='finished')return;
  if(!['place','aim','power'].includes(phase))return;
  e.preventDefault();
  if(e.pointerType!=='touch')canvas.focus({preventScroll:true});
  if(phase==='place'){
    const p=worldPoint(e);
    if(p.x<C.radius+5||p.x>C.width-C.radius-5||p.y<2230||p.y>2440)return;
    caps.push({id:turn,x:p.x,y:p.y,vx:0,vy:0,spin:0,retired:false,shot:false});
    setPhase('aim');fieldPointer=e.pointerId;canvas.setPointerCapture(e.pointerId);return;
  }
  fieldPointer=e.pointerId;canvas.setPointerCapture(e.pointerId);hold();
});
canvas.addEventListener('pointerup',e=>{if(e.pointerId!==fieldPointer)return;fieldPointer=null;release();});
function cancelField(){fieldPointer=null;holding=false;}
canvas.addEventListener('pointercancel',cancelField);
canvas.addEventListener('lostpointercapture',cancelField);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function hold(){if(holding||!['aim','power'].includes(phase))return;holding=true;osc=0;if(phase==='power')power=0;}
function release(){if(!holding)return;holding=false;if(phase==='aim'){setPhase('power');return;}if(phase==='power'){const c=caps.find(c=>c.id===turn),v=125+power*1875;c.vx=Math.sin(angle)*v;c.vy=-Math.cos(angle)*v;c.shot=true;accumulator=0;settledTime=0;setPhase('moving');}}
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&!$('helpDialog').open&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&['aim','power'].includes(phase)){e.preventDefault();hold();}});window.addEventListener('keyup',e=>{if(e.code==='Space'&&holding){e.preventDefault();release();}});window.addEventListener('blur',cancelField);document.addEventListener('visibilitychange',()=>{holding=false;lastTime=0;});
$('minus').onclick=()=>{count=Math.max(1,count-1);preview();};$('plus').onclick=()=>{count=Math.min(MAX_PLAYERS,count+1);preview();};$('startButton').onclick=start;function reset(){players=[];caps=[];turn=0;overview=false;camera=1700;updateViewButton();setPhase('setup');preview();}$('restartButton').onclick=reset;$('resultRestart').onclick=reset;$('helpButton').onclick=()=>{holding=false;$('helpDialog').showModal();};$('closeHelp').onclick=()=>$('helpDialog').close();
function updateViewButton(){$('viewButton').textContent=overview?'가까이 보기 ↙':'전체 레인 보기 ↗';}$('viewButton').onclick=()=>{overview=!overview;if(!overview)camera=targetCamera;updateViewButton();};
function textAt(text,x,y,size,color,align='center'){ctx.fillStyle=color;ctx.font=`600 ${size}px 'DM Sans', 'Noto Sans KR', sans-serif`;ctx.textAlign=align;ctx.fillText(text,x,y);}
function drawCap(c,ghost=false){
  const texture=capTextures[c.id%capTextures.length];ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.spin||0);
  ctx.shadowColor='#17221666';ctx.shadowBlur=5;ctx.shadowOffsetY=3;
  if(texture.complete&&texture.naturalWidth)ctx.drawImage(texture,-21,-21,42,43.26);
  ctx.restore();if(!ghost)textAt(String(c.id+1),c.x,c.y+34,11,'#3b4b2e');
}
function draw(){ctx.clearRect(0,0,w,h);transform();const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#294d39');bg.addColorStop(1,'#19362b');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(ox,-camera*scale);ctx.scale(scale,scale);
 ctx.fillStyle='#10251e';ctx.fillRect(-20,0,C.width+40,C.length);ctx.fillStyle='#8e7751';ctx.fillRect(-11,0,C.width+22,C.length);ctx.fillStyle='#b99b71';ctx.fillRect(0,0,C.width,C.length);
 // A matte desktop: continuous fine grain instead of polished bowling planks.
 for(let k=0;k<115;k++){
   const x=(k*47.37)%C.width;
   ctx.strokeStyle=k%3?'#72543313':'#f6e0b616';ctx.lineWidth=k%4===0?1.4:.55;
   ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+12,850,x-14,1740,x+5,C.length);ctx.stroke();
 }
 for(let k=0;k<1800;k++){
   const x=(k*73.71)%C.width,y=(k*137.31)%C.length;
   ctx.fillStyle=k%2?'#624c3211':'#ead7ac13';ctx.fillRect(x,y,.9,1.8);
 }
 ctx.strokeStyle='#5d704038';ctx.lineWidth=2;ctx.strokeRect(11,14,C.width-22,C.length-28);
 for(let y=350;y<=2350;y+=100){const major=(2350-y)%500===0;ctx.strokeStyle='#74663b66';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(15,y);ctx.lineTo(major?36:25,y);ctx.moveTo(C.width-15,y);ctx.lineTo(C.width-(major?36:25),y);ctx.stroke();if(major&&y<2300){textAt(`${(2350-y)/100}m`,48,y+4,10,'#7f784f','left');}}
 ctx.fillStyle='#526a2920';ctx.fillRect(12,C.line-36,C.width-24,36);ctx.setLineDash([12,8]);ctx.strokeStyle='#5b742f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(12,C.line);ctx.lineTo(C.width-12,C.line);ctx.stroke();ctx.setLineDash([]);textAt('QUALIFYING LINE  /  8m',C.width/2,C.line-13,12,'#5d713e');textAt('THE EDGE. KNOW YOUR LIMIT.',C.width/2,65,13,'#8e8057');
 ctx.fillStyle='#677d3b12';ctx.fillRect(13,2230,C.width-26,210);ctx.strokeStyle='#69794577';ctx.setLineDash([5,8]);ctx.strokeRect(25,2230,C.width-50,210);ctx.setLineDash([]);textAt('PLACE YOUR CAP',C.width/2,2404,11,'#6c764b');textAt('START',C.width/2,2489,28,'#a39366');for(const x of [160,210,260,310,360]){ctx.fillStyle='#87925e80';ctx.beginPath();ctx.moveTo(x,2170);ctx.lineTo(x-4,2177);ctx.lineTo(x+4,2177);ctx.fill();}
 if(phase==='setup'){drawCap({id:0,x:230,y:2350,spin:-.2},true);drawCap({id:1,x:290,y:2290,spin:.3},true);}
 for(const c of caps)if(!c.retired)drawCap(c);
 const active=caps.find(c=>c.id===turn);if(active&&!active.retired&&['aim','power'].includes(phase)){ctx.save();ctx.translate(active.x,active.y);ctx.rotate(angle);ctx.strokeStyle='#304f35';ctx.fillStyle='#304f35';ctx.lineWidth=4;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(0,-135);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(0,-150);ctx.lineTo(-10,-129);ctx.lineTo(10,-129);ctx.closePath();ctx.fill();ctx.restore();ctx.strokeStyle='#49693655';ctx.lineWidth=1;ctx.beginPath();ctx.arc(active.x,active.y,32,0,Math.PI*2);ctx.stroke();}
 ctx.restore();$('distance').textContent=overview?'FULL TABLE · 26m':phase==='moving'&&active?`${distance(active).toFixed(2)} m  /  LIVE`:'STARTING ZONE ↓';}
let betweenTime=0;
function frame(t){const dt=lastTime?Math.min((t-lastTime)/1000,.05):0;lastTime=t;if(phase==='between'){betweenTime+=dt;if(betweenTime>1.2){betweenTime=0;turn++;beginTurn();}}else betweenTime=0;if(holding){osc+=dt;if(phase==='aim'){angle=Math.sin(osc*2.3)*Math.PI*.36;$('powerValue').textContent=`${Math.round(angle*180/Math.PI)}°`;$('meterLabel').textContent='SHOT ANGLE';$('powerFill').style.width=`${50+angle/(Math.PI*.36)*50}%`;}else if(phase==='power'){power=(1-Math.cos(osc*2.5))/2;$('powerFill').style.width=`${power*100}%`;$('powerValue').textContent=`${Math.round(power*100)}%`;$('meterLabel').textContent='SHOT POWER';}}
 if(phase==='moving'){accumulator+=dt;let moving=true;while(accumulator>=1/180){moving=step(caps,1/180);accumulator-=1/180;}const c=caps.find(c=>c.id===turn);const tracked=c&&!c.retired&&Math.hypot(c.vx,c.vy)>1?c:caps.filter(c=>!c.retired).sort((a,b)=>Math.hypot(b.vx,b.vy)-Math.hypot(a.vx,a.vy))[0];if(tracked)targetCamera=Math.max(-40,Math.min(Math.max(0,C.start-viewHeight*.8),tracked.y-viewHeight*.56));if(!overview)camera+=(targetCamera-camera)*Math.min(1,dt*5);if(!moving){settledTime+=dt;if(settledTime>.45){settle(caps);if(turn===count-1)finish();else{setPhase('between');const retired=c.retired;$('arenaLabel').textContent=retired?`선수 ${turn+1} · ${c.reason}`:`선수 ${turn+1} · ${distance(c).toFixed(2)}m`;}}}else settledTime=0;}draw();requestAnimationFrame(frame);}
window.addEventListener('resize',resize);new ResizeObserver(resize).observe(canvas);setPhase('setup');preview();resize();requestAnimationFrame(frame);
