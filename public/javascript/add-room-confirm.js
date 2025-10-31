document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("addRoomForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Ngăn gửi form ngay lập tức

    // Hiển thị hộp thoại xác nhận
    if (confirm("Bạn có chắc chắn muốn đăng phòng này không?")) {
      form.submit(); // Nếu bấm OK → gửi form
    } else {
      alert("Đã hủy thao tác đăng phòng.");
    }
  });
});
