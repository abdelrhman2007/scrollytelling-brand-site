import type { CmsCard } from "./types";

/** vCard 3.0 text escaping (RFC 2426): backslash, comma, semicolon, newline. */
const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");

/** Local Egyptian numbers (0…) → +20…; anything else keeps its digits and a leading +. */
export const intlPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return `+${raw.trim().startsWith("0") && !raw.trim().startsWith("00") ? `20${digits.slice(1)}` : digits.replace(/^00/, "")}`;
};

/** A "Save contact" file every phone understands (iOS, Android, Outlook). */
export function toVCard(card: CmsCard, cardUrl: string): string {
  const parts = card.name.trim().split(/\s+/);
  const last = parts.length > 1 ? parts.pop()! : "";
  const first = parts.join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(last)};${esc(first)};;;`,
    `FN:${esc(card.name)}`,
  ];
  if (card.company) lines.push(`ORG:${esc(card.company)}`);
  if (card.jobTitle) lines.push(`TITLE:${esc(card.jobTitle)}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL,VOICE:${intlPhone(card.phone)}`);
  if (card.whatsapp && (!card.phone || intlPhone(card.phone) !== `+${card.whatsapp}`))
    lines.push(`TEL;TYPE=CELL:+${card.whatsapp}`);
  if (card.email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${esc(card.email)}`);
  if (card.website) lines.push(`URL:${esc(card.website)}`);
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${esc(card.address)};;;;`);
  for (const [k, v] of Object.entries(card.socials ?? {})) if (v) lines.push(`X-SOCIALPROFILE;TYPE=${k}:${esc(v)}`);
  if (card.bio) lines.push(`NOTE:${esc(card.bio)}`);
  lines.push(`SOURCE:${esc(cardUrl)}`, "END:VCARD");
  return lines.join("\r\n") + "\r\n";
}
