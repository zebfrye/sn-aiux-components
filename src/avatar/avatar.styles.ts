import { css } from 'lit';
import { hostStyles, tokenStyles } from '../styles/tokens.js';

export const avatarStyles = [
  tokenStyles,
  hostStyles,
  css`
    :host {
      --_size: 2.5rem;
      display: inline-block;
      position: relative;
      width: var(--_size);
      height: var(--_size);
      flex: none;
    }
    :host([size='xs']) { --_size: 1.25rem; }
    :host([size='sm']) { --_size: 1.75rem; }
    :host([size='lg']) { --_size: 3.5rem; }
    :host([size='xl']) { --_size: 5rem; }

    .avatar {
      display: grid;
      place-items: center;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 50%;
      color: #fff;
      font-size: calc(var(--_size) * 0.4);
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0.02em;
      user-select: none;
    }
    :host([shape='square']) .avatar { border-radius: var(--_radius); }
    img { width: 100%; height: 100%; object-fit: cover; }

    .status {
      position: absolute;
      inset-inline-end: 0;
      inset-block-end: 0;
      width: max(0.5rem, calc(var(--_size) * 0.28));
      height: max(0.5rem, calc(var(--_size) * 0.28));
      box-sizing: border-box;
      border: 2px solid var(--_surface);
      border-radius: 50%;
      background: var(--_neutral);
    }
    .status.online { background: var(--_success); }
    .status.busy { background: var(--_error); }
    .status.away { background: var(--_warning); }
  `
];

export const avatarGroupStyles = [
  tokenStyles,
  hostStyles,
  css`
    :host {
      display: inline-flex;
      align-items: center;
      flex-direction: row;
    }
    ::slotted(aiux-avatar) {
      box-shadow: 0 0 0 2px var(--_surface);
      border-radius: 50%;
      margin-inline-start: -0.5rem;
    }
    ::slotted(aiux-avatar:first-child),
    .overflow-first { margin-inline-start: 0; }
    .overflow {
      margin-inline-start: -0.5rem;
      display: grid;
      place-items: center;
      min-width: 2.5rem;
      height: 2.5rem;
      box-sizing: border-box;
      padding: 0 0.375rem;
      border-radius: 999px;
      box-shadow: 0 0 0 2px var(--_surface);
      background: var(--_surface-muted);
      color: var(--_text);
      font-size: 0.8125rem;
      font-weight: 600;
    }
  `
];
