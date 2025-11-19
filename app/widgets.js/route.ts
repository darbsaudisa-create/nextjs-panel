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
      // أبيض نظيف ستايل iOS light
      box.style.background = "rgba(248,250,252,0.98)";
      box.style.borderRadius = box.style.borderRadius || "26px";
      box.style.boxShadow =
        "0 26px 70px rgba(15,23,42,0.20), 0 0 0 1px rgba(226,232,240,0.9)";
      box.style.border = "1px solid rgba(226,232,240,0.9)";
      box.style.backdropFilter = "blur(22px)";
      content.style.textAlign = "center";
      content.style.color = "#020617";
    }

    function applyLuxuryStyle(box, content) {
      // دارك فاخر – قريب من Apple Music / Wallet
      box.style.background =
        "radial-gradient(circle at top, #020617, #020617 40%, #020617)";
      box.style.borderRadius = box.style.borderRadius || "28px";
      box.style.boxShadow =
        "0 32px 100px rgba(15,23,42,0.98), 0 0 0 1px rgba(31,41,55,0.95)";
      box.style.border = "1px solid rgba(51,65,85,0.95)";
      box.style.backdropFilter = "blur(28px)";
      content.style.textAlign = "center";
      content.style.color = "#e5e7eb";
    }

    function applyPremiumStyle(box, content) {
      // فاتح راقي – كرت إعدادات / Apple Pay
      box.style.background =
        "linear-gradient(145deg, #ffffff, #f9fafb 45%, #eef2ff)";
      box.style.borderRadius = box.style.borderRadius || "26px";
      box.style.boxShadow =
        "0 24px 65px rgba(15,23,42,0.18), 0 0 0 1px rgba(229,231,235,0.95)";
      box.style.border = "1px solid rgba(229,231,235,0.95)";
      box.style.backdropFilter = "blur(18px)";
      content.style.textAlign = "left";
      content.style.color = "#020617";
    }

    function applyGenZStyle(box, content) {
      // Gen Z رايق – لمعة خفيفة حوالين الحواف بدون حفلة ألوان
      box.style.background =
        "radial-gradient(circle at top left, rgba(59,130,246,0.24), transparent 55%)," +
        "radial-gradient(circle at bottom right, rgba(244,114,182,0.24), transparent 55%)," +
        "linear-gradient(145deg, #020617, #020617 50%, #020617)";
      box.style.borderRadius = box.style.borderRadius || "28px";
      box.style.boxShadow =
        "0 32px 110px rgba(15,23,42,0.98), 0 0 0 1px rgba(30,64,175,0.6)";
      box.style.border = "1px solid rgba(30,64,175,0.6)";
      box.style.backdropFilter = "blur(28px)";
      content.style.textAlign = "center";
      content.style.color = "#e5e7eb";
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

      // خلفية التعتيم
      var overlay = document.createElement("div");
      overlay.setAttribute("data-widgets-popup-id", widget.id);
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.background =
        "radial-gradient(circle at top,rgba(15,23,42,0.75),rgba(15,23,42,0.95))";
      overlay.style.zIndex = "999999";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.padding = "16px";
      overlay.style.backdropFilter = "blur(12px)";

      // تحديد هل الجهاز جوال
      var isMobile =
        (window.innerWidth || document.documentElement.clientWidth || 0) <= 640;

      // البوكس الأساسي
      var box = document.createElement("div");
      box.style.width = isMobile ? "100vw" : "min(90vw, 520px)";
      box.style.position = "relative";
      box.style.fontFamily =
        "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif";
      box.style.overflow = "hidden";
      box.style.borderRadius = isMobile ? "0" : "26px";
      box.style.border = "1px solid rgba(148,163,184,0.35)";
      box.style.boxShadow = "0 28px 80px rgba(15,23,42,0.75)";
      box.style.backdropFilter = "blur(22px)";
      box.style.transform = "translateY(0)";
      box.style.transition =
        "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out";
      box.style.opacity = "1";
      box.style.color = "#e5e7eb";

      if (isMobile) {
        box.style.height = "100vh";
        box.style.maxHeight = "100vh";
        box.style.display = "flex";
        box.style.flexDirection = "column";
        overlay.style.padding = "0";
      }

      // زر الإغلاق
      var closeBtn = document.createElement("button");
      closeBtn.innerHTML = "&times;";
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "14px";
      closeBtn.style.left = "14px";
      closeBtn.style.width = "30px";
      closeBtn.style.height = "30px";
      closeBtn.style.borderRadius = "999px";
      closeBtn.style.border = "1px solid rgba(148,163,184,0.35)";
      closeBtn.style.background = "rgba(15,23,42,0.6)";
      closeBtn.style.backdropFilter = "blur(10px)";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.fontSize = "18px";
      closeBtn.style.lineHeight = "28px";
      closeBtn.style.color = "#e5e7eb";
      closeBtn.style.zIndex = "2";
      closeBtn.style.display = "flex";
      closeBtn.style.alignItems = "center";
      closeBtn.style.justifyContent = "center";
      closeBtn.style.transition =
        "background 160ms ease-out, transform 160ms ease-out, box-shadow 160ms ease-out";

      closeBtn.onmouseenter = function () {
        closeBtn.style.background = "rgba(15,23,42,0.9)";
        closeBtn.style.transform = "translateY(-1px)";
        closeBtn.style.boxShadow = "0 10px 20px rgba(15,23,42,0.75)";
      };
      closeBtn.onmouseleave = function () {
        closeBtn.style.background = "rgba(15,23,42,0.6)";
        closeBtn.style.transform = "translateY(0)";
        closeBtn.style.boxShadow = "none";
      };

      closeBtn.onclick = function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        sendEvent(widget, "close");
      };

      box.appendChild(closeBtn);

      // صورة علوية (لو موجودة)
      if (imageBlock.enabled && imageUrl) {
        var imgWrap = document.createElement("div");
        imgWrap.style.height = "210px";
        imgWrap.style.overflow = "hidden";
        imgWrap.style.position = "relative";
        imgWrap.style.borderRadius = isMobile ? "0" : "24px 24px 0 0";
        var img = document.createElement("img");
        img.src = imageUrl;
        img.alt = heading || "";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.display = "block";
        imgWrap.appendChild(img);
        box.appendChild(imgWrap);
      }

      // محتوى داخلي
      var content = document.createElement("div");
      content.style.padding = "20px 24px 20px";
      content.style.position = "relative";
      if (isMobile) {
        content.style.flex = "1 1 auto";
        content.style.overflowY = "auto";
      }

      // تطبيق الستايل المختار
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

      // تحديد هل الستايل داكن أو فاتح، عشان الألوان
      var isDarkStyle = styleVariant === "luxury" || styleVariant === "genz";
      var headingColor = isDarkStyle ? "#f9fafb" : "#020617";
      var bodyColor = isDarkStyle
        ? "rgba(148,163,184,0.96)"
        : "rgba(55,65,81,0.96)";

      // عنوان العرض
      if (headingBlock.enabled && heading) {
        var h = document.createElement("h2");
        h.textContent = heading;
        h.style.fontSize = "20px";
        h.style.fontWeight = "800";
        h.style.margin = "0 0 6px";
        h.style.letterSpacing = "0.01em";
        h.style.color = headingColor;
        h.style.lineHeight = "1.4";
        content.appendChild(h);
      }

      // وصف العرض
      if (bodyBlock.enabled && body) {
        var p = document.createElement("p");
        p.textContent = body;
        p.style.fontSize = "14px";
        p.style.margin = "0 0 16px";
        p.style.color = bodyColor;
        p.style.lineHeight = "1.7";
        content.appendChild(p);
      }

      // كاونتر (عدد العملاء/المنتجات)
      if (counterCfg.enabled && counterCfg.target != null) {
        var counterWrap = document.createElement("div");
        counterWrap.style.marginBottom = "18px";
        counterWrap.style.display = "flex";
        counterWrap.style.alignItems = "flex-end";
        counterWrap.style.justifyContent = "flex-end";
        counterWrap.style.gap = "8px";

        var counterLeft = document.createElement("div");
        counterLeft.style.textAlign = "right";

        var counterLabel = document.createElement("div");
        counterLabel.textContent = counterCfg.label || "";
        counterLabel.style.fontSize = "11px";
        counterLabel.style.letterSpacing = "0.04em";
        counterLabel.style.color = isDarkStyle
          ? "rgba(148,163,184,0.9)"
          : "rgba(100,116,139,0.95)";
        counterLabel.style.marginBottom = "2px";

        var counterSpan = document.createElement("div");
        counterSpan.style.fontSize = "24px";
        counterSpan.style.fontWeight = "800";
        counterSpan.style.fontVariantNumeric = "tabular-nums";
        counterSpan.style.letterSpacing = "0.03em";
        counterSpan.textContent = "0";
        counterSpan.style.color = headingColor;

        counterLeft.appendChild(counterLabel);
        counterLeft.appendChild(counterSpan);
        counterWrap.appendChild(counterLeft);
        content.appendChild(counterWrap);

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
      }

      // زر CTA
      if (buttonBlock.enabled && buttonLabel) {
        var btn = document.createElement("a");
        btn.textContent = buttonLabel;
        btn.href = buttonUrl || "#";
        btn.style.display = "inline-flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.style.fontSize = "14px";
        btn.style.fontWeight = "700";
        btn.style.borderRadius = "999px";
        btn.style.padding = "11px 24px";
        btn.style.textDecoration = "none";
        btn.style.background = buttonColor || "#f97316";
        btn.style.backgroundImage =
          "linear-gradient(135deg, rgba(255,255,255,0.65), transparent)";
        btn.style.boxShadow = isDarkStyle
          ? "0 18px 45px rgba(15,23,42,0.85)"
          : "0 18px 40px rgba(15,23,42,0.25)";
        btn.style.marginTop = "4px";
        btn.style.border = "1px solid rgba(15,23,42,0.12)";
        btn.style.transition =
          "transform 160ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 160ms ease-out, filter 160ms ease-out";
        btn.style.fontVariantNumeric = "tabular-nums";
        btn.style.color = isDarkStyle ? "#f9fafb" : "#020617";

        btn.onmouseenter = function () {
          btn.style.transform = "translateY(-1.5px)";
          btn.style.boxShadow = isDarkStyle
            ? "0 24px 55px rgba(15,23,42,0.95)"
            : "0 22px 50px rgba(15,23,42,0.28)";
          btn.style.filter = "brightness(1.03)";
        };
        btn.onmouseleave = function () {
          btn.style.transform = "translateY(0)";
          btn.style.boxShadow = isDarkStyle
            ? "0 18px 45px rgba(15,23,42,0.85)"
            : "0 18px 40px rgba(15,23,42,0.25)";
          btn.style.filter = "none";
        };

        btn.onclick = function (e) {
          sendEvent(widget, "click", { href: buttonUrl });
          if (!buttonUrl || buttonUrl === "#") {
            e.preventDefault();
          }
        };
        content.appendChild(btn);
      }

      // كوبون
      if (couponCfg.enabled && couponCfg.code) {
        var couponWrap = document.createElement("div");
        couponWrap.style.marginTop = "16px";
        couponWrap.style.display = "flex";
        couponWrap.style.justifyContent = "space-between";
        couponWrap.style.alignItems = "center";
        couponWrap.style.padding = "10px 12px";
        couponWrap.style.borderRadius = "16px";
        couponWrap.style.background = isDarkStyle
          ? "rgba(15,23,42,0.9)"
          : "rgba(241,245,249,0.98)";
        couponWrap.style.border = "1px dashed rgba(148,163,184,0.7)";
        couponWrap.style.gap = "10px";

        var couponLabel = document.createElement("span");
        couponLabel.textContent = "استخدم كود الخصم:";
        couponLabel.style.fontSize = "12px";
        couponLabel.style.color = isDarkStyle
          ? "rgba(148,163,184,0.96)"
          : "rgba(100,116,139,0.98)";

        var rightPart = document.createElement("div");
        rightPart.style.display = "flex";
        rightPart.style.alignItems = "center";
        rightPart.style.gap = "8px";

        var couponCode = document.createElement("span");
        couponCode.textContent = couponCfg.code;
        couponCode.style.fontFamily =
          "SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
        couponCode.style.fontSize = "13px";
        couponCode.style.fontWeight = "700";
        couponCode.style.padding = "6px 10px";
        couponCode.style.borderRadius = "999px";
        couponCode.style.background = isDarkStyle ? "#f9fafb" : "#020617";
        couponCode.style.color = isDarkStyle ? "#020617" : "#f9fafb";

        var copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.textContent = "نسخ";
        copyBtn.style.border = "none";
        copyBtn.style.borderRadius = "999px";
        copyBtn.style.padding = "6px 12px";
        copyBtn.style.fontSize = "11px";
        copyBtn.style.fontWeight = "600";
        copyBtn.style.cursor = "pointer";
        copyBtn.style.background = isDarkStyle
          ? "rgba(15,23,42,0.9)"
          : "rgba(15,23,42,0.95)";
        copyBtn.style.color = "#f9fafb";
        copyBtn.style.transition =
          "background 140ms ease-out, transform 140ms ease-out, box-shadow 140ms ease-out";

        copyBtn.onmouseenter = function () {
          copyBtn.style.background = "#020617";
          copyBtn.style.transform = "translateY(-0.5px)";
          copyBtn.style.boxShadow = "0 10px 20px rgba(15,23,42,0.75)";
        };
        copyBtn.onmouseleave = function () {
          copyBtn.style.background = isDarkStyle
            ? "rgba(15,23,42,0.9)"
            : "rgba(15,23,42,0.95)";
          copyBtn.style.transform = "translateY(0)";
          copyBtn.style.boxShadow = "none";
        };

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
          }, 1800);
        };

        rightPart.appendChild(couponCode);
        rightPart.appendChild(copyBtn);
        couponWrap.appendChild(couponLabel);
        couponWrap.appendChild(rightPart);
        content.appendChild(couponWrap);
      }

      box.appendChild(content);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }

  // ================== GRAND LAUNCH POPUP (FORM) ==================
