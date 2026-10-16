import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMockHass, TODAY } from '../../../dev/mock-hass';
import { setClock } from '../../data/clock';
import { plantByDevice } from '../../data/discover';
import type { Plant } from '../../data/model';
import { buildPlantView } from './view';

const hass = createMockHass();
const monstera = plantByDevice(hass, 'device_monstera')!;

beforeAll(() => setClock(() => TODAY));
afterAll(() => setClock(null));

describe('buildPlantView', () => {
  it('builds the care views and next/then pair', () => {
    const v = buildPlantView(hass, {}, monstera);
    expect(v.name).toBe('Monstera');
    expect(v.water).toMatchObject({ big: '2', status: 'soon', sub: 'Thu 15 Oct · every 7 days' });
    expect(v.feed).toMatchObject({ big: '12', status: 'ok' });
    expect([v.next.kind, v.then.kind]).toEqual(['water', 'feed']);
    expect(v.ruler).toHaveLength(15);
  });

  it.each<[string, Partial<Plant>, string]>([
    ['area and species', {}, 'Living room · Monstera deliciosa'],
    ['area only', { species: null }, 'Living room'],
    ['species only', { areaId: null }, 'Monstera deliciosa'],
    ['neither', { areaId: 'deleted', species: null }, ''],
  ])('kicker with %s', (_, over, kicker) => {
    expect(buildPlantView(hass, {}, { ...monstera, ...over }).kicker).toBe(kicker);
  });

  it('prefers the configured image over the entity picture', () => {
    const plant = { ...monstera, image: '/local/entity.jpg' };
    expect(buildPlantView(hass, {}, plant).photo).toEqual({
      src: '/local/entity.jpg',
      style: 'duotone',
    });
    expect(
      buildPlantView(hass, { image: '/local/mine.jpg', photo_style: 'natural' }, plant).photo,
    ).toEqual({ src: '/local/mine.jpg', style: 'natural' });
  });

  it('passes date format and interval options through', () => {
    const v = buildPlantView(hass, { date_format: 'absolute', show_interval: false }, monstera);
    expect(v.water.text).toBe('Thu 15 Oct');
    expect(v.water.sub).toBe('in 2 days');
  });

  it('shows Not set when nothing is logged', () => {
    const v = buildPlantView(hass, {}, plantByDevice(hass, 'device_fern')!);
    expect(v.water).toMatchObject({ big: '—', statusLabel: 'Not set', progress: null });
  });
});
