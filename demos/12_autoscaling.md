# Auth Scaling

## Create launch template

1. Open the Amazon EC2 console at [https://console\.aws\.amazon\.com/ec2/](https://console.aws.amazon.com/ec2/)\.

2. On the navigation pane, under **Instances**, choose **Launch Templates**\.

3. Choose **Create launch template**\. Enter a name and provide a description for the initial version of the launch template\.

4. Under **Auto Scaling guidance**, select the check box to have Amazon EC2 provide guidance to help create a template to use with Amazon EC2 Auto Scaling\.

5. Under **Launch template contents**, fill out each required field and any optional fields as needed\.

   1. **Application and OS Images \(Amazon Machine Image\)**: \(Required\) Choose the ID of the AMI for your instances\.

   2. For **Instance type**, choose a single instance type that's compatible with the AMI that you specified\.

   3. **Key pair \(login\)**: For **Key pair name**, choose your existing key pair.

   4. **Network settings**: For **Firewall \(security groups\)**, use one or more security groups, or keep this blank. If you don't specify any security groups in your launch template, Amazon EC2 uses the default security group for the VPC that your Auto Scaling group will launch instances into\.

   5. For **Resource tags**, specify tags by providing key and value combinations\. 

6. \(Optional\) Configure advanced settings\. 

8. When you are ready to create the launch template, choose **Create launch template**\.


## Create an Auto Scaling group using a launch template

1. On the navigation bar at the top of the screen, choose the same AWS Region that you used when you created the launch template\.

1. Choose **Create an Auto Scaling group**\.

1. On the **Choose launch template or configuration** page, do the following:

   1. For **Auto Scaling group name**, enter a name for your Auto Scaling group\.

   1. For **Launch template**, choose an existing launch template\.

   1. For **Launch template version**, choose whether the Auto Scaling group uses the default, the latest, or a specific version of the launch template when scaling out\.

   1. Verify that your launch template supports all of the options that you are planning to use, and then choose **Next**\.

1. On the **Choose instance launch options** page, under **Network**, for **VPC**, choose a VPC\. The Auto Scaling group must be created in the same VPC as the security group you specified in your launch template\.

1. For **Availability Zones and subnets**, choose one or more subnets in the specified VPC\. Use subnets in multiple Availability Zones for high availability\. 

1. Choose **Next** to continue to the next step\.

1. On the **Configure advanced options** page, configure the following options, and then choose **Next**:

   1. Register your Amazon EC2 instances with your load balancer.

1. On the **Configure group size and scaling policies** page, configure the following options, and then choose **Next**:

   1. For **Desired capacity**, enter the initial number of instances to launch\.

   1. To automatically scale the size of the Auto Scaling group, choose **Target tracking scaling policy** and follow the directions\.

1. \(Optional\) To receive notifications, for **Add notification**, configure the notification, and then choose **Next**\.

1. Choose **Add tag**, provide a tag key and value. 

1. On the **Review** page, choose **Create Auto Scaling group**\.