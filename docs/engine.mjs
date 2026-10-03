export const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export function text(desc,params=[]){return String(desc||'').replace(/#(\d+)\[[^\]]+\](%)?/g,(_,i,p)=>{const v=params[+i-1];return v===undefined?_:String(+(v*(p?100:1)).toFixed(5))+(p?'%':'')}).replace(/<[^>]*>/g,'').replace(/\\n/g,'\n')}
const mapped={HPAddedRatio:'hpPct',AttackAddedRatio:'atkPct',DefenceAddedRatio:'defPct',SpeedAddedRatio:'spdPct',HPDelta:'hpFlat',AttackDelta:'atkFlat',DefenceDelta:'defFlat',SpeedDelta:'spdFlat',CriticalChanceBase:'cr',CriticalDamageBase:'cd',BreakDamageAddedRatioBase:'be',StatusProbabilityBase:'ehr',SPRatioBase:'err',AllDamageTypeAddedRatio:'dmg',ElationDamageAddedRatio:'elation'};
export function panel(D,b){
 const c=D.characters[b.character]||D.prepared?.characters[b.character],id=c.id.length===5?c.id.slice(1):c.id;
 const lev=clamp(+b.level,1,80),p=clamp(+b.promotion,0,6),g=D.character_promotions[id].values[p],lc=D.light_cones[b.cone],lg=lc?D.light_cone_promotions[b.cone].values[clamp(+b.conePromotion,0,6)]:null;
 const stats={hpPct:0,atkPct:0,defPct:0,spdPct:0,hpFlat:0,atkFlat:0,defFlat:0,spdFlat:0,cr:0,cd:0,be:0,ehr:0,err:0,dmg:0,elation:0};
 const apply=a=>{for(const v of a||[]){let k=mapped[v.type];if(v.type===(c.element==='Lightning'?'Thunder':c.element)+'AddedRatio')k='dmg';if(v.type==='ElationDamageAddedRatioBase')k='elation';if(k)stats[k]+=+v.value}};
 if(lc?.path===c.path)apply(D.light_cone_ranks[b.cone].properties[+b.superimposition-1]);
 if(b.traces)for(const tid of c.skill_trees||[]){const t=D.character_skill_trees[tid];for(const level of t?.levels||[]){if(level.promotion<=p&&level.level<=lev)apply(level.properties)}}
 for(const [sid,n] of [[b.set,4],[b.planar,2]]){if(sid){const r=D.relic_sets[sid];apply(r?.properties[0]);if(n===4)apply(r?.properties[1])}}
 for(const relic of b.relics||[]){if(!relic)continue;const group=Object.values(D.relic_main_affixes).find(x=>Object.values(x.affixes).some(a=>a.property===relic.property)&&x.id===relic.group);const a=Object.values(group?.affixes||{}).find(x=>x.property===relic.property);if(a)apply([{type:a.property,value:a.base+a.step*+relic.level}])}
 for(const [k,v] of Object.entries(b.buffs||{}))if(k in stats)stats[k]+=+v;
 const base={};for(const k of ['hp','atk','def']){base[k]=g[k].base+g[k].step*(lev-1)+(lg?lg[k].base+lg[k].step*(clamp(+b.coneLevel,1,80)-1):0)}
 return {...stats,hp:base.hp*(1+stats.hpPct)+stats.hpFlat,atk:base.atk*(1+stats.atkPct)+stats.atkFlat,def:base.def*(1+stats.defPct)+stats.defFlat,spd:g.spd.base*(1+stats.spdPct)+stats.spdFlat,cr:clamp(g.crit_rate.base+stats.cr,0,1),cd:g.crit_dmg.base+stats.cd,level:lev,base,coneMismatch:!!lc&&lc.path!==c.path};
}
export function skill(D,b,sid){const s=D.character_skills[sid];let level=+b.skillLevel;const c=D.characters[b.character]||D.prepared?.characters[b.character];for(const rid of c.ranks||[]){const r=D.character_ranks[rid];if(r&&r.rank<=+b.eidolon)for(const u of r.level_up_skills||[])if(u.id===sid)level+=u.num}level=clamp(level,1,s.max_level);const row=D.prepared?.tables['技能倍率库'].rows.find(r=>r[0]===sid+'_'+level);return {id:sid,name:s.name,type:s.type,level,desc:text(s.desc,s.params[level-1]),atk:row?.[5]||0,hp:row?.[6]||0,def:row?.[7]||0,elation:row?.[8]||0,status:row?.[10]||'需手动填写倍率'}}
export function damage(D,p,e,a){
 const def=(p.level+20)/((e.level+20)*(1-clamp(e.defShred+e.defIgnore,0,1))+p.level+20),res=1-clamp(e.res-e.resPen,-1,.9),vul=1+e.vul,broken=e.broken?1:.9,base=p.atk*a.atk+p.hp*a.hp+p.def*a.def+(a.flat||0),crit=1+p.cr*p.cd;
 const common=def*res*vul*broken*(1-e.reduction),noncrit=base*(1+p.dmg)*common,direct=noncrit*crit,dot=base*(1+p.dmg)*common,prob=clamp(a.chance*(1+p.ehr)*(1-e.effectRes),0,1);
 const bb=p.level===80?3767.5533:+D.AvatarBreakDamage[String(p.level)].BreakBaseDamage.Value,elationBase=p.level===80?7535.107:2*bb;
 const breakDamage=bb*a.breakMultiplier*(.5+e.maxToughness/40)*(1+p.be)*def*res*vul*(1-e.reduction)*.9;
 const superbreak=bb*a.toughness/10*(1+p.be)*a.superMultiplier*def*res*vul*(1-e.reduction);
 const elation=elationBase*a.elation*(1+p.elation)*a.punchline*(1+a.elationBoost)*(1+a.merrymaking)*crit*common;
 const trueDamage=a.trueFlat+a.trueRatio*direct;
 return {direct,noncrit,critical:noncrit*(1+p.cd),dot,dotExpected:dot*prob,breakDamage,superbreak,elation,trueDamage,def,res,vul,broken,crit,base,prob};
}
export function simulate(D,builds,e,config){
 const players=builds.map((b,i)=>({b,i,p:panel(D,b),next:10000/panel(D,b).spd,energy:+b.initialEnergy||0,step:0,damage:0}));let time=0,sp=clamp(config.sp,0,5),hp=config.hp,tough=e.broken?0:e.maxToughness,enemyNext=10000/config.enemySpeed;const log=[];
 for(let step=0;step<config.actions&&hp>0;step++){
  const q=players.reduce((a,b)=>a.next<=b.next?a:b);if(enemyNext<q.next){time=enemyNext;if(tough===0)tough=e.maxToughness;log.push({time,actor:'敌方',action:'回合开始',damage:0,sp,energy:0,tough,hp});enemyNext+=10000/config.enemySpeed;step--;continue}
  time=q.next;let action=q.b.rotation.split(/[\s,，]+/).filter(Boolean)[q.step++%q.b.rotation.split(/[\s,，]+/).filter(Boolean).length]||'普攻';const type={普攻:'Normal',战技:'BPSkill',终结技:'Ultra'}[action]||'Normal';const c=D.characters[q.b.character]||D.prepared.characters[q.b.character],sid=c.skills.find(id=>D.character_skills[id]?.type===type);let reason='';
  if(action==='战技'&&sp<(c.id==='1008'?0:1)){action='普攻';reason='（战技点不足）'}
  if(action==='终结技'&&q.energy<c.max_sp){action='普攻';reason='（能量不足）'}
  const actualSid=c.skills.find(id=>D.character_skills[id]?.type===({普攻:'Normal',战技:'BPSkill',终结技:'Ultra'}[action]||'Normal'));const s=actualSid?skill(D,q.b,actualSid):{atk:0,hp:0,def:0,elation:0};const a={...config.attack,...s,breakMultiplier:{Physical:2,Fire:2,Ice:1,Lightning:1,Wind:1.5,Quantum:.5,Imaginary:.5}[c.element]||1};if(q.b.override)a.atk=+q.b.override;
  const amount=damage(D,q.p,{...e,broken:tough===0},a);let dealt=q.b.damageType==='dot'?amount.dotExpected:q.b.damageType==='elation'?amount.elation:q.b.damageType==='true'?amount.trueDamage:amount.direct;const old=tough;const cut=(a.atk||a.hp||a.def||a.elation)?(action==='普攻'?10:action==='战技'?20:30):0;tough=Math.max(0,tough-cut);if(old>0&&tough===0)dealt+=amount.breakDamage;if(old===0&&config.superbreak)dealt+=damage(D,q.p,{...e,broken:true},{...a,toughness:cut}).superbreak;
  if(action==='普攻'){sp=Math.min(5,sp+1);q.energy=Math.min(c.max_sp,q.energy+20*(1+q.p.err))}else if(action==='战技'){sp-=c.id==='1008'?0:1;q.energy=Math.min(c.max_sp,q.energy+30*(1+q.p.err))}else q.energy=5*(1+q.p.err);
  hp=Math.max(0,hp-dealt);q.damage+=dealt;q.next+=10000/q.p.spd;log.push({time,actor:c.name,action:action+reason,damage:dealt,sp,energy:q.energy,tough,hp});
 }
 return {log,players,total:players.reduce((s,p)=>s+p.damage,0),time,hp};
}
