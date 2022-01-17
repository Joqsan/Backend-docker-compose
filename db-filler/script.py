from pymongo import MongoClient
import sys
import os
import pandas


def connect_mongo_client(host, port, db_name):
    client = MongoClient(host=host, port=port)
    return client[db_name]


def csv_reader(data_path):

    # result[i] = (values, collection_name)
    data_tuples = []

    # Possible to insert more than one collection into the database
    for files in os.listdir(data_path):
        if files.endswith('.csv'):
            csv_file_path = os.path.join(data_path, files)
            df = pandas.read_csv(csv_file_path, header=None)
            collection_name = files.split('.')[0]
            data_tuples.append((df.values, collection_name))
    return data_tuples


def main():
    db_host = sys.argv[1]
    db_name = sys.argv[2]
    db_port = int(sys.argv[3])
    data_dir = sys.argv[4]

    db = connect_mongo_client(host=db_host, port=db_port, db_name=db_name)
    data = csv_reader(data_dir)

    # Possible to insert more than one collection into the database
    coll_names = []
    coll_lengths = []
    for values, collection_name in data:
        coll_names.append(collection_name)
        coll_lengths.append(values)

        data = [dict([tuple(row)]) for row in values]
        db[collection_name].insert_many(data)

    print('Checking insertion of "{}" collection into the database...'.format(coll_names[0]))

    some_collection = db[coll_names[0]]
    for post in some_collection.find():
        print(post)

    print('Checking that all rows in "{}" where inserted into the database...'.format(coll_names[0]))
    assert(len(coll_lengths[0]) == some_collection.count_documents({}))

    print('Check passed. Data in {}.csv successfully inserted into Mongo database'.format(coll_names[0]))

main()
