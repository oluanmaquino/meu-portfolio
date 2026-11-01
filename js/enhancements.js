/** Portfólio v5 — redes SVG, tecnologias selecionadas e áudio contextual automático. */
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
function safeUrl(url){try{const u=new URL(String(url||''));return ['https:','http:','mailto:'].includes(u.protocol)?u.href:null}catch(_){return null}}
function socialRender(settings){
 const target=document.getElementById('social-links');if(!target)return;
 target.replaceChildren();
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
// O navegador pode recusar áudio automático até a primeira interação da pessoa.
// Nenhum botão para iniciar a trilha: ao primeiro gesto, tentamos novamente.
const audio=document.getElementById('background-audio');
const muteButton=document.getElementById('site-mute-toggle');
const muteIcon=muteButton&&muteButton.querySelector('use');
const muteKey='luan-portfolio-audio-muted';
let config=null;
let muted=false;
try {muted=localStorage.getItem(muteKey)==='true'}catch(_){/* modo privado */}
let inArea=false, playing=false, pending=false, fadeId=0, resetToken=0;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
function stopAtStart(fade){
  resetToken+=1;
  const token=resetToken;
  cancelAnimationFrame(fadeId);
  playing=false;pending=false;
  const finish=()=>{if(token!==resetToken)return;audio.pause();try{audio.currentTime=0}catch(_){/* ainda não carregado */}audio.volume=0};
  if(!fade||audio.paused||reduced.matches){finish();return}
  const beginning=performance.now(),from=audio.volume;
  function step(now){if(token!==resetToken)return;const t=Math.min(1,(now-beginning)/220);audio.volume=Math.max(0,from*(1-t));if(t<1)fadeId=requestAnimationFrame(step);else finish()}
  fadeId=requestAnimationFrame(step);
}
function fadeIn(){
  cancelAnimationFrame(fadeId);
  const token=resetToken, start=performance.now(),from=audio.volume;
  const target=Math.max(0,Math.min(1,Number(config.volume??0.22)));
  if(reduced.matches){audio.volume=target;return}
  function step(now){if(token!==resetToken)return;const t=Math.min(1,(now-start)/400);audio.volume=from+(target-from)*t;if(t<1)fadeId=requestAnimationFrame(step)}
  fadeId=requestAnimationFrame(step);
}
function inSelectedArea(){
 if(!config)return false;
 if(config.mode==='all')return true;
 const selected=Array.isArray(config.sections)?config.sections:[];
 return selected.some(id=>{const el=document.getElementById(id);if(!el)return false;const r=el.getBoundingClientRect();const h=window.innerHeight||600;return r.bottom>h*.27&&r.top<h*.73});
}
function refreshButton(){
 if(!muteButton)return;
 muteButton.setAttribute('aria-pressed',String(muted));
 muteButton.setAttribute('aria-label',muted?'Ativar áudio do site':'Silenciar site');
 muteButton.title=muted?'Ativar áudio do site':'Silenciar site';
 muteIcon.setAttribute('href',muted?'#i-volume-off':'#i-volume');
}
function attemptPlay(){
 if(!config||muted||!inArea||document.hidden||playing||pending)return;
 // Mantém a música pronta para recomeçar do segundo zero após sair ou silenciar.
 resetToken+=1;cancelAnimationFrame(fadeId);
 const token=resetToken;
 audio.volume=0;
 pending=true;
 let result;
 try{result=audio.play()}catch(_){pending=false;return}
 Promise.resolve(result).then(()=>{
  if(token!==resetToken || muted || !inArea || document.hidden){audio.pause();audio.currentTime=0;pending=false;return}
  pending=false;playing=true;fadeIn();
 }).catch(()=>{pending=false;playing=false;/* bloqueio normal de autoplay */});
}
function syncAudio(){
 if(!config)return;
 const nextArea=inSelectedArea();
 if(!nextArea||muted||document.hidden){
   if(playing||pending||!audio.paused){stopAtStart(false)}
   inArea=nextArea;
   return;
 }
 inArea=nextArea;
 attemptPlay();
}
function applyAudio(settings){
 config=settings.audio||{};
 if(!audio||!muteButton||!config.enabled||!config.src||!/^assets\/audio\/[\w./-]+\.mp3$/i.test(config.src)||config.src.includes('..')){
   if(muteButton)muteButton.hidden=true;
   config=null;return;
 }
 muteButton.hidden=false;
 refreshButton();
 audio.src=config.src;audio.loop=config.loop!==false;audio.preload='auto';audio.volume=0;
 syncAudio();
}
if(muteButton)muteButton.addEventListener('click',()=>{
 muted=!muted;try{localStorage.setItem(muteKey,String(muted))}catch(_){}
 refreshButton();
 if(muted){stopAtStart(false)}else{stopAtStart(false);syncAudio()}
});
// Ao ocorrer interação normal com qualquer parte da página, libera áudio quando o navegador permite.
function onGesture(){if(!config||muted)return;inArea=inSelectedArea();if(inArea)attemptPlay()}
document.addEventListener('pointerdown',onGesture,{passive:true});
document.addEventListener('keydown',onGesture);
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;syncAudio()})}
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',schedule,{passive:true});
document.addEventListener('visibilitychange',schedule);
// Exposto apenas para testes locais de regressão; nenhuma API remota.
window.PortfolioAudio={getState:()=>({muted,inArea,playing,pending,position:audio?.currentTime||0}),sync:syncAudio};
function apply(settings){socialRender(settings);skillRender(settings);applyAudio(settings)}
if(location.protocol==='file:'){apply(fallback);return}
fetch('data/site.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(apply).catch(()=>apply(fallback));
})();
