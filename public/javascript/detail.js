document.addEventListener("DOMContentLoaded", () => {
  const dataTag = document.getElementById("room-data");
  window.roomImages = JSON.parse(dataTag.textContent || "[]");
});

let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  img.src = "/" + window.roomImages[currentIndex];
  lightbox.classList.add("show");
  document.body.classList.add("lightbox-open"); // ✅ ngăn cuộn, ẩn footer
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("show");
  document.body.classList.remove("lightbox-open"); // ✅ bật lại footer, cuộn
}

function changeImage(direction) {
  currentIndex =
    (currentIndex + direction + window.roomImages.length) %
    window.roomImages.length;
  document.getElementById("lightbox-img").src =
    "/" + window.roomImages[currentIndex];
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") changeImage(1);
  if (e.key === "ArrowLeft") changeImage(-1);
});
