import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Video, Database, BarChart3, Settings, LogOut, Search, Bell, Shield } from 'lucide-react';
import ViolationPopup from './ViolationPopup';
import SystemHealthPopup from './SystemHealthPopup';



const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Shield className="action-icon" size={28} color="#00e5ff" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="brand-title">THE KINETIC OVERSIGHT</span>
        </div>
      </div>

      <div style={{ margin: '0 1.5rem 2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#00e5ff22', padding: '0.5rem', borderRadius: '6px' }}>
            <Shield size={20} color="#00e5ff" />
          </div>
          <div>
            <div style={{ color: '#00e5ff', fontSize: '1rem', fontWeight: '600' }}>Analyst-01</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>FORENSIC SUITE</div>
          </div>
        </div>
      </div>

      <nav className="nav-menu">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Video size={20} />
          Video Analysis
        </NavLink>
        <NavLink to="/records" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Database size={20} />
          Records
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={20} />
          Reports
        </NavLink>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className="btn-primary" onClick={() => navigate('/analysis')} style={{ margin: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            + Import Footage
          </button>
          
          <div className="nav-item">
            <Settings size={20} />
            Preferences
          </div>
          <div className="nav-item" style={{ color: 'var(--text-muted)' }}>
            <LogOut size={20} />
            Logout
          </div>
        </div>
      </nav>
    </div>
  );
};

const Header = () => {
  return (
    <header className="top-header">
      <div className="search-bar">
        <Search size={18} color="var(--text-muted)" />
        <input type="text" placeholder="Search event ID..." />
      </div>

      <div className="header-actions">
        <Bell className="action-icon" size={20} />
        <Settings className="action-icon" size={20} />
        <div className="user-profile">
          <div className="avatar">
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>
              CG
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Layout = () => {
  return (
    <div className="app-container">
      <ViolationPopup />
      <SystemHealthPopup />
      <Sidebar />


      <div className="main-content">
        <Header />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
