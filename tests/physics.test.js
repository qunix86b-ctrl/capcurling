const {test}=require('node:test');
const assert=require('node:assert/strict');
const {C,step,settle,distance}=require('../physics.js');
const cap=(o={})=>({id:0,x:260,y:C.start,vx:0,vy:0,retired:false,...o});
function simulate(caps,final=true){for(let i=0;i<10000;i++)if(!step(caps,1/180))return settle(caps,final);throw Error('Simulation did not settle');}
test('weak shot is classified below the qualifying line without leaving the field',()=>{const c=cap({vy:-300}),result=simulate([c]);assert.equal(c.reason,'기준선 미달');assert.equal(c.qualified,false);assert.equal(c.retired,false);assert.equal(result.length,0);});
test('medium shot remains on table and records distance',()=>{const c=cap({vy:-1250});simulate([c]);assert.equal(c.retired,false);assert.ok(Math.abs(distance(c)-1250*1250/(2*C.friction)/100)<.01);});
test('excessive power falls off far edge',()=>{const c=cap({vy:-2000});simulate([c]);assert.equal(c.reason,'경계 밖');});
test('sideways shot falls off side',()=>{const c=cap({vx:600,vy:-700});simulate([c]);assert.equal(c.reason,'경계 밖');});
test('collision transfers momentum to stationary cap',()=>{const a=cap({y:1300,vy:-650}),b=cap({id:1,y:1250});const original=b.y;simulate([a,b]);assert.ok(b.y<original-100);assert.equal(b.retired,false);});
test('collision can push opponent off table',()=>{const a=cap({y:500,vy:-900}),b=cap({id:1,y:450});simulate([a,b]);assert.equal(b.reason,'경계 밖');});
test('retired caps do not collide or move',()=>{const a=cap({vy:-1250}),b=cap({id:1,y:2000,retired:true});simulate([a,b]);assert.equal(b.y,2000);assert.equal(a.retired,false);});
test('rank uses final position including pushed caps',()=>{const a=cap({y:900}),b=cap({id:1,y:700});assert.deepEqual(settle([a,b]).map(c=>c.id),[1,0]);});
test('qualifying line is inclusive',()=>{const c=cap({y:C.line});assert.equal(settle([c]).length,1);});
test('final classification keeps an under-line cap at its exact stopped position',()=>{const c=cap({vy:-300});simulate([c],false);assert.equal(c.retired,false);assert.ok(c.y>C.line);const stopped={x:c.x,y:c.y};settle([c],true);assert.equal(c.reason,'기준선 미달');assert.equal(c.retired,false);assert.deepEqual({x:c.x,y:c.y},stopped);});
test('a later cap can push an under-line cap into qualification',()=>{const target=cap({y:C.line+90}),shooter=cap({id:1,y:C.line+145,vy:-700});simulate([target,shooter],false);assert.equal(target.retired,false);assert.ok(target.y<=C.line);settle([target,shooter],true);assert.equal(target.retired,false);});

test('desktop friction slows a strong shot noticeably and stops it',()=>{
 const c=cap({vy:-1250});
 for(let i=0;i<180;i++)step([c],1/180);
 assert.ok(Math.abs(c.vy+600)<.01);
 for(let i=0;i<270;i++)step([c],1/180);
 assert.equal(Math.hypot(c.vx,c.vy),0);assert.equal(c.retired,false);
});
