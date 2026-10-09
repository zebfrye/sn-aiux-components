import { css } from 'lit';

/**
 * Semantic palette shared by the elements. Each value resolves to the AIUX theme token when the
 * host app defines it and falls back to a neutral default otherwise.
 */
export const tokenStyles = css`
  :host {
    --_primary: var(--color-primary, #1f6feb);
    --_success: var(--color-success, #1a7f37);
    --_warning: var(--color-warning, #9a6700);
    --_error: var(--color-error, #cf222e);
    --_info: var(--color-info, #0969da);
    --_neutral: var(--color-text-tertiary, #59636e);
    --_text: var(--color-text-primary, #1f2328);
    --_border: var(--color-border, #d1d9e0);
    --_surface: var(--color-surface, #ffffff);
    --_surface-muted: var(--color-surface-muted, #f6f8fa);
    --_radius: var(--radius-box, 6px);
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --_text: var(--color-text-primary, #e6edf3);
      --_border: var(--color-border, #3d444d);
      --_surface: var(--color-surface, #0d1117);
      --_surface-muted: var(--color-surface-muted, #151b23);
    }
  }
`;

export const hostStyles = css`
  :host([hidden]) {
    display: none !important;
  }
`;

export const reducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
