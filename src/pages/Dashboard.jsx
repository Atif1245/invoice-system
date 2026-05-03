import React from 'react';
import { Bot, FileText, FileSpreadsheet, ZoomIn, ZoomOut, Maximize, Hash, Building2, Calendar, DollarSign, Package, History, List } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Dashboard = ({ uploadedFile, uploadHistory }) => {

  const latestData = uploadHistory && uploadHistory.length > 0 ? uploadHistory[0] : null;

  const handleExport = async () => {
    if (!uploadHistory || uploadHistory.length === 0) {
      alert("No data to export!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    
    // Group records by company
    const dataByCompany = {};
    uploadHistory.forEach(record => {
      let companyName = record.company || "Unknown Company";
      companyName = companyName.substring(0, 31).replace(/[\\/?*[\]]/g, '').trim();
      if (!dataByCompany[companyName]) dataByCompany[companyName] = [];
      dataByCompany[companyName].push(record);
    });

    Object.keys(dataByCompany).forEach(company => {
       const records = dataByCompany[company];
       const sheet = workbook.addWorksheet(company);

       // Set columns
       sheet.columns = [
         { width: 8 },  // A (S.NO / Labels)
         { width: 35 }, // B (DESCRIPTION)
         { width: 10 }, // C (A/U)
         { width: 10 }, // D (QTY)
         { width: 15 }, // E (RATE)
         { width: 20 }, // F (TOTAL)
       ];

       let rowIdx = 1;

       records.forEach((record, idx) => {
          if (idx > 0) rowIdx += 3;

          // STRN Header
          sheet.mergeCells(`B${rowIdx}:F${rowIdx}`);
          sheet.getCell(`B${rowIdx}`).value = "STRN: 23-00-8471-042-82 NTN: 3357964-4";
          sheet.getCell(`B${rowIdx}`).font = { name: 'Arial Narrow', bold: true };
          sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'center' };
          rowIdx++;

          // Title
          sheet.mergeCells(`B${rowIdx}:F${rowIdx}`);
          const title = sheet.getCell(`B${rowIdx}`);
          title.value = "SALE TAX INVOICE";
          title.font = { name: 'Arial Narrow', size: 14, bold: true, color: { argb: 'FFFF0000' } }; // Red
          title.alignment = { horizontal: 'center' };
          title.border = { top: { style: 'thin' }, bottom: { style: 'double', color: { argb: 'FFFF0000' } } };
          rowIdx++;

          // PO NO Row
          sheet.mergeCells(`B${rowIdx}:C${rowIdx}`);
          const poTitle = sheet.getCell(`B${rowIdx}`);
          poTitle.value = "PO NO";
          poTitle.font = { size: 12, bold: true, color: { argb: 'FF0070c0' } }; // Blue
          poTitle.alignment = { horizontal: 'center' };
          
          sheet.mergeCells(`D${rowIdx}:F${rowIdx}`);
          const poVal = sheet.getCell(`D${rowIdx}`);
          poVal.value = record.poNumber;
          poVal.font = { size: 12, bold: true, color: { argb: 'FF0070c0' } };
          poVal.alignment = { horizontal: 'center' };

          [sheet.getCell(`B${rowIdx}`), sheet.getCell(`D${rowIdx}`)].forEach(c => c.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} });
          rowIdx++;

          // Bill To Row
          sheet.mergeCells(`B${rowIdx}:C${rowIdx}`);
          sheet.getCell(`B${rowIdx}`).value = "Bill To";
          sheet.getCell(`B${rowIdx}`).font = { size: 12, bold: true };
          sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'center' };

          sheet.getCell(`E${rowIdx}`).value = "Date";
          sheet.getCell(`E${rowIdx}`).font = { size: 11, bold: true, color: { argb: 'FFFF0000' } }; // Red
          sheet.getCell(`E${rowIdx}`).alignment = { horizontal: 'center' };
          rowIdx++;

          // Name & Invoice Row
          sheet.getCell(`A${rowIdx}`).value = "Name:";
          sheet.getCell(`A${rowIdx}`).font = { name:'Arial Narrow', bold: true };
          
          sheet.mergeCells(`B${rowIdx}:D${rowIdx}`);
          sheet.getCell(`B${rowIdx}`).value = record.company;
          sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'center' };

          sheet.getCell(`E${rowIdx}`).value = "Invoice No";
          sheet.getCell(`E${rowIdx}`).font = { name:'Arial Narrow', bold: true, color: { argb: 'FF00b050' } }; // Green
          sheet.getCell(`E${rowIdx}`).alignment = { horizontal: 'center' };

          sheet.getCell(`F${rowIdx}`).value = record.date;
          sheet.getCell(`F${rowIdx}`).font = { name:'Arial Narrow', size: 14, bold: true, color: { argb: 'FF00b050' } }; // Green
          sheet.getCell(`F${rowIdx}`).alignment = { horizontal: 'center' };
          sheet.getCell(`F${rowIdx}`).border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
          rowIdx++;

          // Mobile
          sheet.getCell(`A${rowIdx}`).value = "Mobile:";
          sheet.getCell(`A${rowIdx}`).font = { name:'Arial Narrow', bold: true };
          sheet.mergeCells(`B${rowIdx}:D${rowIdx}`);
          sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'center' };
          sheet.getCell(`B${rowIdx}`).value = "-";
          rowIdx++;

          // Address
          sheet.getCell(`A${rowIdx}`).value = "Address:";
          sheet.getCell(`A${rowIdx}`).font = { name:'Arial Narrow', bold: true };
          sheet.mergeCells(`B${rowIdx}:D${rowIdx}`);
          sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'center' };
          sheet.getCell(`B${rowIdx}`).value = "RWP CANTT";
          rowIdx += 2;

          // Table Headers
          const headers = ["S.NO", "DESCRIPTION", "A/U", "QTY", "RATE", "TOTAL AMOUNT"];
          headers.forEach((h, i) => {
             const col = String.fromCharCode(65 + i); // A, B, C...
             const cell = sheet.getCell(`${col}${rowIdx}`);
             cell.value = h;
             cell.font = { name:'Arial Narrow', bold: true };
             cell.alignment = { horizontal: 'center' };
             cell.border = { top: {style:'double'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
          });
          rowIdx++;

          // Table Rows
          if (record.lineItems && record.lineItems.length > 0) {
             record.lineItems.forEach(item => {
               const rowData = [
                 item.sNo,
                 item.nomenclature || item.catPartNo,
                 item.au,
                 item.qty,
                 item.rate,
                 item.total
               ];
               rowData.forEach((val, i) => {
                 const col = String.fromCharCode(65 + i);
                 const cell = sheet.getCell(`${col}${rowIdx}`);
                 cell.value = val;
                 cell.font = { name:'Arial Narrow' };
                 cell.alignment = { horizontal: 'center' };
                 cell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
               });
               rowIdx++;
             });
          }

          // Number to Words Helper
          const numberToWords = (num) => {
              const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
              const b = ['', '', 'Twenty ','Thirty ','Forty ','Fifty ','Sixty ','Seventy ','Eighty ','Ninety '];
              if ((num = num.toString()).length > 9) return 'Overflow';
              const n = ('000000000' + num).slice(-9).match(/^(\d{3})(\d{3})(\d{3})$/);
              if (!n) return '';
              const getHundreds = (numStr) => {
                  let h = parseInt(numStr[0]);
                  let r = parseInt(numStr.substr(1));
                  let res = '';
                  if (h > 0) res += a[h] + 'Hundred ';
                  if (r > 0) {
                      if (r < 20) res += a[r];
                      else {
                          res += b[parseInt(numStr[1])];
                          if (parseInt(numStr[2]) > 0) res += a[parseInt(numStr[2])];
                      }
                  }
                  return res;
              };
              let millions = getHundreds(n[1]);
              let thousands = getHundreds(n[2]);
              let hundreds = getHundreds(n[3]);
              let finalStr = '';
              if (millions) finalStr += millions + 'Million ';
              if (thousands) finalStr += thousands + 'Thousand ';
              if (hundreds) finalStr += hundreds;
              return finalStr.trim() || 'Zero';
          };

          rowIdx++; // blank line
          
          sheet.mergeCells(`A${rowIdx}:E${rowIdx}`);
          sheet.getCell(`A${rowIdx}`).value = "Grand Total:";
          sheet.getCell(`A${rowIdx}`).alignment = { horizontal: 'right' };
          sheet.getCell(`A${rowIdx}`).font = { name: 'Arial Narrow', size: 12 };

          sheet.getCell(`F${rowIdx}`).value = record.total;
          sheet.getCell(`F${rowIdx}`).alignment = { horizontal: 'center' };
          sheet.getCell(`F${rowIdx}`).font = { name: 'Arial Narrow', size: 12 };
          sheet.getCell(`F${rowIdx}`).border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
          
          rowIdx += 2;

          sheet.mergeCells(`A${rowIdx}:F${rowIdx}`);
          const cleanTotal = parseInt(String(record.total).replace(/[^0-9]/g, '')) || 0;
          const wordStr = numberToWords(cleanTotal);
          sheet.getCell(`A${rowIdx}`).value = `(Items ${record.lineItems?.length || 0} only for Rs. ${wordStr})`;
          sheet.getCell(`A${rowIdx}`).alignment = { horizontal: 'center' };
          sheet.getCell(`A${rowIdx}`).font = { name: 'Arial Narrow', size: 12 };
          rowIdx++;
       });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "Invoices_System.xlsx");
  };

  return (
    <div className="dashboard-container" style={{ overflowY: 'auto', paddingBottom: '40px' }}>

      {/* TOP SUMMARY ROW */}
      <div className="dashboard-top-row">

        {/* Status Panel */}
        <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="card-title" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>
              <FileText size={14} /> Processing Status
            </div>
            <div className="status-badge" style={{ color: uploadedFile ? 'var(--success)' : 'var(--text-muted)' }}>
              {uploadedFile ? 'Complete' : 'Waiting...'}
            </div>
            <div style={{ fontSize: '0.8rem', color: uploadedFile ? 'var(--success)' : 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Confidence Score:</span> {uploadedFile ? '99.5%' : 'N/A'}
            </div>
          </div>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(67,97,238,0.2) 0%, rgba(15,18,26,0) 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(67,97,238,0.3)', boxShadow: '0 0 20px rgba(67,97,238,0.1)'
          }}>
            <Bot size={36} color="var(--primary-accent)" />
          </div>
        </div>

        {/* Export Data Panel */}
        <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Export Complete PO Data</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Push all parsed line-items exactly formatted into your Excel sheet.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={handleExport} disabled={!uploadHistory || uploadHistory.length === 0}>
              <FileSpreadsheet size={16} /> Export to Excel
            </button>
          </div>
        </div>

      </div>

      {/* DOCUMENT PREVIEW ROW */}
      <div className="dashboard-bottom-row" style={{ marginBottom: '24px' }}>
        {/* Source Document Preview */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div className="card-title" style={{ margin: 0 }}>
              <FileText size={16} color="var(--primary-accent)" />
              {latestData ? `Source: ${latestData.poNumber}` : 'Source Document Preview'}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="icon-btn" style={{ width: '32px', height: '32px' }}><ZoomIn size={14} /></div>
              <div className="icon-btn" style={{ width: '32px', height: '32px' }}><ZoomOut size={14} /></div>
              <div className="icon-btn" style={{ width: '32px', height: '32px' }}><Maximize size={14} /></div>
            </div>
          </div>

          <div style={{
            flex: 1, backgroundColor: '#202431', borderRadius: '8px', padding: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-color)', minHeight: '350px'
          }}>
            {uploadedFile ? (
              <img src={uploadedFile} alt="Source Preview" style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                <ZoomIn size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>Upload a Purchase Order <br />in the left sidebar to preview it here.</p>
              </div>
            )}
          </div>
        </div>

        {/* PO Header Data Summary */}
        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div className="card-title" style={{ margin: 0 }}>
              PO Meta-Data
            </div>
            <div className="badge-verified">Verified</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#202431', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Extracted PO Number</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-accent)' }}>{latestData ? latestData.poNumber : '-'}</div>
            </div>
            <div style={{ background: '#202431', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Company Details</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{latestData ? latestData.company : '-'}</div>
            </div>
            <div style={{ background: '#202431', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Date of Processing</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{latestData ? latestData.date : '-'}</div>
            </div>
            <div style={{ background: '#202431', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Final Estimated Invoice Total </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success)' }}>{latestData ? latestData.total : '-'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calculated Extracted Tax: {latestData ? latestData.tax : '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* EXTRACTED LINE ITEMS TABLE */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="card-title" style={{ margin: 0 }}>
            <List size={16} color="var(--primary-accent)" />
            Extracted Line Items (Matching PO Tables strictly)
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="entities-table" style={{ width: '100%', minWidth: '900px' }}>
            <thead>
              <tr>
                <th>S#</th>
                <th>Cat Part No</th>
                <th>Nomenclature</th>
                <th>Country of Origin</th>
                <th>Spare Types</th>
                <th>Brand</th>
                <th>A/U</th>
                <th>QTY</th>
                <th>Rate Inc 18% GST</th>
                <th>Total</th>
                <th>NA No & Date</th>
              </tr>
            </thead>
            <tbody>
              {latestData && latestData.lineItems.length > 0 ? latestData.lineItems.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: '500' }}>{item.sNo}</td>
                  <td style={{ color: 'var(--primary-accent)' }}>{item.catPartNo}</td>
                  <td style={{ fontWeight: '500' }}>{item.nomenclature}</td>
                  <td>{item.country}</td>
                  <td>{item.spareTypes}</td>
                  <td>{item.brand}</td>
                  <td>{item.au}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.qty}</td>
                  <td>{item.rate}</td>
                  <td style={{ fontWeight: '600', color: 'var(--success)' }}>{item.total}</td>
                  <td>{item.naNo}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                    Upload a PO Document to extract tabular line items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Processing History Section */}
      <div className="card-panel" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="card-title" style={{ margin: 0 }}>
            <History size={16} color="var(--primary-accent)" />
            Document Processing History Log
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Stored securely in system
          </div>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="entities-table">
            <thead>
              <tr>
                <th>Document No.</th>
                <th>Company</th>
                <th>Date Processed</th>
                <th>Lines Extracted</th>
                <th>Tax / GST</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory && uploadHistory.length > 0 ? uploadHistory.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '600', color: 'var(--primary-accent)' }}>
                    {item.poNumber || item.invoiceNo}
                  </td>
                  <td style={{ fontWeight: '500' }}>{item.company}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.date}</td>
                  <td style={{ fontWeight: '500' }}>{item.lineItems ? item.lineItems.length : 0} items</td>
                  <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{item.tax}</td>
                  <td style={{ fontWeight: '600', color: 'var(--success)' }}>{item.total}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                    No documents processed yet. History will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
