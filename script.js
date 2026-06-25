// ── Dynamic Image Generation ─
// Generates a gallery with curated category counts and theme labels.
const CATEGORY_META = {
  nature: { label: "🌿 Nature", count: 40, theme: "Mountains, forests, beaches, auroras" },
  people: { label: "👥 People", count: 30, theme: "Portraits, markets, dancers, athletes" },
  architecture: { label: "🏛 Architecture", count: 20, theme: "Skylines, cathedrals, bridges, temples" },
  abstract: { label: "🎨 Abstract", count: 20, theme: "Color bursts, fractals, neon, smoke" },
  travel: { label: "✈️ Travel", count: 20, theme: "Santorini, Tokyo, Machu Picchu, Venice" },
  transportation: { label: "🚗 Transportation", count: 25, theme: "Trains, planes, ships, hot air balloons" },
  food: { label: "🍔 Food", count: 25, theme: "Sushi, pizza, ramen, pastries, BBQ" },
  sports: { label: "⚽ Sports", count: 20, theme: "Basketball, surfing, skiing, MMA" },
  technology: { label: "💻 Technology", count: 20, theme: "Robots, VR, servers, drones, AI" },
  animals: { label: "🐾 Animals", count: 20, theme: "Wildlife, pets, birds, ocean life" }
};

const IMAGES = [];
let imageId = 1;
Object.entries(CATEGORY_META).forEach(([cat, meta]) => {
  for (let i = 1; i <= meta.count; i += 1) {
    const seed = `${cat}-${i}`;
    IMAGES.push({
      id: imageId++,
      cat,
      title: `${cat.charAt(0).toUpperCase() + cat.slice(1)} ${i}`,
      url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`
    });
  }
});

// ── State ──
const CATEGORY_LIST = Object.keys(CATEGORY_META);
const CATS = ["all", ...CATEGORY_LIST];
let activeCat = "all";
let query = "";
let filtered = [];
let lbIdx = 0;

// ── DOM References ──
const filtersEl   = document.getElementById("filters");
const gridEl      = document.getElementById("grid");
const emptyEl     = document.getElementById("empty");
const countBarEl  = document.getElementById("count-bar");
const searchEl    = document.getElementById("search");
const lightboxEl  = document.getElementById("lightbox");
const lbImgEl     = document.getElementById("lb-img");
const lbNameEl    = document.getElementById("lb-name");
const lbCatEl     = document.getElementById("lb-cat");
const lbCounterEl = document.getElementById("lb-counter");
const statTotalEl = document.getElementById("stat-total");
const statCatsEl  = document.getElementById("stat-categories");
const statShowEl  = document.getElementById("stat-showing");

// ── Build Filter Buttons ──
function buildFilters() {
  CATS.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (cat === "all" ? " active" : "");
    btn.textContent = cat === "all"
      ? "All"
      : `${CATEGORY_META[cat].label} (${CATEGORY_META[cat].count})`;
    btn.addEventListener("click", () => {
      activeCat = cat;
      filtersEl.querySelectorAll(".filter-btn").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      render();
    });
    filtersEl.appendChild(btn);
  });
}

// ── Search ──
searchEl.addEventListener("input", e => {
  query = e.target.value.toLowerCase();
  render();
});

// ── IntersectionObserver for lazy loading images ─
const io = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }
    obs.unobserve(img);
  });
}, { rootMargin: '200px' });

function render() {
  filtered = IMAGES.filter(img =>
    (activeCat === "all" || img.cat === activeCat) &&
    img.title.toLowerCase().includes(query)
  );

  gridEl.innerHTML = "";
  statShowEl.textContent = filtered.length;
  countBarEl.textContent = filtered.length
    ? `Showing ${filtered.length} image${filtered.length !== 1 ? "s" : ""}`
    : "";

  if (!filtered.length) {
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";
  const fragment = document.createDocumentFragment();

  filtered.forEach((img, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${Math.min(idx * 0.004, 0.5)}s`;

    const imgEl = document.createElement('img');
    imgEl.alt = img.title;
    imgEl.dataset.src = img.url;
    imgEl.loading = 'lazy';

    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';
    overlay.innerHTML = `<div class="card-cat">${CATEGORY_META[img.cat].label}</div><div class="card-title">${img.title}</div>`;

    const badge = document.createElement('span');
    badge.className = 'filter-badge';
    badge.textContent = CATEGORY_META[img.cat].label;

    const expandBtn = document.createElement('button');
    expandBtn.className = 'card-expand';
    expandBtn.setAttribute('aria-label', `Expand ${img.title}`);
    expandBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;

    card.appendChild(imgEl);
    card.appendChild(overlay);
    card.appendChild(badge);
    card.appendChild(expandBtn);

    card.addEventListener('click', () => openLightbox(idx));

    fragment.appendChild(card);
    io.observe(imgEl);
  });

  gridEl.appendChild(fragment);
}

// ── Lightbox: Open ──
function openLightbox(idx) {
  lbIdx = idx;
  updateLightbox();
  lightboxEl.classList.add("open");
  document.body.style.overflow = "hidden";
}

// ── Lightbox: Close ──
function closeLightbox() {
  lightboxEl.classList.remove("open");
  document.body.style.overflow = "";
}

// ── Lightbox: Update content ──
function updateLightbox() {
  const img = filtered[lbIdx];
  lbImgEl.style.opacity = "0";
  lbImgEl.src = img.url;
  lbImgEl.alt = img.title;
  lbImgEl.onload = () => {
    lbImgEl.style.transition = "opacity 0.2s";
    lbImgEl.style.opacity = "1";
  };
  lbNameEl.textContent = img.title;
  lbCatEl.textContent = CATEGORY_META[img.cat] ? CATEGORY_META[img.cat].label : img.cat.charAt(0).toUpperCase() + img.cat.slice(1);
  lbCounterEl.textContent = (lbIdx + 1) + " / " + filtered.length;
}

// ── Lightbox: Navigation ──
document.getElementById("lb-close").addEventListener("click", closeLightbox);

document.getElementById("lb-prev").addEventListener("click", () => {
  lbIdx = (lbIdx - 1 + filtered.length) % filtered.length;
  updateLightbox();
});

document.getElementById("lb-next").addEventListener("click", () => {
  lbIdx = (lbIdx + 1) % filtered.length;
  updateLightbox();
});

lightboxEl.addEventListener("click", e => {
  if (e.target === lightboxEl) closeLightbox();
});

// ── Keyboard Navigation ──
document.addEventListener("keydown", e => {
  if (!lightboxEl.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft")  { lbIdx = (lbIdx - 1 + filtered.length) % filtered.length; updateLightbox(); }
  if (e.key === "ArrowRight") { lbIdx = (lbIdx + 1) % filtered.length; updateLightbox(); }
});

// ── Touch Swipe (mobile) ──
let touchStartX = 0;

lightboxEl.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

lightboxEl.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 40) return;
  if (dx < 0) { lbIdx = (lbIdx + 1) % filtered.length; updateLightbox(); }
  else        { lbIdx = (lbIdx - 1 + filtered.length) % filtered.length; updateLightbox(); }
});

// ── Init ──
statTotalEl.textContent = IMAGES.length;
statCatsEl.textContent = CATEGORY_LIST.length;
buildFilters();
render();