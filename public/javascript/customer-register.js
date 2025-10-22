    function checkConfirm() {
      const p1 = document.getElementById('password').value;
      const p2 = document.getElementById('confirmPassword').value;
      const help = document.getElementById('confirmHelp');
      if (p1 !== p2) {
        help.style.display = 'block';
        return false;
      }
      help.style.display = 'none';
      return true;
    }
    // Giữ lại dữ liệu người dùng nhập khi có lỗi server
    function prefill() {
      // Không cần JS nếu dùng EJS value= như trên, nhưng để đây nếu sau muốn mở rộng
    }