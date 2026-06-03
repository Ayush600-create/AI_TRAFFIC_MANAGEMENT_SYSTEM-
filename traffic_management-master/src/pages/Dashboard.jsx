import React, { useState, useEffect } from 'react';
import { Activity, Zap, Video, TrafficCone, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/videos/telemetry');
        const data = await res.json();
        setTelemetry(data);
      } catch (err) {
        console.error("Failed to load telemetry", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = telemetry || {
    activeSession: 'LOADING...',
    totalFrames: 0,
    processedFrames: 0,
    violations: 0,
    inferenceSpeed: 0.0,
    droppedFrames: 0,
    systemThroughput: 0.0,
    processingLatency: 0.0,
    trafficFlowOptimization: 0.0,
    red_light: 0,
    no_helmet: 0,
    lane_drift: 0,
    timeline_chart: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  };

  const progressPct = stats.totalFrames > 0 ? (stats.processedFrames / stats.totalFrames) * 100 : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', overflowY: 'auto', paddingRight: '1rem' }}>
      
      {/* Top Banner section */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        
        {/* Active Analysis Session */}
        <div className="glass-panel" onClick={() => navigate('/analysis')} style={{ flex: 2, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--accent-cyan)' }}>
              <Video size={18} /> ACTIVE ANALYSIS SESSION
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>LIVE_PROC_V3</div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>LAST PROCESSED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.activeSession}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>TOTAL FRAMES</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalFrames}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>VIOLATIONS</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-red)' }}>{stats.violations}</div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Processing {stats.processedFrames?.toLocaleString()} / {stats.totalFrames?.toLocaleString()} frames</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{progressPct.toFixed(0)}% Completed</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>
        </div>

        {/* Efficiency */}
        <div className="glass-panel" style={{ flex: 1.2, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>
            EFFICIENCY & PERFORMANCE <Zap size={16} color="var(--accent-cyan)" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: 'auto' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>INFERENCE SPEED</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.inferenceSpeed} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>ms/f</span></div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>THROUGHPUT</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.systemThroughput} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>fps</span></div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>PROC. LATENCY</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.processingLatency} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>ms</span></div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>FLOW OPTIMIZATION</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{stats.trafficFlowOptimization}<span style={{ fontSize: '1.25rem' }}>%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Stats */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 51, 102, 0.1)', padding: '0.5rem', borderRadius: '8px' }}><TrafficCone color="var(--accent-red)" size={20} /></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>REAL-TIME</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>RED LIGHT</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.red_light}</div>
        </div>
        
        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 193, 7, 0.1)', padding: '0.5rem', borderRadius: '8px' }}><HelpCircle color="var(--accent-yellow)" size={20} /></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>TELEMETRY</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>NO HELMET</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.no_helmet}</div>
        </div>

        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '0.5rem', borderRadius: '8px' }}><ArrowRight color="var(--accent-cyan)" size={20} /></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>SENSOR</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>LANE DRIFT</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.lane_drift}</div>
        </div>

        {/* Mini Chart Area */}
        <div className="glass-panel" style={{ flex: 1.5, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
            VIOLATION DENSITY <Activity size={14} color="var(--accent-cyan)"/>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '10px' }}>
            {stats.timeline_chart.map((h, i) => (
              <div key={i} style={{ 
                flex: 1, 
                height: h + '%', 
                background: h > 60 ? 'var(--accent-red)' : 'var(--text-muted)', 
                borderRadius: '2px 2px 0 0',
                opacity: h > 60 ? 1 : 0.6
              }}></div>
            ))}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Violations vs Frames timeline</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
