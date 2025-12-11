import json
from openai import OpenAI


# Create OpenAI client (API key is read from the OPENAI_API_KEY env var)
client = OpenAI()


def load_detections(path: str = "detections.json") -> dict:
    """Load YOLO detections JSON from file."""
    with open(path, "r") as f:
        return json.load(f)


def summarize_objects(detections: dict, language: str = "English") -> str:
    """
    Send a JSON with configuration + detections to OpenAI
    and get a natural language description.
    """

    # JSON payload that includes both configuration and scene data
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
        "scene": detections, 
    }

    prompt = f"""
You receive a JSON with configuration and detected objects from a camera.

Here is the JSON:
{json.dumps(payload, indent=2)}

Instructions:
- Use the information in "config" to decide how to speak.
- The "scene" field contains the detected objects in the image.
- Describe, in a clear and simple way, what is visible in the scene.
- Use non-technical language, as if you were kindly speaking to a blind person.
- Be empathetic, respectful and professional.
- Focus on what is relevant for orientation and understanding the environment.
- Avoid listing raw numeric values unless they are really useful.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",  # choose any available model you like
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


if __name__ == "__main__":
    detections = load_detections("detections.json")
    description = summarize_objects(detections, language="English")
    print("\n--- IMAGE DESCRIPTION ---\n")
    print(description)