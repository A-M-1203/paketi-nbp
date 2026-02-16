(function () {
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const signupRole = document.getElementById('signup-role');
  const signupIndividual = document.getElementById('signup-individual');
  const signupLegal = document.getElementById('signup-legal');

  function getMode() {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'signup' ? 'signup' : 'login';
  }

  function setActiveForm(mode) {
    const isLogin = mode === 'login';
    formLogin.classList.toggle('hidden', !isLogin);
    formSignup.classList.toggle('hidden', isLogin);
    tabLogin.classList.toggle('active', isLogin);
    tabSignup.classList.toggle('active', !isLogin);
  }

  function toggleRoleFields() {
    const isLegal = signupRole.value === 'pravno lice';
    signupIndividual.classList.toggle('hidden', isLegal);
    signupLegal.classList.toggle('hidden', !isLegal);
    if (isLegal) {
      document.getElementById('signup-firstName').removeAttribute('required');
      document.getElementById('signup-lastName').removeAttribute('required');
      document.getElementById('signup-companyName').setAttribute('required', '');
      document.getElementById('signup-taxId').setAttribute('required', '');
    } else {
      document.getElementById('signup-firstName').setAttribute('required', '');
      document.getElementById('signup-lastName').setAttribute('required', '');
      document.getElementById('signup-companyName').removeAttribute('required');
      document.getElementById('signup-taxId').removeAttribute('required');
    }
  }

  function showMessage(formId, text, type) {
    const el = document.querySelector('#' + formId + ' .form-message');
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message ' + (type === 'success' ? 'success' : 'error');
  }

  function clearFieldErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.field-error').forEach(function (span) {
      span.textContent = '';
    });
    form.querySelectorAll('.invalid').forEach(function (input) {
      input.classList.remove('invalid');
    });
  }

  function showFieldErrors(errors) {
    if (!errors || typeof errors !== 'object') return;
    Object.keys(errors).forEach(function (field) {
      const el = document.getElementById('signup-' + field + '-error');
      const input = document.getElementById('signup-' + field);
      if (el) el.textContent = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
      if (input) input.classList.add('invalid');
    });
  }

  function buildSignupBody() {
    const role = signupRole.value;
    const body = {
      role: role,
      email: document.getElementById('signup-email').value.trim(),
      phoneNumber: document.getElementById('signup-phoneNumber').value.replace(/\s/g, ''),
      city: document.getElementById('signup-city').value.trim(),
      address: document.getElementById('signup-address').value.trim(),
      postalCode: document.getElementById('signup-postalCode').value.toString().trim(),
      password: document.getElementById('signup-password').value,
      passwordConfirm: document.getElementById('signup-passwordConfirm').value
    };
    if (role === 'fizicko lice') {
      body.firstName = document.getElementById('signup-firstName').value.trim();
      body.lastName = document.getElementById('signup-lastName').value.trim();
    } else {
      body.companyName = document.getElementById('signup-companyName').value.trim();
      body.taxId = document.getElementById('signup-taxId').value.trim();
    }
    return body;
  }

  formLogin.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFieldErrors('form-login');
    showMessage('form-login', '', '');

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch(API_BASE + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
        credentials: 'include'
      });
      const data = await res.json().catch(function () {
        return { message: 'Greška u odgovoru servera.' };
      });

      if (res.ok) {
        showMessage('form-login', 'Uspešna prijava.', 'success');
        try {
          if (data.data && data.data._id) {
            sessionStorage.setItem('user', JSON.stringify(data.data));
          }
          if (data.token) {
            sessionStorage.setItem('token', data.token);
          }
          if (data.refreshToken) {
            sessionStorage.setItem('refreshToken', data.refreshToken);
          }
        } catch (err) {}
        setTimeout(function () {
          window.location.href = 'posalji.html';
        }, 800);
        return;
      }

      const msg = data.message || 'Prijava nije uspela.';
      showMessage('form-login', msg, 'error');
      if (data.statusCode === 401 && msg.toLowerCase().indexOf('email') !== -1) {
        document.getElementById('login-email-error').textContent = msg;
        document.getElementById('login-email').classList.add('invalid');
      }
    } catch (err) {
      showMessage('form-login', 'Greška u mreži. Pokušajte ponovo.', 'error');
    }
  });

  formSignup.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFieldErrors('form-signup');
    showMessage('form-signup', '', '');

    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-passwordConfirm').value;
    if (password !== passwordConfirm) {
      document.getElementById('signup-passwordConfirm-error').textContent = 'Lozinke se ne poklapaju.';
      document.getElementById('signup-passwordConfirm').classList.add('invalid');
      return;
    }

    const body = buildSignupBody();

    try {
      const res = await fetch(API_BASE + '/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(function () {
        return { message: 'Greška u odgovoru servera.' };
      });

      if (res.ok) {
        showMessage('form-signup', 'Uspešno ste se registrovali. Možete se prijaviti.', 'success');
        formSignup.reset();
        toggleRoleFields();
        return;
      }

      showMessage('form-signup', data.message || 'Registracija nije uspela.', 'error');
      if (data.errors) showFieldErrors(data.errors);
    } catch (err) {
      showMessage('form-signup', 'Greška u mreži. Pokušajte ponovo.', 'error');
    }
  });

  signupRole.addEventListener('change', toggleRoleFields);

  setActiveForm(getMode());
  toggleRoleFields();
})();
