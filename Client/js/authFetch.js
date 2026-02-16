/**
 * authFetch – fetch sa Authorization: Bearer tokenom.
 * Na 401 prvo poziva refresh, ažurira token, pa ponovo šalje zahtev.
 * Ako i refresh vrati 401, briše sesiju i preusmerava na prijavu.
 */
(function (global) {
  var STORAGE_TOKEN = 'token';
  var STORAGE_REFRESH = 'refreshToken';
  var STORAGE_USER = 'user';

  function getToken() {
    return sessionStorage.getItem(STORAGE_TOKEN);
  }

  function getRefreshToken() {
    return sessionStorage.getItem(STORAGE_REFRESH);
  }

  function clearAuthAndRedirect() {
    sessionStorage.removeItem(STORAGE_USER);
    sessionStorage.removeItem(STORAGE_TOKEN);
    sessionStorage.removeItem(STORAGE_REFRESH);
    window.location.href = 'auth.html?mode=login';
  }

  function authFetch(url, options, isRetry) {
    options = options || {};
    isRetry = !!isRetry;
    var headers = options.headers || {};
    if (typeof headers === 'object' && !Array.isArray(headers) && headers.constructor === Object) {
      headers = { ...headers };
    } else {
      headers = {};
    }
    var token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    options.headers = headers;
    options.credentials = options.credentials || 'include';

    return fetch(url, options).then(function (res) {
      if (res.status !== 401 || isRetry) {
        return res;
      }
      var refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthAndRedirect();
        return Promise.reject(new Error('No refresh token'));
      }
      return fetch(typeof API_BASE !== 'undefined' ? API_BASE + '/auth/refresh' : '/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshToken }),
        credentials: 'include'
      }).then(function (refreshRes) {
        if (refreshRes.status === 401 || !refreshRes.ok) {
          clearAuthAndRedirect();
          return Promise.reject(new Error('Refresh failed'));
        }
        return refreshRes.json();
      }).then(function (data) {
        if (data && data.token) {
          sessionStorage.setItem(STORAGE_TOKEN, data.token);
          if (data.refreshToken) sessionStorage.setItem(STORAGE_REFRESH, data.refreshToken);
        }
        return authFetch(url, options, true);
      }).catch(function (err) {
        if (err.message === 'Refresh failed' || err.message === 'No refresh token') {
          return Promise.reject(err);
        }
        clearAuthAndRedirect();
        return Promise.reject(err);
      });
    });
  }

  global.authFetch = authFetch;
  global.clearAuthAndRedirect = clearAuthAndRedirect;
  global.getAuthToken = getToken;
  global.getAuthRefreshToken = getRefreshToken;
  global.STORAGE_REFRESH = STORAGE_REFRESH;
})(typeof window !== 'undefined' ? window : this);
