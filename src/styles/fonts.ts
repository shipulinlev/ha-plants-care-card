export const FONT_LINK_ID = 'plant-care-cards-fonts';
export const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500&family=Barlow+Condensed:wght@600&display=swap';

// @font-face does not work inside shadow DOM, so the fonts load once in the document head.
// Without network the cards fall back to the theme font.
export function ensureDesignFonts(doc: Document = document): void {
  if (doc.getElementById(FONT_LINK_ID)) return;
  const link = doc.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = FONT_HREF;
  doc.head.append(link);
}
