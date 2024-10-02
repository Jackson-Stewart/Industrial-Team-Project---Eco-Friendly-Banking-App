from pymongo import MongoClient
import json
from bson import json_util
from datetime import datetime
import os
from bson.objectid import ObjectId

client = MongoClient(os.environ.get('MONGO_URI'))
db = client["industrialdb"] 
transaction_collection = db["transaction-collection"] 
account_collection = db["account-collection"]

# Get transaction ID, then get accountFrom ID, then check previous two transactions by timestamp, then check calculatedGreenScore > 0.7
# increment if so.

def lambda_handler(event, context):
    try:
        request_data = event.get('pathParameters', {})
        account_id = request_data.get('accountNumber')
    except Exception as e:
        print(f"Error processing request: {e}")

    try:
        result = get_previous_transactions(account_id)
        print(result)
    
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps(result, default=json_util.default)
        }
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': 'An error has occurred: ' + str(e)
        }

def get_previous_transactions(in_id):
    docs = transaction_collection.find({ "accountFrom" : in_id }).sort({"_id": -1}).limit(2) # Get the two latest transactions
    counter = 0
    for item in docs:
        if (float(item.get("calculatedGreenScore")) > 0.7):
            counter = counter + 1
            
            if counter == 2:
                return increment_streak(in_id)
        else:
            decrement_streak(in_id)
            return False
            
def increment_streak(in_id):
    try:
        doc = account_collection.find({"accountNumber": in_id}, projection={'currentStreak': 1, '_id': 0})
        
        for item in doc:
            streak = item.get('currentStreak')
            print(streak)
            print(f"Current streak: " + str(streak))
            if streak >= 3:
                return True # Cap at streak level 3
            else:
                query = {"accountNumber": in_id}
                print(list(doc))
                result = account_collection.update_one( #updates accountFrom balance
                    query,
                    { "$inc": { "currentStreak": 1 } }
                )
    
        return True # If not at cap, increment level
    except Exception as e:
        print("Error at incrementing streak: " + str(e))
        return False
    
def decrement_streak(in_id):
    query = {"accountNumber": in_id}
    result = account_collection.update_one( #updates accountFrom balance
        query,
        { "$set": { "currentStreak": int(0) } }
    ) 