// "Paylaş" düğmeleri: telefonda paylaşım menüsünü açar, bilgisayarda bağlantıyı kopyalar.
(function () {
  function toast(text) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 2000);
  }

  function copy(url) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(url).then(function () { toast("Bağlantı kopyalandı"); });
    }
    window.prompt("Bağlantıyı kopyalayın:", url);
    return Promise.resolve();
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-share]");
    if (!btn) return;
    e.preventDefault();
    var url = new URL(btn.getAttribute("data-share") || location.href, location.href).href;
    var title = btn.getAttribute("data-title") || document.title;
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {});
    } else {
      copy(url);
    }
  });

  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[aria-disabled="true"]');
    if (!a) return;
    e.preventDefault();
    toast("İndirme bağlantısı yakında eklenecek");
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-print]")) window.print();
  });

  var y = document.getElementById("yil");
  if (y) y.textContent = new Date().getFullYear();
})();
