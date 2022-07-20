# Auth Scaling of SQS workers

In this demo, we will scale an Auto Scaling group in response to changes in system load in an Amazon Simple Queue Service (Amazon SQS) queue.

Recall the web app service that lets users ask for YouTube videos to be extracted frame-by-frame. 
We will re-design this app in a microservices architectural style. The Bot service will receive requests from clients, it produces a message to an SQS queue and immediately responds to the client. The Worker service will consume the messages from the queue and do the "hard job" of downloading the video and extract frames. 


![](../.img/botAws.png)

As you can see, the messages are served by the Bot service. 
All it does is sending a message to an SQS queue, so the Bot is a very lightweight service that can serve requests very quickly. 
In the other side, there are Workers that consume messages from the queue and do the hard work - to download the video from youtube and upload it to S3. 
The workers are part of an AutoScaling group. The group is scaled in and out by a custom metric that the Bot service writes to CloudWatch.
The metric can be called `BacklogPerInstance`, as it represents the number of messages in the queue (messages that was not consumed yet) per instance. For example, assume you have 5 workers up and running, and 100 messages in the queue, thus `BacklogPerInstance` equals 20, since each worker instance has to consume ~20 messages to get the queue empty. For more information, [read here](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-using-sqs-queue.html).


## Create launch template

1. Open the Amazon EC2 console at [https://console\.aws\.amazon\.com/ec2/](https://console.aws.amazon.com/ec2/)\.

2. On the navigation pane, under **Instances**, choose **Launch Templates**\.

3. Choose **Create launch template**\. Enter a name and provide a description for the initial version of the launch template\.

4. Under **Auto Scaling guidance**, select the check box to have Amazon EC2 provide guidance to help create a template to use with Amazon EC2 Auto Scaling\.

5. Under **Launch template contents**, fill out each required field and any optional fields as needed\.

   1. **Application and OS Images \(Amazon Machine Image\)**: \(Required\) Choose the ID of the AMI for your instances: **worker-ami-0.0.1**\.

   2. For **Instance type**, choose a single instance type that's compatible with the AMI that you specified\.

   3. **Key pair \(login\)**: For **Key pair name**, choose your existing key pair.

   4. **Network settings**: For **Firewall \(security groups\)**, use one or more security groups, or keep this blank. If you don't specify any security groups in your launch template, Amazon EC2 uses the default security group for the VPC that your Auto Scaling group will launch instances into\.

   5. For **Resource tags**, specify tags by providing key and value combinations\. 

6. Configure advanced settings as follows:
   1. User data should contains the following Bash script:
      ```shell
      cd AwsJune22/youtubeBot
      echo """QUEUE_URL=<sqs-queue-url>
      SQS_REGION=<aws-region>
      ASG_NAME=<your-asg-name>
      BUCKET_NAME=<your-aws-bucket>""" > .env 
      ```

7. When you are ready to create the launch template, choose **Create launch template**\.


## Create an Auto Scaling group using a launch template

1. On the navigation bar at the top of the screen, choose the same AWS Region that you used when you created the launch template\.

2. Choose **Create an Auto Scaling group**\.

3. On the **Choose launch template or configuration** page, do the following:

   1. For **Auto Scaling group name**, enter a name for your Auto Scaling group\.

   1. For **Launch template**, choose an existing launch template\.

   1. For **Launch template version**, choose whether the Auto Scaling group uses the default, the latest, or a specific version of the launch template when scaling out\.

   1. Verify that your launch template supports all of the options that you are planning to use, and then choose **Next**\.

4. On the **Choose instance launch options** page, under **Network**, for **VPC**, choose a VPC\. The Auto Scaling group must be created in the same VPC as the security group you specified in your launch template\.

5. For **Availability Zones and subnets**, choose one or more subnets in the specified VPC\. Use subnets in multiple Availability Zones for high availability\. 

6. Choose **Next** to continue to the next step\.

7. On the **Configure advanced options** page, there is no need to register your Amazon EC2 instances with a load balancer (why???).

8. On the **Configure group size and scaling policies** page, configure the following options, and then choose **Next**:

   1. For **Desired capacity**, enter the initial number of instances to launch: **0**, Minimum capacity: **0**, Maximum can be **2**\.

   2. We will choose **Target tracking scaling policy** later on, for now choose None. 

9. \(Optional\) To receive notifications, for **Add notification**, configure the notification, and then choose **Next**\.

10. Choose **Add tag**, provide a tag key and value. 

11. On the **Review** page, choose **Create Auto Scaling group**\.


## Create a standard SQS queue

1. Open the Amazon SQS console at [https://console\.aws\.amazon\.com/sqs/](https://console.aws.amazon.com/sqs/)\.

2. Choose **Create queue**\.

3. For **Type**, choose **Standard** queue type. 

4. Enter a **Name** for your queue\. 

5. The console sets default values for the queue [configuration parameters](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-configure-queue-parameters.html). Under **Configuration**, you can set new values for the following parameters.

6. Define an **Access policy**\. The [access policy](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-creating-custom-policies-access-policy-examples.html) defines the accounts, users, and roles that can access the queue (we will stay with the default configurations)

7. Choose **Create queue**\. Amazon SQS creates the queue and displays the queue's **Details** page\.

## Create a target tracking scaling policy 

Following [Scaling based on Amazon SQS](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-using-sqs-queue.html) we will create a custom target tracking scaling policy in out autoscaling group. In branch `microservices`, modify `targetTrackingScalingPolicy.json` file according to your parameters and perform: 
```shell
aws autoscaling put-scaling-policy --policy-name sqs-target-tracking-scaling-policy \
  --auto-scaling-group-name <asg-name> --policy-type TargetTrackingScaling \
  --target-tracking-configuration file://targetTrackingScalingPolicy.json
```

## Deploy the service

1. Run you Bot service on a single EC2 instance.
2. Communicate with the service by sending requests.
3. Watch the autoscaling group in a scale out and scale in actions.