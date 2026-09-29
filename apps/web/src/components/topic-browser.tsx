"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pill } from "@/components/ui/pill";

export type BrowserTopic = { id: string; title: string; suggestions: string[]; advanced: string[] };
export type BrowserCategory<T extends BrowserTopic> = { id: string; title: string; note?: string; topics: T[] };
type Labels = { heading: string; suggestionsTitle: string; basicLabel: string; advancedLabel: string };

/**
 * Practice topics grouped by category: a horizontally scrolling category strip (the
 * mouse wheel scrolls it sideways) and an accordion where one topic is open at a time,
 * showing basic and advanced sentence frames above the practice area for that topic.
 */
export function TopicBrowser<T extends BrowserTopic>({ categories, labels, renderPractice }: { categories: BrowserCategory<T>[]; labels: Labels; renderPractice: (topic: T) => ReactNode }) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [openId, setOpenId] = useState("");
  const stripRef = useRef<HTMLDivElement>(null);
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];

  // A vertical wheel over the strip scrolls it sideways; at either end the page scrolls as usual.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const canScroll = event.deltaY > 0 ? strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1 : strip.scrollLeft > 0;
      if (!canScroll) return;
      event.preventDefault();
      strip.scrollLeft += event.deltaY;
    };
    strip.addEventListener("wheel", onWheel, { passive: false });
    return () => strip.removeEventListener("wheel", onWheel);
  }, []);

  function choose(id: string, target: HTMLElement) {
    setCategoryId(id);
    setOpenId("");
    target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  return <div className="space-y-4">
    <h2 className="font-serif text-2xl font-bold">{labels.heading}</h2>
    <div ref={stripRef} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]" role="group" aria-label={labels.heading}>
      {categories.map((item) => <span key={item.id} className="shrink-0" onClickCapture={(event) => choose(item.id, event.currentTarget)}>
        <Pill active={item.id === category?.id} className="whitespace-nowrap">{item.title} <span className="ml-1.5 opacity-70">{item.topics.length}</span></Pill>
      </span>)}
    </div>
    {category?.note && <p className="text-sm text-muted">{category.note}</p>}
    {category && <div className="divide-y divide-line overflow-hidden rounded-ui border border-line bg-surface">
      {category.topics.map((topic) => {
        const open = openId === topic.id;
        return <div key={topic.id}>
          <button aria-expanded={open} onClick={() => setOpenId(open ? "" : topic.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left font-bold transition hover:bg-brand-soft/50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand">
            <span className="flex-1">{topic.title}</span>
            <span aria-hidden="true" className={`text-xl leading-none text-brand transition-transform ${open ? "rotate-45" : ""}`}>+</span>
          </button>
          {open && <div className="border-t border-line px-5 py-5">
            <p className="text-sm font-bold text-brand">{labels.suggestionsTitle}</p>
            <div className="mt-2 grid gap-4 md:grid-cols-2">
              <SentenceList label={labels.basicLabel} sentences={topic.suggestions} />
              {topic.advanced.length > 0 && <SentenceList label={labels.advancedLabel} sentences={topic.advanced} />}
            </div>
            <div className="mt-6">{renderPractice(topic)}</div>
          </div>}
        </div>;
      })}
    </div>}
  </div>;
}

function SentenceList({ label, sentences }: { label: string; sentences: string[] }) {
  return <div>
    <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
    <ul className="mt-1.5 space-y-1.5 text-sm leading-6 text-muted">{sentences.map((sentence) => <li key={sentence} className="flex gap-2"><span aria-hidden="true" className="text-brand">•</span><span>{sentence}</span></li>)}</ul>
  </div>;
}
