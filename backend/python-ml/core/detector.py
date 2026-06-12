import os
from ultralytics import YOLO
import torch

class TrafficDetector:
    def __init__(self, model_path='yolov8s.pt', confidence_threshold=0.25):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.conf_threshold = confidence_threshold
        # Car, Motorcycle, Bus, Truck, Traffic Light from COCO dataset
        self.target_classes = [2, 3, 5, 7, 9] 
        self.model = None
        self.model_loaded = False

        # Resolve model path dynamically by checking multiple relative paths
        # also supports environment variable YOLO_MODEL_PATH
        env_path = os.environ.get("YOLO_MODEL_PATH")
        paths_to_check = []
        if env_path:
            paths_to_check.append(env_path)
        
        paths_to_check.extend([
            model_path,
            os.path.join("backend", model_path),
            os.path.join("..", model_path),
            os.path.join("..", "..", model_path),
            os.path.join(os.path.dirname(__file__), "..", "..", model_path),
            os.path.join(os.path.dirname(__file__), "..", model_path),
        ])

        resolved_path = None
        for p in paths_to_check:
            if os.path.exists(p) and os.path.isfile(p):
                resolved_path = p
                break

        if not resolved_path:
            resolved_path = env_path if env_path else model_path
            print(f"[TrafficDetector] Model file not found in check paths. Attempting default path: {resolved_path}")
        else:
            print(f"[TrafficDetector] Model resolved at: {os.path.abspath(resolved_path)}")

        try:
            self.model = YOLO(resolved_path).to(self.device)
            self.model_loaded = True
            print("[TrafficDetector] YOLOv8 model loaded successfully.")
        except Exception as e:
            print(f"CRITICAL ERROR: Failed to load YOLO model from '{resolved_path}': {e}")
            print("[TrafficDetector] Running in FAILSAFE mode. Detection is disabled.")
            self.model = None
            self.model_loaded = False

    def detect(self, image):
        if not self.model_loaded or self.model is None:
            return []
            
        try:
            results = self.model.predict(
                source=image, 
                conf=self.conf_threshold, 
                classes=self.target_classes, 
                verbose=False,
                device=self.device
            )
            
            detections = []
            for r in results:
                for box in r.boxes:
                    # Get normalized center coordinates
                    b = box.xywhn[0] 
                    detections.append({
                        "x": float(b[0]),
                        "y": float(b[1]),
                        "w": float(b[2]),
                        "h": float(b[3]),
                        "conf": float(box.conf[0]),
                        "cls": int(box.cls[0]),
                        "label": self.model.names[int(box.cls[0])].upper()
                    })
            return detections
        except Exception as e:
            print(f"[TrafficDetector] Error running inference: {e}")
            return []
