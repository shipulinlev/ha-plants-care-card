// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockHass } from '../../../dev/mock-hass';
import type { HaFormSchema, LovelaceCardConfig } from '../../types/hass';
import { PlantCareGroupCardEditor } from './editor';

if (!customElements.get('plant-care-group-card-editor')) {
  customElements.define('plant-care-group-card-editor', PlantCareGroupCardEditor);
}

afterEach(() => document.body.replaceChildren());

type Form = HTMLElement & {
  data: Record<string, unknown>;
  schema: HaFormSchema[];
  computeHelper(f: { name: string }): string | undefined;
};

async function mount(config: Record<string, unknown>) {
  const editor = document.createElement('plant-care-group-card-editor') as PlantCareGroupCardEditor;
  editor.hass = createMockHass();
  editor.setConfig({ type: 'custom:plant-care-group-card', ...config } as never);
  document.body.append(editor);
  await editor.updateComplete;
  const form = editor.shadowRoot!.querySelector('ha-form') as Form;
  const changes = vi.fn<(config: LovelaceCardConfig) => void>();
  editor.addEventListener('config-changed', (e) =>
    changes((e as CustomEvent<{ config: LovelaceCardConfig }>).detail.config),
  );
  const change = (patch: Record<string, unknown>) =>
    form.dispatchEvent(
      new CustomEvent('value-changed', { detail: { value: { ...form.data, ...patch } } }),
    );
  return { form, changes, change };
}

describe('group card editor', () => {
  it('offers an optional area and plants, both limited to plant_care', async () => {
    const { form } = await mount({ area: '' });
    expect(form.schema[0]).toEqual({
      name: 'area',
      selector: { area: { device: { integration: 'plant_care' } } },
    });
    expect(form.schema[1]).toEqual({
      name: 'plants',
      selector: { device: { multiple: true, filter: { integration: 'plant_care' } } },
    });
  });

  it('writes picked plants, and sort only when manual', async () => {
    const { changes, change } = await mount({ area: 'living_room' });
    change({ plants: ['device_calathea'], sort: 'manual' });
    expect(changes).toHaveBeenLastCalledWith({
      type: 'custom:plant-care-group-card',
      area: 'living_room',
      plants: ['device_calathea'],
      sort: 'manual',
    });
    change({ sort: 'urgency' });
    expect(changes.mock.lastCall![0]).not.toHaveProperty('sort');
  });

  it('reports a title and drops it again when cleared', async () => {
    const { changes, change } = await mount({ area: 'living_room' });
    change({ title: 'Lounge' });
    expect(changes).toHaveBeenLastCalledWith({
      type: 'custom:plant-care-group-card',
      area: 'living_room',
      title: 'Lounge',
    });
    change({ title: '', layout: 'grid' });
    expect(changes).toHaveBeenLastCalledWith({
      type: 'custom:plant-care-group-card',
      area: 'living_room',
      layout: 'grid',
    });
  });

  it('writes show_name only when the name is hidden', async () => {
    const { changes, change } = await mount({ area: 'living_room' });
    change({ show_name: false });
    expect(changes).toHaveBeenLastCalledWith({
      type: 'custom:plant-care-group-card',
      area: 'living_room',
      show_name: false,
    });
    change({ show_name: true });
    expect(changes).toHaveBeenLastCalledWith({
      type: 'custom:plant-care-group-card',
      area: 'living_room',
    });
  });

  it('keeps YAML-only images and says where to set them', async () => {
    const images = { device_monstera: '/local/m.jpg' };
    const { form, changes, change } = await mount({ area: 'living_room', images });
    change({ font: 'theme' });
    expect(changes.mock.lastCall![0]).toMatchObject({ images, font: 'theme' });
    expect(form.computeHelper({ name: 'photo_style' })).toBe(
      'Per-plant photos (images) are set in YAML',
    );
  });
});
