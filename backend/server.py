"""
FastAPI server that bridges the voice frontend with Python scripts.
Executes main.py (menu/cash) or model.py + open_api.py (vision) on demand.
"""

import subprocess
import base64
import os
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI(title="Halo Vision API")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "output"
JSON_OUTPUT_DIR = BASE_DIR / "frames" / "json_output_openai"
CAPTURED_DIR = BASE_DIR / "frames" / "captured"
PNG_DEFAULT_DIR = BASE_DIR / "frames" / "png_default"
PNG_BBOX_DIR = BASE_DIR / "frames" / "png_boundingbox"
PNG_DEPTH_DIR = BASE_DIR / "frames" / "png_depth"
PYTHON_PATH = "python"  # or full path to your conda python

# Ensure directories exist
CAPTURED_DIR.mkdir(parents=True, exist_ok=True)


class ImageRequest(BaseModel):
    image: str  # base64 encoded image


def save_base64_image(base64_data: str, filename: str) -> Path:
    """Save a base64 encoded image to disk."""
    # Remove data URL prefix if present
    if "," in base64_data:
        base64_data = base64_data.split(",")[1]
    
    image_bytes = base64.b64decode(base64_data)
    filepath = CAPTURED_DIR / filename
    
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    
    return filepath


def get_latest_file(directory: Path, extension: str = ".txt") -> Path | None:
    """Get the most recently modified file with given extension."""
    if not directory.exists():
        return None
    files = sorted(
        [f for f in directory.iterdir() if f.is_file() and f.suffix.lower() == extension],
        key=lambda x: x.stat().st_mtime,
        reverse=True
    )
    return files[0] if files else None


def image_to_base64(filepath: Path) -> str | None:
    """Convert an image file to base64 data URL."""
    if not filepath or not filepath.exists():
        return None
    
    with open(filepath, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    
    ext = filepath.suffix.lower()
    mime = "image/png" if ext == ".png" else "image/jpeg"
    return f"data:{mime};base64,{data}"


@app.get("/")
async def root():
    return {"status": "ok", "message": "Halo Vision API is running"}


@app.post("/analyze/menu-cash")
async def analyze_menu_cash(request: ImageRequest):
    """
    Execute main.py to analyze a menu or cash image.
    Returns the text output.
    """
    try:
        # Save the captured image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"menu_cash_{timestamp}.jpg"
        image_path = save_base64_image(request.image, image_filename)
        print(f"📸 Saved image to: {image_path}")
        
        # Run main.py with the image path
        script_path = BASE_DIR / "main.py"
        
        result = subprocess.run(
            [PYTHON_PATH, str(script_path), str(image_path)],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            timeout=120
        )
        
        print(f"main.py stdout: {result.stdout}")
        if result.returncode != 0:
            print(f"main.py stderr: {result.stderr}")
        
        # Read the latest output file
        latest_output = get_latest_file(OUTPUT_DIR, ".txt")
        
        if latest_output and latest_output.exists():
            text = latest_output.read_text(encoding="utf-8")
            return JSONResponse({
                "success": True,
                "type": "menu-cash",
                "text": text,
                "file": latest_output.name
            })
        else:
            return JSONResponse({
                "success": False,
                "error": "No output file generated"
            }, status_code=500)
            
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Script timed out")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/vision")
async def analyze_vision(request: ImageRequest):
    """
    Execute model.py (YOLO + depth) then open_api.py (OpenAI description).
    Returns the text output.
    """
    try:
        # Save the captured image to png_default for model.py to process
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"captured_{timestamp}.jpg"
        
        # Save to captured folder
        captured_path = save_base64_image(request.image, image_filename)
        print(f"📸 Saved image to: {captured_path}")
        
        # Also copy to png_default for model.py (clear old files first)
        for old_file in PNG_DEFAULT_DIR.glob("captured_*.jpg"):
            old_file.unlink()
        
        import shutil
        png_path = PNG_DEFAULT_DIR / image_filename
        shutil.copy(captured_path, png_path)
        print(f"📷 Copied to png_default: {png_path}")
        
        # Run model.py
        model_script = BASE_DIR / "backend" / "model.py"
        
        result = subprocess.run(
            [PYTHON_PATH, str(model_script)],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            timeout=300
        )
        
        print(f"model.py stdout: {result.stdout}")
        if result.returncode != 0:
            print(f"model.py stderr: {result.stderr}")
        
        # Run open_api.py
        openai_script = BASE_DIR / "backend" / "open_api.py"
        
        result = subprocess.run(
            [PYTHON_PATH, str(openai_script)],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            timeout=120
        )
        
        print(f"open_api.py stdout: {result.stdout}")
        if result.returncode != 0:
            print(f"open_api.py stderr: {result.stderr}")
        
        # Read the latest output file from json_output_openai
        latest_output = get_latest_file(JSON_OUTPUT_DIR, ".txt")
        
        # Get the latest bounding box and depth images
        latest_bbox = get_latest_file(PNG_BBOX_DIR, ".png")
        latest_depth = get_latest_file(PNG_DEPTH_DIR, ".png")
        
        if latest_output and latest_output.exists():
            text = latest_output.read_text(encoding="utf-8")
            
            # Convert images to base64 for frontend display
            bbox_b64 = image_to_base64(latest_bbox)
            depth_b64 = image_to_base64(latest_depth)
            
            return JSONResponse({
                "success": True,
                "type": "vision",
                "text": text,
                "file": latest_output.name,
                "bbox_image": bbox_b64,
                "depth_image": depth_b64
            })
        else:
            return JSONResponse({
                "success": False,
                "error": "No output file generated"
            }, status_code=500)
            
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Script timed out")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/outputs/latest")
async def get_latest_outputs():
    """Get the latest outputs from both pipelines."""
    menu_output = get_latest_file(OUTPUT_DIR, ".txt")
    vision_output = get_latest_file(JSON_OUTPUT_DIR, ".txt")
    
    return {
        "menu_cash": {
            "file": menu_output.name if menu_output else None,
            "text": menu_output.read_text(encoding="utf-8") if menu_output else None
        },
        "vision": {
            "file": vision_output.name if vision_output else None,
            "text": vision_output.read_text(encoding="utf-8") if vision_output else None
        }
    }


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Halo Vision API server...")
    print("📍 API docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
