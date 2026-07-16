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

  // ---- scroll progress ----
  var bar = document.getElementById("progress");
  if (bar) {
    var tick = function () {
      var d = document.documentElement;
      var max = d.scrollHeight - d.clientHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    };
    tick();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
  }

  // ---- animated counters ----
  var nums = [].slice.call(document.querySelectorAll("[data-count]"));
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = (el.getAttribute("data-dec") | 0);
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (nums.length) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      nums.forEach(function (el) {
        el.textContent = parseFloat(el.getAttribute("data-count")).toFixed(el.getAttribute("data-dec") | 0) + (el.getAttribute("data-suffix") || "");
      });
    } else {
      var io2 = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); io2.unobserve(e.target); } });
      }, { threshold: 0.5 });
      nums.forEach(function (el) { io2.observe(el); });
    }
  }

  // ---- contact form ----
  var cf = document.getElementById("contactForm");
  if (cf) {
    var cmsg = document.getElementById("contactMsg");
    var btn = document.getElementById("contactBtn");
    var mailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var ENDPOINT = cf.getAttribute("data-endpoint");
    var FALLBACK = cf.getAttribute("data-fallback");

    function bad(id, is) {
      var f = document.getElementById(id);
      if (f) f.closest(".field").classList.toggle("invalid", is);
    }

    cf.addEventListener("submit", function (e) {
      e.preventDefault();
      cmsg.className = "form-msg";

      var name = document.getElementById("cName");
      var email = document.getElementById("cEmail");
      var subject = document.getElementById("cSubject");
      var message = document.getElementById("cMessage");
      var ok = true;

      if (!name.value.trim()) { bad("cName", true); ok = false; } else bad("cName", false);
      if (!mailRe.test(email.value.trim())) { bad("cEmail", true); ok = false; } else bad("cEmail", false);
      if (message.value.trim().length < 10) { bad("cMessage", true); ok = false; } else bad("cMessage", false);

      if (!ok) {
        cmsg.textContent = "Please fill in your name, a valid email, and a message of at least 10 characters.";
        cmsg.classList.add("err", "show");
        return;
      }

      var payload = {
        name: name.value.trim(),
        email: email.value.trim(),
        phone: (document.getElementById("cPhone") || {}).value || "",
        subject: subject.value,
        message: message.value.trim(),
        _subject: "KrishiMotto website enquiry: " + subject.value,
        _template: "table"
      };

      btn.classList.add("is-sending");
      btn.disabled = true;

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { if (!r.ok) throw new Error("bad status " + r.status); return r.json(); })
        .then(function () {
          cf.style.display = "none";
          cmsg.innerHTML = "<b>Thank you — your message is on its way.</b><br>We've sent it to our Managing Director's office and will reply to <b>" +
            payload.email.replace(/[<>&]/g, "") + "</b> as soon as we can.";
          cmsg.classList.add("ok", "show");
          cmsg.scrollIntoView({ behavior: "smooth", block: "center" });
        })
        .catch(function () {
          btn.classList.remove("is-sending");
          btn.disabled = false;
          var body = encodeURIComponent(
            "Name: " + payload.name + "\nEmail: " + payload.email +
            "\nPhone: " + payload.phone + "\n\n" + payload.message
          );
          cmsg.innerHTML = "We couldn't send that automatically. Please email us directly at " +
            "<a href=\"mailto:" + FALLBACK + "?subject=" + encodeURIComponent(payload._subject) + "&body=" + body +
            "\" style=\"color:var(--green2);font-weight:600\">" + FALLBACK + "</a> — this link opens your mail app with the message ready to send.";
          cmsg.classList.add("err", "show");
        });
    });
  }

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
