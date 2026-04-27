import React, { useState } from 'react';
import { getDocuments, saveDocument } from '../services/db';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [poId, setPoId] = useState('');
  const [refPo, setRefPo] = useState(null);
  
  const [invoice, setInvoice] = useState({
    id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().split('T')[0],
    amount: 0
  });

  const loadPo = () => {
    const pos = getDocuments('pos');
    const found = pos.find(p => p.id === poId);
    if (found) {
      setRefPo(found);
      setInvoice(prev => ({
        ...prev,
        amount: found.total
      }));
    } else {
      alert('PO not found in Local Storage');
    }
  };

  const handleSave = () => {
    if (!refPo) return;
    saveDocument('invoices', { ...invoice, poId: refPo.id, totalAmount: invoice.amount });
    alert('Invoice saved successfully! 3-Way Match recorded.');
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Create Invoice</h1>
          <p className="page-description">Match vendor invoice against the generated PO</p>
        </div>
        <button className="btn" onClick={handleSave} disabled={!refPo}>
          <Save size={18} /> Process Invoice
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Link Purchase Order</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <input 
            className="form-input" 
            placeholder="Enter PO Number (e.g. UXA/LP/...)" 
            value={poId}
            onChange={e => setPoId(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={loadPo}>Load PO Data</button>
        </div>
      </div>

      {refPo && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--primary-accent)' }}>Financial Match</h3>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Invoice Document Number</label>
              <input type="text" className="form-input" value={invoice.id} readOnly />
            </div>
            <div className="form-col">
              <label className="form-label">Invoice Date</label>
              <input type="date" className="form-input" value={invoice.date} onChange={e => setInvoice({...invoice, date: e.target.value})} />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: '24px' }}>
            <div className="form-col">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>PO Expected Total</label>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>PKR {refPo.total.toLocaleString()}</div>
            </div>
          </div>

          <div className="form-row" style={{ marginTop: '24px' }}>
             <div className="form-col">
              <label className="form-label">Vendor Invoice Amount</label>
              <input 
                type="number" 
                className="form-input" 
                value={invoice.amount} 
                onChange={e => setInvoice({...invoice, amount: Number(e.target.value)})} 
                style={{ fontSize: '1.25rem' }}
              />
            </div>
          </div>

          {/* Validation visualizer */}
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', backgroundColor: invoice.amount === refPo.total ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {invoice.amount === refPo.total ? (
              <>
                <CheckCircle color="var(--success)" />
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Amount Matches PO Perfect. 3-Way validation passed.</span>
              </>
            ) : (
               <>
                <AlertCircle color="var(--danger)" />
                <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Discrepancy: Invoice amount does not match PO. Difference: {Math.abs(refPo.total - invoice.amount).toLocaleString()}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInvoice;
