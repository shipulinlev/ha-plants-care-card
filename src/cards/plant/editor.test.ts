// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockHass } from '../../../dev/mock-hass';
import type { HaFormSchema, LovelaceCardConfig } from '../../types/hass';
import { PlantCareCardEditor } from './editor';

if (!customElements.get('plant-care-card-editor')) {
  customElements.define('plant-care-card-editor', PlantCareCardEditor);
}

afterEach(() => document.body.replaceChildren());

type Form = HTMLElement & {
  data: Record<string, unknown>;
  schema: HaFormSchema[];
  computeLabel(f: { name: string }): string;
  computeHelper(f: { name: string }): string | undefined;
};

async function mount(config: Record<string, unknown>) {
  const editor = document.createElement('plant-care-card-editor') as PlantCareCardEditor;
  editor.hass = createMockHass();
  editor.setConfig({ type: 'custom:plant-care-card', ...config } as never);
  document.body.append(editor);
  await editor.updateComplete;
  const form = editor.shadowRoot!.querySelector('ha-form') as Form;
  const changes = vi.fn<(config: LovelaceCardConfig) => void>();
  editor.addEventListener('config-changed', (e) =>
    changes((e as CustomEvent<{ config: LovelaceCardConfig }>).detail.config),
  );
  // ha-form reports the whole form value, as HA does.
  const change = (patch: Record<string, unknown>) =>
    form.dispatchEvent(
      new CustomEvent('value-changed', { detail: { value: { ...form.data, ...patch } } }),
    );
  return { form, changes, change };
}

const flat = (schema: HaFormSchema[]): HaFormSchema[] =>
  schema.flatMap((s) => ('schema' in s ? flat(s.schema) : [s]));

describe('plant card editor', () => {
  it('shows the config over the defaults', async () => {
    const { form } = await mount({ device_id: 'device_monstera', layout: 'side' });
    expect(form.data).toMatchObject({
      device_id: 'device_monstera',
      layout: 'side',
      date_format: 'relative',
      show_interval: true,
    });
  });

  it('offers only plant_care devices and every option', async () => {
    const { form } = await mount({ device_id: '' });
    const fields = flat(form.schema);
    expect(fields.map((f) => f.name)).toEqual([
      'device_id',
      'layout',
      'date_format',
      'photo_style',
      'font',
      'show_interval',
      'image',
      'tap_action',
      'hold_action',
    ]);
    expect(fields[0]).toMatchObject({
      required: true,
      selector: { device: { filter: { integration: 'plant_care' } } },
    });
    expect(fields[1]).toMatchObject({
      selector: { select: { options: [{ value: 'header', label: 'Photo header' }, {}, {}] } },
    });
  });

  it('reports changes and leaves out defaults and empty values', async () => {
    const { changes, change } = await mount({ device_id: 'device_monstera', layout: 'side' });
    change({ layout: 'countdown', image: '' });
    expect(changes).toHaveBeenLastCalledWith({
      type: 'custom:plant-care-card',
      device_id: 'device_monstera',
      layout: 'countdown',
    });
    change({ layout: 'header', show_interval: false });
    expect(changes).toHaveBeenLastCalledWith({
      type: 'custom:plant-care-card',
      device_id: 'device_monstera',
      show_interval: false,
    });
  });

  it('labels fields and adds helpers where there are any', async () => {
    const { form } = await mount({ device_id: '' });
    expect(form.computeLabel({ name: 'image' })).toBe('Photo URL');
    expect(form.computeHelper({ name: 'image' })).toBe('e.g. /local/plants/monstera.jpg');
    expect(form.computeHelper({ name: 'layout' })).toBeUndefined();
  });

  it('accepts an incomplete config', () => {
    expect(() => new PlantCareCardEditor().setConfig({ type: 'x' } as never)).not.toThrow();
  });
});
