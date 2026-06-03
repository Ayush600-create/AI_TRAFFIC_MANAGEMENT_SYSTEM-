from ultralytics import YOLO
import torch

class TrafficDetector:
    def __init__(self, model_path='yolov8s.pt', confidence_threshold=0.25):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model = YOLO(model_path).to(self.device)
        self.conf_threshold = confidence_threshold
        # Car, Motorcycle, Bus, Truck, Traffic Light from COCO dataset
        self.target_classes = [2, 3, 5, 7, 9] 

    def detect(self, image):
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
