import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, AlertTriangle, Activity, Upload, Loader, CheckCircle, Flag, X, Shield, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Violation Detection Log Panel ───────────────────────────────────────────
// Matches the paper's Fig 4.4 / 4.5 — displays confirmed violations with
// law references and admin action buttons (Submit, Clear, Flag).
const ViolationLogPanel = ({ violations, onAction }) => {
  const severityColor = { HIGH: 'var(--accent-red)', MEDIUM: '#f59e0b', LOW: '#6b7280' };
  const statusBadge = {
    pending:   { label: 'PENDING',   bg: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' },
    submitted: { label: 'SUBMITTED', bg: 'rgba(0,229,255,0.12)',   color: 'var(--accent-cyan)'    },
    flagged:   { label: 'FLAGGED',   bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b'               },
    cleared:   { label: 'CLEARED',   bg: 'rgba(255,255,255,0.05)', color: '#6b7280'               },
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0', flex: 1, overflow: 'hidden', minHeight: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>
          <Shield size={15} color="var(--accent-cyan)" />
          VIOLATION DETECTION LOG
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 600 }}>
          <span style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>
            CRITERIA
          </span>
        </div>
      </div>

      {violations.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
          No violations detected.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {violations.map((viol, idx) => {
            const sColor = severityColor[viol.severity] || '#6b7280';
            const badge  = statusBadge[viol.status] || statusBadge.pending;
            const violType = viol.type || 'UNKNOWN VIOLATION';
            const vehicle = viol.vehicleType || 'vehicle';
            
            return (
              <div key={viol._id || idx} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                <div style={{ height: '3px', background: sColor }} />
                <div style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <span>Frame {viol.frameId || '?'} · ID [{viol.vehicleId || '?'}]</span>
                    <span>{viol.timestamp ? new Date(viol.timestamp * 1000).toISOString().substr(11, 8) : '--:--:--'}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: sColor, marginBottom: '0.4rem' }}>
                    {violType.replace(/_/g, ' ')}
                  </div>
                  
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Observed: {vehicle.toUpperCase()}
                  </div>

                  {viol.explanation?.reason && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.6rem', lineHeight: '1.4' }}>
                      {viol.explanation.reason}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Conf: <strong style={{ color: 'var(--text-secondary)' }}>{((viol.confidence || 0) * 100).toFixed(1)}%</strong>
                    </span>
                    <span style={{
                      background: badge.bg,
                      color: badge.color,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '0.65rem'
                    }}>{badge.label}</span>
                  </div>

                  {viol.status === 'pending' || !viol.status ? (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => onAction(viol._id || idx, 'submitted')}
                        style={{ flex: 1, padding: '4px', fontSize: '0.65rem', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '4px', color: 'var(--accent-cyan)' }}
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => onAction(viol._id || idx, 'cleared')}
                        style={{ flex: 1, padding: '4px', fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-muted)' }}
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '4px' }}>
                      Action: {viol.status.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main VideoAnalysis Page ──────────────────────────────────────────────────
const VideoAnalysis = () => {
  const navigate = useNavigate();

  const simulateViolation = () => {
    const plates = ["KA01HH1234", "MH12DE5678", "DL01AB9012", "TN07XY4321", "UNKNOWN-999"];
    const violations = ["No Helmet", "Signal Jump", "Over Speeding", "Wrong Side", "Triple Riding"];
    
    const randomPlate = plates[Math.floor(Math.random() * plates.length)];
    const randomViol = violations[Math.floor(Math.random() * violations.length)];

    const event = new CustomEvent('traffic-violation', {
      detail: {
        detectedNumberPlate: randomPlate,
        violationType: randomViol
      }
    });
    window.dispatchEvent(event);
  };

  const [videoUrl, setVideoUrl]         = useState(null);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalFrames, setTotalFrames]   = useState(0);
  const [processedFrames, setProcessedFrames] = useState(0);

  const [analysisData, setAnalysisData]   = useState(null);
  const [currentBoxes, setCurrentBoxes]   = useState([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime]     = useState(0);

  // Violations with admin status for the Detection Log
  const [violations, setViolations] = useState([]);

  const videoRef = useRef(null);
  const pollingRef = useRef(null);
  const seenViolationsRef = useRef(new Set());


  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ── File upload + backend processing ───────────────────────────────────────
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    setVideoUrl(URL.createObjectURL(file));
    setIsProcessing(true);
    setAnalysisData({ frames: [] });
    setCurrentBoxes([]);
    setViolations([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes  = await fetch("/api/videos/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (uploadData.status === 'success') {
        const videoId = uploadData.videoId;

        // Trigger async processing (non-blocking)
        fetch("/api/videos/process", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId })
        });

        // Poll for violations every 5 s
        pollingRef.current = setInterval(async () => {
          try {
            // 1. Fetch processing status
            const statusRes = await fetch(`/api/videos/${videoId}`);
            const statusData = await statusRes.json();
            if (statusData.totalFrames) setTotalFrames(statusData.totalFrames);
            if (statusData.processedFrames) setProcessedFrames(statusData.processedFrames);
            if (statusData.status === 'completed') setIsProcessing(false);

            // 2. Fetch violations
            const res  = await fetch(`/api/violations/video/${videoId}`);
            const data = await res.json();
            if (data.length > 0) {
              setViolations(data);
              
              // Group violations by frame index to show multiple boxes

              const groupedFrames = data.reduce((acc, v) => {
                const existing = acc.find(f => f.frame_idx === v.frameId);
                const detection = {
                  label: v.vehicleType, conf: v.confidence, type: 'violation',
                  x: v.boxData?.x, y: v.boxData?.y, w: v.boxData?.w, h: v.boxData?.h,
                  imageUrl: v.imageUrl
                };
                if (existing) {
                  existing.detections.push(detection);
                } else {
                  acc.push({
                    frame_idx: v.frameId,
                    timestamp_sec: v.timestamp,
                    detections: [detection]
                  });
                }
                return acc;
              }, []);

              setAnalysisData({ frames: groupedFrames });
            }
          } catch (err) { console.error("Poll error:", err); }
        }, 3000);
      }
    } catch (e) {
      console.error("Backend error:", e);
      alert("Make sure the Node.js backend is running on port 5000!");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Admin action: update violation status ──────────────────────────────────
  const handleViolationAction = async (id, newStatus) => {
    try {
      await fetch(`/api/violations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (_) { /* offline fallback */ }

    setViolations(prev =>
      prev.map(v => (v._id === id ? { ...v, status: newStatus } : v))
    );
  };

  // ── Video overlay helpers ──────────────────────────────────────────────────
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    if (analysisData?.frames?.length > 0) {
      const closest = analysisData.frames.reduce((p, c) =>
        Math.abs(c.timestamp_sec - time) < Math.abs(p.timestamp_sec - time) ? c : p,
        analysisData.frames[0]
      );
      setCurrentBoxes(Math.abs(closest.timestamp_sec - time) < 0.5 ? closest.detections : []);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const progressPct = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  const violationFrames = useMemo(() => {
    if (!analysisData?.frames) return [];
    const seen = new Set();
    return analysisData.frames
      .filter(f => {
        const viols = f.detections.filter(d => d.type === 'violation');
        if (!viols.length || seen.has(f.frame_idx)) return false;
        seen.add(f.frame_idx);
        return true;
      })
      .map(f => ({
        id: f.frame_idx,
        time: new Date(f.timestamp_sec * 1000).toISOString().substr(11, 8),
        type: f.detections[0].label + ' VIOLATION',
        conf: f.detections[0].conf?.toFixed(1),
        active: Math.abs(currentTime - f.timestamp_sec) < 0.5,
        timestamp: f.timestamp_sec,
        imageUrl: f.detections[0].imageUrl // Use the image URL if available
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 20);
  }, [analysisData, currentTime]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 140px)', overflow: 'hidden' }}>

      {/* ── Main Video Column ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Kinetic Video Analysis</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Two-Stage AI Detection &amp; Rule-Based Verification Engine</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label className="btn-outline" style={{ cursor: 'pointer' }}>
              <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              <Upload size={16} /> UPLOAD VIDEO
            </label>
            <button className="btn-primary" onClick={togglePlay} disabled={!videoUrl || isProcessing}>
              {isProcessing
                ? <><Loader size={16} className="animate-spin" /> AI ENGINE PROCESSING...</>
                : isPlaying
                  ? <><Pause size={16} /> PAUSE STREAM</>
                  : <><Play  size={16} /> START REAL-TIME STREAM</>
              }
            </button>
            <button className="btn-outline" onClick={simulateViolation} style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
              <AlertTriangle size={16} /> SIMULATE
            </button>
          </div>

        </div>

        {/* Video Player */}
        <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0a0c10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,229,255,0.1)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--accent-cyan)', zIndex: 10 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)' }} />
            TRACKING {analysisData ? 'ACTIVE' : 'IDLE'}
          </div>

          <div style={{ display: 'grid', placeItems: 'center', maxHeight: '100%', maxWidth: '100%', position: 'relative', background: '#0a0c10' }}>
            {videoUrl
              ? <video ref={videoRef} src={videoUrl} className="ai-video-player"
                  style={{ gridArea: '1/1', maxHeight: '100%', maxWidth: '100%', zIndex: 1 }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={e => setVideoDuration(e.target.duration)}
                  onEnded={() => setIsPlaying(false)} />
              : <div style={{ gridArea: '1/1', color: 'var(--text-muted)' }}>Upload footage to begin tracking...</div>
            }

            {/* Bounding-box overlay */}
            <div style={{ gridArea: '1/1', width: videoRef.current?.offsetWidth || '100%', height: videoRef.current?.offsetHeight || '100%', position: 'relative', pointerEvents: 'none', zIndex: 2 }}>
              {currentBoxes.map((box, i) => {
                const isViol = box.type === 'violation';
                const color  = isViol ? 'var(--accent-red)' : 'var(--accent-cyan)';
                return (
                  <div key={i} className={isViol ? 'glow-box-red' : 'glow-box-cyan'} style={{ position: 'absolute', left: box.x + '%', top: box.y + '%', width: box.w + '%', height: box.h + '%', border: '1.5px solid ' + color, transition: 'all 0.1s' }}>
                    <div style={{ position: 'absolute', top: '-20px', left: '-1.5px', background: color, color: '#000', fontSize: '0.7rem', padding: '2px 6px', fontWeight: 'bold' }}>
                      {box.label} [{(box.conf * 100).toFixed(1)}%]
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ height: '100%', width: progressPct + '%', background: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)', transition: 'width 0.1s linear' }} />
          </div>
        </div>

        {/* Frame buffer */}
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--text-secondary)' }}>
              FRAME SYNTHESIS CACHE <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem' }}>AI CACHED</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>Analyzed: {processedFrames} / {totalFrames || '...'}</span>
              <span style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14} /> {violationFrames.length} Violations</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.8rem', scrollbarWidth: 'thin' }} className="custom-scrollbar">
            {violationFrames.map((frame, idx) => (
              <div key={idx}
                onClick={() => { if (videoRef.current) videoRef.current.currentTime = frame.timestamp; }}
                className={frame.active ? 'glow-box-cyan' : ''}
                style={{ flexShrink: 0, width: '160px', height: '90px', background: '#0a0b10', borderRadius: '8px', border: frame.active ? '2px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, background: 'var(--accent-red)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold', zIndex: 5 }}>VIOLATION</div>
                <div style={{ position: 'absolute', bottom: '4px', right: '6px', fontSize: '0.7rem', color: '#fff', zIndex: 5, background: 'rgba(0,0,0,0.5)', padding: '0 4px', borderRadius: '2px' }}>{frame.time}</div>
                {/* Violation Image Thumb */}
                {frame.imageUrl ? (
                  <img 
                    src={`${frame.imageUrl}`} 
                    alt="violation" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.1)' }}>
                     <Video size={24} />
                  </div>
                )}
              </div>
            ))}
            {violationFrames.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1rem' }}>No violations detected in frame buffer yet.</div>}
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div style={{ width: '360px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', overflow: 'hidden' }}>

        {/* Violation Detection Log (paper Fig 4.4 / 4.5) */}
        <ViolationLogPanel violations={violations} onAction={handleViolationAction} />

        {/* Processing Meta */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>
            <Activity size={16} color="var(--accent-cyan)" /> PROCESSING META
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Stage 1 Engine</span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>YOLOv8 + DeepSORT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Stage 2 Engine</span>
            <span style={{ color: '#f59e0b', fontWeight: 500 }}>Rule-Based Verifier</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>LLM Reports</span>
            <span style={{ fontWeight: 500 }}>Gemini 2.0 Flash</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ height: '100%', width: analysisData ? '100%' : '15%', background: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'right' }}>
            Motor Vehicles Act, 1988 (India)
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;
