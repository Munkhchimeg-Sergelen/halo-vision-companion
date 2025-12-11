import os
from pathlib import Path

from PIL import Image
import pillow_heif


# Register HEIF/HEIC support in Pillow
pillow_heif.register_heif_opener()

# Folder with HEIC frames
FRAMES_DIR = Path("/Users/kevin/Desktop/hackathon/halo-vision-companion/frames")

# Output folder (can be the same or a subfolder)
OUTPUT_DIR = FRAMES_DIR / "png"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def convert_heic_to_png():
    for heic_path in FRAMES_DIR.glob("*.HEIC"):
        # Change extension to .png and put in OUTPUT_DIR
        png_path = OUTPUT_DIR / (heic_path.stem + ".png")

        print(f"Converting {heic_path} -> {png_path}")
        with Image.open(heic_path) as img:
            # Ensure RGB (sometimes HEIC can be different mode)
            img = img.convert("RGB")
            img.save(png_path, "PNG")

    # Also handle lowercase .heic just in case
    for heic_path in FRAMES_DIR.glob("*.heic"):
        png_path = OUTPUT_DIR / (heic_path.stem + ".png")

        print(f"Converting {heic_path} -> {png_path}")
        with Image.open(heic_path) as img:
            img = img.convert("RGB")
            img.save(png_path, "PNG")


if __name__ == "__main__":
    convert_heic_to_png()
    print("Done converting HEIC to PNG.")