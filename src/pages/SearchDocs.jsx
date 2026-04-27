import React, { useState, useEffect } from 'react';
import { getDocuments, saveDocument } from '../services/db';
import { Save, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SearchDocs = () => {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState(null);

  const performSearch = () => {
    if (!query) return;
    const pos = getDocuments('pos').filter(d => d.id.toLowerCase().includes(query.toLowerCase()));
    const receipts = getDocuments('receipts').filter(d => d.id.toLowerCase().includes(query.toLowerCase()) || d.poId.includes(query));
    const invoices = getDocuments('invoices').filter(d => d.id.toLowerCase().includes(query.toLowerCase()) || d.poId.includes(query));
    
    setResults({ pos, receipts, invoices });
  };

  useEffect(() => {
    if (q) {
      performSearch();
    }
  }, [q]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Search Documents</h1>
        <p className="page-description">Find Purchase Orders, Receipts, or Invoices by number</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '16px' }}>
          <input 
            className="form-input" 
            placeholder="Enter PO or Invoice Number (e.g. 15901)" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && performSearch()}
          />
          <button className="btn" onClick={performSearch}><Search size={18} /> Search</button>
        </div>
      </div>

      {results && (
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Search Results</h3>
          
          <div style={{ marginBottom: '24px' }}>
             <h4 style={{ color: 'var(--primary-accent)' }}>Purchase Orders ({results.pos.length})</h4>
             {results.pos.map(po => (
               <div key={po.id} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '8px' }}>
                 <strong>{po.id}</strong> - {po.vendor} - Total: PKR {po.total.toLocaleString()} - {po.date}
               </div>
             ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
             <h4 style={{ color: 'var(--success)' }}>Receipts ({results.receipts.length})</h4>
             {results.receipts.map(rec => (
               <div key={rec.id} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '8px' }}>
                 <strong>{rec.id}</strong> - Ref PO: {rec.poId} - Received Date: {rec.date}
               </div>
             ))}
          </div>

          <div>
             <h4 style={{ color: 'var(--warning)' }}>Invoices ({results.invoices.length})</h4>
             {results.invoices.map(inv => (
               <div key={inv.id} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '8px' }}>
                 <strong>{inv.id}</strong> - Ref PO: {inv.poId} - Total: PKR {inv.totalAmount.toLocaleString()}
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDocs;
