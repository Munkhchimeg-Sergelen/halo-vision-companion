"""
Smart Image Analyzer - Main Entry Point
Automatically detects and processes menu or cash images
"""

import sys
import os
import base64
import shutil
from pathlib import Path
from datetime import datetime
from openai import OpenAI
from menu_reader import MenuReader
from cash_detector import CashDetector


# API Key - Set this as environment variable or replace with your key
API_KEY = os.getenv('OPENAI_API_KEY', 'your-api-key-here')


def detect_image_type(image_path):
    """
    Use OpenAI to detect what's in the image (menu or cash)
    
    Args:
        image_path (str): Path to the image
        
    Returns:
        str: 'menu' or 'cash'
    """
    # Encode image
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    
    # Ask OpenAI what's in the image
    client = OpenAI(api_key=API_KEY)
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Look at this image and tell me: Does it contain a FOOD MENU or CASH/MONEY?

Respond with ONLY ONE WORD:
- "MENU" if you see a food menu, restaurant menu, price list, or menu board
- "CASH" if you see bills, coins, money, currency, or cash

Just one word: MENU or CASH"""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=10,
        temperature=0
    )
    
    result = response.choices[0].message.content.strip().upper()
    
    if "CASH" in result or "MONEY" in result:
        return "cash"
    else:
        return "menu"


def save_to_file(content, image_path, output_type):
    """
    Save the analysis result to a text file
    
    Args:
        content (str): The text content to save
        image_path (str): Original image path
        output_type (str): Type of output ('menu' or 'cash')
    
    Returns:
        str: Path to the saved file
    """
    # Create output directory if it doesn't exist
    output_dir = "output"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Find next available number
    counter = 1
    while True:
        output_filename = f"output{counter}.txt"
        output_path = os.path.join(output_dir, output_filename)
        if not os.path.exists(output_path):
            break
        counter += 1
    
    # Write content to file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return output_path


def main():
    """Main application function"""
    
    try:
        # Get image path
        if len(sys.argv) > 1:
            image_path = sys.argv[1]
        else:
            print("Please provide the path to your image (relative to repo):")
            image_path = input("Image path: ").strip()
        
        # Get the directory where the script is located (repo root)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # If path is not absolute, make it relative to script directory
        if not os.path.isabs(image_path):
            image_path = os.path.join(script_dir, image_path)
        
        # Check if file exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Detect what's in the image
        image_type = detect_image_type(image_path)
        
        # Route to appropriate handler and get result
        if image_type == "cash":
            # Handle cash detection
            detector = CashDetector(api_key=API_KEY)
            cash_data = detector.detect_cash(image_path)
            result_text = detector.format_cash_text(cash_data)
            output_type = "cash"
            
        else:
            # Handle menu reading
            reader = MenuReader(api_key=API_KEY)
            menu_data = reader.read_menu(image_path)
            result_text = reader.format_menu_text(menu_data)
            output_type = "menu"
        
        # Save result to file
        output_path = save_to_file(result_text, image_path, output_type)
        
        # Copy to public/ for voice pipeline to read
        project_root = Path(__file__).resolve().parent
        public_dir = project_root / "public"
        public_dir.mkdir(parents=True, exist_ok=True)
        fixed_output = public_dir / "menu_cash_output.txt"
        shutil.copy(output_path, fixed_output)
        print(f"📢 Copied to voice pipeline: {fixed_output}")
        
        # Print success message
        print(f"✅ Analysis complete!")
        print(f"📄 Output saved to: {output_path}")
        print(f"\n--- Content Preview ---")
        print(result_text[:200] + "..." if len(result_text) > 200 else result_text)
        
    except FileNotFoundError as e:
        print(f"\n❌ Error: {e}")
    except ValueError as e:
        print(f"\n❌ Error: {e}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
