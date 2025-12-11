"""
Cash Calculator Module
Calculates change and provides cash counting assistance
"""


class CashCalculator:
    """Handles cash calculations and change computation"""
    
    def __init__(self, currency_symbol='$'):
        """
        Initialize cash calculator
        
        Args:
            currency_symbol (str): Currency symbol to use
        """
        self.currency_symbol = currency_symbol
    
    def calculate_change(self, total_cost, amount_paid):
        """
        Calculate change from a transaction
        
        Args:
            total_cost (float): Total cost of items
            amount_paid (float): Amount of cash given by customer
            
        Returns:
            dict: Change calculation details
        """
        change = amount_paid - total_cost
        
        result = {
            'total_cost': total_cost,
            'amount_paid': amount_paid,
            'change': change,
            'sufficient': change >= 0,
            'currency': self.currency_symbol
        }
        
        if change >= 0:
            result['message'] = f"Change to return: {self.currency_symbol}{change:.2f}"
            result['breakdown'] = self._breakdown_change(change)
        else:
            result['message'] = f"Insufficient payment. Need {self.currency_symbol}{abs(change):.2f} more."
            result['breakdown'] = []
        
        return result
    
    def _breakdown_change(self, amount):
        """
        Break down change into bills and coins
        
        Args:
            amount (float): Change amount
            
        Returns:
            list: Breakdown of bills and coins
        """
        # Common US denominations (can be customized for other currencies)
        denominations = [
            (100, "hundred"),
            (50, "fifty"),
            (20, "twenty"),
            (10, "ten"),
            (5, "five"),
            (1, "one"),
            (0.25, "quarter"),
            (0.10, "dime"),
            (0.05, "nickel"),
            (0.01, "penny")
        ]
        
        breakdown = []
        remaining = round(amount, 2)
        
        for value, name in denominations:
            count = int(remaining / value)
            if count > 0:
                plural = "pennies" if name == "penny" and count > 1 else (name + "s" if count > 1 else name)
                if value >= 1:
                    breakdown.append(f"{count} {self.currency_symbol}{value:.0f} {plural}")
                else:
                    breakdown.append(f"{count} {plural}")
                remaining = round(remaining - (count * value), 2)
        
        return breakdown
    
    def calculate_total(self, items):
        """
        Calculate total cost of selected items
        
        Args:
            items (list): List of items with prices
            
        Returns:
            dict: Total calculation
        """
        total = sum(item.get('price', 0) for item in items)
        
        return {
            'items': items,
            'total': total,
            'currency': self.currency_symbol,
            'message': f"Total: {self.currency_symbol}{total:.2f}"
        }
    
    def format_transaction_text(self, transaction_data):
        """
        Format transaction data as readable text
        
        Args:
            transaction_data (dict): Transaction details
            
        Returns:
            str: Formatted transaction text
        """
        output = []
        output.append("=== Transaction Summary ===\n")
        
        if 'items' in transaction_data:
            output.append("Items:")
            for item in transaction_data['items']:
                name = item.get('name', 'Unknown item')
                price = item.get('price', 0)
                output.append(f"  • {name}: {self.currency_symbol}{price:.2f}")
            output.append("")
        
        output.append(f"Total Cost: {self.currency_symbol}{transaction_data['total_cost']:.2f}")
        output.append(f"Amount Paid: {self.currency_symbol}{transaction_data['amount_paid']:.2f}")
        
        if transaction_data['sufficient']:
            output.append(f"Change: {self.currency_symbol}{transaction_data['change']:.2f}")
            
            if transaction_data['breakdown']:
                output.append("\nChange Breakdown:")
                for item in transaction_data['breakdown']:
                    output.append(f"  • {item}")
        else:
            output.append(f"⚠️ Insufficient payment!")
            output.append(f"Need {self.currency_symbol}{abs(transaction_data['change']):.2f} more")
        
        return "\n".join(output)
