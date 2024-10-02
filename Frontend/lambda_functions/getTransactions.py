from pymongo import MongoClient
import json
from bson.objectid import ObjectId
from bson import json_util

def lambda_handler(event, context):
    try:
        request_data = event.get('queryStringParameters', {})
        account_number = request_data.get('accountNumber')
        transaction_id = request_data.get('id')

    except Exception as e:
        print(f"Error processing request: {e}")
    
    # result = fetch_data(filter_query)
    full_result = fetch_full_details(account_number, transaction_id)

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(full_result, default=json_util.default)
    }
    
def fetch_full_details(in_account_number, in_id):
    client = MongoClient(os.environ.get('MONGO_URI'))
    db = client["industrialdb"]
    col = db["account-collection"]
    print(in_account_number, ObjectId(in_id))

    # This godforbidden aggregation returns the account information of the original sender
    # of one specified transaction ID
    if in_id: 
            cursor = col.aggregate([
        {
            '$lookup': {
                'from': 'transaction-collection', 
                'localField': 'accountNumber', 
                'foreignField': 'accountFrom', 
                'as': 'transaction-info'
            }
        }, 
        {
            '$match': {
                'accountNumber': in_account_number
            }
        }, {
            '$unwind': {
                'path': '$transaction-info', 
                'includeArrayIndex': 'string', 
                'preserveNullAndEmptyArrays': True
            }
        }, {
            '$project': {
                'name': 1, 
                'transaction_id': '$transaction-info._id', 
                'accountNumber': 1, 
                'accountNumberTo': '$transaction-info.accountTo', 
                'timestamp': '$transaction-info.timeStamp', 
                'moneyTransferred': '$transaction-info.moneyTransferred', 
                'calculatedGreenScore': '$transaction-info.calculatedGreenScore',
                'reference' : '$transaction-info.reference'
            }
        }, {
            '$unset': '_id'
        }, {
            '$match': {
                'transaction_id': ObjectId(in_id)
            }
        }, {
            '$lookup': {
                'from': 'account-collection', 
                'localField': 'accountNumberTo', 
                'foreignField': 'accountNumber', 
                'as': 'account-info'
            }
        }, {
            '$unwind': {
                'path': '$account-info', 
                'includeArrayIndex': 'string', 
                'preserveNullAndEmptyArrays': True
            }
        }, {
            '$project': {
                'name': 1, 
                'transaction_id': 1, 
                'accountNumber': 1, 
                'accountNumberTo': 1, 
                'timestamp': 1, 
                'moneyTransferred': 1, 
                'calculatedGreenScore': 1, 
                'reference' : 1,
                'recipientName': '$account-info.name',
                'spendingCategory' : '$account-info.spendingCategory',
                'wasteManagementRating' : '$account-info.wasteManagementRating',
                'carbonEmissionRating' : '$account-info.carbonEmissionRating',
                'sustainabilityPracticesRating' : '$account-info.sustainabilityPracticesRating'
            }
        }, {
            '$sort': {
                'timestamp': -1
            }
        }
    ])
    
    else:
        cursor = col.aggregate([
        {
            '$lookup': {
                'from': 'transaction-collection', 
                'localField': 'accountNumber', 
                'foreignField': 'accountFrom', 
                'as': 'transaction-info'
            }
        }, {
            '$match': {
                'accountNumber': in_account_number
            }
        }, {
            '$unwind': {
                'path': '$transaction-info', 
                'includeArrayIndex': 'string', 
                'preserveNullAndEmptyArrays': False
            }
        }, {
            '$project': {
                'name': 1, 
                'transaction_id': '$transaction-info._id', 
                'accountNumber': 1, 
                'accountNumberTo': '$transaction-info.accountTo', 
                'timestamp': '$transaction-info.timeStamp', 
                'moneyTransferred': '$transaction-info.moneyTransferred', 
                'calculatedGreenScore': '$transaction-info.calculatedGreenScore'
            }
        }, {
            '$unset': '_id'
        }, {
            '$lookup': {
                'from': 'account-collection', 
                'localField': 'accountNumberTo', 
                'foreignField': 'accountNumber', 
                'as': 'account-info'
            }
        }, {
            '$unwind': {
                'path': '$account-info', 
                'includeArrayIndex': 'string', 
                'preserveNullAndEmptyArrays': False
            }
        }, {
            '$project': {
                'name': 1, 
                'transaction_id': 1, 
                'accountNumber': 1, 
                'accountNumberTo': 1, 
                'timestamp': 1, 
                'moneyTransferred': 1, 
                'calculatedGreenScore': 1, 
                'recipientName': '$account-info.name',
                'spendingCategory' : '$account-info.spendingCategory'
            }
        }, {
            '$sort': {
                'timestamp': -1
            }
        }
        ])
        
        getPositiveItems = col.aggregate([
        {
            '$lookup': {
                'from': 'transaction-collection', 
                'localField': 'accountNumber', 
                'foreignField': 'accountTo', 
                'as': 'transaction-info'
            }
        }, {
            '$match': {
                'accountNumber': in_account_number
            }
        }, {
            '$unwind': {
                'path': '$transaction-info', 
                'includeArrayIndex': 'string', 
                'preserveNullAndEmptyArrays': False
            }
        }, {
            '$project': {
                'name': 1, 
                'transaction_id': '$transaction-info._id', 
                'accountNumber': 1, 
                'accountNumberFrom': '$transaction-info.accountFrom', 
                'timestamp': '$transaction-info.timeStamp', 
                'moneyTransferred': '$transaction-info.moneyTransferred', 
                'calculatedGreenScore': '$transaction-info.calculatedGreenScore', 
                'reference': '$transaction-info.reference'
            }
        }, {
            '$unset': [
                '_id', 'name'
            ]
        }, {
            '$lookup': {
                'from': 'account-collection', 
                'localField': 'accountNumberFrom', 
                'foreignField': 'accountNumber', 
                'as': 'account-info'
            }
        }, {
            '$unwind': {
                'path': '$account-info', 
                'includeArrayIndex': 'string', 
                'preserveNullAndEmptyArrays': False
            }
        }, {
            '$project': {
                'recipientName': '$account-info.name', 
                'transaction_id': 1, 
                'accountNumber': 1, 
                'accountNumberTo': '$account-info.accountNumber', 
                'timestamp': 1, 
                'moneyTransferred': 1, 
                'calculatedGreenScore': 1, 
                'reference': 1
            }
        }
    ])
    
    
    result = list(cursor)
    print(result)
    if not in_id:
        full = result + list(getPositiveItems)
    else:
        full = result
    client.close()
    return full
