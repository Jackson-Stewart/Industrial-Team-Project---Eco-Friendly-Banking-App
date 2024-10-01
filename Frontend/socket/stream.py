from pymongo import MongoClient                                            
import json
from bson.objectid import ObjectId
from bson import json_util
import boto3
import os
import requests

client = MongoClient('mongodb+srv://username:EnohPBc4wAKrqJgQ@industrialcluster.98s8b.mongodb.net/?retryWrites=true&w=majority&appName=industrialcluster')
db = client["industrialdb"]
col = db["transaction-collection"]

def process_transaction_change(change):
    print(f"New transaction with ID: " + str(change['documentKey']))
    transaction_id = change['documentKey'].get('_id')
    
    print(transaction_id)

    try:
        req = requests.get("https://g0lzuiml15.execute-api.eu-west-1.amazonaws.com/prod?transactionID=" + str(transaction_id))
        print(req.status_code)
        print(f"Transaction forwarded with ID: " + str(transaction_id))
    except Exception as e:
        print(f"Error: {str(e)}")

def start():        
    with col.watch([{"$match": {"operationType": "insert"}}]) as stream:
        print("Listening.")
        for change in stream:
            process_transaction_change(change)

start()