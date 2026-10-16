// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { applyFontMode } from '.';
import { ensureDesignFonts, FONT_HREF, FONT_LINK_ID } from './fonts';

const links = () => document.head.querySelectorAll(`link#${FONT_LINK_ID}`);

describe('ensureDesignFonts', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('adds the stylesheet link once', () => {
    ensureDesignFonts();
    ensureDesignFonts();
    expect(links()).toHaveLength(1);
    const link = links()[0] as HTMLLinkElement;
    expect(link.rel).toBe('stylesheet');
    expect(link.getAttribute('href')).toBe(FONT_HREF);
  });

  it('is skipped in theme font mode', () => {
    const host = document.createElement('div');
    applyFontMode(host, 'theme');
    expect(host.getAttribute('font')).toBe('theme');
    expect(links()).toHaveLength(0);
    applyFontMode(host, 'design');
    expect(host.getAttribute('font')).toBe('design');
    expect(links()).toHaveLength(1);
  });
});
