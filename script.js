// ---------- LIBS: GSAP + ScrollTrigger are loaded via CDN in HTML ----------

// ---------- FRONTEND DATA (final with 5+ gallery images) ----------
const DATA = [
  // exhibitions
  { id:'ex1', type:'exhibit', title:'Harappan Civilization', desc:'Artifacts from one of the world’s earliest urban cultures (c.2500 BCE).', img:'https://images.unsplash.com/photo-1602526436680-6a9b0f7a9d55?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3f4b6b7a1c6d', tags:['harappa','ancient','archaeology'] },
  { id:'ex2', type:'exhibit', title:'Buddhist Art Gallery', desc:'Rare sculptures, manuscripts and relics reflecting Buddhist traditions.', img:'https://images.unsplash.com/photo-1530023367847-8b6b8c0e9f85?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=9b7f4b8c9c2a', tags:['buddhist','sculpture','religion'] },
  { id:'ex3', type:'exhibit', title:'Textile Traditions', desc:'Traditional weaves and costumes across Indian regions.', img:'https://images.unsplash.com/photo-1520975698511-8b3f5f9f6b9e?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=5a0c4efc3f2b', tags:['textile','weave','craft'] },

  // learning/outreach items
  { id:'l1', type:'learning', title:'School & College Visits', desc:'Guided tours and activity sheets for students.', img:'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=0d8b6a8d4f7a', tags:['school','education'] },
  { id:'l2', type:'learning', title:'Art & Craft Workshops', desc:'Hands-on workshops for traditional crafts and techniques.', img:'https://images.unsplash.com/photo-1508766206392-8bd5cf550d1b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2d09a1c3b6d4', tags:['workshop','craft'] },
  { id:'l3', type:'learning', title:'Research Collaborations', desc:'Collaborative projects with universities and scholars.', img:'https://images.unsplash.com/photo-1529644859658-6a6a6b7d5f07?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1f0b7f8e2a3b', tags:['research','scholar'] },

  // gallery items (5 images)
  { id:'g1', type:'gallery', title:'Harappan Pottery', desc:'Fine painted pottery fragments from excavations.', img:'https://images.unsplash.com/photo-1536220913264-8a0b15a4e52b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=9b8a3c1d2f4a', tags:['pottery','harappa'] },
  { id:'g2', type:'gallery', title:'Bronze Sculpture', desc:'Metal sculpture from medieval India.', img:'https://images.unsplash.com/photo-1532298488764-3a2a2a3b0b2d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=6c7b2a1e9f0b', tags:['bronze','sculpture'] },
  { id:'g3', type:'gallery', title:'Miniature Painting', desc:'Detailed paintings showcasing court scenes.', img:'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2a9c4f6b3a7c', tags:['painting','miniature'] },
  { id:'g4', type:'gallery', title:'Temple Architecture', desc:'Stone carvings and architectural fragments.', img:'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3d2f1b6c4a2e', tags:['architecture','stone'] },
  { id:'g5', type:'gallery', title:'Manuscript Folio', desc:'Illuminated manuscript folio from medieval collections.', img:'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=7a3f2c6d1b9f', tags:['manuscript','paper'] }
];

/* ---------- SELECTORS ---------- */
const exhibitGrid = document.getElementById('exhibit-grid');
const learningList = document.getElementById('learning-list');
const galleryGrid = document.getElementById('gallery-grid');
const slidesEl = document.getElementById('slides');
const aboutTextEl = document.getElementById('about-text');
const resultsSection = document.getElementById('results');
const resultsGrid = document.getElementById('results-grid');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('search');

/* ---------- ATTEMPT TO FETCH MUSEUM API (best-effort) ----------
   We try to fetch a plausible collections endpoint; if it fails or returns non-JSON,
   we fallback to local DATA. This keeps the app resilient (works offline).
   (Note: National Museum website uses 'JATAN' for collections — public JSON not guaranteed).
   */
