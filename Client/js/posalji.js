(function () {
  const STORAGE_USER = 'user';
  const STORAGE_TOKEN = 'token';

  function getToken() {
    return sessionStorage.getItem(STORAGE_TOKEN);
  }

  function getUser() {
    try {
      const raw = sessionStorage.getItem(STORAGE_USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function redirectToLogin() {
    window.location.href = 'auth.html?mode=login';
  }

  function clearFieldErrors() {
    document.querySelectorAll('#form-posalji .field-error').forEach(function (el) {
      el.textContent = '';
    });
    document.querySelectorAll('#form-posalji .invalid').forEach(function (el) {
      el.classList.remove('invalid');
    });
  }

  function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(fieldId + '-error');
    if (input) input.classList.add('invalid');
    if (errEl) errEl.textContent = message || '';
  }

  function showMessage(text, type) {
    const el = document.getElementById('posalji-message');
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message ' + (type === 'success' ? 'success' : 'error');
  }

  function buildBody() {
    const user = getUser();
    const weightVal = document.getElementById('weight').value.trim();
    const weight = weightVal === '' ? null : parseFloat(weightVal, 10);
    return {
      userId: user._id,
      receipentEmail: document.getElementById('receipentEmail').value.trim(),
      receipentFirst: document.getElementById('receipentFirst').value.trim(),
      receipentLast: document.getElementById('receipentLast').value.trim(),
      phoneNumber: document.getElementById('phoneNumber').value.replace(/\s/g, ''),
      address: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
      postalCode: document.getElementById('postalCode').value.trim(),
      weight: weight
    };
  }

  // Provera da li je korisnik ulogovan i ima token
  const user = getUser();
  const token = getToken();
  if (!user || !user._id || !token) {
    redirectToLogin();
  } else {
    const navUser = document.getElementById('nav-user');
    if (navUser) {
      var displayName = user.firstName && user.lastName
        ? user.firstName + ' ' + user.lastName
        : (user.companyName || user.email || 'Korisnik');
      navUser.textContent = displayName.trim() + ' | ';
    }
  }

  // Odjava
  document.getElementById('nav-logout').addEventListener('click', function (e) {
    e.preventDefault();
    if (typeof clearAuthAndRedirect === 'function') {
      clearAuthAndRedirect();
    } else {
      sessionStorage.removeItem(STORAGE_USER);
      sessionStorage.removeItem(STORAGE_TOKEN);
      sessionStorage.removeItem('refreshToken');
      redirectToLogin();
    }
  });

  // Slanje forme
  document.getElementById('form-posalji').addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFieldErrors();
    showMessage('', '');

    var body = buildBody();
    if (body.weight === null || isNaN(body.weight) || body.weight < 1) {
      showFieldError('weight', 'Unesite validnu težinu (broj veći od 0).');
      return;
    }

    var btn = document.getElementById('btn-submit');
    btn.disabled = true;

    try {
      var fetchFn = typeof authFetch === 'function' ? authFetch : fetch;
    var res = await fetchFn(API_BASE + '/shipment/', {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'include'
      });
      var data = await res.json().catch(function () {
        return { message: 'Greška u odgovoru servera.' };
      });

      if (res.ok) {
        showMessage('Pošiljka je uspešno kreirana. Primalac će dobiti obaveštenje.', 'success');
        document.getElementById('form-posalji').reset();
      } else {
        showMessage(data.message || 'Kreiranje pošiljke nije uspelo.', 'error');
        if (data.errors && typeof data.errors === 'object') {
          Object.keys(data.errors).forEach(function (field) {
            var msg = Array.isArray(data.errors[field]) ? data.errors[field][0] : data.errors[field];
            var id = field === 'receipentEmail' ? 'receipentEmail' : field;
            showFieldError(id, msg);
          });
        }
      }
    } catch (err) {
      showMessage('Greška u mreži. Pokušajte ponovo.', 'error');
    } finally {
      btn.disabled = false;
    }
  });
})();
