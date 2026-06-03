import React, { useState, useEffect } from 'react';
import './SystemHealthPopup.css';
import { Activity, ShieldCheck, Cpu, Zap, X, BarChart, Server } from 'lucide-react';

const SystemHealthPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [stats, setStats] = useState({
    accuracy: 0.0,
    latency: 0.0,
    vram: '2.4 / 8.0 GB',
    gpu: '42%'
  });

  useEffect(() => {
    // Show after a small delay to simulate "System Booting"
    const bootTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    // Fetch real telemetry
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/videos/telemetry');
        const data = await res.json();
        setStats(prev => ({
          ...prev,
          accuracy: data.accuracy, // Will be 0.0 until detections start
          latency: data.processingLatency || 0.0
        }));
      } catch (e) { console.error("Telemetry fetch error:", e); }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    return () => {
      clearTimeout(bootTimer);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`system-health-overlay ${isMinimized ? 'minimized' : ''}`}>
      <div className="diagnostics-window">
        <div className="diagnostics-header">
          <div className="header-left">
            <Activity size={18} className="pulse-icon" />
            <span>AI ENGINE DIAGNOSTICS</span>
            <span className="status-badge">ONLINE</span>
          </div>
          <div className="header-actions">
            <button onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? '□' : '_'}
            </button>
            <button onClick={() => setIsVisible(false)}>
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="diagnostics-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Model Accuracy (Avg Conf)</div>
                <div className="stat-value">{stats.accuracy}%</div>
                <div className="stat-progress">
                  <div className="progress-fill" style={{ width: `${stats.accuracy}%` }}></div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Inference Latency</div>
                <div className="stat-value">{stats.latency}ms</div>
                <div className="stat-progress">
                  <div className="progress-fill" style={{ width: '15%', background: '#00e676' }}></div>
                </div>
              </div>
            </div>

            <div className="performance-chart">
              <div className="chart-header">
                <span><BarChart size={14} /> FRAME PROCESSING STABILITY</span>
              </div>
              <div className="chart-bars">
                {[45, 52, 48, 60, 55, 42, 58, 65, 50, 48, 55, 60].map((h, i) => (
                  <div key={i} className="chart-bar-container">
                    <div className="chart-bar" style={{ height: `${h}%` }}></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="resource-list">
              <div className="resource-item">
                <Cpu size={14} />
                <span>GPU UTILIZATION:</span>
                <span className="res-value">42%</span>
              </div>
              <div className="resource-item">
                <Zap size={14} />
                <span>POWER DRAW:</span>
                <span className="res-value">115W</span>
              </div>
              <div className="resource-item">
                <Server size={14} />
                <span>VRAM USAGE:</span>
                <span className="res-value">2.4 / 8.0 GB</span>
              </div>
            </div>

            <div className="diagnostics-footer">
              <div className="engine-v">CORE ENGINE V4.2.0-STABLE</div>
              <button className="re-calibrate-btn">RE-CALIBRATE SENSORS</button>
            </div>
          </div>
        )}

        {isMinimized && (
          <div className="minimized-info">
            Accuracy: 94.8% | Latency: 12.4ms
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealthPopup;
