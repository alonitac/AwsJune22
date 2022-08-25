# Elastic Kubernetes Service

## Install Minukube

https://minikube.sigs.k8s.io/docs/start/

## Create EKS cluster (already done for you)

### Creating the Amazon EKS cluster role 

1. Open the IAM console at [https://console\.aws\.amazon\.com/iam/](https://console.aws.amazon.com/iam/)\.

1. Choose **Roles**, then **Create role**\.

1. Under **Trusted entity type**, select **AWS service**\.

1. From the **Use cases for other AWS services** dropdown list, choose **EKS**\.

1. Choose **EKS \- Cluster** for your use case, and then choose **Next**\.

1. On the **Add permissions** tab, choose **Next**\.

1. For **Role name**, enter a unique name for your role, such as **eksClusterRole**\.

1. For **Description**, enter descriptive text such as **Amazon EKS \- Cluster role**\.

1. Choose **Create role**\.

### Create k8s cluster

1. Open the Amazon EKS console at [https://console\.aws\.amazon\.com/eks/home\#/clusters](https://console.aws.amazon.com/eks/home#/clusters).

1. Choose **Add cluster** and then choose **Create**\.

1. On the **Configure cluster** page, enter the following fields:
    + **Name** – A name for your cluster\. It must be unique in your AWS account\. The name can contain only alphanumeric characters \(case\-sensitive\) and hyphens\. It must start with an alphabetic character and can't be longer than 100 characters\. The name must be unique within the AWS Region and AWS account that you're creating the cluster in\.
    + **Kubernetes version** – The version of Kubernetes to use for your cluster\.
    + **Cluster service role** – Choose `eks-cluster-role` as the Amazon EKS cluster IAM role to allow the Kubernetes control plane to manage AWS resources on your behalf\.

1. Select **Next**\.

1. On the **Specify networking** page, select values for the following fields:
    + **VPC** – Choose an existing VPC that meets [Amazon EKS VPC requirements](https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html#network-requirements-vpc) to create your cluster in\.
    + **Subnets** – By default, all available subnets in the VPC specified in the previous field are preselected\. You must select at least two\.
    + For **Cluster endpoint access**, select `Public and private` as an option\. After your cluster is created, you can change this option\.

1. You can accept the defaults in the **Networking add\-ons** section.

1. Select **Next**\.

1. On the **Configure logging** page, you can optionally choose which log types that you want to enable\. Leave the default settings (**Disabled**).

1. Select **Next**\.

1. On the **Review and create** page, review the information that you entered or selected on the previous pages\. If you need to make changes, choose **Edit**\. When you're satisfied, choose **Create**\. The **Status** field shows **CREATING** while the cluster is provisioned\.
   **Note**  
   You might receive an error that one of the Availability Zones in your request doesn't have sufficient capacity to create an Amazon EKS cluster\. If this happens, the error output contains the Availability Zones that can support a new cluster\. Retry creating your cluster with at least two subnets that are located in the supported Availability Zones for your account\. For more information, see [Insufficient capacity](troubleshooting.md#ICE)\.

   Cluster provisioning takes several minutes\.

## Install `kubectl` and get credentials

1. Download the `kubectl` binary from [Kubernetes](https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/#install-kubectl-binary-with-curl-on-windows) official site.

![](../.img/kubectl.png)

2. Put the `kubectl.exe` binary in a directory accessible in your PATH environment variable.
3. Run the following command to get credentials so you can communicate with the k8s cluster locally: 
```shell
aws eks --region us-east-1 --profile <aws-course-profile> update-kubeconfig --name k8s-cluster
```
4. Since we are working on a shared K8S cluster, create your own namespace to which you will deploy your resources:
```shell
kubectl create namespace  <your-ns>
```

## Deploy the youtubeBot image 

1. Edit the following values in `youtubeBot/youtubeBot.yaml`:
   1. `<your-ns>` to your namespace name
   2. `<docker-image-uri>` to a docker image URI 
2. Apply the configurations by: `kubectl apply -f youtubeBot/youtubeBot.yaml`
3. Scale the app by changing `replicas: 1` to `replicas: 5`, apply your changes again. Make sure the ScaleSet increases your instances.
4. Perform a rolling update by deploying a new image version (e.g. from `0.0.1` to `0.0.2`) version.

## Pod resources

To specify a memory request for a Container, include the `resources:requests` field in the Container's resource manifest. To specify a memory limit, include `resources:limits`.

In this exercise, you create a Pod that has one Container. The Container has a memory request of 100 MiB and a memory limit of 200 MiB. Here's the configuration file for the Pod:

1. Change `<your-ns>` to your namespace and apply by `kubectl apply -f k8s/memory-stress-test.yaml`
2. Use kubectl top to fetch the metrics for the pod:
```shell
kubectl top pod memory-demo --namespace=<your-ns>
```

In the next exercise, you create a Pod that has one container. The container has a request of 0.5 CPU and a limit of 1 CPU. Here is the configuration file for the Pod:

1. Change `<your-ns>` to your namespace and apply by `kubectl apply -f k8s/cpu-stress-test.yaml`.
2. Use kubectl top to fetch the metrics for the pod:
```shell
kubectl top pod cpu-demo --namespace=<your-ns>
```

## Define a liveness HTTP request probes

1. Add the following liveness probe under `spec.spec.containers.name`
```yaml
      livenessProbe:
        httpGet:
          path: /healthz
          port: 3000
        initialDelaySeconds: 3
        periodSeconds: 3
        failureThreshold: 3
```
2. Apply the changes and watch how k8s replacing unhealthy Pods.