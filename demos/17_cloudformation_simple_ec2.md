# CloudFormation

## Deploy simple EC2 with cloud formation

1. Under `cloudFromationTemplates/simple-ec2.yaml` edit `ImageId` to be a compatible AMI for your working region.
2. Deploy the template by:
```text
aws cloudformation create-stack --stack-name <your-stack-name> --template-body file://simple-ec2.yaml --region <region> --profile <aws-course-profile>
```
while `<your-stack-name>` is a unique name for your stack, `<region>` is your working region and `<aws-course-profile>` is the AWS credentials profile name.
3. Open the AWS CloudFormation console at [https://console\.aws\.amazon\.com/cloudformation](https://console.aws.amazon.com/cloudformation/).

4. On the CloudFormation console, select the stack `<your-stack-name>` in the list\.

5. In the stack details pane, choose the **Events** tab.

The **Events** tab displays each major step in the creation of the stack sorted by the time of each event, with latest events on top.    
The first event is the start of the stack creation process:

`2022-08-10 18:54 UTC+3 CREATE_IN_PROGRESS AWS::CloudFormation::Stack my-ec2 User initiated`

Next are events that mark the beginning and completion of the creation of each resource\. For example, creation of the EC2 instance results in the following entries:

`2022-08-10 18:54 UTC+3 CREATE_COMPLETE AWS::EC2::Instance...`

`2022-08-10 18:54 UTC+3 CREATE_IN_PROGRESS AWS::EC2::Instance...`

The `CREATE_IN_PROGRESS` event is logged when CloudFormation reports that it has begun to create the resource.
The `CREATE_COMPLETE` event is logged when the resource is successfully created.

When CloudFormation has successfully created the stack, you will see the following event at the top of the **Events** tab:

`2022-08-10 18:54 UTC+3 CREATE_COMPLETE AWS::CloudFormation::Stack my-ec2`

If CloudFormation can't create a resource, it reports a `CREATE_FAILED` event and, by default, rolls back the stack and deletes any resources that have been created.
The **Status Reason** column displays the issue that caused the failure.

6. If needed, update your stack by editing the YAML file and execute 
```text
aws cloudformation update-stack --stack-name <your-stack-name> --template-body file://simple-ec2.yaml --region <region> --profile <aws-course-profile>
```
5. To clean up, delete your stack by 
```text
aws cloudformation delete-stack --stack-name  <your-stack-name> --region <region> --profile <aws-course-profile>
```

## Create a stack from AWS Console

You will create a basic WordPress blog that uses a single Amazon EC2 instance with a local MySQL database for storage.
[The template](https://s3.us-west-2.amazonaws.com/cloudformation-templates-us-west-2/WordPress_Single_Instance.yaml) also creates an Amazon EC2 security group to control firewall settings for the Amazon EC2 instance.

As you can see, this is an advanced template includes six top-level sections: `AWSTemplateFormatVersion`, `Description`, `Parameters`, `Mappings`, `Resources`, and `Outputs`.
The **Resources** section contains the definitions of the AWS resources you want to create with the template.
You use the **Parameters** section to declare values that can be passed to the template when you create the stack. A parameter is an effective way to specify sensitive information, such as user names and passwords, that you don't want to store in the template itself.
You use **Mappings** to declare conditional values that are evaluated in a similar manner as a look up table statement. The template uses mappings to select the correct Amazon Machine Image (AMI) for the region and the architecture type for the instance type.
**Outputs** define custom values to return from the resources in the stack.

1. Open the AWS CloudFormation console at [https://console\.aws\.amazon\.com/cloudformation](https://console.aws.amazon.com/cloudformation/).

1. If this is a new CloudFormation account, choose **Create New Stack**\. Otherwise, choose **Create Stack**\.

1. In the **Template** section, select **Specify an Amazon S3 Template URL** to type or paste the URL for the sample WordPress template, and then choose **Next**:

   `https://s3.us-west-2.amazonaws.com/cloudformation-templates-us-west-2/WordPress_Single_Instance.template`
   **Note**  
   AWS CloudFormation templates that are stored in an S3 bucket must be accessible to the user who is creating the stack, and must be located in the *same region* as the stack that is being created\. Therefore, if the S3 bucket is located in the `us-east-2` Region, the stack must also be created in `us-east-2`\.

1. In the **Specify Details** section, enter a stack name in the **Name** field\. For this example, use **MyWPTestStack**\. The stack name can't contain spaces\.

1. On the **Specify Parameters** page, you'll recognize the parameters from the Parameters section of the template\. You must provide values for all parameters that don't have default values, including **DBUser**, **DBPassword**, **DBRootPassword**, and **KeyName**\. In the **KeyName** field, enter the name of a valid Amazon EC2 pair in the same region you are creating the stack\.

1. Choose **Next**\.

1. Review the information for the stack\. When you're satisfied with the settings, choose **Create**\.
