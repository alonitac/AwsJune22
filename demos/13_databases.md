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
20. Install PostgreSQL tooling package by
```
sudo apt-get update -y
sudo apt-get install postgresql-server postgresql-contrib -y
```
21. Perform a load test of your DB instance and watch the alarm in action
```shell
PGPASSWORD=<password> pgbench -t 10000 -j 10 -c 10 -U postgres -h <db-url> <table-name>
```
While `<password>` is you db password. `<db-url>` is you RDS database url and `<table-name>` is an existed table.

For more information on the `pgbench` command, read [here](https://www.postgresql.org/docs/current/pgbench.html).

