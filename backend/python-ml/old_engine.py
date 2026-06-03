import cv2
from ultralytics import YOLO
import os
import json

# Load standard YOLOv8 nano model (downloads automatically if not present)
model = YOLO('yolov8n.pt')

def analyze_video(video_path: str):
    """
    Takes a path to an MP4 file, processes it through YOLOv8, 
    and returns a JSON-friendly dictionary of detections.
    """
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise Exception(f"Failed to open video file {video_path}")
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    results_data = {
        "metadata": {
            "fps": fps,
            "total_frames": total_frames,
            "width": width,
            "height": height
        },
        "frames": []
    }
    
    frame_idx = 0
    # Process every Nth frame to speed up demo if needed
    process_every_n = max(1, int(fps / 10)) # target ~10 fps for processing
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_idx % process_every_n == 0:
            # Run inference
            results = model.predict(source=frame, verbose=False)
            
            detections = []
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    # coords in xywh pct format
                    b = box.xywhn[0] 
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    name = model.names[cls]
                    
                    # Filtering just to vehicles and people for traffic demo
                    if name in ['person', 'car', 'motorcycle', 'bus', 'truck']:
                        # Simulate a rule violation arbitrarily (e.g. confidence > 0.85 = violation for demo)
                        is_violation = True if (conf > 0.85 and name != 'person') else False
                        
                        detections.append({
                            "x": float(b[0]) * 100, # convert to %
                            "y": float(b[1]) * 100,
                            "w": float(b[2]) * 100,
                            "h": float(b[3]) * 100,
                            "conf": conf * 100,
                            "label": name.upper(),
                            "type": "violation" if is_violation else "normal"
                        })
            
            results_data["frames"].append({
                "frame_idx": frame_idx,
                "timestamp_sec": frame_idx / fps,
                "detections": detections
            })
            
        frame_idx += 1
        
    cap.release()
    return results_data
