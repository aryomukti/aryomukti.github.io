(function () {
  "use strict";

  var form = document.getElementById("calc");
  var ipEl = document.getElementById("ip");
  var prefixEl = document.getElementById("prefix");
  var errEl = document.getElementById("err");
  var outEl = document.getElementById("out");

  for (var p = 0; p <= 32; p++) {
    var opt = document.createElement("option");
    opt.value = String(p);
    opt.textContent = "/" + p;
    if (p === 24) opt.selected = true;
    prefixEl.appendChild(opt);
  }

  function toInt(text) {
    var parts = String(text).trim().split(".");
    if (parts.length !== 4) return null;
    var value = 0;
    for (var i = 0; i < 4; i++) {
      if (!/^\d{1,3}$/.test(parts[i])) return null;
      var octet = Number(parts[i]);
      if (octet > 255) return null;
      value = value * 256 + octet;
    }
    return value >>> 0;
  }

  function toIp(num) {
    num = num >>> 0;
    return [num >>> 24, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join(".");
  }

  function render() {
    var ip = toInt(ipEl.value);
    var prefix = Number(prefixEl.value);

    if (ip === null) {
      errEl.textContent = "IP tidak valid. Harus 4 angka 0-255, contoh 192.168.1.10";
      outEl.hidden = true;
      return;
    }
    if (!(prefix >= 0 && prefix <= 32)) {
      errEl.textContent = "Prefix harus antara 0 dan 32.";
      outEl.hidden = true;
      return;
    }

    errEl.textContent = "";

    var mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    var wildcard = (~mask) >>> 0;
    var network = (ip & mask) >>> 0;
    var broadcast = (network | wildcard) >>> 0;
    var total = Math.pow(2, 32 - prefix);
    var usable, first, last;

    if (prefix === 32) {
      usable = 1;
      first = network;
      last = network;
    } else if (prefix === 31) {
      usable = 2;
      first = network;
      last = broadcast;
    } else {
      usable = total - 2;
      first = network + 1;
      last = broadcast - 1;
    }

    document.getElementById("cidr").textContent = toIp(ip) + "/" + prefix;
    document.getElementById("network").textContent = toIp(network);
    document.getElementById("broadcast").textContent = toIp(broadcast);
    document.getElementById("mask").textContent = toIp(mask);
    document.getElementById("wildcard").textContent = toIp(wildcard);
    document.getElementById("total").textContent = total.toLocaleString("id-ID");
    document.getElementById("usable").textContent = usable.toLocaleString("id-ID");
    document.getElementById("range").textContent = toIp(first) + " — " + toIp(last);

    outEl.hidden = false;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });

  ipEl.addEventListener("input", function () {
    if (!outEl.hidden) render();
  });

  prefixEl.addEventListener("change", function () {
    if (!outEl.hidden) render();
  });

  render();
})();
