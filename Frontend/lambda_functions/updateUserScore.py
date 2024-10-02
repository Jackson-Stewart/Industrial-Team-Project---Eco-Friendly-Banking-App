from pymongo import MongoClient
import json
from bson import json_util
from datetime import datetime
import os

def lambda_handler(event, context):
    try:
        request_data = event.get('pathParameters', {})
        account_number_from = request_data.get('accountNumberFrom')
        amount = request_data.get('amount')
        calculatedGreenScore = request_data.get('calculatedGreenScore');
    except Exception as e:
        print(f"Error processing request: {e}")
    
    try:
        result = update_user_score(float(amount), float(calculatedGreenScore), str(account_number_from))
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps('Update successful for account number: ' + str(account_number_from))
        }
    
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps('An error has occurred, update failed.' + str(e))
        }
    
def update_user_score(amount, rag, inserted_id):
    client = MongoClient(os.environ.get('MONGO_URI'))
    db = client["industrialdb"]
    col = db["account-collection"]
    
    query = { "accountNumber" : inserted_id }
    addition = round(float(amount) * float(rag))
    print("to add: " + str(addition))
    
    result = col.update_one( #updates accountFrom balance
        query,
        { "$inc": { "currentGreenScore": addition } }
    )
    print(list(col.find(query)))
    
    print(str(amount) + " " + str(rag) + " " + str(inserted_id))