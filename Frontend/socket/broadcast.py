import boto3
from pymongo import MongoClient
import json
from bson.objectid import ObjectId
from bson import json_util
import os

client = MongoClient(os.environ.get('MONGO_URI'))
db = client["industrialdb"]
col = db["connections-collection"]

gateway = boto3.client('apigatewaymanagementapi', endpoint_url='https://x3em5ryqid.execute-api.eu-west-1.amazonaws.com/production')


def lambda_handler(event, context):
    request_data = event.get('queryStringParameters', {})
    transaction = request_data.get('transactionID') 
    
    if not transaction:
        return {'statusCode': 400, 'body': 'No transaction details found with ID: ' + str(transaction) + ' with event ' + str(event)}
    
    transaction_message = json_util.dumps(transaction)
    
    connection_ids = col.find({})
    
    for connection in connection_ids:
        connection_id = connection['connectionId']
        
        try:
            details = db['transaction-collection'].find({'_id': ObjectId(transaction)})
            result = list(details)
            
            response = gateway.post_to_connection(
                ConnectionId=connection_id, 
                Data=json_util.dumps(result)  
            )
            print(f"Sent to: {connection_id}")
        
        except gateway.exceptions.GoneException:
            print(f"Connection {connection_id} is no longer valid. Removing from database.")
            col.delete_one({'connectionId': connection_id}) 
        
        except Exception as e:
            print(f"Error sending message to connection {connection_id}: {e}")
    
    return {
        'statusCode': 200,
        'body': 'Broadcast success! Websockets should obtain transaction details of ID: ' + transaction
    }