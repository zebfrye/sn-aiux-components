/** Mount an element from an HTML string and wait for its first render. */
export async function fixture<T extends HTMLElement>(markup: string): Promise<T> {
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  const el = host.firstElementChild as T & { updateComplete?: Promise<unknown> };
  await el.updateComplete;
  return el;
}

export const shadow = (el: HTMLElement) => el.shadowRoot!;