async function tryFetchMuseumData(){
  const endpoints = [
    // plausible endpoints (many museums don't expose direct JSON without keys)
    'https://nationalmuseumindia.gov.in/en/collections/index/30',
    'https://nationalmuseumindia.gov.in/api/collections', // hypothetical
    'https://museumsofindia.gov.in/api/collections' // another attempt
  ];

  for(const url of endpoints){
    try{
      const res = await fetch(url, {mode:'cors'});
      // if response is JSON, parse and try to map to our shape
      const text = await res.text();
      // quick check: if looks like JSON, parse; else skip
      if(text.trim().startsWith('{') || text.trim().startsWith('[')){
        const json = JSON.parse(text);
        // Attempt to map known structure -> our DATA schema (best-effort)
        if(Array.isArray(json) && json.length){
          // map some first items
          const mapped = json.slice(0,12).map((o,i) => ({
            id: 'api_' + i,
            type: o.type || 'gallery',
            title: o.title || o.name || o.objectName || 'Untitled',
            desc: o.description || o.summary || (o.notes || ''),
            img: o.image || o.img || o.digitalImage || (o.media && o.media[0]) || '',
            tags: (o.keywords || o.tags || []).slice(0,6)
          }));
          if(mapped.length) return mapped;
        } else if(json.objects && Array.isArray(json.objects) && json.objects.length){
          const mapped = json.objects.slice(0,12).map((o,i)=>({
            id:'api_obj_' + i,
            type: o.type || 'gallery',
            title: o.title || o.objectName || 'Untitled',
            desc: o.description || o.summary || '',
            img: o.primaryMedia && o.primaryMedia.url || o.image || '',
            tags: (o.keywords || []).slice(0,6)
          }));
          if(mapped.length) return mapped;
        }
      }
    }catch(e){
      // ignore and try next endpoint
      // (CORS or 404 expected for many)
    }
  }
  return null;
}

/* ---------- RENDER FUNCTIONS ---------- */
function renderAll(dataset = DATA){
  // Exhibitions
  exhibitGrid.innerHTML = '';
  dataset.filter(i => i.type === 'exhibit').forEach(item => {
    const div = document.createElement('div');
    div.className = 'exhibit';
    div.innerHTML = `<img src="${item.img}" alt="${escapeHtml(item.title)}" style="width:100%;height:170px;object-fit:cover;border-radius:8px;margin-bottom:10px" />
      <h3>${escapeHtml(item.title)}</h3><p style="color:var(--muted)">${escapeHtml(item.desc)}</p>`;
    exhibitGrid.appendChild(div);
  });

  // Learning
  learningList.innerHTML = '';
  dataset.filter(i => i.type === 'learning').forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.desc)}`;
    learningList.appendChild(li);
  });

  // Gallery Grid
  galleryGrid.innerHTML = '';
  dataset.filter(i => i.type === 'gallery').forEach(item => {
    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.title;
    galleryGrid.appendChild(img);
  });

  // Slider slides
  slidesEl.innerHTML = '';
  dataset.filter(i => i.type === 'gallery').forEach(item => {
    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.title;
    slidesEl.appendChild(img);
  });

  // after DOM update, recalc slider sizing
  setTimeout(()=> showSlide(0), 80);
}

/* ---------- SEARCH (frontend) ---------- */
function normalize(s=''){ return String(s||'').toLowerCase(); }

searchInput.addEventListener('input', e => {
  const q = normalize(e.target.value.trim());
  if(!q){
    resultsSection.classList.add('hidden');
    noResults.style.display='none';
    resultsGrid.innerHTML='';
    return;
  }

  // gather matches from DOM/data
  const matches = DATA.filter(item => {
    return normalize(item.title).includes(q) ||
           normalize(item.desc).includes(q) ||
           item.tags.join(' ').toLowerCase().includes(q) ||
           item.type.toLowerCase().includes(q);
  });

  // also search About content
  const aboutText = normalize(aboutTextEl?.innerText || '');
  if(aboutText.includes(q)){
    matches.unshift({ id:'about', type:'about', title:'About the Museum', desc: aboutTextEl.innerText, img:'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2a9c' , tags:['about','museum'] });
  }

  renderResults(uniqueById(matches));
});

function renderResults(list){
  resultsSection.classList.remove('hidden');
  resultsGrid.innerHTML = '';
  if(!list.length){
    noResults.style.display='block';
    return;
  }
  noResults.style.display='none';
  list.forEach(item => {
    const card = document.createElement('article');
    card.className='result-card';
    card.innerHTML = `
      <img loading="lazy" src="${item.img}" alt="${escapeHtml(item.title)}" />
      <div>
        <h4>${escapeHtml(item.title)}</h4>
        <p style="color:var(--muted);font-size:0.95rem">${escapeHtml(item.desc)}</p>
        <div style="margin-top:8px;font-size:0.85rem;color:var(--muted)"><strong>${item.type.toUpperCase()}</strong></div>
      </div>`;
    resultsGrid.appendChild(card);
  });
}

/* ---------- SLIDER ---------- */
let slideIndex = 0;
function slides(){ return document.querySelectorAll('#slides img'); }
function showSlide(i){
  const s = slides();
  if(!s.length) return;
  if(i < 0) slideIndex = s.length - 1;
  else if(i >= s.length) slideIndex = 0;
  else slideIndex = i;
  const width = s[0].clientWidth || document.getElementById('slider').clientWidth;
  const el = document.getElementById('slides');
  el.style.transform = `translateX(${-slideIndex * width}px)`;
}
document.getElementById('next').addEventListener('click', ()=>{ showSlide(slideIndex+1) });
document.getElementById('prev').addEventListener('click', ()=>{ showSlide(slideIndex-1) });
window.addEventListener('resize', ()=>showSlide(slideIndex));
let autoSlide = setInterval(()=>{ showSlide(slideIndex+1) }, 4500);
document.getElementById('slider').addEventListener('mouseenter', ()=>clearInterval(autoSlide));
document.getElementById('slider').addEventListener('mouseleave', ()=>autoSlide = setInterval(()=>showSlide(slideIndex+1),4500));

/* ---------- UTIL ---------- */
function escapeHtml(text=''){
  return String(text).replace(/[&<>"'`=\/]/g, function (s) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'}[s]); });
}
function uniqueById(arr){ const seen={}; return arr.filter(i => { if(!i || seen[i.id]) return false; seen[i.id]=true; return true; }); }

