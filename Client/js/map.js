(function () {
  const SERBIA_CENTER = [44.0, 20.9];
  const DEFAULT_ZOOM = 7;

  function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    const map = L.map('map').setView(SERBIA_CENTER, DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var apiBase = typeof API_BASE !== 'undefined' ? API_BASE : '/api/v1';
    fetch(apiBase + '/branch/all')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var branches = (data && data.data && data.data.branches) ? data.data.branches : [];
        branches.forEach(function (branch) {
          var coords = branch.location && branch.location.coordinates;
          if (!coords || coords.length < 2) return;
          var lat = coords[0];
          var lng = coords[1];
          var marker = L.marker([lat, lng]).addTo(map);
          var name = branch.name || 'Filijala';
          var address = branch.address || '';
          var popupContent = '<strong>' + escapeHtml(name) + '</strong>';
          if (address) popupContent += '<br>' + escapeHtml(address);
          marker.bindPopup(popupContent);
        });
      })
      .catch(function () {});
  }

  function escapeHtml(text) {
    if (text == null) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
