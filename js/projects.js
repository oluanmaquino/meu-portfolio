/** Catálogo único: JSON no GitHub Pages e cópia gerada pelo editor para file://. */
(function(){
 'use strict';
 const fallback = window.PORTFOLIO_CATALOG || {featuredId:'',projects:[]};
 async function loadCatalog(){
  if(location.protocol === 'file:') return fallback;
  try {
   const response=await fetch('data/projetos.json',{cache:'no-cache'});
   if(!response.ok) throw new Error('Erro HTTP '+response.status);
   const data=await response.json();
   if(!data || !Array.isArray(data.projects) || !data.projects.length) throw new Error('Catálogo vazio');
   return data;
  } catch(err){console.warn('Utilizando o catálogo de segurança:',err);return fallback;}
 }
 window.SiteProjects={loadCatalog,load:async()=> (await loadCatalog()).projects};
})();
