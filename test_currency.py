#!/usr/bin/env python3
"""
Test script to verify currency functionality
"""
import requests
import json

def test_currency_api():
    """Test if currency is properly returned in API responses"""
    base_url = "http://localhost:8000/api/v1/google-ads"
    
    try:
        # Test customers endpoint
        print("🔍 Testing customers endpoint...")
        customers_response = requests.get(f"{base_url}/customers")
        
        if customers_response.status_code == 200:
            customers_data = customers_response.json()
            customers = customers_data.get('customers', [])
            
            if customers:
                print(f"✅ Found {len(customers)} customers")
                for customer in customers[:3]:  # Show first 3
                    print(f"   📋 {customer['name']}: {customer.get('currency', 'MISSING')} ({customer['id']})")
                
                # Test campaigns endpoint with first customer
                customer_id = customers[0]['id']
                print(f"\n🔍 Testing campaigns endpoint for customer {customer_id}...")
                
                campaigns_response = requests.get(f"{base_url}/campaigns?customer_id={customer_id}")
                
                if campaigns_response.status_code == 200:
                    campaigns_data = campaigns_response.json()
                    campaigns = campaigns_data.get('campaigns', [])
                    
                    if campaigns:
                        print(f"✅ Found {len(campaigns)} campaigns")
                        for campaign in campaigns[:2]:  # Show first 2
                            currency = campaign.get('currency', 'MISSING')
                            cost = campaign.get('metrics', {}).get('cost', 0)
                            print(f"   💰 {campaign['name']}: {currency} | Cost: {cost}")
                    else:
                        print("⚠️ No campaigns found")
                else:
                    print(f"❌ Campaigns API error: {campaigns_response.status_code}")
                    print(campaigns_response.text)
            else:
                print("⚠️ No customers found - may need authentication")
        else:
            print(f"❌ Customers API error: {customers_response.status_code}")
            print(customers_response.text)
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == "__main__":
    test_currency_api() 