(function () {
  function getUser() {
    try {
      return JSON.parse(sessionStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  }

  var user = getUser();
  var token = sessionStorage.getItem("token");

  if (!user || !user._id || !token || user.region || user.role) {
    window.location.href = "auth.html?mode=login";
    return;
  }

  var navUser = document.getElementById("nav-user");
  if (navUser)
    navUser.textContent = (user.fullName || user.email || "") + " | ";

  document.getElementById("nav-logout").addEventListener("click", function (e) {
    e.preventDefault();
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    window.location.href = "auth.html?mode=login";
  });

  var allCouriers = [];

  function showLoading(show) {
    document.getElementById("loading").classList.toggle("hidden", !show);
  }

  function showError(msg) {
    var el = document.getElementById("error-msg");
    el.textContent = msg || "";
    el.classList.toggle("hidden", !msg);
  }

  function getLatestStatus(shipment) {
    var statuses = shipment.statuses;
    if (!statuses || statuses.length === 0) return "–";
    return statuses[statuses.length - 1].status;
  }

  function renderShipments(shipments) {
    var list = document.getElementById("list-posiljke");
    var empty = document.getElementById("empty-msg");
    list.innerHTML = "";

    if (!shipments || shipments.length === 0) {
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");

    shipments.forEach(function (s) {
      var latestStatus = getLatestStatus(s);
      var hasCourier = s.courier && s.courier.courierId;
      var canChangeCourier =
        [
          "Pošiljka uneta u sistem",
          "Pošiljka u lokalnom centru",
          "Pošiljka u skladištu",
        ].indexOf(latestStatus) !== -1;
      var courierInfo = hasCourier
        ? s.courier.name || "Kurir dodeljen"
        : "Nije dodeljen";

      var card = document.createElement("div");
      card.className = "paket-card";

      var html =
        '<div class="card-row">' +
        '<span class="card-title">Pošiljka #' +
        (s._id || "") +
        "</span>" +
        '<span class="card-status">' +
        latestStatus +
        "</span>" +
        "</div>" +
        '<div class="card-details">' +
        "<p><strong>Pošiljalac:</strong> " +
        (s.sender && s.sender.name ? s.sender.name : "–") +
        " (" +
        (s.sender && s.sender.email ? s.sender.email : "–") +
        ")</p>" +
        "<p><strong>Primalac:</strong> " +
        (s.recipient && s.recipient.name ? s.recipient.name : "–") +
        " (" +
        (s.recipient && s.recipient.email ? s.recipient.email : "–") +
        ")</p>" +
        "<p><strong>Adresa:</strong> " +
        (s.recipient && s.recipient.address ? s.recipient.address : "–") +
        ", " +
        (s.recipient && s.recipient.city ? s.recipient.city : "–") +
        "</p>" +
        "<p><strong>Težina:</strong> " +
        (s.weight || "–") +
        " kg</p>" +
        "<p><strong>Kurir:</strong> " +
        courierInfo +
        "</p>" +
        "</div>";

      if (canChangeCourier) {
        var selectId = "courier-" + s._id;
        html +=
          '<div class="assign-block" style="margin-top:10px; padding-top:10px; border-top:1px solid #eee;">' +
          '<label for="' +
          selectId +
          '"><strong>' +
          (hasCourier ? "Promeni kurira:" : "Dodeli kurira:") +
          "</strong></label>" +
          '<select id="' +
          selectId +
          '" class="courier-select" style="width:100%; padding:6px; margin:6px 0;">';

        if (!allCouriers || allCouriers.length === 0) {
          html += '<option value="">Nema dostupnih kurira</option>';
        } else {
          html += '<option value="">Izaberi kurira</option>';
          allCouriers.forEach(function (c) {
            var selected =
              hasCourier &&
              s.courier.courierId &&
              s.courier.courierId.toString() === c._id.toString()
                ? " selected"
                : "";
            var label = c.fullName + (c.region ? " (" + c.region + ")" : "");
            html +=
              '<option value="' +
              c._id +
              '"' +
              selected +
              ">" +
              label +
              "</option>";
          });
        }

        html +=
          "</select>" +
          '<button class="btn-assign" data-id="' +
          s._id +
          '" style="padding:6px 14px; background:#3498db; color:white; border:none; border-radius:5px; cursor:pointer;">' +
          (hasCourier ? "Promeni kurira" : "Dodeli kurira") +
          "</button>" +
          "</div>";
      }

      card.innerHTML = html;
      list.appendChild(card);
    });
  }

  function loadShipments() {
    showLoading(true);
    showError("");

    authFetch(API_BASE + "/shipment/all", {
      method: "GET",
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        showLoading(false);
        if (data && data.data && data.data.shipments) {
          renderShipments(data.data.shipments);
        } else {
          showError("Greška pri učitavanju pošiljki.");
        }
      })
      .catch(function () {
        showLoading(false);
        showError("Greška u mreži.");
      });
  }

  function loadCouriersAndShipments() {
    showLoading(true);
    showError("");

    authFetch(API_BASE + "/courier/all", {
      method: "GET",
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data && data.data && data.data.couriers) {
          allCouriers = data.data.couriers;
        } else {
          allCouriers = [];
        }
        loadShipments();
      })
      .catch(function () {
        allCouriers = [];
        loadShipments();
      });
  }

  document
    .getElementById("list-posiljke")
    .addEventListener("click", function (e) {
      if (!e.target.classList.contains("btn-assign")) return;
      var shipmentId = e.target.getAttribute("data-id");
      var select = document.getElementById("courier-" + shipmentId);
      if (!select) return;
      var courierId = select.value;
      if (!courierId) {
        alert("Izaberite kurira iz liste.");
        return;
      }

      authFetch(API_BASE + "/shipment/assign-courier", {
        method: "PUT",
        body: JSON.stringify({ _id: shipmentId, courierId: courierId }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data && data.status === "success") {
            alert("Kurir je uspešno dodeljen/promijenjen.");
            loadShipments();
          } else {
            alert(data.message || "Greška pri dodeli kurira.");
          }
        })
        .catch(function () {
          alert("Greška u mreži.");
        });
    });

  loadCouriersAndShipments();
})();