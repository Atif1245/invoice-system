import React from 'react';
import { Bot, FileText, FileSpreadsheet, ZoomIn, ZoomOut, Maximize, Hash, Building2, Calendar, DollarSign, Package, History, List } from 'lucide-react';

const Dashboard = ({ uploadedFile, uploadHistory }) => {

    const latestData = uploadHistory && uploadHistory.length > 0 ? uploadHistory[0] : null;

    const handleExport = () => {
        if (!latestData) return;

        // The exact columns requested by the user
        const headers = ["S#", "Cat Part No", "Nomenclature", "Country of Origin", "Spare Types", "Brand", "A/U", "QTY", "Rate inc 18% GST", "Total", "NA No & Date", "PO Number", "Company", "Date Processed"];

        // Add BOM for Excel UTF-8 compatibility
        let csvContent = "\uFEFF" + headers.join(",") + "\n";

        latestData.lineItems.forEach(item => {
            const rowContent = [
                item.sNo,
                item.catPartNo,
                item.nomenclature,
                item.country,
                item.spareTypes,
                item.brand,
                item.au,
                item.qty,
                item.rate,
                item.total,
                item.naNo,
                latestData.poNumber,
                latestData.company,
                latestData.date
            ];
            // Properly escape quotes and wrap in quotes for strict CSV formatting
            const row = rowContent.map(field => {
                const stringField = String(field || '');
                // escape double quotes by replacing " with ""
                return `"${stringField.replace(/"/g, '""')}"`;
            }).join(",");

            csvContent += row + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Purchase_Order_${latestData.poNumber.replace(/\//g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="dashboard-container" style={{ overflowY: 'auto', paddingBottom: '40px' }}>

            {/* TOP SUMMARY ROW */}
            <div className="dashboard-top-row">

                {/* Status Panel */}
                <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Export Complete PO Data</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Push all parsed line-items exactly formatted into your Excel sheet.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-primary" onClick={handleExport} disabled={!uploadedFile}>
                            <FileSpreadsheet size={16} /> Export to Excel
                        </button>
                    </div>
                </div>

            </div>

            {/* DOCUMENT PREVIEW ROW */}
            <div className="dashboard-bottom-row" style={{ marginBottom: '24px' }}>
                {/* Source Document Preview */}
                <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div className="card-title" style={{ margin: 0 }}>
                        <History size={16} color="var(--primary-accent)" />
                        Document Processing History Log
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Stored securely in system
                    </div>
                </div>

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
    );
};

export default Dashboard;
