// /js/app.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (window.Util?.setYear) {
      Util.setYear();
    }
  });
})();