function buildGrandLaunchPopupDOM(widget) {
  var cfg = widget.config || {};
  var badgeText = cfg.badgeText || "افتتاح المتجر";
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

  // ===== الخلفية =====
  var overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "999999";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.background = "rgba(15,23,42,0.45)";
  overlay.style.backdropFilter = "blur(12px)";
  overlay.style.webkitBackdropFilter = "blur(12px)";

  var glow = document.createElement("div");
  glow.style.position = "absolute";
  glow.style.inset = "0";
  glow.style.pointerEvents = "none";
  glow.style.background =
    "radial-gradient(circle at top,rgba(148,163,184,0.20),transparent 65%)";
  overlay.appendChild(glow);

  // ===== الكرت الرئيسي =====
  var box = document.createElement("div");
  box.style.width = "min(92vw, 740px)";
  box.style.background = "rgba(15,23,42,0.97)";
  box.style.borderRadius = "24px";
  box.style.position = "relative";
  box.style.color = "#e5e7eb";
  box.style.padding = "18px 18px 16px";
  box.style.boxShadow =
    "0 24px 70px rgba(15,23,42,0.95), 0 0 0 1px rgba(31,41,55,0.8)";
  box.style.fontFamily =
    "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif";
  box.style.overflow = "hidden";

  var innerBorder = document.createElement("div");
  innerBorder.style.position = "absolute";
  innerBorder.style.inset = "0";
  innerBorder.style.borderRadius = "24px";
  innerBorder.style.border = "1px solid rgba(75,85,99,0.5)";
  innerBorder.style.pointerEvents = "none";
  box.appendChild(innerBorder);

  var stripe = document.createElement("div");
  stripe.style.position = "absolute";
  stripe.style.top = "-30px";
  stripe.style.left = "-15%";
  stripe.style.width = "60%";
  stripe.style.height = "90px";
  stripe.style.background =
    "linear-gradient(115deg,transparent,rgba(148,163,184,0.30),transparent)";
  stripe.style.opacity = "0.4";
  stripe.style.pointerEvents = "none";
  box.appendChild(stripe);

  // ===== زر الإغلاق =====
  var closeBtn = document.createElement("button");
  closeBtn.innerHTML = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "12px";
  closeBtn.style.left = "12px";
  closeBtn.style.width = "30px";
  closeBtn.style.height = "30px";
  closeBtn.style.borderRadius = "999px";
  closeBtn.style.border = "1px solid rgba(75,85,99,.9)";
  closeBtn.style.background = "rgba(15,23,42,0.98)";
  closeBtn.style.color = "#e5e7eb";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "18px";
  closeBtn.style.lineHeight = "26px";
  closeBtn.style.display = "flex";
  closeBtn.style.alignItems = "center";
  closeBtn.style.justifyContent = "center";
  closeBtn.style.zIndex = "2";
  closeBtn.style.transition =
    "background 0.16s ease, transform 0.16s ease, border-color 0.16s ease";
  closeBtn.onmouseenter = function () {
    closeBtn.style.background = "rgba(31,41,55,1)";
    closeBtn.style.borderColor = "rgba(107,114,128,1)";
    closeBtn.style.transform = "scale(1.03)";
  };
  closeBtn.onmouseleave = function () {
    closeBtn.style.background = "rgba(15,23,42,0.98)";
    closeBtn.style.borderColor = "rgba(75,85,99,.9)";
    closeBtn.style.transform = "scale(1)";
  };
  closeBtn.onclick = function () {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    sendEvent(widget, "close");
  };
  box.appendChild(closeBtn);

  // ===== المحتوى: موبايل أولاً (نص فوق + فورم تحت) =====
  var contentWrap = document.createElement("div");
  contentWrap.style.position = "relative";
  contentWrap.style.zIndex = "1";
  contentWrap.style.display = "flex";
  contentWrap.style.flexDirection = "column";
  contentWrap.style.gap = "14px";

  // ============ العمود الأيمن – النصوص (سيكون فوق في الموبايل) ============
  var rightCol = document.createElement("div");
  rightCol.style.display = "flex";
  rightCol.style.flexDirection = "column";
  rightCol.style.justifyContent = "center";
  rightCol.style.gap = "8px";

  var badge = document.createElement("div");
  badge.style.display = "inline-flex";
  badge.style.alignItems = "center";
  badge.style.gap = "6px";
  badge.style.padding = "5px 14px";
  badge.style.borderRadius = "999px";
  badge.style.fontSize = "11px";
  badge.style.fontWeight = "600";
  badge.style.background = "rgba(15,23,42,0.98)";
  badge.style.color = "#e5e7eb";
  badge.style.boxShadow =
    "0 10px 26px rgba(15,23,42,0.9), 0 0 0 1px rgba(55,65,81,0.9)";

  var badgeDot = document.createElement("span");
  badgeDot.textContent = "●";
  badgeDot.style.fontSize = "9px";
  badgeDot.style.color = "#22c55e";

  var badgeTextNode = document.createElement("span");
  badgeTextNode.textContent = badgeText;

  badge.appendChild(badgeDot);
  badge.appendChild(badgeTextNode);
  rightCol.appendChild(badge);

  var title = document.createElement("h2");
  title.textContent = titleText;
  title.style.marginTop = "10px";
  title.style.fontSize = "22px";
  title.style.fontWeight = "800";
  title.style.letterSpacing = "0.01em";
  title.style.color = "#f9fafb";
  title.style.lineHeight = "1.6";
  rightCol.appendChild(title);

  var sub = document.createElement("p");
  sub.textContent = subText;
  sub.style.marginTop = "6px";
  sub.style.fontSize = "13px";
  sub.style.color = "#cbd5f5";
  sub.style.maxWidth = "420px";
  sub.style.lineHeight = "1.8";
  rightCol.appendChild(sub);

  var countWrap = document.createElement("div");
  countWrap.style.marginTop = "14px";
  countWrap.style.display = "flex";
  countWrap.style.alignItems = "baseline";
  countWrap.style.gap = "8px";

  var countSpan = document.createElement("div");
  countSpan.style.fontSize = "24px";
  countSpan.style.fontWeight = "800";
  countSpan.style.fontVariantNumeric = "tabular-nums";
  countSpan.style.color = "#e5e7eb";
  countSpan.textContent = "0";

  var countLbl = document.createElement("div");
  countLbl.textContent = "+ منتج يتم تجهيزها للإطلاق";
  countLbl.style.fontSize = "12px";
  countLbl.style.color = "#9ca3af";

  countWrap.appendChild(countSpan);
  countWrap.appendChild(countLbl);
  rightCol.appendChild(countWrap);

  if (targetCount > 0) {
    (function animateCounter(el, to, duration) {
      var start = 0;
      var startTime = Date.now();
      function tick() {
        var now = Date.now();
        var progress = Math.min(1, (now - startTime) / (duration || 1600));
        var val = Math.floor(start + (to - start) * progress);
        el.textContent = val.toLocaleString("ar-SA");
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })(countSpan, targetCount, 1600);
  }

  var miniNote = document.createElement("div");
  miniNote.textContent =
    "بنرسل لك رابط المتجر أول ما يفتح، مع عروض خاصة لعملاء الافتتاح فقط.";
  miniNote.style.marginTop = "10px";
  miniNote.style.fontSize = "11px";
  miniNote.style.color = "#9ca3af";
  rightCol.appendChild(miniNote);

  // ============ العمود الأيسر – كرت الفورم (سيكون تحت في الموبايل) ============
  var leftCol = document.createElement("div");
  leftCol.style.display = "flex";
  leftCol.style.alignItems = "stretch";

  var formCard = document.createElement("div");
  formCard.style.flex = "1 1 auto";
  formCard.style.background = "rgba(15,23,42,0.98)";
  formCard.style.borderRadius = "20px";
  formCard.style.boxShadow =
    "0 18px 50px rgba(15,23,42,0.95), 0 0 0 1px rgba(55,65,81,0.95)";
  formCard.style.padding = "16px 14px 12px";
  formCard.style.display = "flex";
  formCard.style.flexDirection = "column";
  formCard.style.gap = "8px";
  formCard.style.position = "relative";
  formCard.style.overflow = "hidden";

  var formHeader = document.createElement("div");
  formHeader.style.display = "flex";
  formHeader.style.alignItems = "center";
  formHeader.style.justifyContent = "space-between";

  var formTitleText = document.createElement("div");
  formTitleText.textContent = "تنبيهي عند الافتتاح";
  formTitleText.style.fontSize = "13px";
  formTitleText.style.fontWeight = "600";
  formTitleText.style.color = "#f9fafb";

  var formDotWrap = document.createElement("div");
  formDotWrap.style.display = "inline-flex";
  formDotWrap.style.alignItems = "center";
  formDotWrap.style.gap = "4px";

  var formDot = document.createElement("span");
  formDot.textContent = "●";
  formDot.style.fontSize = "9px";
  formDot.style.color = "#22c55e";

  var formDotLabel = document.createElement("span");
  formDotLabel.textContent = "نشط الآن";
  formDotLabel.style.fontSize = "10px";
  formDotLabel.style.color = "#d1d5db";

  formDotWrap.appendChild(formDot);
  formDotWrap.appendChild(formDotLabel);

  formHeader.appendChild(formTitleText);
  formHeader.appendChild(formDotWrap);
  formCard.appendChild(formHeader);

  var form = document.createElement("form");
  form.style.marginTop = "6px";
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "8px";

  function makeInput(labelText, placeholder, type) {
    var wrap = document.createElement("div");

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
    input.style.border = "1px solid rgba(75,85,99,.9)";
    input.style.background = "rgba(15,23,42,1)";
    input.style.color = "#f9fafb";
    input.style.fontSize = "12px";
    input.style.padding = "8px 12px";
    input.style.outline = "none";
    input.style.transition =
      "border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease";

    input.onfocus = function () {
      input.style.borderColor = "#93c5fd";
      input.style.boxShadow = "0 0 0 1px rgba(147,197,253,0.9)";
      input.style.background = "rgba(15,23,42,1)";
    };
    input.onblur = function () {
      input.style.borderColor = "rgba(75,85,99,.9)";
      input.style.boxShadow = "none";
      input.style.background = "rgba(15,23,42,1)";
    };

    wrap.appendChild(label);
    wrap.appendChild(input);
    return { wrap: wrap, input: input };
  }

  var nameInput = null;
  var phoneInput = null;
  var emailInput = null;

  if (nameField.enabled) {
    var r = makeInput("الاسم الكامل", "مثال: محمد أحمد", "text");
    nameInput = r.input;
    form.appendChild(r.wrap);
  }

  if (phoneField.enabled) {
    var r2 = makeInput("رقم الواتساب", "05XXXXXXXX", "tel");
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
  submitBtn.style.marginTop = "4px";
  submitBtn.style.borderRadius = "999px";
  submitBtn.style.border = "none";
  submitBtn.style.background = "#e5e7eb";
  submitBtn.style.color = "#111827";
  submitBtn.style.fontSize = "13px";
  submitBtn.style.fontWeight = "600";
  submitBtn.style.padding = "9px 14px";
  submitBtn.style.cursor = "pointer";
  submitBtn.style.boxShadow =
    "0 10px 26px rgba(15,23,42,0.55)";
  submitBtn.style.display = "flex";
  submitBtn.style.alignItems = "center";
  submitBtn.style.justifyContent = "center";
  submitBtn.style.gap = "6px";
  submitBtn.style.transition =
    "transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease";

  var arrowSpan = document.createElement("span");
  arrowSpan.textContent = "➜";
  arrowSpan.style.fontSize = "13px";
  arrowSpan.style.opacity = "0.75";
  submitBtn.appendChild(arrowSpan);

  submitBtn.onmouseenter = function () {
    submitBtn.style.transform = "translateY(-1px)";
    submitBtn.style.boxShadow =
      "0 16px 30px rgba(15,23,42,0.75)";
    submitBtn.style.background = "#f3f4f6";
  };
  submitBtn.onmouseleave = function () {
    submitBtn.style.transform = "translateY(0)";
    submitBtn.style.boxShadow =
      "0 10px 26px rgba(15,23,42,0.55)";
    submitBtn.style.background = "#e5e7eb";
  };

  form.appendChild(submitBtn);

  var msg = document.createElement("div");
  msg.style.marginTop = "6px";
  msg.style.fontSize = "11px";
  msg.style.minHeight = "16px";
  msg.style.color = "#9ca3af";

  formCard.appendChild(form);
  formCard.appendChild(msg);
  leftCol.appendChild(formCard);

  // ===== ترتيب موبايل: نص فوق، فورم تحت =====
  contentWrap.appendChild(rightCol);
  contentWrap.appendChild(leftCol);

  box.appendChild(contentWrap);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // ===== ديسكتوب: نحوله عمودين، فورم يسار – نص يمين =====
  try {
    if (
      window.matchMedia &&
      window.matchMedia("(min-width: 768px)").matches
    ) {
      contentWrap.style.display = "grid";
      contentWrap.style.gridTemplateColumns =
        "minmax(0,1.1fr) minmax(0,1.7fr)";
      contentWrap.style.gap = "16px";

      // نخلي الفورم في العمود الأول، النص في الثاني
      leftCol.style.order = "1";
      rightCol.style.order = "2";
    }
  } catch (_) {}

  // ===== إرسال النموذج =====
  form.onsubmit = function (e) {
    e.preventDefault();
    msg.textContent = "";
    msg.style.color = "#f97316";

    var nameVal = nameInput ? nameInput.value.trim() : "";
    var phoneVal = phoneInput ? phoneInput.value.trim() : "";
    var emailVal = emailInput ? emailInput.value.trim() : "";

    if (nameField.enabled && nameField.required && !nameVal) {
      msg.textContent = "فضلاً أدخل اسمك الكامل.";
      return;
    }
    if (phoneField.enabled && phoneField.required && !phoneVal) {
      msg.textContent = "فضلاً أدخل رقم الجوال بشكل صحيح.";
      return;
    }
    if (emailField.enabled && emailField.required && !emailVal) {
      msg.textContent = "فضلاً أدخل بريدك الإلكتروني.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "جاري حفظ بياناتك…";
    submitBtn.appendChild(arrowSpan);

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
          sendEvent(widget, "lead_submit";
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
        submitBtn.appendChild(arrowSpan);
      });
  };
}







// =========== بوب اب للجوال ======= ADVANCED CAR PICKER (BUTTON + FULLSCREEN POPUP) ==================
function buildAdvancedSearchButton(widget) {
  var cfg = widget.config || {};
  var firestore = cfg.firestore || {};
  var searchCfg = cfg.search || {};
  var pos = cfg.position || {};

  var projectId = firestore.projectId || "spare-parts-project-55319";
  var apiKey =
    firestore.apiKey || "AIzaSyB0qGrqutUtkFHKnyy7F73kyiDfcQhsDc";
  var metaDoc = firestore.metaDoc || "SECTION_OPTIONS";

  var maxParts = Number(searchCfg.maxParts || 5);
  var targetDomain = (searchCfg.targetDomain || "https://darb.com.sa").replace(
    /\/+$/,
    ""
  );

  // النص اللي يجي من config.label
  var buttonLabel = typeof cfg.label === "string" ? cfg.label : "اختيار السيارة";

  /* ============ 0) Firestore REST ============ */
  var base =
    "https://firestore.googleapis.com/v1/projects/" +
    projectId +
    "/databases/(default)/documents/meta";
  var docUrl = function (name) {
    return base + "/" + name + "?key=" + apiKey;
  };

  function fromFsValue(v) {
    if (!v) return null;
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return parseInt(v.integerValue, 10);
    if ("doubleValue" in v) return v.doubleValue;
    if ("booleanValue" in v) return !!v.booleanValue;
    if ("nullValue" in v) return null;
    if ("arrayValue" in v)
      return (v.arrayValue.values || []).map(fromFsValue);
    if ("mapValue" in v) {
      var out = {};
      var f = v.mapValue.fields || {};
      for (var k in f) out[k] = fromFsValue(f[k]);
      return out;
    }
    return v;
  }

  async function getDoc(name) {
    var r = await fetch(docUrl(name));
    if (!r.ok) throw new Error(name + ": " + r.status + " " + (await r.text()));
    var j = await r.json();
    return fromFsValue(j.fields && j.fields.value);
  }

  /* ============ 1) حاويات البيانات ============ */
  var SECTION_TREE = {};
  var CATEGORIES = [];

  async function loadData() {
    var tree = await getDoc(metaDoc);
    SECTION_TREE = tree && typeof tree === "object" ? tree : {};

    var cats = [];
    var entries = Object.entries(SECTION_TREE);
    for (var i = 0; i < entries.length; i++) {
      var brandKey = entries[i][0];
      var brandNode = entries[i][1];
      if (!brandNode || !brandNode._meta) continue;

      var b = brandNode._meta;
      var brandObj = {
        id: b.id,
        slug: (b.slug || "").trim(),
        name: b.name,
        children: [],
      };

      var order = Array.isArray(b.carOrder) ? b.carOrder.slice() : [];
      var mapCarKeys = Object.keys(brandNode).filter(function (k) {
        return k !== "_meta";
      });
      mapCarKeys.forEach(function (k) {
        if (order.indexOf(k) === -1) order.push(k);
      });

      for (var j = 0; j < order.length; j++) {
        var carKey = order[j];
        var carNode = brandNode[carKey];
        if (!carNode || !carNode._meta) continue;

        var cm = carNode._meta;
        var carObj = {
          id: cm.id,
          slug: (cm.slug || "").trim(),
          name: cm.name,
          children: [],
        };

        var yearsArr = Array.isArray(carNode.years) ? carNode.years : [];
        yearsArr.forEach(function (yr) {
          if (!yr || !yr.id) return;
          carObj.children.push({
            id: yr.id,
            name: yr.name,
            slug: yr.slug,
          });
        });

        carObj.__brandKey = brandKey;
        carObj.__carKey = carKey;

        brandObj.children.push(carObj);
      }

      cats.push(brandObj);
    }

    CATEGORIES = cats;
  }

  /* ============ 4) UI + منطق (نفس سكربت اختيار السيارة) ============ */

  // زر الفتح — نترك الـ CSS يتحكم في position بالكامل
  var openBtn = document.createElement("button");
  openBtn.className = "popup-open-btn";

  if (buttonLabel && buttonLabel.trim()) {
    // لو في نص → نعتمده
    openBtn.textContent = buttonLabel;
  } else {
    // لو خليت label فاضي في config → يصير الزر أيقونة فقط
    openBtn.innerHTML =
      '<span class="popup-open-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="18" height="18">' +
      '<path fill="currentColor" d="M4 5h16v2H4zm3 6h10v2H7zm3 6h4v2h-4z"></path>' +
      "</svg>" +
      "</span>";
  }

  document.body.appendChild(openBtn);

  var popup = document.createElement("div");
  popup.className = "fullpage-popup";
  popup.innerHTML =
    '<div class="popup-content">' +
    '<div class="popup-progress"></div>' +
    '<div class="popup-top-bar">' +
    '<button class="popup-back" style="display:none">رجوع</button>' +
    '<input class="popup-search" type="text" placeholder="بحث..." autocomplete="off">' +
    '<button class="popup-close">×</button>' +
    "</div>" +
    '<div class="popup-crumbs"></div>' +
    '<div class="popup-selected-options"></div>' +
    '<div class="popup-list"></div>' +
    '<button class="popup-confirm" style="display:none">تأكيد</button>' +
    "</div>";
  document.body.appendChild(popup);

  var state = {
    brand: null,
    type: null,
    model: null,
    section: null,
    options: [],
  };
  var step = 0;

  var backBtn = popup.querySelector(".popup-back");
  var closeBtn = popup.querySelector(".popup-close");
  var searchInput = popup.querySelector(".popup-search");
  var listDiv = popup.querySelector(".popup-list");
  var crumbs = popup.querySelector(".popup-crumbs");
  var confirmBtn = popup.querySelector(".popup-confirm");
  var selectedOptionsDiv = popup.querySelector(".popup-selected-options");
  var progressDiv = popup.querySelector(".popup-progress");
  var stepsList = [
    { label: "01" },
    { label: "02" },
    { label: "03" },
    { label: "04" },
    { label: "05" },
  ];

  function setProgressBar(currentStep) {
    progressDiv.innerHTML = stepsList
      .map(function (s, i) {
        return (
          '<div class="popup-step' +
          (i < currentStep ? " done" : "") +
          (i === currentStep ? " current" : "") +
          '" data-step="' +
          i +
          '" ' +
          (i < currentStep ? 'tabindex="0"' : "") +
          ">" +
          '<span class="step-num">' +
          s.label +
          "</span>" +
          '<span class="checkmark">✓</span>' +
          "</div>"
        );
      })
      .join("");

    Array.prototype.forEach.call(
      progressDiv.querySelectorAll(".popup-step.done"),
      function (el) {
        el.onclick = function () {
          var stepIdx = Number(el.getAttribute("data-step"));
          if (stepIdx < step) {
            if (stepIdx < 4) state.options = [];
            if (stepIdx < 3) state.section = null;
            if (stepIdx < 2) state.model = null;
            if (stepIdx < 1) state.type = null;
            renderStep(stepIdx);
          }
        };
      }
    );
  }

  function getRawCarNode(selectedType) {
    if (
      !selectedType ||
      !selectedType.__brandKey ||
      !selectedType.__carKey
    )
      return null;
    var brandNode = SECTION_TREE[selectedType.__brandKey];
    if (!brandNode) return null;
    var carNode = brandNode[selectedType.__carKey];
    return carNode && carNode._meta ? carNode : null;
  }

  function getSectionsOfSelectedCar() {
    var rawCar = getRawCarNode(state.type);
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

  function renderStep(newStep) {
    step = newStep;
    setProgressBar(step);
    listDiv.innerHTML = "";
    searchInput.value = "";
    confirmBtn.style.display = "none";
    selectedOptionsDiv.style.display = "none";
    selectedOptionsDiv.innerHTML = "";
    crumbs.innerHTML = "";

    if (state.brand)
      crumbs.innerHTML += "🏢 " + (state.brand.name || "—") + " / ";
    if (state.type) crumbs.innerHTML += (state.type.name || "—") + " / ";
    if (state.model) crumbs.innerHTML += (state.model.name || "—") + " / ";
    if (state.section)
      crumbs.innerHTML += (state.section.name || "—") + " / ";

    if (step === 0) {
      CATEGORIES.forEach(function (brand) {
        var btn = document.createElement("button");
        btn.textContent = brand.name || "—";
        if (state.brand && state.brand.id === brand.id)
          btn.className = "selected";
        btn.onclick = function () {
          state.brand = brand;
          state.type = null;
          state.model = null;
          state.section = null;
          state.options = [];
          renderStep(1);
        };
        listDiv.appendChild(btn);
      });
    } else if (step === 1) {
      (state.brand && state.brand.children ? state.brand.children : []).forEach(
        function (type) {
          var btn = document.createElement("button");
          btn.textContent = type.name;
          if (state.type && state.type.id === type.id)
            btn.className = "selected";
          btn.onclick = function () {
            state.type = type;
            state.model = null;
            state.section = null;
            state.options = [];
            renderStep(2);
          };
          listDiv.appendChild(btn);
        }
      );
    } else if (step === 2) {
      (state.type && state.type.children ? state.type.children : []).forEach(
        function (model) {
          var btn = document.createElement("button");
          btn.textContent = model.name;
          if (state.model && state.model.id === model.id)
            btn.className = "selected";
          btn.onclick = function () {
            state.model = model;
            state.section = null;
            state.options = [];
            renderStep(3);
          };
          listDiv.appendChild(btn);
        }
      );
    } else if (step === 3) {
      var sections = getSectionsOfSelectedCar();
      sections.forEach(function (section) {
        var btn = document.createElement("button");
        btn.textContent = section.name;
        if (state.section && state.section.id === section.id)
          btn.className = "selected";
        btn.onclick = function () {
          state.section = section;
          state.options = [];
          renderStep(4);
        };
        listDiv.appendChild(btn);
      });
    } else if (step === 4) {
      selectedOptionsDiv.style.display = "flex";
      confirmBtn.style.display = "block";
      selectedOptionsDiv.innerHTML = "";

      (state.options || []).forEach(function (opt) {
        var tag = document.createElement("span");
        tag.className = "selected-tag";
        tag.textContent = opt;
        var remove = document.createElement("button");
        remove.innerHTML = "×";
        remove.onclick = function () {
          state.options = state.options.filter(function (x) {
            return x !== opt;
          });
          renderStep(4);
        };
        tag.appendChild(remove);
        selectedOptionsDiv.appendChild(tag);
      });

      var options = Array.isArray(state.section && state.section.options)
        ? state.section.options
        : [];
      options.forEach(function (option) {
        var btn = document.createElement("button");
        btn.textContent = option;
        btn.className = state.options.indexOf(option) >= 0 ? "selected" : "";
        btn.onclick = function () {
          if (state.options.indexOf(option) < 0) {
            if (state.options.length < maxParts) state.options.push(option);
          } else {
            state.options = state.options.filter(function (x) {
              return x !== option;
            });
          }
          renderStep(4);
        };
        listDiv.appendChild(btn);
      });

      confirmBtn.onclick = function () {
        var carNodeRaw = getRawCarNode(state.type);
        var carMeta = (carNodeRaw && carNodeRaw._meta) || {};
        var yearNode = state.model;
        var sectionObj = state.section;
        var brandMeta = state.brand || {};

        if (
          !brandMeta.id ||
          !carMeta.id ||
          !carMeta.slug ||
          !yearNode ||
          !yearNode.id ||
          !sectionObj ||
          !sectionObj.id
        ) {
          alert(
            "ناقص معرّفات: تأكد من اختيار الشركة والسيارة والسنة والقسم وأن الـ slug موجود."
          );
          return;
        }

        var companyId = brandMeta.id;
        var carSlug = (carMeta.slug || "").trim();
        var categoryId = carMeta.id;
        var modelId = yearNode.id;
        var sectionId = sectionObj.id;

        var url =
          targetDomain +
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

        if (state.options && state.options.length) {
          url +=
            "&keyword=" + encodeURIComponent(state.options.join("||"));
        }

        window.location.href = url;
      };
    }

    searchInput.oninput = function () {
      var val = this.value.trim();
      Array.prototype.forEach.call(listDiv.children, function (btn) {
        btn.style.display =
          !val || btn.textContent.indexOf(val) !== -1 ? "" : "none";
      });
    };

    backBtn.style.display = step > 0 ? "" : "none";
  }

  openBtn.onclick = function () {
    var loadingBtnText = openBtn.textContent;
    openBtn.disabled = true;
    openBtn.textContent = "جار التحميل...";
    popup.classList.add("active");
    state = {
      brand: null,
      type: null,
      model: null,
      section: null,
      options: [],
    };
    loadData()
      .then(function () {
        renderStep(0);
      })
      .catch(function (e) {
        console.error(e);
        alert(
          "تعذر تحميل SECTION_OPTIONS — تأكد من الوثيقة والصلاحيات."
        );
        renderStep(0);
      })
      .finally(function () {
        openBtn.disabled = false;
        openBtn.textContent = buttonLabel || "اختيار السيارة";
      });
  };

  closeBtn.onclick = function () {
    popup.classList.remove("active");
  };

  backBtn.onclick = function () {
    if (step === 4) renderStep(3);
    else if (step === 3) {
      state.section = null;
      state.options = [];
      renderStep(2);
    } else if (step === 2) {
      state.model = null;
      state.section = null;
      state.options = [];
      renderStep(1);
    } else if (step === 1) {
      state.type = null;
      state.model = null;
      state.section = null;
      state.options = [];
      renderStep(0);
    } else popup.classList.remove("active");
  };

  popup.onclick = function (e) {
    if (e.target === popup) popup.classList.remove("active");
  };
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
        var apiKey = fsCfg.apiKey || "AIzaSyB0qGrqutUtkFHKnyy7F73kyDfcQhsDc";
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
            } else if (w.kind === "filter_bar" && w.template === "car_picker_button_v1") {
              buildAdvancedSearchButton(w);
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
