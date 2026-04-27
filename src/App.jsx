import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  BarChart2, 
  Search, 
  CloudUpload,
  LogOut,
  Zap,
  Bell,
  MessageSquare,
  Calendar,
  Camera,
  Plus,
  Package,
  FileText
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import CreatePO from './pages/CreatePO';
import CreateReceipt from './pages/CreateReceipt';
import CreateInvoice from './pages/CreateInvoice';
import SearchDocs from './pages/SearchDocs';

function App() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dpInputRef = useRef(null);

  // States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Login Handler
  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  // Upload handlers
  const triggerUpload = () => {
    if(fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileURL = URL.createObjectURL(file);

      // Check API Key
      if (!apiKey) {
         alert("Please paste your Google AI Key in the sidebar box before uploading! This is required to read real pictures.");
         if (fileInputRef.current) fileInputRef.current.value = "";
         return;
      }
      let currentKey = apiKey;

      setIsAnalyzing(true);
      
      try {
        const { processImageWithGemini } = await import('./services/ai.js');
        const extractedData = await processImageWithGemini(file, currentKey);

        if (extractedData.isInvoice === false) {
          alert(`UPLOAD REJECTED!\n\nAI Reason: ${extractedData.error}`);
          setIsAnalyzing(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        const targetPoNumber = extractedData.poNumber || "Unknown PO";

        // Check for duplicate PO
        const isDuplicate = uploadHistory.some(item => item.poNumber === targetPoNumber);

        if (isDuplicate && targetPoNumber !== "Unknown PO") {
          alert(`Upload Blocked: The Purchase Order Number ${targetPoNumber} has already been uploaded into the system.`);
          setIsAnalyzing(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        setUploadedFile(fileURL);
        
        // Add to history
        const newItem = {
          id: Date.now(),
          poNumber: targetPoNumber,
          date: extractedData.date || "Unknown",
          company: extractedData.company || "Unknown Company",
          lineItems: extractedData.lineItems || [],
          tax: extractedData.tax || "0",
          total: extractedData.total || "0"
        };
        
        setUploadHistory(prev => [newItem, ...prev]);
        navigate('/');
      } catch (error) {
        console.error(error);
        if (error?.message?.includes('invalid') || error?.message?.includes('API key not valid') || error?.message?.includes('API Key is invalid')) {
           setApiKey('');
           localStorage.removeItem('gemini_api_key');
           alert("Your API Key was invalid, so I removed it! The red box has reappeared on the left sidebar. Please grab a NEW key, paste it carefully, and try uploading again.");
        } else {
           alert("Failed to process image. Details: " + error.message);
        }
      } finally {
        setIsAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  // DP Handlers
  const triggerDpUpload = () => {
    if (dpInputRef.current) dpInputRef.current.click();
  };

  const handleDpChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileURL = URL.createObjectURL(e.target.files[0]);
      setAvatarUrl(fileURL);
    }
  };

  if (!isAuthenticated) {
    return <SignIn onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar - InvoAI Style */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ borderBottom: 'none' }}>
          <div style={{ background: 'var(--primary-accent)', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>Ansar Sial & Son's</span>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Briefcase size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/create-po" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Plus size={18} />
            Create PO
          </NavLink>
          <NavLink to="/create-receipt" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Package size={18} />
            Receive Goods
          </NavLink>
          <NavLink to="/create-invoice" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} />
            Process Invoice
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Search size={18} />
            Search Docs
          </NavLink>

          <div className="sidebar-upload-section" style={{ marginTop: 'auto' }}>
            {!apiKey && (
              <div style={{ padding: '12px', background: 'rgba(255, 60, 60, 0.1)', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255, 60, 60, 0.3)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Google AI Key Required</div>
                <input 
                  type="password" 
                  placeholder="Paste AI Key here..." 
                  onChange={(e) => { 
                    setApiKey(e.target.value); 
                    localStorage.setItem('gemini_api_key', e.target.value); 
                  }} 
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem', borderRadius: '4px', background: '#1a1d2d', border: '1px solid var(--border-color)', color: 'white' }} 
                />
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#ff4d4d', display: 'block', marginTop: '8px', textDecoration: 'underline' }}>Click here to get a Free Key</a>
              </div>
            )}

            <div className="sidebar-upload-title">NEW UPLOAD</div>
            <div className="sidebar-drag-zone" onClick={isAnalyzing ? null : triggerUpload} style={{ opacity: isAnalyzing ? 0.5 : 1, cursor: isAnalyzing ? 'not-allowed' : 'pointer' }}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />
              {isAnalyzing ? (
                 <div style={{ padding: '20px 0'}}>
                   <Zap size={32} color="var(--primary-accent)" style={{ marginBottom: '12px', animation: 'pulse 1.5s infinite' }} />
                   <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--primary-accent)' }}>AI Scanning...</div>
                 </div>
              ) : (
                 <>
                   <CloudUpload size={32} color="var(--primary-accent)" style={{ marginBottom: '12px' }} />
                   <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>
                     Upload Document
                   </div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                     Supports: PDF, JPG, PNG
                   </div>
                 </>
              )}
            </div>
          </div>
        </nav>

        <div style={{ padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
          <div className="nav-item" onClick={() => setIsAuthenticated(false)} style={{ cursor: 'pointer' }}>
            <LogOut size={18} />
            Logout
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <h1>Document Processing Dashboard</h1>
            <div className="topbar-subtitle">AI-powered PO extraction and validation</div>
          </div>
          <div className="topbar-actions">
            <div className="icon-btn"><Calendar size={18} /></div>
            <div className="icon-btn"><MessageSquare size={18} /></div>
            <div className="icon-btn"><Bell size={18} /></div>

            {/* Profile Avatar Upload Component */}
            <div
              className="profile-avatar"
              onClick={triggerDpUpload}
              title="Change Profile Picture"
              style={{
                cursor: 'pointer',
                backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <input
                type="file"
                ref={dpInputRef}
                style={{ display: 'none' }}
                onChange={handleDpChange}
                accept="image/*"
              />
              {!avatarUrl && <Camera size={14} color="var(--text-muted)" style={{ opacity: 0.5 }} />}
              <div className="avatar-overlay" style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                color: 'white'
              }}>
                <Camera size={16} />
              </div>
            </div>
            <style>{`
                .profile-avatar:hover .avatar-overlay { opacity: 1 !important; }
             `}</style>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard uploadedFile={uploadedFile} uploadHistory={uploadHistory} />} />
          <Route path="/create-po" element={<CreatePO />} />
          <Route path="/create-receipt" element={<CreateReceipt />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/search" element={<SearchDocs />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
