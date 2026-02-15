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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
