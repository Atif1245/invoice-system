import React, { useState } from 'react';
import { saveDocument } from '../services/db';
import { Save, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreatePO = () => {
  const navigate = useNavigate();
  const [po, setPo] = useState({
    id: 'UXA/LP/25-26/' + Math.floor(10000 + Math.random() * 90000),
    date: new Date().toISOString().split('T')[0],
    vendor: 'M/S World Tech Support (301)',
    origin: 'Pakistan',
    items: [
      { spec: 'HEADLAMP ASSEMBLY FRONT LIGHTING', qty: 290, rate: 1688 }
    ],
    taxRate: 18,
    status: 'Open'
  });

  const addItem = () => {
    setPo(prev => ({
      ...prev,
      items: [...prev.items, { spec: '', qty: 1, rate: 0 }]
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...po.items];
    newItems[index][field] = value;
    setPo({ ...po, items: newItems });
  };

  // Calculations
  const subTotal = po.items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.rate)), 0);
  const taxAmount = (subTotal * Number(po.taxRate)) / 100;
  const grandTotal = subTotal + taxAmount;

  const handleSave = () => {
    saveDocument('pos', { ...po, total: grandTotal });
    alert('Purchase Order successfully saved to Local Storage!');
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Create Purchase Order</h1>
          <p className="page-description">Generate a new Local Purchase Order</p>
        </div>
        <button className="btn" onClick={handleSave}>
          <Save size={18} /> Save Document
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px', color: 'var(--primary-accent)' }}>Document Details</h3>
        <div className="form-row">
          <div className="form-col">
            <label className="form-label">Document Number</label>
            <input
              type="text"
              className="form-input"
              value={po.id}
              onChange={e => setPo({ ...po, id: e.target.value })}
            />
          </div>
          <div className="form-col">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={po.date}
              onChange={e => setPo({ ...po, date: e.target.value })}
            />
          </div>
        </div>
        <div className="form-row" style={{ marginTop: '16px' }}>
          <div className="form-col">
            <label className="form-label">Vendor</label>
            <input
              type="text"
              className="form-input"
              value={po.vendor}
              onChange={e => setPo({ ...po, vendor: e.target.value })}
            />
          </div>
          <div className="form-col">
            <label className="form-label">Country of Origin</label>
            <input
              type="text"
              className="form-input"
              value={po.origin}
              onChange={e => setPo({ ...po, origin: e.target.value })}
            />
          </div>
          <div className="form-col">
            <label className="form-label">Sales Tax % (GST)</label>
            <input
              type="number"
              className="form-input"
              value={po.taxRate}
              onChange={e => setPo({ ...po, taxRate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: 'var(--primary-accent)' }}>Line Items</h3>
          <button className="btn btn-secondary" onClick={addItem}>
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nomenclature / Spec</th>
                <th>QTY</th>
                <th>Rate (Unit)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      className="form-input"
                      value={item.spec}
                      onChange={e => updateItem(idx, 'spec', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      value={item.qty}
                      onChange={e => updateItem(idx, 'qty', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      value={item.rate}
                      onChange={e => updateItem(idx, 'rate', e.target.value)}
                    />
                  </td>
                  <td>
                    {(Number(item.qty) * Number(item.rate)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="summary-box">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{subTotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>GST ({po.taxRate}%)</span>
            <span>{taxAmount.toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>Grand Total</span>
            <span>PKR {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePO;
