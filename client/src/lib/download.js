export function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export function getFilenameFromDisposition(headerValue, fallback = 'download') {
    if (!headerValue) return fallback;

    const match = headerValue.match(/filename="?([^"]+)"?/i);
    return match?.[1] || fallback;
}
