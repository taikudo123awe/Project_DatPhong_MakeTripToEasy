// 📄 public/javascript/addressAPI.js
document.addEventListener("DOMContentLoaded", async function () {
  const BASE_URL = "https://vapi.vnappmob.com/api/v2/province";

  const citySelect = document.getElementById("city");
  const districtSelect = document.getElementById("district");
  const wardSelect = document.getElementById("ward");

  const customAddressInput = document.getElementById("customAddress");
  const fullAddressInput = document.getElementById("fullAddress");

  const cityHidden = document.getElementById("cityName");
  const districtHidden = document.getElementById("districtName");
  const wardHidden = document.getElementById("wardName");

  // 🧭 Dữ liệu hiện có khi chỉnh sửa (nếu có)
  const currentCity = citySelect.dataset.current || "";
  const currentDistrict = districtSelect.dataset.current || "";
  const currentWard = wardSelect.dataset.current || "";

  // 🏙️ 1️⃣ Load danh sách Tỉnh/Thành phố
  const resCities = await fetch(`${BASE_URL}/`);
  const dataCities = await resCities.json();

  if (dataCities.results) {
    dataCities.results.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.province_id;
      opt.textContent = item.province_name;
      citySelect.appendChild(opt);
      // Nếu đang chỉnh sửa → chọn đúng Thành phố
      if (item.province_name.trim() === currentCity.trim()) {
        opt.selected = true;
      }
    });
  }

  // Nếu có sẵn thành phố → load Quận/Huyện
  if (currentCity) {
    const cityObj = dataCities.results.find(
      (c) => c.province_name.trim() === currentCity.trim()
    );
    if (cityObj) await loadDistricts(cityObj.province_id);
  }

  // Nếu có sẵn Quận/Huyện → load Phường/Xã
  if (currentDistrict) {
    const selectedDistrict = Array.from(districtSelect.options).find(
      (opt) => opt.textContent.trim() === currentDistrict.trim()
    );
    if (selectedDistrict) await loadWards(selectedDistrict.value);
  }

  // --- Khi chọn Thành phố ---
  citySelect.addEventListener("change", async function () {
    const provinceId = this.value;
    cityHidden.value = this.options[this.selectedIndex].text;
    districtSelect.innerHTML =
      '<option value="">-- Chọn quận/huyện --</option>';
    wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
    districtSelect.disabled = true;
    wardSelect.disabled = true;

    if (!provinceId) return;
    await loadDistricts(provinceId);
  });

  // --- Khi chọn Quận/Huyện ---
  districtSelect.addEventListener("change", async function () {
    const districtId = this.value;
    districtHidden.value = this.options[this.selectedIndex].text;
    wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
    wardSelect.disabled = true;
    if (!districtId) return;
    await loadWards(districtId);
  });

  // --- Khi chọn Phường/Xã ---
  wardSelect.addEventListener("change", function () {
    wardHidden.value = this.options[this.selectedIndex].text;
    updateFullAddress();
  });

  // --- Khi nhập tên đường/số nhà ---
  customAddressInput.addEventListener("input", updateFullAddress);

  // 🔁 Load danh sách Quận/Huyện
  async function loadDistricts(provinceId) {
    const res = await fetch(`${BASE_URL}/district/${provinceId}`);
    const data = await res.json();
    districtSelect.innerHTML =
      '<option value="">-- Chọn quận/huyện --</option>';

    if (data.results) {
      data.results.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.district_id;
        opt.textContent = item.district_name;
        districtSelect.appendChild(opt);
        if (item.district_name.trim() === currentDistrict.trim()) {
          opt.selected = true;
        }
      });
      districtSelect.disabled = false;
    }
  }

  // 🔁 Load danh sách Phường/Xã
  async function loadWards(districtId) {
    const res = await fetch(`${BASE_URL}/ward/${districtId}`);
    const data = await res.json();
    wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';

    if (data.results) {
      data.results.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.ward_id;
        opt.textContent = item.ward_name;
        wardSelect.appendChild(opt);
        if (item.ward_name.trim() === currentWard.trim()) {
          opt.selected = true;
        }
      });
      wardSelect.disabled = false;
    }
  }

  // 🏠 Cập nhật fullAddress (VD: “12 Nguyễn Trãi, Phường 5, Quận 3, TP.HCM”)
  function updateFullAddress() {
    const full = `${customAddressInput.value.trim()}, ${wardHidden.value}, ${
      districtHidden.value
    }, ${cityHidden.value}`;
    fullAddressInput.value = full;
  }
});

let adults = 2;
let rooms = 1;

function changeGuests(type, delta) {
  if (type === "adults") {
    adults = Math.max(1, adults + delta);
    document.getElementById("adultsCount").innerText = adults;
  } else if (type === "rooms") {
    rooms = Math.max(1, rooms + delta);
    document.getElementById("roomsCount").innerText = rooms;
  }
}

function closeGuests() {
  // Cập nhật phần hiển thị
  document.getElementById(
    "guestSummary"
  ).value = `${adults} người lớn · ${rooms} phòng`;

  // ✅ Ghi lại vào input ẩn để gửi form
  document.getElementById("hiddenGuests").value = adults;
  document.getElementById("hiddenRooms").value = rooms;

  // Ẩn menu chọn
  document.getElementById("guestOptions").style.display = "none";
}

// Hiện/ẩn dropdown
document.getElementById("guestSummary").addEventListener("click", () => {
  const dropdown = document.getElementById("guestOptions");
  dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
});
