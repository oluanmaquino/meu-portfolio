/* Dados profissionais em data/perfil.json; fallback para abrir arquivo sem servidor. */
(function(){
'use strict';
function one(sel){return document.querySelector(sel)}
function all(sel){return Array.from(document.querySelectorAll(sel))}
function set(sel,value){const node=one(sel);if(node && value!==undefined && value!==null)node.textContent=value}
function safeUrl(raw){try{const u=new URL(raw);return u.protocol==='https:'||u.protocol==='http:'?u.href:null}catch(_){return null}}
function apply(p){if(!p)return;
  if(p.name){document.title=p.name+' — '+(p.profession||'Portfólio');set('.hero-name strong',p.name);const brand=one('.brand-words strong');if(brand){const first=p.name.split(' ')[0].toUpperCase();brand.textContent=first+'.DEV'}const brandLink=one('.brand');if(brandLink)brandLink.setAttribute('aria-label',p.name+' - início');set('.code-line:nth-child(2) .code-green',"'"+p.name+"'");const footer=one('.footer-inner > p');if(footer&&footer.lastChild)footer.lastChild.textContent=' '+p.name+'. Todos os direitos reservados.';}
  const hero=one('#hero-title');if(hero){hero.replaceChildren(document.createTextNode((p.headline||'')+' '));const em=document.createElement('span');em.className='gradient-text';em.textContent=p.headlineHighlight||'';hero.append(em)}
  set('.hero-description',p.intro);
  const name=one('.hero-name');if(name){name.replaceChildren(document.createTextNode('Eu sou '));const b=document.createElement('strong');b.textContent=p.name||'';name.append(b,document.createTextNode(' / '+(p.profession||'')))}
  const loc=one('.hero-meta span:first-child');if(loc){const sym=loc.querySelector('svg');loc.replaceChildren();if(sym)loc.append(sym);loc.append(document.createTextNode(' '+(p.city||'')))}
  const about=all('.section-about .section-intro > p');[p.about1,p.about2,p.about3].forEach((x,i)=>{if(about[i]&&x!==undefined)about[i].textContent=x});
  set('.education-content h3',p.education);
  const school=one('.education-content > p');if(school)school.textContent=p.institution||'';
  set('.year-tag',p.graduationYear);set('.education-end span:last-child',p.graduationMonth);
  const email=(p.email||'').trim(),whats=(p.whatsapp||'').replace(/\D/g,'');
  const emailBtn=one('.contact-cta a[href^="mailto:"]');if(emailBtn){emailBtn.hidden=!email;emailBtn.href=email?'mailto:'+encodeURIComponent(email)+'?subject=Contato%20pelo%20portf%C3%B3lio':'#contato'}
  const phoneBtn=one('.contact-cta a[href*="wa.me/"]');if(phoneBtn){phoneBtn.hidden=!whats;phoneBtn.href=whats?'https://wa.me/'+whats+'?text='+encodeURIComponent('Olá! Vi seu portfólio e gostaria de conversar.'):'#contato'}
  const meta=one('meta[name="author"]');if(meta)meta.content=p.name||'';
}
const fallback=window.PORTFOLIO_PROFILE;
if(location.protocol==='file:'){apply(fallback);return}
fetch('data/perfil.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(apply).catch(()=>apply(fallback));
})();
