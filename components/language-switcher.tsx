"use client";

import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const setLocale = (nextLocale: Locale) => {
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  };

  return (
    <div className="inline-flex rounded border border-[#e2e8f0] bg-white p-0.5 text-xs font-semibold">
      {(["th", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          className={`rounded px-2.5 py-1.5 transition ${locale === item ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          onClick={() => setLocale(item)}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
