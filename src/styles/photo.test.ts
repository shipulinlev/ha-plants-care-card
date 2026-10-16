// @vitest-environment happy-dom
import { render } from 'lit';
import { describe, expect, it } from 'vitest';
import { plantPhoto, type PhotoOptions } from './photo';

const mount = (opts: PhotoOptions) => {
  const el = document.createElement('div');
  render(plantPhoto(opts), el);
  return el.querySelector('.photo')!;
};

describe('plantPhoto', () => {
  it('draws the hatch placeholder without a photo', () => {
    const photo = mount({ src: null, style: 'duotone', label: 'Plant photo' });
    expect(photo.classList.contains('hatch')).toBe(true);
    expect(photo.classList.contains('lg')).toBe(true);
    expect(photo.querySelector('img')).toBeNull();
    expect(photo.querySelector('.photo-label')?.textContent).toBe('Plant photo');
  });

  it('uses the small hatch and no caption for thumbnails', () => {
    const photo = mount({ src: null, style: 'natural', size: 'sm' });
    expect(photo.classList.contains('sm')).toBe(true);
    expect(photo.querySelector('.photo-label')).toBeNull();
  });

  it('tints a photo with duotone', () => {
    const photo = mount({ src: '/local/m.jpg', style: 'duotone' });
    expect(photo.classList.contains('duotone')).toBe(true);
    expect(photo.querySelector('img')?.getAttribute('src')).toBe('/local/m.jpg');
  });

  it('keeps natural photos untinted', () => {
    const photo = mount({ src: '/local/m.jpg', style: 'natural' });
    expect(photo.classList.contains('duotone')).toBe(false);
    expect(photo.querySelector('img')).not.toBeNull();
  });
});
