import cv2
import os
from pathlib import Path


# Resolve project root as the parent of the backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Folder with PNG frames
FRAMES_DIR = BASE_DIR / "frames" / "png_depth"

# Output video path
OUTPUT_VIDEO = BASE_DIR / "frames" / "output_video_depth.mp4"

# Frames per second
FPS = 24  # ajusta a lo que quieras


def make_video_from_png():
    # Get list of PNG files, sorted by name
    png_files = sorted(
        [f for f in FRAMES_DIR.iterdir() if f.is_file() and f.suffix.lower() == ".png"]
    )

    if not png_files:
        print(f"No PNG files found in {FRAMES_DIR}")
        return

    # Read first frame to get size
    first_frame = cv2.imread(str(png_files[0]))
    if first_frame is None:
        print(f"Could not read first frame: {png_files[0]}")
        return

    height, width, _ = first_frame.shape

    # Define video writer (mp4v codec)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(OUTPUT_VIDEO), fourcc, FPS, (width, height))

    for png_path in png_files:
        frame = cv2.imread(str(png_path))
        if frame is None:
            print(f"Warning: could not read {png_path}, skipping.")
            continue

        # Si alguna imagen tiene tamaño distinto, la redimensionamos
        if frame.shape[:2] != (height, width):
            frame = cv2.resize(frame, (width, height))

        out.write(frame)
        print(f"Added frame: {png_path}")

    out.release()
    print(f"Video saved to: {OUTPUT_VIDEO}")


if __name__ == "__main__":
    make_video_from_png()