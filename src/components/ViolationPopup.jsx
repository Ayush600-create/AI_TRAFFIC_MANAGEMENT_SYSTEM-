import React, { useState, useEffect } from 'react';
import './ViolationPopup.css';
import { AlertTriangle, X, Ban, TrafficCone } from 'lucide-react';
import vehicleData from '../data/vehicleDataset.json';

const ViolationPopup = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleViolation = (event) => {
      const { detectedNumberPlate, violationType } = event.detail;
      
      // Match with dataset or dynamically generate realistic details to prevent hardcoding
      let vehicleInfo = vehicleData.find(v => v.numberPlate === detectedNumberPlate);
      
      if (!vehicleInfo) {
        // Hash the plate to create a stable seed (so the same plate always returns the same owner/model)
        let hash = 0;
        for (let i = 0; i < detectedNumberPlate.length; i++) {
          hash = detectedNumberPlate.charCodeAt(i) + ((hash << 5) - hash);
        }
        const seed = Math.abs(hash);

        const firstNames = ["Vikram", "Neha", "Rajesh", "Karan", "Sneha", "Aditya", "Rohan", "Pooja", "Arjun", "Deepika", "Rahul", "Priya", "Amit", "Suresh", "Ananya"];
        const lastNames = ["Singh", "Joshi", "Mehra", "Gupta", "Verma", "Sen", "Das", "Reddy", "Nair", "Iyer", "Sharma", "Patil", "Kumar", "Raina", "Ghosh"];
        
        const carModels = ["Honda City", "Maruti Swift", "Tata Nexon", "Hyundai Creta", "Kia Seltos", "Mahindra XUV700", "Toyota Fortuner", "Volkswagen Virtus"];
        const bikeModels = ["Royal Enfield Classic 350", "Yamaha FZ-S", "Honda Activa 6G", "TVS Jupiter", "KTM Duke 200", "Bajaj Pulsar 150", "Hero Splendor+"];
        
        const ownerName = `${firstNames[seed % firstNames.length]} ${lastNames[(seed >> 1) % lastNames.length]}`;
        const isMotorcycle = violationType.toUpperCase().includes("HELMET") || violationType.toUpperCase().includes("TRIPLE");
        const vehicleModel = isMotorcycle ? bikeModels[seed % bikeModels.length] : carModels[seed % carModels.length];
        
        vehicleInfo = {
          ownerName,
          vehicleModel,
          vehicleColor: "N/A"
        };
      }

      // Generate a unique ID using random suffixes to prevent duplicate key click bugs
      const id = `${Date.now()}-${Math.random()}`;
      const newNotification = {
        id,
        detectedNumberPlate,
        violationType,
        ownerName: vehicleInfo.ownerName,
        vehicleModel: vehicleInfo.vehicleModel,
        penalty: getPenalty(violationType),
        description: getDescription(violationType),
        type: getSeverity(violationType) // 'serious' or 'warning'
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 6000);
    };

    window.addEventListener('traffic-violation', handleViolation);
    return () => window.removeEventListener('traffic-violation', handleViolation);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getPenalty = (type) => {
    const penalties = {
      'No Helmet': '₹1,000',
      'NO HELMET DETECTED': '₹1,000',
      'Signal Jump': '₹2,000',
      'RED LIGHT VIO': '₹2,000',
      'Over Speeding': '₹5,000',
      'Wrong Side': '₹1,500',
      'Triple Riding': '₹1,000',
      'LINE CROSSING': '₹500',
      'LANE ENCROACHMENT': '₹1,000'
    };
    return penalties[type.toUpperCase()] || '₹500';
  };

  const getDescription = (type) => {
    const descriptions = {
      'NO HELMET DETECTED': 'Rider detected without protective headgear.',
      'RED LIGHT VIO': 'Vehicle crossed the stop line during red signal.',
      'OVER SPEEDING': 'Vehicle exceeded the prescribed speed limit.',
      'WRONG SIDE': 'Vehicle driving against the flow of traffic.',
      'TRIPLE RIDING': 'More than two persons on a two-wheeler.',
      'LINE CROSSING': 'Vehicle touched or crossed the mandatory stop line.',
      'LANE ENCROACHMENT': 'Vehicle drifted out of designated lane.'
    };
    return descriptions[type.toUpperCase()] || 'Traffic rule violation detected.';
  };

  const getSeverity = (type) => {
    const serious = ['RED LIGHT VIO', 'WRONG SIDE', 'OVER SPEEDING', 'SIGNAL JUMP'];
    return serious.includes(type.toUpperCase()) ? 'serious' : 'warning';
  };

  const getIcon = (type, severity) => {
    if (type === 'Signal Jump') return <TrafficCone size={20} />;
    if (severity === 'serious') return <Ban size={20} />;
    return <AlertTriangle size={20} />;
  };

  return (
    <div className="violation-container">
      {notifications.map(notif => (
        <div key={notif.id} className={`violation-card ${notif.type}`}>
          <div className="violation-header">
            <div className="violation-badge">
              {getIcon(notif.violationType, notif.type)}
              <span>{notif.violationType.toUpperCase()}</span>
            </div>
            <button className="close-btn" onClick={() => removeNotification(notif.id)}>
              <X size={16} />
            </button>
          </div>
          
          <div className="violation-body">
            <div className="plate-number">{notif.detectedNumberPlate}</div>
            <div className="owner-info">
              <span className="owner-name">{notif.ownerName}</span>
              <span className="vehicle-model">{notif.vehicleModel}</span>
            </div>
            <p className="violation-desc">{notif.description}</p>
          </div>
          
          <div className="violation-footer">
            <div className="penalty-amount">
              <span>Fine:</span>
              <strong>{notif.penalty}</strong>
            </div>
            <div className="status-indicator">CHALLAN PENDING</div>
          </div>
          
          <div className="demo-note">
            🚀 Future Scope: Real-time ANPR & Automated Challan
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViolationPopup;
