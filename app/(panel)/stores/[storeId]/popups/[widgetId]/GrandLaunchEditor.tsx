// app/(panel)/stores/[storeId]/popups/[widgetId]/GrandLaunchEditor.tsx

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

type FormFieldConfig = {
  enabled: boolean;
  required: boolean;
};

type FormConfig = {
  enabled: boolean;
  name: FormFieldConfig;
  phone: FormFieldConfig;
  email: FormFieldConfig;
  submitLabel: string;
};

type Props = {
  widget: {
    id: string;
    name: string | null;
    slug: string | null;
    status: string | null;
  };
  storeId: string;
  initialConfig: {
    badgeText: string;
    titleText: string;
    subText: string;
    buttonText: string;
    targetCount: number;
    showOncePerDay: boolean;
    behavior: BehaviorConfig;
    placement: PlacementConfig;
    form: FormConfig;
  };
};

export default function GrandLaunchEditor({
  widget,
  storeId,
  initialConfig,
}: Props) {
  const [badgeText, setBadgeText] = React.useState(initialConfig.badgeText);
  const [titleText, setTitleText] = React.useState(initialConfig.titleText);
  const [subText, setSubText] = React.useState(initialConfig.subText);
  const [buttonText, setButtonText] = React.useState(initialConfig.buttonText);
  const [targetCount, setTargetCount] = React.useState(
    initialConfig.targetCount
  );
  const [showOncePerDay, setShowOncePerDay] = React.useState(
    initialConfig.showOncePerDay
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

  const [form, setForm] = React.useState<FormConfig>({
    enabled: initialConfig.form.enabled,
    name: initialConfig.form.name,
    phone: initialConfig.form.phone,
    email: initialConfig.form.email,
    submitLabel: initialConfig.form.submitLabel,
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
        badgeText,
        titleText,
        subText,
        buttonText,
        targetCount,
        showOncePerDay,
        behavior,
        placement,
        form,
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

  return (
    <div className="flex flex-1 min-h-0">
      {/* المعاينة + كود JS */}
      <div className="flex-1 bg-slate-900/90 flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-yellow-500/40 bg-gradient-to-b from-slate-900 to-slate-950 relative">
          <div className="absolute inset-0 pointer-events-none opacity-80">
            <div className="gl-gold-bg" />
          </div>

          <div className="relative p-6 text-center text-slate-100 space-y-3">
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-300 text-xs font-bold text-slate-900 px-3 py-1">
              {badgeText || "افتتاح ضخم"}
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight">
              {titleText || "انتظرونا… سيتم افتتاح المتجر قريبًا"}
            </h2>

            <p className="text-sm text-slate-300">
              {subText || "نجهّز تجربة تسوّق مختلفة، بأسعار قوية وخدمة أسرع."}
            </p>

            <div className="flex items-baseline justify-center gap-2 mt-2">
              <span className="text-3xl font-black tabular-nums">
                {targetCount.toLocaleString("en-US")}
              </span>
              <span className="text-sm text-amber-200">+ منتج</span>
            </div>

            <button className="mt-3 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 px-6 py-2.5 text-sm font-extrabold text-slate-900 shadow-lg">
              {buttonText || "نبّهني عند الافتتاح"}
            </button>

            {form.enabled && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                {form.name.enabled && (
                  <span className="px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600">
                    حقل الاسم {form.name.required ? "(إجباري)" : "(اختياري)"}
                  </span>
                )}
                {form.phone.enabled && (
                  <span className="px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600">
                    حقل الجوال {form.phone.required ? "(إجباري)" : "(اختياري)"}
                  </span>
                )}
                {form.email.enabled && (
                  <span className="px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600">
                    حقل الإيميل {form.email.required ? "(إجباري)" : "(اختياري)"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-3xl rounded-xl bg-slate-800/80 border border-slate-700 p-3">
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
            إعدادات Popup افتتاح ضخم — {widget.name || widget.slug || widget.id}
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
          {/* النصوص الأساسية */}
          <section className="space-y-2">
            <h3 className="font-semibold">النصوص الأساسية</h3>
            <label className="block text-xs text-slate-500 mb-1">
              شارة أعلى البوب أب (Badge)
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm mb-2"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="افتتاح ضخم"
            />

            <label className="block text-xs text-slate-500 mb-1">
              العنوان الرئيسي
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm mb-2"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="انتظرونا… سيتم افتتاح المتجر قريبًا"
            />

            <label className="block text-xs text-slate-500 mb-1">
              نص الوصف
            </label>
            <textarea
              className="w-full min-h-[70px] rounded-md border border-slate-300 px-3 py-2 text-sm mb-2"
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              placeholder="نجهّز تجربة تسوّق مختلفة، بأسعار قوية وخدمة أسرع."
            />

            <label className="block text-xs text-slate-500 mb-1">
              نص زر التنبيه
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="نبّهني عند الافتتاح"
            />
          </section>

          {/* الرقم التصاعدي */}
          <section className="space-y-2">
            <h3 className="font-semibold">الرقم التصاعدي (Counter)</h3>
            <label className="block text-xs text-slate-500 mb-1">
              الرقم النهائي (يبدأ من 0 إلى هنا)
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value || 0))}
            />

            <label className="inline-flex items-center gap-2 text-xs text-slate-600 mt-1">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={showOncePerDay}
                onChange={(e) => setShowOncePerDay(e.target.checked)}
              />
              <span>إظهار هذا البوب أب مرّة واحدة فقط لكل زائر في اليوم</span>
            </label>
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

          {/* حقول الإدخال */}
          <section className="space-y-3">
            <h3 className="font-semibold">حقول إدخال البيانات</h3>

            <label className="inline-flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={form.enabled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, enabled: e.target.checked }))
                }
              />
              <span>تفعيل نموذج إدخال البيانات داخل البوب أب</span>
            </label>

            {form.enabled && (
              <div className="space-y-3">
                {/* الاسم */}
                <div className="space-y-1 border border-slate-200 rounded-md p-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={form.name.enabled}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            name: {
                              ...f.name,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>حقل الاسم</span>
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-slate-300"
                        checked={form.name.required}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            name: {
                              ...f.name,
                              required: e.target.checked,
                            },
                          }))
                        }
                        disabled={!form.name.enabled}
                      />
                      <span>إجباري</span>
                    </label>
                  </div>
                </div>

                {/* الجوال */}
                <div className="space-y-1 border border-slate-200 rounded-md p-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={form.phone.enabled}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            phone: {
                              ...f.phone,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>حقل رقم الجوال</span>
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-slate-300"
                        checked={form.phone.required}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            phone: {
                              ...f.phone,
                              required: e.target.checked,
                            },
                          }))
                        }
                        disabled={!form.phone.enabled}
                      />
                      <span>إجباري</span>
                    </label>
                  </div>
                </div>

                {/* الإيميل */}
                <div className="space-y-1 border border-slate-200 rounded-md p-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={form.email.enabled}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            email: {
                              ...f.email,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span>حقل الإيميل</span>
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-slate-300"
                        checked={form.email.required}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            email: {
                              ...f.email,
                              required: e.target.checked,
                            },
                          }))
                        }
                        disabled={!form.email.enabled}
                      />
                      <span>إجباري</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-slate-500 mb-1">
                    نص زر الإرسال
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={form.submitLabel}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        submitLabel: e.target.value,
                      }))
                    }
                    placeholder="إرسال البيانات"
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
