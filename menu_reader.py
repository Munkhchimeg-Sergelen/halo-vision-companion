"""
Menu Reader Module
Analyzes food menu images using OpenAI Vision API
Extracts menu items, prices, and provides descriptions
"""

import os
import base64
import json
from openai import OpenAI
from pathlib import Path


class MenuReader:
    """Reads and analyzes food menu images using OpenAI Vision API"""
    
    def __init__(self, api_key=None):
        """
        Initialize the Menu Reader
        
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
    
    def read_menu(self, image_path):
        """
        Read and analyze a food menu from an image
        
        Args:
            image_path (str): Path to the menu image
            
        Returns:
            dict: Menu analysis with items and prices
        """
        # Check if file exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Encode image
        base64_image = self.encode_image(image_path)
        
        # Prepare the prompt
        prompt = """You are helping someone read a food menu. Analyze this menu image and extract:

1. All menu items (dishes/food items)
2. Their prices
3. Categories (if visible, like appetizers, mains, desserts, drinks)
4. Any special notes (like "spicy", "vegetarian", "gluten-free", etc.)

Return the response in this JSON format:
{
  "menu_name": "Restaurant/Menu name if visible, otherwise 'Menu'",
  "currency": "Currency symbol (like $, €, £, etc.)",
  "categories": [
    {
      "name": "Category name (like Appetizers, Main Courses, Drinks, etc.)",
      "items": [
        {
          "name": "Item name",
          "price": 0.00,
          "description": "Brief description if available",
          "notes": ["vegetarian", "spicy", etc.]
        }
      ]
    }
  ]
}

Be thorough and include ALL visible items and prices. If you can't determine a price, use 0.00."""

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
                max_tokens=2000,
                temperature=0.2
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
                
                menu_data = json.loads(content)
                return menu_data
            except json.JSONDecodeError:
                # If JSON parsing fails, return raw text
                return {"raw_text": content}
                
        except Exception as e:
            print(f"❌ Error reading menu: {str(e)}")
            raise
    
    def format_menu_text(self, menu_data):
        """
        Format menu data as readable paragraph text
        
        Args:
            menu_data (dict): Parsed menu data
            
        Returns:
            str: Formatted menu text in paragraph style
        """
        if "raw_text" in menu_data:
            return menu_data["raw_text"]
        
        output = []
        menu_name = menu_data.get('menu_name', 'Menu')
        currency = menu_data.get('currency', '$')
        
        for category in menu_data.get('categories', []):
            category_name = category['name']
            items_list = category.get('items', [])
            
            if not items_list:
                continue
            
            # Category introduction
            output.append(f"\nIn our {category_name} section:")
            
            # Build paragraph for items
            item_descriptions = []
            for item in items_list:
                name = item['name']
                price = item.get('price', 0.00)
                description = item.get('description', '')
                notes = item.get('notes', [])
                
                # Build item sentence
                item_text = f"{name} for {currency}{price:.2f}"
                
                if description:
                    item_text += f" - {description}"
                
                if notes:
                    notes_str = ", ".join(notes)
                    item_text += f" ({notes_str})"
                
                item_descriptions.append(item_text)
            
            # Join items into a flowing paragraph
            if len(item_descriptions) == 1:
                output.append(f"We have {item_descriptions[0]}.")
            elif len(item_descriptions) == 2:
                output.append(f"We have {item_descriptions[0]}, and {item_descriptions[1]}.")
            else:
                last_item = item_descriptions[-1]
                other_items = ", ".join(item_descriptions[:-1])
                output.append(f"We have {other_items}, and {last_item}.")
        
        return "\n".join(output)
    
    def get_menu_summary(self, menu_data):
        """
        Get a summary of the menu
        
        Args:
            menu_data (dict): Parsed menu data
            
        Returns:
            str: Menu summary
        """
        if "raw_text" in menu_data:
            return "Menu read successfully (raw format)"
        
        total_items = sum(len(cat.get('items', [])) for cat in menu_data.get('categories', []))
        categories = [cat['name'] for cat in menu_data.get('categories', [])]
        
        summary = f"Menu: {menu_data.get('menu_name', 'Unknown')}\n"
        summary += f"Total Items: {total_items}\n"
        summary += f"Categories: {', '.join(categories)}"
        
        return summary
