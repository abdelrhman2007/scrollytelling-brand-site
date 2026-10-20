/**
 * Fallback contact data (used by Team and Contact). REPLACE with the client's
 * real people — these are fictional placeholders. When the CMS is reachable,
 * its settings and team win.
 */
export type Person = {
  id: string;
  name: string;
  phone: string; // local format, as printed
  photo: string;
};

export const people: Person[] = [
  { id: "alex", name: "Alex Morgan", phone: "01000000001", photo: "/images/team/person-1.webp" },
  { id: "sam", name: "Sam Rivera", phone: "01000000002", photo: "/images/team/person-2.webp" },
];

/** Local number → international digits for wa.me / tel: links. Set the country code. */
export const COUNTRY_CODE = "20";
export const toIntl = (local: string) => `${COUNTRY_CODE}${local.replace(/^0/, "")}`;

export const primaryContact = people[0];

/** wa.me link for any number given as international digits. */
export const waLink = (intl: string, text = "") =>
  `https://wa.me/${intl.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const whatsappLink = (text = "") => waLink(toIntl(primaryContact.phone), text);
