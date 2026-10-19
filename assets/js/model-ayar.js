// 3D görüntüleyici ayarı: Draco çözücü sitenin kendi dosyalarından yüklenir (dış sunucuya istek gitmez).
// model-viewer.min.js'ten ÖNCE yüklenmelidir.
self.ModelViewerElement = self.ModelViewerElement || {};
self.ModelViewerElement.dracoDecoderLocation = new URL("../draco/", document.currentScript.src).href;

// Modeldeki hareketler (ör. kapak) için düğmeler.
document.addEventListener("DOMContentLoaded", function () {
  var ADLAR = { Lid: "Kapağı aç", Door: "Kapı", Hood: "Kaput", Trunk: "Bagaj", Wheel: "Tekerlek" };
  document.querySelectorAll("model-viewer[data-hareket]").forEach(function (mv) {
    var bar = document.getElementById(mv.getAttribute("data-hareket"));
    function kur() {
      var list = mv.availableAnimations || [];
      if (!bar || !list.length || bar.childElementCount) return;
      list.forEach(function (n) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn";
        b.textContent = ADLAR[n.replace(/_anim$/, "").split("_")[0]] || n;
        b.addEventListener("click", function () {
          mv.animationName = n;
          mv.currentTime = 0;
          mv.play({ repetitions: 1 });
        });
        bar.appendChild(b);
      });
    }
    mv.addEventListener("load", kur);
    if (mv.loaded) kur();
  });
});
