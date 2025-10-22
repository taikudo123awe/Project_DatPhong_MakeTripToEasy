document.addEventListener("DOMContentLoaded", () => {
  // 🔹 Gợi ý địa điểm
  const cities = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Nha Trang", "Vũng Tàu"];
  const cityInput = document.getElementById("searchCity");
  const suggestions = document.getElementById("suggestions");

  cityInput.addEventListener("input", () => {
    const value = cityInput.value.toLowerCase();
    suggestions.innerHTML = "";
    if (!value) return (suggestions.style.display = "none");

    cities
      .filter(c => c.toLowerCase().includes(value))
      .forEach(city => {
        const item = document.createElement("a");
        item.className = "list-group-item list-group-item-action";
        item.textContent = city;
        item.onclick = () => {
          cityInput.value = city;
          suggestions.style.display = "none";
        };
        suggestions.appendChild(item);
      });
    suggestions.style.display = "block";
  });

  // 🔹 Bộ chọn ngày (flatpickr)
  flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y/m/d", // backend hiểu được
    minDate: "today",
    locale: "vn",
    altInput: true,
    altFormat: "d/m/Y"
  });

  // 🔹 Chọn số khách và phòng
  const guestInput = document.getElementById("guestSummary");
  const guestOptions = document.getElementById("guestOptions");

  guestInput.addEventListener("click", () => {
    guestOptions.style.display = "block";
  });

  window.changeGuests = function(type, delta) {
    const span = document.getElementById(`${type}Count`);
    let val = parseInt(span.textContent) + delta;
    if (val < 1) val = 1; // không cho nhỏ hơn 1
    span.textContent = val;
    updateGuestSummary();
  };

  window.closeGuests = function() {
    guestOptions.style.display = "none";
  };

  function updateGuestSummary() {
    const adults = document.getElementById("adultsCount").textContent;
    const rooms = document.getElementById("roomsCount").textContent;
    guestInput.value = `${adults} người lớn · ${rooms} phòng`;
  }

  // 🔹 Gửi form đúng định dạng (chèn guests & rooms)
  const form = document.querySelector("form");
  form.addEventListener("submit", () => {
    const guests = parseInt(document.getElementById("adultsCount").textContent);
    const rooms = parseInt(document.getElementById("roomsCount").textContent);

    // Xoá input ẩn cũ nếu có
    const oldGuests = form.querySelector('input[name="guests"]');
    const oldRooms = form.querySelector('input[name="rooms"]');
    if (oldGuests) oldGuests.remove();
    if (oldRooms) oldRooms.remove();

    // Tạo input mới
    const guestsInput = document.createElement("input");
    guestsInput.type = "hidden";
    guestsInput.name = "guests";
    guestsInput.value = guests;
    form.appendChild(guestsInput);

    const roomsInput = document.createElement("input");
    roomsInput.type = "hidden";
    roomsInput.name = "rooms";
    roomsInput.value = rooms;
    form.appendChild(roomsInput);
  });
});
