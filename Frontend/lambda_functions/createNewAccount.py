import json
from bson import json_util
import random
import decimal
import os
from pymongo import MongoClient

def lambda_handler(event, context):
    new_username = {}
    try:
        request_data = event.get('pathParameters', {})
        name = request_data.get('name')
        print(request_data)
        if name:
            new_username = {"name": name}
    except Exception as e:
        print(f"Error processing request: {e}")

    try:
        result = post_data(new_username)
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

def post_data(user_dict):
    client = MongoClient(os.environ.get('MONGO_URI'))
    db = client["industrialdb"]
    col = db["account-collection"]
    
    generated_balance = decimal.Decimal(random.randrange(100, 357829))/100
    user_dict.update({"amountOfMoney": float(generated_balance),"currentGreenScore": 0, "currentStreak": 0})
    col.insert_one(user_dict)
    
    cursor = col.find({"name": user_dict.get("name")}, projection={"_id": False})
    result = list(cursor)

    client.close()
    return result