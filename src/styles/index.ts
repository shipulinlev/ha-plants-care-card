import { ensureDesignFonts } from './fonts';
import { frame } from './frame';
import { photoStyles } from './photo';
import { tagStyles } from './tag';
import { tokens } from './tokens';

export { corners, frame } from './frame';
export { careIcon } from './icons';
export { ensureDesignFonts } from './fonts';
export { plantPhoto, photoStyles, type PhotoStyle } from './photo';
export { statusTag, tagClass, tagStyles } from './tag';
export { tokens } from './tokens';

export type FontMode = 'design' | 'theme';

export const sharedStyles = [tokens, frame, tagStyles, photoStyles];

// Shared by both cards' setConfig: the font host attribute drives :host([font='theme']).
export function applyFontMode(host: HTMLElement, font: FontMode): void {
  host.setAttribute('font', font);
  if (font === 'design') ensureDesignFonts(host.ownerDocument);
}
