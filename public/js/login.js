document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', (e) => {
    // Prevent default and simple client-side validation
    const email = form.username.value.trim();
    const pass = form.password.value.trim();
    if (!email || !pass) {
      e.preventDefault();
      showClientError('Por favor completa correo y contraseña');
      return;
    }
    // No strict email validation here so usernames like 'DavidPadilla' work
    submitBtn.disabled = true;
  });

  function showClientError(msg) {
    let el = document.querySelector('.error-message');
    if (!el) {
      el = document.createElement('div');
      el.className = 'error-message';
      form.parentNode.insertBefore(el, form);
    }
    el.textContent = msg;
    setTimeout(() => { el.remove(); }, 4000);
  }
});
