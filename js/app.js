/**
 * PORTFÓLIO LUAN 2.0 — comportamento geral.
 * Sem dependências: menu responsivo, navegação, galeria, modal, contatos
 * e grade opcional para projetos futuros cadastrados no arquivo JSON.
 */
(function () {
  'use strict';
  const $ = function (selector, root) { return (root || document).querySelector(selector); };
  const $$ = function (selector, root) { return Array.from((root || document).querySelectorAll(selector)); };
  const svg = function (name) {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'icon');
    icon.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-' + name);
    icon.append(use);
    return icon;
  };

  // Menu mobile
  const menuBtn = $('#mobile-menu-toggle');
  const mobileNav = $('#mobile-nav');
  const setMenu = function (open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
    mobileNav.hidden = !open;
  };
  menuBtn.addEventListener('click', function () { setMenu(mobileNav.hidden); });
  $$('a', mobileNav).forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !mobileNav.hidden) { setMenu(false); menuBtn.focus(); }
  });
  document.addEventListener('click', function (event) {
    if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuBtn.contains(event.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 951px)').addEventListener('change', function (event) {
    if (event.matches) setMenu(false);
  });

  // Destaca a seção atual no menu, sem disparar scroll extra.
  const navigation = $$('.desktop-nav [data-nav]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      const visible = entries.filter(function (entry) { return entry.isIntersecting; });
      if (!visible.length) return;
      const active = visible.sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0].target.id;
      navigation.forEach(function (link) {
        link.classList.toggle('nav-active', link.dataset.nav === active);
      });
    }, {rootMargin: '-18% 0px -56% 0px', threshold: [0, .1, .4]});
    $$('main section[id]').forEach(function (section) { observer.observe(section); });
  }

  $('#current-year').textContent = new Date().getFullYear();
  const toast = $('#toast');
  let toastTimer;
  function announce(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2900);
  }

  // Galeria principal: 7 capturas reais do Gestão de Obras, fornecidas pelo autor.
  let allImages = [];
  let filteredImages = [];
  let currentIndex = 0;
  let selectedDevice = 'all';
  const viewer = $('#gallery-viewer');
  const thumbnails = $('#gallery-thumbnails');
  const counter = $('#gallery-counter');
  const dialog = $('#lightbox');
  const lightboxImage = $('#lightbox-image');
  const title = $('#lightbox-title');
  const caption = $('#lightbox-caption');
  const position = $('#lightbox-position');
  const expand = $('#gallery-expand');
  let previousFocus = null;

  function displayImage(index) {
    if (!filteredImages.length) return;
    currentIndex = (index + filteredImages.length) % filteredImages.length;
    const item = filteredImages[currentIndex];
    viewer.replaceChildren();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-screen ' + (item.device === 'mobile' ? 'mobile' : 'desktop');
    button.setAttribute('aria-label', 'Ampliar: ' + item.label);
    button.title = 'Clique para ampliar';
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    const overlay = document.createElement('span');
    overlay.className = 'gallery-zoom-overlay';
    overlay.append(svg('expand'));
    button.append(img, overlay);
    button.addEventListener('click', openLightbox);
    viewer.append(button);
    $$('button', thumbnails).forEach(function (thumb, thumbIndex) {
      const isCurrent = thumbIndex === currentIndex;
      thumb.classList.toggle('is-current', isCurrent);
      thumb.setAttribute('aria-pressed', String(isCurrent));
      if (isCurrent) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });
    counter.textContent = item.label + ' · ' + (currentIndex + 1) + ' de ' + filteredImages.length;
    if (dialog.open) updateLightbox();
  }

  function updateThumbnails() {
    thumbnails.replaceChildren();
    filteredImages.forEach(function (item, index) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-thumb ' + (item.device === 'mobile' ? 'mobile' : 'desktop');
      button.setAttribute('aria-label', 'Ver captura: ' + item.label);
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = '';
      img.loading = 'lazy';
      const label = document.createElement('span');
      label.textContent = item.label;
      button.append(img, label);
      button.addEventListener('click', function () { displayImage(index); });
      thumbnails.append(button);
    });
    displayImage(0);
  }

  function applyFilter(device) {
    selectedDevice = device;
    filteredImages = allImages.filter(function (item) { return device === 'all' || item.device === device; });
    $$('.gallery-filter').forEach(function (button) {
      const current = button.dataset.device === device;
      button.classList.toggle('is-selected', current);
      button.setAttribute('aria-pressed', String(current));
    });
    if (!filteredImages.length) {
      viewer.textContent = 'Não há imagens para este dispositivo.';
      thumbnails.replaceChildren();
      expand.disabled = true;
      counter.textContent = 'Nenhuma captura disponível';
      return;
    }
    expand.disabled = false;
    updateThumbnails();
  }

  function updateLightbox() {
    const item = filteredImages[currentIndex];
    if (!item) return;
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    title.textContent = item.label;
    caption.textContent = item.caption || '';
    position.textContent = (currentIndex + 1) + ' / ' + filteredImages.length;
    $('#lightbox-original').href = item.src;
  }
  function openLightbox() {
    if (!filteredImages.length) return;
    previousFocus = document.activeElement;
    updateLightbox();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    $('#lightbox-close').focus();
  }
  function closeLightbox() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus();
  }
  $('#lightbox-close').addEventListener('click', closeLightbox);
  $('#lightbox-prev').addEventListener('click', function () { displayImage(currentIndex - 1); });
  $('#lightbox-next').addEventListener('click', function () { displayImage(currentIndex + 1); });
  dialog.addEventListener('click', function (event) { if (event.target === dialog) closeLightbox(); });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); displayImage(currentIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); displayImage(currentIndex + 1); }
  });
  dialog.addEventListener('close', function () {
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  });
  expand.addEventListener('click', openLightbox);
  $$('.gallery-filter').forEach(function (button) {
    button.addEventListener('click', function () { applyFilter(button.dataset.device); });
  });

  // Grade complementar: projetos cadastrados no mesmo JSON do destaque.
  // O projeto secundário abre um painel com galeria própria, sem esconder o principal.
  const otherContainer = $('#future-projects');
  const grid = $('#future-project-list');
  const search = $('#project-search');
  const empty = $('#project-empty');
  let others = [];
  const detailsDialog = $('#project-dialog');
  const detailThumbs = $('#detail-thumbnails');
  let openProjectData = null;
  let detailIndex = 0;
  let detailsPreviousFocus = null;

  function trustedUrl(url) {
    try {
      const u = new URL(url);
      return ['https:', 'http:'].includes(u.protocol) ? u.href : null;
    } catch (_) { return null; }
  }

  function addExternalButton(container, url, label, primary) {
    const href = trustedUrl(url);
    if (!href) return;
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'button ' + (primary ? 'button-primary' : 'button-outline');
    link.textContent = label;
    container.append(link);
  }

  function showDetailImage(index) {
    if (!openProjectData || !Array.isArray(openProjectData.images) || !openProjectData.images.length) return;
    const images = openProjectData.images;
    detailIndex = (index + images.length) % images.length;
    const current = images[detailIndex];
    const image = $('#detail-image');
    image.src = current.src;
    image.alt = current.alt || ('Captura do projeto ' + openProjectData.name);
    $('#detail-image-label').textContent = current.label + (current.caption ? ' · ' + current.caption : '');
    $('#detail-counter').textContent = (detailIndex + 1) + ' / ' + images.length;
    $('#detail-original').href = current.src;
    Array.from(detailThumbs.children).forEach(function (child, i) {
      child.setAttribute('aria-pressed', String(i === detailIndex));
    });
  }

  function openProjectDetails(project) {
    detailsPreviousFocus = document.activeElement;
    openProjectData = project;
    $('#detail-category').textContent = (project.category || 'PROJETO').toLocaleUpperCase('pt-BR');
    $('#detail-project-title').textContent = project.name || 'Projeto';
    $('#detail-description').textContent = project.description || project.summary || '';
    const tags = $('#detail-tags');
    tags.replaceChildren();
    (project.technologies || []).forEach(function (tech) {
      tags.append(window.PortfolioTech ? window.PortfolioTech.chip(tech) : document.createTextNode(tech));
    });
    const features = $('#detail-features');
    features.replaceChildren();
    (project.features || []).forEach(function (feature) {
      const card = document.createElement('article');
      const heading = document.createElement('h4');
      heading.textContent = feature.title || '';
      const paragraph = document.createElement('p');
      paragraph.textContent = feature.description || '';
      card.append(heading, paragraph);
      features.append(card);
    });
    const links = $('#detail-links');
    links.replaceChildren();
    addExternalButton(links, project.urls && project.urls.live, 'Acessar plataforma ↗', true);
    addExternalButton(links, project.urls && project.urls.repository, 'Ver código no GitHub ↗', false);
    detailThumbs.replaceChildren();
    (project.images || []).forEach(function (item, i) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', 'Mostrar captura: ' + item.label);
      const image = document.createElement('img');
      image.src = item.src;
      image.alt = '';
      image.loading = 'lazy';
      const text = document.createElement('span');
      text.textContent = item.label;
      button.append(image, text);
      button.addEventListener('click', function () { showDetailImage(i); });
      detailThumbs.append(button);
    });
    const haveImages = (project.images || []).length > 0;
    $('.project-dialog-gallery').hidden = !haveImages;
    if (haveImages) showDetailImage(0);
    if (typeof detailsDialog.showModal === 'function') detailsDialog.showModal();
    else detailsDialog.setAttribute('open', '');
    $('#project-dialog-close').focus();
  }
  function closeDetails() {
    if (typeof detailsDialog.close === 'function') detailsDialog.close();
    else detailsDialog.removeAttribute('open');
  }
  $('#project-dialog-close').addEventListener('click', closeDetails);
  $('#detail-prev').addEventListener('click', function () { showDetailImage(detailIndex - 1); });
  $('#detail-next').addEventListener('click', function () { showDetailImage(detailIndex + 1); });
  detailsDialog.addEventListener('click', function (event) { if (event.target === detailsDialog) closeDetails(); });
  detailsDialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showDetailImage(detailIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showDetailImage(detailIndex + 1); }
  });
  detailsDialog.addEventListener('close', function () {
    if (detailsPreviousFocus && detailsPreviousFocus.isConnected) detailsPreviousFocus.focus();
  });

  function renderOthers(query) {
    grid.replaceChildren();
    const term = query.trim().toLocaleLowerCase('pt-BR');
    const matches = others.filter(function (project) {
      return [project.name, project.category, project.summary].concat(project.technologies || [])
        .join(' ').toLocaleLowerCase('pt-BR').includes(term);
    });
    empty.hidden = matches.length > 0;
    matches.forEach(function (project) {
      const card = document.createElement('article');
      card.className = 'future-card';
      const first = Array.isArray(project.images) && (project.images.find(item=>item.src===project.coverImage)||project.images[0]);
      if (first && first.src) {
        const image = document.createElement('img');
        image.src = first.src;
        image.alt = first.alt || ('Captura do sistema ' + project.name);
        image.loading = 'lazy';
        image.style.setProperty('object-fit',project.coverFit==='cover'?'cover':'contain','important');image.style.aspectRatio=project.coverRatio&&project.coverRatio!=='original'?project.coverRatio:'auto';image.style.objectPosition=project.coverPosition==='top'?'top center':'center';card.append(image);
      }
      const content = document.createElement('div');
      content.className = 'future-card-content';
      const category = document.createElement('span');
      category.className = 'micro-label';
      category.textContent = (project.category || 'Projeto').toLocaleUpperCase('pt-BR');
      const heading = document.createElement('h4');
      heading.textContent = project.name || 'Projeto sem nome';
      const description = document.createElement('p');
      description.textContent = project.summary || '';
      const technologies = document.createElement('div');
      technologies.className = 'project-mini-tech';
      (project.technologies || []).forEach(function (tech) {
        technologies.append(window.PortfolioTech ? window.PortfolioTech.chip(tech) : document.createTextNode(tech));
      });
      const actions = document.createElement('div');
      actions.className = 'future-card-actions';
      const detailButton = document.createElement('button');
      detailButton.type = 'button';
      detailButton.className = 'button button-primary';
      detailButton.textContent = 'Ver detalhes e imagens';
      detailButton.addEventListener('click', function () { openProjectDetails(project); });
      actions.append(detailButton);
      addExternalButton(actions, project.urls && project.urls.live, 'Acessar plataforma ↗', false);
      content.append(category, heading, description, technologies, actions);
      card.append(content);
      grid.append(card);
    });
  }
  search.addEventListener('input', function () { renderOthers(search.value); });


  // Destaque e galeria gerados a partir do mesmo catálogo usado pelos cards.
  // O editor pode mudar o projeto principal sem edição no HTML.
  function updateFeatured(project, projects) {
    if (!project) return;
    const article = $('#featured-showcase');
    const photo = $('.showcase-image img', article);
    const first = (project.images || []).find(item=>item.src===project.coverImage) || (project.images || [])[0];
    photo.style.setProperty('object-fit',project.coverFit==='cover' ? 'cover' : 'contain','important');
    photo.style.aspectRatio=project.coverRatio&&project.coverRatio!=='original'?project.coverRatio:'auto';
    photo.style.objectPosition = project.coverPosition==='top' ? 'top center' : 'center';
    if (first && first.src) { photo.src = first.src; photo.alt = first.alt || 'Captura de ' + project.name; photo.hidden = false; }
    else photo.hidden = true;
    const browserTitle = $('.showcase-browser-bar > span', article);
    browserTitle.textContent = project.name + ' · ' + (project.category || 'Projeto');
    const logo = $('.project-logo', article);
    logo.replaceChildren();
    if (project.icon && /^assets\/img\/[a-zA-Z0-9_./-]+$/.test(project.icon) && !project.icon.includes('..')) {
      const iconImage=document.createElement('img');
      iconImage.src=project.icon; iconImage.alt='Ícone de '+project.name;
      iconImage.width=44;iconImage.height=44;
      logo.append(iconImage);
    } else {
      const abbr = document.createElement('b');
      abbr.textContent = (project.abbreviation || project.name.slice(0,2)).slice(0,3);
      logo.append(abbr);
    }
    $('.status-label',article).textContent = [project.version ? 'V' + project.version : '',project.status || 'Projeto'].filter(Boolean).join(' · ').toUpperCase();
    $('.showcase-info .micro-label',article).textContent = (project.eyebrow || project.category || 'PROJETO').toUpperCase();
    const heading = $('.showcase-info h3',article);
    heading.replaceChildren();
    const parts=(project.name || 'Projeto').split(' ');
    const nameA=document.createTextNode(parts.shift()+' ');
    const color=document.createElement('span');color.textContent=parts.join(' ') || '';
    heading.append(nameA,color);
    $('.showcase-slogan',article).textContent = project.tagline || project.summary || '';
    $('.showcase-desc',article).textContent = project.description || project.summary || '';
    const tags=$('.showcase-info .tag-row',article);tags.replaceChildren();
    (project.technologies||[]).forEach(function(tech){tags.append(window.PortfolioTech ? window.PortfolioTech.chip(tech) : document.createTextNode(tech))});
    const actions=$('.showcase-actions',article);
    actions.replaceChildren();
    const galleryLink=document.createElement('a');galleryLink.className='button button-primary';
    galleryLink.href='#galeria';galleryLink.textContent='Explorar as telas ↗';actions.append(galleryLink);
    const visit=project.urls && trustedUrl(project.urls.live);
    if(visit){addExternalButton(actions,visit,'Acessar projeto ↗',false)}
    else {const privateNote=document.createElement('span');privateNote.className='project-private';privateNote.textContent='Projeto sem demonstração pública';actions.append(privateNote)}
    const featureRoot=$('#featured-features');featureRoot.replaceChildren();
    (project.features||[]).slice(0,6).forEach(function(feature,i){
      const card=document.createElement('div');card.className='feature-card';
      const icon=document.createElement('span');icon.className='feature-icon';icon.append(svg(['layers','chart','check','database','monitor','code'][i%6]));
      const h=document.createElement('h4');h.textContent=feature.title||'';
      const p=document.createElement('p');p.textContent=feature.description||'';
      card.append(icon,h,p);featureRoot.append(card);
    });
    featureRoot.hidden=!(project.features||[]).length;
    const galleryTitle=$('#galeria .gallery-heading h3');galleryTitle.replaceChildren();
    galleryTitle.append(document.createTextNode('Conheça o projeto '));
    const nameSpan=document.createElement('span');nameSpan.textContent='por dentro.';galleryTitle.append(nameSpan);
    $('#galeria .section-kicker span').textContent=(project.name + (project.version?' · V'+project.version:'')).toUpperCase();
    $('#galeria .gallery-heading p').textContent=(project.images||[]).length+' capturas reais selecionadas para a galeria.';
    $('#lightbox').setAttribute('aria-label','Galeria ampliada de '+project.name);
    const codeRow=$('.code-line:nth-child(6) code');
    if (codeRow) codeRow.textContent='  projetos: '+JSON.stringify(projects.map(function(p){return p.name;}))+',';
  }

  // Catálogo HTTP/HTTPS com cópia local para duplo clique no arquivo HTML.
  window.SiteProjects.loadCatalog().then(function (catalog) {
    const projects = catalog.projects || [];
    const mainProject = projects.find(function (project) { return project.id === catalog.featuredId; }) || projects[0];
    updateFeatured(mainProject,projects);
    allImages = Array.isArray(mainProject.images) ? mainProject.images : [];
    applyFilter('all');
    $('#project-total').textContent = String(projects.length).padStart(2, '0') + (projects.length === 1 ? ' PROJETO NO PORTFÓLIO' : ' PROJETOS NO PORTFÓLIO');
    others = projects.filter(function (project) { return project.id !== mainProject.id; });
    if (others.length > 0) {
      otherContainer.hidden = false;
      renderOthers('');
    }
  }).catch(function (error) {
    console.error('Não foi possível carregar os dados da galeria:', error);
    viewer.textContent = 'Não foi possível carregar a galeria. Confira a pasta data.';
  });
}());
