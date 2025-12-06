/**
 * Helper to save a PDF blob to the server
 */
export async function savePdfToServer({
    pdfBlob,
    type,
    fileName,
    invoiceId,
    agreementId,
    clientId,
}: {
    pdfBlob: Blob;
    type: 'invoice' | 'agreement';
    fileName: string;
    invoiceId?: string;
    agreementId?: string;
    clientId?: string;
}) {
    const formData = new FormData();
    formData.append('file', pdfBlob, `${fileName}.pdf`);
    formData.append('type', type);
    formData.append('fileName', fileName);
    if (invoiceId) formData.append('invoiceId', invoiceId);
    if (agreementId) formData.append('agreementId', agreementId);
    if (clientId) formData.append('clientId', clientId);

    const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to save PDF to server');
    }

    return response.json();
}
