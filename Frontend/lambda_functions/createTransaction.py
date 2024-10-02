from pymongo import MongoClient
import json
from bson import json_util
from datetime import datetime
import os

def lambda_handler(event, context):
    try:
        request_data = event.get('pathParameters', {})
        account_number_from = request_data.get('accountNumberFrom')
        account_number_to = request_data.get('accountNumberTo')
        amount = request_data.get('amount')
        reference = request_data.get('reference')
        calculatedGreenScore = request_data.get('calculatedGreenScore');
    except Exception as e:
        print(f"Error processing request: {e}")
    
    transactionDict = {"accountFrom":account_number_from, "accountTo":account_number_to, "moneyTransferred":float(amount), "calculatedGreenScore": float(calculatedGreenScore), "reference" : reference}  #"reference":reference
    
    try:
        result = post_data(transactionDict, amount)
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
            'body': 'Error processing transaction creation: ' + str(e)
        }

def post_data(transaction_dict, amount):
    client = MongoClient(os.environ.get('MONGO_URI'))
    db = client["industrialdb"]
    col = db["account-collection"]

    if col.count_documents({ 'accountNumber': transaction_dict.get("accountTo") }, limit = 1) == 0: #check accountTo exists
        return_dict = { "message" : "This account could not be found." }
        return return_dict

    result = col.find({ "accountNumber": transaction_dict.get("accountFrom"), "amountOfMoney": {"$gte": float(amount)} })
    result_list = list(result)
    if not result_list: #check accountFrom has enough money
        return_dict = { "message" : "You don't have enough money for this transaction." }
        return return_dict

    result = col.update_one( #updates accountFrom balance
        { "accountNumber": str(transaction_dict.get("accountFrom")) },
        { "$inc": { "amountOfMoney": -float(transaction_dict.get("moneyTransferred")) } }
    )

    result = col.update_one( #updates accountTo balance
        { "accountNumber": str(transaction_dict.get("accountTo")) },
        { "$inc": { "amountOfMoney": float(transaction_dict.get("moneyTransferred")) } }
    )

    col = db["transaction-collection"]
    insert_transaction = col.insert_one(transaction_dict) #inserts record of transaction
    timestamp_query = { "_id" : insert_transaction.inserted_id }
    new_values = { "$set": { "timeStamp": { '$date': (datetime.now().isoformat()) }}}

    col.update_one(timestamp_query, new_values)
    
    cursor = col.find(timestamp_query)
    result = list(cursor)
    client.close()
    return

    