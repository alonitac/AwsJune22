# Elastic Kubernetes Service

## Install Minikube (only if you want to practice k8s locally)

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
aws eks --region us-east-1 --profile <aws-course-profile> update-kubeconfig --name eks-k8s-cluster
```
4. Since we are working on a shared K8S cluster, create your own namespace to which you will deploy your resources:
```shell
kubectl create namespace  <your-ns>
```

## Start K8S dashboard

1. Get the admin service account token by:
`kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')`
2. Start the `kubectl proxy`
3. To access the dashboard endpoint, open the following link with a web browser:
http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#!/login

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

## Pod horizontal autoscaler

A HorizontalPodAutoscaler (HPA) automatically updates a workload resource, with the aim of automatically scaling the workload to match demand.

To demonstrate a HorizontalPodAutoscaler, you will first start a Deployment that runs a container using the hpa-example image, and expose it as a Service:

1. Under `k8s/php-apache/php-apache.yaml`, change the Deployment and Service `namespace:` entry to your working namespace.
2. Apply by:
```shell
kubectl apply -f k8s/php-apache/php-apache.yaml
```
3. Now that the server is running, create the autoscaler (change `namespace:` entry to your working ns):
```shell
kubectl apply -f k8s/php-apache/php-autoscale.yaml
```
4. Next, see how the autoscaler reacts to increased load. To do this, you'll start a different Pod to act as a client. The container within the client Pod runs in an infinite loop, sending queries to the php-apache service.
```shell
# Run this in a separate terminal
# so that the load generation continues and you can carry on with the rest of the steps
kubectl run -n <your-ns> -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://php-apache; done"
```
5. Perform rolling update **during scale**. Under `k8s/php-apache/php-apache.yaml` change the image to:
```yaml
image: 964849360084.dkr.ecr.us-east-1.amazonaws.com/php-apache-2
```
Apply (during load generator pod is running).

[Read more](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/) to see how k8s can scale based on _packets per second_, _requests per second_ or even metrics not related to Kubernetes objects (such as messages in queue).

## Install production ready Postgres using the Helm k8s package manager

Helm is the package manager for Kubernetes
The main big 3 concepts of helm are:

- A **Chart** is a Helm package. It contains all the resource definitions necessary to run an application, tool, or service inside of a Kubernetes cluster.
- A **Repository** is the place where charts can be collected and shared.
- A **Release** is an instance of a chart running in a Kubernetes cluster.

[Download](https://get.helm.sh/helm-v3.9.4-windows-amd64.zip) the Helm binary if you don't have, extract the `.zip` file and push it in a place accessible to your PATH.

1. Add the bitnami Helm repo to your local machine
```shell
helm repo add bitnami https://charts.bitnami.com/bitnami
```
3. Review `k8s/postgres-values.yaml`, change values or [add parameters](https://github.com/bitnami/charts/tree/master/bitnami/postgresql/#parameters) according to your need.
4. Install the [postgresql](https://bitnami.com/stack/postgresql/helm) chart
```shell
helm install -f k8s/postgres-values.yaml --namespace <your-ns> pg bitnami/postgresql
```

## Install Ingress controller to the YoutubeBot app

In Kubernetes in order expose your application for incoming traffic outside the cluster, you should use an Ingress, which acts as the entry point for your cluster.
It lets you consolidate your routing rules into a single resource, as it can expose multiple services under the same IP address.

This process incorporates two k8s resources:
- An [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/), which acts as a high-level abstraction and allows simple host- or URL-based HTTP routing rules.
- An [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) which reads the Ingress resource information and actual processes traffic data. It usually runs as a Deployment or DaemonSet.

[NGINX ingress](https://github.com/kubernetes/ingress-nginx) is a great implementation of ingress controller for k8s.

In the following example, we will use the Nginx ingress controller and front it with a NLB (Network Load Balancer).

![](../.img/ingress1.png)

1. Apply the Nginx Ingress controller resource
```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.3.1/deploy/static/provider/aws/deploy.yaml
```
The above manifest file also launches the Network Load Balancer(NLB).
2. Apply the Ingress resource containing the routing rule (update `namespace:` and `path:` according to names):
```shell
kubectl apply -f k8s/ingress.yaml
```
3. Get the NLB endpoint and visit the app from outside the cluster: `http://<nlb-url>/<your-name>-youtubebot`.

## Stream Pod logs outside the cluster (to CloudWatch)

Fluentd is an open source data collector for unified logging layer. Fluentd allows you to unify data collection and consumption for a better use and understanding of data.
We will deploy the Fluentd chart to collect containers logs to send them to CloudWatch

1. Visit the Fluentd Helm chart https://github.com/fluent/helm-charts/tree/main/charts/fluentd
2. Add the helm repo
```shell
helm repo add fluent https://fluent.github.io/helm-charts
```
3. Install the Fluentd chart by:
```shell
helm install fluentd --namespace <your-ns> -f k8s/fluentd/values.yaml fluent/fluentd
```

## Deploy mongoDB and related webapp

1. Change the `namespace:` entry for all the resources under `k8s/mongo-webapp` which includes:
   1. Deployment `mongo-deployment`
   2. Service `mongo-service`
   3. ConfigMap `mongo-config`
   4. Secret `mongo-secret`
   5. Deployment `webapp-deployment`
   6. Service `webapp-service`
2. Apply the resources:
```shell
kubectl apply -k k8s/mongo-webapp
```
2. Forward the webapp service to your local machine:
```shell
kubectl port-forward -n <your-ns> svc/webapp-service 3333:3000
```
3. Visit the app in `http://localhost:3333`.