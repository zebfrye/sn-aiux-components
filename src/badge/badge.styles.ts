import { css } from 'lit';
import { hostStyles, tokenStyles } from '../styles/tokens.js';

export const badgeStyles = [
  tokenStyles,
  hostStyles,
  css`
    :host {
      display: inline-flex;
      vertical-align: middle;
      --_c: var(--_neutral);
    }
    :host([variant='primary']) { --_c: var(--_primary); }
    :host([variant='success']) { --_c: var(--_success); }
    :host([variant='warning']) { --_c: var(--_warning); }
    :host([variant='error']) { --_c: var(--_error); }
    :host([variant='info']) { --_c: var(--_info); }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375em;
      box-sizing: border-box;
      max-width: 100%;
      padding: 0.125em 0.625em;
      border: 1px solid transparent;
      border-radius: 999px;
      font: inherit;
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1.5;
      white-space: nowrap;
      color: var(--_c);
      background: color-mix(in srgb, var(--_c) 14%, transparent);
    }
    :host([size='sm']) .badge { font-size: 0.6875rem; padding: 0 0.5em; }
    :host([size='lg']) .badge { font-size: 0.9375rem; padding: 0.25em 0.75em; }
    :host([appearance='outline']) .badge { background: transparent; border-color: currentColor; }
    :host([appearance='solid']) .badge { background: var(--_c); color: #fff; }

    .dot {
      flex: none;
      width: 0.5em;
      height: 0.5em;
      border-radius: 50%;
      background: currentColor;
    }
    .label {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .remove {
      all: unset;
      flex: none;
      display: inline-grid;
      place-items: center;
      width: 1.25em;
      height: 1.25em;
      margin-inline-end: -0.35em;
      border-radius: 50%;
      cursor: pointer;
      line-height: 1;
    }
    .remove:hover { background: color-mix(in srgb, currentColor 20%, transparent); }
    .remove:focus-visible { outline: 2px solid currentColor; outline-offset: 1px; }
  `
];
