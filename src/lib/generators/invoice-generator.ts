
export function generateInvoiceHTML(invoiceData: any) {
    const { subtotal, tax, discount, total } = calculateInvoiceTotal(invoiceData);
    const fullInvoiceNo = invoiceData.invoiceNumber || `AG-${new Date().getFullYear().toString().slice(-2)}${invoiceData.sequence || 'XXXX'}`;
    const dateObj = new Date(invoiceData.date || invoiceData.createdAt || new Date());
    const dateStr = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')} / ${dateObj.getDate().toString().padStart(2, '0')} / ${dateObj.getFullYear().toString().slice(-2)}`;

    let validUntilStr = "MM / DD / YY";
    if (invoiceData.dueDate) {
        const validObj = new Date(invoiceData.dueDate);
        validUntilStr = `${(validObj.getMonth() + 1).toString().padStart(2, '0')} / ${validObj.getDate().toString().padStart(2, '0')} / ${validObj.getFullYear().toString().slice(-2)}`;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AdGrades Invoice ${fullInvoiceNo}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4; margin: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: white; padding: 0; margin: 0; width: 210mm; min-height: 297mm; }
        .invoice-container { width: 100%; max-width: 210mm; margin: 0 auto; background: white; padding: 10mm; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .logo-section { display: flex; align-items: center; gap: 15px; }
        .logo { width: 160px; height: 55px; display: flex; align-items: center; justify-content: center; }
        .company-info { text-align: left; }
        .company-name { font-weight: 700; font-size: 13px; color: #1a1a1a; }
        .company-est { font-size: 10px; color: #666; font-weight: 600; }
        .services { display: flex; gap: 20px; font-size: 10px; color: #1a1a1a; font-weight: 600; margin-bottom: 10px; align-items: center; }
        .service-item { display: flex; flex-direction: column; line-height: 1.5; }
        .divider { width: 2px; background: #1a1a1a; height: 30px; }
        .address-bar { background: #00c8ff; padding: 6px 10px; display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
        .location-icon { width: 16px; height: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .address-text { color: #1a1a1a; font-size: 9px; font-weight: 700; letter-spacing: 0.5px; }
        .top-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .invoice-details { display: flex; flex-direction: column; gap: 5px; }
        .detail-row { display: flex; gap: 15px; font-size: 12px; }
        .detail-label { font-weight: 600; color: #1a1a1a; min-width: 80px; }
        .detail-value { color: #666; }
        .invoice-badge { border: 3px solid #00c8ff; border-radius: 30px; padding: 8px 40px; align-self: flex-start; }
        .invoice-badge-text { font-size: 24px; font-weight: 700; color: #00c8ff; letter-spacing: 2px; }
        .parties-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .party { flex: 1; }
        .party-title { font-weight: 700; font-size: 12px; margin-bottom: 8px; color: #1a1a1a; }
        .party-content { font-size: 11px; color: #1a1a1a; line-height: 1.6; }
        .party-name { font-weight: 600; }
        .items-table { border: 2px solid #00c8ff; border-radius: 12px; overflow: hidden; margin-bottom: 15px; }
        .table-header { background: white; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 10px 15px; font-weight: 700; font-size: 10px; color: #1a1a1a; border-bottom: 2px solid #00c8ff; }
        .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 10px 15px; font-size: 10px; color: #1a1a1a; border-bottom: 1px solid #e0e0e0; min-height: 45px; }
        .table-row:last-child { border-bottom: none; }
        .bottom-section { display: flex; gap: 20px; }
        .terms-section { flex: 1.2; }
        .terms-title { color: #00c8ff; font-size: 13px; font-weight: 700; margin-bottom: 10px; }
        .terms-list { font-size: 9px; line-height: 1.5; color: #1a1a1a; }
        .terms-list p { margin-bottom: 5px; }
        .signature-box { margin-top: 30px; padding-top: 40px; border-top: 2px solid #1a1a1a; text-align: center; font-size: 12px; color: #666; }
        .totals-section { flex: 0.8; }
        .subtotal-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12px; color: #1a1a1a; }
        .discount-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12px; color: #00c800; font-weight: 600; }
        .total-box { border: 3px solid #00c8ff; border-radius: 30px; padding: 10px 20px; margin: 15px 0; display: flex; justify-content: space-between; align-items: center; }
        .total-label { font-size: 17px; font-weight: 700; color: #1a1a1a; }
        .total-amount { font-size: 20px; font-weight: 700; color: #1a1a1a; }
        .payment-methods { margin-top: 20px; }
        .payment-title { color: #00c8ff; font-size: 13px; font-weight: 700; margin-bottom: 8px; text-align: center; }
        .payment-info { font-size: 9px; line-height: 1.6; color: #1a1a1a; }
        .payment-info div { margin-bottom: 4px; }
        .payment-label { font-weight: 700; display: inline-block; min-width: 110px; }
        .blue-highlight { color: #00c8ff; font-weight: 700; }
        .footer { margin-top: 15px; padding-top: 10px; border-top: 3px solid #1a1a1a; position: relative; }
        .footer::before { content: ''; position: absolute; top: -3px; left: 0; width: 40%; height: 3px; background: #00c8ff; }
        .thank-you { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
        .thank-you-blue { color: #00c8ff; }
        .contact-info { font-size: 10px; line-height: 1.6; color: #1a1a1a; }
        .contact-link { color: #1a1a1a; text-decoration: none; font-weight: 600; }
        .phone-icon { display: inline-block; width: 16px; height: 16px; background: #00c8ff; border-radius: 50%; text-align: center; color: white; font-size: 11px; line-height: 16px; margin-right: 5px; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div style="flex: 1;">
                <div class="logo-section" style="margin-bottom: 15px;">
                    <div class="logo">
                        <img src="/adgrades-logo.png" alt="AdGrades" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                </div>
                <div class="company-info">
                    <div class="company-name">${invoiceData.businessName || 'AdGrades Creative Agency'}</div>
                    <div class="company-est">EST.2023</div>
                </div>
            </div>
            <div class="services">
                <div class="service-item">
                    <span>Software Development</span>
                    <span>Automation & Business Analysis</span>
                </div>
                <div class="divider"></div>
                <div class="service-item">
                    <span>Brand Building</span>
                    <span>Performance Marketing</span>
                </div>
            </div>
        </div>

        <!-- Address Bar -->
        <div class="address-bar">
            <div class="location-icon">📍</div>
            <div class="address-text">${invoiceData.businessAddress || 'VINAYAKA INDUSTRIES, BEHIND KMF CATTEL FEED FACTORY, GANDHINAGAR, K HOSKOPPAL, HASSAN-573201'}</div>
        </div>

        <!-- Top Section -->
        <div class="top-section">
            <div class="invoice-details">
                <div class="detail-row">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">: ${dateStr}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Invoice No</span>
                    <span class="detail-value">: ${fullInvoiceNo}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Valid Until</span>
                    <span class="detail-value">: ${validUntilStr}</span>
                </div>
            </div>
            <div class="invoice-badge">
                <div class="invoice-badge-text">INVOICE</div>
            </div>
        </div>

        <!-- Parties Section -->
        <div class="parties-section">
            <div class="party">
                <div class="party-title">FROM</div>
                <div class="party-content">
                    <div class="party-name">Chandan Krishna</div>
                    <div>CEO, AdGrades</div>
                    <div>Hassan 573201</div>
                    <div>9686314869 | info@adgrades.in</div>
                </div>
            </div>
            <div class="party">
                <div class="party-title">QUOTATION FOR</div>
                <div class="party-content">
                    <div class="party-name">${invoiceData.clientName || 'CLIENT BUSINESS NAME'}</div>
                    <div>${invoiceData.clientAddress ? invoiceData.clientAddress.replace(/\n/g, '<br>') : 'CLIENT BUSINESS ADDRESS'}</div>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <div class="items-table">
            <div class="table-header">
                <div>ITEM</div>
                <div>QUANTITY</div>
                <div>UNIT PRICE</div>
                <div>SUBTOTAL</div>
            </div>
            ${Array(Math.max(4, (invoiceData.items || []).length)).fill(null).map((_, index) => {
        const item = (invoiceData.items || [])[index];
        return item ? `
            <div class="table-row">
                <div>${item.description}</div>
                <div>${item.quantity}</div>
                <div>₹${item.rate}</div>
                <div>₹${(item.quantity * item.rate)}</div>
            </div>
                ` : `
            <div class="table-row">
                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
            </div>
                `;
    }).join('')}
        </div>

        <!-- Bottom Section -->
        <div class="bottom-section">
            <div class="terms-section">
                <div class="terms-title">Terms and Conditions</div>
                <div class="terms-list">
                    <p>1. Please pay within 2 days of agreement with minimum of 50% of the agreed payment.</p>
                    <p>2. All special requirements must be communicated in advance to meet deadlines</p>
                    <p>3. Project discussions will take place during scheduled meetings. In case of emergencies, communication via text will be allowed, but phone calls will not be entertained.</p>
                    <p>4. To ensure the smooth progress of the project, the client must provide timely feedback on drafts, revisions, and deliverables. Delays in providing feedback may result in project delays and potential additional costs.</p>
                </div>
                <div class="signature-box">
                    Signature & Seal
                </div>
            </div>

            <div class="totals-section">
                <div class="subtotal-row">
                    <span>Subtotal :</span>
                    <span>₹${subtotal}</span>
                </div>
                <div class="subtotal-row">
                    <span>Tax (${invoiceData.taxRate}%) :</span>
                    <span>₹${tax}</span>
                </div>
                <div class="discount-row">
                    <span>Discount :</span>
                    <span>₹${discount}</span>
                </div>
                <div class="total-box">
                    <span class="total-label">TOTAL :</span>
                    <span class="total-amount">₹${total}</span>
                </div>

                <div class="payment-methods">
                    <div class="payment-title">Payment Methods</div>
                    <div class="payment-info">
                        <div style="text-align: center; margin-bottom: 10px; font-weight: 700;">All type of Payments are accepted.</div>
                        <div><span class="payment-label blue-highlight">UPI :</span> 9686373869@jupiteraxis</div>
                        <div><span class="payment-label blue-highlight">Bank transfer</span></div>
                        <div><span class="payment-label">Bank Name :</span> Federal Bank</div>
                        <div><span class="payment-label">Account Number :</span> 77770123900470</div>
                        <div><span class="payment-label">IFSC :</span> FDRL0007777</div>
                        <div><span class="payment-label">Name :</span> Chandan B Krishna</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="thank-you">
                <span class="thank-you-blue">THANK YOU</span> FOR YOUR BUSINESS.
            </div>
            <div class="contact-info">
                If you have any questions, please contact us at <a href="mailto:info@adgrades.in" class="contact-link">info@adgrades.in</a><br>
                or call us on <span class="phone-icon">📞</span><strong>+91 79750 61984</strong>
            </div>
        </div>
    </div>
</body>
</html>`;
}

export function calculateInvoiceTotal(invoiceData: any) {
    const items = invoiceData.items || [];
    const subtotal = items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.rate);
    }, 0);
    const tax = subtotal * ((invoiceData.taxRate || 0) / 100);
    const discount = Number(invoiceData.discount) || 0;
    return { subtotal, tax, discount, total: subtotal + tax - discount };
}
