from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt
import json

# Load YOLO model
model = YOLO("/Users/kevin/Desktop/hackathon/halo-vision-companion/models/yolo11n.pt")

# Input image path
image_path = "/Users/kevin/Desktop/hackathon/halo-vision-companion/images/IMG_5435.png"

# Run inference
results = model(image_path)

# Take first result (one image)
result = results[0]
boxes = result.boxes

# ---------------- JSON WITH OBJECTS ----------------
objects = []

for box in boxes:
    # Bounding box coordinates
    x1, y1, x2, y2 = box.xyxy[0].tolist()
    # Confidence score
    conf = float(box.conf[0])
    # Class id and name
    class_id = int(box.cls[0])
    class_name = result.names[class_id]

    # Add object to list
    objects.append(
        {
            "name": class_name,
            "prediction": conf,
            "bbox": [x1, y1, x2, y2],
        }
    )

# Final JSON-like structure
output = {
    "objects": objects
}

# Save JSON to file so open_api.py can read it
with open("detections.json", "w") as f:
    json.dump(output, f, indent=2)

print("Saved detections to detections.json")
print(json.dumps(output, indent=2))

# ---------------- PLOT WITH BOUNDING BOXES ----------------
# result.plot() returns an image (BGR) with boxes drawn
annotated_img = result.plot()

# Convert BGR (OpenCV) to RGB (matplotlib)
annotated_img_rgb = cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB)

plt.figure(figsize=(8, 6))
plt.imshow(annotated_img_rgb)
plt.axis("off")
plt.title("YOLO Detections")
plt.show()