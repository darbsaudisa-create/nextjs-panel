/*! ـــــــــــالصورة تقريبيةــــــــــ */
(function () {
  // ابحث عن الـ div الهدف
  const targetDiv = document.querySelector(
    ".flex.items-center.gap-4.border.border-gray-200"
  );
  // إذا وجدناه، أضف قبله الملاحظة
  if (targetDiv) {
    const note = document.createElement("div");
    note.className =
      "product-image-note mb-3 p-3 rounded-md bg-yellow-100 text-yellow-800 text-sm font-semibold border border-yellow-300";
    note.textContent = "الصورة تقريبية والاعتماد الأساسي على وصف المنتج";
    targetDiv.parentNode.insertBefore(note, targetDiv);
  }
})();

/*! ـــــــــــ  ويحددها باحمر  ــــــــــ */
(function () {
  function getKeywords() {
    const params = new URLSearchParams(window.location.search);
    let kw = params.get("keyword") || "";

    return kw
      .split("||")
      .map((k) => k.trim())
      .filter(Boolean);
  }

  function matchKeyword(title, keywords) {
    title = title.trim().toLowerCase();
    return keywords.some((kw) => title.startsWith(kw.toLowerCase()));
  }

  function highlightKeywordProducts() {
    const keywords = getKeywords();
    if (!keywords.length) return;

    document.querySelectorAll("custom-salla-product-card").forEach((card) => {
      let titleEl = card.querySelector(".product-card__title a");
      let title = titleEl ? titleEl.textContent.trim() : "";
      if (matchKeyword(title, keywords)) {
        card.classList.add("product-card-keyword-glow");
      } else {
        card.classList.remove("product-card-keyword-glow");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", highlightKeywordProducts);

  setTimeout(highlightKeywordProducts, 1800);

  const obs = new MutationObserver(highlightKeywordProducts);
  obs.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();

/*! ـــــــــــ   تابي وتمارا على المنتجات  ــــــــــ */
(function () {
  const hour = new Date().getHours();
  const isNight = hour >= 1 && hour < 7;
  const isWrongDomain = location.hostname !== "darb.com.sa";

  if (isNight && isWrongDomain) {
    location.href = "https://darb.com.sa/";
    return;
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll(".starting-or-normal-price").forEach((el) => {
      if (el.querySelector(".product-price-block")) return;

      const priceEl = el.querySelector(".total-price");
      if (!priceEl) return;

      const price = parseFloat(priceEl.textContent.replace(/[^\d.]/g, ""));
      if (isNaN(price)) return;

      const perInstallment = (price / 4).toFixed(2);

      const container = document.createElement("div");
      container.className = "product-price-block";
      container.innerHTML = `
        <div class="main-price">${price} ريال</div>
        <div class="tax-note">شامل الضريبة*</div>
        <div class="divider"></div>
        <div class="installment-box">
          <div class="installment-row">
            <div class="installment-price">${perInstallment} ﷼/شهرياً</div>
            <div class="installment-note">4 دفعات</div>
            <div class="installment-logos">
              <img src="https://cdn.salla.sa/Brozxa/xk7tKfdLAq309EXa72WKkh3JvjbCU2NifrfHizMR.png" alt="tabby">
              <img src="https://cdn.salla.sa/Brozxa/ftKezKDKmXc5m5rhnP5p0DqW68elwBj3kwj5h6QN.png" alt="tamara">
            </div>
          </div>
        </div>
      `;

      priceEl.style.display = "none";
      el.appendChild(container);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();

/*! ـــــــــــ قوائم الجوال ــــــــــ */
/*! ـــــــــــ قوائم الجوال ــــــــــ */
(function () {
  /* ============ 0) Firestore REST ============ */
  const projectId = "spare-parts-project-55319";
  const apiKey = "AIzaSyB0qGrqutUtkFHKnyy7F73kykiDfcQhsDc";
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/meta`;
  const docUrl = (name) => `${base}/${name}?key=${apiKey}`;

  function fromFsValue(v) {
    if (!v) return null;
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return parseInt(v.integerValue, 10);
    if ("doubleValue" in v) return v.doubleValue;
    if ("booleanValue" in v) return !!v.booleanValue;
    if ("nullValue" in v) return null;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromFsValue);
    if ("mapValue" in v) {
      const out = {},
        f = v.mapValue.fields || {};
      for (const k in f) out[k] = fromFsValue(f[k]);
      return out;
    }
    return v;
  }
  async function getDoc(name) {
    const r = await fetch(docUrl(name));
    if (!r.ok) throw new Error(`${name}: ${r.status} ${await r.text()}`);
    const j = await r.json();
    return fromFsValue(j.fields?.value);
  }

  /* ============ 1) حاويات البيانات ============ */
  let SECTION_TREE = {};
  let CATEGORIES = [];

  /* ============ 2) تحميل SECTION_OPTIONS وبناء الشركات/السيارات/السنوات فقط ============ */
  async function loadData() {
    const tree = await getDoc("SECTION_OPTIONS");
    SECTION_TREE = tree && typeof tree === "object" ? tree : {};

    const cats = [];
    for (const [brandKey, brandNode] of Object.entries(SECTION_TREE)) {
      if (!brandNode || !brandNode._meta) continue;

      const b = brandNode._meta;
      const brandObj = {
        id: b.id,
        slug: (b.slug || "").trim(),
        name: b.name,
        children: [],
      };

      const order = Array.isArray(b.carOrder) ? [...b.carOrder] : [];
      const mapCarKeys = Object.keys(brandNode).filter((k) => k !== "_meta");
      for (const k of mapCarKeys) if (!order.includes(k)) order.push(k);

      for (const carKey of order) {
        const carNode = brandNode[carKey];
        if (!carNode || !carNode._meta) continue;

        const cm = carNode._meta;
        const carObj = {
          id: cm.id,
          slug: (cm.slug || "").trim(),
          name: cm.name,
          children: [],
        };

        (Array.isArray(carNode.years) ? carNode.years : []).forEach((yr) => {
          if (!yr || !yr.id) return;
          carObj.children.push({ id: yr.id, name: yr.name, slug: yr.slug });
        });

        carObj.__brandKey = brandKey;
        carObj.__carKey = carKey;

        brandObj.children.push(carObj);
      }

      cats.push(brandObj);
    }

    CATEGORIES = cats;
  }

  /* ============ 3) CSS مدمج عبر JS ============ */
  (function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

      html,body{margin:0;padding:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
      body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:#fafafa;color:#111;overflow-x:hidden}

      *{-webkit-tap-highlight-color:transparent}

      .popup-open-btn{
        position:fixed;
        top:28px;
        left:28px;
        z-index:9999;
        background:linear-gradient(135deg,#e2231a 0%,#c91e15 100%);
        color:#fff;
        border-radius:16px;
        padding:16px 32px;
        border:none;
        font-size:17px;
        font-weight:700;
        box-shadow:0 8px 32px rgba(226,35,26,0.24),0 2px 8px rgba(226,35,26,0.12);
        cursor:pointer;
        letter-spacing:0.3px;
        transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
        backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
      }
      .popup-open-btn:hover{
        transform:translateY(-2px);
        box-shadow:0 12px 40px rgba(226,35,26,0.32),0 4px 12px rgba(226,35,26,0.16);
      }
      .popup-open-btn:active{
        transform:translateY(0);
      }

      .fullpage-popup{
        position:fixed;
        inset:0;
        z-index:99999;
        background:rgba(15,23,42,0.7);
        backdrop-filter:blur(16px);
        -webkit-backdrop-filter:blur(16px);
        display:none;
        animation:fadein 0.3s cubic-bezier(0.4,0,0.2,1);
      }
      @keyframes fadein{
        from{opacity:0}
        to{opacity:1}
      }
      .fullpage-popup.active{
        display:flex;
        align-items:center;
        justify-content:center;
      }

      .popup-content{
        width:460px;
        max-width:94vw;
        height:90vh;
        max-height:820px;
        margin:auto;
        background:#ffffff;
        border-radius:28px;
        box-shadow:
          0 0 0 1px rgba(226,35,26,0.04),
          0 20px 60px rgba(15,23,42,0.25),
          0 8px 24px rgba(15,23,42,0.15);
        padding:0;
        display:flex;
        flex-direction:column;
        position:relative;
        overflow:hidden;
        animation:slideup 0.35s cubic-bezier(0.16,1,0.3,1);
      }
      @keyframes slideup{
        from{opacity:0;transform:translateY(40px) scale(0.96)}
        to{opacity:1;transform:translateY(0) scale(1)}
      }
      @media (max-width:600px){
        .popup-content{
          width:96vw;
          height:94vh;
          max-height:none;
          border-radius:24px;
        }
      }

      .popup-progress{
        width:90%;
        margin:28px auto 20px;
        position:relative;
        height:60px;
        display:flex;
        align-items:center;
        justify-content:space-between;
      }
      .popup-progress:before{
        content:"";
        position:absolute;
        left:24px;
        right:24px;
        top:50%;
        height:3px;
        background:linear-gradient(90deg,#e8e8e8 0%,#f0f0f0 100%);
        border-radius:3px;
        transform:translateY(-50%);
      }
      .popup-step{
        z-index:2;
        width:52px;
        height:52px;
        border:3px solid #e8e8e8;
        border-radius:50%;
        background:#ffffff;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:16px;
        font-weight:800;
        color:#c0c0c0;
        box-shadow:0 2px 12px rgba(15,23,42,0.08);
        transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
        position:relative;
      }
      .popup-step .checkmark{
        display:none;
        font-size:20px;
      }
      .popup-step.done{
        border-color:#10b981;
        background:linear-gradient(135deg,#10b981 0%,#059669 100%);
        color:#fff;
        cursor:pointer;
        transform:scale(1);
      }
      .popup-step.done:hover{
        transform:scale(1.08);
        box-shadow:0 4px 16px rgba(16,185,129,0.3);
      }
      .popup-step.done .step-num{
        display:none;
      }
      .popup-step.done .checkmark{
        display:block;
      }
      .popup-step.current{
        border-color:#e2231a;
        background:linear-gradient(135deg,#e2231a 0%,#c91e15 100%);
        color:#fff;
        transform:scale(1.12);
        box-shadow:0 4px 20px rgba(226,35,26,0.35);
        animation:pulse 2s infinite;
      }
      @keyframes pulse{
        0%,100%{box-shadow:0 4px 20px rgba(226,35,26,0.35)}
        50%{box-shadow:0 4px 28px rgba(226,35,26,0.5)}
      }

      .popup-top-bar{
        display:flex;
        gap:10px;
        align-items:center;
        border-bottom:1px solid #f1f1f1;
        padding:18px 20px;
        background:linear-gradient(180deg,#ffffff 0%,#fafafa 100%);
        backdrop-filter:blur(20px);
        -webkit-backdrop-filter:blur(20px);
      }
      .popup-top-bar input{
        flex:1;
        font-size:16px;
        font-weight:500;
        padding:13px 18px 13px 44px;
        border-radius:14px;
        border:1.5px solid #e8e8e8;
        background:#ffffff url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>') no-repeat 16px center;
        transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
        color:#111;
      }
      .popup-top-bar input:focus{
        outline:none;
        border-color:#e2231a;
        background-color:#fff;
        box-shadow:0 0 0 4px rgba(226,35,26,0.08);
      }
      .popup-top-bar input::placeholder{
        color:#aaa;
      }
      .popup-back,.popup-close{
        background:#f5f5f5;
        border:1.5px solid #e8e8e8;
        color:#444;
        font-size:15px;
        font-weight:700;
        padding:13px 20px;
        border-radius:14px;
        cursor:pointer;
        transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
      }
      .popup-close{
        font-size:24px;
        padding:10px 16px;
        line-height:1;
        color:#666;
      }
      .popup-back:hover,.popup-close:hover{
        background:#e8e8e8;
        border-color:#d0d0d0;
        transform:translateY(-1px);
      }
      .popup-back:active,.popup-close:active{
        transform:translateY(0);
      }

      .popup-crumbs{
        font-size:14px;
        color:#e2231a;
        font-weight:600;
        padding:16px 24px 12px;
        white-space:nowrap;
        overflow-x:auto;
        background:linear-gradient(90deg,#fff8f7 0%,#ffffff 100%);
        border-bottom:1px solid #f9f9f9;
        letter-spacing:0.2px;
      }
      .popup-crumbs::-webkit-scrollbar{
        height:0;
      }

      .popup-list{
        flex:1;
        overflow-y:auto;
        padding:20px 20px 16px;
        display:flex;
        flex-wrap:wrap;
        gap:12px;
        align-content:flex-start;
        background:#fafafa;
      }
      .popup-list::-webkit-scrollbar{
        width:6px;
      }
      .popup-list::-webkit-scrollbar-track{
        background:transparent;
      }
      .popup-list::-webkit-scrollbar-thumb{
        background:#d0d0d0;
        border-radius:3px;
      }
      .popup-list button{
        background:#ffffff;
        border-radius:14px;
        padding:16px 24px;
        font-size:15.5px;
        border:2px solid #e8e8e8;
        cursor:pointer;
        font-weight:700;
        color:#333;
        min-width:100px;
        box-shadow:
          0 1px 3px rgba(15,23,42,0.06),
          0 0 0 1px rgba(15,23,42,0.02);
        transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
        letter-spacing:0.2px;
      }
      .popup-list button:hover{
        border-color:#e2231a;
        background:#fff5f4;
        transform:translateY(-2px);
        box-shadow:
          0 4px 12px rgba(226,35,26,0.12),
          0 2px 6px rgba(226,35,26,0.08);
      }
      .popup-list button:active{
        transform:translateY(0);
      }
      .popup-list button.selected{
        background:linear-gradient(135deg,#e2231a 0%,#c91e15 100%);
        color:#fff;
        border-color:#e2231a;
        box-shadow:
          0 4px 16px rgba(226,35,26,0.24),
          0 2px 8px rgba(226,35,26,0.12);
        transform:translateY(-2px);
      }

      .popup-selected-options{
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        padding:16px 24px 8px;
        background:#ffffff;
        border-bottom:1px solid #f1f1f1;
      }
      .popup-selected-options .selected-tag{
        background:linear-gradient(135deg,#e2231a 0%,#c91e15 100%);
        color:#fff;
        border-radius:12px;
        padding:10px 16px;
        display:flex;
        align-items:center;
        font-size:14px;
        font-weight:700;
        gap:8px;
        box-shadow:
          0 2px 8px rgba(226,35,26,0.2),
          0 1px 3px rgba(226,35,26,0.12);
        letter-spacing:0.2px;
        animation:tagIn 0.25s cubic-bezier(0.16,1,0.3,1);
      }
      @keyframes tagIn{
        from{opacity:0;transform:scale(0.8)}
        to{opacity:1;transform:scale(1)}
      }
      .popup-selected-options .selected-tag button{
        background:rgba(255,255,255,0.25);
        border:none;
        color:#fff;
        font-size:20px;
        cursor:pointer;
        width:24px;
        height:24px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:0;
        line-height:1;
        transition:all 0.2s;
        font-weight:400;
      }
      .popup-selected-options .selected-tag button:hover{
        background:rgba(255,255,255,0.35);
        transform:rotate(90deg);
      }

      .popup-confirm{
        background:linear-gradient(135deg,#e2231a 0%,#c91e15 100%);
        border:none;
        color:#fff;
        font-size:18px;
        font-weight:900;
        border-radius:16px;
        padding:18px 0;
        width:calc(100% - 40px);
        margin:20px auto 24px;
        display:block;
        box-shadow:
          0 8px 28px rgba(226,35,26,0.28),
          0 3px 10px rgba(226,35,26,0.16);
        cursor:pointer;
        transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
        letter-spacing:0.5px;
      }
      .popup-confirm:hover{
        transform:translateY(-3px);
        box-shadow:
          0 12px 36px rgba(226,35,26,0.36),
          0 6px 16px rgba(226,35,26,0.2);
      }
      .popup-confirm:active{
        transform:translateY(-1px);
      }

      @media (max-width:600px){
        .popup-open-btn{
          top:20px;
          left:20px;
          padding:14px 28px;
          font-size:16px;
        }
        .popup-list button{
          font-size:15px;
          padding:14px 20px;
          min-width:88px;
        }
      }
    `;
    document.head.appendChild(style);
  })();

  /* ============ 4) UI + منطق (عزل الأقسام لكل سيارة) ============ */
  const openBtn = document.createElement("button");
  openBtn.className = "popup-open-btn";
  openBtn.textContent = "اختيار السيارة";
  document.body.appendChild(openBtn);

  const popup = document.createElement("div");
  popup.className = "fullpage-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-progress"></div>
      <div class="popup-top-bar">
        <button class="popup-back" style="display:none">رجوع</button>
        <input class="popup-search" type="text" placeholder="بحث..." autocomplete="off">
        <button class="popup-close">×</button>
      </div>
      <div class="popup-crumbs"></div>
      <div class="popup-selected-options"></div>
      <div class="popup-list"></div>
      <button class="popup-confirm" style="display:none">تأكيد</button>
    </div>
  `;
  document.body.appendChild(popup);

  let state = {
    brand: null,
    type: null,
    model: null,
    section: null,
    options: [],
  };
  let step = 0;

  const backBtn = popup.querySelector(".popup-back");
  const closeBtn = popup.querySelector(".popup-close");
  const searchInput = popup.querySelector(".popup-search");
  const listDiv = popup.querySelector(".popup-list");
  const crumbs = popup.querySelector(".popup-crumbs");
  const confirmBtn = popup.querySelector(".popup-confirm");
  const selectedOptionsDiv = popup.querySelector(".popup-selected-options");
  const progressDiv = popup.querySelector(".popup-progress");
  const stepsList = [
    { label: "01" },
    { label: "02" },
    { label: "03" },
    { label: "04" },
    { label: "05" },
  ];

  function setProgressBar(currentStep) {
    progressDiv.innerHTML = stepsList
      .map(
        (s, i) => `
      <div class="popup-step${i < currentStep ? " done" : ""}${
          i === currentStep ? " current" : ""
        }" data-step="${i}" ${i < currentStep ? 'tabindex="0"' : ""}>
        <span class="step-num">${s.label}</span>
        <span class="checkmark">✓</span>
      </div>`
      )
      .join("");
    progressDiv.querySelectorAll(".popup-step.done").forEach((el) => {
      el.onclick = function () {
        const stepIdx = Number(el.getAttribute("data-step"));
        if (stepIdx < step) {
          if (stepIdx < 4) state.options = [];
          if (stepIdx < 3) state.section = null;
          if (stepIdx < 2) state.model = null;
          if (stepIdx < 1) state.type = null;
          renderStep(stepIdx);
        }
      };
    });
  }

  function getRawCarNode(selectedType) {
    if (!selectedType || !selectedType.__brandKey || !selectedType.__carKey)
      return null;
    const brandNode = SECTION_TREE[selectedType.__brandKey];
    if (!brandNode) return null;
    const carNode = brandNode[selectedType.__carKey];
    return carNode && carNode._meta ? carNode : null;
  }

  function getSectionsOfSelectedCar() {
    const rawCar = getRawCarNode(state.type);
    const secs = Array.isArray(rawCar?.sections) ? rawCar.sections : [];
    return secs.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      options: Array.isArray(s.options) ? [...s.options] : [],
    }));
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
    if (state.section) crumbs.innerHTML += (state.section.name || "—") + " / ";

    if (step === 0) {
      CATEGORIES.forEach((brand) => {
        const btn = document.createElement("button");
        btn.textContent = brand.name || "—";
        if (state.brand?.id === brand.id) btn.className = "selected";
        btn.onclick = () => {
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
      (state.brand?.children || []).forEach((type) => {
        const btn = document.createElement("button");
        btn.textContent = type.name;
        if (state.type?.id === type.id) btn.className = "selected";
        btn.onclick = () => {
          state.type = type;
          state.model = null;
          state.section = null;
          state.options = [];
          renderStep(2);
        };
        listDiv.appendChild(btn);
      });
    } else if (step === 2) {
      (state.type?.children || []).forEach((model) => {
        const btn = document.createElement("button");
        btn.textContent = model.name;
        if (state.model?.id === model.id) btn.className = "selected";
        btn.onclick = () => {
          state.model = model;
          state.section = null;
          state.options = [];
          renderStep(3);
        };
        listDiv.appendChild(btn);
      });
    } else if (step === 3) {
      const sections = getSectionsOfSelectedCar();
      sections.forEach((section) => {
        const btn = document.createElement("button");
        btn.textContent = section.name;
        if (state.section?.id === section.id) btn.className = "selected";
        btn.onclick = () => {
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

      (state.options || []).forEach((opt) => {
        const tag = document.createElement("span");
        tag.className = "selected-tag";
        tag.textContent = opt;
        const remove = document.createElement("button");
        remove.innerHTML = "×";
        remove.onclick = () => {
          state.options = state.options.filter((x) => x !== opt);
          renderStep(4);
        };
        tag.appendChild(remove);
        selectedOptionsDiv.appendChild(tag);
      });

      const options = Array.isArray(state.section?.options)
        ? state.section.options
        : [];
      options.forEach((option) => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.className = state.options.includes(option) ? "selected" : "";
        btn.onclick = () => {
          if (!state.options.includes(option)) {
            if (state.options.length < 5) state.options.push(option);
          } else {
            state.options = state.options.filter((x) => x !== option);
          }
          renderStep(4);
        };
        listDiv.appendChild(btn);
      });

      // ====== هنا تعديل مسار الرابط حسب طلبك ======
      confirmBtn.onclick = function () {
        const carNodeRaw = getRawCarNode(state.type);
        const carMeta = carNodeRaw?._meta || {};
        const yearNode = state.model;
        const sectionObj = state.section;
        const brandMeta = state.brand || {};

        if (
          !brandMeta.id ||
          !carMeta.id ||
          !carMeta.slug ||
          !yearNode?.id ||
          !sectionObj?.id
        ) {
          alert(
            "ناقص معرّفات: تأكد من اختيار الشركة والسيارة والسنة والقسم وأن الـ slug موجود."
          );
          return;
        }

        const companyId = brandMeta.id; // الشركة (تويوتا، نيسان...)
        const carSlug = (carMeta.slug || "").trim(); // سلاج السيارة
        const categoryId = carMeta.id; // فئة السيارة
        const modelId = yearNode.id; // سنة الموديل
        const sectionId = sectionObj.id; // القسم

        let url =
          `https://darb.com.sa/category/${carSlug}` +
          `?filters[company]=${companyId}` +
          `&filters[category]=${categoryId}` +
          `&filters[category_id]=${modelId}` +
          `&filters[brand_id]=${sectionId}`;

        if (state.options?.length) {
          url += `&keyword=${state.options.join("||")}`;
        }

        window.location.href = url;
      };
      // ====== نهاية التعديل ======
    }

    searchInput.oninput = function () {
      const val = this.value.trim();
      [...listDiv.children].forEach((btn) => {
        btn.style.display = !val || btn.textContent.includes(val) ? "" : "none";
      });
    };

    backBtn.style.display = step > 0 ? "" : "none";
  }

  openBtn.onclick = async function () {
    const loadingBtnText = openBtn.textContent;
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
    try {
      await loadData();
      renderStep(0);
    } catch (e) {
      console.error(e);
      alert("تعذر تحميل SECTION_OPTIONS — تأكد من الوثيقة والصلاحيات.");
      renderStep(0);
    } finally {
      openBtn.disabled = false;
      openBtn.textContent = loadingBtnText;
    }
  };
  closeBtn.onclick = () => popup.classList.remove("active");
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
  popup.onclick = (e) => {
    if (e.target === popup) popup.classList.remove("active");
  };
})();

/*! ـــــــــــــــــــــ */

/*! ـــــــــــــــــــــ */

/*! ــــــــ  يبدا ـ choices.js ـــــــــــ */

(function () {
  // أضف ستايل Choices.js ديناميكيًا للصفحة
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css";
  document.head.appendChild(link);

  // ... باقي كودك هنا ...
  // تفعيل القوائم، أكواد choices الخ
})();

/*! choices.js v11.1.0 | © 2025 Josh Johnson | https://github.com/jshjohnson/Choices#readme */
!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define(t)
    : ((e = "undefined" != typeof globalThis ? globalThis : e || self).Choices =
        t());
})(this, function () {
  "use strict";
  var e = function (t, i) {
    return (
      (e =
        Object.setPrototypeOf ||
        ({
          __proto__: [],
        } instanceof Array &&
          function (e, t) {
            e.__proto__ = t;
          }) ||
        function (e, t) {
          for (var i in t)
            Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
        }),
      e(t, i)
    );
  };
  function t(t, i) {
    if ("function" != typeof i && null !== i)
      throw new TypeError(
        "Class extends value " + String(i) + " is not a constructor or null"
      );
    function n() {
      this.constructor = t;
    }
    e(t, i),
      (t.prototype =
        null === i ? Object.create(i) : ((n.prototype = i.prototype), new n()));
  }
  var i = function () {
    return (
      (i =
        Object.assign ||
        function (e) {
          for (var t, i = 1, n = arguments.length; i < n; i++)
            for (var s in (t = arguments[i]))
              Object.prototype.hasOwnProperty.call(t, s) && (e[s] = t[s]);
          return e;
        }),
      i.apply(this, arguments)
    );
  };
  function n(e, t, i) {
    if (i || 2 === arguments.length)
      for (var n, s = 0, o = t.length; s < o; s++)
        (!n && s in t) ||
          (n || (n = Array.prototype.slice.call(t, 0, s)), (n[s] = t[s]));
    return e.concat(n || Array.prototype.slice.call(t));
  }
  "function" == typeof SuppressedError && SuppressedError;
  var s,
    o = "ADD_CHOICE",
    r = "REMOVE_CHOICE",
    c = "FILTER_CHOICES",
    a = "ACTIVATE_CHOICES",
    h = "CLEAR_CHOICES",
    l = "ADD_GROUP",
    u = "ADD_ITEM",
    d = "REMOVE_ITEM",
    p = "HIGHLIGHT_ITEM",
    f = "search",
    m = "removeItem",
    g = "highlightItem",
    v = ["fuseOptions", "classNames"],
    _ = "select-one",
    y = "select-multiple",
    b = function (e) {
      return {
        type: o,
        choice: e,
      };
    },
    E = function (e) {
      return {
        type: u,
        item: e,
      };
    },
    C = function (e) {
      return {
        type: d,
        item: e,
      };
    },
    S = function (e, t) {
      return {
        type: p,
        item: e,
        highlighted: t,
      };
    },
    w = function (e) {
      return Array.from(
        {
          length: e,
        },
        function () {
          return Math.floor(36 * Math.random() + 0).toString(36);
        }
      ).join("");
    },
    I = function (e) {
      if ("string" != typeof e) {
        if (null == e) return "";
        if ("object" == typeof e) {
          if ("raw" in e) return I(e.raw);
          if ("trusted" in e) return e.trusted;
        }
        return e;
      }
      return e
        .replace(/&/g, "&amp;")
        .replace(/>/g, "&gt;")
        .replace(/</g, "&lt;")
        .replace(/'/g, "&#039;")
        .replace(/"/g, "&quot;");
    },
    A =
      ((s = document.createElement("div")),
      function (e) {
        s.innerHTML = e.trim();
        for (var t = s.children[0]; s.firstChild; ) s.removeChild(s.firstChild);
        return t;
      }),
    x = function (e, t) {
      return "function" == typeof e ? e(I(t), t) : e;
    },
    O = function (e) {
      return "function" == typeof e ? e() : e;
    },
    L = function (e) {
      if ("string" == typeof e) return e;
      if ("object" == typeof e) {
        if ("trusted" in e) return e.trusted;
        if ("raw" in e) return e.raw;
      }
      return "";
    },
    M = function (e) {
      if ("string" == typeof e) return e;
      if ("object" == typeof e) {
        if ("escaped" in e) return e.escaped;
        if ("trusted" in e) return e.trusted;
      }
      return "";
    },
    T = function (e, t) {
      return e ? M(t) : I(t);
    },
    N = function (e, t, i) {
      e.innerHTML = T(t, i);
    },
    k = function (e, t) {
      return e.rank - t.rank;
    },
    F = function (e) {
      return Array.isArray(e) ? e : [e];
    },
    D = function (e) {
      return e && Array.isArray(e)
        ? e
            .map(function (e) {
              return ".".concat(e);
            })
            .join("")
        : ".".concat(e);
    },
    P = function (e, t) {
      var i;
      (i = e.classList).add.apply(i, F(t));
    },
    j = function (e, t) {
      var i;
      (i = e.classList).remove.apply(i, F(t));
    },
    R = function (e) {
      if (void 0 !== e)
        try {
          return JSON.parse(e);
        } catch (t) {
          return e;
        }
      return {};
    },
    K = (function () {
      function e(e) {
        var t = e.type,
          i = e.classNames;
        (this.element = e.element),
          (this.classNames = i),
          (this.type = t),
          (this.isActive = !1);
      }
      return (
        (e.prototype.show = function () {
          return (
            P(this.element, this.classNames.activeState),
            this.element.setAttribute("aria-expanded", "true"),
            (this.isActive = !0),
            this
          );
        }),
        (e.prototype.hide = function () {
          return (
            j(this.element, this.classNames.activeState),
            this.element.setAttribute("aria-expanded", "false"),
            (this.isActive = !1),
            this
          );
        }),
        e
      );
    })(),
    V = (function () {
      function e(e) {
        var t = e.type,
          i = e.classNames,
          n = e.position;
        (this.element = e.element),
          (this.classNames = i),
          (this.type = t),
          (this.position = n),
          (this.isOpen = !1),
          (this.isFlipped = !1),
          (this.isDisabled = !1),
          (this.isLoading = !1);
      }
      return (
        (e.prototype.shouldFlip = function (e, t) {
          var i = !1;
          return (
            "auto" === this.position
              ? (i =
                  this.element.getBoundingClientRect().top - t >= 0 &&
                  !window.matchMedia("(min-height: ".concat(e + 1, "px)"))
                    .matches)
              : "top" === this.position && (i = !0),
            i
          );
        }),
        (e.prototype.setActiveDescendant = function (e) {
          this.element.setAttribute("aria-activedescendant", e);
        }),
        (e.prototype.removeActiveDescendant = function () {
          this.element.removeAttribute("aria-activedescendant");
        }),
        (e.prototype.open = function (e, t) {
          P(this.element, this.classNames.openState),
            this.element.setAttribute("aria-expanded", "true"),
            (this.isOpen = !0),
            this.shouldFlip(e, t) &&
              (P(this.element, this.classNames.flippedState),
              (this.isFlipped = !0));
        }),
        (e.prototype.close = function () {
          j(this.element, this.classNames.openState),
            this.element.setAttribute("aria-expanded", "false"),
            this.removeActiveDescendant(),
            (this.isOpen = !1),
            this.isFlipped &&
              (j(this.element, this.classNames.flippedState),
              (this.isFlipped = !1));
        }),
        (e.prototype.addFocusState = function () {
          P(this.element, this.classNames.focusState);
        }),
        (e.prototype.removeFocusState = function () {
          j(this.element, this.classNames.focusState);
        }),
        (e.prototype.enable = function () {
          j(this.element, this.classNames.disabledState),
            this.element.removeAttribute("aria-disabled"),
            this.type === _ && this.element.setAttribute("tabindex", "0"),
            (this.isDisabled = !1);
        }),
        (e.prototype.disable = function () {
          P(this.element, this.classNames.disabledState),
            this.element.setAttribute("aria-disabled", "true"),
            this.type === _ && this.element.setAttribute("tabindex", "-1"),
            (this.isDisabled = !0);
        }),
        (e.prototype.wrap = function (e) {
          var t = this.element,
            i = e.parentNode;
          i &&
            (e.nextSibling
              ? i.insertBefore(t, e.nextSibling)
              : i.appendChild(t)),
            t.appendChild(e);
        }),
        (e.prototype.unwrap = function (e) {
          var t = this.element,
            i = t.parentNode;
          i && (i.insertBefore(e, t), i.removeChild(t));
        }),
        (e.prototype.addLoadingState = function () {
          P(this.element, this.classNames.loadingState),
            this.element.setAttribute("aria-busy", "true"),
            (this.isLoading = !0);
        }),
        (e.prototype.removeLoadingState = function () {
          j(this.element, this.classNames.loadingState),
            this.element.removeAttribute("aria-busy"),
            (this.isLoading = !1);
        }),
        e
      );
    })(),
    B = (function () {
      function e(e) {
        var t = e.element,
          i = e.type,
          n = e.classNames,
          s = e.preventPaste;
        (this.element = t),
          (this.type = i),
          (this.classNames = n),
          (this.preventPaste = s),
          (this.isFocussed = this.element.isEqualNode(document.activeElement)),
          (this.isDisabled = t.disabled),
          (this._onPaste = this._onPaste.bind(this)),
          (this._onInput = this._onInput.bind(this)),
          (this._onFocus = this._onFocus.bind(this)),
          (this._onBlur = this._onBlur.bind(this));
      }
      return (
        Object.defineProperty(e.prototype, "placeholder", {
          set: function (e) {
            this.element.placeholder = e;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, "value", {
          get: function () {
            return this.element.value;
          },
          set: function (e) {
            this.element.value = e;
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.prototype.addEventListeners = function () {
          var e = this.element;
          e.addEventListener("paste", this._onPaste),
            e.addEventListener("input", this._onInput, {
              passive: !0,
            }),
            e.addEventListener("focus", this._onFocus, {
              passive: !0,
            }),
            e.addEventListener("blur", this._onBlur, {
              passive: !0,
            });
        }),
        (e.prototype.removeEventListeners = function () {
          var e = this.element;
          e.removeEventListener("input", this._onInput),
            e.removeEventListener("paste", this._onPaste),
            e.removeEventListener("focus", this._onFocus),
            e.removeEventListener("blur", this._onBlur);
        }),
        (e.prototype.enable = function () {
          this.element.removeAttribute("disabled"), (this.isDisabled = !1);
        }),
        (e.prototype.disable = function () {
          this.element.setAttribute("disabled", ""), (this.isDisabled = !0);
        }),
        (e.prototype.focus = function () {
          this.isFocussed || this.element.focus();
        }),
        (e.prototype.blur = function () {
          this.isFocussed && this.element.blur();
        }),
        (e.prototype.clear = function (e) {
          return (
            void 0 === e && (e = !0),
            (this.element.value = ""),
            e && this.setWidth(),
            this
          );
        }),
        (e.prototype.setWidth = function () {
          var e = this.element;
          (e.style.minWidth = "".concat(e.placeholder.length + 1, "ch")),
            (e.style.width = "".concat(e.value.length + 1, "ch"));
        }),
        (e.prototype.setActiveDescendant = function (e) {
          this.element.setAttribute("aria-activedescendant", e);
        }),
        (e.prototype.removeActiveDescendant = function () {
          this.element.removeAttribute("aria-activedescendant");
        }),
        (e.prototype._onInput = function () {
          this.type !== _ && this.setWidth();
        }),
        (e.prototype._onPaste = function (e) {
          this.preventPaste && e.preventDefault();
        }),
        (e.prototype._onFocus = function () {
          this.isFocussed = !0;
        }),
        (e.prototype._onBlur = function () {
          this.isFocussed = !1;
        }),
        e
      );
    })(),
    H = (function () {
      function e(e) {
        (this.element = e.element),
          (this.scrollPos = this.element.scrollTop),
          (this.height = this.element.offsetHeight);
      }
      return (
        (e.prototype.prepend = function (e) {
          var t = this.element.firstElementChild;
          t ? this.element.insertBefore(e, t) : this.element.append(e);
        }),
        (e.prototype.scrollToTop = function () {
          this.element.scrollTop = 0;
        }),
        (e.prototype.scrollToChildElement = function (e, t) {
          var i = this;
          if (e) {
            var n =
              t > 0
                ? this.element.scrollTop +
                  (e.offsetTop + e.offsetHeight) -
                  (this.element.scrollTop + this.element.offsetHeight)
                : e.offsetTop;
            requestAnimationFrame(function () {
              i._animateScroll(n, t);
            });
          }
        }),
        (e.prototype._scrollDown = function (e, t, i) {
          var n = (i - e) / t;
          this.element.scrollTop = e + (n > 1 ? n : 1);
        }),
        (e.prototype._scrollUp = function (e, t, i) {
          var n = (e - i) / t;
          this.element.scrollTop = e - (n > 1 ? n : 1);
        }),
        (e.prototype._animateScroll = function (e, t) {
          var i = this,
            n = this.element.scrollTop,
            s = !1;
          t > 0
            ? (this._scrollDown(n, 4, e), n < e && (s = !0))
            : (this._scrollUp(n, 4, e), n > e && (s = !0)),
            s &&
              requestAnimationFrame(function () {
                i._animateScroll(e, t);
              });
        }),
        e
      );
    })(),
    $ = (function () {
      function e(e) {
        var t = e.classNames;
        (this.element = e.element),
          (this.classNames = t),
          (this.isDisabled = !1);
      }
      return (
        Object.defineProperty(e.prototype, "isActive", {
          get: function () {
            return "active" === this.element.dataset.choice;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, "dir", {
          get: function () {
            return this.element.dir;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, "value", {
          get: function () {
            return this.element.value;
          },
          set: function (e) {
            this.element.setAttribute("value", e), (this.element.value = e);
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.prototype.conceal = function () {
          var e = this.element;
          P(e, this.classNames.input), (e.hidden = !0), (e.tabIndex = -1);
          var t = e.getAttribute("style");
          t && e.setAttribute("data-choice-orig-style", t),
            e.setAttribute("data-choice", "active");
        }),
        (e.prototype.reveal = function () {
          var e = this.element;
          j(e, this.classNames.input),
            (e.hidden = !1),
            e.removeAttribute("tabindex");
          var t = e.getAttribute("data-choice-orig-style");
          t
            ? (e.removeAttribute("data-choice-orig-style"),
              e.setAttribute("style", t))
            : e.removeAttribute("style"),
            e.removeAttribute("data-choice");
        }),
        (e.prototype.enable = function () {
          this.element.removeAttribute("disabled"),
            (this.element.disabled = !1),
            (this.isDisabled = !1);
        }),
        (e.prototype.disable = function () {
          this.element.setAttribute("disabled", ""),
            (this.element.disabled = !0),
            (this.isDisabled = !0);
        }),
        (e.prototype.triggerEvent = function (e, t) {
          var i;
          void 0 === (i = t || {}) && (i = null),
            this.element.dispatchEvent(
              new CustomEvent(e, {
                detail: i,
                bubbles: !0,
                cancelable: !0,
              })
            );
        }),
        e
      );
    })(),
    q = (function (e) {
      function i() {
        return (null !== e && e.apply(this, arguments)) || this;
      }
      return t(i, e), i;
    })($),
    W = function (e, t) {
      return void 0 === t && (t = !0), void 0 === e ? t : !!e;
    },
    U = function (e) {
      if (
        ("string" == typeof e &&
          (e = e.split(" ").filter(function (e) {
            return e.length;
          })),
        Array.isArray(e) && e.length)
      )
        return e;
    },
    G = function (e, t, i) {
      if ((void 0 === i && (i = !0), "string" == typeof e)) {
        var n = I(e);
        return G(
          {
            value: e,
            label:
              i || n === e
                ? e
                : {
                    escaped: n,
                    raw: e,
                  },
            selected: !0,
          },
          !1
        );
      }
      var s = e;
      if ("choices" in s) {
        if (!t) throw new TypeError("optGroup is not allowed");
        var o = s,
          r = o.choices.map(function (e) {
            return G(e, !1);
          });
        return {
          id: 0,
          label: L(o.label) || o.value,
          active: !!r.length,
          disabled: !!o.disabled,
          choices: r,
        };
      }
      var c = s;
      return {
        id: 0,
        group: null,
        score: 0,
        rank: 0,
        value: c.value,
        label: c.label || c.value,
        active: W(c.active),
        selected: W(c.selected, !1),
        disabled: W(c.disabled, !1),
        placeholder: W(c.placeholder, !1),
        highlighted: !1,
        labelClass: U(c.labelClass),
        labelDescription: c.labelDescription,
        customProperties: c.customProperties,
      };
    },
    z = function (e) {
      return "SELECT" === e.tagName;
    },
    J = (function (e) {
      function i(t) {
        var i = t.template,
          n = t.extractPlaceholder,
          s =
            e.call(this, {
              element: t.element,
              classNames: t.classNames,
            }) || this;
        return (s.template = i), (s.extractPlaceholder = n), s;
      }
      return (
        t(i, e),
        Object.defineProperty(i.prototype, "placeholderOption", {
          get: function () {
            return (
              this.element.querySelector('option[value=""]') ||
              this.element.querySelector("option[placeholder]")
            );
          },
          enumerable: !1,
          configurable: !0,
        }),
        (i.prototype.addOptions = function (e) {
          var t = this,
            i = document.createDocumentFragment();
          e.forEach(function (e) {
            var n = e;
            if (!n.element) {
              var s = t.template(n);
              i.appendChild(s), (n.element = s);
            }
          }),
            this.element.appendChild(i);
        }),
        (i.prototype.optionsAsChoices = function () {
          var e = this,
            t = [];
          return (
            this.element
              .querySelectorAll(":scope > option, :scope > optgroup")
              .forEach(function (i) {
                !(function (e) {
                  return "OPTION" === e.tagName;
                })(i)
                  ? (function (e) {
                      return "OPTGROUP" === e.tagName;
                    })(i) && t.push(e._optgroupToChoice(i))
                  : t.push(e._optionToChoice(i));
              }),
            t
          );
        }),
        (i.prototype._optionToChoice = function (e) {
          return (
            !e.hasAttribute("value") &&
              e.hasAttribute("placeholder") &&
              (e.setAttribute("value", ""), (e.value = "")),
            {
              id: 0,
              group: null,
              score: 0,
              rank: 0,
              value: e.value,
              label: e.label,
              element: e,
              active: !0,
              selected: this.extractPlaceholder
                ? e.selected
                : e.hasAttribute("selected"),
              disabled: e.disabled,
              highlighted: !1,
              placeholder:
                this.extractPlaceholder &&
                (!e.value || e.hasAttribute("placeholder")),
              labelClass:
                void 0 !== e.dataset.labelClass
                  ? U(e.dataset.labelClass)
                  : void 0,
              labelDescription:
                void 0 !== e.dataset.labelDescription
                  ? e.dataset.labelDescription
                  : void 0,
              customProperties: R(e.dataset.customProperties),
            }
          );
        }),
        (i.prototype._optgroupToChoice = function (e) {
          var t = this,
            i = e.querySelectorAll("option"),
            n = Array.from(i).map(function (e) {
              return t._optionToChoice(e);
            });
          return {
            id: 0,
            label: e.label || "",
            element: e,
            active: !!n.length,
            disabled: e.disabled,
            choices: n,
          };
        }),
        i
      );
    })($),
    X = {
      items: [],
      choices: [],
      silent: !1,
      renderChoiceLimit: -1,
      maxItemCount: -1,
      closeDropdownOnSelect: "auto",
      singleModeForMultiSelect: !1,
      addChoices: !1,
      addItems: !0,
      addItemFilter: function (e) {
        return !!e && "" !== e;
      },
      removeItems: !0,
      removeItemButton: !1,
      removeItemButtonAlignLeft: !1,
      editItems: !1,
      allowHTML: !1,
      allowHtmlUserInput: !1,
      duplicateItemsAllowed: !0,
      delimiter: ",",
      paste: !0,
      searchEnabled: !0,
      searchChoices: !0,
      searchFloor: 1,
      searchResultLimit: 4,
      searchFields: ["label", "value"],
      position: "auto",
      resetScrollPosition: !0,
      shouldSort: !0,
      shouldSortItems: !1,
      sorter: function (e, t) {
        var i = e.label,
          n = t.label,
          s = void 0 === n ? t.value : n;
        return L(void 0 === i ? e.value : i).localeCompare(L(s), [], {
          sensitivity: "base",
          ignorePunctuation: !0,
          numeric: !0,
        });
      },
      shadowRoot: null,
      placeholder: !0,
      placeholderValue: null,
      searchPlaceholderValue: null,
      prependValue: null,
      appendValue: null,
      renderSelectedChoices: "تلقائي",
      loadingText: "جارٍ التحميل...",
      noResultsText: "لم يتم العثور على نتائج",
      noChoicesText: "لا توجد خيارات متاحة",
      itemSelectText: "اختر",
      uniqueItemText: "يمكن إضافة القيم الفريدة فقط",
      customAddItemText: "يمكن إضافة القيم التي تطابق الشروط المحددة فقط",
      addItemText: function (e) {
        return 'اضغط Enter لإضافة <b>"'.concat(e, '"</b>');
      },
      removeItemIconText: function () {
        return "إزالة العنصر";
      },
      removeItemLabelText: function (e) {
        return "إزالة العنصر: ".concat(e);
      },
      maxItemText: function (e) {
        return " المسموح بإضافة ".concat(e, " قيم فقط");
      },

      valueComparer: function (e, t) {
        return e === t;
      },
      fuseOptions: {
        includeScore: !0,
      },
      labelId: "",
      callbackOnInit: null,
      callbackOnCreateTemplates: null,
      classNames: {
        containerOuter: ["choices"],
        containerInner: ["choices__inner"],
        input: ["choices__input"],
        inputCloned: ["choices__input--cloned"],
        list: ["choices__list"],
        listItems: ["choices__list--multiple"],
        listSingle: ["choices__list--single"],
        listDropdown: ["choices__list--dropdown"],
        item: ["choices__item"],
        itemSelectable: ["choices__item--selectable"],
        itemDisabled: ["choices__item--disabled"],
        itemChoice: ["choices__item--choice"],
        description: ["choices__description"],
        placeholder: ["choices__placeholder"],
        group: ["choices__group"],
        groupHeading: ["choices__heading"],
        button: ["choices__button"],
        activeState: ["is-active"],
        focusState: ["is-focused"],
        openState: ["is-open"],
        disabledState: ["is-disabled"],
        highlightedState: ["is-highlighted"],
        selectedState: ["is-selected"],
        flippedState: ["is-flipped"],
        loadingState: ["is-loading"],
        notice: ["choices__notice"],
        addChoice: ["choices__item--selectable", "add-choice"],
        noResults: ["has-no-results"],
        noChoices: ["has-no-choices"],
      },
      appendGroupInSearch: !1,
    },
    Q = function (e) {
      var t = e.itemEl;
      t && (t.remove(), (e.itemEl = void 0));
    },
    Y = {
      groups: function (e, t) {
        var i = e,
          n = !0;
        switch (t.type) {
          case l:
            i.push(t.group);
            break;
          case h:
            i = [];
            break;
          default:
            n = !1;
        }
        return {
          state: i,
          update: n,
        };
      },
      items: function (e, t, i) {
        var n = e,
          s = !0;
        switch (t.type) {
          case u:
            (t.item.selected = !0),
              (o = t.item.element) &&
                ((o.selected = !0), o.setAttribute("selected", "")),
              n.push(t.item);
            break;
          case d:
            var o;
            if (((t.item.selected = !1), (o = t.item.element))) {
              (o.selected = !1), o.removeAttribute("selected");
              var c = o.parentElement;
              c && z(c) && c.type === _ && (c.value = "");
            }
            Q(t.item),
              (n = n.filter(function (e) {
                return e.id !== t.item.id;
              }));
            break;
          case r:
            Q(t.choice),
              (n = n.filter(function (e) {
                return e.id !== t.choice.id;
              }));
            break;
          case p:
            var a = t.highlighted,
              h = n.find(function (e) {
                return e.id === t.item.id;
              });
            h &&
              h.highlighted !== a &&
              ((h.highlighted = a),
              i &&
                (function (e, t, i) {
                  var n = e.itemEl;
                  n && (j(n, i), P(n, t));
                })(
                  h,
                  a
                    ? i.classNames.highlightedState
                    : i.classNames.selectedState,
                  a ? i.classNames.selectedState : i.classNames.highlightedState
                ));
            break;
          default:
            s = !1;
        }
        return {
          state: n,
          update: s,
        };
      },
      choices: function (e, t, i) {
        var n = e,
          s = !0;
        switch (t.type) {
          case o:
            n.push(t.choice);
            break;
          case r:
            (t.choice.choiceEl = void 0),
              t.choice.group &&
                (t.choice.group.choices = t.choice.group.choices.filter(
                  function (e) {
                    return e.id !== t.choice.id;
                  }
                )),
              (n = n.filter(function (e) {
                return e.id !== t.choice.id;
              }));
            break;
          case u:
          case d:
            t.item.choiceEl = void 0;
            break;
          case c:
            var l = [];
            t.results.forEach(function (e) {
              l[e.item.id] = e;
            }),
              n.forEach(function (e) {
                var t = l[e.id];
                void 0 !== t
                  ? ((e.score = t.score), (e.rank = t.rank), (e.active = !0))
                  : ((e.score = 0), (e.rank = 0), (e.active = !1)),
                  i && i.appendGroupInSearch && (e.choiceEl = void 0);
              });
            break;
          case a:
            n.forEach(function (e) {
              (e.active = t.active),
                i && i.appendGroupInSearch && (e.choiceEl = void 0);
            });
            break;
          case h:
            n = [];
            break;
          default:
            s = !1;
        }
        return {
          state: n,
          update: s,
        };
      },
    },
    Z = (function () {
      function e(e) {
        (this._state = this.defaultState),
          (this._listeners = []),
          (this._txn = 0),
          (this._context = e);
      }
      return (
        Object.defineProperty(e.prototype, "defaultState", {
          get: function () {
            return {
              groups: [],
              items: [],
              choices: [],
            };
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.prototype.changeSet = function (e) {
          return {
            groups: e,
            items: e,
            choices: e,
          };
        }),
        (e.prototype.reset = function () {
          this._state = this.defaultState;
          var e = this.changeSet(!0);
          this._txn
            ? (this._changeSet = e)
            : this._listeners.forEach(function (t) {
                return t(e);
              });
        }),
        (e.prototype.subscribe = function (e) {
          return this._listeners.push(e), this;
        }),
        (e.prototype.dispatch = function (e) {
          var t = this,
            i = this._state,
            n = !1,
            s = this._changeSet || this.changeSet(!1);
          Object.keys(Y).forEach(function (o) {
            var r = Y[o](i[o], e, t._context);
            r.update && ((n = !0), (s[o] = !0), (i[o] = r.state));
          }),
            n &&
              (this._txn
                ? (this._changeSet = s)
                : this._listeners.forEach(function (e) {
                    return e(s);
                  }));
        }),
        (e.prototype.withTxn = function (e) {
          this._txn++;
          try {
            e();
          } finally {
            if (((this._txn = Math.max(0, this._txn - 1)), !this._txn)) {
              var t = this._changeSet;
              t &&
                ((this._changeSet = void 0),
                this._listeners.forEach(function (e) {
                  return e(t);
                }));
            }
          }
        }),
        Object.defineProperty(e.prototype, "state", {
          get: function () {
            return this._state;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, "items", {
          get: function () {
            return this.state.items;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, "highlightedActiveItems", {
          get: function () {
            return this.items.filter(function (e) {
              return e.active && e.highlighted;
            });
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, "choices", {
          get: function () {
            return this.state.choices;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, "activeChoices", {
          get: function () {
            return this.choices.filter(function (e) {
              return e.active;
            });
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, "searchableChoices", {
          get: function () {
            return this.choices.filter(function (e) {
              return !e.disabled && !e.placeholder;
            });
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, "groups", {
          get: function () {
            return this.state.groups;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, "activeGroups", {
          get: function () {
            var e = this;
            return this.state.groups.filter(function (t) {
              var i = t.active && !t.disabled,
                n = e.state.choices.some(function (e) {
                  return e.active && !e.disabled;
                });
              return i && n;
            }, []);
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.prototype.inTxn = function () {
          return this._txn > 0;
        }),
        (e.prototype.getChoiceById = function (e) {
          return this.activeChoices.find(function (t) {
            return t.id === e;
          });
        }),
        (e.prototype.getGroupById = function (e) {
          return this.groups.find(function (t) {
            return t.id === e;
          });
        }),
        e
      );
    })(),
    ee = "no-choices",
    te = "no-results",
    ie = "add-choice";
  function ne(e, t, i) {
    return (
      (t = (function (e) {
        var t = (function (e) {
          if ("object" != typeof e || !e) return e;
          var t = e[Symbol.toPrimitive];
          if (void 0 !== t) {
            var i = t.call(e, "string");
            if ("object" != typeof i) return i;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return String(e);
        })(e);
        return "symbol" == typeof t ? t : t + "";
      })(t)) in e
        ? Object.defineProperty(e, t, {
            value: i,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (e[t] = i),
      e
    );
  }
  function se(e, t) {
    var i = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      t &&
        (n = n.filter(function (t) {
          return Object.getOwnPropertyDescriptor(e, t).enumerable;
        })),
        i.push.apply(i, n);
    }
    return i;
  }
  function oe(e) {
    for (var t = 1; t < arguments.length; t++) {
      var i = null != arguments[t] ? arguments[t] : {};
      t % 2
        ? se(Object(i), !0).forEach(function (t) {
            ne(e, t, i[t]);
          })
        : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(i))
        : se(Object(i)).forEach(function (t) {
            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(i, t));
          });
    }
    return e;
  }
  function re(e) {
    return Array.isArray ? Array.isArray(e) : "[object Array]" === de(e);
  }
  function ce(e) {
    return "string" == typeof e;
  }
  function ae(e) {
    return "number" == typeof e;
  }
  function he(e) {
    return "object" == typeof e;
  }
  function le(e) {
    return null != e;
  }
  function ue(e) {
    return !e.trim().length;
  }
  function de(e) {
    return null == e
      ? void 0 === e
        ? "[object Undefined]"
        : "[object Null]"
      : Object.prototype.toString.call(e);
  }
  const pe = (e) => `Missing ${e} property in key`,
    fe = (e) => `Property 'weight' in key '${e}' must be a positive integer`,
    me = Object.prototype.hasOwnProperty;
  class ge {
    constructor(e) {
      (this._keys = []), (this._keyMap = {});
      let t = 0;
      e.forEach((e) => {
        let i = ve(e);
        this._keys.push(i), (this._keyMap[i.id] = i), (t += i.weight);
      }),
        this._keys.forEach((e) => {
          e.weight /= t;
        });
    }
    get(e) {
      return this._keyMap[e];
    }
    keys() {
      return this._keys;
    }
    toJSON() {
      return JSON.stringify(this._keys);
    }
  }
  function ve(e) {
    let t = null,
      i = null,
      n = null,
      s = 1,
      o = null;
    if (ce(e) || re(e)) (n = e), (t = _e(e)), (i = ye(e));
    else {
      if (!me.call(e, "name")) throw new Error(pe("name"));
      const r = e.name;
      if (((n = r), me.call(e, "weight") && ((s = e.weight), s <= 0)))
        throw new Error(fe(r));
      (t = _e(r)), (i = ye(r)), (o = e.getFn);
    }
    return {
      path: t,
      id: i,
      weight: s,
      src: n,
      getFn: o,
    };
  }
  function _e(e) {
    return re(e) ? e : e.split(".");
  }
  function ye(e) {
    return re(e) ? e.join(".") : e;
  }
  const be = {
    useExtendedSearch: !1,
    getFn: function (e, t) {
      let i = [],
        n = !1;
      const s = (e, t, o) => {
        if (le(e))
          if (t[o]) {
            const r = e[t[o]];
            if (!le(r)) return;
            if (
              o === t.length - 1 &&
              (ce(r) ||
                ae(r) ||
                (function (e) {
                  return (
                    !0 === e ||
                    !1 === e ||
                    ((function (e) {
                      return he(e) && null !== e;
                    })(e) &&
                      "[object Boolean]" == de(e))
                  );
                })(r))
            )
              i.push(
                (function (e) {
                  return null == e
                    ? ""
                    : (function (e) {
                        if ("string" == typeof e) return e;
                        let t = e + "";
                        return "0" == t && 1 / e == -1 / 0 ? "-0" : t;
                      })(e);
                })(r)
              );
            else if (re(r)) {
              n = !0;
              for (let e = 0, i = r.length; e < i; e += 1) s(r[e], t, o + 1);
            } else t.length && s(r, t, o + 1);
          } else i.push(e);
      };
      return s(e, ce(t) ? t.split(".") : t, 0), n ? i : i[0];
    },
    ignoreLocation: !1,
    ignoreFieldNorm: !1,
    fieldNormWeight: 1,
  };
  var Ee = oe(
    oe(
      oe(
        oe(
          {},
          {
            isCaseSensitive: !1,
            includeScore: !1,
            keys: [],
            shouldSort: !0,
            sortFn: (e, t) =>
              e.score === t.score
                ? e.idx < t.idx
                  ? -1
                  : 1
                : e.score < t.score
                ? -1
                : 1,
          }
        ),
        {
          includeMatches: !1,
          findAllMatches: !1,
          minMatchCharLength: 1,
        }
      ),
      {
        location: 0,
        threshold: 0.6,
        distance: 100,
      }
    ),
    be
  );
  const Ce = /[^ ]+/g;
  class Se {
    constructor({
      getFn: e = Ee.getFn,
      fieldNormWeight: t = Ee.fieldNormWeight,
    } = {}) {
      (this.norm = (function (e = 1, t = 3) {
        const i = new Map(),
          n = Math.pow(10, t);
        return {
          get(t) {
            const s = t.match(Ce).length;
            if (i.has(s)) return i.get(s);
            const o = 1 / Math.pow(s, 0.5 * e),
              r = parseFloat(Math.round(o * n) / n);
            return i.set(s, r), r;
          },
          clear() {
            i.clear();
          },
        };
      })(t, 3)),
        (this.getFn = e),
        (this.isCreated = !1),
        this.setIndexRecords();
    }
    setSources(e = []) {
      this.docs = e;
    }
    setIndexRecords(e = []) {
      this.records = e;
    }
    setKeys(e = []) {
      (this.keys = e),
        (this._keysMap = {}),
        e.forEach((e, t) => {
          this._keysMap[e.id] = t;
        });
    }
    create() {
      !this.isCreated &&
        this.docs.length &&
        ((this.isCreated = !0),
        ce(this.docs[0])
          ? this.docs.forEach((e, t) => {
              this._addString(e, t);
            })
          : this.docs.forEach((e, t) => {
              this._addObject(e, t);
            }),
        this.norm.clear());
    }
    add(e) {
      const t = this.size();
      ce(e) ? this._addString(e, t) : this._addObject(e, t);
    }
    removeAt(e) {
      this.records.splice(e, 1);
      for (let t = e, i = this.size(); t < i; t += 1) this.records[t].i -= 1;
    }
    getValueForItemAtKeyId(e, t) {
      return e[this._keysMap[t]];
    }
    size() {
      return this.records.length;
    }
    _addString(e, t) {
      if (!le(e) || ue(e)) return;
      let i = {
        v: e,
        i: t,
        n: this.norm.get(e),
      };
      this.records.push(i);
    }
    _addObject(e, t) {
      let i = {
        i: t,
        $: {},
      };
      this.keys.forEach((t, n) => {
        let s = t.getFn ? t.getFn(e) : this.getFn(e, t.path);
        if (le(s))
          if (re(s)) {
            let e = [];
            const t = [
              {
                nestedArrIndex: -1,
                value: s,
              },
            ];
            for (; t.length; ) {
              const { nestedArrIndex: i, value: n } = t.pop();
              if (le(n))
                if (ce(n) && !ue(n)) {
                  let t = {
                    v: n,
                    i: i,
                    n: this.norm.get(n),
                  };
                  e.push(t);
                } else
                  re(n) &&
                    n.forEach((e, i) => {
                      t.push({
                        nestedArrIndex: i,
                        value: e,
                      });
                    });
            }
            i.$[n] = e;
          } else if (ce(s) && !ue(s)) {
            let e = {
              v: s,
              n: this.norm.get(s),
            };
            i.$[n] = e;
          }
      }),
        this.records.push(i);
    }
    toJSON() {
      return {
        keys: this.keys,
        records: this.records,
      };
    }
  }
  function we(
    e,
    t,
    { getFn: i = Ee.getFn, fieldNormWeight: n = Ee.fieldNormWeight } = {}
  ) {
    const s = new Se({
      getFn: i,
      fieldNormWeight: n,
    });
    return s.setKeys(e.map(ve)), s.setSources(t), s.create(), s;
  }
  function Ie(
    e,
    {
      errors: t = 0,
      currentLocation: i = 0,
      expectedLocation: n = 0,
      distance: s = Ee.distance,
      ignoreLocation: o = Ee.ignoreLocation,
    } = {}
  ) {
    const r = t / e.length;
    if (o) return r;
    const c = Math.abs(n - i);
    return s ? r + c / s : c ? 1 : r;
  }
  const Ae = 32;
  function xe(e) {
    let t = {};
    for (let i = 0, n = e.length; i < n; i += 1) {
      const s = e.charAt(i);
      t[s] = (t[s] || 0) | (1 << (n - i - 1));
    }
    return t;
  }
  class Oe {
    constructor(
      e,
      {
        location: t = Ee.location,
        threshold: i = Ee.threshold,
        distance: n = Ee.distance,
        includeMatches: s = Ee.includeMatches,
        findAllMatches: o = Ee.findAllMatches,
        minMatchCharLength: r = Ee.minMatchCharLength,
        isCaseSensitive: c = Ee.isCaseSensitive,
        ignoreLocation: a = Ee.ignoreLocation,
      } = {}
    ) {
      if (
        ((this.options = {
          location: t,
          threshold: i,
          distance: n,
          includeMatches: s,
          findAllMatches: o,
          minMatchCharLength: r,
          isCaseSensitive: c,
          ignoreLocation: a,
        }),
        (this.pattern = c ? e : e.toLowerCase()),
        (this.chunks = []),
        !this.pattern.length)
      )
        return;
      const h = (e, t) => {
          this.chunks.push({
            pattern: e,
            alphabet: xe(e),
            startIndex: t,
          });
        },
        l = this.pattern.length;
      if (l > Ae) {
        let e = 0;
        const t = l % Ae,
          i = l - t;
        for (; e < i; ) h(this.pattern.substr(e, Ae), e), (e += Ae);
        if (t) {
          const e = l - Ae;
          h(this.pattern.substr(e), e);
        }
      } else h(this.pattern, 0);
    }
    searchIn(e) {
      const { isCaseSensitive: t, includeMatches: i } = this.options;
      if ((t || (e = e.toLowerCase()), this.pattern === e)) {
        let t = {
          isMatch: !0,
          score: 0,
        };
        return i && (t.indices = [[0, e.length - 1]]), t;
      }
      const {
        location: n,
        distance: s,
        threshold: o,
        findAllMatches: r,
        minMatchCharLength: c,
        ignoreLocation: a,
      } = this.options;
      let h = [],
        l = 0,
        u = !1;
      this.chunks.forEach(({ pattern: t, alphabet: d, startIndex: p }) => {
        const {
          isMatch: f,
          score: m,
          indices: g,
        } = (function (
          e,
          t,
          i,
          {
            location: n = Ee.location,
            distance: s = Ee.distance,
            threshold: o = Ee.threshold,
            findAllMatches: r = Ee.findAllMatches,
            minMatchCharLength: c = Ee.minMatchCharLength,
            includeMatches: a = Ee.includeMatches,
            ignoreLocation: h = Ee.ignoreLocation,
          } = {}
        ) {
          if (t.length > Ae)
            throw new Error("Pattern length exceeds max of 32.");
          const l = t.length,
            u = e.length,
            d = Math.max(0, Math.min(n, u));
          let p = o,
            f = d;
          const m = c > 1 || a,
            g = m ? Array(u) : [];
          let v;
          for (; (v = e.indexOf(t, f)) > -1; ) {
            let e = Ie(t, {
              currentLocation: v,
              expectedLocation: d,
              distance: s,
              ignoreLocation: h,
            });
            if (((p = Math.min(e, p)), (f = v + l), m)) {
              let e = 0;
              for (; e < l; ) (g[v + e] = 1), (e += 1);
            }
          }
          f = -1;
          let _ = [],
            y = 1,
            b = l + u;
          const E = 1 << (l - 1);
          for (let n = 0; n < l; n += 1) {
            let o = 0,
              c = b;
            for (; o < c; )
              Ie(t, {
                errors: n,
                currentLocation: d + c,
                expectedLocation: d,
                distance: s,
                ignoreLocation: h,
              }) <= p
                ? (o = c)
                : (b = c),
                (c = Math.floor((b - o) / 2 + o));
            b = c;
            let a = Math.max(1, d - c + 1),
              v = r ? u : Math.min(d + c, u) + l,
              C = Array(v + 2);
            C[v + 1] = (1 << n) - 1;
            for (let o = v; o >= a; o -= 1) {
              let r = o - 1,
                c = i[e.charAt(r)];
              if (
                (m && (g[r] = +!!c),
                (C[o] = ((C[o + 1] << 1) | 1) & c),
                n && (C[o] |= ((_[o + 1] | _[o]) << 1) | 1 | _[o + 1]),
                C[o] & E &&
                  ((y = Ie(t, {
                    errors: n,
                    currentLocation: r,
                    expectedLocation: d,
                    distance: s,
                    ignoreLocation: h,
                  })),
                  y <= p))
              ) {
                if (((p = y), (f = r), f <= d)) break;
                a = Math.max(1, 2 * d - f);
              }
            }
            if (
              Ie(t, {
                errors: n + 1,
                currentLocation: d,
                expectedLocation: d,
                distance: s,
                ignoreLocation: h,
              }) > p
            )
              break;
            _ = C;
          }
          const C = {
            isMatch: f >= 0,
            score: Math.max(0.001, y),
          };
          if (m) {
            const e = (function (e = [], t = Ee.minMatchCharLength) {
              let i = [],
                n = -1,
                s = -1,
                o = 0;
              for (let r = e.length; o < r; o += 1) {
                let r = e[o];
                r && -1 === n
                  ? (n = o)
                  : r ||
                    -1 === n ||
                    ((s = o - 1), s - n + 1 >= t && i.push([n, s]), (n = -1));
              }
              return e[o - 1] && o - n >= t && i.push([n, o - 1]), i;
            })(g, c);
            e.length ? a && (C.indices = e) : (C.isMatch = !1);
          }
          return C;
        })(e, t, d, {
          location: n + p,
          distance: s,
          threshold: o,
          findAllMatches: r,
          minMatchCharLength: c,
          includeMatches: i,
          ignoreLocation: a,
        });
        f && (u = !0), (l += m), f && g && (h = [...h, ...g]);
      });
      let d = {
        isMatch: u,
        score: u ? l / this.chunks.length : 1,
      };
      return u && i && (d.indices = h), d;
    }
  }
  class Le {
    constructor(e) {
      this.pattern = e;
    }
    static isMultiMatch(e) {
      return Me(e, this.multiRegex);
    }
    static isSingleMatch(e) {
      return Me(e, this.singleRegex);
    }
    search() {}
  }
  function Me(e, t) {
    const i = e.match(t);
    return i ? i[1] : null;
  }
  class Te extends Le {
    constructor(
      e,
      {
        location: t = Ee.location,
        threshold: i = Ee.threshold,
        distance: n = Ee.distance,
        includeMatches: s = Ee.includeMatches,
        findAllMatches: o = Ee.findAllMatches,
        minMatchCharLength: r = Ee.minMatchCharLength,
        isCaseSensitive: c = Ee.isCaseSensitive,
        ignoreLocation: a = Ee.ignoreLocation,
      } = {}
    ) {
      super(e),
        (this._bitapSearch = new Oe(e, {
          location: t,
          threshold: i,
          distance: n,
          includeMatches: s,
          findAllMatches: o,
          minMatchCharLength: r,
          isCaseSensitive: c,
          ignoreLocation: a,
        }));
    }
    static get type() {
      return "fuzzy";
    }
    static get multiRegex() {
      return /^"(.*)"$/;
    }
    static get singleRegex() {
      return /^(.*)$/;
    }
    search(e) {
      return this._bitapSearch.searchIn(e);
    }
  }
  class Ne extends Le {
    constructor(e) {
      super(e);
    }
    static get type() {
      return "include";
    }
    static get multiRegex() {
      return /^'"(.*)"$/;
    }
    static get singleRegex() {
      return /^'(.*)$/;
    }
    search(e) {
      let t,
        i = 0;
      const n = [],
        s = this.pattern.length;
      for (; (t = e.indexOf(this.pattern, i)) > -1; )
        (i = t + s), n.push([t, i - 1]);
      const o = !!n.length;
      return {
        isMatch: o,
        score: o ? 0 : 1,
        indices: n,
      };
    }
  }
  const ke = [
      class extends Le {
        constructor(e) {
          super(e);
        }
        static get type() {
          return "exact";
        }
        static get multiRegex() {
          return /^="(.*)"$/;
        }
        static get singleRegex() {
          return /^=(.*)$/;
        }
        search(e) {
          const t = e === this.pattern;
          return {
            isMatch: t,
            score: t ? 0 : 1,
            indices: [0, this.pattern.length - 1],
          };
        }
      },
      Ne,
      class extends Le {
        constructor(e) {
          super(e);
        }
        static get type() {
          return "prefix-exact";
        }
        static get multiRegex() {
          return /^\^"(.*)"$/;
        }
        static get singleRegex() {
          return /^\^(.*)$/;
        }
        search(e) {
          const t = e.startsWith(this.pattern);
          return {
            isMatch: t,
            score: t ? 0 : 1,
            indices: [0, this.pattern.length - 1],
          };
        }
      },
      class extends Le {
        constructor(e) {
          super(e);
        }
        static get type() {
          return "inverse-prefix-exact";
        }
        static get multiRegex() {
          return /^!\^"(.*)"$/;
        }
        static get singleRegex() {
          return /^!\^(.*)$/;
        }
        search(e) {
          const t = !e.startsWith(this.pattern);
          return {
            isMatch: t,
            score: t ? 0 : 1,
            indices: [0, e.length - 1],
          };
        }
      },
      class extends Le {
        constructor(e) {
          super(e);
        }
        static get type() {
          return "inverse-suffix-exact";
        }
        static get multiRegex() {
          return /^!"(.*)"\$$/;
        }
        static get singleRegex() {
          return /^!(.*)\$$/;
        }
        search(e) {
          const t = !e.endsWith(this.pattern);
          return {
            isMatch: t,
            score: t ? 0 : 1,
            indices: [0, e.length - 1],
          };
        }
      },
      class extends Le {
        constructor(e) {
          super(e);
        }
        static get type() {
          return "suffix-exact";
        }
        static get multiRegex() {
          return /^"(.*)"\$$/;
        }
        static get singleRegex() {
          return /^(.*)\$$/;
        }
        search(e) {
          const t = e.endsWith(this.pattern);
          return {
            isMatch: t,
            score: t ? 0 : 1,
            indices: [e.length - this.pattern.length, e.length - 1],
          };
        }
      },
      class extends Le {
        constructor(e) {
          super(e);
        }
        static get type() {
          return "inverse-exact";
        }
        static get multiRegex() {
          return /^!"(.*)"$/;
        }
        static get singleRegex() {
          return /^!(.*)$/;
        }
        search(e) {
          const t = -1 === e.indexOf(this.pattern);
          return {
            isMatch: t,
            score: t ? 0 : 1,
            indices: [0, e.length - 1],
          };
        }
      },
      Te,
    ],
    Fe = ke.length,
    De = / +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,
    Pe = new Set([Te.type, Ne.type]);
  const je = [];
  function Re(e, t) {
    for (let i = 0, n = je.length; i < n; i += 1) {
      let n = je[i];
      if (n.condition(e, t)) return new n(e, t);
    }
    return new Oe(e, t);
  }
  const Ke = "$and",
    Ve = "$path",
    Be = (e) => !(!e[Ke] && !e.$or),
    He = (e) => ({
      [Ke]: Object.keys(e).map((t) => ({
        [t]: e[t],
      })),
    });
  function $e(e, t, { auto: i = !0 } = {}) {
    const n = (e) => {
      let s = Object.keys(e);
      const o = ((e) => !!e[Ve])(e);
      if (!o && s.length > 1 && !Be(e)) return n(He(e));
      if (((e) => !re(e) && he(e) && !Be(e))(e)) {
        const n = o ? e[Ve] : s[0],
          r = o ? e.$val : e[n];
        if (!ce(r)) throw new Error(((e) => `Invalid value for key ${e}`)(n));
        const c = {
          keyId: ye(n),
          pattern: r,
        };
        return i && (c.searcher = Re(r, t)), c;
      }
      let r = {
        children: [],
        operator: s[0],
      };
      return (
        s.forEach((t) => {
          const i = e[t];
          re(i) &&
            i.forEach((e) => {
              r.children.push(n(e));
            });
        }),
        r
      );
    };
    return Be(e) || (e = He(e)), n(e);
  }
  function qe(e, t) {
    const i = e.matches;
    (t.matches = []),
      le(i) &&
        i.forEach((e) => {
          if (!le(e.indices) || !e.indices.length) return;
          const { indices: i, value: n } = e;
          let s = {
            indices: i,
            value: n,
          };
          e.key && (s.key = e.key.src),
            e.idx > -1 && (s.refIndex = e.idx),
            t.matches.push(s);
        });
  }
  function We(e, t) {
    t.score = e.score;
  }
  class Ue {
    constructor(e, t = {}, i) {
      (this.options = oe(oe({}, Ee), t)),
        (this._keyStore = new ge(this.options.keys)),
        this.setCollection(e, i);
    }
    setCollection(e, t) {
      if (((this._docs = e), t && !(t instanceof Se)))
        throw new Error("Incorrect 'index' type");
      this._myIndex =
        t ||
        we(this.options.keys, this._docs, {
          getFn: this.options.getFn,
          fieldNormWeight: this.options.fieldNormWeight,
        });
    }
    add(e) {
      le(e) && (this._docs.push(e), this._myIndex.add(e));
    }
    remove(e = () => !1) {
      const t = [];
      for (let i = 0, n = this._docs.length; i < n; i += 1) {
        const s = this._docs[i];
        e(s, i) && (this.removeAt(i), (i -= 1), (n -= 1), t.push(s));
      }
      return t;
    }
    removeAt(e) {
      this._docs.splice(e, 1), this._myIndex.removeAt(e);
    }
    getIndex() {
      return this._myIndex;
    }
    search(e, { limit: t = -1 } = {}) {
      const {
        includeMatches: i,
        includeScore: n,
        shouldSort: s,
        sortFn: o,
        ignoreFieldNorm: r,
      } = this.options;
      let c = ce(e)
        ? ce(this._docs[0])
          ? this._searchStringList(e)
          : this._searchObjectList(e)
        : this._searchLogical(e);
      return (
        (function (e, { ignoreFieldNorm: t = Ee.ignoreFieldNorm }) {
          e.forEach((e) => {
            let i = 1;
            e.matches.forEach(({ key: e, norm: n, score: s }) => {
              const o = e ? e.weight : null;
              i *= Math.pow(
                0 === s && o ? Number.EPSILON : s,
                (o || 1) * (t ? 1 : n)
              );
            }),
              (e.score = i);
          });
        })(c, {
          ignoreFieldNorm: r,
        }),
        s && c.sort(o),
        ae(t) && t > -1 && (c = c.slice(0, t)),
        (function (
          e,
          t,
          {
            includeMatches: i = Ee.includeMatches,
            includeScore: n = Ee.includeScore,
          } = {}
        ) {
          const s = [];
          return (
            i && s.push(qe),
            n && s.push(We),
            e.map((e) => {
              const { idx: i } = e,
                n = {
                  item: t[i],
                  refIndex: i,
                };
              return (
                s.length &&
                  s.forEach((t) => {
                    t(e, n);
                  }),
                n
              );
            })
          );
        })(c, this._docs, {
          includeMatches: i,
          includeScore: n,
        })
      );
    }
    _searchStringList(e) {
      const t = Re(e, this.options),
        { records: i } = this._myIndex,
        n = [];
      return (
        i.forEach(({ v: e, i: i, n: s }) => {
          if (!le(e)) return;
          const { isMatch: o, score: r, indices: c } = t.searchIn(e);
          o &&
            n.push({
              item: e,
              idx: i,
              matches: [
                {
                  score: r,
                  value: e,
                  norm: s,
                  indices: c,
                },
              ],
            });
        }),
        n
      );
    }
    _searchLogical(e) {
      const t = $e(e, this.options),
        i = (e, t, n) => {
          if (!e.children) {
            const { keyId: i, searcher: s } = e,
              o = this._findMatches({
                key: this._keyStore.get(i),
                value: this._myIndex.getValueForItemAtKeyId(t, i),
                searcher: s,
              });
            return o && o.length
              ? [
                  {
                    idx: n,
                    item: t,
                    matches: o,
                  },
                ]
              : [];
          }
          const s = [];
          for (let o = 0, r = e.children.length; o < r; o += 1) {
            const r = i(e.children[o], t, n);
            if (r.length) s.push(...r);
            else if (e.operator === Ke) return [];
          }
          return s;
        },
        n = {},
        s = [];
      return (
        this._myIndex.records.forEach(({ $: e, i: o }) => {
          if (le(e)) {
            let r = i(t, e, o);
            r.length &&
              (n[o] ||
                ((n[o] = {
                  idx: o,
                  item: e,
                  matches: [],
                }),
                s.push(n[o])),
              r.forEach(({ matches: e }) => {
                n[o].matches.push(...e);
              }));
          }
        }),
        s
      );
    }
    _searchObjectList(e) {
      const t = Re(e, this.options),
        { keys: i, records: n } = this._myIndex,
        s = [];
      return (
        n.forEach(({ $: e, i: n }) => {
          if (!le(e)) return;
          let o = [];
          i.forEach((i, n) => {
            o.push(
              ...this._findMatches({
                key: i,
                value: e[n],
                searcher: t,
              })
            );
          }),
            o.length &&
              s.push({
                idx: n,
                item: e,
                matches: o,
              });
        }),
        s
      );
    }
    _findMatches({ key: e, value: t, searcher: i }) {
      if (!le(t)) return [];
      let n = [];
      if (re(t))
        t.forEach(({ v: t, i: s, n: o }) => {
          if (!le(t)) return;
          const { isMatch: r, score: c, indices: a } = i.searchIn(t);
          r &&
            n.push({
              score: c,
              key: e,
              value: t,
              idx: s,
              norm: o,
              indices: a,
            });
        });
      else {
        const { v: s, n: o } = t,
          { isMatch: r, score: c, indices: a } = i.searchIn(s);
        r &&
          n.push({
            score: c,
            key: e,
            value: s,
            norm: o,
            indices: a,
          });
      }
      return n;
    }
  }
  (Ue.version = "7.0.0"),
    (Ue.createIndex = we),
    (Ue.parseIndex = function (
      e,
      { getFn: t = Ee.getFn, fieldNormWeight: i = Ee.fieldNormWeight } = {}
    ) {
      const { keys: n, records: s } = e,
        o = new Se({
          getFn: t,
          fieldNormWeight: i,
        });
      return o.setKeys(n), o.setIndexRecords(s), o;
    }),
    (Ue.config = Ee),
    (Ue.parseQuery = $e),
    (function (...e) {
      je.push(...e);
    })(
      class {
        constructor(
          e,
          {
            isCaseSensitive: t = Ee.isCaseSensitive,
            includeMatches: i = Ee.includeMatches,
            minMatchCharLength: n = Ee.minMatchCharLength,
            ignoreLocation: s = Ee.ignoreLocation,
            findAllMatches: o = Ee.findAllMatches,
            location: r = Ee.location,
            threshold: c = Ee.threshold,
            distance: a = Ee.distance,
          } = {}
        ) {
          (this.query = null),
            (this.options = {
              isCaseSensitive: t,
              includeMatches: i,
              minMatchCharLength: n,
              findAllMatches: o,
              ignoreLocation: s,
              location: r,
              threshold: c,
              distance: a,
            }),
            (this.pattern = t ? e : e.toLowerCase()),
            (this.query = (function (e, t = {}) {
              return e.split("|").map((e) => {
                let i = e
                    .trim()
                    .split(De)
                    .filter((e) => e && !!e.trim()),
                  n = [];
                for (let e = 0, s = i.length; e < s; e += 1) {
                  const s = i[e];
                  let o = !1,
                    r = -1;
                  for (; !o && ++r < Fe; ) {
                    const e = ke[r];
                    let i = e.isMultiMatch(s);
                    i && (n.push(new e(i, t)), (o = !0));
                  }
                  if (!o)
                    for (r = -1; ++r < Fe; ) {
                      const e = ke[r];
                      let i = e.isSingleMatch(s);
                      if (i) {
                        n.push(new e(i, t));
                        break;
                      }
                    }
                }
                return n;
              });
            })(this.pattern, this.options));
        }
        static condition(e, t) {
          return t.useExtendedSearch;
        }
        searchIn(e) {
          const t = this.query;
          if (!t)
            return {
              isMatch: !1,
              score: 1,
            };
          const { includeMatches: i, isCaseSensitive: n } = this.options;
          e = n ? e : e.toLowerCase();
          let s = 0,
            o = [],
            r = 0;
          for (let n = 0, c = t.length; n < c; n += 1) {
            const c = t[n];
            (o.length = 0), (s = 0);
            for (let t = 0, n = c.length; t < n; t += 1) {
              const n = c[t],
                { isMatch: a, indices: h, score: l } = n.search(e);
              if (!a) {
                (r = 0), (s = 0), (o.length = 0);
                break;
              }
              (s += 1),
                (r += l),
                i &&
                  (Pe.has(n.constructor.type) ? (o = [...o, ...h]) : o.push(h));
            }
            if (s) {
              let e = {
                isMatch: !0,
                score: r / s,
              };
              return i && (e.indices = o), e;
            }
          }
          return {
            isMatch: !1,
            score: 1,
          };
        }
      }
    );
  var Ge = (function () {
      function e(e) {
        (this._haystack = []),
          (this._fuseOptions = i(i({}, e.fuseOptions), {
            keys: n([], e.searchFields, !0),
            includeMatches: !0,
          }));
      }
      return (
        (e.prototype.index = function (e) {
          (this._haystack = e), this._fuse && this._fuse.setCollection(e);
        }),
        (e.prototype.reset = function () {
          (this._haystack = []), (this._fuse = void 0);
        }),
        (e.prototype.isEmptyIndex = function () {
          return !this._haystack.length;
        }),
        (e.prototype.search = function (e) {
          return (
            this._fuse ||
              (this._fuse = new Ue(this._haystack, this._fuseOptions)),
            this._fuse.search(e).map(function (e, t) {
              return {
                item: e.item,
                score: e.score || 0,
                rank: t + 1,
              };
            })
          );
        }),
        e
      );
    })(),
    ze = function (e, t, i) {
      var n = e.dataset,
        s = t.customProperties,
        o = t.labelClass,
        r = t.labelDescription;
      o && (n.labelClass = F(o).join(" ")),
        r && (n.labelDescription = r),
        i &&
          s &&
          ("string" == typeof s
            ? (n.customProperties = s)
            : "object" != typeof s ||
              (function (e) {
                for (var t in e)
                  if (Object.prototype.hasOwnProperty.call(e, t)) return !1;
                return !0;
              })(s) ||
              (n.customProperties = JSON.stringify(s)));
    },
    Je = function (e, t, i) {
      var n = t && e.querySelector("label[for='".concat(t, "']")),
        s = n && n.innerText;
      s && i.setAttribute("aria-label", s);
    },
    Xe = {
      containerOuter: function (e, t, i, n, s, o, r) {
        var c = e.classNames.containerOuter,
          a = document.createElement("div");
        return (
          P(a, c),
          (a.dataset.type = o),
          t && (a.dir = t),
          n && (a.tabIndex = 0),
          i &&
            (a.setAttribute("role", s ? "combobox" : "listbox"),
            s
              ? a.setAttribute("aria-autocomplete", "list")
              : r || Je(this._docRoot, this.passedElement.element.id, a),
            a.setAttribute("aria-haspopup", "true"),
            a.setAttribute("aria-expanded", "false")),
          r && a.setAttribute("aria-labelledby", r),
          a
        );
      },
      containerInner: function (e) {
        var t = e.classNames.containerInner,
          i = document.createElement("div");
        return P(i, t), i;
      },
      itemList: function (e, t) {
        var i = e.searchEnabled,
          n = e.classNames,
          s = n.list,
          o = n.listSingle,
          r = n.listItems,
          c = document.createElement("div");
        return (
          P(c, s),
          P(c, t ? o : r),
          this._isSelectElement && i && c.setAttribute("role", "listbox"),
          c
        );
      },
      placeholder: function (e, t) {
        var i = e.allowHTML,
          n = e.classNames.placeholder,
          s = document.createElement("div");
        return P(s, n), N(s, i, t), s;
      },
      item: function (e, t, i) {
        var n = e.allowHTML,
          s = e.removeItemButtonAlignLeft,
          o = e.removeItemIconText,
          r = e.removeItemLabelText,
          c = e.classNames,
          a = c.item,
          h = c.button,
          l = c.highlightedState,
          u = c.itemSelectable,
          d = c.placeholder,
          p = L(t.value),
          f = document.createElement("div");
        if ((P(f, a), t.labelClass)) {
          var m = document.createElement("span");
          N(m, n, t.label), P(m, t.labelClass), f.appendChild(m);
        } else N(f, n, t.label);
        if (
          ((f.dataset.item = ""),
          (f.dataset.id = t.id),
          (f.dataset.value = p),
          ze(f, t, !0),
          (t.disabled || this.containerOuter.isDisabled) &&
            f.setAttribute("aria-disabled", "true"),
          this._isSelectElement &&
            (f.setAttribute("aria-selected", "true"),
            f.setAttribute("role", "option")),
          t.placeholder && (P(f, d), (f.dataset.placeholder = "")),
          P(f, t.highlighted ? l : u),
          i)
        ) {
          t.disabled && j(f, u), (f.dataset.deletable = "");
          var g = document.createElement("button");
          (g.type = "button"), P(g, h), N(g, !0, x(o, t.value));
          var v = x(r, t.value);
          v && g.setAttribute("aria-label", v),
            (g.dataset.button = ""),
            s ? f.insertAdjacentElement("afterbegin", g) : f.appendChild(g);
        }
        return f;
      },
      choiceList: function (e, t) {
        var i = e.classNames.list,
          n = document.createElement("div");
        return (
          P(n, i),
          t || n.setAttribute("aria-multiselectable", "true"),
          n.setAttribute("role", "listbox"),
          n
        );
      },
      choiceGroup: function (e, t) {
        var i = e.allowHTML,
          n = e.classNames,
          s = n.group,
          o = n.groupHeading,
          r = n.itemDisabled,
          c = t.id,
          a = t.label,
          h = t.disabled,
          l = L(a),
          u = document.createElement("div");
        P(u, s),
          h && P(u, r),
          u.setAttribute("role", "group"),
          (u.dataset.group = ""),
          (u.dataset.id = c),
          (u.dataset.value = l),
          h && u.setAttribute("aria-disabled", "true");
        var d = document.createElement("div");
        return P(d, o), N(d, i, a || ""), u.appendChild(d), u;
      },
      choice: function (e, t, i, n) {
        var s = e.allowHTML,
          o = e.classNames,
          r = o.item,
          c = o.itemChoice,
          a = o.itemSelectable,
          h = o.selectedState,
          l = o.itemDisabled,
          u = o.description,
          d = o.placeholder,
          p = t.label,
          f = L(t.value),
          m = document.createElement("div");
        (m.id = t.elementId),
          P(m, r),
          P(m, c),
          n &&
            "string" == typeof p &&
            ((p = T(s, p)),
            (p = {
              trusted: (p += " (".concat(n, ")")),
            }));
        var g = m;
        if (t.labelClass) {
          var v = document.createElement("span");
          N(v, s, p), P(v, t.labelClass), (g = v), m.appendChild(v);
        } else N(m, s, p);
        if (t.labelDescription) {
          var _ = "".concat(t.elementId, "-description");
          g.setAttribute("aria-describedby", _);
          var y = document.createElement("span");
          N(y, s, t.labelDescription), (y.id = _), P(y, u), m.appendChild(y);
        }
        return (
          t.selected && P(m, h),
          t.placeholder && P(m, d),
          m.setAttribute("role", t.group ? "treeitem" : "option"),
          (m.dataset.choice = ""),
          (m.dataset.id = t.id),
          (m.dataset.value = f),
          i && (m.dataset.selectText = i),
          t.group && (m.dataset.groupId = "".concat(t.group.id)),
          ze(m, t, !1),
          t.disabled
            ? (P(m, l),
              (m.dataset.choiceDisabled = ""),
              m.setAttribute("aria-disabled", "true"))
            : (P(m, a), (m.dataset.choiceSelectable = "")),
          m
        );
      },
      input: function (e, t) {
        var i = e.classNames,
          n = i.input,
          s = i.inputCloned,
          o = e.labelId,
          r = document.createElement("input");
        return (
          (r.type = "search"),
          P(r, n),
          P(r, s),
          (r.autocomplete = "off"),
          (r.autocapitalize = "off"),
          (r.spellcheck = !1),
          r.setAttribute("aria-autocomplete", "list"),
          t
            ? r.setAttribute("aria-label", t)
            : o || Je(this._docRoot, this.passedElement.element.id, r),
          r
        );
      },
      dropdown: function (e) {
        var t = e.classNames,
          i = t.list,
          n = t.listDropdown,
          s = document.createElement("div");
        return P(s, i), P(s, n), s.setAttribute("aria-expanded", "false"), s;
      },
      notice: function (e, t, i) {
        var n = e.classNames,
          s = n.item,
          o = n.itemChoice,
          r = n.addChoice,
          c = n.noResults,
          a = n.noChoices,
          h = n.notice;
        void 0 === i && (i = "");
        var l = document.createElement("div");
        switch ((N(l, !0, t), P(l, s), P(l, o), P(l, h), i)) {
          case ie:
            P(l, r);
            break;
          case te:
            P(l, c);
            break;
          case ee:
            P(l, a);
        }
        return (
          i === ie &&
            ((l.dataset.choiceSelectable = ""), (l.dataset.choice = "")),
          l
        );
      },
      option: function (e) {
        var t = L(e.label),
          i = new Option(t, e.value, !1, e.selected);
        return (
          ze(i, e, !0),
          (i.disabled = e.disabled),
          e.selected && i.setAttribute("selected", ""),
          i
        );
      },
    },
    Qe =
      "-ms-scroll-limit" in document.documentElement.style &&
      "-ms-ime-align" in document.documentElement.style,
    Ye = {},
    Ze = function (e) {
      if (e) return e.dataset.id ? parseInt(e.dataset.id, 10) : void 0;
    },
    et = "[data-choice-selectable]";
  return (function () {
    function e(t, n) {
      void 0 === t && (t = "[data-choice]"), void 0 === n && (n = {});
      var s = this;
      (this.initialisedOK = void 0),
        (this._hasNonChoicePlaceholder = !1),
        (this._lastAddedChoiceId = 0),
        (this._lastAddedGroupId = 0);
      var o = e.defaults;
      (this.config = i(i(i({}, o.allOptions), o.options), n)),
        v.forEach(function (e) {
          s.config[e] = i(i(i({}, o.allOptions[e]), o.options[e]), n[e]);
        });
      var r = this.config;
      r.silent || this._validateConfig();
      var c = r.shadowRoot || document.documentElement;
      this._docRoot = c;
      var a = "string" == typeof t ? c.querySelector(t) : t;
      if (!a || "object" != typeof a || ("INPUT" !== a.tagName && !z(a))) {
        if (!a && "string" == typeof t)
          throw TypeError("Selector ".concat(t, " failed to find an element"));
        throw TypeError(
          "Expected one of the following types text|select-one|select-multiple"
        );
      }
      var h = a.type,
        l = "text" === h;
      (l || 1 !== r.maxItemCount) && (r.singleModeForMultiSelect = !1),
        r.singleModeForMultiSelect && (h = y);
      var u = h === _,
        d = h === y,
        p = u || d;
      if (
        ((this._elementType = h),
        (this._isTextElement = l),
        (this._isSelectOneElement = u),
        (this._isSelectMultipleElement = d),
        (this._isSelectElement = u || d),
        (this._canAddUserChoices = (l && r.addItems) || (p && r.addChoices)),
        "boolean" != typeof r.renderSelectedChoices &&
          (r.renderSelectedChoices = "always" === r.renderSelectedChoices || u),
        (r.closeDropdownOnSelect =
          "auto" === r.closeDropdownOnSelect
            ? l || u || r.singleModeForMultiSelect
            : W(r.closeDropdownOnSelect)),
        r.placeholder &&
          (r.placeholderValue
            ? (this._hasNonChoicePlaceholder = !0)
            : a.dataset.placeholder &&
              ((this._hasNonChoicePlaceholder = !0),
              (r.placeholderValue = a.dataset.placeholder))),
        n.addItemFilter && "function" != typeof n.addItemFilter)
      ) {
        var f =
          n.addItemFilter instanceof RegExp
            ? n.addItemFilter
            : new RegExp(n.addItemFilter);
        r.addItemFilter = f.test.bind(f);
      }
      if (
        ((this.passedElement = this._isTextElement
          ? new q({
              element: a,
              classNames: r.classNames,
            })
          : new J({
              element: a,
              classNames: r.classNames,
              template: function (e) {
                return s._templates.option(e);
              },
              extractPlaceholder:
                r.placeholder && !this._hasNonChoicePlaceholder,
            })),
        (this.initialised = !1),
        (this._store = new Z(r)),
        (this._currentValue = ""),
        (r.searchEnabled = (!l && r.searchEnabled) || d),
        (this._canSearch = r.searchEnabled),
        (this._isScrollingOnIe = !1),
        (this._highlightPosition = 0),
        (this._wasTap = !0),
        (this._placeholderValue = this._generatePlaceholderValue()),
        (this._baseId = (function (e) {
          var t =
            e.id || (e.name && "".concat(e.name, "-").concat(w(2))) || w(4);
          return (
            (t = t.replace(/(:|\.|\[|\]|,)/g, "")),
            "".concat("choices-", "-").concat(t)
          );
        })(a)),
        (this._direction = a.dir),
        !this._direction)
      ) {
        var m = window.getComputedStyle(a).direction;
        m !== window.getComputedStyle(document.documentElement).direction &&
          (this._direction = m);
      }
      if (
        ((this._idNames = {
          itemChoice: "item-choice",
        }),
        (this._templates = o.templates),
        (this._render = this._render.bind(this)),
        (this._onFocus = this._onFocus.bind(this)),
        (this._onBlur = this._onBlur.bind(this)),
        (this._onKeyUp = this._onKeyUp.bind(this)),
        (this._onKeyDown = this._onKeyDown.bind(this)),
        (this._onInput = this._onInput.bind(this)),
        (this._onClick = this._onClick.bind(this)),
        (this._onTouchMove = this._onTouchMove.bind(this)),
        (this._onTouchEnd = this._onTouchEnd.bind(this)),
        (this._onMouseDown = this._onMouseDown.bind(this)),
        (this._onMouseOver = this._onMouseOver.bind(this)),
        (this._onFormReset = this._onFormReset.bind(this)),
        (this._onSelectKey = this._onSelectKey.bind(this)),
        (this._onEnterKey = this._onEnterKey.bind(this)),
        (this._onEscapeKey = this._onEscapeKey.bind(this)),
        (this._onDirectionKey = this._onDirectionKey.bind(this)),
        (this._onDeleteKey = this._onDeleteKey.bind(this)),
        this.passedElement.isActive)
      )
        return (
          r.silent ||
            console.warn(
              "Trying to initialise Choices on element already initialised",
              {
                element: t,
              }
            ),
          (this.initialised = !0),
          void (this.initialisedOK = !1)
        );
      this.init(),
        (this._initialItems = this._store.items.map(function (e) {
          return e.value;
        }));
    }
    return (
      Object.defineProperty(e, "defaults", {
        get: function () {
          return Object.preventExtensions({
            get options() {
              return Ye;
            },
            get allOptions() {
              return X;
            },
            get templates() {
              return Xe;
            },
          });
        },
        enumerable: !1,
        configurable: !0,
      }),
      (e.prototype.init = function () {
        if (!this.initialised && void 0 === this.initialisedOK) {
          (this._searcher = new Ge(this.config)),
            this._loadChoices(),
            this._createTemplates(),
            this._createElements(),
            this._createStructure(),
            (this._isTextElement && !this.config.addItems) ||
            this.passedElement.element.hasAttribute("disabled") ||
            this.passedElement.element.closest("fieldset:disabled")
              ? this.disable()
              : (this.enable(), this._addEventListeners()),
            this._initStore(),
            (this.initialised = !0),
            (this.initialisedOK = !0);
          var e = this.config.callbackOnInit;
          "function" == typeof e && e.call(this);
        }
      }),
      (e.prototype.destroy = function () {
        this.initialised &&
          (this._removeEventListeners(),
          this.passedElement.reveal(),
          this.containerOuter.unwrap(this.passedElement.element),
          (this._store._listeners = []),
          this.clearStore(!1),
          this._stopSearch(),
          (this._templates = e.defaults.templates),
          (this.initialised = !1),
          (this.initialisedOK = void 0));
      }),
      (e.prototype.enable = function () {
        return (
          this.passedElement.isDisabled && this.passedElement.enable(),
          this.containerOuter.isDisabled &&
            (this._addEventListeners(),
            this.input.enable(),
            this.containerOuter.enable()),
          this
        );
      }),
      (e.prototype.disable = function () {
        return (
          this.passedElement.isDisabled || this.passedElement.disable(),
          this.containerOuter.isDisabled ||
            (this._removeEventListeners(),
            this.input.disable(),
            this.containerOuter.disable()),
          this
        );
      }),
      (e.prototype.highlightItem = function (e, t) {
        if ((void 0 === t && (t = !0), !e || !e.id)) return this;
        var i = this._store.items.find(function (t) {
          return t.id === e.id;
        });
        return (
          !i ||
            i.highlighted ||
            (this._store.dispatch(S(i, !0)),
            t &&
              this.passedElement.triggerEvent(g, this._getChoiceForOutput(i))),
          this
        );
      }),
      (e.prototype.unhighlightItem = function (e, t) {
        if ((void 0 === t && (t = !0), !e || !e.id)) return this;
        var i = this._store.items.find(function (t) {
          return t.id === e.id;
        });
        return i && i.highlighted
          ? (this._store.dispatch(S(i, !1)),
            t &&
              this.passedElement.triggerEvent(
                "unhighlightItem",
                this._getChoiceForOutput(i)
              ),
            this)
          : this;
      }),
      (e.prototype.highlightAll = function () {
        var e = this;
        return (
          this._store.withTxn(function () {
            e._store.items.forEach(function (t) {
              t.highlighted ||
                (e._store.dispatch(S(t, !0)),
                e.passedElement.triggerEvent(g, e._getChoiceForOutput(t)));
            });
          }),
          this
        );
      }),
      (e.prototype.unhighlightAll = function () {
        var e = this;
        return (
          this._store.withTxn(function () {
            e._store.items.forEach(function (t) {
              t.highlighted &&
                (e._store.dispatch(S(t, !1)),
                e.passedElement.triggerEvent(g, e._getChoiceForOutput(t)));
            });
          }),
          this
        );
      }),
      (e.prototype.removeActiveItemsByValue = function (e) {
        var t = this;
        return (
          this._store.withTxn(function () {
            t._store.items
              .filter(function (t) {
                return t.value === e;
              })
              .forEach(function (e) {
                return t._removeItem(e);
              });
          }),
          this
        );
      }),
      (e.prototype.removeActiveItems = function (e) {
        var t = this;
        return (
          this._store.withTxn(function () {
            t._store.items
              .filter(function (t) {
                return t.id !== e;
              })
              .forEach(function (e) {
                return t._removeItem(e);
              });
          }),
          this
        );
      }),
      (e.prototype.removeHighlightedItems = function (e) {
        var t = this;
        return (
          void 0 === e && (e = !1),
          this._store.withTxn(function () {
            t._store.highlightedActiveItems.forEach(function (i) {
              t._removeItem(i), e && t._triggerChange(i.value);
            });
          }),
          this
        );
      }),
      (e.prototype.showDropdown = function (e) {
        var t = this;
        return (
          this.dropdown.isActive ||
            (void 0 === e && (e = !this._canSearch),
            requestAnimationFrame(function () {
              t.dropdown.show();
              var i = t.dropdown.element.getBoundingClientRect();
              t.containerOuter.open(i.bottom, i.height),
                e || t.input.focus(),
                t.passedElement.triggerEvent("showDropdown");
            })),
          this
        );
      }),
      (e.prototype.hideDropdown = function (e) {
        var t = this;
        return this.dropdown.isActive
          ? (requestAnimationFrame(function () {
              t.dropdown.hide(),
                t.containerOuter.close(),
                !e &&
                  t._canSearch &&
                  (t.input.removeActiveDescendant(), t.input.blur()),
                t.passedElement.triggerEvent("hideDropdown");
            }),
            this)
          : this;
      }),
      (e.prototype.getValue = function (e) {
        var t = this,
          i = this._store.items.map(function (i) {
            return e ? i.value : t._getChoiceForOutput(i);
          });
        return this._isSelectOneElement || this.config.singleModeForMultiSelect
          ? i[0]
          : i;
      }),
      (e.prototype.setValue = function (e) {
        var t = this;
        return this.initialisedOK
          ? (this._store.withTxn(function () {
              e.forEach(function (e) {
                e && t._addChoice(G(e, !1));
              });
            }),
            this._searcher.reset(),
            this)
          : (this._warnChoicesInitFailed("setValue"), this);
      }),
      (e.prototype.setChoiceByValue = function (e) {
        var t = this;
        return this.initialisedOK
          ? (this._isTextElement ||
              (this._store.withTxn(function () {
                (Array.isArray(e) ? e : [e]).forEach(function (e) {
                  return t._findAndSelectChoiceByValue(e);
                }),
                  t.unhighlightAll();
              }),
              this._searcher.reset()),
            this)
          : (this._warnChoicesInitFailed("setChoiceByValue"), this);
      }),
      (e.prototype.setChoices = function (e, t, n, s, o, r) {
        var c = this;
        if (
          (void 0 === e && (e = []),
          void 0 === t && (t = "value"),
          void 0 === n && (n = "label"),
          void 0 === s && (s = !1),
          void 0 === o && (o = !0),
          void 0 === r && (r = !1),
          !this.initialisedOK)
        )
          return this._warnChoicesInitFailed("setChoices"), this;
        if (!this._isSelectElement)
          throw new TypeError(
            "setChoices can't be used with INPUT based Choices"
          );
        if ("string" != typeof t || !t)
          throw new TypeError(
            "value parameter must be a name of 'value' field in passed objects"
          );
        if ("function" == typeof e) {
          var a = e(this);
          if ("function" == typeof Promise && a instanceof Promise)
            return new Promise(function (e) {
              return requestAnimationFrame(e);
            })
              .then(function () {
                return c._handleLoadingState(!0);
              })
              .then(function () {
                return a;
              })
              .then(function (e) {
                return c.setChoices(e, t, n, s, o, r);
              })
              .catch(function (e) {
                c.config.silent || console.error(e);
              })
              .then(function () {
                return c._handleLoadingState(!1);
              })
              .then(function () {
                return c;
              });
          if (!Array.isArray(a))
            throw new TypeError(
              ".setChoices first argument function must return either array of choices or Promise, got: ".concat(
                typeof a
              )
            );
          return this.setChoices(a, t, n, !1);
        }
        if (!Array.isArray(e))
          throw new TypeError(
            ".setChoices must be called either with array of choices with a function resulting into Promise of array of choices"
          );
        return (
          this.containerOuter.removeLoadingState(),
          this._store.withTxn(function () {
            o && (c._isSearching = !1), s && c.clearChoices(!0, r);
            var a = "value" === t,
              h = "label" === n;
            e.forEach(function (e) {
              if ("choices" in e) {
                var s = e;
                h ||
                  (s = i(i({}, s), {
                    label: s[n],
                  })),
                  c._addGroup(G(s, !0));
              } else {
                var o = e;
                (h && a) ||
                  (o = i(i({}, o), {
                    value: o[t],
                    label: o[n],
                  }));
                var r = G(o, !1);
                c._addChoice(r),
                  r.placeholder &&
                    !c._hasNonChoicePlaceholder &&
                    (c._placeholderValue = M(r.label));
              }
            }),
              c.unhighlightAll();
          }),
          this._searcher.reset(),
          this
        );
      }),
      (e.prototype.refresh = function (e, t, i) {
        var n = this;
        return (
          void 0 === e && (e = !1),
          void 0 === t && (t = !1),
          void 0 === i && (i = !1),
          this._isSelectElement
            ? (this._store.withTxn(function () {
                var s = n.passedElement.optionsAsChoices(),
                  o = {};
                i ||
                  n._store.items.forEach(function (e) {
                    e.id && e.active && e.selected && (o[e.value] = !0);
                  }),
                  n.clearStore(!1);
                var r = function (e) {
                  i ? n._store.dispatch(C(e)) : o[e.value] && (e.selected = !0);
                };
                s.forEach(function (e) {
                  "choices" in e ? e.choices.forEach(r) : r(e);
                }),
                  n._addPredefinedChoices(s, t, e),
                  n._isSearching && n._searchChoices(n.input.value);
              }),
              this)
            : (this.config.silent ||
                console.warn(
                  "refresh method can only be used on choices backed by a <select> element"
                ),
              this)
        );
      }),
      (e.prototype.removeChoice = function (e) {
        var t = this._store.choices.find(function (t) {
          return t.value === e;
        });
        return t
          ? (this._clearNotice(),
            this._store.dispatch(
              (function (e) {
                return {
                  type: r,
                  choice: e,
                };
              })(t)
            ),
            this._searcher.reset(),
            t.selected &&
              this.passedElement.triggerEvent(m, this._getChoiceForOutput(t)),
            this)
          : this;
      }),
      (e.prototype.clearChoices = function (e, t) {
        var i = this;
        return (
          void 0 === e && (e = !0),
          void 0 === t && (t = !1),
          e &&
            (t
              ? this.passedElement.element.replaceChildren("")
              : this.passedElement.element
                  .querySelectorAll(":not([selected])")
                  .forEach(function (e) {
                    e.remove();
                  })),
          this.itemList.element.replaceChildren(""),
          this.choiceList.element.replaceChildren(""),
          this._clearNotice(),
          this._store.withTxn(function () {
            var e = t ? [] : i._store.items;
            i._store.reset(),
              e.forEach(function (e) {
                i._store.dispatch(b(e)), i._store.dispatch(E(e));
              });
          }),
          this._searcher.reset(),
          this
        );
      }),
      (e.prototype.clearStore = function (e) {
        return (
          void 0 === e && (e = !0),
          this.clearChoices(e, !0),
          this._stopSearch(),
          (this._lastAddedChoiceId = 0),
          (this._lastAddedGroupId = 0),
          this
        );
      }),
      (e.prototype.clearInput = function () {
        return (
          this.input.clear(!this._isSelectOneElement), this._stopSearch(), this
        );
      }),
      (e.prototype._validateConfig = function () {
        var e,
          t,
          i,
          n = this.config,
          s =
            ((e = X),
            (t = Object.keys(n).sort()),
            (i = Object.keys(e).sort()),
            t.filter(function (e) {
              return i.indexOf(e) < 0;
            }));
        s.length &&
          console.warn("Unknown config option(s) passed", s.join(", ")),
          n.allowHTML &&
            n.allowHtmlUserInput &&
            (n.addItems &&
              console.warn(
                "Warning: allowHTML/allowHtmlUserInput/addItems all being true is strongly not recommended and may lead to XSS attacks"
              ),
            n.addChoices &&
              console.warn(
                "Warning: allowHTML/allowHtmlUserInput/addChoices all being true is strongly not recommended and may lead to XSS attacks"
              ));
      }),
      (e.prototype._render = function (e) {
        void 0 === e &&
          (e = {
            choices: !0,
            groups: !0,
            items: !0,
          }),
          this._store.inTxn() ||
            (this._isSelectElement &&
              (e.choices || e.groups) &&
              this._renderChoices(),
            e.items && this._renderItems());
      }),
      (e.prototype._renderChoices = function () {
        var e = this;
        if (this._canAddItems()) {
          var t = this.config,
            i = this._isSearching,
            n = this._store,
            s = n.activeGroups,
            o = n.activeChoices,
            r = 0;
          if (
            (i && t.searchResultLimit > 0
              ? (r = t.searchResultLimit)
              : t.renderChoiceLimit > 0 && (r = t.renderChoiceLimit),
            this._isSelectElement)
          ) {
            var c = o.filter(function (e) {
              return !e.element;
            });
            c.length && this.passedElement.addOptions(c);
          }
          var a = document.createDocumentFragment(),
            h = function (e) {
              return e.filter(function (e) {
                return (
                  !e.placeholder &&
                  (i ? !!e.rank : t.renderSelectedChoices || !e.selected)
                );
              });
            },
            l = !1,
            u = function (n, s, o) {
              i ? n.sort(k) : t.shouldSort && n.sort(t.sorter);
              var c = n.length;
              (c = !s && r && c > r ? r : c),
                c--,
                n.every(function (n, s) {
                  var r =
                    n.choiceEl ||
                    e._templates.choice(t, n, t.itemSelectText, o);
                  return (
                    (n.choiceEl = r),
                    a.appendChild(r),
                    (!i && n.selected) || (l = !0),
                    s < c
                  );
                });
            };
          o.length &&
            (t.resetScrollPosition &&
              requestAnimationFrame(function () {
                return e.choiceList.scrollToTop();
              }),
            this._hasNonChoicePlaceholder ||
              i ||
              !this._isSelectOneElement ||
              u(
                o.filter(function (e) {
                  return e.placeholder && !e.group;
                }),
                !1,
                void 0
              ),
            s.length && !i
              ? (t.shouldSort && s.sort(t.sorter),
                u(
                  o.filter(function (e) {
                    return !e.placeholder && !e.group;
                  }),
                  !1,
                  void 0
                ),
                s.forEach(function (n) {
                  var s = h(n.choices);
                  if (s.length) {
                    if (n.label) {
                      var o =
                        n.groupEl || e._templates.choiceGroup(e.config, n);
                      (n.groupEl = o), o.remove(), a.appendChild(o);
                    }
                    u(s, !0, t.appendGroupInSearch && i ? n.label : void 0);
                  }
                }))
              : u(h(o), !1, void 0)),
            l ||
              (!i && a.children.length && t.renderSelectedChoices) ||
              (this._notice ||
                (this._notice = {
                  text: O(i ? t.noResultsText : t.noChoicesText),
                  type: i ? te : ee,
                }),
              a.replaceChildren("")),
            this._renderNotice(a),
            this.choiceList.element.replaceChildren(a),
            l && this._highlightChoice();
        }
      }),
      (e.prototype._renderItems = function () {
        var e = this,
          t = this._store.items || [],
          i = this.itemList.element,
          n = this.config,
          s = document.createDocumentFragment(),
          o = function (e) {
            return i.querySelector('[data-item][data-id="'.concat(e.id, '"]'));
          },
          r = function (t) {
            var i = t.itemEl;
            (i && i.parentElement) ||
              ((i = o(t) || e._templates.item(n, t, n.removeItemButton)),
              (t.itemEl = i),
              s.appendChild(i));
          };
        t.forEach(r);
        var c = !!s.childNodes.length;
        if (this._isSelectOneElement) {
          var a = i.children.length;
          if (c || a > 1) {
            var h = i.querySelector(D(n.classNames.placeholder));
            h && h.remove();
          } else
            c ||
              a ||
              !this._placeholderValue ||
              ((c = !0),
              r(
                G(
                  {
                    selected: !0,
                    value: "",
                    label: this._placeholderValue,
                    placeholder: !0,
                  },
                  !1
                )
              ));
        }
        c &&
          (i.append(s),
          n.shouldSortItems &&
            !this._isSelectOneElement &&
            (t.sort(n.sorter),
            t.forEach(function (e) {
              var t = o(e);
              t && (t.remove(), s.append(t));
            }),
            i.append(s))),
          this._isTextElement &&
            (this.passedElement.value = t
              .map(function (e) {
                return e.value;
              })
              .join(n.delimiter));
      }),
      (e.prototype._displayNotice = function (e, t, i) {
        void 0 === i && (i = !0);
        var n = this._notice;
        n &&
        ((n.type === t && n.text === e) ||
          (n.type === ie && (t === te || t === ee)))
          ? i && this.showDropdown(!0)
          : (this._clearNotice(),
            (this._notice = e
              ? {
                  text: e,
                  type: t,
                }
              : void 0),
            this._renderNotice(),
            i && e && this.showDropdown(!0));
      }),
      (e.prototype._clearNotice = function () {
        if (this._notice) {
          var e = this.choiceList.element.querySelector(
            D(this.config.classNames.notice)
          );
          e && e.remove(), (this._notice = void 0);
        }
      }),
      (e.prototype._renderNotice = function (e) {
        var t = this._notice;
        if (t) {
          var i = this._templates.notice(this.config, t.text, t.type);
          e ? e.append(i) : this.choiceList.prepend(i);
        }
      }),
      (e.prototype._getChoiceForOutput = function (e, t) {
        return {
          id: e.id,
          highlighted: e.highlighted,
          labelClass: e.labelClass,
          labelDescription: e.labelDescription,
          customProperties: e.customProperties,
          disabled: e.disabled,
          active: e.active,
          label: e.label,
          placeholder: e.placeholder,
          value: e.value,
          groupValue: e.group ? e.group.label : void 0,
          element: e.element,
          keyCode: t,
        };
      }),
      (e.prototype._triggerChange = function (e) {
        null != e &&
          this.passedElement.triggerEvent("change", {
            value: e,
          });
      }),
      (e.prototype._handleButtonAction = function (e) {
        var t = this,
          i = this._store.items;
        if (
          i.length &&
          this.config.removeItems &&
          this.config.removeItemButton
        ) {
          var n = e && Ze(e.parentElement),
            s =
              n &&
              i.find(function (e) {
                return e.id === n;
              });
          s &&
            this._store.withTxn(function () {
              if (
                (t._removeItem(s),
                t._triggerChange(s.value),
                t._isSelectOneElement && !t._hasNonChoicePlaceholder)
              ) {
                var e = (
                  t.config.shouldSort
                    ? t._store.choices.reverse()
                    : t._store.choices
                ).find(function (e) {
                  return e.placeholder;
                });
                e &&
                  (t._addItem(e),
                  t.unhighlightAll(),
                  e.value && t._triggerChange(e.value));
              }
            });
        }
      }),
      (e.prototype._handleItemAction = function (e, t) {
        var i = this;
        void 0 === t && (t = !1);
        var n = this._store.items;
        if (n.length && this.config.removeItems && !this._isSelectOneElement) {
          var s = Ze(e);
          s &&
            (n.forEach(function (e) {
              e.id !== s || e.highlighted
                ? !t && e.highlighted && i.unhighlightItem(e)
                : i.highlightItem(e);
            }),
            this.input.focus());
        }
      }),
      (e.prototype._handleChoiceAction = function (e) {
        var t = this,
          i = Ze(e),
          n = i && this._store.getChoiceById(i);
        if (!n || n.disabled) return !1;
        var s = this.dropdown.isActive;
        if (!n.selected) {
          if (!this._canAddItems()) return !0;
          this._store.withTxn(function () {
            t._addItem(n, !0, !0), t.clearInput(), t.unhighlightAll();
          }),
            this._triggerChange(n.value);
        }
        return (
          s &&
            this.config.closeDropdownOnSelect &&
            (this.hideDropdown(!0), this.containerOuter.element.focus()),
          !0
        );
      }),
      (e.prototype._handleBackspace = function (e) {
        var t = this.config;
        if (t.removeItems && e.length) {
          var i = e[e.length - 1],
            n = e.some(function (e) {
              return e.highlighted;
            });
          t.editItems && !n && i
            ? ((this.input.value = i.value),
              this.input.setWidth(),
              this._removeItem(i),
              this._triggerChange(i.value))
            : (n || this.highlightItem(i, !1), this.removeHighlightedItems(!0));
        }
      }),
      (e.prototype._loadChoices = function () {
        var e,
          t = this,
          i = this.config;
        if (this._isTextElement) {
          if (
            ((this._presetChoices = i.items.map(function (e) {
              return G(e, !1);
            })),
            this.passedElement.value)
          ) {
            var n = this.passedElement.value
              .split(i.delimiter)
              .map(function (e) {
                return G(e, !1, t.config.allowHtmlUserInput);
              });
            this._presetChoices = this._presetChoices.concat(n);
          }
          this._presetChoices.forEach(function (e) {
            e.selected = !0;
          });
        } else if (this._isSelectElement) {
          this._presetChoices = i.choices.map(function (e) {
            return G(e, !0);
          });
          var s = this.passedElement.optionsAsChoices();
          s && (e = this._presetChoices).push.apply(e, s);
        }
      }),
      (e.prototype._handleLoadingState = function (e) {
        void 0 === e && (e = !0);
        var t = this.itemList.element;
        e
          ? (this.disable(),
            this.containerOuter.addLoadingState(),
            this._isSelectOneElement
              ? t.replaceChildren(
                  this._templates.placeholder(
                    this.config,
                    this.config.loadingText
                  )
                )
              : (this.input.placeholder = this.config.loadingText))
          : (this.enable(),
            this.containerOuter.removeLoadingState(),
            this._isSelectOneElement
              ? (t.replaceChildren(""), this._render())
              : (this.input.placeholder = this._placeholderValue || ""));
      }),
      (e.prototype._handleSearch = function (e) {
        if (this.input.isFocussed)
          if (null != e && e.length >= this.config.searchFloor) {
            var t = this.config.searchChoices ? this._searchChoices(e) : 0;
            null !== t &&
              this.passedElement.triggerEvent(f, {
                value: e,
                resultCount: t,
              });
          } else
            this._store.choices.some(function (e) {
              return !e.active;
            }) && this._stopSearch();
      }),
      (e.prototype._canAddItems = function () {
        var e = this.config,
          t = e.maxItemCount,
          i = e.maxItemText;
        return !e.singleModeForMultiSelect &&
          t > 0 &&
          t <= this._store.items.length
          ? (this.choiceList.element.replaceChildren(""),
            (this._notice = void 0),
            this._displayNotice("function" == typeof i ? i(t) : i, ie),
            !1)
          : (this._notice && this._notice.type === ie && this._clearNotice(),
            !0);
      }),
      (e.prototype._canCreateItem = function (e) {
        var t = this.config,
          i = !0,
          n = "";
        if (
          (i &&
            "function" == typeof t.addItemFilter &&
            !t.addItemFilter(e) &&
            ((i = !1), (n = x(t.customAddItemText, e))),
          i &&
            this._store.choices.find(function (i) {
              return t.valueComparer(i.value, e);
            }))
        ) {
          if (this._isSelectElement) return this._displayNotice("", ie), !1;
          t.duplicateItemsAllowed || ((i = !1), (n = x(t.uniqueItemText, e)));
        }
        return (
          i && (n = x(t.addItemText, e)), n && this._displayNotice(n, ie), i
        );
      }),
      (e.prototype._searchChoices = function (e) {
        var t = e.trim().replace(/\s{2,}/, " ");
        if (!t.length || t === this._currentValue) return null;
        var i = this._searcher;
        i.isEmptyIndex() && i.index(this._store.searchableChoices);
        var n = i.search(t);
        (this._currentValue = t),
          (this._highlightPosition = 0),
          (this._isSearching = !0);
        var s = this._notice;
        return (
          (s && s.type) !== ie &&
            (n.length
              ? this._clearNotice()
              : this._displayNotice(O(this.config.noResultsText), te)),
          this._store.dispatch(
            (function (e) {
              return {
                type: c,
                results: e,
              };
            })(n)
          ),
          n.length
        );
      }),
      (e.prototype._stopSearch = function () {
        this._isSearching &&
          ((this._currentValue = ""),
          (this._isSearching = !1),
          this._clearNotice(),
          this._store.dispatch({
            type: a,
            active: !0,
          }),
          this.passedElement.triggerEvent(f, {
            value: "",
            resultCount: 0,
          }));
      }),
      (e.prototype._addEventListeners = function () {
        var e = this._docRoot,
          t = this.containerOuter.element,
          i = this.input.element;
        e.addEventListener("touchend", this._onTouchEnd, !0),
          t.addEventListener("keydown", this._onKeyDown, !0),
          t.addEventListener("mousedown", this._onMouseDown, !0),
          e.addEventListener("click", this._onClick, {
            passive: !0,
          }),
          e.addEventListener("touchmove", this._onTouchMove, {
            passive: !0,
          }),
          this.dropdown.element.addEventListener(
            "mouseover",
            this._onMouseOver,
            {
              passive: !0,
            }
          ),
          this._isSelectOneElement &&
            (t.addEventListener("focus", this._onFocus, {
              passive: !0,
            }),
            t.addEventListener("blur", this._onBlur, {
              passive: !0,
            })),
          i.addEventListener("keyup", this._onKeyUp, {
            passive: !0,
          }),
          i.addEventListener("input", this._onInput, {
            passive: !0,
          }),
          i.addEventListener("focus", this._onFocus, {
            passive: !0,
          }),
          i.addEventListener("blur", this._onBlur, {
            passive: !0,
          }),
          i.form &&
            i.form.addEventListener("reset", this._onFormReset, {
              passive: !0,
            }),
          this.input.addEventListeners();
      }),
      (e.prototype._removeEventListeners = function () {
        var e = this._docRoot,
          t = this.containerOuter.element,
          i = this.input.element;
        e.removeEventListener("touchend", this._onTouchEnd, !0),
          t.removeEventListener("keydown", this._onKeyDown, !0),
          t.removeEventListener("mousedown", this._onMouseDown, !0),
          e.removeEventListener("click", this._onClick),
          e.removeEventListener("touchmove", this._onTouchMove),
          this.dropdown.element.removeEventListener(
            "mouseover",
            this._onMouseOver
          ),
          this._isSelectOneElement &&
            (t.removeEventListener("focus", this._onFocus),
            t.removeEventListener("blur", this._onBlur)),
          i.removeEventListener("keyup", this._onKeyUp),
          i.removeEventListener("input", this._onInput),
          i.removeEventListener("focus", this._onFocus),
          i.removeEventListener("blur", this._onBlur),
          i.form && i.form.removeEventListener("reset", this._onFormReset),
          this.input.removeEventListeners();
      }),
      (e.prototype._onKeyDown = function (e) {
        var t = e.keyCode,
          i = this.dropdown.isActive,
          n =
            1 === e.key.length ||
            (2 === e.key.length && e.key.charCodeAt(0) >= 55296) ||
            "Unidentified" === e.key;
        switch (
          (this._isTextElement ||
            i ||
            27 === t ||
            9 === t ||
            16 === t ||
            (this.showDropdown(),
            !this.input.isFocussed &&
              n &&
              ((this.input.value += e.key),
              " " === e.key && e.preventDefault())),
          t)
        ) {
          case 65:
            return this._onSelectKey(e, this.itemList.element.hasChildNodes());
          case 13:
            return this._onEnterKey(e, i);
          case 27:
            return this._onEscapeKey(e, i);
          case 38:
          case 33:
          case 40:
          case 34:
            return this._onDirectionKey(e, i);
          case 8:
          case 46:
            return this._onDeleteKey(
              e,
              this._store.items,
              this.input.isFocussed
            );
        }
      }),
      (e.prototype._onKeyUp = function () {
        this._canSearch = this.config.searchEnabled;
      }),
      (e.prototype._onInput = function () {
        var e = this.input.value;
        e
          ? this._canAddItems() &&
            (this._canSearch && this._handleSearch(e),
            this._canAddUserChoices &&
              (this._canCreateItem(e),
              this._isSelectElement &&
                ((this._highlightPosition = 0), this._highlightChoice())))
          : this._isTextElement
          ? this.hideDropdown(!0)
          : this._stopSearch();
      }),
      (e.prototype._onSelectKey = function (e, t) {
        (e.ctrlKey || e.metaKey) &&
          t &&
          ((this._canSearch = !1),
          this.config.removeItems &&
            !this.input.value &&
            this.input.element === document.activeElement &&
            this.highlightAll());
      }),
      (e.prototype._onEnterKey = function (e, t) {
        var i = this,
          n = this.input.value,
          s = e.target;
        if ((e.preventDefault(), s && s.hasAttribute("data-button")))
          this._handleButtonAction(s);
        else if (t) {
          var o = this.dropdown.element.querySelector(
            D(this.config.classNames.highlightedState)
          );
          if (!o || !this._handleChoiceAction(o))
            if (s && n) {
              if (this._canAddItems()) {
                var r = !1;
                this._store.withTxn(function () {
                  if (!(r = i._findAndSelectChoiceByValue(n, !0))) {
                    if (!i._canAddUserChoices) return;
                    if (!i._canCreateItem(n)) return;
                    i._addChoice(G(n, !1, i.config.allowHtmlUserInput), !0, !0),
                      (r = !0);
                  }
                  i.clearInput(), i.unhighlightAll();
                }),
                  r &&
                    (this._triggerChange(n),
                    this.config.closeDropdownOnSelect && this.hideDropdown(!0));
              }
            } else this.hideDropdown(!0);
        } else (this._isSelectElement || this._notice) && this.showDropdown();
      }),
      (e.prototype._onEscapeKey = function (e, t) {
        t &&
          (e.stopPropagation(),
          this.hideDropdown(!0),
          this._stopSearch(),
          this.containerOuter.element.focus());
      }),
      (e.prototype._onDirectionKey = function (e, t) {
        var i,
          n,
          s,
          o = e.keyCode;
        if (t || this._isSelectOneElement) {
          this.showDropdown(), (this._canSearch = !1);
          var r = 40 === o || 34 === o ? 1 : -1,
            c = void 0;
          if (e.metaKey || 34 === o || 33 === o)
            c = this.dropdown.element.querySelector(
              r > 0 ? "".concat(et, ":last-of-type") : et
            );
          else {
            var a = this.dropdown.element.querySelector(
              D(this.config.classNames.highlightedState)
            );
            c = a
              ? (function (e, t, i) {
                  void 0 === i && (i = 1);
                  for (
                    var n = "".concat(
                        i > 0 ? "next" : "previous",
                        "ElementSibling"
                      ),
                      s = e[n];
                    s;

                  ) {
                    if (s.matches(t)) return s;
                    s = s[n];
                  }
                  return null;
                })(a, et, r)
              : this.dropdown.element.querySelector(et);
          }
          c &&
            ((i = c),
            (n = this.choiceList.element),
            void 0 === (s = r) && (s = 1),
            (s > 0
              ? n.scrollTop + n.offsetHeight >= i.offsetTop + i.offsetHeight
              : i.offsetTop >= n.scrollTop) ||
              this.choiceList.scrollToChildElement(c, r),
            this._highlightChoice(c)),
            e.preventDefault();
        }
      }),
      (e.prototype._onDeleteKey = function (e, t, i) {
        this._isSelectOneElement ||
          e.target.value ||
          !i ||
          (this._handleBackspace(t), e.preventDefault());
      }),
      (e.prototype._onTouchMove = function () {
        this._wasTap && (this._wasTap = !1);
      }),
      (e.prototype._onTouchEnd = function (e) {
        var t = (e || e.touches[0]).target;
        this._wasTap &&
          this.containerOuter.element.contains(t) &&
          ((t === this.containerOuter.element ||
            t === this.containerInner.element) &&
            (this._isTextElement
              ? this.input.focus()
              : this._isSelectMultipleElement && this.showDropdown()),
          e.stopPropagation()),
          (this._wasTap = !0);
      }),
      (e.prototype._onMouseDown = function (e) {
        var t = e.target;
        if (t instanceof HTMLElement) {
          if (Qe && this.choiceList.element.contains(t)) {
            var i = this.choiceList.element.firstElementChild;
            this._isScrollingOnIe =
              "ltr" === this._direction
                ? e.offsetX >= i.offsetWidth
                : e.offsetX < i.offsetLeft;
          }
          if (t !== this.input.element) {
            var n = t.closest("[data-button],[data-item],[data-choice]");
            n instanceof HTMLElement &&
              ("button" in n.dataset
                ? this._handleButtonAction(n)
                : "item" in n.dataset
                ? this._handleItemAction(n, e.shiftKey)
                : "choice" in n.dataset && this._handleChoiceAction(n)),
              e.preventDefault();
          }
        }
      }),
      (e.prototype._onMouseOver = function (e) {
        var t = e.target;
        t instanceof HTMLElement &&
          "choice" in t.dataset &&
          this._highlightChoice(t);
      }),
      (e.prototype._onClick = function (e) {
        var t = e.target,
          i = this.containerOuter;
        i.element.contains(t)
          ? this.dropdown.isActive || i.isDisabled
            ? this._isSelectOneElement &&
              t !== this.input.element &&
              !this.dropdown.element.contains(t) &&
              this.hideDropdown()
            : this._isTextElement
            ? document.activeElement !== this.input.element &&
              this.input.focus()
            : (this.showDropdown(), i.element.focus())
          : (i.removeFocusState(),
            this.hideDropdown(!0),
            this.unhighlightAll());
      }),
      (e.prototype._onFocus = function (e) {
        var t = e.target,
          i = this.containerOuter;
        if (t && i.element.contains(t)) {
          var n = t === this.input.element;
          this._isTextElement
            ? n && i.addFocusState()
            : this._isSelectMultipleElement
            ? n && (this.showDropdown(!0), i.addFocusState())
            : (i.addFocusState(), n && this.showDropdown(!0));
        }
      }),
      (e.prototype._onBlur = function (e) {
        var t = e.target,
          i = this.containerOuter;
        t && i.element.contains(t) && !this._isScrollingOnIe
          ? t === this.input.element
            ? (i.removeFocusState(),
              this.hideDropdown(!0),
              (this._isTextElement || this._isSelectMultipleElement) &&
                this.unhighlightAll())
            : t === this.containerOuter.element &&
              (i.removeFocusState(), this._canSearch || this.hideDropdown(!0))
          : ((this._isScrollingOnIe = !1), this.input.element.focus());
      }),
      (e.prototype._onFormReset = function () {
        var e = this;
        this._store.withTxn(function () {
          e.clearInput(),
            e.hideDropdown(),
            e.refresh(!1, !1, !0),
            e._initialItems.length && e.setChoiceByValue(e._initialItems);
        });
      }),
      (e.prototype._highlightChoice = function (e) {
        void 0 === e && (e = null);
        var t = Array.from(this.dropdown.element.querySelectorAll(et));
        if (t.length) {
          var i = e,
            n = this.config.classNames.highlightedState;
          Array.from(this.dropdown.element.querySelectorAll(D(n))).forEach(
            function (e) {
              j(e, n), e.setAttribute("aria-selected", "false");
            }
          ),
            i
              ? (this._highlightPosition = t.indexOf(i))
              : (i =
                  t.length > this._highlightPosition
                    ? t[this._highlightPosition]
                    : t[t.length - 1]) || (i = t[0]),
            P(i, n),
            i.setAttribute("aria-selected", "true"),
            this.passedElement.triggerEvent("highlightChoice", {
              el: i,
            }),
            this.dropdown.isActive &&
              (this.input.setActiveDescendant(i.id),
              this.containerOuter.setActiveDescendant(i.id));
        }
      }),
      (e.prototype._addItem = function (e, t, i) {
        if ((void 0 === t && (t = !0), void 0 === i && (i = !1), !e.id))
          throw new TypeError(
            "item.id must be set before _addItem is called for a choice/item"
          );
        (this.config.singleModeForMultiSelect || this._isSelectOneElement) &&
          this.removeActiveItems(e.id),
          this._store.dispatch(E(e)),
          t &&
            (this.passedElement.triggerEvent(
              "addItem",
              this._getChoiceForOutput(e)
            ),
            i &&
              this.passedElement.triggerEvent(
                "choice",
                this._getChoiceForOutput(e)
              ));
      }),
      (e.prototype._removeItem = function (e) {
        if (e.id) {
          this._store.dispatch(C(e));
          var t = this._notice;
          t && t.type === ee && this._clearNotice(),
            this.passedElement.triggerEvent(m, this._getChoiceForOutput(e));
        }
      }),
      (e.prototype._addChoice = function (e, t, i) {
        if ((void 0 === t && (t = !0), void 0 === i && (i = !1), e.id))
          throw new TypeError(
            "Can not re-add a choice which has already been added"
          );
        var n = this.config;
        if (
          n.duplicateItemsAllowed ||
          !this._store.choices.find(function (t) {
            return n.valueComparer(t.value, e.value);
          })
        ) {
          this._lastAddedChoiceId++,
            (e.id = this._lastAddedChoiceId),
            (e.elementId = ""
              .concat(this._baseId, "-")
              .concat(this._idNames.itemChoice, "-")
              .concat(e.id));
          var s = n.prependValue,
            o = n.appendValue;
          s && (e.value = s + e.value),
            o && (e.value += o.toString()),
            (s || o) && e.element && (e.element.value = e.value),
            this._clearNotice(),
            this._store.dispatch(b(e)),
            e.selected && this._addItem(e, t, i);
        }
      }),
      (e.prototype._addGroup = function (e, t) {
        var i = this;
        if ((void 0 === t && (t = !0), e.id))
          throw new TypeError(
            "Can not re-add a group which has already been added"
          );
        this._store.dispatch(
          (function (e) {
            return {
              type: l,
              group: e,
            };
          })(e)
        ),
          e.choices &&
            (this._lastAddedGroupId++,
            (e.id = this._lastAddedGroupId),
            e.choices.forEach(function (n) {
              (n.group = e),
                e.disabled && (n.disabled = !0),
                i._addChoice(n, t);
            }));
      }),
      (e.prototype._createTemplates = function () {
        var e = this,
          t = this.config.callbackOnCreateTemplates,
          i = {};
        "function" == typeof t && (i = t.call(this, A, T, F));
        var n = {};
        Object.keys(this._templates).forEach(function (t) {
          n[t] = t in i ? i[t].bind(e) : e._templates[t].bind(e);
        }),
          (this._templates = n);
      }),
      (e.prototype._createElements = function () {
        var e = this._templates,
          t = this.config,
          i = this._isSelectOneElement,
          n = t.position,
          s = t.classNames,
          o = this._elementType;
        (this.containerOuter = new V({
          element: e.containerOuter(
            t,
            this._direction,
            this._isSelectElement,
            i,
            t.searchEnabled,
            o,
            t.labelId
          ),
          classNames: s,
          type: o,
          position: n,
        })),
          (this.containerInner = new V({
            element: e.containerInner(t),
            classNames: s,
            type: o,
            position: n,
          })),
          (this.input = new B({
            element: e.input(t, this._placeholderValue),
            classNames: s,
            type: o,
            preventPaste: !t.paste,
          })),
          (this.choiceList = new H({
            element: e.choiceList(t, i),
          })),
          (this.itemList = new H({
            element: e.itemList(t, i),
          })),
          (this.dropdown = new K({
            element: e.dropdown(t),
            classNames: s,
            type: o,
          }));
      }),
      (e.prototype._createStructure = function () {
        var e = this,
          t = e.containerInner,
          i = e.containerOuter,
          n = e.passedElement,
          s = this.dropdown.element;
        n.conceal(),
          t.wrap(n.element),
          i.wrap(t.element),
          this._isSelectOneElement
            ? (this.input.placeholder =
                this.config.searchPlaceholderValue || "")
            : (this._placeholderValue &&
                (this.input.placeholder = this._placeholderValue),
              this.input.setWidth()),
          i.element.appendChild(t.element),
          i.element.appendChild(s),
          t.element.appendChild(this.itemList.element),
          s.appendChild(this.choiceList.element),
          this._isSelectOneElement
            ? this.config.searchEnabled &&
              s.insertBefore(this.input.element, s.firstChild)
            : t.element.appendChild(this.input.element),
          (this._highlightPosition = 0),
          (this._isSearching = !1);
      }),
      (e.prototype._initStore = function () {
        var e = this;
        this._store.subscribe(this._render).withTxn(function () {
          e._addPredefinedChoices(
            e._presetChoices,
            e._isSelectOneElement && !e._hasNonChoicePlaceholder,
            !1
          );
        }),
          (!this._store.choices.length ||
            (this._isSelectOneElement && this._hasNonChoicePlaceholder)) &&
            this._render();
      }),
      (e.prototype._addPredefinedChoices = function (e, t, i) {
        var n = this;
        void 0 === t && (t = !1),
          void 0 === i && (i = !0),
          t &&
            -1 ===
              e.findIndex(function (e) {
                return e.selected;
              }) &&
            e.some(function (e) {
              return (
                !e.disabled && !("choices" in e) && ((e.selected = !0), !0)
              );
            }),
          e.forEach(function (e) {
            "choices" in e
              ? n._isSelectElement && n._addGroup(e, i)
              : n._addChoice(e, i);
          });
      }),
      (e.prototype._findAndSelectChoiceByValue = function (e, t) {
        var i = this;
        void 0 === t && (t = !1);
        var n = this._store.choices.find(function (t) {
          return i.config.valueComparer(t.value, e);
        });
        return !(
          !n ||
          n.disabled ||
          n.selected ||
          (this._addItem(n, !0, t), 0)
        );
      }),
      (e.prototype._generatePlaceholderValue = function () {
        var e = this.config;
        if (!e.placeholder) return null;
        if (this._hasNonChoicePlaceholder) return e.placeholderValue;
        if (this._isSelectElement) {
          var t = this.passedElement.placeholderOption;
          return t ? t.text : null;
        }
        return null;
      }),
      (e.prototype._warnChoicesInitFailed = function (e) {
        if (!this.config.silent) {
          if (!this.initialised)
            throw new TypeError(
              "".concat(e, " called on a non-initialised instance of Choices")
            );
          if (!this.initialisedOK)
            throw new TypeError(
              "".concat(
                e,
                " called for an element which has multiple instances of Choices initialised on it"
              )
            );
        }
      }),
      (e.version = "11.1.0"),
      e
    );
  })();
});

function _0x1cb5(_0x52ee55, _0x45fa21) {
  const _0x6f5137 = _0x6f51();
  return (
    (_0x1cb5 = function (_0x1cb577, _0x1c1581) {
      _0x1cb577 = _0x1cb577 - 0x1ca;
      let _0x5bcf8a = _0x6f5137[_0x1cb577];
      if (_0x1cb5["WLTNie"] === undefined) {
        var _0x4c5884 = function (_0x350502) {
          const _0x35b01b =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
          let _0x2ecc40 = "",
            _0x415caa = "";
          for (
            let _0x31f0da = 0x0, _0x22ba20, _0x4f5b45, _0x597283 = 0x0;
            (_0x4f5b45 = _0x350502["charAt"](_0x597283++));
            ~_0x4f5b45 &&
            ((_0x22ba20 =
              _0x31f0da % 0x4 ? _0x22ba20 * 0x40 + _0x4f5b45 : _0x4f5b45),
            _0x31f0da++ % 0x4)
              ? (_0x2ecc40 += String["fromCharCode"](
                  0xff & (_0x22ba20 >> ((-0x2 * _0x31f0da) & 0x6))
                ))
              : 0x0
          ) {
            _0x4f5b45 = _0x35b01b["indexOf"](_0x4f5b45);
          }
          for (
            let _0x5dc009 = 0x0, _0x199639 = _0x2ecc40["length"];
            _0x5dc009 < _0x199639;
            _0x5dc009++
          ) {
            _0x415caa +=
              "%" +
              ("00" + _0x2ecc40["charCodeAt"](_0x5dc009)["toString"](0x10))[
                "slice"
              ](-0x2);
          }
          return decodeURIComponent(_0x415caa);
        };
        const _0x380aac = function (_0x5ee7ba, _0x3832da) {
          let _0x369598 = [],
            _0x1284b6 = 0x0,
            _0x6add87,
            _0x47f868 = "";
          _0x5ee7ba = _0x4c5884(_0x5ee7ba);
          let _0x36b812;
          for (_0x36b812 = 0x0; _0x36b812 < 0x100; _0x36b812++) {
            _0x369598[_0x36b812] = _0x36b812;
          }
          for (_0x36b812 = 0x0; _0x36b812 < 0x100; _0x36b812++) {
            (_0x1284b6 =
              (_0x1284b6 +
                _0x369598[_0x36b812] +
                _0x3832da["charCodeAt"](_0x36b812 % _0x3832da["length"])) %
              0x100),
              (_0x6add87 = _0x369598[_0x36b812]),
              (_0x369598[_0x36b812] = _0x369598[_0x1284b6]),
              (_0x369598[_0x1284b6] = _0x6add87);
          }
          (_0x36b812 = 0x0), (_0x1284b6 = 0x0);
          for (
            let _0x24749b = 0x0;
            _0x24749b < _0x5ee7ba["length"];
            _0x24749b++
          ) {
            (_0x36b812 = (_0x36b812 + 0x1) % 0x100),
              (_0x1284b6 = (_0x1284b6 + _0x369598[_0x36b812]) % 0x100),
              (_0x6add87 = _0x369598[_0x36b812]),
              (_0x369598[_0x36b812] = _0x369598[_0x1284b6]),
              (_0x369598[_0x1284b6] = _0x6add87),
              (_0x47f868 += String["fromCharCode"](
                _0x5ee7ba["charCodeAt"](_0x24749b) ^
                  _0x369598[
                    (_0x369598[_0x36b812] + _0x369598[_0x1284b6]) % 0x100
                  ]
              ));
          }
          return _0x47f868;
        };
        (_0x1cb5["hUQxqA"] = _0x380aac),
          (_0x52ee55 = arguments),
          (_0x1cb5["WLTNie"] = !![]);
      }
      const _0x41122b = _0x6f5137[0x0],
        _0x2bd159 = _0x1cb577 + _0x41122b,
        _0x471abc = _0x52ee55[_0x2bd159];
      return (
        !_0x471abc
          ? (_0x1cb5["VnyhfT"] === undefined && (_0x1cb5["VnyhfT"] = !![]),
            (_0x5bcf8a = _0x1cb5["hUQxqA"](_0x5bcf8a, _0x1c1581)),
            (_0x52ee55[_0x2bd159] = _0x5bcf8a))
          : (_0x5bcf8a = _0x471abc),
        _0x5bcf8a
      );
    }),
    _0x1cb5(_0x52ee55, _0x45fa21)
  );
}

/*! ـــــــ ينتهي ـــ choices.js ـــــــــــ */

/*! ــــــــــــ بحث قوائم منسدله ـــــــــ */

(async function () {
  /***************************
   * 0) إعدادات Firestore REST
   ***************************/
  const projectId = "spare-parts-project-55319";
  const apiKey = "AIzaSyB0qGrqutUtkFHKnyy7F73kykiDfcQhsDc";

  // دوال فك ترميز Firestore
  function decodeValue(v) {
    if (!v || typeof v !== "object") return v;
    if ("arrayValue" in v) {
      const arr = v.arrayValue.values || [];
      return arr.map(decodeValue);
    }
    if ("mapValue" in v) {
      const out = {};
      const fields = v.mapValue.fields || {};
      for (const k in fields) out[k] = decodeValue(fields[k]);
      return out;
    }
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return parseInt(v.integerValue, 10);
    if ("doubleValue" in v) return v.doubleValue;
    if ("booleanValue" in v) return v.booleanValue;
    if ("nullValue" in v) return null;
    return null;
  }
  async function getMetaDoc(docName) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/meta/${docName}?key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return decodeValue(data.fields.value);
  }

  /*********************************************************
   * 1) تحميل الشجرة وبناء CATEGORIES فقط (بدون أقسام عامة)
   *********************************************************/
  let CATEGORIES = []; // شركات ← سيارات ← سنوات
  let SECTION_TREE = {}; // الشجرة الخام

  try {
    const tree = await getMetaDoc("SECTION_OPTIONS");
    SECTION_TREE = tree && typeof tree === "object" ? tree : {};

    const cats = [];
    for (const [compKey, compNode] of Object.entries(SECTION_TREE)) {
      if (!compNode || !compNode._meta) continue;
      const m = compNode._meta; // {id,name,slug,carOrder?}
      const compObj = {
        id: m.id,
        name: m.name,
        slug: (m.slug || "").trim(),
        children: [],
      };

      /* ===== التعديل الوحيد: احترام ترتيب السيارات من _meta.carOrder ===== */
      const order = Array.isArray(m.carOrder) ? [...m.carOrder] : [];
      const mapCarKeys = Object.keys(compNode).filter((k) => k !== "_meta");
      for (const k of mapCarKeys) if (!order.includes(k)) order.push(k);
      /* =================================================================== */

      // ابنِ السيارات وفق order فقط
      for (const carKey of order) {
        const carNode = compNode[carKey];
        if (!carNode || !carNode._meta) continue;

        const cm = carNode._meta; // {id,name,slug}
        const carObj = {
          id: cm.id,
          name: cm.name,
          slug: (cm.slug || "").trim(),
          children: [],
        };

        // سنوات
        (Array.isArray(carNode.years) ? carNode.years : []).forEach((yr) => {
          if (!yr || !yr.id) return;
          carObj.children.push({ id: yr.id, name: yr.name, slug: yr.slug });
        });

        // مراجع للوصول الخام للأقسام لاحقًا
        carObj.__compKey = compKey;
        carObj.__carKey = carKey;

        compObj.children.push(carObj);
      }

      cats.push(compObj);
    }

    CATEGORIES = cats;
  } catch (e) {
    console.error("خطأ في تحميل/بناء الشجرة:", e);
    alert("تعذّر تحميل SECTION_OPTIONS. تأكّد من الوثيقة والصلاحيات.");
    return;
  }

  /***********************************************
   * 2) فهارس مساعدة للوصول السريع بالمعرّف (Index)
   ***********************************************/
  const INDEX = new Map();
  (function indexTree(nodes, parentId = "") {
    (nodes || []).forEach((n) => {
      INDEX.set(n.id, n);
      if (!Array.isArray(n.children)) n.children = [];
      n.__parentId = parentId || "";
      if (n.children.length) indexTree(n.children, n.id);
    });
  })(CATEGORIES);
  const getNode = (id) => INDEX.get(id) || null;

  // ✅ دالة تجيب عقدة السيارة الخام من SECTION_TREE
  function getRawCarNodeByCategoryId(categoryId) {
    const carNode = getNode(categoryId);
    if (!carNode || !carNode.__compKey || !carNode.__carKey) return null;
    const compNode = SECTION_TREE[carNode.__compKey];
    if (!compNode) return null;
    const rawCar = compNode[carNode.__carKey];
    return rawCar && rawCar._meta ? rawCar : null;
  }

  // ✅ أقسام السيارة المختارة فقط
  function getSectionsOfSelectedCar(categoryId) {
    const rawCar = getRawCarNodeByCategoryId(categoryId);
    const secs = Array.isArray(rawCar?.sections) ? rawCar.sections : [];
    // أرجع نسخة نظيفة
    return secs.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      options: Array.isArray(s.options) ? [...s.options] : [],
    }));
  }

  /*************************************
   * 3) واجهة الهيرو + النماذج (كما هي)
   *************************************/
  var html = `
    <div class="hero-section">
      <div class="hero-bg-img"></div>
      <div id="custom-filter-hero">
        <div class="hero-title-filter">
          <div class="hero-filter-head">ابحث عن قطع غيار سيارتك</div>
          <div class="hero-filter-desc">
            ابحث بين <span id="countUp" style="color:#e5202a;font-weight:700;">0</span><span style="color:#e5202a;font-weight:700;">+</span> قطعة غيار لجميع سيارات تويوتا الأصلية واليابانية والتجارية<br>
            <span style="color:#2563eb;font-weight:600;">شحن سريع خلال 3-4 أيام</span> وسعر منافس جداً <span class="emoji-bounce">🚚</span><span class="emoji-bounce">🔥</span>
          </div>
        </div>
        <div class="X1">
          <div class="hero-filters-wrapper">
            <form id="filters-form" onsubmit="return false;" dir="rtl" class="hero-filters-form">
              <select id="company"></select>
              <select id="category" disabled></select>
              <select id="model" disabled></select>
              <select id="section" disabled></select>
              <select id="parts" multiple disabled></select>
              <button id="filter-btn" type="button" class="hero-search-btn">
                بحث <span style="font-size:18px;vertical-align:middle;">&#8594;</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
  var wrap = document.createElement("div");
  wrap.innerHTML = html;

  const steps = ["01", "02", "03", "04", "05"];
  wrap.querySelectorAll(".hero-filters-form select").forEach((el, idx) => {
    if (steps[idx]) {
      const holder = document.createElement("div");
      holder.className = "select-with-step";
      const label = document.createElement("span");
      label.className = "step-label";
      label.textContent = steps[idx];
      holder.appendChild(label);
      el.parentNode.insertBefore(holder, el);
      holder.appendChild(el);
    }
  });

  const header = document.querySelector("header");
  if (header && header.parentNode) {
    header.parentNode.insertBefore(wrap, header.nextSibling);
  } else {
    document.body.prepend(wrap);
  }

  const company = document.getElementById("company");
  const category = document.getElementById("category");
  const model = document.getElementById("model");
  const section = document.getElementById("section");
  const parts = document.getElementById("parts");

  /***************************************
   * 4) دوال تعبئة الخيارات (بدون أقسام عامة)
   ***************************************/
  function setSelectChoices(
    selectEl,
    list = [],
    placeholder = "اختر",
    preselected = ""
  ) {
    selectEl.choices.clearStore();
    selectEl.choices.setChoices(
      [
        { value: "", label: placeholder, selected: !preselected },
        ...list.map((x) => ({
          value: x.id,
          label: x.name,
          selected: preselected == x.id,
        })),
      ],
      "value",
      "label",
      true
    );
    if (preselected) selectEl.choices.setChoiceByValue(preselected);
  }

  function setCompanyOptions(preselected = "") {
    setSelectChoices(company, CATEGORIES, "اختر الشركة", preselected);
  }
  function setCategoryOptionsByCompany(companyId, preselected = "") {
    const node = getNode(companyId);
    const children = node?.children || [];
    setSelectChoices(category, children, "اختر السيارة", preselected);
  }
  function setModelOptionsByCategory(categoryId, preselected = "") {
    const node = getNode(categoryId);
    const children = node?.children || [];
    setSelectChoices(model, children, "اختر السنة", preselected);
  }
  // ✅ الأقسام خاصة بالسيارة المختارة
  function setSectionOptionsByCategory(categoryId, preselected = "") {
    const sections = categoryId ? getSectionsOfSelectedCar(categoryId) : [];
    setSelectChoices(section, sections, "اختر التصنيف", preselected);
    return sections; // لو نحتاجها
  }
  // ✅ تعبئة القطع حسب القسم (من نفس السيارة)
  function setPartsBySection(categoryId, sectionId) {
    const sections = getSectionsOfSelectedCar(categoryId);
    const sec = sections.find((s) => String(s.id) === String(sectionId));
    const opts = sec ? sec.options || [] : [];
    parts.innerHTML = "";
    opts.forEach((opt) => {
      let o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      parts.appendChild(o);
    });
    if (opts.length) {
      parts.disabled = false;
      if (parts.choices) parts.choices.destroy();
      parts.choices = new Choices(parts, {
        removeItemButton: true,
        maxItemCount: 5,
        placeholder: true,
        placeholderValue: "بحث أو اختيار القطع...",
        searchPlaceholderValue: "بحث عن القطعة...",
        shouldSort: false,
        searchEnabled: true,
        noResultsText: "لا توجد نتائج",
        itemSelectText: "اختر",
      });
    } else {
      parts.disabled = true;
      if (parts.choices) parts.choices.disable();
    }
  }

  /**************************
   * 5) تهيئة Choices
   **************************/
  company.choices = new Choices(company, {
    searchEnabled: true,
    shouldSort: false,
  });
  category.choices = new Choices(category, {
    searchEnabled: true,
    shouldSort: false,
  });
  model.choices = new Choices(model, {
    searchEnabled: true,
    shouldSort: false,
  });
  section.choices = new Choices(section, {
    searchEnabled: true,
    shouldSort: false,
  });

  setCompanyOptions();
  setCategoryOptionsByCompany("");
  setModelOptionsByCategory("");
  setSectionOptionsByCategory(""); // فاضي بالبداية

  /*****************************************
   * 6) أحداث التغيير — بعزل الأقسام
   *****************************************/
  company.addEventListener("change", function () {
    if (!company.value) {
      setCategoryOptionsByCompany("");
      category.disabled = true;
      category.choices.disable();
      setModelOptionsByCategory("");
      model.disabled = true;
      model.choices.disable();
      setSectionOptionsByCategory("");
      section.disabled = true;
      section.choices.disable();
      parts.disabled = true;
      if (parts.choices) parts.choices.disable();
      return;
    }
    setCategoryOptionsByCompany(company.value);
    const hasCats = !!getNode(company.value)?.children?.length;
    category.disabled = !hasCats;
    category.choices[category.disabled ? "disable" : "enable"]();

    setModelOptionsByCategory("");
    model.disabled = true;
    model.choices.disable();

    setSectionOptionsByCategory(""); // نفصله إلى أن يختار سيارة
    section.disabled = true;
    section.choices.disable();

    parts.disabled = true;
    if (parts.choices) parts.choices.disable();
  });

  category.addEventListener("change", function () {
    setModelOptionsByCategory(category.value);
    const hasMods = !!getNode(category.value)?.children?.length;
    model.disabled = !hasMods;
    model.choices[model.disabled ? "disable" : "enable"]();

    // ✅ الأقسام حسب السيارة المختارة فقط
    setSectionOptionsByCategory(category.value);
    const hasSecs = getSectionsOfSelectedCar(category.value).length > 0;
    section.disabled = !hasSecs;
    section.choices[section.disabled ? "disable" : "enable"]();

    parts.disabled = true;
    if (parts.choices) parts.choices.disable();
  });

  model.addEventListener("change", function () {
    // ما نغير الأقسام هنا؛ تابعة للسيارة. فقط نتأكد من تفعيل/تعطيل.
    const hasSecs = getSectionsOfSelectedCar(category.value).length > 0;
    section.disabled = !hasSecs;
    section.choices[section.disabled ? "disable" : "enable"]();
    parts.disabled = true;
    if (parts.choices) parts.choices.disable();
  });

  section.addEventListener("change", function () {
    // ✅ حمّل القطع من القسم الخاص بهذه السيارة
    setPartsBySection(category.value, section.value);
  });

  // تهيئة متعددة لقطع الغيار (فاضية بالبداية)
  parts.choices = new Choices(parts, {
    removeItemButton: true,
    maxItemCount: 5,
    placeholder: true,
    placeholderValue: "بحث أو اختيار القطع...",
    searchPlaceholderValue: "بحث عن القطعة...",
    shouldSort: false,
    searchEnabled: true,
    noResultsText: "لا توجد نتائج",
    itemSelectText: "اختر",
  });

  /**************************
   * 7) بناء الرابط النهائي
   **************************/
  document.getElementById("filter-btn").onclick = function () {
    const companyId = company.value; // شركة
    const categoryId = category.value; // سيارة
    const modelId = model.value; // سنة
    const sectionId = section.value; // قسم
    if (!companyId || !categoryId || !modelId || !sectionId) {
      alert("حدد كل الفلاتر أولاً");
      return;
    }
    const categoryObj = getNode(categoryId); // السيارة المختارة
    const carSlug = (categoryObj?.slug || "").trim();
    if (!carSlug) {
      alert("Slug السيارة غير موجود في _meta.");
      return;
    }

    let url =
      `https://darb.com.sa/category/${carSlug}` +
      `?filters[company]=${companyId}` +
      `&filters[category]=${categoryId}` +
      `&filters[category_id]=${modelId}` +
      `&filters[brand_id]=${sectionId}`;

    let selectedPartsArr = [];
    if (parts && parts.choices) selectedPartsArr = parts.choices.getValue(true);
    if (selectedPartsArr.length > 0)
      url += `&keyword=${selectedPartsArr.join("||")}`;

    window.location.href = url;
  };

  /*************************************************
   * 8) Preselect من URL (مع عزل الأقسام)
   *************************************************/
  const params = new URLSearchParams(window.location.search);
  const preCompany = params.get("filters[company]");
  const preCategory = params.get("filters[category]");
  const preModel = params.get("filters[category_id]");
  const preBrand = params.get("filters[brand_id]");
  const preKeyword = params.get("keyword");

  if (preCompany) {
    setCompanyOptions(preCompany);
    setCategoryOptionsByCompany(preCompany, preCategory);

    const hasCats = !!getNode(preCompany)?.children?.length;
    category.disabled = !hasCats;
    category.choices[category.disabled ? "disable" : "enable"]();

    setModelOptionsByCategory(preCategory, preModel);
    const hasMods = !!getNode(preCategory)?.children?.length;
    model.disabled = !hasMods;
    model.choices[model.disabled ? "disable" : "enable"]();

    // ✅ الأقسام حسب السيارة المسبقة فقط
    setSectionOptionsByCategory(preCategory, preBrand);
    const hasSecs = getSectionsOfSelectedCar(preCategory).length > 0;
    section.disabled = !hasSecs;
    section.choices[section.disabled ? "disable" : "enable"]();

    // تجهيز القطع لو كان فيه preBrand/keyword
    if (preBrand) {
      section.choices.setChoiceByValue(preBrand);
      // حمّل القطع لهذا القسم لهذه السيارة
      setPartsBySection(preCategory, preBrand);
      if (preKeyword) {
        setTimeout(() => {
          let partsArr = preKeyword.split("||");
          partsArr.forEach((v) => parts.choices.setChoiceByValue(v));
        }, 200);
      }
    }
  }

  /**************************************
   * 9) عدّاد واجهة الهيرو (أنيميشن بسيط)
   **************************************/
  let countEl = document.getElementById("countUp");
  if (countEl) {
    let max = 180000; // عدّل حسب المخزون
    let c = 0;
    let interval = setInterval(function () {
      c += Math.ceil((max - c) / 11);
      if (c >= max) {
        c = max;
        clearInterval(interval);
      }
      countEl.textContent = c.toLocaleString("en-US");
    }, 25);
  }

  // Placeholder لـ Choices
  setTimeout(function () {
    var choicesDiv = document.querySelector("#parts")?.closest(".choices");
    if (!choicesDiv) return;
    var choicesInner = choicesDiv.querySelector(".choices__inner");
    var observer = new MutationObserver(() => {
      var hasItem = choicesInner.querySelector(".choices__item[data-id]");
      var placeholder = choicesInner.querySelector(".choices__placeholder");
      if (placeholder) placeholder.style.display = hasItem ? "none" : "";
    });
    observer.observe(choicesInner, { childList: true, subtree: true });
  }, 400);
})();
/*! ـــــــــــــــــــــ */

/*! ــــــــــــ افتتاح ـــــــــ */

(function () {
  /* ================= إعدادات ================= */
  const TARGET_COUNT = 180000,
    SHOW_ONCE_PER_DAY = true,
    STORAGE_KEY = "gl_launch_seen";
  const BADGE_TEXT = "افتتاح ضخم",
    TITLE_TEXT = "انتظرونا… سيتم افتتاح المتجر قريبًا",
    SUB_TEXT = "نجهّز تجربة تسوّق مختلفة، بأسعار قوية وخدمة أسرع.",
    BTN_TEXT = "نبّهني عند الافتتاح";
  const FIRESTORE_COLLECTION = "launchReminders";

  /* ===== firebaseConfig تبعك ===== */
  const firebaseConfig = {
    apiKey: "AIzaSyBtglEguHvj_0jLlGe6b9hdYsISkmd2E0",
    authDomain: "phon-survey-6d2c7.firebaseapp.com",
    projectId: "phon-survey-6d2c7",
    storageBucket: "phon-survey-6d2c7.appspot.com",
    messagingSenderId: "606244201615",
    appId: "1:606244201615:web:65bfd72ca94cc51e533cfa",
  };

  /* ===== مناطق/مدن مختصرة ===== */
  const SA_REGIONS = {
    "منطقة الرياض": ["الرياض", "الخرج", "الدلم", "الدوادمي", "وادي الدواسر"],
    "منطقة مكة المكرمة": ["مكة", "جدة", "الطائف", "رابغ", "القنفذة"],
    "المنطقة الشرقية": [
      "الدمام",
      "الخبر",
      "الظهران",
      "الأحساء",
      "القطيف",
      "الجبيل",
    ],
    "منطقة المدينة المنورة": ["المدينة", "ينبع", "العلا", "بدر"],
    "منطقة القصيم": ["بريدة", "عنيزة", "الرس", "البكيرية"],
    "منطقة عسير": ["أبها", "خميس مشيط", "محايل", "النماص"],
    "منطقة تبوك": ["تبوك", "الوجه", "ضباء", "أملج"],
    "منطقة جازان": ["جيزان", "صبيا", "أبو عريش", "بيش"],
    "منطقة حائل": ["حائل", "بقعاء", "الشملي"],
    "منطقة الجوف": ["سكاكا", "القريات", "دومة الجندل"],
    "منطقة نجران": ["نجران", "شرورة"],
    "منطقة الباحة": ["الباحة", "المندق", "المخواة"],
    "منطقة الحدود الشمالية": ["عرعر", "رفحاء", "طريف"],
  };

  /* ================= CSS ================= */
  const css = `:root{--gl-bg:rgba(10,12,20,.72);--gl-card:#0f1424;--gl-border:#1f2b4a;--gl-accent:#d4af37;--gl-text:#eef2ff;--gl-muted:#9fb0d1}
#grand-launch-overlay{position:fixed;inset:0;display:none;place-items:center;z-index:999999;background:radial-gradient(1000px 600px at 50% 40%,rgba(212,175,55,.12),transparent 60%),linear-gradient(0deg,var(--gl-bg),var(--gl-bg));backdrop-filter:blur(6px)}
#grand-launch-overlay.show{display:grid;animation:gl-fade .45s ease-out}
@keyframes gl-fade{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}
.gl-modal{position:relative;width:min(92vw,760px);color:var(--gl-text);background:linear-gradient(180deg,rgba(20,26,46,.9),rgba(14,18,34,.95));border:1px solid var(--gl-border);border-radius:24px;padding:28px 26px 22px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.04)}
.gl-gold-sheen{position:absolute;inset:-40% -60%;pointer-events:none;background:radial-gradient(600px 300px at 120% -20%,rgba(212,175,55,.25),transparent 60%),radial-gradient(400px 220px at -10% 120%,rgba(14,165,233,.18),transparent 60%);filter:blur(8px);animation:sheen-move 8s linear infinite}
@keyframes sheen-move{0%{transform:translateX(-10%) rotate(0)}100%{transform:translateX(10%) rotate(1turn)}}
.gl-badge{position:absolute;top:14px;left:14px;background:linear-gradient(90deg,var(--gl-accent),#f3d98b);color:#1a1200;font-weight:800;font-size:12px;letter-spacing:.6px;padding:6px 10px;border-radius:999px;box-shadow:0 2px 10px rgba(212,175,55,.35)}
.gl-close{position:absolute;top:8px;right:10px;width:36px;height:36px;border-radius:12px;border:1px solid var(--gl-border);background:#0b1020;color:#e5e7eb;font-size:22px;line-height:32px;cursor:pointer;transition:transform .15s ease,background .15s ease}
.gl-close:hover{transform:scale(1.06);background:#111735}
.gl-title{margin:8px 8px 6px;text-align:center;font-size:clamp(20px,3vw,32px);font-weight:900;letter-spacing:.2px;animation:thump 1.2s ease infinite;background:linear-gradient(180deg,#fff,#c9d7ff);-webkit-background-clip:text;background-clip:text;color:transparent}
@keyframes thump{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-1px) scale(1.01)}}
.gl-sub{color:#9fb0d1;text-align:center;margin:0 8px 14px}
.gl-counter-wrap{display:flex;justify-content:center;align-items:baseline;gap:10px;margin:8px 0 14px}
.gl-counter{font-variant-numeric:tabular-nums;font-weight:900;font-size:clamp(26px,6vw,56px);background:linear-gradient(90deg,#fff,#f7e9b9 35%,#fff);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 22px rgba(212,175,55,.25)}
.gl-counter-plus{color:#f7e9b9;font-weight:700}
.gl-list{margin:10px auto 16px;padding:0 8px 0 0;list-style:none;max-width:700px}
.gl-list li{position:relative;padding:10px 14px 10px 28px;margin:8px 0;border-radius:14px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06)}
.gl-list li::before{content:"★";position:absolute;left:10px;top:50%;transform:translateY(-50%) rotate(-12deg);color:#f3d98b;text-shadow:0 0 10px rgba(212,175,55,.55)}
.gl-progress{position:relative;height:14px;border-radius:999px;overflow:hidden;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);margin:10px 8px 4px}
.gl-progress-bar{height:100%;width:100%;background:linear-gradient(90deg,#3b82f6,#22d3ee,#fbbf24,#d4af37)}
.gl-shine{position:absolute;inset:-30% -60%;pointer-events:none;background:radial-gradient(500px 200px at -10% 50%,rgba(255,255,255,.18),transparent 60%);animation:shine-scan 2.4s ease-in-out infinite}
@keyframes shine-scan{0%{transform:translateX(-40%)}50%{transform:translateX(40%)}100%{transform:translateX(120%)}}
.gl-cta{display:flex;flex-direction:column;align-items:center;gap:10px;margin:16px 0 0}
.gl-btn{display:inline-block;padding:12px 18px;border-radius:14px;font-weight:800;text-decoration:none;color:#0b0f1c;background:linear-gradient(90deg,#f7e9b9,#d4af37 60%,#f7e9b9);box-shadow:0 8px 24px rgba(212,175,55,.35);border:1px solid rgba(0,0,0,.12);transform:translateY(0);transition:transform .15s ease,filter .2s ease}
.gl-btn:hover{transform:translateY(-2px);filter:brightness(1.06)}
.gl-note{color:#9fb0d1;font-size:12px}

/* إدخال الواتساب + القوائم */
.gl-whats-wrap{display:none;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;margin-top:10px}
.gl-field{display:flex;align-items:center;gap:8px;background:#0b1020;border:1px solid var(--gl-border);border-radius:12px;padding:8px 10px}
.gl-wa-ic{width:20px;height:20px;flex:0 0 20px}
.gl-input{direction:ltr;background:transparent;color:#eef2ff;border:none;outline:none;min-width:220px}
.gl-select{background:#0b1020;color:#eef2ff;border:1px solid var(--gl-border);border-radius:12px;padding:10px 12px;min-width:180px}
.gl-save{padding:12px 16px;border-radius:12px;border:1px solid rgba(0,0,0,.12);font-weight:800;cursor:pointer;background:linear-gradient(90deg,#86efac,#22c55e 60%,#86efac);color:#06210f;min-width:140px}
.gl-msg{text-align:center;font-size:13px;margin-top:6px;min-height:18px}.gl-msg.ok{color:#86efac}.gl-msg.err{color:#fca5a5}

/* إصلاح الكونفيتي: ثابت على الشاشة */
.gl-confetti{position:fixed;top:-10vh;pointer-events:none;width:8px;height:14px;border-radius:2px;opacity:.95;animation:fall 1.8s linear forwards,spin .9s ease-in-out infinite}
@keyframes fall{to{transform:translateY(120vh) rotate(360deg);opacity:0}}@keyframes spin{50%{transform:translateY(60vh) rotate(-180deg)}}`;

  /* ================= Helpers ================= */
  function appendStyle(t) {
    const s = document.createElement("style");
    s.textContent = t;
    document.head.appendChild(s);
  }
  function animateCount(el, to, d = 1600) {
    const st = performance.now(),
      from = 0,
      fmt = (v) => v.toLocaleString("en-US");
    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function tick(now) {
      const p = Math.min(1, (now - st) / d),
        val = Math.floor(from + (to - from) * ease(p));
      el.textContent = fmt(val);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function spawnConfetti(_, n = 80) {
    const host = document.body,
      colors = ["#f7e9b9", "#d4af37", "#22d3ee", "#60a5fa", "#ffffff"];
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      p.className = "gl-confetti";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[(Math.random() * colors.length) | 0];
      p.style.transform = `translateY(0) rotate(${Math.random() * 180}deg)`;
      p.style.animationDelay = (Math.random() * 0.7).toFixed(2) + "s";
      p.style.width = (6 + Math.random() * 6).toFixed(0) + "px";
      p.style.height = (10 + Math.random() * 10).toFixed(0) + "px";
      host.appendChild(p);
      setTimeout(() => p.remove(), 2200);
    }
  }
  function shouldShowToday() {
    if (!SHOW_ONCE_PER_DAY) return true;
    const t = new Date().toISOString().slice(0, 10);
    return localStorage.getItem(STORAGE_KEY) !== t;
  }
  function markSeenToday() {
    if (!SHOW_ONCE_PER_DAY) return;
    const t = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEY, t);
  }

  /* ================= DOM ================= */
  function regionSelectHTML() {
    const regions = Object.keys(SA_REGIONS),
      first = regions[0],
      cities = SA_REGIONS[first];
    return `
  <select id="gl-region" class="gl-select" aria-label="المنطقة">
    ${regions.map((r) => `<option value="${r}">${r}</option>`).join("")}
  </select>
  <select id="gl-city" class="gl-select" aria-label="المدينة">
    ${cities.map((c) => `<option value="${c}">${c}</option>`).join("")}
  </select>`;
  }
  function buildPopup() {
    const overlay = document.createElement("div");
    overlay.id = "grand-launch-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
  <div class="gl-modal" role="dialog" aria-modal="true" aria-labelledby="gl-title">
    <button class="gl-close" aria-label="إغلاق">×</button>
    <div class="gl-badge">${BADGE_TEXT}</div>
    <h2 id="gl-title" class="gl-title">${TITLE_TEXT}</h2>
    <p class="gl-sub">${SUB_TEXT}</p>
    <div class="gl-counter-wrap" dir="ltr" aria-label="عدد المنتجات">
      <span class="gl-counter" id="gl-counter">0</span><span class="gl-counter-plus">+ منتج</span>
    </div>
    <ul class="gl-list">
      <li>تجهيزات نهائية — فلاتر بحث ذكية وتوافق كامل للجوال</li>
      <li>أصلي وتجاري — تصنيفات واضحة وموديلات دقيقة</li>
      <li>شحن سريع لجميع المناطق — وسياسات إرجاع مرنة</li>
    </ul>
    <div class="gl-progress" aria-hidden="true"><div class="gl-progress-bar"></div><div class="gl-shine"></div></div>
    <div class="gl-cta">
      <a href="#" id="gl-remind" class="gl-btn">${BTN_TEXT}</a>
      <div class="gl-whats-wrap" id="gl-whats-wrap">
        <div class="gl-field">
          <svg class="gl-wa-ic" viewBox="0 0 32 32" aria-hidden="true"><path fill="#25D366" d="M19.1 17.2c-.3-.1-1.7-.9-1.9-1s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1c-.3-.1-1.1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.6-1.6-.8-2.1c-.2-.6-.5-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.5 1.1 2.7 2.1 3.2 5 4.5c.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 2-1.3.2-.7.2-1.2.1-1.3 0-.1-.2-.1-.5-.2z"/><path fill="#25D366" d="M26 6c-4.7-4.7-12.3-4.7-17 0-3.9 3.9-4.6 9.7-2.1 14.4L6 26l5.7-.9c4.6 2.4 10.4 1.7 14.3-2.2 4.7-4.7 4.7-12.3 0-17z"/></svg>
          <input id="gl-whats" class="gl-input" inputmode="numeric" placeholder="+9665XXXXXXXX أو 05XXXXXXXX" />
        </div>
        ${regionSelectHTML()}
        <button id="gl-save" class="gl-save">حفظ</button>
      </div>
      <div class="gl-msg" id="gl-msg"></div>
      <small class="gl-note">لن نزعجك — تنبيه واحد عند الإطلاق.</small>
    </div>
    <div class="gl-gold-sheen"></div>
  </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  /* ============ Firebase direct write (بدون فنكشن) ============ */
  let addDocFn = null,
    colFn = null,
    dbRef = null,
    serverTimestampFn = null;
  async function ensureFirebase() {
    if (addDocFn) return;
    const [
      { initializeApp },
      { getFirestore, collection, addDoc, serverTimestamp },
    ] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import(
        "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"
      ),
    ]);
    const app = initializeApp(firebaseConfig);
    dbRef = getFirestore(app);
    addDocFn = addDoc;
    colFn = collection;
    serverTimestampFn = serverTimestamp;
  }

  /* ============ منطق التشغيل ============ */
  function normalizePhone(raw) {
    let s = (raw || "").replace(/[^\d+]/g, "");
    if (/^05\d{8}$/.test(s)) return "+966" + s.slice(1);
    if (/^5\d{8}$/.test(s)) return "+966" + s;
    if (/^\+9665\d{8}$/.test(s)) return s;
    if (/^9665\d{8}$/.test(s)) return "+" + s;
    if (/^\+\d{8,16}$/.test(s)) return s;
    return null;
  }

  function openPopup(ov) {
    ov.classList.add("show");
    ov.setAttribute("aria-hidden", "false");
    animateCount(ov.querySelector("#gl-counter"), TARGET_COUNT, 1800);
    spawnConfetti(ov, 80);

    ov.querySelector(".gl-close").addEventListener("click", () => {
      ov.classList.remove("show");
      ov.setAttribute("aria-hidden", "true");
      markSeenToday();
    });
    ov.addEventListener("click", (e) => {
      if (e.target.id === "grand-launch-overlay") {
        ov.classList.remove("show");
        ov.setAttribute("aria-hidden", "true");
        markSeenToday();
      }
    });

    const remindBtn = ov.querySelector("#gl-remind");
    const wrap = ov.querySelector("#gl-whats-wrap");
    const input = ov.querySelector("#gl-whats");
    const saveBtn = ov.querySelector("#gl-save");
    const msg = ov.querySelector("#gl-msg");
    const regionSel = ov.querySelector("#gl-region");
    const citySel = ov.querySelector("#gl-city");

    regionSel.addEventListener("change", () => {
      const list = SA_REGIONS[regionSel.value] || [];
      citySel.innerHTML = list
        .map((c) => `<option value="${c}">${c}</option>`)
        .join("");
    });
    remindBtn.addEventListener("click", (e) => {
      e.preventDefault();
      wrap.style.display = "flex";
      input.focus();
    });

    saveBtn.addEventListener("click", async () => {
      msg.textContent = "";
      msg.className = "gl-msg";
      const normalized = normalizePhone(input.value);
      if (!normalized) {
        msg.textContent = "رقم غير صالح. مثال: 05XXXXXXXX أو +9665XXXXXXXX";
        msg.classList.add("err");
        return;
      }
      if (!regionSel.value || !citySel.value) {
        msg.textContent = "اختر المنطقة والمدينة.";
        msg.classList.add("err");
        return;
      }
      try {
        saveBtn.disabled = true;
        saveBtn.textContent = "جارٍ الحفظ…";
        await ensureFirebase();
        await addDocFn(colFn(dbRef, FIRESTORE_COLLECTION), {
          phone: normalized,
          region: regionSel.value,
          city: citySel.value,
          createdAt: serverTimestampFn(),
          userAgent: navigator.userAgent || "",
          path: location.href,
        });
        msg.textContent = "تم الحفظ بنجاح ✅";
        msg.classList.add("ok");
        input.disabled = true;
        regionSel.disabled = true;
        citySel.disabled = true;
        saveBtn.textContent = "تم الحفظ";
      } catch (err) {
        console.error(err);
        msg.textContent = "تعذر الحفظ. شيّك Rules أو تقييد الـ API Key.";
        msg.classList.add("err");
        saveBtn.textContent = "حفظ";
        saveBtn.disabled = false;
      }
    });
  }

  /* ============ إقلاع ============ */
  function boot() {
    appendStyle(css);
    const ov = buildPopup();
    if (!SHOW_ONCE_PER_DAY || shouldShowToday()) openPopup(ov);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
