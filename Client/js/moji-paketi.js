(function () {
  const STORAGE_USER = 'user';
  const STORAGE_TOKEN = 'token';

  function getToken() {
    return sessionStorage.getItem(STORAGE_TOKEN);
  }

  function getUser() {
    try {
      var raw = sessionStorage.getItem(STORAGE_USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function redirectToLogin() {
    window.location.href = 'auth.html?mode=login';
  }

  function getLatestStatus(shipment) {
    var statuses = shipment.statuses;
    if (!statuses || statuses.length === 0) return { status: '–', dateTime: null };
    return statuses[statuses.length - 1];
  }

  function formatDate(d) {
    if (!d) return '';
    var date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderCard(shipment, isSent) {
    var latest = getLatestStatus(shipment);
    var isDelivered = latest.status === 'Isporučeno';
    var statusClass = isDelivered ? 'card-status delivered' : 'card-status';
    var otherParty = isSent ? shipment.recipient : shipment.sender;
    var otherLabel = isSent ? 'Primalac' : 'Pošiljalac';
    var otherName = (otherParty && otherParty.name) ? otherParty.name : '–';
    var otherEmail = (otherParty && otherParty.email) ? otherParty.email : '';
    var address = (otherParty && otherParty.address) ? otherParty.address : '';
    var city = (otherParty && otherParty.city) ? otherParty.city : '';
    var addrLine = [address, city].filter(Boolean).join(', ');
    var weight = shipment.weight != null ? shipment.weight : '–';
    var unit = (shipment.weight && shipment.weight.unit) ? shipment.weight.unit : 'kg';

    var card = document.createElement('div');
    card.className = 'paket-card';
    card.innerHTML =
      '<div class="card-row">' +
        '<span class="card-title">' + escapeHtml(otherName) + (otherEmail ? ' &middot; ' + escapeHtml(otherEmail) : '') + '</span>' +
        '<span class="' + statusClass + '">' + escapeHtml(latest.status) + '</span>' +
      '</div>' +
      '<div class="card-details">' +
        '<p><strong>' + otherLabel + ':</strong> ' + escapeHtml(otherName) + (otherEmail ? ' (' + escapeHtml(otherEmail) + ')' : '') + '</p>' +
        (addrLine ? '<p><strong>Adresa:</strong> ' + escapeHtml(addrLine) + '</p>' : '') +
        '<p><strong>Težina:</strong> ' + escapeHtml(String(weight)) + ' ' + escapeHtml(unit) + '</p>' +
        (latest.dateTime ? '<p><strong>Poslednji status:</strong> ' + formatDate(latest.dateTime) + '</p>' : '') +
      '</div>' +
    (isSent ? '<button class="btn-obrisi" data-id="' + shipment._id + '">Obriši</button>' : '');
        return card;
      }

  function escapeHtml(text) {
    if (text == null) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showLoading(show) {
    var el = document.getElementById('loading');
    if (el) el.classList.toggle('hidden', !show);
  }

  function showError(msg) {
    var el = document.getElementById('error-msg');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('hidden', !msg);
  }

  function renderList(listId, emptyId, shipments, isSent) {
    var list = document.getElementById(listId);
    var empty = document.getElementById(emptyId);
    if (!list || !empty) return;
    list.innerHTML = '';
    if (!shipments || shipments.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    shipments.forEach(function (s) {
      list.appendChild(renderCard(s, isSent));
    });
  }

  var user = getUser();
  var token = getToken();
  if (!user || !user._id || !token) {
    redirectToLogin();
    return;
  }

  var navUser = document.getElementById('nav-user');
  if (navUser) {
    var displayName = (user.firstName && user.lastName)
      ? user.firstName + ' ' + user.lastName
      : (user.companyName || user.email || 'Korisnik');
    navUser.textContent = displayName.trim() + ' | ';
  }

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

  var fetchFn = typeof authFetch === 'function' ? authFetch : fetch;
  var requestOpts = { credentials: 'include' };

  var sentShipments = [];
  var receivedShipments = [];

  function switchPanel(activeTab) {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.id === 'tab-' + activeTab);
    });
    document.getElementById('panel-poslati').classList.toggle('active', activeTab === 'poslati');
    document.getElementById('panel-primljeni').classList.toggle('active', activeTab === 'primljeni');
  }

  document.getElementById('tab-poslati').addEventListener('click', function () {
    switchPanel('poslati');
  });
  document.getElementById('tab-primljeni').addEventListener('click', function () {
    switchPanel('primljeni');
  });

  showLoading(true);
  showError('');

  Promise.all([
    fetchFn(API_BASE + '/shipment/my-sent', requestOpts).then(function (r) { return r.json(); }),
    fetchFn(API_BASE + '/shipment/my-received', requestOpts).then(function (r) { return r.json(); })
  ]).then(function (results) {
    showLoading(false);
    var sentData = results[0];
    var receivedData = results[1];
    if (sentData && sentData.data && Array.isArray(sentData.data.shipments)) {
      sentShipments = sentData.data.shipments;
    }
    if (receivedData && receivedData.data && Array.isArray(receivedData.data.shipments)) {
      receivedShipments = receivedData.data.shipments;
    }
    if (sentData && sentData.statusCode === 401) {
      showError('Sesija je istekla. Molimo prijavite se ponovo.');
      return;
    }
    if (receivedData && receivedData.statusCode === 401) {
      showError('Sesija je istekla. Molimo prijavite se ponovo.');
      return;
    }
    if (sentData && sentData.message && !sentData.data) {
      showError(sentData.message || 'Greška pri učitavanju poslatih paketa.');
    }
    if (receivedData && receivedData.message && !receivedData.data) {
      showError(receivedData.message || 'Greška pri učitavanju primljenih paketa.');
    }
    renderList('list-poslati', 'empty-poslati', sentShipments, true);
    renderList('list-primljeni', 'empty-primljeni', receivedShipments, false);
    // logika za klik na dugme obrisi
  }).catch(function (err) {
      showLoading(false);
      showError('Greška u mreži. Pokušajte ponovo.');
    });

  document.getElementById('list-poslati').addEventListener('click', function (e) {
    if (!e.target.classList.contains('btn-obrisi')) return;
    var id = e.target.getAttribute('data-id');
    if (!confirm('Da li ste sigurni da želite da obrišete ovu pošiljku?')) return;

    fetchFn(API_BASE + '/shipment', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: id })
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (data.message === 'Pošiljka je obrisana') {
        sentShipments = sentShipments.filter(function (s) { return s._id !== id; });
        renderList('list-poslati', 'empty-poslati', sentShipments, true);
      } else {
        alert(data.message || 'Greška pri brisanju.');
      }
    }).catch(function () {
      alert('Greška u mreži.');
    });
  });
})();
