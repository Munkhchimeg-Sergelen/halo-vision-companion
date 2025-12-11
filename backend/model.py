from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt
import json
import numpy as np
import torch
from pathlib import Path


# ---------------- PATHS ----------------
# Resolve project root as the parent of the backend directory
BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_DIR = BASE_DIR / "frames" / "png_default"
BBOX_DIR = BASE_DIR / "frames" / "png_boundingbox"
DEPTH_DIR = BASE_DIR / "frames" / "png_depth"
JSON_INPUT_DIR = BASE_DIR / "frames" / "json_input"

BBOX_DIR.mkdir(parents=True, exist_ok=True)
DEPTH_DIR.mkdir(parents=True, exist_ok=True)
JSON_INPUT_DIR.mkdir(parents=True, exist_ok=True)


# ---------------- LOAD YOLO MODEL ----------------
model = YOLO(str(BASE_DIR / "models" / "yolo11n.pt"))


# ---------------- LOAD MiDaS MODEL ----------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# This will download the model the first time
midas = torch.hub.load("intel-isl/MiDaS", "DPT_Large")
midas.to(device)
midas.eval()

# Load MiDaS transforms
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")
transform = midas_transforms.dpt_transform  # for DPT_Large


all_objects = []  # to save a global detections.json

# Iterate over all PNG images in INPUT_DIR
png_files = sorted([p for p in INPUT_DIR.iterdir() if p.is_file() and p.suffix.lower() == ".png"])

if not png_files:
    print(f"No PNG files found in {INPUT_DIR}")

for image_path in png_files:
    print(f"Processing {image_path} ...")

    # ---------------- RUN YOLO INFERENCE ----------------
    results = model(str(image_path))
    result = results[0]
    boxes = result.boxes

    # ---------------- LOAD ORIGINAL IMAGE FOR DEPTH ----------------
    img_bgr = cv2.imread(str(image_path))
    if img_bgr is None:
        print(f"Warning: could not read image {image_path}, skipping.")
        continue

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    # ---------------- PREPARE INPUT FOR MiDaS ----------------
    input_batch = transform(img_rgb).to(device)

    # ---------------- RUN DEPTH ESTIMATION ----------------
    with torch.no_grad():
        prediction = midas(input_batch)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=img_rgb.shape[:2],
            mode="bicubic",
            align_corners=False,
        ).squeeze(1)

    depth_map = prediction.squeeze().cpu().numpy()

    # Normalize depth for visualization (0–1)
    depth_min = depth_map.min()
    depth_max = depth_map.max()
    depth_map_norm = (depth_map - depth_min) / (depth_max - depth_min + 1e-8)

    h, w = depth_map_norm.shape

    # ---------------- JSON WITH OBJECTS FOR THIS IMAGE ----------------
    objects = []
    for box in boxes:
        # Bounding box coordinates
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        conf = float(box.conf[0])
        class_id = int(box.cls[0])
        class_name = result.names[class_id]

        # Clamp bbox to image bounds
        x1_i = max(int(x1), 0)
        y1_i = max(int(y1), 0)
        x2_i = min(int(x2), w - 1)
        y2_i = min(int(y2), h - 1)

        # Depth mean inside the bbox (if bbox invalid, use global mean)
        if x2_i > x1_i and y2_i > y1_i:
            region = depth_map_norm[y1_i:y2_i, x1_i:x2_i]
            depth_mean = float(region.mean())
        else:
            depth_mean = float(depth_map_norm.mean())

        # Heuristic distance label and steps (relative, NOT real meters)
        if depth_mean < 0.33:
            distance_label = "far"
            steps_estimate = 8
        elif depth_mean < 0.66:
            distance_label = "medium"
            steps_estimate = 5
        else:
            distance_label = "near"
            steps_estimate = 2

        objects.append(
            {
                "image": image_path.name,
                "name": class_name,
                "prediction": conf,
                "bbox": [x1, y1, x2, y2],
                "distance": distance_label,   # how far the object probably is
                "steps": steps_estimate,      # approximate steps to reach
                "depth_mean": depth_mean,     # normalized depth value (0–1)
            }
        )

    # ---------------- SAVE PER-IMAGE JSON ----------------
    per_image_data = {
        "image": image_path.name,
        "objects": objects,
    }

    json_filename = image_path.with_suffix(".json").name  # e.g. IMG_5452.json
    json_output_path = JSON_INPUT_DIR / json_filename

    with open(json_output_path, "w") as jf:
        json.dump(per_image_data, jf, indent=2)

    print(f"Saved per-image JSON to: {json_output_path}")

    # Add to global list
    all_objects.extend(objects)

    # ---------------- YOLO ANNOTATED IMAGE ----------------
    annotated_img = result.plot()  # BGR
    annotated_img_rgb = cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB)

    # Save annotated image with bounding boxes
    bbox_output_path = BBOX_DIR / image_path.name
    annotated_img_bgr = cv2.cvtColor(annotated_img_rgb, cv2.COLOR_RGB2BGR)
    cv2.imwrite(str(bbox_output_path), annotated_img_bgr)
    print(f"Saved bounding-box image to: {bbox_output_path}")

    # Save depth map as PNG using matplotlib
    depth_output_path = DEPTH_DIR / image_path.name
    plt.imsave(str(depth_output_path), depth_map_norm, cmap="magma")
    print(f"Saved depth map to: {depth_output_path}")


# ---------------- SAVE GLOBAL DETECTIONS JSON ----------------
detections_output = {
    "objects": all_objects
}

with open(BASE_DIR / "detections.json", "w") as f:
    json.dump(detections_output, f, indent=2)

print(f"Saved global detections to: {BASE_DIR / 'detections.json'}")
print("Done.")