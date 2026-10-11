import type { ReactNode } from "react";

function dateLocale(locale: string) {
  return locale === "en" ? "en" : locale === "es" ? "es" : "pt-BR";
}

export function noteDay(iso: string) {
  const day = Number(iso.slice(8, 10));
  return Number.isFinite(day) && day > 0 ? String(day) : "";
}

export function NoteDay({ iso }: { iso: string }) {
  return (
    <span className="w-9 shrink-0 text-center text-xl leading-none font-semibold tabular-nums text-fg">
      {noteDay(iso)}
    </span>
  );
}

type Bucket<T> = {
  year: string;
  months: { key: string; label: string; items: T[] }[];
};

export function groupByYearMonth<T>(items: T[], dateOf: (item: T) => string, locale: string): Bucket<T>[] {
  const loc = dateLocale(locale);
  const years: Bucket<T>[] = [];
  for (const item of items) {
    const iso = dateOf(item);
    const [yearRaw, monthRaw] = iso.split("-");
    const yearNum = Number(yearRaw);
    const monthNum = Number(monthRaw);
    if (!yearNum || !monthNum) continue;
    let year = years.find((row) => row.year === yearRaw);
    if (!year) {
      year = { year: yearRaw, months: [] };
      years.push(year);
    }
    const key = `${yearRaw}-${monthRaw}`;
    let month = year.months.find((row) => row.key === key);
    if (!month) {
      month = {
        key,
        label: new Date(yearNum, monthNum - 1, 1).toLocaleDateString(loc, { month: "long" }),
        items: [],
      };
      year.months.push(month);
    }
    month.items.push(item);
  }
  return years;
}

export function NoteDateGroups<T>({
  items,
  dateOf,
  locale,
  render,
}: {
  items: T[];
  dateOf: (item: T) => string;
  locale: string;
  render: (item: T) => ReactNode;
}) {
  const years = groupByYearMonth(items, dateOf, locale);
  return (
    <div className="flex flex-col gap-8">
      {years.map((year) => (
        <section key={year.year} className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-fg">{year.year}</h2>
          {year.months.map((month) => (
            <div key={month.key} className="flex flex-col gap-2">
              <h3 className="px-1 text-xs font-medium tracking-wide text-muted capitalize">{month.label}</h3>
              <ul className="flex flex-col gap-2">{month.items.map(render)}</ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
