
    document.addEventListener('DOMContentLoaded', function () {
      // --- (Lấy các element input, error và button - GIỮ NGUYÊN) ---
      const profileForm = document.getElementById('profileForm'); // Lấy form
      const providerNameInput = document.getElementById('providerName');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phoneNumber');
      const bankNameInput = document.getElementById('bankName');
      const holderNameInput = document.getElementById('accountHolder');
      const accountInput = document.getElementById('accountNumber');
      const updateButton = document.getElementById('updateButton');
      
      const providerNameError = document.getElementById('providerNameError');
      const emailError = document.getElementById('emailError');
      const phoneError = document.getElementById('phoneError');
      const bankNameError = document.getElementById('bankNameError');
      const holderNameError = document.getElementById('holderNameError');
      const accountError = document.getElementById('accountError');

      // --- (Hàm checkFormValidity - GIỮ NGUYÊN) ---
      function checkFormValidity(showErrors = false) {
        let isProviderNameInvalid = false;
        let isEmailInvalid = false;
        let isPhoneInvalid = false;
        let isBankNameInvalid = false;
        let isHolderNameInvalid = false;
        let isAccountInvalid = false;
        const numRegex = /^\d+$/; 

        // 1. Tên nhà cung cấp
        const providerName = providerNameInput.value.trim();
        if (providerName === '') {
          isProviderNameInvalid = true;
          if (showErrors) {
            providerNameInput.classList.add('is-invalid');
            providerNameError.textContent = 'Tên nhà cung cấp không được bỏ trống.';
          }
        } else {
          isProviderNameInvalid = false;
          providerNameInput.classList.remove('is-invalid');
          providerNameError.textContent = '';
        }

        // 2. Email
        const email = emailInput.value;
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (email === '') {
          isEmailInvalid = true;
          if (showErrors) {
            emailInput.classList.add('is-invalid');
            emailError.textContent = 'Email không được bỏ trống.';
          }
        } else if (!emailRegex.test(email)) {
          isEmailInvalid = true;
          if (showErrors) {
            emailInput.classList.add('is-invalid');
            emailError.textContent = 'Email không đúng định dạng.';
          }
        } else {
          isEmailInvalid = false;
          emailInput.classList.remove('is-invalid');
          emailError.textContent = '';
        }

        // 3. Số điện thoại
        const phone = phoneInput.value;
        if (phone === '') {
          isPhoneInvalid = true;
          if (showErrors) {
            phoneInput.classList.add('is-invalid');
            phoneError.textContent = 'Số điện thoại không được bỏ trống.';
          }
        } else if (!numRegex.test(phone)) {
          isPhoneInvalid = true;
          if (showErrors) {
            phoneInput.classList.add('is-invalid');
            phoneError.textContent = 'Số điện thoại chỉ được chứa số.';
          }
        } else if (phone.length !== 10) {
          isPhoneInvalid = true;
          if (showErrors) {
            phoneInput.classList.add('is-invalid');
            phoneError.textContent = 'Số điện thoại phải có đúng 10 ký tự.';
          }
        } else {
          isPhoneInvalid = false;
          phoneInput.classList.remove('is-invalid');
          phoneError.textContent = '';
        }

        // 4. Tên ngân hàng
        const bankName = bankNameInput.value.trim();
        if (bankName === '') {
          isBankNameInvalid = true;
          if (showErrors) {
            bankNameInput.classList.add('is-invalid');
            bankNameError.textContent = 'Tên ngân hàng không được bỏ trống.';
          }
        } else {
          isBankNameInvalid = false;
          bankNameInput.classList.remove('is-invalid');
          bankNameError.textContent = '';
        }

        // 5. Tên chủ tài khoản
        const holderName = holderNameInput.value.trim();
        if (holderName === '') {
          isHolderNameInvalid = true;
          if (showErrors) {
            holderNameInput.classList.add('is-invalid');
            holderNameError.textContent = 'Tên chủ tài khoản không được bỏ trống.';
          }
        } else {
          isHolderNameInvalid = false;
          holderNameInput.classList.remove('is-invalid');
          holderNameError.textContent = '';
        }

        // 6. Số tài khoản
        const accountNum = accountInput.value;
        if (accountNum === '') {
          isAccountInvalid = true;
          if (showErrors) {
            accountInput.classList.add('is-invalid');
            accountError.textContent = 'Số tài khoản không được bỏ trống.';
          }
        } else if (!numRegex.test(accountNum)) {
          isAccountInvalid = true;
          if (showErrors) {
            accountInput.classList.add('is-invalid');
            accountError.textContent = 'Số tài khoản không được chứa ký tự chữ cái.';
          }
        } else {
          isAccountInvalid = false;
          accountInput.classList.remove('is-invalid');
          accountError.textContent = '';
        }
        
        // 7. Cập nhật trạng thái nút
        updateButton.disabled = isProviderNameInvalid || isEmailInvalid || isPhoneInvalid ||
                                isBankNameInvalid || isHolderNameInvalid || isAccountInvalid;
      }

      // --- (Gắn sự kiện 'blur' và 'input' - GIỮ NGUYÊN) ---
      const inputsToValidate = [
        providerNameInput, emailInput, phoneInput, 
        bankNameInput, holderNameInput, accountInput
      ];
      inputsToValidate.forEach(input => {
        input.addEventListener('blur', () => checkFormValidity(true));
        input.addEventListener('input', () => {
          const wasInvalid = input.classList.contains('is-invalid');
          checkFormValidity(wasInvalid);
        });
      });

      // --- (Chạy 1 lần khi tải trang - GIỮ NGUYÊN) ---
      checkFormValidity(false);

      // --- CẬP NHẬT: Thêm sự kiện SUBMIT cho form ---
      profileForm.addEventListener('submit', function (event) {
        // 1. Ngăn form gửi đi ngay lập tức
        event.preventDefault();

        // 2. Hỏi người dùng
        const confirmed = window.confirm('Bạn có muốn lưu thông tin thay đổi?');

        // 3. Nếu người dùng xác nhận
        if (confirmed) {
          // 4. Gửi form (lần này sẽ không kích hoạt lại sự kiện 'submit' này)
          profileForm.submit();
        }
        
        // Nếu người dùng bấm "Cancel", không làm gì cả, họ sẽ ở lại form.
      });

    });
