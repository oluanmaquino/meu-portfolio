/** Portfólio v4 — redes SVG, tecnologias escolhidas e áudio controlado pelo visitante. */
(function(){
'use strict';
const fallback=window.PORTFOLIO_SITE||{};
const library=window.PORTFOLIO_TECH_LIBRARY||[];
const socialLibrary={github:'GitHub',instagram:'Instagram',tiktok:'TikTok',linkedin:'LinkedIn',youtube:'YouTube',whatsapp:'WhatsApp',email:'E-mail',website:'Site',facebook:'Facebook',x:'X / Twitter',behance:'Behance',discord:'Discord'};
const slug=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const pathValid=p=>typeof p==='string' && /^assets\/(audio|icons)\/[a-zA-Z0-9_./-]+$/.test(p)&&!p.includes('..');
function techIcon(name){const normalized=slug(name);return library.find(x=>slug(x.name)===normalized || slug(x.id)===normalized)}
window.PortfolioTech={chip:function(name){
  const span=document.createElement('span');span.className='portfolio-tech-chip';
  const data=techIcon(name);
  if(data&&pathValid(data.icon)){const img=document.createElement('img');img.src=data.icon;img.alt='';img.width=19;img.height=19;img.loading='lazy';span.append(img)}
  const label=document.createElement('span');label.textContent=name;span.append(label);return span;
}};
const widget=document.getElementById('audio-widget');const audio=document.getElementById('background-audio');
const button=document.getElementById('audio-toggle');const mute=document.getElementById('audio-mute');const range=document.getElementById('audio-volume');const status=document.getElementById('audio-status');
let config=null, authorized=false, muted=false, inArea=false, fading=0, targetVolume=0.22, activePlay=false;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
function safeUrl(url){try{const u=new URL(String(url||''));return ['https:','http:','mailto:'].includes(u.protocol)?u.href:null}catch(_){return null}}
function socialRender(settings){
 const target=document.getElementById('social-links');if(!target)return;
 target.querySelectorAll('[data-social-generated]').forEach(x=>x.remove());
 for(const social of settings.socials||[]){
   if(!social.enabled||!socialLibrary[social.id])continue;
   const url=safeUrl(social.url);if(!url)continue;
   const a=document.createElement('a');a.href=url;a.dataset.socialGenerated='true';a.setAttribute('aria-label',socialLibrary[social.id]);
   if(!url.startsWith('mailto:')){a.target='_blank';a.rel='noopener noreferrer'}
   const img=document.createElement('img');img.className='social-svg';img.src='assets/icons/social/'+social.id+'.svg';img.alt='';img.width=20;img.height=20;
   a.append(img,document.createTextNode(' '+socialLibrary[social.id]));target.append(a);
 }
}
function skillRender(settings){
 const list=document.getElementById('skills-list');if(!list)return;list.replaceChildren();
 for(const name of settings.skills||[]){const card=document.createElement('div');card.className='tech-card';
 const selected=techIcon(name);if(selected&&pathValid(selected.icon)){const img=document.createElement('img');img.className='tech-symbol';img.src=selected.icon;img.alt='';img.width=43;img.height=43;card.append(img)}
 const title=document.createElement('div');const h=document.createElement('strong');h.textContent=name;title.append(h);card.append(title);list.append(card);
 }
 const any=(settings.skills||[]).length>0;document.getElementById('tecnologias').hidden=!any;document.querySelectorAll('a[href="#tecnologias"]').forEach(a=>a.hidden=!any);
}
function inSelectedArea(){
 if(!config)return false;
 if(config.mode==='all')return true;
 const selected=Array.isArray(config.sections)?config.sections:[];
 return selected.some(id=>{const el=document.getElementById(id);if(!el)return false;const r=el.getBoundingClientRect();const h=window.innerHeight||600;return r.bottom>h*.27&&r.top<h*.73});
}
function ramp(goal,pauseAfter=false){
 cancelAnimationFrame(fading);const start=audio.volume,begin=performance.now();const duration=reduced.matches?0:360;
 const animate=now=>{const t=duration?Math.min(1,(now-begin)/duration):1;audio.volume=Math.max(0,Math.min(1,start+(goal-start)*t));if(t<1)fading=requestAnimationFrame(animate);else if(pauseAfter && !activePlay){audio.pause()}};
 fading=requestAnimationFrame(animate);
}
function audioSync(){
 if(!config)return;
 inArea=inSelectedArea();
 const shouldPlay=authorized&&inArea&&!document.hidden;
 if(shouldPlay){
   if(!activePlay){activePlay=true;audio.volume=0;
     audio.play().then(()=>ramp(muted?0:targetVolume)).catch(()=>{activePlay=false;authorized=false;button.textContent='Ativar som';mute.disabled=true;status.textContent='Reprodução bloqueada; clique novamente';});
   }else ramp(muted?0:targetVolume);
 }else if(activePlay){activePlay=false;ramp(0,true)}
 if(!authorized){button.textContent='Ativar som';status.textContent='Ative para ouvir';}
 else {button.textContent=activePlay?'Pausar música':'Desativar música';status.textContent=inArea?'Na seção selecionada':'Fora das seções';}
 mute.disabled=!authorized;mute.textContent=muted?'Reativar som':'Silenciar';
}
function audioRender(settings){
 config=settings.audio||{};
 if(!widget||!config.enabled||!config.src||!/^assets\/audio\/[\w./-]+\.mp3$/i.test(config.src)||config.src.includes('..')){if(widget)widget.hidden=true;return}
 widget.hidden=false;audio.src=config.src;audio.loop=config.loop!==false;audio.preload='none';
 targetVolume=Math.max(0,Math.min(1,Number(config.volume)||0.22));range.value=String(targetVolume);audio.volume=0;
 audioSync();
}
button.addEventListener('click',()=>{authorized=!authorized;if(!authorized){audio.pause();activePlay=false;audio.currentTime=0;}audioSync()});
mute.addEventListener('click',()=>{muted=!muted;audioSync()});
range.addEventListener('input',()=>{targetVolume=Number(range.value);if(activePlay)ramp(muted?0:targetVolume)});
let scrolling=false;function schedule(){if(scrolling)return;scrolling=true;requestAnimationFrame(()=>{scrolling=false;if(config&&config.enabled)audioSync()})}
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);
function apply(settings){socialRender(settings);skillRender(settings);audioRender(settings)}
if(location.protocol==='file:'){apply(fallback);return}
fetch('data/site.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(apply).catch(()=>apply(fallback));
})();
