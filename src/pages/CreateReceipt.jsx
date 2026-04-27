import React, { useState } from 'react';
import { getDocuments, saveDocument } from '../services/db';
import { Save, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateReceipt = () => {
  const navigate = useNavigate();
  const [poId, setPoId] = useState('');
  const [refPo, setRefPo] = useState(null);
  
  const [receipt, setReceipt] = useState({
    id: 'GRN-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().split('T')[0],
    items: []
  });

  const loadPo = () => {
    const pos = getDocuments('pos');
    const found = pos.find(p => p.id === poId);
    if (found) {
      setRefPo(found);
      setReceipt(prev => ({
        ...prev,
        items: found.items.map(i => ({ spec: i.spec, orderedQty: i.qty, receivedQty: i.qty }))
      }));
    } else {
      alert('PO not found in Local Storage');
    }
  };

  const updateReceived = (idx, value) => {
    const newItems = [...receipt.items];
    newItems[idx].receivedQty = value;
    setReceipt({ ...receipt, items: newItems });
  };

  const handleSave = () => {
    if (!refPo) return;
    saveDocument('receipts', { ...receipt, poId: refPo.id });
    alert('Goods Receipt Note saved successfully!');
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Receive Goods (GRN)</h1>
          <p className="page-description">Match physical goods received against an existing PO</p>
        </div>
        <button className="btn" onClick={handleSave} disabled={!refPo}>
          <Save size={18} /> Save Receipt
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
            <h3 style={{ color: 'var(--primary-accent)' }}>Match Quantities</h3>
            <div className="badge badge-success"><CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Linked: {refPo.id}</div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">GRN Document Number</label>
              <input type="text" className="form-input" value={receipt.id} readOnly />
            </div>
            <div className="form-col">
              <label className="form-label">Receipt Date</label>
              <input type="date" className="form-input" value={receipt.date} onChange={e => setReceipt({...receipt, date: e.target.value})} />
            </div>
          </div>

          <div className="table-container" style={{ marginTop: '24px' }}>
            <table>
              <thead>
                <tr>
                  <th>Item / Spec</th>
                  <th>Ordered Qty</th>
                  <th>Received Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, idx) => {
                  const diff = Number(item.receivedQty) - Number(item.orderedQty);
                  return (
                    <tr key={idx}>
                      <td>{item.spec}</td>
                      <td>{item.orderedQty}</td>
                      <td>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={item.receivedQty}
                          onChange={e => updateReceived(idx, e.target.value)}
                        />
                      </td>
                      <td>
                        {diff === 0 && <span style={{ color: 'var(--success)' }}>Matched</span>}
                        {diff < 0 && <span style={{ color: 'var(--warning)' }}>Short ({diff})</span>}
                        {diff > 0 && <span style={{ color: 'var(--danger)' }}>Over ({diff})</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateReceipt;
