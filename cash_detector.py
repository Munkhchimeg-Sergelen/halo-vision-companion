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
        Format cash detection data as readable paragraph text for TTS
        
        Args:
            cash_data (dict): Parsed cash detection data
            
        Returns:
            str: Formatted cash text in paragraph style
        """
        if not cash_data.get("has_cash", False):
            return cash_data.get("message", "No cash detected in this image.")
        
        output = []
        currency = cash_data.get("currency_symbol", "$")
        total_amount = cash_data.get("total_amount", 0)
        
        # Opening statement
        output.append("I can see cash in this image.")
        
        # Describe bills in paragraph format
        bills = cash_data.get("bills", [])
        if bills:
            bill_descriptions = []
            for bill in bills:
                denom = bill["denomination"]
                count = bill["count"]
                if count == 1:
                    bill_descriptions.append((f"one {currency}{denom} bill", True))  # (text, is_singular)
                elif count == 2:
                    bill_descriptions.append((f"two {currency}{denom} bills", False))
                else:
                    bill_descriptions.append((f"{count} {currency}{denom} bills", False))
            
            # Check if first item is singular for proper grammar
            if len(bill_descriptions) == 1:
                text, is_singular = bill_descriptions[0]
                verb = "is" if is_singular else "are"
                output.append(f"There {verb} {text}.")
            elif len(bill_descriptions) == 2:
                text1, _ = bill_descriptions[0]
                text2, _ = bill_descriptions[1]
                output.append(f"There are {text1} and {text2}.")
            else:
                texts = [desc[0] for desc in bill_descriptions]
                last_bill = texts[-1]
                other_bills = ", ".join(texts[:-1])
                output.append(f"There are {other_bills}, and {last_bill}.")
        
        # Describe coins in paragraph format
        coins = cash_data.get("coins", [])
        if coins:
            coin_descriptions = []
            for coin in coins:
                coin_type = coin["type"]
                count = coin["count"]
                if count == 1:
                    coin_descriptions.append(f"one {coin_type}")
                elif count == 2:
                    coin_descriptions.append(f"two {coin_type}s")
                else:
                    coin_descriptions.append(f"{count} {coin_type}s")
            
            if len(coin_descriptions) == 1:
                output.append(f"There is also {coin_descriptions[0]}.")
            elif len(coin_descriptions) == 2:
                output.append(f"There are also {coin_descriptions[0]} and {coin_descriptions[1]}.")
            else:
                last_coin = coin_descriptions[-1]
                other_coins = ", ".join(coin_descriptions[:-1])
                output.append(f"There are also {other_coins}, and {last_coin}.")
        
        # Total in natural language
        output.append(f"The total amount of cash is {currency}{total_amount:.2f}.")
        
        return " ".join(output)
    
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
