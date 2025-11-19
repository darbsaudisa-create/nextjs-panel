"use client";

import * as React from "react";

type BehaviorConfig = {
  triggerType: "delay" | "scroll" | "exit";
  delaySeconds: number;
  perDay: number;
  oncePerVisitor: boolean;
};

type PlacementConfig = {
  mode: "all" | "path";
  path: string;
};

type BlockToggle = {
  enabled: boolean;
};

type CouponConfig = {
  enabled: boolean;
  code: string;
};

type CounterConfig = {
  enabled: boolean;
  target: number;
  label: string;
};

type StyleVariant = "classic" | "luxury" | "premium" | "genz";

type Props = {
  widget: {
    id: string;
    name: string | null;
    slug: string | null;
    status: string | null;
  };
  storeId: string;
  initialConfig: {
    heading?: string;
    body?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    buttonColor?: string;
    imageUrl?: string;
    behavior: BehaviorConfig;
    placement: PlacementConfig;
    coupon: CouponConfig;
    counter: CounterConfig;
    headingBlock?: BlockToggle;
    bodyBlock?: BlockToggle;
    imageBlock?: BlockToggle;
    buttonBlock?: BlockToggle;
    style?: StyleVariant;
  };
};

export default function PopupSaleEditor({
  widget,
  storeId,
  initialConfig,
}: Props) {
  const [heading, setHeading] = React.useState(initialConfig.heading ?? "");
  const [body, setBody] = React.useState(initialConfig.body ?? "");
  const [buttonLabel, setButtonLabel] = React.useState(
    initialConfig.buttonLabel ?? ""
  );
  const [buttonUrl, setButtonUrl] = React.useState(
    initialConfig.buttonUrl ?? ""
  );
  const [buttonColor, setButtonColor] = React.useState(
    initialConfig.buttonColor ?? "#DC2626"
  );
  const [imageUrl, setImageUrl] = React.useState(initialConfig.imageUrl ?? "");

  const [styleVariant, setStyleVariant] = React.useState<StyleVariant>(
    initialConfig.style ?? "classic"
  );

  const [behavior, setBehavior] = React.useState<BehaviorConfig>({
    triggerType: initialConfig.behavior.triggerType,
    delaySeconds: initialConfig.behavior.delaySeconds,
    perDay: initialConfig.behavior.perDay,
    oncePerVisitor: initialConfig.behavior.oncePerVisitor,
  });

  const [placement, setPlacement] = React.useState<PlacementConfig>({
    mode: initialConfig.placement.mode,
    path: initialConfig.placement.path,
  });

  const [coupon, setCoupon] = React.useState<CouponConfig>({
    enabled: initialConfig.coupon.enabled,
    code: initialConfig.coupon.code,
  });

  const [counter, setCounter] = React.useState<CounterConfig>({
    enabled: initialConfig.counter.enabled,
    target: initialConfig.counter.target,
    label: initialConfig.counter.label,
  });

  const [headingBlock, setHeadingBlock] = React.useState<BlockToggle>({
    enabled: initialConfig.headingBlock?.enabled ?? true,
  });
  const [bodyBlock, setBodyBlock] = React.useState<BlockToggle>({
    enabled: initialConfig.bodyBlock?.enabled ?? true,
  });
  const [imageBlock, setImageBlock] = React.useState<BlockToggle>({
    enabled: initialConfig.imageBlock?.enabled ?? true,
  });
  const [buttonBlock, setButtonBlock] = React.useState<BlockToggle>({
    enabled: initialConfig.buttonBlock?.enabled ?? true,
  });

  const [saving, setSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "ok" | "error">(
    "idle"
  );

  const jsSnippet = `<script src="https://panel.darb.com.sa/widgets.js" data-store-id="${storeId}"></script>`;

  async function handleSave() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const config = {
        heading,
        body,
        buttonLabel,
        buttonUrl,
        buttonColor,
        imageUrl,
        behavior,
        placement,
        coupon,
        counter,
        headingBlock,
        bodyBlock,
        imageBlock,
        buttonBlock,
        style: styleVariant,
      };

      const res = await fetch(
        `/api/widgets/${encodeURIComponent(widget.id)}/config`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSaveStatus("error");
      } else {
        setSaveStatus("ok");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  function styleLabel(v: StyleVariant) {
    if (v === "classic") return "كلاسيكي";
    if (v === "luxury") return "فاخر ذهبي";
    if (v === "premium") return "فخم هادي";
    return "جيل زد 🔥";
  }

  return (
    <div className="flex flex-1 min-h-0">
      {/* المعاينة + كود JS */}
      <div className="flex-1 bg-slate-900/90 flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-full max-w-lg">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
            <span>قالب العرض الحالي: {styleLabel(styleVariant)}</span>
          </div>

          <div className="rounded-xl bg-white shadow-2xl overflow-hidden">
            {imageBlock.enabled && imageUrl && (
              <div className="h-52 bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="عرض ترويجي"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-5 text-center space-y-3">
              {headingBlock.enabled && (
                <h2 className="text-lg font-bold">
                  {heading || "اكتب عنوان العرض هنا"}
                </h2>
              )}

              {bodyBlock.enabled && (
                <p className="text-sm text-slate-600 whitespace-pre-line">
                  {body ||
                    "اكتب وصفًا مختصرًا للعرض أو التنبيه الذي تريد إظهاره."}
                </p>
              )}

              {counter.enabled && (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-extrabold tabular-nums">
                    {counter.target.toLocaleString("en-US")}
                  </div>
                  {counter.label && (
                    <div className="text-[11px] text-slate-500">
                      {counter.label}
                    </div>
                  )}
                </div>
              )}

              {buttonBlock.enabled && (
                <a
                  href={buttonUrl || "#"}
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: buttonColor || "#DC2626" }}
                  onClick={(e) => e.preventDefault()}
                >
                  {buttonLabel || "نص الزر"}
                </a>
              )}

              {coupon.enabled && coupon.code && (
                <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-mono text-slate-800">
                    {coupon.code}
                  </span>
                  <span className="text-slate-500">
                    (يظهر مع زر نسخ داخل البوب أب الحقيقي)
                  </span>
                </div>
              )}

              <p className="mt-2 text-[11px] text-slate-400">
                سلوك العرض:{" "}
                {behavior.triggerType === "delay"
                  ? `يظهر بعد ${behavior.delaySeconds} ثانية، وبحد أقصى ${behavior.perDay} مرة في اليوم`
                  : behavior.triggerType === "scroll"
                  ? "يظهر عند نزول المستخدم في الصفحة"
                  : "يظهر عند محاولة الخروج من الصفحة"}
              </p>
              <p className="text-[11px] text-slate-400">
                الموضع:{" "}
                {placement.mode === "all"
                  ? "جميع الصفحات"
                  : `صفحة محددة: ${placement.path || "/"}`}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg rounded-xl bg-slate-800/80 border border-slate-700 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">
              كود Javascript للمتجر (ضعه في إعدادات كود JS في سلة)
            </span>
          </div>
          <pre className="text-[11px] text-slate-100 bg-slate-900/70 rounded-md p-2 overflow-x-auto">
            {jsSnippet}
          </pre>
        </div>
      </div>

      {/* الإعدادات */}
      <div className="w-full max-w-md border-l border-slate-200 bg-white p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">
            إعدادات Popup العرض — {widget.name || widget.slug || widget.id}
          </h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>

        {saveStatus === "ok" && (
          <p className="mb-3 text-xs text-emerald-600">
            تم حفظ الإعدادات بنجاح.
          </p>
        )}
        {saveStatus === "error" && (
          <p className="mb-3 text-xs text-rose-600">
            تعذر حفظ الإعدادات، حاول مرة أخرى.
          </p>
        )}

        <div className="space-y-6 text-sm">
          {/* قالب التصميم */}
          <section className="space-y-2">
            <h3 className="font-semibold">قالب تصميم البوب أب</h3>
            <p className="text-[11px] text-slate-500">
              اختر ستايل البوب أب (يؤثر على الألوان والشكل فقط، بدون تغيير
              المحتوى).
            </p>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={styleVariant}
              onChange={(e) =>
                setStyleVariant(e.target.value as StyleVariant)
              }
            >
              <option value="classic">كلاسيكي</option>
              <option value="luxury">فاخر ذهبي</option>
              <option value="premium">فخم هادي</option>
              <option value="genz">جيل زد 🔥</option>
            </select>
          </section>

          {/* عنوان الرأس */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">تصميم الرأس</h3>
              <label className="inline-flex items-center gap-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={headingBlock.enabled}
                  onChange={(e) =>
                    setHeadingBlock({ enabled: e.target.checked })
                  }
                />
                <span>إظهار العنوان</span>
              </label>
            </div>
            {headingBlock.enabled && (
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="🔥 خصم 15% على مشترياتك"
              />
            )}
          </section>

          {/* نص المحتوى */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">تصميم النص</h3>
              <label className="inline-flex items-center gap-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={bodyBlock.enabled}
                  onChange={(e) => setBodyBlock({ enabled: e.target.checked })}
                />
                <span>إظهار النص</span>
              </label>
            </div>
            {bodyBlock.enabled && (
              <textarea
                className="w-full min-h-[80px] rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="اكتب وصف العرض أو التفاصيل هنا..."
              />
            )}
          </section>

          {/* الكاونتر */}
          <section className="space-y-3">
            <h3 className="font-semibold">الرقم التصاعدي (Counter)</h3>

            <label className="inline-flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={counter.enabled}
                onChange={(e) =>
                  setCounter((c) => ({ ...c, enabled: e.target.checked }))
                }
              />
              <span>إظهار رقم تصاعدي داخل البوب أب</span>
            </label>

            {counter.enabled && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs text-slate-500 mb-1">
                    الرقم النهائي (يبدأ من 0 إلى هنا)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={counter.target}
                    onChange={(e) =>
                      setCounter((c) => ({
                        ...c,
                        target: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-slate-500 mb-1">
                    النص تحت الرقم (مثال: + عميل سعيد)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={counter.label}
                    onChange={(e) =>
                      setCounter((c) => ({ ...c, label: e.target.value }))
                    }
                    placeholder="+ عميل سعيد"
                  />
                </div>
              </>
            )}
          </section>

          {/* الأزرار */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">تصميم الأزرار</h3>
              <label className="inline-flex items-center gap-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={buttonBlock.enabled}
                  onChange={(e) =>
                    setButtonBlock({ enabled: e.target.checked })
                  }
                />
                <span>إظهار الزر</span>
              </label>
            </div>

            {buttonBlock.enabled && (
              <>
                <label className="block text-xs text-slate-500 mb-1">
                  نص الزر
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm mb-2"
                  value={buttonLabel}
                  onChange={(e) => setButtonLabel(e.target.value)}
                  placeholder="احصل على الخصم الآن"
                />

                <label className="block text-xs text-slate-500 mb-1">
                  رابط عند الضغط
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm mb-2"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="https://example.com"
                />

                <label className="block text-xs text-slate-500 mb-1">
                  لون الزر
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-8 w-10 rounded border border-slate-300"
                    value={buttonColor}
                    onChange={(e) =>
                      setButtonColor(e.target.value || "#DC2626")
                    }
                  />
                  <input
                    type="text"
                    className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs"
                    value={buttonColor}
                    onChange={(e) =>
                      setButtonColor(e.target.value || "#DC2626")
                    }
                  />
                </div>
              </>
            )}
          </section>

          {/* الصورة */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">تصميم الصورة</h3>
              <label className="inline-flex items-center gap-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={imageBlock.enabled}
                  onChange={(e) => setImageBlock({ enabled: e.target.checked })}
                />
                <span>إظهار الصورة</span>
              </label>
            </div>

            {imageBlock.enabled && (
              <>
                <label className="block text-xs text-slate-500 mb-1">
                  رابط الصورة (مثلاً 600x1100)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </>
            )}
          </section>

          {/* سلوك العرض */}
          <section className="space-y-3">
            <h3 className="font-semibold">سلوك ظهور الـ Popup</h3>

            <div className="space-y-1">
              <label className="block text-xs text-slate-500 mb-1">
                متى يظهر الـ Popup؟
              </label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={behavior.triggerType}
                onChange={(e) =>
                  setBehavior((b) => ({
                    ...b,
                    triggerType: e.target
                      .value as BehaviorConfig["triggerType"],
                  }))
                }
              >
                <option value="delay">بعد وقت محدد</option>
                <option value="scroll">عند نزول المستخدم في الصفحة</option>
                <option value="exit">عند محاولة الخروج من الصفحة</option>
              </select>
            </div>

            {behavior.triggerType === "delay" && (
              <div className="space-y-1">
                <label className="block text-xs text-slate-500 mb-1">
                  بعد كم ثانية من دخول الزائر تظهر النافذة؟
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={behavior.delaySeconds}
                  onChange={(e) =>
                    setBehavior((b) => ({
                      ...b,
                      delaySeconds: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs text-slate-500 mb-1">
                الحد الأقصى لعدد مرات الظهور لكل زائر في اليوم
              </label>
              <input
                type="number"
                min={1}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={behavior.perDay}
                onChange={(e) =>
                  setBehavior((b) => ({
                    ...b,
                    perDay: Number(e.target.value || 1),
                  }))
                }
              />
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={behavior.oncePerVisitor}
                onChange={(e) =>
                  setBehavior((b) => ({
                    ...b,
                    oncePerVisitor: e.target.checked,
                  }))
                }
              />
              <span>
                إظهار هذا الـ Popup مرّة واحدة فقط لكل زائر (طوال المدة)
              </span>
            </label>
          </section>

          {/* الموضع */}
          <section className="space-y-3">
            <h3 className="font-semibold">موضع ظهور الـ Popup</h3>

            <div className="space-y-1">
              <label className="block text-xs text-slate-500 mb-1">
                أين يظهر الـ Popup؟
              </label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={placement.mode}
                onChange={(e) =>
                  setPlacement((p) => ({
                    ...p,
                    mode: e.target.value as PlacementConfig["mode"],
                  }))
                }
              >
                <option value="all">جميع الصفحات</option>
                <option value="path">صفحة محددة فقط</option>
              </select>
            </div>

            {placement.mode === "path" && (
              <div className="space-y-1">
                <label className="block text-xs text-slate-500 mb-1">
                  المسار داخل المتجر (مثال: /offers أو /products/123)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={placement.path}
                  onChange={(e) =>
                    setPlacement((p) => ({
                      ...p,
                      path: e.target.value,
                    }))
                  }
                  placeholder="/offers"
                />
              </div>
            )}
          </section>

          {/* الكوبون */}
          <section className="space-y-3">
            <h3 className="font-semibold">كوبون الخصم</h3>

            <label className="inline-flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={coupon.enabled}
                onChange={(e) =>
                  setCoupon((c) => ({ ...c, enabled: e.target.checked }))
                }
              />
              <span>إظهار كوبون خصم داخل الـ Popup مع زر نسخ</span>
            </label>

            {coupon.enabled && (
              <div className="space-y-1">
                <label className="block text-xs text-slate-500 mb-1">
                  نص الكوبون (مثال: SALE15)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={coupon.code}
                  onChange={(e) =>
                    setCoupon((c) => ({ ...c, code: e.target.value }))
                  }
                  placeholder="SALE15"
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
