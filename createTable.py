import logging
import pymysql
import boto3
import json
import base64


rds_host = 'movies-api-db.czvuvxwvlsiv.us-east-1.rds.amazonaws.com' # os.environ['RDS_HOST']
name = 'admin'  # os.environ['RDS_USERNAME']
secret_name = 'movies-api-db'  # os.environ['SECRET_NAME']
db_name = 'moviesdb'  # os.environ['RDS_DB_NAME']
table_name = 'movies'  # os.environ['RDS_Table_NAME']

conn = None


def openConnection():
    global conn
    # password = "None"
    # # Create a Secrets Manager client
    # session = boto3.session.Session()
    # client = session.client(service_name='secretsmanager', region_name='us-east-1')
    #
    # get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    # print(get_secret_value_response)
    #
    # # Decrypts secret using the associated KMS CMK.
    # # Depending on whether the secret is a string or binary, one of these fields will be populated.
    # if 'SecretString' in get_secret_value_response:
    #     secret = get_secret_value_response['SecretString']
    #     j = json.loads(secret)
    #     password = j['password']
    # else:
    #     decoded_binary_secret = base64.b64decode(get_secret_value_response['SecretBinary'])
    #     print("password binary:" + decoded_binary_secret)
    #     password = decoded_binary_secret.password

    conn = pymysql.connect(host=rds_host, user=name, passwd='12345678')


def lambda_handler():
    try:
        # Create Table and insert sample data
        openConnection()

        with conn.cursor() as cur:
            #Create DB
            # cur.execute("drop database moviesdb")
            cur.execute("create database moviesdb")
            cur.execute('use '+ db_name)
            #Create Table
            create_table_sql = 'create table ' + table_name +  '( id  int NOT NULL, Name varchar(255) NOT NULL, PRIMARY KEY (id))'
            #cur.execute("create table Players ( id  int NOT NULL, Name varchar(255) NOT NULL, PRIMARY KEY (id))")
            cur.execute(create_table_sql)
            cur.execute('insert into ' + table_name + ' (id, Name) values(1, "The Godfather")')
            cur.execute('insert into ' + table_name + ' (id, Name) values(2, "The Dark Knight")')
            cur.execute('insert into ' + table_name + ' (id, Name) values(3, "The Lord of the Rings")')
            cur.execute('insert into ' + table_name + ' (id, Name) values(4, "Pulp Fiction")')
            cur.execute('insert into ' + table_name + ' (id, Name) values(5, " Forrest Gump")')
            cur.execute('insert into ' + table_name + ' (id, Name) values(6, "Inception")')
            cur.execute('insert into ' + table_name + ' (id, Name) values(7, "The Green Mile")')
            cur.execute('insert into ' + table_name + ' (id, Name) values(8, "City of God")')
            conn.commit()

    except Exception as e:
        # Error while opening connection or processing
        print(e)


lambda_handler()
