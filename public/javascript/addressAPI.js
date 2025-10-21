// 📌 addressAPI.js — tải danh sách tỉnh / quận / phường Việt Nam từ vAPI.vnappmob
document.addEventListener("DOMContentLoaded", function () {
  const BASE_URL = "https://vapi.vnappmob.com/api/v2/province";

  const citySelect = document.getElementById("city");
  const districtSelect = document.getElementById("district");
  const wardSelect = document.getElementById("ward");
  const addressIdInput = document.getElementById("addressId");
  const fullAddressInput = document.getElementById("fullAddress");
  const customAddressInput = document.getElementById("customAddress");

  // 🏙️ Load danh sách Tỉnh/Thành phố
  fetch(`${BASE_URL}/`)
    .then((res) => res.json())
    .then((data) => {
      if (data.results) {
        data.results.forEach((item) => {
          const opt = document.createElement("option");
          opt.value = item.province_id;
          opt.textContent = item.province_name;
          citySelect.appendChild(opt);
        });
      }
    });

  // 🏘️ Khi chọn Tỉnh → load Quận/Huyện
  citySelect.addEventListener("change", function () {
    const provinceId = this.value;
    citySelect.dataset.name = this.options[this.selectedIndex].text;

    districtSelect.innerHTML =
      '<option value="">-- Chọn quận/huyện --</option>';
    wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
    districtSelect.disabled = true;
    wardSelect.disabled = true;

    if (!provinceId) return;

    fetch(`${BASE_URL}/district/${provinceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          data.results.forEach((item) => {
            const opt = document.createElement("option");
            opt.value = item.district_id;
            opt.textContent = item.district_name;
            districtSelect.appendChild(opt);
          });
          districtSelect.disabled = false;
        }
      });
  });

  // 🏡 Khi chọn Quận → load Phường/Xã
  districtSelect.addEventListener("change", function () {
    const districtId = this.value;
    districtSelect.dataset.name = this.options[this.selectedIndex].text;

    wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
    wardSelect.disabled = true;

    if (!districtId) return;

    fetch(`${BASE_URL}/ward/${districtId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          data.results.forEach((item) => {
            const opt = document.createElement("option");
            opt.value = item.ward_id;
            opt.textContent = item.ward_name;
            wardSelect.appendChild(opt);
          });
          wardSelect.disabled = false;
        }
      });
  });

  // 🧭 Khi chọn phường → cập nhật hidden input
  wardSelect.addEventListener("change", function () {
    addressIdInput.value = this.value;
    wardSelect.dataset.name = this.options[this.selectedIndex].text;
    updateFullAddress();
  });

  // ✏️ Khi nhập tên đường → cập nhật địa chỉ đầy đủ
  customAddressInput.addEventListener("input", updateFullAddress);

  function updateFullAddress() {
    const city = citySelect.dataset.name || "";
    const district = districtSelect.dataset.name || "";
    const ward = wardSelect.dataset.name || "";
    const detail = customAddressInput.value.trim();
    const full = `${detail ? detail + ", " : ""}${ward}, ${district}, ${city}`;
    fullAddressInput.value = full;
  }
});
