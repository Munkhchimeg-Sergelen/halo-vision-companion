"""
Cash Detection Application - Main Entry Point
Detects and counts cash in images
"""

import sys
from cash_detector import CashDetector


def main():
    """Main application function"""
    
    print("=" * 60)
    print("💵  CASH DETECTOR")
    print("=" * 60)
    print()
    
    # Initialize with API key - Set as environment variable or replace with your key
    api_key = os.getenv('OPENAI_API_KEY', 'your-api-key-here')
    
    try:
        # Initialize cash detector
        detector = CashDetector(api_key=api_key)
        
        # Check if image path provided as command line argument
        if len(sys.argv) > 1:
            image_path = sys.argv[1]
        else:
            # Ask for image path
            print("Please provide the path to your cash/money image:")
            image_path = input("Image path: ").strip()
        
        # Detect cash
        print(f"\n📸 Processing image: {image_path}")
        print("-" * 60)
        
        cash_data = detector.detect_cash(image_path)
        
        # Display results
        print("\n" + detector.format_cash_text(cash_data))
        print("\n" + "-" * 60)
        
        print("\n✅ Done! Thank you for using Cash Detector.")
        
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
