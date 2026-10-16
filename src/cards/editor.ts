import { LitElement, html, nothing } from 'lit';
import { createLocalize, type Localize, type TranslationKey } from '../localize/localize';
import type { HaFormSchema, HomeAssistant, LovelaceCardConfig } from '../types/hass';

// A dropdown whose labels come from `editor.<name>.<value>`.
export const select = (t: Localize, name: string, values: readonly string[]): HaFormSchema => ({
  name,
  selector: {
    select: {
      mode: 'dropdown',
      options: values.map((value) => ({
        value,
        label: t(`editor.${name}.${value}` as TranslationKey),
      })),
    },
  },
});

export const section = (
  t: Localize,
  name: 'appearance' | 'interactions',
  icon: string,
  schema: HaFormSchema[],
): HaFormSchema => ({
  type: 'expandable',
  name: '',
  title: t(`editor.${name}`),
  icon,
  flatten: true,
  schema,
});

export const actionFields = (): HaFormSchema[] => [
  { name: 'tap_action', selector: { ui_action: { default_action: 'more-info' } } },
  { name: 'hold_action', selector: { ui_action: {} } },
];

const isEqual = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

// Base for both card editors: renders HA's ha-form over the config and reports changes.
// Values equal to the card's defaults are left out, so the saved YAML stays minimal.
export abstract class PlantCareEditor<C extends LovelaceCardConfig> extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  protected _config?: C;

  protected abstract defaults: Partial<C>;
  protected abstract schema(t: Localize): HaFormSchema[];
  // Helper text keys for fields whose helper differs from the shared `editor.<name>_helper`.
  protected helpers: Record<string, TranslationKey> = {};

  // Never throws: the config may be incomplete while it is being edited.
  setConfig(config: C): void {
    this._config = config;
  }

  private get _t(): Localize {
    return createLocalize(this.hass?.locale.language ?? 'en');
  }

  private _label = (field: { name: string }) => this._t(`editor.${field.name}` as TranslationKey);

  private _helper = (field: { name: string }) => {
    const key = this.helpers[field.name] ?? `editor.${field.name}_helper`;
    const text = this._t(key as TranslationKey);
    return text === key ? undefined : text;
  };

  render() {
    if (!this.hass || !this._config) return nothing;
    return html`<ha-form
      .hass=${this.hass}
      .data=${{ ...this.defaults, ...this._config }}
      .schema=${this.schema(this._t)}
      .computeLabel=${this._label}
      .computeHelper=${this._helper}
      @value-changed=${this._valueChanged}
    ></ha-form>`;
  }

  // ha-form reports the whole form value: every field, plus the YAML-only keys passed in as data.
  private _valueChanged(ev: CustomEvent<{ value: Record<string, unknown> }>): void {
    ev.stopPropagation();
    if (!this._config) return;
    const config: Record<string, unknown> = { type: this._config.type };
    for (const [key, value] of Object.entries(ev.detail.value)) {
      if (key === 'type' || value === undefined || value === '') continue;
      if (isEqual(value, this.defaults[key as keyof C])) continue;
      config[key] = value;
    }
    this._config = config as C;
    this.dispatchEvent(
      new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }),
    );
  }
}
