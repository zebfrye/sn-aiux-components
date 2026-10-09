import { customElement } from 'lit/decorators.js';
import { AIUXBadge } from './badge.js';

/** Removable chip: an `aiux-badge` that defaults to `removable`. */
@customElement('aiux-tag')
export class AIUXTag extends AIUXBadge {
  constructor() {
    super();
    this.removable = true;
    this.appearance = 'outline';
  }
}
