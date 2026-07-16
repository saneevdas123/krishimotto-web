/* KrishiMotto — shared behaviour */
(function () {
  var root = document.documentElement;
  var KEY = "km-theme";

  // ---- theme ----
  function apply(t) { root.setAttribute("data-theme", t); }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (!saved) {
    saved = (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "day" : "night";
  }
  apply(saved);

  document.addEventListener("click", function (e) {
    var t = e.target.closest("#themeToggle");
    if (!t) return;
    var next = root.getAttribute("data-theme") === "night" ? "day" : "night";
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (er) {}
  });

  // ---- nav shadow ----
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 16); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---- mobile menu ----
  var mm = document.getElementById("mobilemenu");
  var mb = document.getElementById("menuBtn");
  if (mm && mb) {
    mb.addEventListener("click", function () { mm.classList.toggle("open"); });
    mm.addEventListener("click", function (e) { if (e.target.tagName === "A") mm.classList.remove("open"); });
  }

  // ---- scroll reveal ----
  var els = [].slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  } else {
    els.forEach(function (e) { e.classList.add("in"); });
  }

  // ---- year ----
  var y = document.querySelectorAll("[data-year]");
  y.forEach(function (n) { n.textContent = new Date().getFullYear(); });

  // ---- delete account form ----
  var form = document.getElementById("deleteForm");
  if (form) {
    var msg = document.getElementById("formMsg");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phoneRe = /^[0-9]{10}$/;

    function setInvalid(id, bad) {
      var f = document.getElementById(id);
      if (f) f.closest(".field").classList.toggle("invalid", bad);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.className = "form-msg";
      var name = document.getElementById("fullName");
      var email = document.getElementById("email");
      var phone = document.getElementById("phone");
      var confirmText = document.getElementById("confirmText");
      var ack = document.getElementById("ack");
      var ok = true;

      if (!name.value.trim()) { setInvalid("fullName", true); ok = false; } else setInvalid("fullName", false);
      if (!emailRe.test(email.value.trim())) { setInvalid("email", true); ok = false; } else setInvalid("email", false);
      if (!phoneRe.test(phone.value.replace(/\D/g, ""))) { setInvalid("phone", true); ok = false; } else setInvalid("phone", false);
      if (confirmText.value.trim().toUpperCase() !== "DELETE") { setInvalid("confirmText", true); ok = false; } else setInvalid("confirmText", false);

      if (!ack.checked) {
        ok = false;
        msg.textContent = "Please confirm you understand this action is permanent.";
        msg.classList.add("err", "show");
        return;
      }
      if (!ok) {
        msg.textContent = "Please correct the highlighted fields. Type DELETE to confirm.";
        msg.classList.add("err", "show");
        return;
      }

      // No backend in this static demo — acknowledge the request client-side.
      form.style.display = "none";
      msg.innerHTML = "<b>Deletion request received.</b><br>We've logged a request to delete the account for <b>" +
        email.value.trim().replace(/[<>&]/g, "") +
        "</b>. Our team will verify your identity and permanently erase your data within 30 days. " +
        "You'll get a confirmation email once it's complete. To cancel, contact privacy@krishimotto.app before then.";
      msg.classList.add("ok", "show");
      msg.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
