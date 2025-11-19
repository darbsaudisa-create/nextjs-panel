// app/widgets.js/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const js = `
// widgets.js — Darb Widgets
(function () {
  try {
    var script =
      document.currentScript ||
      (function () {
        var scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1];
      })();

    if (!script) return;

    var storeId = script.getAttribute("data-store-id");
    if (!storeId) {
      console.warn("[widgets.js] data-store-id is missing on script tag.");
      return;
    }

    var PANEL_ORIGIN = "";
    try {
      var src = script.getAttribute("src") || "";
      var u = new URL(src, window.location.href);
      PANEL_ORIGIN = u.origin;
    } catch (_) {
      PANEL_ORIGIN = "";
    }

    var STORAGE_PREFIX = "wp_popup_";

    function getOrCreateId(key) {
      try {
        var v = window.localStorage.getItem(key);
        if (v) return v;
        var n = "sess_" + Math.random().toString(36).slice(2);
        window.localStorage.setItem(key, n);
        return n;
      } catch (e) {
        return null;
      }
    }

    var sessionId = getOrCreateId(STORAGE_PREFIX + "session");
    var visitorId = getOrCreateId(STORAGE_PREFIX + "visitor");

    function sendEvent(widget, type, extraMeta) {
      try {
        var url = (PANEL_ORIGIN || "") + "/api/widgets/events";

        var payload = {
          widget_id: widget.id,
          event_type: type,
          session_id: sessionId,
          visitor_id: visitorId,
          page_url: window.location.href,
          meta: extraMeta || {},
        };

        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(function () {});
      } catch (e) {}
    }

    function getTodayKey(widgetId) {
      var d = new Date();
      var day = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      return STORAGE_PREFIX + widgetId + "_day_" + day;
    }

    function getLifetimeKey(widgetId) {
      return STORAGE_PREFIX + widgetId + "_lifetime";
    }

    function shouldSkipByFrequency(widget) {
      var behavior = (widget.config && widget.config.behavior) || {};
      var perDay = behavior.perDay || 0;
      var oncePerVisitor = !!behavior.oncePerVisitor;

      try {
        if (perDay > 0) {
          var dayKey = getTodayKey(widget.id);
          var countStr = window.localStorage.getItem(dayKey);
          var count = countStr ? parseInt(countStr, 10) || 0 : 0;
          if (count >= perDay) return true;
        }
        if (oncePerVisitor) {
          var lifeKey = getLifetimeKey(widget.id);
          if (window.localStorage.getItem(lifeKey) === "1") return true;
        }
      } catch (e) {}

      return false;
    }

    function markShown(widget) {
      var behavior = (widget.config && widget.config.behavior) || {};
      var perDay = behavior.perDay || 0;
      var oncePerVisitor = !!behavior.oncePerVisitor;

      try {
        if (perDay > 0) {
          var dayKey = getTodayKey(widget.id);
          var countStr = window.localStorage.getItem(dayKey);
          var count = countStr ? parseInt(countStr, 10) || 0 : 0;
          window.localStorage.setItem(dayKey, String(count + 1));
        }
        if (oncePerVisitor) {
          var lifeKey = getLifetimeKey(widget.id);
          window.localStorage.setItem(lifeKey, "1");
        }
      } catch (e) {}
    }

    function matchesPlacement(widget) {
      var cfg = widget.config || {};
      var placementCfg = cfg.placement || {};
      var mode = placementCfg.mode || "all";

      if (mode === "all") return true;

      if (mode === "path") {
        var path = placementCfg.path || "";
        if (!path) return true;
        try {
          return window.location.pathname.indexOf(path) === 0;
        } catch (_) {
          return true;
        }
      }

      var legacy = widget.placement || "";
      if (!legacy || legacy === "all_pages") return true;
      return true;
    }

    // ============= STYLE VARIANTS FOR SALE POPUP =============
    function applyClassicStyle(box, content) {
      box.style.background = "#ffffff";
      box.style.borderRadius = "16px";
      box.style.boxShadow = "0 25px 60px rgba(15,23,42,0.4)";
      box.style.border = "none";
      content.style.textAlign = "center";
      content.style.color = "#111827";
    }

    function applyLuxuryStyle(box, content) {
      box.style.background =
        "linear-gradient(135deg,#020617,#020617 20%,#111827 60%,#020617)";
      box.style.borderRadius = "20px";
      box.style.boxShadow = "0 40px 90px rgba(15,23,42,0.95)";
      box.style.border = "1px solid rgba(148,163,184,0.5)";
      content.style.textAlign = "center";
      content.style.color = "#e5e7eb";
    }

    function applyPremiumStyle(box, content) {
      box.style.background = "#f9fafb";
      box.style.borderRadius = "18px";
      box.style.boxShadow = "0 20px 50px rgba(15,23,42,0.35)";
      box.style.border = "1px solid #e5e7eb";
      content.style.textAlign = "left";
      content.style.color = "#111827";
    }

    function applyGenZStyle(box, content) {
      box.style.background =
        "radial-gradient(circle at top,#f1fe2b,#f97316 45%,#111827 100%)";
      box.style.borderRadius = "24px";
      box.style.boxShadow = "0 35px 110px rgba(15,23,42,0.95)";
      box.style.border = "1px solid rgba(15,23,42,0.9)";
      content.style.textAlign = "center";
      content.style.color = "#020617";
    }

    // ================== SALE POPUP ==================
    function buildSalePopupDOM(widget) {
      var cfg = widget.config || {};
      var styleVariant = cfg.style || "classic";

      var heading = cfg.heading || "";
      var body = cfg.body || "";
      var buttonLabel = cfg.buttonLabel || "";
      var buttonUrl = cfg.buttonUrl || "#";
      var buttonColor = cfg.buttonColor || "#DC2626";
      var imageUrl = cfg.imageUrl || "";
      var couponCfg = cfg.coupon || {};
      var counterCfg = cfg.counter || {};
      var headingBlock = cfg.headingBlock || { enabled: true };
      var bodyBlock = cfg.bodyBlock || { enabled: true };
      var imageBlock = cfg.imageBlock || { enabled: true };
      var buttonBlock = cfg.buttonBlock || { enabled: true };

      var overlay = document.createElement("div");
      overlay.setAttribute("data-widgets-popup-id", widget.id);
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.background = "rgba(15,23,42,0.85)";
      overlay.style.zIndex = "999999";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";

      var box = document.createElement("div");
      box.style.width = "min(90vw, 480px)";
      box.style.overflow = "hidden";
      box.style.position = "relative";
      box.style.fontFamily =
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

      var closeBtn = document.createElement("button");
      closeBtn.innerHTML = "&times;";
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "8px";
      closeBtn.style.left = "8px";
      closeBtn.style.width = "32px";
      closeBtn.style.height = "32px";
      closeBtn.style.borderRadius = "999px";
      closeBtn.style.border = "none";
      closeBtn.style.background = "rgba(15,23,42,0.06)";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.fontSize = "18px";
      closeBtn.style.lineHeight = "32px";

      closeBtn.onclick = function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        sendEvent(widget, "close");
      };

      box.appendChild(closeBtn);

      if (imageBlock.enabled && imageUrl) {
        var imgWrap = document.createElement("div");
        imgWrap.style.height = "220px";
        imgWrap.style.background = "#e5e7eb";
        var img = document.createElement("img");
        img.src = imageUrl;
        img.alt = "";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        imgWrap.appendChild(img);
        box.appendChild(imgWrap);
      }

      var content = document.createElement("div");
      content.style.padding = "16px 20px 20px";

      if (styleVariant === "classic") {
        applyClassicStyle(box, content);
      } else if (styleVariant === "luxury") {
        applyLuxuryStyle(box, content);
      } else if (styleVariant === "premium") {
        applyPremiumStyle(box, content);
      } else if (styleVariant === "genz") {
        applyGenZStyle(box, content);
      } else {
        applyClassicStyle(box, content);
      }

      if (headingBlock.enabled && heading) {
        var h = document.createElement("h2");
        h.textContent = heading;
        h.style.fontSize = "18px";
        h.style.fontWeight = "700";
        h.style.margin = "0 0 8px";
        content.appendChild(h);
      }

      if (bodyBlock.enabled && body) {
        var p = document.createElement("p");
        p.textContent = body;
        p.style.fontSize = "14px";
        p.style.margin = "0 0 16px";
        p.style.color = "#4b5563";
        content.appendChild(p);
      }

      if (counterCfg.enabled && counterCfg.target != null) {
        var counterWrap = document.createElement("div");
        counterWrap.style.marginBottom = "12px";

        var counterSpan = document.createElement("div");
        counterSpan.style.fontSize = "24px";
        counterSpan.style.fontWeight = "800";
        counterSpan.style.letterSpacing = "0.03em";
        counterSpan.style.fontVariantNumeric = "tabular-nums";
        counterSpan.textContent = "0";

        counterWrap.appendChild(counterSpan);

        var targetVal = Number(counterCfg.target || 0);

        (function animateCounter(el, to, duration) {
          var start = 0;
          var startTime = Date.now();
          function tick() {
            var now = Date.now();
            var progress = Math.min(1, (now - startTime) / (duration || 1500));
            var eased =
              progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            var val = Math.floor(start + (to - start) * eased);
            el.textContent = val.toLocaleString("en-US");
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        })(counterSpan, targetVal, 1500);

        if (counterCfg.label) {
          var counterLabel = document.createElement("div");
          counterLabel.textContent = counterCfg.label;
          counterLabel.style.fontSize = "11px";
          counterLabel.style.color = "#6b7283";
          counterLabel.style.marginTop = "2px";
          counterLabel.style.whiteSpace = "pre-line";
          counterLabel.style.lineHeight = "1.4";
          counterWrap.appendChild(counterLabel);
        }

        content.appendChild(counterWrap);
      }

      if (buttonBlock.enabled && buttonLabel) {
        var btn = document.createElement("a");
        btn.textContent = buttonLabel;
        btn.href = buttonUrl || "#";
        btn.style.display = "inline-flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.style.fontSize = "14px";
        btn.style.fontWeight = "600";
        btn.style.borderRadius = "999px";
        btn.style.padding = "10px 24px";
        btn.style.color = "#ffffff";
        btn.style.textDecoration = "none";
        btn.style.background = buttonColor;
        btn.onclick = function (e) {
          sendEvent(widget, "click", { href: buttonUrl });
          if (!buttonUrl || buttonUrl === "#") {
            e.preventDefault();
          }
        };
        content.appendChild(btn);
      }

      if (couponCfg.enabled && couponCfg.code) {
        var couponWrap = document.createElement("div");
        couponWrap.style.marginTop = "10px";
        couponWrap.style.display = "flex";
        couponWrap.style.justifyContent = "center";
        couponWrap.style.alignItems = "center";
        couponWrap.style.gap = "6px";

        var couponCode = document.createElement("span");
        couponCode.textContent = couponCfg.code;
        couponCode.style.display = "inline-flex";
        couponCode.style.padding = "6px 12px";
        couponCode.style.borderRadius = "999px";
        couponCode.style.background = "#f3f4f6";
        couponCode.style.fontFamily = "monospace";
        couponCode.style.fontSize = "12px";
        couponCode.style.color = "#111827";

        var copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.textContent = "نسخ";
        copyBtn.style.border = "none";
        copyBtn.style.borderRadius = "999px";
        copyBtn.style.padding = "6px 10px";
        copyBtn.style.fontSize = "11px";
        copyBtn.style.fontWeight = "600";
        copyBtn.style.cursor = "pointer";
        copyBtn.style.background = "#111827";
        copyBtn.style.color = "#f9fafb";

        copyBtn.onclick = function () {
          var code = couponCfg.code || "";
          if (!code) return;

          var done = false;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
              .writeText(code)
              .then(function () {
                done = true;
              })
              .catch(function () {});
          }
          if (!done) {
            try {
              var temp = document.createElement("textarea");
              temp.value = code;
              temp.style.position = "fixed";
              temp.style.opacity = "0";
              document.body.appendChild(temp);
              temp.focus();
              temp.select();
              document.execCommand("copy");
              document.body.removeChild(temp);
            } catch (e) {}
          }

          copyBtn.textContent = "تم النسخ ✅";
          setTimeout(function () {
            copyBtn.textContent = "نسخ";
          }, 1500);

          sendEvent(widget, "coupon_copy", { code: code });
        };

        couponWrap.appendChild(couponCode);
        couponWrap.appendChild(copyBtn);
        content.appendChild(couponWrap);
      }

      box.appendChild(content);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }

    // ================== GRAND LAUNCH POPUP (FORM) ==================
    function buildGrandLaunchPopupDOM(widget) {
      var cfg = widget.config || {};
      var badgeText = cfg.badgeText || "افتتاح ضخم";
      var titleText =
        cfg.titleText || "انتظرونا… سيتم افتتاح المتجر قريبًا";
      var subText =
        cfg.subText ||
        "نجهّز تجربة تسوّق مختلفة، بأسعار قوية وخدمة أسرع.";
      var buttonText = cfg.buttonText || "نبّهني عند الافتتاح";
      var targetCount = cfg.targetCount || 0;
      var formCfg = cfg.form || {};
      var nameField = formCfg.name || { enabled: true, required: true };
      var phoneField = formCfg.phone || { enabled: true, required: true };
      var emailField = formCfg.email || { enabled: false, required: false };
      var submitLabel = formCfg.submitLabel || "إرسال البيانات";

      var overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.zIndex = "999999";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.background =
        "radial-gradient(circle at top,#020617,#020617 45%,#000000 100%)";

      var glow = document.createElement("div");
      glow.style.position = "absolute";
      glow.style.inset = "0";
      glow.style.pointerEvents = "none";
      glow.style.background =
        "radial-gradient(circle at top,#facc1533,#f9731633,transparent 60%)";
      overlay.appendChild(glow);

      var box = document.createElement("div");
      box.style.width = "min(96vw, 760px)";
      box.style.background =
        "linear-gradient(145deg,#020617,#020617 40%,#111827 75%,#020617)";
      box.style.borderRadius = "28px";
      box.style.position = "relative";
      box.style.color = "#e5e7eb";
      box.style.padding = "22px 20px 20px";
      box.style.boxShadow =
        "0 40px 120px rgba(0,0,0,0.95), 0 0 0 1px rgba(148,163,184,0.4)";
      box.style.fontFamily =
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      box.style.overflow = "hidden";

      var innerBorder = document.createElement("div");
      innerBorder.style.position = "absolute";
      innerBorder.style.inset = "1px";
      innerBorder.style.borderRadius = "26px";
      innerBorder.style.border =
        "1px solid rgba(250,204,21,0.45)";
      innerBorder.style.pointerEvents = "none";
      box.appendChild(innerBorder);

      var stripe = document.createElement("div");
      stripe.style.position = "absolute";
      stripe.style.top = "0";
      stripe.style.left = "-20%";
      stripe.style.width = "60%";
      stripe.style.height = "120px";
      stripe.style.background =
        "linear-gradient(115deg,transparent,rgba(250,204,21,0.22),transparent)";
      stripe.style.transform = "translateY(0)";
      stripe.style.pointerEvents = "none";
      box.appendChild(stripe);

      var closeBtn = document.createElement("button");
      closeBtn.innerHTML = "&times;";
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "12px";
      closeBtn.style.left = "12px";
      closeBtn.style.width = "32px";
      closeBtn.style.height = "32px";
      closeBtn.style.borderRadius = "999px";
      closeBtn.style.border = "1px solid rgba(148,163,184,.5)";
      closeBtn.style.background = "rgba(15,23,42,.85)";
      closeBtn.style.color = "#e5e7eb";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.fontSize = "18px";
      closeBtn.style.lineHeight = "30px";
      closeBtn.style.zIndex = "2";
      closeBtn.onclick = function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        sendEvent(widget, "close");
      };

      box.appendChild(closeBtn);

      var contentWrap = document.createElement("div");
      contentWrap.style.position = "relative";
      contentWrap.style.zIndex = "1";
      contentWrap.style.display = "grid";
      contentWrap.style.gridTemplateColumns = "minmax(0,2fr) minmax(0,1.4fr)";
      contentWrap.style.gap = "18px";
      contentWrap.style.alignItems = "flex-start";

      var leftCol = document.createElement("div");

      var badge = document.createElement("div");
      badge.textContent = badgeText;
      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      badge.style.padding = "6px 14px";
      badge.style.borderRadius = "999px";
      badge.style.fontSize = "11px";
      badge.style.fontWeight = "800";
      badge.style.background =
        "linear-gradient(90deg,#facc15,#f97316,#facc15)";
      badge.style.color = "#1f2933";
      badge.style.boxShadow =
        "0 0 30px rgba(234,179,8,0.55), 0 0 0 1px rgba(161,98,7,0.85)";
      badge.style.letterSpacing = "0.08em";
      badge.style.textTransform = "uppercase";
      leftCol.appendChild(badge);

      var title = document.createElement("h2");
      title.textContent = titleText;
      title.style.marginTop = "12px";
      title.style.fontSize = "24px";
      title.style.fontWeight = "900";
      title.style.letterSpacing = "0.02em";
      title.style.color = "#f9fafb";
      leftCol.appendChild(title);

      var sub = document.createElement("p");
      sub.textContent = subText;
      sub.style.marginTop = "6px";
      sub.style.fontSize = "13px";
      sub.style.color = "#cbd5f5";
      sub.style.maxWidth = "420px";
      leftCol.appendChild(sub);

      var countWrap = document.createElement("div");
      countWrap.style.marginTop = "16px";
      countWrap.style.display = "flex";
      countWrap.style.alignItems = "baseline";
      countWrap.style.gap = "10px";

      var countSpan = document.createElement("div");
      countSpan.style.fontSize = "30px";
      countSpan.style.fontWeight = "900";
      countSpan.style.fontVariantNumeric = "tabular-nums";
      countSpan.style.color = "#feeaa5";
      countSpan.textContent = "0";

      var countLbl = document.createElement("div");
      countLbl.textContent = "+ منتج جاهز للانطلاق";
      countLbl.style.fontSize = "12px";
      countLbl.style.color = "#fde68a";

      countWrap.appendChild(countSpan);
      countWrap.appendChild(countLbl);
      leftCol.appendChild(countWrap);

      if (targetCount > 0) {
        (function animateCounter(el, to, duration) {
          var start = 0;
          var startTime = Date.now();
          function tick() {
            var now = Date.now();
            var progress = Math.min(1, (now - startTime) / (duration || 1800));
            var val = Math.floor(start + (to - start) * progress);
            el.textContent = val.toLocaleString("ar-SA");
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        })(countSpan, targetCount, 1700);
      }

      var miniNote = document.createElement("div");
      miniNote.textContent =
        "سجّل بياناتك عشان نرسلك رابط المتجر والعروض الخاصة بأول الافتتاح.";
      miniNote.style.marginTop = "8px";
      miniNote.style.fontSize = "11px";
      miniNote.style.color = "#9ca3af";
      leftCol.appendChild(miniNote);

      var rightCol = document.createElement("div");
      rightCol.style.background =
        "radial-gradient(circle at top,#0b1120,#020617 60%)";
      rightCol.style.borderRadius = "20px";
      rightCol.style.padding = "14px 14px 12px";
      rightCol.style.boxShadow =
        "0 18px 45px rgba(15,23,42,0.8), 0 0 0 1px rgba(30,64,175,0.5)";

      var formTitle = document.createElement("div");
      formTitle.textContent = buttonText;
      formTitle.style.fontSize = "13px";
      formTitle.style.fontWeight = "700";
      formTitle.style.marginBottom = "6px";
      formTitle.style.display = "flex";
      formTitle.style.alignItems = "center";
      formTitle.style.gap = "6px";

      var dot = document.createElement("span");
      dot.textContent = "●";
      dot.style.color = "#22c55e";
      dot.style.fontSize = "10px";
      formTitle.appendChild(dot);

      rightCol.appendChild(formTitle);

      var form = document.createElement("form");
      form.style.marginTop = "4px";
      form.style.display = "flex";
      form.style.flexWrap = "wrap";
      form.style.gap = "8px";

      function makeInput(labelText, placeholder, type, width) {
        var wrap = document.createElement("div");
        wrap.style.flex = width || "1 1 160px";
        var label = document.createElement("label");
        label.textContent = labelText;
        label.style.display = "block";
        label.style.fontSize = "11px";
        label.style.marginBottom = "3px";
        label.style.color = "#e5e7eb";
        var input = document.createElement("input");
        input.type = type || "text";
        input.placeholder = placeholder || "";
        input.style.width = "100%";
        input.style.borderRadius = "999px";
        input.style.border = "1px solid rgba(148,163,184,.7)";
        input.style.background = "rgba(15,23,42,.9)";
        input.style.color = "#e5e7eb";
        input.style.fontSize = "12px";
        input.style.padding = "8px 12px";
        input.style.outline = "none";
        wrap.appendChild(label);
        wrap.appendChild(input);
        return { wrap: wrap, input: input };
      }

      var nameInput = null;
      var phoneInput = null;
      var emailInput = null;

      if (nameField.enabled) {
        var r = makeInput("الاسم", "مثال: محمد", "text");
        nameInput = r.input;
        form.appendChild(r.wrap);
      }

      if (phoneField.enabled) {
        var r2 = makeInput("رقم الجوال", "05XXXXXXXX", "tel");
        phoneInput = r2.input;
        form.appendChild(r2.wrap);
      }

      if (emailField.enabled) {
        var r3 = makeInput("الإيميل (اختياري)", "example@mail.com", "email");
        emailInput = r3.input;
        form.appendChild(r3.wrap);
      }

      var submitBtn = document.createElement("button");
      submitBtn.type = "submit";
      submitBtn.textContent = submitLabel;
      submitBtn.style.flex = "1 1 100%";
      submitBtn.style.borderRadius = "999px";
      submitBtn.style.border = "none";
      submitBtn.style.background =
        "linear-gradient(90deg,#facc15,#f97316,#facc15)";
      submitBtn.style.color = "#1f2937";
      submitBtn.style.fontSize = "13px";
      submitBtn.style.fontWeight = "800";
      submitBtn.style.padding = "9px 14px";
      submitBtn.style.cursor = "pointer";
      submitBtn.style.marginTop = "2px";
      submitBtn.style.boxShadow =
        "0 10px 30px rgba(250,204,21,0.55)";

      form.appendChild(submitBtn);

      var msg = document.createElement("div");
      msg.style.marginTop = "6px";
      msg.style.fontSize = "11px";
      msg.style.minHeight = "16px";

      form.onsubmit = function (e) {
        e.preventDefault();
        msg.textContent = "";
        msg.style.color = "#f97316";

        var nameVal = nameInput ? nameInput.value.trim() : "";
        var phoneVal = phoneInput ? phoneInput.value.trim() : "";
        var emailVal = emailInput ? emailInput.value.trim() : "";

        if (nameField.enabled && nameField.required && !nameVal) {
          msg.textContent = "فضلاً أدخل اسمك.";
          return;
        }
        if (phoneField.enabled && phoneField.required && !phoneVal) {
          msg.textContent = "فضلاً أدخل رقم الجوال.";
          return;
        }
        if (emailField.enabled && emailField.required && !emailVal) {
          msg.textContent = "فضلاً أدخل الإيميل.";
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "جاري الإرسال...";

        var url = (PANEL_ORIGIN || "") + "/api/widgets/leads";

        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            widget_id: widget.id,
            store_id: widget.store_id || "",
            name: nameVal || null,
            phone: phoneVal || null,
            email: emailVal || null,
            page_url: window.location.href,
          }),
        })
          .then(function (res) {
            return res.json().catch(function () {
              return {};
            });
          })
          .then(function (data) {
            if (data && data.ok) {
              msg.textContent = "تم استلام بياناتك بنجاح ✅";
              msg.style.color = "#22c55e";
              sendEvent(widget, "lead_submit");
            } else {
              msg.textContent = "تعذر حفظ البيانات، حاول مرة أخرى.";
              msg.style.color = "#f87171";
            }
          })
          .catch(function () {
            msg.textContent = "تعذر حفظ البيانات، حاول مرة أخرى.";
            msg.style.color = "#f87171";
          })
          .finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = submitLabel;
          });
      };

      rightCol.appendChild(form);
      rightCol.appendChild(msg);

      contentWrap.appendChild(leftCol);
      contentWrap.appendChild(rightCol);

      box.appendChild(contentWrap);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }

    // ========== تحميل مكتبة Choices (CSS + JS) ==========
    function ensureChoicesAssets() {
      return new Promise(function (resolve) {
        if (window.Choices) return resolve();

        if (!document.querySelector('link[data-widgets-choices-css="1"]')) {
          var link = document.createElement("link");
          link.rel = "stylesheet";
          link.href =
            "https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css";
          link.setAttribute("data-widgets-choices-css", "1");
          document.head.appendChild(link);
        }

        if (!document.querySelector('script[data-widgets-choices-js="1"]')) {
          var s = document.createElement("script");
          s.src =
            "https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js";
          s.async = true;
          s.defer = true;
          s.setAttribute("data-widgets-choices-js", "1");
          document.head.appendChild(s);
        }

        (function waitChoices() {
          if (window.Choices) return resolve();
          setTimeout(waitChoices, 50);
        })();
      });
    }

    // ================== FILTER HERO WIDGET (Supabase + Firestore) ==================
    function buildFilterHeroDom(widget) {
      (async function () {
        await ensureChoicesAssets();

        var cfg = widget.config || {};
        var heroCfg = cfg.hero || {};
        var placementCfg = cfg.filterPlacement || cfg.placement || {};
        var fsCfg = cfg.firestore || {};
        var searchCfg = cfg.search || {};

        var heroTitle = heroCfg.title || "ابحث عن قطع غيار سيارتك";
        var heroSubtitle =
          heroCfg.subtitle ||
          "ابحث بين 180,000+ قطعة غيار لجميع سيارات تويوتا الأصلية واليابانية والتجارية";
        var bgImage = heroCfg.backgroundImageUrl || "";
        var counterTarget = heroCfg.counterTarget || 180000;

        var placeMode = placementCfg.mode || "under_header";
        var placeSelector = placementCfg.selector || "header";

        function getMountPoint() {
          var host = null;
          try {
            if (placeSelector) {
              host = document.querySelector(placeSelector);
            }
          } catch (_) {}
          if (!host) return document.body;
          return host;
        }

        var wrap = document.createElement("div");
        wrap.className = "widgets-filter-hero-wrap";

        var html = '\\
    <div class="hero-section widgets-filter-hero">\\
      <div class="hero-bg-img" style="' +
          (bgImage
            ? "background-image:url(" +
              bgImage.replace(/"/g, '\\"') +
              ");"
            : "") +
          '"></div>\\
      <div id="custom-filter-hero">\\
        <div class="hero-title-filter">\\
          <div class="hero-filter-head">' +
          heroTitle.replace(/</g, "&lt;") +
          '</div>\\
          <div class="hero-filter-desc">\\
            ' +
          heroSubtitle.replace(/</g, "&lt;") +
          ' <br>\\
            <span style="color:#2563eb;font-weight:600;">شحن سريع خلال 3-4 أيام</span> وسعر منافس جداً <span class="emoji-bounce">🚚</span><span class="emoji-bounce">🔥</span>\\
          </div>\\
        </div>\\
        <div class="X1">\\
          <div class="hero-filters-wrapper">\\
            <form id="filters-form" onsubmit="return false;" dir="rtl" class="hero-filters-form">\\
              <select id="company"></select>\\
              <select id="category" disabled></select>\\
              <select id="model" disabled></select>\\
              <select id="section" disabled></select>\\
              <select id="parts" multiple disabled></select>\\
              <button id="filter-btn" type="button" class="hero-search-btn">\\
                بحث <span style="font-size:18px;vertical-align:middle;">&#8594;</span>\\
              </button>\\
            </form>\\
          </div>\\
        </div>\\
      </div>\\
    </div>';

        wrap.innerHTML = html;

        var host = getMountPoint();
        if (host === document.body) {
          document.body.insertBefore(wrap, document.body.firstChild);
        } else {
          if (placeMode === "under_header" || placeMode === "after_element") {
            if (host.parentNode) {
              host.parentNode.insertBefore(wrap, host.nextSibling);
            } else host.appendChild(wrap);
          } else {
            if (host.parentNode) host.parentNode.insertBefore(wrap, host);
            else host.appendChild(wrap);
          }
        }

        var steps = ["01", "02", "03", "04", "05"];
        wrap.querySelectorAll(".hero-filters-form select").forEach(function (
          el,
          idx
        ) {
          if (steps[idx]) {
            var holder = document.createElement("div");
            holder.className = "select-with-step";
            var label = document.createElement("span");
            label.className = "step-label";
            label.textContent = steps[idx];
            holder.appendChild(label);
            el.parentNode.insertBefore(holder, el);
            holder.appendChild(el);
          }
        });

        var company = wrap.querySelector("#company");
        var category = wrap.querySelector("#category");
        var model = wrap.querySelector("#model");
        var section = wrap.querySelector("#section");
        var parts = wrap.querySelector("#parts");

        var projectId = fsCfg.projectId || "spare-parts-project-55319";
        var apiKey = fsCfg.apiKey || "AIzaSyB0qGrqutUtkFHKnyy7F73kykiDfcQhsDc";
        var metaDoc = fsCfg.metaDoc || "SECTION_OPTIONS";

        function decodeValue(v) {
          if (!v || typeof v !== "object") return v;
          if ("arrayValue" in v) {
            var arr = v.arrayValue.values || [];
            return arr.map(decodeValue);
          }
          if ("mapValue" in v) {
            var out = {};
            var fields = v.mapValue.fields || {};
            for (var k in fields) out[k] = decodeValue(fields[k]);
            return out;
          }
          if ("stringValue" in v) return v.stringValue;
          if ("integerValue" in v) return parseInt(v.integerValue, 10);
          if ("doubleValue" in v) return v.doubleValue;
          if ("booleanValue" in v) return v.booleanValue;
          if ("nullValue" in v) return null;
          return null;
        }

        async function getMetaDoc(name) {
          var url =
            "https://firestore.googleapis.com/v1/projects/" +
            projectId +
            "/databases/(default)/documents/meta/" +
            name +
            "?key=" +
            apiKey;
          var res = await fetch(url);
          if (!res.ok) throw new Error(await res.text());
          var data = await res.json();
          return decodeValue(data.fields.value);
        }

        var CATEGORIES = [];
        var SECTION_TREE = {};
        try {
          var tree = await getMetaDoc(metaDoc);
          SECTION_TREE =
            tree && typeof tree === "object"
              ? tree
              : {};

          var cats = [];
          var entries = Object.entries(SECTION_TREE);
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var compKey = entry[0];
            var compNode = entry[1];
            if (!compNode || !compNode._meta) continue;
            var m = compNode._meta;
            var compObj = {
              id: m.id,
              name: m.name,
              slug: (m.slug || "").trim(),
              children: [],
            };

            var order = Array.isArray(m.carOrder) ? m.carOrder.slice() : [];
            var mapCarKeys = Object.keys(compNode).filter(function (k) {
              return k !== "_meta";
            });
            mapCarKeys.forEach(function (k) {
              if (order.indexOf(k) === -1) order.push(k);
            });

            for (var j = 0; j < order.length; j++) {
              var carKey = order[j];
              var carNode = compNode[carKey];
              if (!carNode || !carNode._meta) continue;
              var cm = carNode._meta;
              var carObj = {
                id: cm.id,
                name: cm.name,
                slug: (cm.slug || "").trim(),
                children: [],
              };
              var yearsArr = Array.isArray(carNode.years)
                ? carNode.years
                : [];
              yearsArr.forEach(function (yr) {
                if (!yr || !yr.id) return;
                carObj.children.push({
                  id: yr.id,
                  name: yr.name,
                  slug: yr.slug,
                });
              });
              carObj.__compKey = compKey;
              carObj.__carKey = carKey;
              compObj.children.push(carObj);
            }

            cats.push(compObj);
          }

          CATEGORIES = cats;
        } catch (e) {
          console.error("خطأ في تحميل/بناء الشجرة:", e);
          return;
        }

        var INDEX = new Map();
        (function indexTree(nodes, parentId) {
          if (parentId === void 0) parentId = "";
          (nodes || []).forEach(function (n) {
            INDEX.set(n.id, n);
            if (!Array.isArray(n.children)) n.children = [];
            n.__parentId = parentId || "";
            if (n.children.length) indexTree(n.children, n.id);
          });
        })(CATEGORIES);

        function getNode(id) {
          return INDEX.get(id) || null;
        }

        function getRawCarNodeByCategoryId(categoryId) {
          var carNode = getNode(categoryId);
          if (!carNode || !carNode.__compKey || !carNode.__carKey) return null;
          var compNode = SECTION_TREE[carNode.__compKey];
          if (!compNode) return null;
          var rawCar = compNode[carNode.__carKey];
          return rawCar && rawCar._meta ? rawCar : null;
        }

        function getSectionsOfSelectedCar(categoryId) {
          var rawCar = getRawCarNodeByCategoryId(categoryId);
          var secs = Array.isArray(rawCar && rawCar.sections)
            ? rawCar.sections
            : [];
          return secs.map(function (s) {
            return {
              id: s.id,
              slug: s.slug,
              name: s.name,
              options: Array.isArray(s.options) ? s.options.slice() : [],
            };
          });
        }

        // دالة عامة لتهيئة السيلكتات الأحادية
        function setSelectChoices(selectEl, list, placeholder, preselected) {
          if (list === void 0) list = [];
          if (placeholder === void 0) placeholder = "اختر";
          if (preselected === void 0) preselected = "";
          if (!selectEl) return;
          if (selectEl.choices && selectEl.choices.clearStore) {
            selectEl.choices.clearStore();
          }
          var base = [
            {
              value: "",
              label: placeholder,
              selected: !preselected,
            },
          ];
          var mapped = list.map(function (x) {
            return {
              value: x.id,
              label: x.name,
              selected: preselected == x.id,
            };
          });
          var all = base.concat(mapped);

          if (!selectEl.choices) {
            selectEl.choices = new Choices(selectEl, {
              searchEnabled: true,
              shouldSort: false,
              itemSelectText: "اختر",
              noResultsText: "لا توجد نتائج",
              placeholderValue: placeholder,
            });
          }
          selectEl.choices.setChoices(all, "value", "label", true);
          if (preselected) selectEl.choices.setChoiceByValue(preselected);
        }

        function setCompanyOptions(preselected) {
          if (preselected === void 0) preselected = "";
          setSelectChoices(company, CATEGORIES, "اختر الشركة", preselected);
        }
        function setCategoryOptionsByCompany(companyId, preselected) {
          if (preselected === void 0) preselected = "";
          var node = getNode(companyId);
          var children = (node && node.children) || [];
          setSelectChoices(category, children, "اختر السيارة", preselected);
        }
        function setModelOptionsByCategory(categoryId, preselected) {
          if (preselected === void 0) preselected = "";
          var node = getNode(categoryId);
          var children = (node && node.children) || [];
          setSelectChoices(model, children, "اختر السنة", preselected);
        }
        function setSectionOptionsByCategory(categoryId, preselected) {
          if (preselected === void 0) preselected = "";
          var sections = categoryId ? getSectionsOfSelectedCar(categoryId) : [];
          setSelectChoices(section, sections, "اختر التصنيف", preselected);
          return sections;
        }

        function setPartsBySection(categoryId, sectionId) {
          var sections = getSectionsOfSelectedCar(categoryId);
          var sec = sections.find(function (s) {
            return String(s.id) === String(sectionId);
          });
          var opts = sec ? sec.options || [] : [];
          parts.innerHTML = "";
          opts.forEach(function (opt) {
            var o = document.createElement("option");
            o.value = opt;
            o.textContent = opt;
            parts.appendChild(o);
          });
          if (opts.length) {
            parts.disabled = false;
            if (parts.choices) {
              parts.choices.destroy();
            }
            parts.choices = new Choices(parts, {
              removeItemButton: true,
              maxItemCount: searchCfg.maxParts || 5,
              placeholder: true,
              placeholderValue: "بحث أو اختيار القطع...",
              searchPlaceholderValue: "بحث عن القطعة...",
              shouldSort: false,
              searchEnabled: true,
              noResultsText: "لا توجد نتائج",
              itemSelectText: "اختر",
              maxItemText: function (count) {
                return "المسموح باختيار " + count + " قطع فقط";
              },
            });
          } else {
            parts.disabled = true;
            if (parts.choices) parts.choices.disable();
          }
        }

        // ما نعيد تهيئة Choices هنا، نعتمد على setSelectChoices فقط
        setCompanyOptions();
        setCategoryOptionsByCompany("");
        setModelOptionsByCategory("");
        setSectionOptionsByCategory("");

        // 6) أحداث التغيير
        company.addEventListener("change", function () {
          if (!company.value) {
            setCategoryOptionsByCompany("");
            category.disabled = true;
            category.choices && category.choices.disable();
            setModelOptionsByCategory("");
            model.disabled = true;
            model.choices && model.choices.disable();
            setSectionOptionsByCategory("");
            section.disabled = true;
            section.choices && section.choices.disable();
            parts.disabled = true;
            if (parts.choices) parts.choices.disable();
            return;
          }
          setCategoryOptionsByCompany(company.value);
          var hasCats =
            !!(getNode(company.value) &&
              getNode(company.value).children &&
              getNode(company.value).children.length);
          category.disabled = !hasCats;
          if (category.choices) {
            category.choices[category.disabled ? "disable" : "enable"]();
          }

          setModelOptionsByCategory("");
          model.disabled = true;
          model.choices && model.choices.disable();

          setSectionOptionsByCategory("");
          section.disabled = true;
          section.choices && section.choices.disable();

          parts.disabled = true;
          if (parts.choices) parts.choices.disable();
        });

        category.addEventListener("change", function () {
          setModelOptionsByCategory(category.value);
          var node = getNode(category.value);
          var hasMods = !!(node && node.children && node.children.length);
          model.disabled = !hasMods;
          if (model.choices) {
            model.choices[model.disabled ? "disable" : "enable"]();
          }

          setSectionOptionsByCategory(category.value);
          var hasSecs = getSectionsOfSelectedCar(category.value).length > 0;
          section.disabled = !hasSecs;
          if (section.choices) {
            section.choices[section.disabled ? "disable" : "enable"]();
          }

          parts.disabled = true;
          if (parts.choices) parts.choices.disable();
        });

        model.addEventListener("change", function () {
          var hasSecs = getSectionsOfSelectedCar(category.value).length > 0;
          section.disabled = !hasSecs;
          if (section.choices) {
            section.choices[section.disabled ? "disable" : "enable"]();
          }
          parts.disabled = true;
          if (parts.choices) parts.choices.disable();
        });

        section.addEventListener("change", function () {
          setPartsBySection(category.value, section.value);
        });

        // تهيئة أولية للـ parts (حتى لو فاضية)
        parts.choices = new Choices(parts, {
          removeItemButton: true,
          maxItemCount: searchCfg.maxParts || 5,
          placeholder: true,
          placeholderValue: "بحث أو اختيار القطع...",
          searchPlaceholderValue: "بحث عن القطعة...",
          shouldSort: false,
          searchEnabled: true,
          noResultsText: "لا توجد نتائج",
          itemSelectText: "اختر",
          maxItemText: function (count) {
            return "المسموح باختيار " + count + " قطع فقط";
          },
        });
        parts.disabled = true;

        // 7) بناء الرابط
        wrap.querySelector("#filter-btn").onclick = function () {
          var companyId = company.value;
          var categoryId = category.value;
          var modelId = model.value;
          var sectionId = section.value;

          if (!companyId || !categoryId || !modelId || !sectionId) {
            alert("حدد كل الفلاتر أولاً");
            return;
          }

          var categoryObj = getNode(categoryId);
          var carSlug = (categoryObj && categoryObj.slug || "").trim();
          if (!carSlug) {
            alert("Slug السيارة غير موجود في _meta.");
            return;
          }

          var baseDomain =
            searchCfg.targetDomain || "https://darb.com.sa";

          var url =
            baseDomain +
            "/category/" +
            encodeURIComponent(carSlug) +
            "?filters[company]=" +
            encodeURIComponent(companyId) +
            "&filters[category]=" +
            encodeURIComponent(categoryId) +
            "&filters[category_id]=" +
            encodeURIComponent(modelId) +
            "&filters[brand_id]=" +
            encodeURIComponent(sectionId);

          var selectedPartsArr = [];
          if (parts && parts.choices) {
            selectedPartsArr = parts.choices.getValue(true);
          }
          if (selectedPartsArr.length > 0) {
            url +=
              "&keyword=" +
              encodeURIComponent(selectedPartsArr.join("||"));
          }

          window.location.href = url;
        };

        // 8) Preselect from URL
        var params = new URLSearchParams(window.location.search);
        var preCompany = params.get("filters[company]");
        var preCategory = params.get("filters[category]");
        var preModel = params.get("filters[category_id]");
        var preBrand = params.get("filters[brand_id]");
        var preKeyword = params.get("keyword");

        if (preCompany) {
          setCompanyOptions(preCompany);
          setCategoryOptionsByCompany(preCompany, preCategory);

          var hasCats2 = !!(getNode(preCompany) &&
            getNode(preCompany).children &&
            getNode(preCompany).children.length);
          category.disabled = !hasCats2;
          if (category.choices) {
            category.choices[category.disabled ? "disable" : "enable"]();
          }

          setModelOptionsByCategory(preCategory, preModel);
          var node2 = getNode(preCategory);
          var hasMods2 = !!(node2 && node2.children && node2.children.length);
          model.disabled = !hasMods2;
          if (model.choices) {
            model.choices[model.disabled ? "disable" : "enable"]();
          }

          setSectionOptionsByCategory(preCategory, preBrand);
          var hasSecs2 = getSectionsOfSelectedCar(preCategory).length > 0;
          section.disabled = !hasSecs2;
          if (section.choices) {
            section.choices[section.disabled ? "disable" : "enable"]();
          }

          if (preBrand) {
            section.choices && section.choices.setChoiceByValue(preBrand);
            setPartsBySection(preCategory, preBrand);
            if (preKeyword && parts.choices) {
              setTimeout(function () {
                var arr = preKeyword.split("||");
                arr.forEach(function (v) {
                  parts.choices.setChoiceByValue(v);
                });
              }, 200);
            }
          }
        }

        // 9) عداد الهيرو
        var countEl = wrap.querySelector("#countUp");
        if (!countEl) {
          var heroDesc = wrap.querySelector(".hero-filter-desc");
          if (heroDesc) {
            var spanNum = document.createElement("span");
            spanNum.id = "countUp";
            spanNum.style.color = "#e5202a";
            spanNum.style.fontWeight = "700";
            spanNum.textContent = "0";
            heroDesc.insertBefore(spanNum, heroDesc.firstChild);
            countEl = spanNum;
          }
        }
        if (countEl) {
          var maxVal = counterTarget || 180000;
          var c = 0;
          var interval = setInterval(function () {
            c += Math.ceil((maxVal - c) / 11);
            if (c >= maxVal) {
              c = maxVal;
              clearInterval(interval);
            }
            countEl.textContent = c.toLocaleString("en-US");
          }, 25);
        }

        setTimeout(function () {
          var choicesDiv =
            wrap.querySelector("#parts") &&
            wrap.querySelector("#parts").closest(".choices");
          if (!choicesDiv) return;
          var choicesInner = choicesDiv.querySelector(".choices__inner");
          var observer = new MutationObserver(function () {
            var hasItem = choicesInner.querySelector(
              ".choices__item[data-id]"
            );
            var placeholder = choicesInner.querySelector(
              ".choices__placeholder"
            );
            if (placeholder)
              placeholder.style.display = hasItem ? "none" : "";
          });
          observer.observe(choicesInner, { childList: true, subtree: true });
        }, 400);
      })();
    }

    // ================== SCHEDULERS ==================
    function schedulePopup(widget, renderFn) {
      if (!matchesPlacement(widget)) return;
      if (shouldSkipByFrequency(widget)) return;

      var behavior = (widget.config && widget.config.behavior) || {};
      var triggerType = behavior.triggerType || "delay";

      function open() {
        renderPopup(widget, renderFn);
      }

      if (triggerType === "delay") {
        var delay = behavior.delaySeconds || 0;
        setTimeout(open, delay * 1000);
      } else if (triggerType === "scroll") {
        var fired = false;
        var onScroll = function () {
          if (fired) return;
          var scrollTop =
            window.scrollY ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;
          var docHeight =
            document.documentElement.scrollHeight ||
            document.body.scrollHeight ||
            0;
          var winHeight = window.innerHeight || 1;
          var percent = (scrollTop / (docHeight - winHeight)) * 100;
          if (percent >= 40) {
            fired = true;
            window.removeEventListener("scroll", onScroll);
            open();
          }
        };
        window.addEventListener("scroll", onScroll);
      } else if (triggerType === "exit") {
        var firedExit = false;
        var onLeave = function (e) {
          if (firedExit) return;
          if (e.clientY <= 0) {
            firedExit = true;
            document.removeEventListener("mouseleave", onLeave);
            open();
          }
        };
        document.addEventListener("mouseleave", onLeave);
      } else {
        open();
      }
    }

    function renderPopup(widget, renderFn) {
      renderFn(widget);
      markShown(widget);
      sendEvent(widget, "view");
    }

    // ================== LOAD WIDGETS ==================
    function loadWidgets() {
      var url =
        (PANEL_ORIGIN || "") +
        "/api/widgets?store_id=" +
        encodeURIComponent(storeId);

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("widgets api error");
          return res.json();
        })
        .then(function (json) {
          if (!json || !json.ok || !json.data || !json.data.widgets) return;
          var widgets = json.data.widgets || [];
          widgets.forEach(function (w) {
            if (w.kind === "popup") {
              if (w.template === "grand_launch_popup") {
                schedulePopup(w, buildGrandLaunchPopupDOM);
              } else {
                schedulePopup(w, buildSalePopupDOM);
              }
            } else if (w.kind === "filter_bar" && w.template === "filter_hero_v1") {
              buildFilterHeroDom(w);
            }
          });
        })
        .catch(function (err) {
          console.error("[widgets.js] failed to load widgets:", err);
        });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadWidgets);
    } else {
      loadWidgets();
    }
  } catch (err) {
    console.error("[widgets.js] runtime error:", err);
  }
})();
`;

  return new NextResponse(js, {
    status: 200,
    headers: {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
