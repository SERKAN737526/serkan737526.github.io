// Etkinleştirme isteği formu: ad + cihaz kodu Serkan'ın istek kutusuna (Cloudflare Worker) gider.
(function () {
  var ISTEK_URL = "https://altyazi-sefi-istek.blue737526.workers.dev/istek";
  var form = document.getElementById("istek-form");
  if (!form) return;
  var durum = document.getElementById("istek-durum");
  var dugme = form.querySelector("button[type=submit]");

  function normKod(s) {
    var t = String(s || "").toUpperCase().replace(/[\s\-_.]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
    return /^[0-9A-HJKMNP-TV-Z]{8}$/.test(t) ? t : null;
  }
  function yaz(metin, tur) {
    durum.textContent = metin;
    durum.className = "form-durum " + (tur || "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ad = form.ad.value.trim();
    var kod = normKod(form.kod.value);
    if (ad.length < 2) { yaz("Lütfen adınızı yazın.", "hata"); form.ad.focus(); return; }
    if (!kod) { yaz("Cihaz kodu 8 karakter olmalı (örnek: M7R5-D0S7). Eklentinin ya da sitenin kilit ekranında yazar.", "hata"); form.kod.focus(); return; }

    dugme.disabled = true;
    yaz("Gönderiliyor…");
    fetch(ISTEK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad: ad, kod: kod, not: form.not.value.trim(), web: form.web.value }),
      credentials: "omit",
      referrerPolicy: "no-referrer"
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { durum: r.status, j: j }; }); })
      .then(function (s) {
        if (s.j && s.j.ok) {
          form.reset();
          yaz("İsteğiniz ulaştı. Kodunuzu onayladığımda kilit ekranı açıksa birkaç saniye içinde kendiliğinden açılır.", "tamam");
        } else if (s.durum === 429) {
          yaz("Çok sık istek gönderildi. Lütfen bir saat sonra yeniden deneyin.", "hata");
        } else {
          yaz("İstek gönderilemedi. Bilgileri kontrol edip yeniden deneyin.", "hata");
        }
      })
      .catch(function () { yaz("Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.", "hata"); })
      .then(function () { dugme.disabled = false; });
  });
})();
