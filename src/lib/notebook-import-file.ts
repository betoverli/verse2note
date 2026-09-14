import { htmlToText } from "@/lib/notebook-import";

const MAX_BYTES = 8 * 1024 * 1024;

export async function fileToText(file: File): Promise<{ text: string; filename: string }> {
  if (file.size > MAX_BYTES) throw new Error("too-large");
  const name = file.name || "nota";
  const type = (file.type || "").toLowerCase();
  const lower = name.toLowerCase();

  if (type === "application/pdf" || lower.endsWith(".pdf")) {
    return { text: await pdfToText(await file.arrayBuffer()), filename: name };
  }
  if (
    type.includes("wordprocessingml") ||
    type === "application/msword" ||
    lower.endsWith(".docx")
  ) {
    return { text: await docxToText(await file.arrayBuffer()), filename: name };
  }
  const raw = await file.text();
  if (type.includes("html") || lower.endsWith(".html") || lower.endsWith(".htm")) {
    return { text: htmlToText(raw), filename: name };
  }
  return { text: raw, filename: name };
}

type PdfBit = { str: string; x: number; y: number };

function columnGap(items: PdfBit[], pageWidth: number) {
  const xs = [...new Set(items.map((item) => Math.round(item.x)))].sort((a, b) => a - b);
  let best = { at: 0, size: 0 };
  for (let i = 1; i < xs.length; i++) {
    const size = xs[i]! - xs[i - 1]!;
    if (size > best.size) best = { at: (xs[i]! + xs[i - 1]!) / 2, size };
  }
  if (best.size < 36) return null;
  if (best.at < pageWidth * 0.32 || best.at > pageWidth * 0.72) return null;
  const left = items.filter((item) => item.x < best.at).length;
  const right = items.length - left;
  if (left < 8 || right < 8) return null;
  return best.at;
}

function rowsFrom(items: PdfBit[]) {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: { y: number; parts: PdfBit[] }[] = [];
  for (const item of sorted) {
    const row = rows.find((entry) => Math.abs(entry.y - item.y) <= 3);
    if (row) row.parts.push(item);
    else rows.push({ y: item.y, parts: [item] });
  }
  const minX = Math.min(...items.map((item) => item.x), 0);
  return rows.map((row) => {
    const parts = row.parts.sort((a, b) => a.x - b.x);
    const text = parts
      .map((part) => part.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const indent = (parts[0]?.x ?? minX) - minX;
    if (indent > 16 && text && !/^[-*•●◦▪\d]/.test(text)) return `  ${text}`;
    return text;
  });
}

async function pdfToText(data: ArrayBuffer) {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  const max = Math.min(doc.numPages, 40);
  for (let i = 1; i <= max; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items: PdfBit[] = [];
    for (const item of content.items) {
      if (!("str" in item) || !item.str) continue;
      const transform = "transform" in item ? item.transform : [0, 0, 0, 0, 0, 0];
      items.push({ str: item.str, x: transform[4] ?? 0, y: transform[5] ?? 0 });
    }
    const width = page.view[2] - page.view[0] || 612;
    const split = columnGap(items, width);
    const cols = split == null ? [items] : [items.filter((item) => item.x < split), items.filter((item) => item.x >= split)];
    pages.push(cols.flatMap(rowsFrom).filter(Boolean).join("\n"));
  }
  return pages.join("\n");
}

async function docxToText(data: ArrayBuffer) {
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml({ arrayBuffer: data });
  return htmlToText(result.value);
}
