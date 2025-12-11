# Menu Reader & Cash Detector

Python backend for reading food menus and detecting/counting cash using OpenAI Vision API.

## Features

- **📋 Menu Reading**: Reads food menu images and extracts items, prices, and descriptions in paragraph format
- **💵 Cash Detection**: Detects bills and coins in images and calculates total amount
- **🤖 Smart Detection**: Automatically determines if image contains menu or cash

## Setup

1. Install dependencies:
```bash
pip3 install openai pillow python-dotenv
```

2. Set your OpenAI API key:
```bash
export OPENAI_API_KEY='your-openai-api-key-here'
```

Or replace `'your-api-key-here'` in `main.py` with your actual API key.

## Usage

Simply run with any image (menu or cash):

```bash
python3 main.py <image_path>
```

**Examples:**

```bash
# Read a menu
python3 main.py menu_image.jpg

# Detect cash
python3 main.py money.jpg
```

## How It Works

1. **Automatic Detection**: Uses OpenAI Vision API to detect if image contains menu or cash
2. **Smart Routing**: Automatically routes to menu reader or cash detector
3. **Text Output**: Returns clean, simple text output

## Output Examples

**Menu:**
```
In our Main Course section:
We have Fried Rice for $10.00, Sirloin Steak for $11.00...
```

**Cash:**
```
💵 Cash Detected!
Bills:
  • 5 × R$50 bills = R$250.00
TOTAL CASH: R$250.00
```

## Files

- `main.py` - Main entry point (smart detector)
- `menu_reader.py` - Menu reading module
- `cash_detector.py` - Cash detection module
- `cash_calculator.py` - Change calculation utilities
- `requirements.txt` - Python dependencies
