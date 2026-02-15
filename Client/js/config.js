// API base URL – kada se stranica otvori preko file:// origin nije http pa koristimo localhost
var API_BASE = (window.location.origin && window.location.protocol !== 'file:')
  ? window.location.origin + '/api/v1'
  : 'http://localhost:3000/api/v1';
