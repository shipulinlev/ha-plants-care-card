import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMockHass, TODAY } from '../../../dev/mock-hass';
import { setClock } from '../../data/clock';
import { buildGroupView } from './view';

const hass = createMockHass();

beforeAll(() => setClock(() => TODAY));
afterAll(() => setClock(null));

describe('buildGroupView', () => {
  it('sorts plants by urgency and summarises the area', () => {
    const v = buildGroupView(hass, { area: 'living_room' })!;
    expect(v.title).toBe('Living room');
    expect(v.plants.map((p) => p.name)).toEqual([
      'Fiddle-leaf fig',
      'Monstera',
      'Pothos',
      'Snake plant',
    ]);
    expect([v.countText, v.attentionText]).toEqual(['4 plants', '1 needs care today']);
  });

  it('builds short chips without a sub-line interval', () => {
    const [ficus] = buildGroupView(hass, { area: 'living_room' })!.plants;
    expect(ficus.water).toMatchObject({ short: '3 d late', status: 'overdue' });
    expect(ficus.water.sub).toBe('Was due Sat 10 Oct');
  });

  it('takes the title and photos from the config', () => {
    const v = buildGroupView(hass, {
      area: 'living_room',
      title: 'Lounge',
      images: { device_monstera: '/local/m.jpg' },
      photo_style: 'natural',
    })!;
    expect(v.title).toBe('Lounge');
    const monstera = v.plants.find((p) => p.name === 'Monstera')!;
    expect(monstera.photo).toEqual({ src: '/local/m.jpg', style: 'natural' });
    expect(v.plants.find((p) => p.name === 'Pothos')!.photo.src).toBeNull();
  });

  it('keeps plants with no care logged', () => {
    const [fern] = buildGroupView(hass, { area: 'kitchen' })!.plants;
    expect(fern.water).toMatchObject({ big: '—', statusLabel: 'Not set' });
  });

  it('is empty for an area without plants and null for a missing one', () => {
    expect(buildGroupView(hass, { area: 'office' })!.plants).toEqual([]);
    expect(buildGroupView(hass, { area: 'nope' })).toBeNull();
  });
});
