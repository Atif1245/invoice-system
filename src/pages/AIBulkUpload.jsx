import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, FileSpreadsheet, XCircle, Loader2 } from 'lucide-react';
import { saveBulkDocuments, getDocuments } from '../services/db';

export default function AIBulkUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, processing, done
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  
  const [exportInput, setExportInput] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  const inputRef = useRef(null);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(droppedFiles);
      startAIProcessing(droppedFiles.length);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      startAIProcessing(selectedFiles.length);
    }
  };

  const startAIProcessing = (count) => {
    setStatus('processing');
    setProgress(0);
    
    // Simulate AI extraction over a few seconds
    const totalSteps = 20;
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      setProgress(Math.floor((step / totalSteps) * 100));
      
      if (step >= totalSteps) {
        clearInterval(interval);
        generateMockResults(count);
      }
    }, 150); // total 3 seconds
  };

  const generateMockResults = (count) => {
    const newInvoices = [];
    // Start generating from some random number or base
    const baseNum = 1520; 
    
    for(let i=0; i<count; i++) {
        const invNum = `${baseNum + i}`;
        const randomAmount = Math.floor(Math.random() * 10000) + 500;
        
        newInvoices.push({
            id: invNum,
            poId: `PO-${invNum}`,
            invoiceAmount: randomAmount,
            status: 'AI_EXTRACTED',
            date: new Date().toLocaleDateString(),
            vendor: 'Bulk Upload Vendor M/S'
        });
    }
    
    setResults(newInvoices);
    saveBulkDocuments('invoices', newInvoices);
    setStatus('done');
  };

  const exportSingleInvoiceToCSV = () => {
    setExportMessage('');
    if (!exportInput.trim()) {
        setExportMessage('Please enter an invoice number first.');
        return;
    }

    const allInvoices = getDocuments('invoices');
    const targetInvoice = allInvoices.find(inv => inv.id.toString() === exportInput.trim());

    if (!targetInvoice) {
        setExportMessage(`❌ Invoice ${exportInput} not found in database.`);
        return;
    }

    // Prepare CSV data
    const headers = ['Invoice Number', 'Associated PO', 'Amount', 'Date', 'Vendor', 'Status'];
    const row = [
        targetInvoice.id, 
        targetInvoice.poId || 'N/A', 
        targetInvoice.invoiceAmount || '0', 
        targetInvoice.date || new Date().toLocaleDateString(), 
        targetInvoice.vendor || 'Unknown', 
        targetInvoice.status || 'Verified'
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + row.join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Invoice_${targetInvoice.id}.csv`);
    document.body.appendChild(link); // Required for FF
    
    link.click();
    document.body.removeChild(link);
    
    setExportMessage(`✅ Successfully downloaded Invoice ${targetInvoice.id}`);
    setExportInput('');
  };

  return (
    <div className="page-container" style={{maxWidth: '900px'}}>
      
      <div className="card shadow-sm" style={{marginBottom: '2rem'}}>
        <h2>AI Bulk Document Grafting</h2>
        <p className="text-secondary" style={{marginBottom: '1rem'}}>
          Drag and drop multiple raw invoice image files here. Our simulated AI layer will instantly extract PO & Invoice Numbers to your Central Database.
        </p>

        {status === 'idle' && (
            <div 
                className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: "none" }}
                />
                <UploadCloud size={48} className="text-primary" style={{marginBottom: '1rem'}} />
                <h3>Drop files here or click to upload</h3>
                <p className="text-secondary mt-1">Accepts images natively (e.g. up to 1000 files)</p>
            </div>
        )}

        {status === 'processing' && (
            <div className="processing-zone" style={{textAlign: 'center', padding: '3rem 1rem'}}>
                <Loader2 size={48} className="spin text-primary" style={{marginBottom: '1rem', display: 'inline-block'}} />
                <h3>AI extraction in progress...</h3>
                <p className="text-secondary mt-1">Reading {files.length} documents mapping visual layout fields.</p>
                
                <div style={{width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', marginTop: '2rem', overflow: 'hidden'}}>
                    <div style={{height: '100%', width: `${progress}%`, background: 'var(--primary-accent)', transition: 'width 0.2s ease'}}></div>
                </div>
                <div style={{marginTop: '0.5rem', fontWeight: 'bold'}}>{progress}% Complete</div>
            </div>
        )}

        {status === 'done' && (
            <div className="success-zone" style={{textAlign: 'center', padding: '2rem 1rem'}}>
                <CheckCircle size={48} className="text-success" style={{marginBottom: '1rem', display: 'inline-block'}} />
                <h3 className="text-success">Extraction Complete!</h3>
                <p className="text-secondary mt-1">Successfully parsed {results.length} invoices into the central database.</p>
                <button 
                  className="btn btn-outline mt-3" 
                  onClick={() => {
                        setStatus('idle');
                        setFiles([]);
                        setResults([]);
                  }}
                >
                    Upload Another Batch
                </button>
            </div>
        )}
      </div>

      <div className="card shadow-sm">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem'}}>
            <h2>Central Invoice Database (AI History)</h2>
            
            <div className="export-controls" style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter Invoice # (e.g. 1520)"
                    value={exportInput}
                    onChange={(e) => setExportInput(e.target.value)}
                    style={{width: '200px'}}
                />
                <button className="btn btn-primary" onClick={exportSingleInvoiceToCSV} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <FileSpreadsheet size={18} />
                    Export Sheet
                </button>
            </div>
        </div>

        {exportMessage && (
            <div className={`badge ${exportMessage.includes('✅') ? 'badge-success' : 'badge-danger'}`} style={{marginBottom: '1rem', fontSize: '14px', padding: '0.5rem'}}>
                {exportMessage}
            </div>
        )}

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>PO # Match</th>
                <th>Amount</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {getDocuments('invoices').length === 0 ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No AI invoices extracted yet.</td></tr>
              ) : (
                getDocuments('invoices').reverse().slice(0, 100).map((inv, idx) => (
                    <tr key={idx}>
                        <td style={{fontWeight: 'bold'}}>{inv.id}</td>
                        <td>{inv.poId}</td>
                        <td>Rs. {inv.invoiceAmount?.toLocaleString() || '0'}</td>
                        <td>{inv.vendor || 'Unknown'}</td>
                        <td>{inv.date}</td>
                        <td>
                            <div className="badge badge-success">AI Extracted</div>
                        </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
          <p className="text-secondary" style={{fontSize: '12px', marginTop: '0.5rem', textAlign: 'right'}}>Showing up to latest 100 records locally</p>
        </div>
      </div>
    </div>
  );
}
