import React, { useState } from 'react';
import { Calendar as CalendarIcon, Mail, Phone, Lock, User, ArrowRight } from 'lucide-react';

const SignIn = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(email && password) {
      onLogin();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color)',
      color: 'var(--text-primary)',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Brand Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(15, 18, 26, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(67, 97, 238, 0.2)',
        zIndex: 10
      }}>
        <h1 style={{ 
            fontFamily: '"Playfair Display", "Georgia", serif',
            fontStyle: 'italic',
            fontSize: '2.2rem',
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(90deg, #ffffff, #88a4ff, var(--primary-accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1px',
            textShadow: '0 4px 12px rgba(67, 97, 238, 0.3)'
        }}>
            Sial Invoice System
        </h1>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--panel-bg)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        marginTop: '60px'
      }}>
        {/* Top Calendar Widget Simulation / Header */}
        <div style={{
            background: 'linear-gradient(135deg, var(--primary-accent), #2b45a0)',
            padding: '40px 20px',
            textAlign: 'center',
            position: 'relative'
        }}>
            <CalendarIcon size={56} color="white" style={{marginBottom: '20px', opacity: 0.95}} />
            <h2 style={{color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: 'bold'}}>Ansar Sial & Son's</h2>
            <p style={{color: 'rgba(255,255,255,0.8)', marginTop: '8px'}}>Invoice Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '40px 32px' }}>
          <div style={{ marginBottom: '30px' }}>
             <h3 style={{fontSize: '1.5rem', marginBottom: '8px', textAlign: 'center'}}>Account Login</h3>
             <p style={{color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.95rem'}}>Access your documents and system history</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@ansarsialsons.com" 
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  background: '#202431',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.95rem'
                }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '36px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter password" 
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  background: '#202431',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.95rem'
                }} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: '600' }}
          >
            Sign In <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
