const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');

test('cap artwork provides 20 distinct textures',()=>{
  const context=vm.createContext({Image:class{}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../caps.js'),'utf8'),context);
  const textures=vm.runInContext('capTextures.map(texture=>texture.src)',context);
  assert.equal(textures.length,20);
  assert.equal(new Set(textures).size,20);
});

test('20 players have artwork, take turns and appear in final results',()=>{
  const elements=new Map();
  const element=id=>{
    if(!elements.has(id))elements.set(id,{style:{},dataset:{},classList:{toggle(){}},
      addEventListener(){},setAttribute(){},getContext(){return {setTransform(){}};},
      getBoundingClientRect(){return {width:390,height:844};},innerHTML:'',textContent:''});
    return elements.get(id);
  };
  const context=vm.createContext({CapPhysics:require('../physics.js'),
    capTextures:Array.from({length:20},(_,i)=>({src:`cap-${i}`})),
    document:{getElementById:element,body:element('body'),addEventListener(){}},
    window:{addEventListener(){},scrollTo(){}},devicePixelRatio:1,
    ResizeObserver:class{observe(){}},requestAnimationFrame(){}
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../game.js'),'utf8'),context);
  vm.runInContext("for(let i=0;i<30;i++)$('plus').onclick();",context);
  assert.equal(vm.runInContext('count',context),20);
  assert.equal(element('plus').disabled,true);
  assert.equal((element('capPreview').innerHTML.match(/class="cap-number"/g)||[]).length,20);
  assert.equal(new Set([...element('capPreview').innerHTML.matchAll(/src="(cap-\d+)"/g)].map(match=>match[1])).size,20);
  vm.runInContext(`start();
    for(let i=0;i<20;i++){
      turn=i;beginTurn();
      caps.push({id:i,x:260,y:C.start,vx:0,vy:0,retired:false});
      setPhase('power');holding=true;power=i%2===0?.65:0;release();
      for(let n=0;n<2000;n++)if(!step(caps,1/180))break;
      settle(caps);
    }
    finish();`,context);
  assert.equal(vm.runInContext('phase',context),'finished');
  const result=element('rankedPlayers').innerHTML+element('retiredPlayers').innerHTML;
  assert.equal((result.match(/class="score-row"/g)||[]).length,20);
  assert.ok(result.includes('선수 20'));
  assert.ok(!result.includes('undefined'));
  assert.equal(element('resultsPanel').hidden,false);
  element('resultRestart').onclick();
  assert.equal(vm.runInContext('phase',context),'setup');
  assert.equal(vm.runInContext('count',context),20);
});
