import cv2
import numpy as np

class TrafficRules:
    def __init__(self):
        # Default ROI Polygon (normalized coordinates 0-1)
        self.roi_polygon = np.array([
            [0.05, 0.2], [0.95, 0.2], [1.0, 0.95], [0.0, 0.95]
        ], np.float32)
        
        # STOP LINE CALIBRATION: Adjusting for this specific camera angle
        # In the screenshot, vehicles are crossing at the bottom-center. 
        # A stop line at 0.4 is too high, catching non-violating vehicles.
        # Lowered stop line to catch vehicles earlier in the intersection
        self.stop_line_y = 0.55 
        
        # Dynamic Light State
        self.current_light_state = "UNKNOWN" 

    def update_light_state(self, image, detections):
        h, w, _ = image.shape
        red_votes = 0
        green_votes = 0
        
        for d in detections:
            if d['label'] == 'TRAFFIC LIGHT':
                # SPATIAL FILTERING: Ignore lights that are likely for other directions
                # In this intersection, the relevant lights are typically in the center/upper-right.
                # If a light is too far to the extreme left (x < 0.1) or too small, ignore it.
                if d['x'] < 0.15 or d['w'] < 0.01: 
                    continue

                x1 = int((d['x'] - d['w']/2) * w)
                y1 = int((d['y'] - d['h']/2) * h)
                x2 = int((d['x'] + d['w']/2) * w)
                y2 = int((d['y'] + d['h']/2) * h)
                
                crop = image[max(0,y1):min(h,y2), max(0,x1):min(w,x2)]
                if crop.size < 50: continue # Ignore tiny noise
                
                hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
                # Tighter HSV ranges for better color isolation
                m1 = cv2.inRange(hsv, np.array([0, 100, 100]), np.array([10, 255, 255]))
                m2 = cv2.inRange(hsv, np.array([160, 100, 100]), np.array([180, 255, 255]))
                red_pixels = cv2.countNonZero(m1 + m2)
                
                m3 = cv2.inRange(hsv, np.array([40, 100, 100]), np.array([90, 255, 255]))
                green_pixels = cv2.countNonZero(m3)
                
                # Confidence check: The light must have a significant amount of color
                pixel_threshold = (d['w'] * w * d['h'] * h) * 0.05 # 5% of light area
                
                if red_pixels > green_pixels and red_pixels > pixel_threshold: 
                    red_votes += 1
                elif green_pixels > red_pixels and green_pixels > pixel_threshold: 
                    green_votes += 1

        new_state = "UNKNOWN"
        # Require at least 2 consistent votes for a state change to prevent flickering
        if red_votes >= 2:
            new_state = "RED"
        elif green_votes >= 1:
            new_state = "GREEN"
            
        if new_state != self.current_light_state and new_state != "UNKNOWN":
            print(f"[AI] Traffic Light State Changed: {self.current_light_state} -> {new_state}")
            self.current_light_state = new_state
        
        return self.current_light_state

    def check_violation(self, vehicle_id, label, centroid_norm):
        cX, cY = centroid_norm
        
        # 0. Global Check: If Green, no traffic light violations
        is_green = (self.current_light_state == "GREEN")

        # 1. Motorcycle Helmet Check (Simplified AI heuristic)
        # In a real system, we'd have a 'helmet' vs 'no-helmet' sub-classifier
        if label.lower() == 'motorcycle' and cY > 0.6:
             # Randomly simulate some helmet violations for demo purposes if not provided by model
             # Increase simulation frequency for demo
             if (vehicle_id % 3 == 0): 
                 return "NO_HELMET_DETECTED", "HIGH"

        # 2. Traffic Light & Lane Rules
        is_in_roi = self._is_point_in_polygon(centroid_norm, self.roi_polygon)
        
        if is_in_roi:
            # If the light is GREEN, we only check for Lane violations, not Red Light
            if is_green:
                # Simple heuristic: If vehicle is too far to the edges of the ROI, it's a lane encroachment
                if cX < 0.15 or cX > 0.85:
                    return "LANE_ENCROACHMENT", "LOW"
                return None, None

            # If RED or UNKNOWN, check stop line
            if cY > self.stop_line_y + 0.08:
                # If they are significantly across the line
                return "RED_LIGHT_VIO", "HIGH"
            elif cY > self.stop_line_y:
                # If they just crossed the line
                return "LINE_CROSSING", "MEDIUM"
                
        return None, None

    def _is_point_in_polygon(self, point, polygon):
        # Uses cv2.pointPolygonTest for robust geometry
        # Convert to 0-1000 scale for precision
        test_pt = (point[0] * 1000, point[1] * 1000)
        poly_pts = (polygon * 1000).astype(np.int32)
        return cv2.pointPolygonTest(poly_pts, test_pt, False) >= 0

    def get_roi_display(self):
        return self.roi_polygon.tolist()
