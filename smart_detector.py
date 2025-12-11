"""
Smart Detector - Automatically detects whether image contains menu or cash
Routes to appropriate handler
"""

import sys
from menu_reader import MenuReader
from cash_detector import CashDetector


def main():
    """Main application function"""
    
    print("=" * 60)
    print("🤖 SMART DETECTOR - Menu & Cash Recognition")
    print("=" * 60)
    print()
    
    # Initialize with API key - Set as environment variable or replace with your key
    api_key = os.getenv('OPENAI_API_KEY', 'your-api-key-here')
    
    try:
        # Check if image path provided as command line argument
        if len(sys.argv) > 1:
            image_path = sys.argv[1]
        else:
            # Ask for image path
            print("Please provide the path to your image (menu or cash):")
            image_path = input("Image path: ").strip()
        
        print(f"\n📸 Analyzing image: {image_path}")
        print("-" * 60)
        
        # First, detect what's in the image
        print("🔍 Detecting image content...")
        
        # Try cash detection first (it's faster and more specific)
        detector = CashDetector(api_key=api_key)
        cash_data = detector.detect_cash(image_path)
        
        if cash_data.get("has_cash", False):
            # Image contains cash
            print("\n💵 CASH DETECTED!\n")
            print(detector.format_cash_text(cash_data))
        else:
            # Image likely contains a menu, try reading it
            print("\n🍽️ Looks like a menu, reading it...\n")
            reader = MenuReader(api_key=api_key)
            menu_data = reader.read_menu(image_path)
            
            print(reader.format_menu_text(menu_data))
            print("\n" + "-" * 60)
            print(reader.get_menu_summary(menu_data))
        
        print("\n" + "-" * 60)
        print("\n✅ Done! Thank you for using Smart Detector.")
        
    except FileNotFoundError as e:
        print(f"\n❌ Error: {e}")
        print("Please provide a valid image path.")
    except ValueError as e:
        print(f"\n❌ Error: {e}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
