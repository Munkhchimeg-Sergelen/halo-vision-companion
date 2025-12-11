"""
Smart Image Analyzer - Main Entry Point
Automatically detects and processes menu or cash images
"""

import sys
import os
import base64
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


def main():
    """Main application function"""
    
    try:
        # Get image path
        if len(sys.argv) > 1:
            image_path = sys.argv[1]
        else:
            print("Please provide the path to your image:")
            image_path = input("Image path: ").strip()
        
        # Check if file exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Detect what's in the image
        image_type = detect_image_type(image_path)
        
        # Route to appropriate handler
        if image_type == "cash":
            # Handle cash detection
            detector = CashDetector(api_key=API_KEY)
            cash_data = detector.detect_cash(image_path)
            print(detector.format_cash_text(cash_data))
            
        else:
            # Handle menu reading
            reader = MenuReader(api_key=API_KEY)
            menu_data = reader.read_menu(image_path)
            print(reader.format_menu_text(menu_data))
        
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
