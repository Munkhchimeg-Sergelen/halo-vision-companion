import json
from pathlib import Path
from openai import OpenAI


# Create OpenAI client (API key is read from the OPENAI_API_KEY env var)
client = OpenAI()

# Paths
BASE_DIR = Path("/Users/kevin/Desktop/hackathon/halo-vision-companion")
JSON_INPUT_DIR = BASE_DIR / "frames" / "json_input"
JSON_OUTPUT_DIR = BASE_DIR / "frames" / "json_output_openai"

JSON_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_json(path: Path) -> dict:
    """Load a single JSON file."""
    with path.open("r") as f:
        return json.load(f)


def summarize_scene(scene_json: dict, language: str = "English") -> str:
    """
    Send the JSON for one image to OpenAI and get a natural language description,
    as if you were a clinical assistant helping a blind person.
    """

    payload = {
        "config": {
            "language": language,
            "role": "clinical assistant for a blind person",
            "tone": "warm, non-technical, professional",
            "goal": (
                "Help a blind person understand their surroundings using "
                "clear, simple and professional language."
            ),
        },
        "scene": scene_json,  # contains: image + objects + distance + steps + depth_mean
    }

    prompt = f"""
You receive a JSON with configuration and detected objects from a camera.

Here is the JSON:
{json.dumps(payload, indent=2)}

Instructions:
- Use the information in "config" to decide how to speak.
- The "scene.objects" list contains all detected objects in the image.
- For each object, you have its name, bounding box, prediction score,
  an estimated distance label ("near", "medium", "far") and a rough step count.
- Describe, in clear and simple language, what is visible around the person.
- Explain which objects are near, medium distance and far away.
- Mention how many steps approximately would be needed to reach important objects.
- Use non-technical language, as if you were kindly speaking to a blind person.
- Be empathetic, respectful and professional.
- Focus on orientation and safety: where objects are and how the person might move.
- Avoid listing raw numeric values (coordinates, depth_mean) unless really useful.
- Write the answer in: {language}.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a clinical assistant helping a blind person. "
                    "Your job is to describe their surroundings in a warm, clear, "
                    "non-technical and professional way."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.4,
    )

    return response.choices[0].message.content


def process_all_json_inputs(language: str = "English") -> None:
    """
    Read every JSON in JSON_INPUT_DIR, send to OpenAI,
    and save the response as a .txt file in JSON_OUTPUT_DIR.
    """
    json_files = sorted(
        [p for p in JSON_INPUT_DIR.iterdir() if p.is_file() and p.suffix.lower() == ".json"]
    )

    if not json_files:
        print(f"No JSON files found in {JSON_INPUT_DIR}")
        return

    for json_path in json_files:
        print(f"Processing {json_path} ...")
        scene = load_json(json_path)

        description = summarize_scene(scene, language=language)

        # Output TXT filename matches image json name, e.g. IMG_5436.txt
        txt_filename = json_path.with_suffix(".txt").name
        txt_output_path = JSON_OUTPUT_DIR / txt_filename

        with txt_output_path.open("w") as f:
            f.write(description)

        print(f"Saved OpenAI description to: {txt_output_path}")


if __name__ == "__main__":
    # All outputs in English as requested
    process_all_json_inputs(language="English")