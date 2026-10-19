// Etkinleştirme isteklerini listeleyen, yalnızca şifreyle açılan sayfa.
(function () {
  var API = "https://altyazi-sefi-istek.blue737526.workers.dev";
  var ANAHTAR = "altyazi-istek-sifre";
  var giris = document.getElementById("giris");
  var girisDurum = document.getElementById("giris-durum");
  var panel = document.getElementById("panel");
  var liste = document.getElementById("liste");
  var sayi = document.getElementById("sayi");
  var sifre = null;

  function oku(depo) { try { return depo.getItem(ANAHTAR); } catch (e) { return null; } }
  function yazDepo(depo, v) { try { if (v) depo.setItem(ANAHTAR, v); else depo.removeItem(ANAHTAR); } catch (e) {} }

  function el(etiket, sinif, metin) {
    var n = document.createElement(etiket);
    if (sinif) n.className = sinif;
    if (metin != null) n.textContent = metin;   // her şey textContent ile: gelen veri HTML olarak işlenmez
    return n;
  }
  function kodBicim(k) { return k.slice(0, 4) + "-" + k.slice(4); }
  function tarih(t) {
    try { return new Date(t).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return t; }
  }

  function istek(yol, yontem) {
    return fetch(API + yol, {
      method: yontem || "GET",
      headers: { Authorization: "Bearer " + sifre },
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "no-store"
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { durum: r.status, j: j }; }); });
  }

  function goster(istekler) {
    liste.textContent = "";
    sayi.textContent = istekler.length ? istekler.length + " istek" : "";
    if (!istekler.length) { liste.appendChild(el("p", "ince", "Şu an bekleyen istek yok.")); return; }
    istekler.forEach(function (i) {
      var kart = el("article", "istek-kart");
      var ust = el("div", "istek-ust");
      ust.appendChild(el("strong", null, i.ad));
      ust.appendChild(el("span", "ince", tarih(i.t)));
      kart.appendChild(ust);
      var kod = el("code", "istek-kod", kodBicim(i.kod));
      kart.appendChild(kod);
      if (i.not) kart.appendChild(el("p", "ince", i.not));
      var btns = el("div", "btns");
      var kopyala = el("button", "btn primary", "Kodu kopyala");
      kopyala.type = "button";
      kopyala.addEventListener("click", function () {
        var tamam = function () { kopyala.textContent = "Kopyalandı ✓"; setTimeout(function () { kopyala.textContent = "Kodu kopyala"; }, 1500); };
        if (navigator.clipboard) navigator.clipboard.writeText(i.kod).then(tamam, function () { window.prompt("Kod:", i.kod); });
        else window.prompt("Kod:", i.kod);
      });
      var sil = el("button", "btn", "Tamamlandı, sil");
      sil.type = "button";
      sil.addEventListener("click", function () {
        sil.disabled = true;
        istek("/istek/" + i.kod, "DELETE").then(function (s) {
          if (s.j && s.j.ok) kart.remove(); else { sil.disabled = false; sil.textContent = "Silinemedi, tekrar dene"; }
        });
      });
      btns.appendChild(kopyala);
      btns.appendChild(sil);
      kart.appendChild(btns);
      liste.appendChild(kart);
    });
  }

  function yukle() {
    liste.textContent = "";
    liste.appendChild(el("p", "ince", "Yükleniyor…"));
    return istek("/istekler").then(function (s) {
      if (s.durum === 401) { cikis(); girisDurum.textContent = "Şifre yanlış."; girisDurum.className = "form-durum hata"; return; }
      if (s.durum === 503) { cikis(); girisDurum.textContent = "Sunucudaki şifre (ADMIN_TOKEN) ayarlı değil ya da 16 karakterden kısa. Cloudflare'de en az 16 karakterlik bir şifre koyun."; girisDurum.className = "form-durum hata"; return; }
      if (!s.j || !s.j.ok) { liste.textContent = ""; liste.appendChild(el("p", "form-durum hata", "Liste alınamadı.")); return; }
      giris.hidden = true;
      panel.hidden = false;
      goster(s.j.istekler || []);
    }).catch(function () {
      liste.textContent = "";
      liste.appendChild(el("p", "form-durum hata", "Sunucuya bağlanılamadı."));
    });
  }

  function cikis() {
    sifre = null;
    yazDepo(sessionStorage, null);
    yazDepo(localStorage, null);
    panel.hidden = true;
    giris.hidden = false;
    giris.reset();
  }

  giris.addEventListener("submit", function (e) {
    e.preventDefault();
    sifre = giris.sifre.value;
    if (!sifre) return;
    yazDepo(giris.hatirla.checked ? localStorage : sessionStorage, sifre);
    girisDurum.textContent = "";
    panel.hidden = false;
    yukle();
  });
  document.getElementById("yenile").addEventListener("click", yukle);
  document.getElementById("cikis").addEventListener("click", cikis);

  sifre = oku(sessionStorage) || oku(localStorage);
  if (sifre) { panel.hidden = false; yukle(); }
})();
