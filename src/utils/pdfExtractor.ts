/**
 * Utility for robust client-side PDF text extraction using PDF.js.
 * Handles page parsing, text accumulation, scanned/image-only detection,
 * and clear user-facing error reporting.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker source from standard CDN matching installed version
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (err) {
    console.warn('PDF.js worker initialization warning:', err);
  }
}

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
  isScannedOrEmpty: boolean;
  metadata?: {
    title?: string;
    author?: string;
  };
  warning?: string;
}

export async function extractTextFromPdf(file: File): Promise<ExtractedPdfResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDocument = await loadingTask.promise;

    const pageCount = pdfDocument.numPages;
    let fullText = '';
    let nonEmptyPageCount = 0;

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
        .join(' ')
        .trim();

      if (pageText.length > 10) {
        nonEmptyPageCount++;
      }

      fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
    }

    const trimmedFullText = fullText.trim();
    // A document with very little text despite multiple pages is likely scanned
    const isScannedOrEmpty = trimmedFullText.length < 50 || nonEmptyPageCount === 0;

    let warning: string | undefined;
    if (isScannedOrEmpty) {
      warning = 'This document appears to contain scanned images or no selectable text. For best results with Gemini, please use a searchable PDF or paste your lecture notes directly.';
    }

    // Try reading title metadata
    let metadata: { title?: string; author?: string } | undefined;
    try {
      const meta = await pdfDocument.getMetadata();
      const info = meta?.info as any;
      if (info?.Title) {
        metadata = {
          title: String(info.Title),
          author: info.Author ? String(info.Author) : undefined,
        };
      }
    } catch {
      // metadata is optional
    }

    return {
      text: trimmedFullText,
      pageCount,
      isScannedOrEmpty,
      metadata,
      warning,
    };
  } catch (error: any) {
    console.error('PDF extraction failure:', error);
    throw new Error(
      error?.message || 'Could not parse this PDF. Please verify the file is not corrupted or password-protected.'
    );
  }
}
