from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import cv2
import os
import time

from core.detector import TrafficDetector
from core.tracker import CentroidTracker
from core.rules import TrafficRules

app = FastAPI(title="Production Traffic Analytics Engine")

# Initialize modular components
detector = TrafficDetector()
tracker = CentroidTracker(max_disappeared=15)
rules = TrafficRules()

# In-memory storage for vehicle violation history (Prevents duplicates)
# In production, this would be a Redis cache with TTL
reported_violations = set()

class ImageRequest(BaseModel):
    image_path: str

@app.post("/detect")
async def detect_api(request: ImageRequest):
    start_time = time.time()
    
    if not os.path.exists(request.image_path):
        raise HTTPException(status_code=404, detail="Image not found")

    image = cv2.imread(request.image_path)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not read image")

    # 1. Detect Vehicles
    raw_detections = detector.detect(image)
    
    # 2. Update Tracking
    rects = []
    for d in raw_detections:
        # Convert normalized to absolute for tracker comparison
        h, w, _ = image.shape
        x1 = (d['x'] - d['w']/2) * w
        y1 = (d['y'] - d['h']/2) * h
        x2 = (d['x'] + d['w']/2) * w
        y2 = (d['y'] + d['h']/2) * h
        rects.append((x1, y1, x2, y2))
    
    tracked_objects = tracker.update(rects)
    
    # 3. Update Global Traffic State (Red/Green light)
    rules.update_light_state(image, raw_detections)
    
    # 4. Apply Rules and Format Response
    final_detections = []
    final_violations = []
    
    # Map tracked IDs back to detections
    # Simple centroid association for this frame
    for d in raw_detections:
        centroid = (int(d['x'] * 1000), int(d['y'] * 1000))
        
        # Find the matching ID from tracked objects
        # Find the matching ID from tracked objects
        assigned_id = -1
        max_dist = min(w, h) * 0.08  # 8% of screen dimension as threshold
        
        for obj_id, obj_centroid in tracked_objects.items():
            px_centroid = (int(d['x'] * w), int(d['y'] * h))
            dist_val = ((px_centroid[0] - obj_centroid[0])**2 + (px_centroid[1] - obj_centroid[1])**2)**0.5
            if dist_val < max_dist:
                assigned_id = obj_id
                break
        
        d_formatted = {
            "vehicle_id": assigned_id,
            "type": d['label'].lower(),
            "confidence": d['conf'],
            "bbox": {
                "x": (d['x'] - d['w']/2) * 100,
                "y": (d['y'] - d['h']/2) * 100,
                "w": d['w'] * 100,
                "h": d['h'] * 100
            }
        }
        final_detections.append(d_formatted)
        
        # Check for Violations
        if assigned_id != -1:
            viol_type, severity = rules.check_violation(assigned_id, d['label'], (d['x'], d['y']))
            
            if viol_type:
                # Deduplication Key: ID + Type
                dedup_key = f"{assigned_id}_{viol_type}"
                if dedup_key not in reported_violations:
                    # Assign a mock plate based on ID (for demo matching)
                    mock_plates = ["KA01HH1234", "MH12DE5678", "DL01AB9012", "TN07XY4321", "WB02JK7890"]
                    assigned_plate = mock_plates[assigned_id % len(mock_plates)] if assigned_id != -1 else "UNKNOWN"

                    final_violations.append({
                        "vehicle_id": assigned_id,
                        "type": d['label'].lower(),
                        "violation": viol_type,
                        "confidence": d['conf'],
                        "severity": severity,
                        "timestamp": int(time.time()),
                        "bbox": d_formatted["bbox"],
                        "number_plate": assigned_plate
                    })
                    reported_violations.add(dedup_key)

    total_time = (time.time() - start_time) * 1000
    print(f"PROCESSED frame in {total_time:.1f}ms - Found {len(final_violations)} violations.")

    return {
        "detections": final_detections,
        "violations": final_violations,
        "processing_time_ms": total_time
    }

@app.post("/reset-session")
async def reset_session():
    global tracker, reported_violations
    tracker = CentroidTracker(max_disappeared=15)
    reported_violations = set()
    return {"status": "success", "message": "Detection session reset"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=False)
