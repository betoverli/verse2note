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
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(line);
  }
  return pages.join("\n");
}

async function docxToText(data: ArrayBuffer) {
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml({ arrayBuffer: data });
  return htmlToText(result.value);
}
