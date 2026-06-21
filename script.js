const IMAGES = [
  { id:1, cat:"nature", title:"Mountain Sunrise", url:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" },
  { id:2, cat:"nature", title:"Forest Path", url:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80" }
];

let filtered = IMAGES;
let lbIdx = 0;

// Render images
function render() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  filtered.forEach((img, index) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `<img src="${img.url}" alt="${img.title}">`;

    div.onclick = () => openLB(index);
    grid.appendChild(div);
  });
}

// Lightbox
function openLB(index) {
  lbIdx = index;
  document.getElementById("lightbox").classList.add("open");
  updateLB();
}

function updateLB() {
  const img = filtered[lbIdx];
  document.getElementById("lb-img").src = img.url;
  document.getElementById("lb-name").textContent = img.title;
}

document.getElementById("lb-close").onclick = () => {
  document.getElementById("lightbox").classList.remove("open");
};

document.getElementById("lb-next").onclick = () => {
  lbIdx = (lbIdx + 1) % filtered.length;
  updateLB();
};

document.getElementById("lb-prev").onclick = () => {
  lbIdx = (lbIdx - 1 + filtered.length) % filtered.length;
  updateLB();
};

render();