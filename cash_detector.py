"""
Cash Detector Module
Detects and counts cash/money in images using OpenAI Vision API
Identifies bills and coins and calculates total amount
"""

import os
import base64
import json
from openai import OpenAI


class CashDetector:
    """Detects and counts cash in images using OpenAI Vision API"""
    
    def __init__(self, api_key=None):
        """
        Initialize the Cash Detector
        
        Args:
            api_key (str): OpenAI API key. If None, reads from environment variable
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key not found. Please provide it or set OPENAI_API_KEY environment variable")
        
        self.client = OpenAI(api_key=self.api_key)
    
    def encode_image(self, image_path):
        """
        Encode image to base64
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            str: Base64 encoded image
        """
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def detect_cash(self, image_path):
        """
        Detect and count cash in an image
        
        Args:
            image_path (str): Path to the image with cash
            
        Returns:
            dict: Cash detection results with total amount
        """
        # Check if file exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Encode image
        base64_image = self.encode_image(image_path)
        
        # Prepare the prompt
        prompt = """Analyze this image carefully and detect if there is any cash, money, bills, or coins visible.

If you see cash/money:
1. Identify each bill denomination (like $1, $5, $10, $20, $50, $100, etc.)
2. Count how many of each denomination
3. Identify any coins if visible (quarters, dimes, nickels, pennies, etc.)
4. Calculate the total amount

Return the response in this JSON format:
{
  "has_cash": true,
  "currency": "USD" or appropriate currency code,
  "currency_symbol": "$",
  "bills": [
    {
      "denomination": 20,
      "count": 2,
      "total": 40
    }
  ],
  "coins": [
    {
      "type": "quarter",
      "value": 0.25,
      "count": 3,
      "total": 0.75
    }
  ],
  "total_amount": 40.75,
  "description": "Brief description of what cash you see"
}

If there is NO cash in the image, return:
{
  "has_cash": false,
  "message": "No cash or money detected in this image"
}

Be precise and careful in counting. If you're unsure about a denomination, mention it in the description."""

        try:
            # Call OpenAI Vision API
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
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
                max_tokens=1000,
                temperature=0.1
            )
            
            # Extract the response
            content = response.choices[0].message.content
            
            # Try to parse as JSON
            try:
                # Remove markdown code blocks if present
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()
                
                cash_data = json.loads(content)
                return cash_data
                
            except json.JSONDecodeError:
                # If JSON parsing fails, return raw text
                return {"has_cash": False, "raw_response": content}
                
        except Exception as e:
            print(f"❌ Error detecting cash: {str(e)}")
            raise
    
    def format_cash_text(self, cash_data):
        """
        Format cash detection data as readable text
        
        Args:
            cash_data (dict): Parsed cash detection data
            
        Returns:
            str: Formatted cash text
        """
        if not cash_data.get("has_cash", False):
            return cash_data.get("message", "No cash detected in this image.")
        
        output = []
        currency = cash_data.get("currency_symbol", "$")
        
        output.append("💵 Cash Detected!\n")
        
        # Description
        if cash_data.get("description"):
            output.append(f"{cash_data['description']}\n")
        
        # Bills
        if cash_data.get("bills"):
            output.append("Bills:")
            for bill in cash_data["bills"]:
                denom = bill["denomination"]
                count = bill["count"]
                total = bill["total"]
                output.append(f"  • {count} × {currency}{denom} bill{'s' if count > 1 else ''} = {currency}{total:.2f}")
        
        # Coins
        if cash_data.get("coins"):
            output.append("\nCoins:")
            for coin in cash_data["coins"]:
                coin_type = coin["type"]
                count = coin["count"]
                total = coin["total"]
                output.append(f"  • {count} × {coin_type}{'s' if count > 1 else ''} = {currency}{total:.2f}")
        
        # Total
        total_amount = cash_data.get("total_amount", 0)
        output.append(f"\n{'='*40}")
        output.append(f"TOTAL CASH: {currency}{total_amount:.2f}")
        output.append(f"{'='*40}")
        
        return "\n".join(output)
    
    def get_total_only(self, cash_data):
        """
        Get just the total amount of cash
        
        Args:
            cash_data (dict): Parsed cash detection data
            
        Returns:
            str: Simple total message
        """
        if not cash_data.get("has_cash", False):
            return "No cash detected."
        
        total = cash_data.get("total_amount", 0)
        currency = cash_data.get("currency_symbol", "$")
        
        return f"Total cash detected: {currency}{total:.2f}"
