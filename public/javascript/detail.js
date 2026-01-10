// ================================
// 📌 LOAD DANH SÁCH ẢNH TỪ SCRIPT
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const dataTag = document.getElementById("room-data");
  try {
    window.roomImages = JSON.parse(dataTag.textContent || "[]");
  } catch (e) {
    window.roomImages = [];
    console.error("Không parse được room-data:", e);
  }
});

let currentIndex = 0;

// ================================
// 🔍 MỞ LIGHTBOX
// ================================
function openLightbox(index) {
  if (!window.roomImages || window.roomImages.length === 0) return;

  currentIndex = index ?? 0;
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");

  img.src = "/" + window.roomImages[currentIndex];
  lightbox.classList.add("show");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("show");
  document.body.classList.remove("lightbox-open");
}

// ================================
// ⏭ CHUYỂN ẢNH
// ================================
function changeImage(direction) {
  if (!window.roomImages || window.roomImages.length === 0) return;

  currentIndex =
    (currentIndex + direction + window.roomImages.length) %
    window.roomImages.length;

  const img = document.getElementById("lightbox-img");
  img.src = "/" + window.roomImages[currentIndex];
}

// ================================
// ⌨ PHÍM TẮT: ESC, ←, →
// ================================
document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("lightbox");
  const isOpen = lightbox.classList.contains("show");
  if (!isOpen) return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") changeImage(1);
  if (e.key === "ArrowLeft") changeImage(-1);
});

// ================================
// 🖱 CLICK ẢNH PHỤ
// ================================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".sub-image").forEach((img) => {
    img.addEventListener("click", () => {
      const idx = parseInt(img.dataset.index || "0", 10);
      openLightbox(idx);
    });
  });

  // Cho phép click overlay cũng mở đúng index
  document.querySelectorAll(".more-overlay").forEach((img) => {
    img.addEventListener("click", () => {
      const idx = parseInt(img.dataset.index || "0", 10);
      openLightbox(idx);
    });
  });
});

// Expose cho inline onclick (nếu EJS có dùng)
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.changeImage = changeImage;
