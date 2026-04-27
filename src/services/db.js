export const getDocuments = (type) => {
  try {
    return JSON.parse(localStorage.getItem(type) || '[]');
  } catch(e) {
    return [];
  }
};

export const saveDocument = (type, doc) => {
  const docs = getDocuments(type);
  // Prevent exact duplicates if saving same ID
  const existing = docs.findIndex(d => d.id === doc.id);
  if (existing >= 0) {
    docs[existing] = doc;
  } else {
    docs.push(doc);
  }
  localStorage.setItem(type, JSON.stringify(docs));
};

export const saveBulkDocuments = (type, newDocs) => {
  const docs = getDocuments(type);
  
  newDocs.forEach(doc => {
    const existing = docs.findIndex(d => d.id === doc.id);
    if (existing >= 0) {
      docs[existing] = doc;
    } else {
      docs.push(doc);
    }
  });
  
  localStorage.setItem(type, JSON.stringify(docs));
};

export const searchDocument = (query) => {
  if (!query) return null;
  const q = query.toLowerCase();
  
  const pos = getDocuments('pos').filter(d => d.id.toLowerCase().includes(q));
  const receipts = getDocuments('receipts').filter(d => d.id.toLowerCase().includes(q) || d.poId.toLowerCase().includes(q));
  const invoices = getDocuments('invoices').filter(d => d.id.toLowerCase().includes(q) || d.poId.toLowerCase().includes(q));
  
  return { pos, receipts, invoices };
};
