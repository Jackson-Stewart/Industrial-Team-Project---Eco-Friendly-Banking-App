import json
from bson import json_util
from pymongo import MongoClient
import os

def lambda_handler(event, context):
    filter_query = {}
    try:
        request_data = event.get('queryStringParameters', {})
        account_number = request_data.get('accountNumber')
        name = request_data.get('name')
        rag = request_data.get('rag')
        spending_category = request_data.get('spendingCategory')

        if account_number:
            filter_query = {"accountNumber": account_number}
        elif name:
            filter_query = {"name": name}
    except Exception as e:
        print(f"Error processing request: {e}")

    try:
        if rag:
            result = fetch_better_rags(rag, spending_category)
        else:
            result = fetch_data(filter_query)
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

def fetch_data(filter_query): #EnohPBc4wAKrqJgQ
    client = MongoClient(os.environ.get('MONGO_URI'))
    db = client["industrialdb"]
    col = db["account-collection"]

    cursor = col.find(filter_query, projection={"_id": False})
    result = list(cursor)

    client.close()
    return result
    
def fetch_better_rags(rag_rating, spending_category):
    client = MongoClient(os.environ.get('MONGO_URI'))
    db = client["industrialdb"]
    col = db["account-collection"]
    
    cursor = col.aggregate([
        {
            '$match': {
                'rag': {
                    '$gt': float(rag_rating)
                },
                "spendingCategory" : spending_category
            },
        }, {
            '$sort': {
                'rag': -1
            }
        }
    ])
    
    print(rag_rating)
    result = list(cursor)
    client.close()
    return result