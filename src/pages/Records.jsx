import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiUrl } from '../api';
import { AlertCircle, MapPin, CheckCircle, Download, Database, TrafficCone } from 'lucide-react';
import vehicleData from '../data/vehicleDataset.json';

const Records = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        let fetchId = id;
        
        // If no ID is provided in URL, fetch all and pick the first one
        if (!fetchId) {
          const listRes = await fetch(apiUrl('/api/violations'));
          const list = await listRes.json();
          if (list.length > 0) {
            fetchId = list[0]._id;
          } else {
            return; // No records at all
          }
        }

        const res = await fetch(apiUrl(`/api/violations/${fetchId}`));
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        const vehicleInfo = vehicleData.find(v => v.numberPlate === data.numberPlate) || {
          ownerName: "Unknown Owner",
          vehicleModel: "Unknown Vehicle",
          vehicleColor: "N/A"
        };

        const mapped = {
          caseId: data._id,
          priority: data.confidence > 0.85 ? 'HIGH PRIORITY' : 'MEDIUM',
          frameId: data.frameId,
          videoSrc: data.videoId,
          confidence: (data.confidence * 100).toFixed(1),
          violationType: data.type.replace(/_/g, ' '),
          violationClass: 'AI Detected',
          reason: data.explanation?.reason || 'Processing...',
          action: data.explanation?.action || 'Review required.',
          imageUrl: data.imageUrl,
          boxData: data.boxData,
          meta: {
            timestamp: data.timestamp?.toFixed(2) + 's',
            vehicle: data.vehicleType,
            plate: data.numberPlate || 'UNKNOWN',
            location: data.location || 'Sector 4 Crossing',
            ownerName: vehicleInfo.ownerName,
            vehicleModel: vehicleInfo.vehicleModel,
            vehicleColor: vehicleInfo.vehicleColor
          }
        };
        setRecord(mapped);
        setStatus(data.status || 'pending');
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchRecord();
  }, [id]);

  const handleAction = async (newStatus) => {
    if (!record || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await fetch(apiUrl(`/api/violations/${record.caseId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setStatus(newStatus);
        
        // 1. Fetch the list to find the next one
        const listRes = await fetch(apiUrl('/api/violations'));
        const list = await listRes.json();
        const currentIndex = list.findIndex(v => v._id === record.caseId);
        
        if (currentIndex < list.length - 1) {
          const nextId = list[currentIndex + 1]._id;
          navigate(`/records/${nextId}`);
          window.scrollTo(0, 0);
        } else {
          // If it was the last one, go to reports
          navigate('/reports');
        }
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!record) return <div style={{ padding: '2rem' }}>Loading record analysis...</div>;
  
  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', height: '100%' }}>
      
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            RECORDS / VIOLATION ANALYSIS: FRAME {record.frameId}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Case #{record.caseId}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 51, 102, 0.1)', color: 'var(--accent-red)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-red)', boxShadow: '0 0 8px var(--accent-red)' }}></div>
              {record.priority}
            </div>
          </div>
        </div>

        {/* Real Image Viewer with Dynamic Bounding Box */}
        <div className="glass-panel" style={{ height: '400px', position: 'relative', overflow: 'hidden', background: '#0a0b10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {record.imageUrl ? (
            <>
              <img 
                src={record.imageUrl.startsWith('http') ? record.imageUrl : apiUrl(record.imageUrl)} 
                alt="Violation Frame" 
                style={{ width: '100%', height: '100%', objectFit: 'fill' }} 
              />
              {/* Dynamic Bounding Box */}
              {record.boxData && (
                <div 
                  className="glow-box-red" 
                  style={{ 
                    position: 'absolute', 
                    left: record.boxData.x + '%', 
                    top: record.boxData.y + '%', 
                    width: record.boxData.w + '%', 
                    height: record.boxData.h + '%', 
                    border: '2px solid var(--accent-red)',
                    pointerEvents: 'none'
                  }}
                >
                  <div style={{ position: 'absolute', top: '-24px', left: '-2px', background: 'var(--accent-red)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {'VIOLATION: ' + record.violationType}
                  </div>
                  <div style={{ position: 'absolute', top: '-24px', right: '-2px', background: 'var(--accent-red)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', fontWeight: 'bold' }}>
                    {record.confidence + '%'}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>No frame image available for this record.</div>
          )}
          
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 5 }}>
            <span>FRAME ID: <span style={{color: 'var(--accent-cyan)'}}>{record.frameId}</span></span>
            <span style={{ color: 'var(--text-secondary)' }}>{'SOURCE VIDEO: ' + record.videoSrc}</span>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>STAT_VERIFIED</span>
          </div>
        </div>

        {/* AI Detection Synthesis (Structured Reason) */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600 }}>
              <Database color="var(--accent-cyan)" /> AI DETECTION SYNTHESIS
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', border: '1px solid rgba(255,51,102,0.3)', padding: '4px 12px', borderRadius: '12px' }}>
              CONFIDENCE: {record.confidence}%
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-red)', paddingLeft: '8px', letterSpacing: '1px' }}>VIOLATION</div>
              <div style={{ background: 'rgba(25,25,35,0.5)', padding: '1rem', borderRadius: '8px', height: '100%' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-red)', marginBottom: '0.5rem' }}>{record.violationType}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{'Class: ' + record.violationClass}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '8px', letterSpacing: '1px' }}>AI REASONING & DESCRIPTION</div>
              <div style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)', padding: '1rem', borderRadius: '8px', height: '100%', fontSize: '0.95rem', lineHeight: '1.6', color: '#fff' }}>
                {record.reason}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-yellow)', paddingLeft: '8px', letterSpacing: '1px' }}>ACTION REQUIRED</div>
              <div style={{ background: 'rgba(25,25,35,0.5)', padding: '1rem', borderRadius: '8px', height: '100%', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {record.action}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Details Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '0.5rem' }}>AI CONFIDENCE SCORE</div>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{record.confidence}<span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}> %</span></div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ width: record.confidence + '%', height: '100%', background: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)' }}></div>
          </div>
        </div>

        <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '1.5rem' }}>FRAME METADATA</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={14}/> Video Timestamp</span>
              <span>{record.meta.timestamp}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><TrafficCone size={14}/> Vehicle</span>
              <span>{record.meta.vehicle}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14}/> Plate</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{record.meta.plate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14}/> Location</span>
              <span>{record.meta.location}</span>
            </div>
            {record.meta.ownerName && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>Owner</span>
                <span>{record.meta.ownerName}</span>
              </div>
            )}
            {record.meta.vehicleModel && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>Vehicle</span>
                <span>{record.meta.vehicleModel} ({record.meta.vehicleColor})</span>
              </div>
            )}
            
            <div style={{ marginTop: '1rem', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Dummy Map Area */}
              <MapPin size={48} color="var(--accent-red)" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                className="btn-primary" 
                onClick={() => handleAction('submitted')}
                disabled={isUpdating || status === 'submitted'}
                style={{ justifyContent: 'center', padding: '1rem', opacity: status === 'submitted' ? 0.7 : 1 }}
              >
                <CheckCircle size={18} /> {status === 'submitted' ? 'VALIDATED' : 'Validate Violation'}
              </button>
              <button 
                className="btn-outline" 
                onClick={() => handleAction('cleared')}
                disabled={isUpdating || status === 'cleared'}
                style={{ justifyContent: 'center', padding: '1rem', color: 'var(--accent-red)', borderColor: 'rgba(255,51,102,0.3)', opacity: status === 'cleared' ? 0.7 : 1 }}
              >
                Discard Evidence
              </button>
              <button style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <Download size={16} /> Download Full Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Records;
