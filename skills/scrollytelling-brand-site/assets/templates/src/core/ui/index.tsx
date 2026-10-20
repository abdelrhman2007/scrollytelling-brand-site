import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/core/lib/cn";
import s from "./ui.module.css";

/* -------------------------------------------------------------------------- */
/* PixelTag — the yellow "Prototyping" box from the logo, as a UI primitive.  */
/* -------------------------------------------------------------------------- */
export function PixelTag({
  children,
  tone = "solid",
  className,
  style,
}: {
  children: ReactNode;
  tone?: "solid" | "ghost" | "navy";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={cn(s.pixelTag, className)} data-tone={tone} style={style}>
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Dots — the three-dot signature that closes every slide of the deck.         */
/* -------------------------------------------------------------------------- */
export function Dots({
  pulse = false,
  className,
  style,
}: {
  pulse?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={cn(s.dots, className)} data-pulse={pulse} style={style} aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* SectionLabel — "01 ── DEMO PROFILE"                                          */
/* -------------------------------------------------------------------------- */
export function SectionLabel({
  index,
  children,
  className,
  style,
}: {
  index: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p className={cn(s.label, className)} style={style} data-label>
      <b>{index}</b>
      <i data-label-line />
      <span>{children}</span>
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* SplitWords — splits copy into animatable words.                              */
/* Wrap words in [[double brackets]] to give them the yellow highlight box.     */
/* -------------------------------------------------------------------------- */
export function SplitWords({
  text,
  className,
  wordClassName,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
}) {
  // Units: a highlighted phrase stays one unit, plain copy splits per word.
  const units: { text: string; hl: boolean; glue: boolean }[] = [];
  for (const chunk of text.split(/(\[\[.+?\]\])/g)) {
    if (!chunk) continue;
    if (chunk.startsWith("[[")) {
      units.push({ text: chunk.slice(2, -2), hl: true, glue: false });
      continue;
    }
    const glueFirst = !/^\s/.test(chunk); // punctuation stuck to a highlight: "[[hold]]."
    chunk
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w, i) => units.push({ text: w, hl: false, glue: i === 0 && glueFirst }));
  }

  return (
    <span className={cn(s.words, className)}>
      {units.map((u, i) => (
        <Fragment key={i}>
          {i > 0 && !u.glue && " "}
          <span
            className={cn(s.word, u.hl && s.hl, wordClassName)}
            data-word={i}
            data-hl={u.hl || undefined}
          >
            {u.text}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
