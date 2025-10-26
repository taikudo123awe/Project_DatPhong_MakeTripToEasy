document.addEventListener("DOMContentLoaded", () => {
  // ===== Xử lý chọn sao =====
  const stars = document.querySelectorAll(".rating-stars label");
  const inputs = document.querySelectorAll(".rating-stars input");

  function highlightStars(count) {
    stars.forEach((l) => {
      const value = l.getAttribute("for").replace("star", "");
      l.style.color = value <= count ? "#ffc107" : "#ccc";
    });
  }

  stars.forEach((label) => {
    label.addEventListener("mouseenter", () => {
      const value = label.getAttribute("for").replace("star", "");
      highlightStars(value);
    });

    label.addEventListener("mouseleave", () => {
      const checked = document.querySelector(".rating-stars input:checked");
      highlightStars(checked ? checked.value : 0);
    });
  });

  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      highlightStars(input.value);
    });
  });

  // ===== Chỉ kiểm tra sao, không kiểm tra nhận xét =====
  const form = document.querySelector(".needs-validation");
  if (form) {
    form.addEventListener("submit", (event) => {
      const ratingSelected = document.querySelector(
        'input[name="rating"]:checked'
      );

      if (!ratingSelected) {
        alert("Vui lòng chọn mức đánh giá (số sao).");
        event.preventDefault();
        return;
      }

      // ✅ Nếu chọn sao rồi thì cho gửi, không cần nhận xét
    });
  }
});
