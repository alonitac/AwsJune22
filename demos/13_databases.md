# Relational Databases

## Provision Postgres using RDS


1. Open the Amazon RDS console at [https://console\.aws\.amazon\.com/rds/](https://console.aws.amazon.com/rds/)\.

2. In the navigation pane, choose **Databases**\.

3. Choose **Create database** and make sure that **Standard create** is chosen\.   

4. In **Configuration**, choose **PostgreSQL**\.

5. For **DB instance size**, choose **Dev/Test**\ and choose **Multi-AZ DB instance** in **Availability and durability**.

6. For **DB instance identifier**, enter a name for the DB instance.

7. For **Master username**, leave the default name \(**postgres**\)\.

8. Enter your master password, and then enter the same password **Confirm password**\.

9. Choose a DB instance according to your needs (**the smallest**).
10. Under **Connectivity**, **Public access** choose **Yes**.
11. Choose **Create database**\.

## Create tables, insert and retrieve data

1. Install the `psql` cli tool, which is the client for Postgres used from the terminal.  
If you work from a Linux EC2 instance, install by:
   ```shell
   sudo apt-get update
   sudo apt-get install postgresql-client
   ```
   
    or using the [Windows installer](https://www.postgresql.org/download/windows/) to work from your local machine.
   

   Start Postgres shell by `psql postgres://<db-username>:<db-password>@<db-endpoint>:5432`

2. Create a database in Postgres (drop previous is exists)
   ```shell
   DROP DATABASE IF EXISTS demo_db;
   CREATE DATABASE demo_db;
   ```
3. Switch to `demo_db` db by `\c demo_db`.
4. Create tables:
   ```text
   CREATE TABLE users (
   full_name VARCHAR(100),
   username VARCHAR(100) PRIMARY KEY
   );
   ```

5. Insert data
   ```text
   INSERT INTO users (full_name, username) VALUES ('John Doe', 'johnd');
   ```
   
6. Retrieve some data  
     ```shell
     SELECT * FROM users;
     ```

## Test failover for your DB instance

We would like to understand how long the failover process takes for your particular use case and to ensure that the application that accesses your DB instance can automatically connect to the new DB instance after failover occurs.

Reboot a DB instance to simulate a failover

1. Open the Amazon RDS console at [https://console\.aws\.amazon\.com/rds/](https://console.aws.amazon.com/rds/)\.

1. In the navigation pane, choose **Databases**, and then choose the DB instance that you want to reboot\.

1. For **Actions**, choose **Reboot**\.

   The **Reboot DB Instance** page appears\.

1. Choose **Reboot with failover?** to force a failover from one AZ to another\.

1. Choose **Reboot** to reboot your DB instance\.



## Monitoring and alerting for an RDS database

1. Open the CloudWatch console at [https://console\.aws\.amazon\.com/cloudwatch/](https://console.aws.amazon.com/cloudwatch/)\.

2. In the navigation pane, choose **Alarms**, **All alarms**\.

3. Choose **Create alarm**\.

4. On the **Specify metric and conditions** page, choose **Select metric**\.

5. In the search box, enter the name of your RDS database and press Enter\.

6. Choose **RDS**, **Per\-Database Metrics**\.

7. In the search box, enter **IOPS** and press Enter, then select **ReadIOPS** and **WriteIOPS** metrics. The graph will show both read and write i/o operations metric for your db.

8. We would like to base the alarm on the total sum of read + write i/o. From **Add math**, choose **All functions**, **SUM**\.

9. Choose the **Graphed metrics** tab, and edit the details for **Expression1** to **TotalIOPS**\.

10. Change the **Period** to **1 minute**\.

11. Clear selection from all metrics except for **TotalIOPS**\.

12. Choose **Select metric**\.

13. On the **Specify metric and conditions** page, enter a number of IOPS in **Define the threshold value**\.
    For this tutorial, enter **100**. You can adjust this value for your workload requirements\.

14. Choose **Next**, and the **Configure actions** page appears\.

15. Keep **In alarm** selected, choose **Create new topic**, and enter the topic name and a valid email address\.

16. Choose **Create topic**, and then choose **Next**\.

17. On the **Add name and description** page, enter the **Alarm name** and **Alarm description**, and then choose **Next**\.

18. Preview the alarm that you're about to create on the **Preview and create** page, and then choose **Create alarm**\.

#### Testing your alarm

It is very important to test all the alarms you set, in production environment if possible.

19. Connect to an EC2 instance in the same region of your DB instance.
20. Install PostgreSQL tooling package by:
```
sudo apt-get update -y
sudo apt-get install postgresql-server postgresql-contrib -y
```
21. Create a database by connect to the database:
```shell
psql postgres://<db-username>:<db-password>@<db-endpoint>:5432
```
and `CREATE DATABASE <postgres-internal-db-name>;`.
23. Initialize the benchmark settings
```shell
PGPASSWORD=<password> pgbench -i -U postgres -h <db-url> <postgres-internal-db-name>
```
24. Perform a load test of your DB instance and watch the alarm in action
```shell
PGPASSWORD=<password> pgbench -t 10000 -j 10 -c 10 -U postgres -h <db-url> <postgres-internal-db-name>
```
While `<password>` is you db password. `<db-url>` is you RDS database url and `<postgres-internal-db-name>` is an existed table.

For more information on the `pgbench` command, read [here](https://www.postgresql.org/docs/current/pgbench.html).

## DynamoDB 

### Create a table

1. Open the DynamoDB console at [https://console.aws.amazon.com/dynamodb/](https://console.aws.amazon.com/dynamodb/)
2. In the navigation pane on the left side of the console, choose **Dashboard**.
3. On the right side of the console, choose **Create Table**.
4. Enter the table details as follows:
   1. For the table name, enter a unique table name.
   2. For the partition key, enter `Artist`.
   3. Enter `SongTitle` as the sort key.
   4. Choose **Customize settings**.
   5. On **Read/write capacity settings** choose **Provisioned** mode with autoscale capacity with a minimum capacity of **1** and maximum of **10**.
5. Choose **Create** to create the table.

### Write and read data


1. On DynamoDB web console page, choose **PartiQL editor** on the left side menu.
2. The following example creates several new items in the `<table-name>` table. The [PartiQL](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.html) is
   a SQL-compatible query language for DynamoDB.

```shell
INSERT INTO "<table-name>" VALUE {'Artist':'No One You Know','SongTitle':'Call Me Today', 'AlbumTitle':'Somewhat Famous', 'Awards':'1'}

INSERT INTO "<table-name>" VALUE {'Artist':'No One You Know','SongTitle':'Howdy', 'AlbumTitle':'Somewhat Famous', 'Awards':'2'}

INSERT INTO "<table-name>" VALUE {'Artist':'Acme Band','SongTitle':'Happy Day', 'AlbumTitle':'Songs About Life', 'Awards':'10'}
                            
INSERT INTO "<table-name>" VALUE {'Artist':'Acme Band','SongTitle':'PartiQL Rocks', 'AlbumTitle':'Another Album Title', 'Awards':'8'}
```

Query the data by

```shell
SELECT * FROM "<table-name>" WHERE Artist='Acme Band' AND SongTitle='Happy Day'
```

### Create and query a global secondary index 

1. In the navigation pane on the left side of the console, choose **Tables**.
2. Choose your table from the table list.
3. Choose the **Indexes** tab for your table.
4. Choose **Create** index.
5. For the **Partition key**, enter `AlbumTitle`.
6. For **Index** name, enter `AlbumTitle-index`.
7. Leave the other settings on their default values and choose **Create** index.

8. You query the global secondary index through PartiQL by using the Select statement and providing the index name
```shell
SELECT * FROM "<table-name>"."AlbumTitle-index" WHERE AlbumTitle='Somewhat Famous'
```


### Process new items with DynamoDB Streams and Lambda

#### Enable Streams 

1. In the navigation pane on the left side of the console, choose **Tables**.
2. Choose your table from the table list.
3. Choose the **Exports and streams** tab for your table.
4. Under **DynamoDB stream details** choose **Enable**.
5. Choose **New and old images** and click **Enable stream**.

#### (Optional) Create Lambda execution IAM role

1. Open the IAM console at [https://console\.aws\.amazon\.com/iam/](https://console.aws.amazon.com/iam/)\.

2. In the navigation pane, choose **Roles**, **Create role**\.

3. On the **Trusted entity type** page, choose **AWS service** and the **Lambda** use case\.

4. On the **Review** page, enter a name for the role and choose **Create role**\.
5. Edit your IAM role with the following inline policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "lambda:InvokeFunction",
            "Resource": "arn:aws:lambda:<region>:<accountID>:function:<lambda-func-name>*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:<region>:<accountID>:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:DescribeStream",
                "dynamodb:GetRecords",
                "dynamodb:GetShardIterator",
                "dynamodb:ListStreams"
            ],
            "Resource": "arn:aws:dynamodb:<region>:<accountID>:table/<dynamo-table-name>/stream/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "sns:Publish"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

Change the following placeholders to the appropriate values: `<region>`, `<accountID>`, `<dynamo-table-name>`, `<lambda-func-name>`


The policy has four statements that allow your role to do the following:
+ Run a Lambda function. You create the function later in this tutorial\.
+ Access Amazon CloudWatch Logs\. The Lambda function writes diagnostics to CloudWatch Logs at runtime\.
+ Read data from the DynamoDB stream.
+ Publish messages to Amazon SNS\.

#### Create a Lambda Function

1. Open the [Functions page](https://console.aws.amazon.com/lambda/home#/functions) of the Lambda console\.

2. Choose **Create function**\.

3. Under **Basic information**, do the following:

   1. Enter **Function name**.

   2. For **Runtime**, confirm that **Node\.js 16\.x** is selected\. 

   3. For **Permissions** use your created role or `arn:aws:iam::964849360084:role/LambdaDynamoEvents` alternatively.

4. Choose **Create function**\.
5. Enter your function, copy the content of `publishNewSong.js` and paste it in the **Code source**. Change `<TOPIC-ARN>` to your SNS topic ARN you created in the previous exercise.
6. Click the **Deploy** button.
7. On the same page, click **Add trigger** and choose your Dynamo table as a source trigger. 
8. Test your Lambda function by creating new items in the Dynamo table and watch for new emails in your inbox. 

   