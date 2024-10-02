import boto3
from pymongo import MongoClient
import json
from bson.objectid import ObjectId
from bson import json_util
import os

client = MongoClient(os.environ.get('MONGO_URI'))
db = client["industrialdb"] 
col = db["account-collection"] 

def lambda_handler(event, context):
    try:
        request_data = event.get('pathParameters', {})
        account_number = request_data.get('accountNumber')
        points = request_data.get('points')
        
    except Exception as e:
        print(f"Error processing request: {e}")

    try:
        result = decrement_account_points(str(account_number), int(points))
        
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
            'body': 'Error updating account: ' + str(e)
        }

def decrement_account_points(account_number, points):
    query = { "accountNumber" : account_number }
    print("Previous: " + str(list(col.find(query))))
    
    result = col.update_one( #updates accountFrom balance
        query,
        { "$inc": { "currentGreenScore": -points } }
    )
    print(list(col.find(query)))
    
    return list(col.find(query))