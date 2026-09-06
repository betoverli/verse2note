export type CopyFormat = "rich" | "markdown" | "plain";

export type CopyItem = {
  label: string;
  url: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function linkHtml(label: string, url: string): string {
  return `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;
}

export function buildCopyPayload(label: string, url: string, format: CopyFormat) {
  const html = linkHtml(label, url);
  const markdown = `[${label}](${url})`;
  const plain = `${label}\n${url}`;
  return {
    html,
    markdown,
    plain: format === "markdown" ? markdown : format === "plain" ? plain : label,
    label,
    url,
  };
}

export function buildListPayload(items: CopyItem[], format: CopyFormat) {
  const html = items.map((item) => `<div>${linkHtml(item.label, item.url)}</div>`).join("");
  const markdown = items.map((item) => `[${item.label}](${item.url})`).join("\n");
  const plain = items.map((item) => `${item.label}\n${item.url}`).join("\n\n");
  const labels = items.map((item) => item.label).join("\n");
  return {
    html,
    markdown,
    plain: format === "markdown" ? markdown : format === "plain" ? plain : labels,
  };
}

function copyWithEvent(html: string, plain: string): boolean {
  let copied = false;
  const onCopy = (event: ClipboardEvent) => {
    event.clipboardData?.setData("text/html", html);
    event.clipboardData?.setData("text/plain", plain);
    event.preventDefault();
    copied = true;
  };
  document.addEventListener("copy", onCopy);
  try {
    document.execCommand("copy");
  } finally {
    document.removeEventListener("copy", onCopy);
  }
  return copied;
}

function copyWithEditable(html: string, plain: string): boolean {
  const host = document.createElement("div");
  host.contentEditable = "true";
  host.setAttribute("aria-hidden", "true");
  host.style.position = "fixed";
  host.style.left = "-9999px";
  host.style.top = "0";
  host.style.pointerEvents = "none";
  host.addEventListener("click", (event) => event.preventDefault());
  host.innerHTML = html;
  document.body.appendChild(host);

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(host);
  selection?.removeAllRanges();
  selection?.addRange(range);

  let ok = false;
  try {
    ok = copyWithEvent(html, plain) || document.execCommand("copy");
  } finally {
    selection?.removeAllRanges();
    host.remove();
  }
  return ok;
}

async function writeRichClipboard(html: string, plain: string): Promise<void> {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    const htmlBlob = new Blob([html], { type: "text/html" });
    const plainBlob = new Blob([plain], { type: "text/plain" });
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": plainBlob,
        }),
      ]);
      return;
    } catch {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": Promise.resolve(htmlBlob),
            "text/plain": Promise.resolve(plainBlob),
          }),
        ]);
        return;
      } catch {
        // fall through to older copy paths
      }
    }
  }

  if (copyWithEvent(html, plain)) return;
  if (copyWithEditable(html, plain)) return;

  await navigator.clipboard.writeText(plain);
}

export async function copyReference(label: string, url: string, format: CopyFormat): Promise<void> {
  await copyReferences([{ label, url }], format);
}

export async function copyReferences(items: CopyItem[], format: CopyFormat): Promise<void> {
  if (items.length === 0) return;
  const payload = buildListPayload(items, format);

  if (format === "markdown") {
    await navigator.clipboard.writeText(payload.markdown);
    return;
  }
  if (format === "plain") {
    await navigator.clipboard.writeText(payload.plain);
    return;
  }

  await writeRichClipboard(payload.html, items.map((item) => `${item.label}\n${item.url}`).join("\n\n"));
}
