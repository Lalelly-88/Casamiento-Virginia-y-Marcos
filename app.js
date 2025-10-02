// app.js
document.addEventListener("DOMContentLoaded", loadConfig);

async function loadConfig(){
  // ===== Configuración base =====
  let cfg = {
    site:{
      title:"Boda Virginia & Marcos",
      primaryColor:"#C66C67",
      accentColor:"#EFB9B3",
      neutralColor:"#ffffff",
      textColor:"#1f2937",
      fontHeading:"Playfair Display, serif",
      fontBody:"Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial",
      favicon:"assets/favicon.png",
      heroImage:"assets/portada.jpg",
      music:"assets/perfect.mp3"
    },
    couple:{
      names:"Virginia & Marcos",
      dateMain:"23/01/2026",
      locationCity:"Neuquén, Argentina",
      hashtagOrIg:"@bodamarcosyvir"
    },
    sections:{
      fechas:{ items:[] },
      regalos:{ aliases:[] }
    },
    footer:{ madeBy:"Hecho con ♥ por Ale", repo:"#"}
  };

  // ===== Deep merge =====
  function deepMerge(target, source){
    if (!source || typeof source !== "object") return target;
    for (const k in source){
      if (!Object.prototype.hasOwnProperty.call(source,k)) continue;
      const sv = source[k];
      if (sv && typeof sv === "object" && !Array.isArray(sv)){
        target[k] = deepMerge(target[k]||{}, sv);
      } else {
        target[k] = sv;
      }
    }
    return target;
  }

  try{
    const res = await fetch("config.json",{cache:"no-store"});
    if(res.ok){
      const fromFile = await res.json();
      cfg = deepMerge(cfg, fromFile);
    }
  }catch(e){
    console.warn("No se pudo cargar config.json", e);
  }

  // ===== Referencias =====
  const root   = document.documentElement;
  const splash = document.getElementById("splash");
  const page   = document.getElementById("page");
  const btnWith= document.getElementById("enterWithMusic");
  const btnWithout=document.getElementById("enterWithoutMusic");
  const music  = document.getElementById("bgMusic");
  const musicBtn=document.getElementById("musicBtn");

  // ===== Variables CSS =====
  root.style.setProperty("--color-primary", cfg.site.primaryColor);
  root.style.setProperty("--color-accent",  cfg.site.accentColor);
  root.style.setProperty("--color-neutral", cfg.site.neutralColor);
  root.style.setProperty("--color-text",    cfg.site.textColor);

  // ===== Títulos / favicon =====
  document.title = cfg.site.title;
  const fav = document.querySelector("link[rel='icon']");
  if(fav && cfg.site.favicon) fav.href = cfg.site.favicon;

  // ===== Hero =====
  const coupleNamesEl=document.getElementById("coupleNames");
  const mainDateEl=document.getElementById("mainDate");
  if(coupleNamesEl) coupleNamesEl.textContent=cfg.couple.names;
  if(mainDateEl)    mainDateEl.textContent=cfg.couple.dateMain;

  // ===== Música =====
  let playing=false;
  if(musicBtn){
    musicBtn.style.position="fixed";
    musicBtn.style.top="10px";
    musicBtn.style.right="10px";
    musicBtn.style.zIndex="2147483647";
  }
  if(cfg.site.music && music){
    music.src=cfg.site.music;
  }else if(musicBtn){
    musicBtn.style.display="none";
  }
  if(musicBtn && music){
    musicBtn.addEventListener("click",()=>{
      if(playing){
        music.pause(); playing=false; musicBtn.textContent="🎵";
      }else{
        music.play().then(()=>{ playing=true; musicBtn.textContent="🔇"; })
        .catch(e=>console.log("No se pudo reproducir:",e));
      }
    });
  }

  // ===== Portada → entrar =====
  function revealPage(){
    splash.classList.add("fade-out");
    setTimeout(()=>{
      splash.style.display="none";
      page.classList.remove("hidden");
    },700);
  }
  if(btnWith) btnWith.addEventListener("click",()=>{
    revealPage();
    if(cfg.site.music && music){
      music.play().then(()=>{playing=true; musicBtn.textContent="🔇";})
      .catch(e=>console.log("Autoplay bloqueado:",e));
    }
    startObserver();
  });
  if(btnWithout) btnWithout.addEventListener("click",()=>{ revealPage(); startObserver(); });

  // ===== Animaciones on-scroll =====
  function startObserver(){
    if(!("IntersectionObserver" in window)){
      document.querySelectorAll("[data-animate]").forEach(el=>el.classList.add("in"));
      return;
    }
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add("in"); });
    },{threshold:.15});
    document.querySelectorAll("[data-animate]").forEach(el=>io.observe(el));
  }

  // ===== Contador (sin segundos) =====
  startCountdown("2026-01-23T19:00:00");
  function startCountdown(dateStr){
    const weddingDate=new Date(dateStr);
    const d=document.getElementById("days"),
          h=document.getElementById("hours"),
          m=document.getElementById("minutes");
    if(!d||!h||!m) return;
    function update(){
      const now=new Date();
      let diff=weddingDate-now;
      if(diff<0) diff=0;
      const t=Math.floor(diff/1000);
      const days=Math.floor(t/86400);
      const hours=Math.floor((t%86400)/3600);
      const mins=Math.floor((t%3600)/60);
      d.textContent=days;
      h.textContent=String(hours).padStart(2,"0");
      m.textContent=String(mins).padStart(2,"0");
    }
    update(); setInterval(update,1000);
  }

  // ===== Galería: modal =====
  initGalleryModal();
  function initGalleryModal(){
    const imgs=document.querySelectorAll(".galeria-track img");
    const modal=document.getElementById("fotoModal");
    const modalImg=document.getElementById("modalImg");
    const closeBtn=modal?modal.querySelector(".modal-close"):null;
    if(!imgs.length||!modal||!modalImg) return;

    imgs.forEach(img=>{
      img.addEventListener("click",()=>{ 
        modalImg.src=img.src; modal.style.display="flex"; document.body.style.overflow="hidden";
      });
    });
    function close(){ modal.style.display="none"; modalImg.src=""; document.body.style.overflow=""; }
    if(closeBtn) closeBtn.addEventListener("click",close);
    modal.addEventListener("click",e=>{ if(e.target===modal) close(); });
    document.addEventListener("keydown",e=>{ if(e.key==="Escape") close(); });
  }

  // ===== Copiar CBU =====
  document.addEventListener("click",e=>{
    if(e.target.classList.contains("copy-btn")){
      const text=e.target.getAttribute("data-copy");
      navigator.clipboard.writeText(text).then(()=>{
        e.target.textContent="Copiado!";
        setTimeout(()=>{ e.target.textContent="Copiar"; },2000);
      });
    }
  });
}
