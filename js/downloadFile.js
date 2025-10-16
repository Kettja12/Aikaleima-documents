function downloadFile(filename, base64) {
    // Create a temporary anchor element and trigger download of a base64 data URL
    const link = document.createElement('a');
    link.href = 'data:text/csv;base64,' + base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}