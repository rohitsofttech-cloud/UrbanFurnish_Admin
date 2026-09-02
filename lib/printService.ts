/**
 * Helper utility for opening a print popup window with formatted HTML documents.
 */

export interface PrintDocumentOptions {
  title: string;
  htmlContent: string;
  width?: number;
  height?: number;
}

/**
 * Opens a dedicated popup print window, renders custom HTML, and triggers print.
 */
export function openPrintWindow({
  title,
  htmlContent,
  width = 960,
  height = 800,
}: PrintDocumentOptions): Window | null {
  if (typeof window === 'undefined') return null;

  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const printWindow = window.open(
    '',
    '_blank',
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
  );

  if (!printWindow) {
    console.error('Failed to open print window. Please allow popups.');
    return null;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  return printWindow;
}

/**
 * Generate standard HTML shell for printing with cross-browser print triggering
 */
export function createPrintDocumentShell({
  title,
  styles = '',
  bodyContent,
}: {
  title: string;
  styles?: string;
  bodyContent: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      background: #fff;
      color: #0f172a;
    }
    @media print {
      body {
        background: #fff;
      }
    }
    ${styles}
  </style>
</head>
<body>
  ${bodyContent}
  <script>
    window.onload = function() {
      window.focus();
      window.print();
      window.onafterprint = function() {
        window.close();
      };
    };
  <\/script>
</body>
</html>`;
}
