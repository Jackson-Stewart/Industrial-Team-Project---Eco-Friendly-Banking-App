import json
from bson import json_util
from pymongo import MongoClient
import os

def lambda_handler(event, context):
    try:
        result = fetch_data()
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
            'body': 'An error as occurred: ' + str(e)
        }

def fetch_data():
    client = MongoClient(os.environ.get('MONGO_URI'))
    db = client["industrialdb"]
    col = db["rewards-collection"]

    cursor = col.find()
    result = list(cursor)

    client.close()
    return result