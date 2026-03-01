(function () {
  function getUser() {
    try {
      return JSON.parse(sessionStorage.getItem('user'));
    } catch (e) { return null; }
  }

  function getToken() {
    return sessionStorage.getItem('token');
  }

  var user = getUser();
  var token = getToken();

  if (!user || !user._id || !token || !user.region) {
    window.location.href = 'auth.html?mode=login';
    return;
  }

  var navUser = document.getElementById('nav-user');
  if (navUser) navUser.textContent = user.fullName + ' | ';

  document.getElementById('nav-logout').addEventListener('click', function (e) {
    e.preventDefault();
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    window.location.href = 'auth.html?mode=login';
  });

  var selectedShipmentId = null;

  function showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
  }

  function showError(msg) {
    var el = document.getElementById('error-msg');
    el.textContent = msg || '';
    el.classList.toggle('hidden', !msg);
  }

  function getLatestStatus(shipment) {
    var statuses = shipment.statuses;
    if (!statuses || statuses.length === 0) return '–';
    return statuses[statuses.length - 1].status;
  }

  function renderShipments(shipments) {
    var list = document.getElementById('list-posiljke');
    var empty = document.getElementById('empty-msg');
    list.innerHTML = '';

    if (!shipments || shipments.length === 0) {
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    shipments.forEach(function (s) {
      var card = document.createElement('div');
      card.className = 'paket-card';
      card.innerHTML =
        '<div class="card-row">' +
          '<span class="card-title">' + (s.recipient.name || '–') + '</span>' +
          '<span class="card-status">' + getLatestStatus(s) + '</span>' +
        '</div>' +
        '<div class="card-details">' +
          '<p><strong>Primalac:</strong> ' + (s.recipient.name || '–') + ' (' + (s.recipient.email || '–') + ')</p>' +
          '<p><strong>Adresa:</strong> ' + (s.recipient.address || '–') + ', ' + (s.recipient.city || '–') + '</p>' +
          '<p><strong>Težina:</strong> ' + (s.weight || '–') + ' kg</p>' +
        '</div>' +
        '<button class="btn-promeni-status" data-id="' + s._id + '" style="margin-top:10px; padding:6px 14px; background:#3498db; color:white; border:none; border-radius:5px; cursor:pointer;">Promeni status</button>';
      list.appendChild(card);
    });
  }

  showLoading(true);

  fetch(API_BASE + '/shipment/getCouirierShip?couirerId=' + user._id, {
    credentials: 'include',
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(function (r) { return r.json(); }).then(function (data) {
    showLoading(false);
    if (data && data.data && data.data.shipments) {
      renderShipments(data.data.shipments);
    } else {
      showError('Greška pri učitavanju pošiljki.');
    }
  }).catch(function () {
    showLoading(false);
    showError('Greška u mreži.');
  });

  document.getElementById('list-posiljke').addEventListener('click', function (e) {
    if (!e.target.classList.contains('btn-promeni-status')) return;
    selectedShipmentId = e.target.getAttribute('data-id');
    document.getElementById('selected-id').textContent = selectedShipmentId;
    document.getElementById('status-form').classList.remove('hidden');
  });

  document.getElementById('btn-otkazi').addEventListener('click', function () {
    document.getElementById('status-form').classList.add('hidden');
    selectedShipmentId = null;
  });

  document.getElementById('btn-potvrdi').addEventListener('click', function () {
    if (!selectedShipmentId) return;
    var status = document.getElementById('status-select').value;

    fetch(API_BASE + '/shipment/status', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ _id: selectedShipmentId, status: status })
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (data && data.data && data.data.shipment) {
        alert('Status uspešno promenjen!');
        document.getElementById('status-form').classList.add('hidden');
        selectedShipmentId = null;
        window.location.reload();
      } else {
        alert(data.message || 'Greška pri promeni statusa.');
      }
    }).catch(function () {
      alert('Greška u mreži.');
    });
  });

})();