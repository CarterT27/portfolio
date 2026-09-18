import type { ComponentChildren } from "preact";

// Renders a small markdown subset inline: [text](url), **bold**, *italic*.
export function inline(text: string): ComponentChildren[] {
  const out: ComponentChildren[] = [];
  const re = /\[(.+?)\]\((.+?)\)|\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      const ext = /^https?:/.test(m[2]);
      out.push(
        <a
          href={m[2]}
          class="link"
          target={ext ? "_blank" : undefined}
          rel={ext ? "noopener noreferrer" : undefined}
        >
          {m[1]}
        </a>,
      );
    } else if (m[3]) out.push(<strong>{m[3]}</strong>);
    else if (m[4]) out.push(<em>{m[4]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
