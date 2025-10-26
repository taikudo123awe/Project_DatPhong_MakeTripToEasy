function initValidation() {
  const emailInput = document.querySelector("input[name='email']");
  const phoneInput = document.querySelector("input[name='phoneNumber']");
  const cccdInput = document.querySelector("input[name='identityNumber']");
  const passwordInput = document.querySelector("input[name='password']");
  const confirmPasswordInput = document.querySelector("input[name='confirmPassword']");
  const taxCodeInput = document.querySelector("input[name='taxCode']");
  const form = document.querySelector("form");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^0\d{9}$/;
  const cccdRegex = /^\d{12}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  function showError(input, message) {
    let error = input.parentElement.querySelector(".text-danger");
    if (!error) {
      error = document.createElement("small");
      error.classList.add("text-danger");
      input.parentElement.appendChild(error);
    }
    error.textContent = message;
  }

  function clearError(input) {
    const error = input.parentElement.querySelector(".text-danger");
    if (error) error.remove();
  }

  function checkConfirm() {
    clearError(confirmPasswordInput);
    if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
      showError(confirmPasswordInput, "Mật khẩu nhập lại không khớp");
      return false;
    }
    return true;
  }

  function registerEvents() {
    emailInput.addEventListener("input", () => {
      clearError(emailInput);
      if (emailInput.value && !emailRegex.test(emailInput.value)) {
        showError(emailInput, "Email không hợp lệ (vd: abc12@gmail.com)");
      }
    });

    phoneInput.addEventListener("input", () => {
      clearError(phoneInput);
      if (phoneInput.value && !phoneRegex.test(phoneInput.value)) {
        showError(phoneInput, "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0");
      }
    });

    cccdInput.addEventListener("input", () => {
      clearError(cccdInput);
      if (cccdInput.value && !cccdRegex.test(cccdInput.value)) {
        showError(cccdInput, "CCCD phải gồm 12 chữ số");
      }
    });

    passwordInput.addEventListener("input", () => {
      clearError(passwordInput);
      if (passwordInput.value && !passwordRegex.test(passwordInput.value)) {
        showError(passwordInput, "Mật khẩu phải ≥ 8 ký tự, gồm chữ hoa, chữ thường và số");
      }
      checkConfirm();
    });

    confirmPasswordInput.addEventListener("input", checkConfirm);

    taxCodeInput.addEventListener("input", () => {
      clearError(taxCodeInput);
      if (taxCodeInput.value && !/^\d{10,13}$/.test(taxCodeInput.value)) {
        showError(taxCodeInput, "Mã số thuế phải gồm 10 hoặc 13 chữ số");
      }
    });

    form.addEventListener("submit", (e) => {
      if (!checkConfirm() || document.querySelectorAll(".text-danger").length > 0) {
        e.preventDefault();
        alert("Vui lòng kiểm tra lại thông tin trước khi đăng ký!");
      }
    });
  }

  registerEvents();
}

// phải gọi sau khi DOM load
document.addEventListener("DOMContentLoaded", initValidation);
