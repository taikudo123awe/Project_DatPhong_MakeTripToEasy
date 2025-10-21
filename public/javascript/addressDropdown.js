document.addEventListener("DOMContentLoaded", function () {
  const citySelect = document.getElementById("city");
  const districtSelect = document.getElementById("district");
  const wardSelect = document.getElementById("ward");
  const addressIdInput = document.getElementById("addressId");
  const fullAddressInput = document.getElementById("fullAddress");
  const customAddressInput = document.getElementById("customAddress");

  // Khi chọn thành phố
  citySelect.addEventListener("change", function () {
    const selectedCity = this.value.trim();
    districtSelect.innerHTML =
      '<option value="">-- Chọn quận/huyện --</option>';
    wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
    districtSelect.disabled = true;
    wardSelect.disabled = true;
    addressIdInput.value = "";
    fullAddressInput.value = "";

    if (!selectedCity) return;

    const districts = [
      ...new Set(
        addresses
          .filter(
            (a) => a.city?.trim().toLowerCase() === selectedCity.toLowerCase()
          )
          .map((a) => a.district)
      ),
    ];
    districts.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      districtSelect.appendChild(opt);
    });
    districtSelect.disabled = false;
  });

  // Khi chọn quận
  districtSelect.addEventListener("change", function () {
    const selectedCity = citySelect.value.trim();
    const selectedDistrict = this.value.trim();
    wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
    wardSelect.disabled = true;

    if (!selectedDistrict) return;

    const wards = addresses
      .filter(
        (a) =>
          a.city?.trim().toLowerCase() === selectedCity.toLowerCase() &&
          a.district?.trim().toLowerCase() === selectedDistrict.toLowerCase()
      )
      .map((a) => ({ ward: a.ward, id: a.addressId }));

    wards.forEach((w) => {
      const opt = document.createElement("option");
      opt.value = w.id; // lưu addressId
      opt.textContent = w.ward;
      wardSelect.appendChild(opt);
    });
    wardSelect.disabled = false;
  });

  // Khi chọn phường
  wardSelect.addEventListener("change", function () {
    addressIdInput.value = this.value; // lưu id vào input ẩn
    updateFullAddress();
  });

  // Khi nhập tên đường
  customAddressInput.addEventListener("input", updateFullAddress);

  function updateFullAddress() {
    const selectedAddr = addresses.find((a) => a.addressId == wardSelect.value);
    if (!selectedAddr) return;
    const detail = customAddressInput.value.trim();
    const full = `${detail ? detail + ", " : ""}${selectedAddr.ward}, ${
      selectedAddr.district
    }, ${selectedAddr.city}`;
    fullAddressInput.value = full;
  }
});
