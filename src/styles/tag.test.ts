// @vitest-environment happy-dom
import { render } from 'lit';
import { describe, expect, it } from 'vitest';
import { statusTag, tagClass } from './tag';

const mount = (template: unknown) => {
  const el = document.createElement('div');
  render(template, el);
  return el.querySelector('span')!;
};

describe('tagClass', () => {
  it('maps each status to its own class and Not set to ok', () => {
    expect(['ok', 'soon', 'due', 'overdue'].map((s) => tagClass(s as never))).toEqual([
      'ok',
      'soon',
      'due',
      'overdue',
    ]);
    expect(tagClass(null)).toBe('ok');
  });
});

describe('statusTag', () => {
  it('renders the status label', () => {
    const tag = mount(statusTag({ status: 'due', statusLabel: 'Due' }));
    expect(tag.className).toBe('tag due');
    expect(tag.textContent).toBe('Due');
  });

  it('renders custom text as a chip', () => {
    const tag = mount(statusTag({ status: 'overdue', statusLabel: 'Overdue' }, '3 d late', true));
    expect(tag.className).toBe('tag overdue chip');
    expect(tag.textContent).toBe('3 d late');
  });

  it('uses the ok style for Not set', () => {
    expect(mount(statusTag({ status: null, statusLabel: 'Not set' })).className).toBe('tag ok');
  });
});
