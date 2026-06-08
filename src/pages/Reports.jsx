import React, { useState, useEffect } from 'react';
import { Download, FileText, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../api';

const Reports = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Reports');
  const [reportsData, setReportsData] = useState([]);
  
  const filters = ['All Reports', 'Helmet', 'Red Light', 'Lane'];

  useEffect(() => {
    fetch(apiUrl('/api/violations'))
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map(v => ({
          id: v._id,
          time: new Date(v.createdAt).toLocaleString(),
          frame: v.frameId.toString(),
          loc: v.location || 'Unknown',
          type: v.type.replace('_', ' '),
          conf: (v.confidence * 100).toFixed(1),
          status: v.status.toUpperCase()
        }));
        setReportsData(formattedData);
      })
      .catch(console.error);
  }, []);

  const filteredData = reportsData.filter(v => {
    if (activeFilter === 'All Reports') return true;
    if (activeFilter === 'Helmet') return v.type.includes('HELMET');
    if (activeFilter === 'Red Light') return v.type.includes('RED LIGHT');
    if (activeFilter === 'Lane') return v.type.includes('LANE') || v.type.includes('LINE') || v.type.includes('CROSSING') || v.type.includes('TURN') || v.type.includes('WRONG WAY');
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Violation Intelligence <span style={{ color: 'var(--accent-cyan)' }}>Reports</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Aggregated data streams from 144 active sensor nodes.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline"><FileText size={16} /> Export PDF</button>
          <button className="btn-primary" style={{ background: 'var(--accent-cyan)', color: '#000', boxShadow: 'none' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{ 
              padding: '0.5rem 1.25rem', 
              borderRadius: '20px', 
              fontSize: '0.9rem',
              fontWeight: 500,
              background: activeFilter === f ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
              color: activeFilter === f ? '#000' : 'var(--text-primary)',
              transition: 'all 0.2s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1.5fr 1.5fr 1fr 1fr', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>
          <div>INCIDENT ID</div>
          <div>TIMESTAMP</div>
          <div>FRAME / OFFSET</div>
          <div>LOCATION</div>
          <div>VIOLATION TYPE</div>
          <div>AI CONFIDENCE</div>
          <div>STATUS</div>
        </div>

        {/* Table body */}
        <div style={{ overflowY: 'auto' }}>
          {filteredData.map((row, i) => (
            <div key={i} onClick={() => navigate('/records/' + row.id.replace('#', ''))} style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1.5fr 1fr 1.5fr 1.5fr 1fr 1fr', 
              padding: '1.5rem', 
              borderBottom: '1px solid rgba(255,255,255,0.02)',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{row.id}</div>
              <div style={{ fontSize: '0.9rem' }}>{row.time}</div>
              <div>
                <div style={{ fontWeight: 600 }}>FRAME {row.frame}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>+00:{row.frame.slice(0,2)}.{row.frame.slice(3,5)}</div>
              </div>
              <div style={{ fontSize: '0.9rem' }}>{row.loc}</div>
              <div>
                <span style={{ 
                  background: row.type.includes('RED') || row.type.includes('WRONG') ? 'rgba(255,51,102,0.1)' : 'rgba(255,193,7,0.1)', 
                  color: row.type.includes('RED') || row.type.includes('WRONG') ? 'var(--accent-red)' : 'var(--accent-yellow)',
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'
                }}>{row.type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '50px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                  <div style={{ width: row.conf + '%', height: '100%', background: 'var(--accent-cyan)' }}></div>
                </div>
                <span style={{ fontSize: '0.85rem' }}>{row.conf}%</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: row.status === 'VALIDATED' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}></div>
                {row.status}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Reports;