/* ---------- NAV MENU ---------- */
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));

/* ---------- THEME TOGGLE (simple) ---------- */
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  if(document.documentElement.hasAttribute('style')){
    document.documentElement.removeAttribute('style');
    themeToggle.textContent = '☀️';
  } else {
    // quick light mode by overriding root vars
    document.documentElement.style.setProperty('--bg','#faf7f2');
    document.documentElement.style.setProperty('--text','#111111');
    document.documentElement.style.setProperty('--muted','#555555');
    document.documentElement.style.setProperty('--card','#ffffff');
    document.documentElement.style.setProperty('--accent','#b78a2f');
    themeToggle.textContent = '🌙';
  }
});

/* ---------- LOCOMOTIVE + GSAP INTEGRATION ---------- */
let locoScroll = null;
function initLocomotiveAndGsap(){
  // init locomotive
  locoScroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    multiplier: 1.0,
    smartphone: { smooth: true },
    tablet: { smooth: true }
  });

  // register GSAP plugin
  gsap.registerPlugin(ScrollTrigger);

  // tell ScrollTrigger to use locomotive's scrolling
  ScrollTrigger.scrollerProxy("[data-scroll-container]", {
    scrollTop(value){
      return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect(){
      return {top:0,left:0,width:window.innerWidth,height:window.innerHeight};
    },
    // we don't support horizontal scrolling in this simple setup
    pinType: document.querySelector('[data-scroll-container]').style.transform ? "transform" : "fixed"
  });

  // when locomotive scroll updates, update ScrollTrigger
  locoScroll.on("scroll", ScrollTrigger.update);

  // each [data-animate] element gets a gsap animation on enter
  document.querySelectorAll('[data-animate]').forEach(section=>{
    gsap.fromTo(section,
      {autoAlpha:0, y:40, scale:0.99},
      {
        duration:0.9,
        autoAlpha:1, y:0, scale:1,
        ease:"power3.out",
        scrollTrigger:{
          trigger: section,
          scroller: "[data-scroll-container]",
          start: "top 80%",
          end: "bottom 10%",
          toggleActions: "play none none reverse"
        }
      });
  });

  // refresh ScrollTrigger after locomotive update
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  ScrollTrigger.refresh();
}

/* ---------- INIT + try fetch api ---------- */
(async function init(){
  // try fetch museum API (best-effort)
  const apiData = await tryFetchMuseumData();
  if(apiData && apiData.length){
    // merge apiData with local DATA: keep types and images if present
    // simple approach: append API items but keep local DATA first
    console.log('Using API data (partial):', apiData.length);
    // for demo, we just append API items as gallery
    apiData.forEach((it, idx) => {
      if(!DATA.find(d => d.id === it.id)){
        DATA.push({...it, id: 'api_' + idx});
      }
    });
  } else {
    console.log('No usable public API found — using local DATA fallback.');
  }

  // render with final DATA
  renderAll();

  // init locomotive + gsap
  initLocomotiveAndGsap();

  // show first slide properly after layout stabilized
  setTimeout(()=> showSlide(0), 200);

})();
