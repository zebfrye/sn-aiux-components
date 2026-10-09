import { describe, expect, it } from 'vitest';
import './index.js';
import { getInitials, hueFromString } from './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

describe('helpers', () => {
  it('derives initials', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
    expect(getInitials('  grace   brewster   hopper ')).toBe('GH');
    expect(getInitials('Cher')).toBe('C');
    expect(getInitials('')).toBe('');
  });
  it('hue is stable and in range', () => {
    expect(hueFromString('Ada')).toBe(hueFromString('Ada'));
    expect(hueFromString('Ada')).toBeGreaterThanOrEqual(0);
    expect(hueFromString('Ada')).toBeLessThan(360);
  });
});

describe('aiux-avatar', () => {
  it('shows initials and labels itself', async () => {
    const el = await fixture('<aiux-avatar name="Ada Lovelace"></aiux-avatar>');
    const avatar = shadow(el).querySelector('.avatar')!;
    expect(avatar.textContent!.trim()).toBe('AL');
    expect(avatar.getAttribute('aria-label')).toBe('Ada Lovelace');
  });

  it('falls back to initials when the image fails', async () => {
    const el = await fixture<HTMLElement & { updateComplete: Promise<unknown> }>(
      '<aiux-avatar name="Ada Lovelace" src="/missing.png"></aiux-avatar>'
    );
    let errored = false;
    el.addEventListener('aiux-avatar-error', () => (errored = true));
    shadow(el).querySelector('img')!.dispatchEvent(new Event('error'));
    await el.updateComplete;
    expect(errored).toBe(true);
    expect(shadow(el).querySelector('img')).toBeNull();
    expect(shadow(el).querySelector('.avatar')!.textContent!.trim()).toBe('AL');
  });

  it('renders a status dot', async () => {
    const el = await fixture('<aiux-avatar name="A" status="online"></aiux-avatar>');
    expect(shadow(el).querySelector('.status.online')).toBeTruthy();
  });
});

describe('aiux-avatar-group', () => {
  it('hides avatars beyond max and shows +N', async () => {
    const el = await fixture<HTMLElement & { updateComplete: Promise<unknown> }>(
      `<aiux-avatar-group max="2">
        <aiux-avatar name="A"></aiux-avatar><aiux-avatar name="B"></aiux-avatar>
        <aiux-avatar name="C"></aiux-avatar><aiux-avatar name="D"></aiux-avatar>
      </aiux-avatar-group>`
    );
    shadow(el).querySelector('slot')!.dispatchEvent(new Event('slotchange'));
    await el.updateComplete;
    const avatars = [...el.querySelectorAll('aiux-avatar')] as HTMLElement[];
    expect(avatars.map((a) => a.hidden)).toEqual([false, false, true, true]);
    expect(shadow(el).querySelector('.overflow')!.textContent).toBe('+2');
  });
});
