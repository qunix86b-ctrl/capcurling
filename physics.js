(function(root){
  'use strict';
  const C={width:520,length:2600,radius:19,start:2350,line:1550,friction:650,restitution:.80};
  function step(caps,dt){
    for(const c of caps){
      if(c.retired)continue;
      const speed=Math.hypot(c.vx,c.vy), next=Math.max(0,speed-C.friction*dt);
      if(speed){const avg=(speed+next)/2;c.x+=c.vx/speed*avg*dt;c.y+=c.vy/speed*avg*dt;c.vx*=next/speed;c.vy*=next/speed;c.spin=(c.spin||0)+speed*dt*.006;}
      if(c.x<C.radius||c.x>C.width-C.radius||c.y<C.radius||c.y>C.length-C.radius){c.retired=true;c.reason='경계 밖';c.vx=0;c.vy=0;}
    }
    for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){
      const a=caps[i],b=caps[j];if(a.retired||b.retired)continue;
      let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=C.radius*2)continue;
      if(d<.0001){dx=1;dy=0;d=1;}
      const nx=dx/d,ny=dy/d,overlap=C.radius*2-d;
      a.x-=nx*overlap/2;a.y-=ny*overlap/2;b.x+=nx*overlap/2;b.y+=ny*overlap/2;
      const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
      if(relative<0){const impulse=-(1+C.restitution)*relative/2;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}
    }
    for(const c of caps)if(!c.retired&&(c.x<C.radius||c.x>C.width-C.radius||c.y<C.radius||c.y>C.length-C.radius)){c.retired=true;c.reason='경계 밖';c.vx=c.vy=0;}
    return caps.some(c=>!c.retired&&Math.hypot(c.vx,c.vy)>0);
  }
  function settle(caps,final=false){
    if(final)for(const c of caps)if(!c.retired){c.qualified=c.y<=C.line;if(!c.qualified)c.reason='기준선 미달';}
    return caps.filter(c=>!c.retired&&(!final||c.qualified)).sort((a,b)=>a.y-b.y);
  }
  function distance(c){return Math.max(0,(C.start-c.y)/100);}
  const api={C,step,settle,distance};if(typeof module!=='undefined')module.exports=api;root.CapPhysics=api;
})(typeof globalThis!=='undefined'?globalThis:this);
