from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import aiofiles
import os
from engine import analyze_video
import uuid

app = FastAPI()

# Allow CORS for React frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Store memory cache of processed results (simple DB mock)
RESULTS_DB = {}

@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    if not file.filename.endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload MP4/AVI/MOV.")
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
            
        # Process video synchronously for the demo (could be async task queue in production)
        print(f"File saved. Processing video {file.filename} through YOLOv8 engine...")
        analysis_data = analyze_video(file_path)
        
        # Save to DB memory
        RESULTS_DB[file_id] = analysis_data
        
        return {
            "status": "success",
            "message": "Video processed successfully",
            "file_id": file_id,
            "metadata": analysis_data["metadata"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analysis/{file_id}")
async def get_analysis(file_id: str):
    if file_id not in RESULTS_DB:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return RESULTS_DB[file_id]

@app.get("/api/telemetry")
async def get_telemetry():
    # Return simulated real-time stats for dashboard
    import random
    return {
        "activeSession": "CAM-01-SEC-A.mp4",
        "totalFrames": 2400,
        "processedFrames": random.randint(1000, 2400),
        "violations": random.randint(30, 80),
        "inferenceSpeed": round(random.uniform(15.0, 22.0), 1),
        "droppedFrames": random.randint(0, 2),
        "red_light": random.randint(300, 500),
        "no_helmet": random.randint(100, 300),
        "lane_drift": random.randint(500, 800),
        "timeline_chart": [random.randint(10, 90) for _ in range(12)]
    }

@app.get("/api/reports")
async def get_reports():
    return [
        { "id": "#VX-8849-01", "time": "19 Oct 2023 14:42:01 UTC", "frame": "10,482", "loc": "Intersection A-12", "type": "RED LIGHT", "conf": 98.4, "status": "VALIDATED" },
        { "id": "#VX-8847-14", "time": "19 Oct 2023 13:12:55 UTC", "frame": "09,211", "loc": "Grand Central Blvd", "type": "SPEEDING", "conf": 85.2, "status": "PENDING" },
        { "id": "#VX-8845-09", "time": "19 Oct 2023 12:05:30 UTC", "frame": "02,154", "loc": "Tech District Dr", "type": "ILLEGAL TURN", "conf": 94.0, "status": "VALIDATED" },
        { "id": "#VX-8842-21", "time": "18 Oct 2023 23:59:12 UTC", "frame": "22,019", "loc": "Tunnel Exit West", "type": "WRONG WAY", "conf": 99.8, "status": "VALIDATED" },
        { "id": "#VX-8841-05", "time": "18 Oct 2023 22:15:40 UTC", "frame": "15,200", "loc": "Downtown Sector-04", "type": "NO HELMET", "conf": 92.1, "status": "PENDING" }
    ]

@app.get("/api/records/{record_id}")
async def get_single_record(record_id: str):
    return {
        "caseId": record_id,
        "priority": "HIGH PRIORITY VIOLATION",
        "frameId": "#44,912",
        "videoSrc": "CAM_NORTH_04_02-23",
        "confidence": 98.4,
        "violationType": "RED LIGHT JUMP",
        "violationClass": "Traffic Signal Violation",
        "reason": "Vehicle entered intersection 1.2s after signal transition at 42 km/h. Zero braking force detected.",
        "action": "Issue CITATION #88219 for plate ABC-1234.",
        "meta": {
            "timestamp": "00:42:15.09",
            "vehicle": "Silver Sedan",
            "plate": "ABC-1234",
            "location": "Sector 4 Crossing"
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Make sure to run this via standard bash instead of Python CLI if uvicorn fails to locate the app
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
