const CHEAT_SHEET = [
  {
    title:'Critical Numbers',
    cards:[
      {title:'Linux Namespaces (Kernel 5.6)',type:'number',number:'8',detail:'pid · net · mnt · ipc · user · uts · cgroup · time\n🔴 Exact count is a common exam question'},
      {title:'Orchestration Problems Solved',type:'number',number:'7',detail:'Compute · Scheduling · Resource allocation · Availability · Scaling · Networking · Storage'},
      {title:'4Cs of Cloud Native Security',type:'number',number:'4',detail:'Cloud → Cluster → Container → Code\nOuter to inner — each layer depends on the outer'},
      {title:'Pass Mark (KCNA exam)',type:'number',number:'75%',detail:'Approximately 750/1000 scaled score. ~90 questions, 90 minutes.'},
    ]
  },
  {
    title:'Key Acronyms',
    cards:[
      {title:'OCI',type:'definition',term:'Open Container Initiative',detail:'Founded 2015. Maintains image-spec and runtime-spec. NOT a tool — it\'s a standards body.'},
      {title:'CNI',type:'definition',term:'Container Network Interface',detail:'Standard for network plugins. Calico, Flannel, Cilium all implement CNI. Works across all orchestrators.'},
      {title:'CSI',type:'definition',term:'Container Storage Interface',detail:'Standard for storage plugins. NOT a specific product. Enables cloud + on-prem storage backends.'},
      {title:'SMI',type:'definition',term:'Service Mesh Interface',detail:'Formal specification for service mesh implementations. Kubernetes-focused. On GitHub. NOT a mesh tool.'},
      {title:'CRI',type:'definition',term:'Container Runtime Interface',detail:'Kubernetes standard for container runtimes. Containerd and CRI-O implement CRI.'},
      {title:'UTS',type:'definition',term:'Unix Time Sharing',detail:'The "uts" namespace — controls hostname and domain name per container.'},
    ]
  },
  {
    title:'Key Dates & History',
    cards:[
      {title:'Timeline',type:'timeline',rows:[
        ['1979','chroot introduced (Unix Version 7)'],
        ['2013','Docker launched — containers mainstream'],
        ['2015','Docker donates image format to OCI'],
        ['Linux 5.6','time namespace added (newest of 8)'],
      ]},
      {title:'Named Tools You Must Know',type:'list',items:[
        'Istio — most popular service mesh','istiod — Istio\'s control plane component',
        'Envoy — sidecar proxy used by Istio','Nginx / HAProxy — traditional proxies',
        'etcd — KV store & Kubernetes backing store','Consul — service discovery / clustering',
        'Apache Zookeeper — distributed coordination','Calico / Flannel / Cilium — CNI plugins',
      ]},
    ]
  },
  {
    title:'Key Comparisons',
    cards:[
      {title:'Namespaces vs cgroups',type:'compare',headers:['','Namespaces','cgroups'],rows:[
        ['Purpose','ISOLATION','RESOURCE LIMITS'],
        ['Controls','What you can see','How much you can use'],
        ['Example','Own network stack','Max 4GB RAM'],
        ['Trap','Do NOT mix these up','They are different things'],
      ]},
      {title:'Container vs VM',type:'compare',headers:['','Container','Virtual Machine'],rows:[
        ['Kernel','Shares host kernel','Own guest kernel'],
        ['Boot time','Fast (process start)','Slow (OS boot)'],
        ['Isolation','Lower','Higher'],
        ['Overhead','Minimal','High'],
      ]},
      {title:'CNI vs CSI vs CRI',type:'compare',headers:['Acronym','Full Name','Handles'],rows:[
        ['CNI','Container Network Interface','Networking / IPs'],
        ['CSI','Container Storage Interface','Storage / volumes'],
        ['CRI','Container Runtime Interface','Running containers'],
      ]},
      {title:'Data Plane vs Control Plane (Service Mesh)',type:'compare',headers:['','Data Plane','Control Plane'],rows:[
        ['What it is','All sidecar proxies','Central manager (e.g. istiod)'],
        ['Role','ENFORCES traffic rules','DEFINES & distributes rules'],
        ['Scope','Per-service proxy','Cluster-wide config'],
      ]},
    ]
  },
  {
    title:'Must-Know Lists',
    cards:[
      {title:'The 8 Linux Namespaces',type:'tags',tags:[
        {label:'pid',color:'#6366f1'},{label:'net',color:'#10b981'},{label:'mnt',color:'#f59e0b'},
        {label:'ipc',color:'#ec4899'},{label:'user',color:'#8b5cf6'},{label:'uts',color:'#3b82f6'},
        {label:'cgroup',color:'#ef4444'},{label:'time ★NEW',color:'#14b8a6'},
      ]},
      {title:'7 Orchestration Problems',type:'tags',tags:[
        {label:'Compute',color:'#6366f1'},{label:'Scheduling',color:'#8b5cf6'},
        {label:'Resource Allocation',color:'#ec4899'},{label:'Availability',color:'#ef4444'},
        {label:'Scaling',color:'#f59e0b'},{label:'Networking',color:'#10b981'},
        {label:'Storage',color:'#14b8a6'},
      ]},
      {title:'4Cs of Security (outer → inner)',type:'tags',tags:[
        {label:'☁️ Cloud',color:'#6366f1'},{label:'⚙️ Cluster',color:'#8b5cf6'},
        {label:'📦 Container',color:'#ec4899'},{label:'💻 Code',color:'#ef4444'},
      ]},
      {title:'Top Exam Traps',type:'list',items:[
        '⚠️ Containers share the HOST kernel — VMs do not','⚠️ Control Plane does NOT run containers',
        '⚠️ CNI / CSI / SMI are STANDARDS, not tools','⚠️ OCI is a standards body (founded 2015)',
        '⚠️ SMI is a SPEC — not an actual service mesh','⚠️ Overlay network is for CROSS-HOST only',
        '⚠️ RUN = build time · CMD = runtime startup','⚠️ mTLS without mesh = manual cert management',
      ]},
    ]
  },
  {
    title:'Kubernetes Practical Commands',
    cards:[
      {title:'Cluster & Context',type:'code',lines:[
        {cmd:'kubectl cluster-info',note:'Show control plane + CoreDNS address',output:'Kubernetes control plane is running at https://10.0.0.1:6443\nCoreDNS is running at https://10.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy'},
        {cmd:'kubectl get nodes',note:'List all nodes and their status',output:'NAME           STATUS   ROLES           AGE   VERSION\ncontrolplane   Ready    control-plane   45d   v1.29.0\nworker-1       Ready    <none>          45d   v1.29.0\nworker-2       Ready    <none>          45d   v1.29.0'},
        {cmd:'kubectl get nodes -o wide',note:'Show IPs, OS, kernel version too',output:'NAME         STATUS  ROLES         AGE  VERSION   INTERNAL-IP   OS-IMAGE             KERNEL-VERSION\nworker-1     Ready   <none>        45d  v1.29.0   10.0.0.11     Ubuntu 22.04.3 LTS   5.15.0-91-generic'},
        {cmd:'kubectl config get-contexts',note:'List all kubeconfig contexts',output:'CURRENT   NAME              CLUSTER           AUTHINFO          NAMESPACE\n*         prod-cluster      prod-cluster      admin             default\n          staging-cluster   staging-cluster   dev-user          staging'},
        {cmd:'kubectl config use-context staging-cluster',note:'Switch active context',output:'Switched to context "staging-cluster".'},
        {cmd:'kubectl api-resources',note:'List all resource types the cluster supports',output:'NAME                 SHORTNAMES  APIVERSION  NAMESPACED  KIND\npods                 po          v1          true        Pod\nservices             svc         v1          true        Service\ndeployments          deploy      apps/v1     true        Deployment\nnodes                no          v1          false       Node'},
      ]},
      {title:'Pods',type:'code',lines:[
        {cmd:'kubectl get pods',note:'List pods in current namespace',output:'NAME                     READY   STATUS    RESTARTS   AGE\nnginx-7d9f4b5c6-x8k2p    1/1     Running   0          2d\napi-6b8d9c7f4-m3n7q      1/1     Running   2          5h\nworker-pod               0/1     Pending   0          30s'},
        {cmd:'kubectl get pods -A',note:'All pods in ALL namespaces',output:'NAMESPACE     NAME                            READY  STATUS    RESTARTS\nkube-system   coredns-787d4945fb-x7j9k        1/1    Running   0\nkube-system   etcd-controlplane               1/1    Running   0\ndefault       nginx-7d9f4b5c6-x8k2p           1/1    Running   0'},
        {cmd:'kubectl get pods -o wide',note:'Show node + IP per pod',output:'NAME                  READY  STATUS   IP           NODE       NOMINATED NODE\nnginx-7d9f-x8k2p      1/1    Running  10.244.1.5   worker-1   <none>'},
        {cmd:'kubectl describe pod nginx-7d9f4b5c6-x8k2p',note:'Full pod details, events, conditions',output:'Name:         nginx-7d9f4b5c6-x8k2p\nNamespace:    default\nNode:         worker-1/10.0.0.11\nStatus:       Running\nIP:           10.244.1.5\nContainers:\n  nginx:\n    Image:    nginx:1.25\n    Port:     80/TCP\n    State:    Running\nEvents:\n  Normal  Scheduled  2d  Successfully assigned\n  Normal  Pulled     2d  Successfully pulled image\n  Normal  Started    2d  Started container nginx'},
        {cmd:'kubectl logs nginx-7d9f4b5c6-x8k2p',note:'View stdout/stderr of a pod',output:'10.244.0.1 - - [30/Mar/2026:12:00:01 +0000] "GET / HTTP/1.1" 200 615\n10.244.0.1 - - [30/Mar/2026:12:00:05 +0000] "GET /health HTTP/1.1" 200 2'},
        {cmd:'kubectl logs my-pod -c sidecar',note:'Logs from specific container in pod',output:'[2026-03-30T12:00:01Z] INFO  Sidecar started, watching /var/log\n[2026-03-30T12:00:05Z] INFO  Forwarding 3 log lines to Loki'},
        {cmd:'kubectl logs crashloop-pod --previous',note:'Logs from a crashed (previous) container',output:'Error: cannot connect to database at db:5432\nconnection refused: dial tcp 10.96.1.5:5432\npanic: failed to initialise — exiting'},
        {cmd:'kubectl exec -it nginx-7d9f4b5c6-x8k2p -- /bin/sh',note:'Open interactive shell inside pod',output:'# (interactive shell opened inside container)\n# ls /etc/nginx\nconf.d  mime.types  nginx.conf'},
        {cmd:'kubectl delete pod nginx-7d9f4b5c6-x8k2p',note:'Delete a pod (recreated by Deployment)',output:'pod "nginx-7d9f4b5c6-x8k2p" deleted'},
        {cmd:'kubectl run test-nginx --image=nginx',note:'Create a pod imperatively (quick test)',output:'pod/test-nginx created'},
      ]},
      {title:'Deployments & ReplicaSets',type:'code',lines:[
        {cmd:'kubectl get deployments',note:'List all deployments',output:'NAME      READY   UP-TO-DATE   AVAILABLE   AGE\nnginx     3/3     3            3           10d\napi-svc   2/2     2            2           5d\nworker    1/1     1            1           1d'},
        {cmd:'kubectl describe deployment nginx',note:'Full deployment details + rollout status',output:'Name:               nginx\nReplicas:           3 desired | 3 updated | 3 total | 3 available\nStrategyType:       RollingUpdate\nRollingUpdateStrategy: 25% max unavailable, 25% max surge\nPod Template:\n  Image: nginx:1.25\nConditions:\n  Available   True   MinimumReplicasAvailable\nEvents:\n  Normal  ScalingReplicaSet  10d  Scaled up replica set nginx-7d9f4b5c6 to 3'},
        {cmd:'kubectl create deployment nginx --image=nginx',note:'Create deployment imperatively',output:'deployment.apps/nginx created'},
        {cmd:'kubectl scale deployment nginx --replicas=5',note:'Scale to 5 replicas',output:'deployment.apps/nginx scaled'},
        {cmd:'kubectl set image deployment/nginx nginx=nginx:1.26',note:'Update container image (triggers rollout)',output:'deployment.apps/nginx image updated'},
        {cmd:'kubectl rollout status deployment/nginx',note:'Watch rollout progress',output:'Waiting for deployment "nginx" rollout to finish: 2 out of 3 new replicas updated...\nWaiting for deployment "nginx" rollout to finish: 1 old replica pending termination...\ndeployment "nginx" successfully rolled out'},
        {cmd:'kubectl rollout undo deployment/nginx',note:'Roll back to previous version',output:'deployment.apps/nginx rolled back'},
        {cmd:'kubectl rollout history deployment/nginx',note:'View revision history',output:'REVISION  CHANGE-CAUSE\n1         kubectl create --image=nginx:1.24\n2         kubectl set image deployment/nginx nginx=nginx:1.25\n3         kubectl set image deployment/nginx nginx=nginx:1.26'},
        {cmd:'kubectl get replicasets',note:'List ReplicaSets (managed by deployments)',output:'NAME                DESIRED   CURRENT   READY   AGE\nnginx-7d9f4b5c6     3         3         3       10d\nnginx-6c8b3a4d5     0         0         0       12d  ← old RS kept for rollback'},
      ]},
      {title:'Services & Networking',type:'code',lines:[
        {cmd:'kubectl get services',note:'List all services (svc)',output:'NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE\nkubernetes   ClusterIP   10.96.0.1       <none>        443/TCP        45d\nnginx-svc    ClusterIP   10.96.100.5     <none>        80/TCP         10d\nweb-lb       LoadBalancer 10.96.200.3    34.90.5.12    80:31234/TCP   5d'},
        {cmd:'kubectl get svc -A',note:'All services across namespaces',output:'NAMESPACE     NAME          TYPE        CLUSTER-IP    PORT(S)\ndefault       kubernetes    ClusterIP   10.96.0.1     443/TCP\nkube-system   kube-dns      ClusterIP   10.96.0.10    53/UDP,53/TCP\ndefault       nginx-svc     ClusterIP   10.96.100.5   80/TCP'},
        {cmd:'kubectl describe svc nginx-svc',note:'Show endpoints, selector, port mappings',output:'Name:           nginx-svc\nSelector:       app=nginx\nType:           ClusterIP\nIP:             10.96.100.5\nPort:           80/TCP\nEndpoints:      10.244.1.5:80,10.244.1.6:80,10.244.2.3:80\nEvents:         <none>'},
        {cmd:'kubectl expose deployment nginx --port=80',note:'Create ClusterIP service for deployment',output:'service/nginx exposed'},
        {cmd:'kubectl expose deployment nginx --type=NodePort --port=80',note:'Expose via NodePort',output:'service/nginx exposed\n# Access via: http://<node-ip>:31045'},
        {cmd:'kubectl port-forward pod/nginx-7d9f4b5c6-x8k2p 8080:80',note:'Forward local 8080 → pod port 80',output:'Forwarding from 127.0.0.1:8080 -> 80\nForwarding from [::1]:8080 -> 80\nHandling connection for 8080'},
        {cmd:'kubectl get endpoints',note:'Show resolved pod IPs behind each service',output:'NAME        ENDPOINTS                                    AGE\nnginx-svc   10.244.1.5:80,10.244.1.6:80,10.244.2.3:80   10d\nkubernetes  10.0.0.1:6443                                45d'},
        {cmd:'kubectl get ingress',note:'List all Ingress resources',output:'NAME          CLASS   HOSTS               ADDRESS       PORTS   AGE\nweb-ingress   nginx   app.example.com     34.90.5.12    80,443  5d'},
      ]},
      {title:'Namespaces & Context',type:'code',lines:[
        {cmd:'kubectl get namespaces',note:'List all namespaces',output:'NAME              STATUS   AGE\ndefault           Active   45d\nkube-system       Active   45d\nkube-public       Active   45d\nkube-node-lease   Active   45d\ndev               Active   10d\nproduction        Active   30d'},
        {cmd:'kubectl create namespace dev',note:'Create namespace "dev"',output:'namespace/dev created'},
        {cmd:'kubectl get pods -n kube-system',note:'List pods in kube-system namespace',output:'NAME                                READY   STATUS    RESTARTS\ncoredns-787d4945fb-x7j9k            1/1     Running   0\netcd-controlplane                   1/1     Running   0\nkube-apiserver-controlplane         1/1     Running   0\nkube-controller-manager-cp          1/1     Running   0\nkube-scheduler-controlplane         1/1     Running   0'},
        {cmd:'kubectl config set-context --current --namespace=dev',note:'Set default namespace for this session',output:'Context "prod-cluster" modified.'},
        {cmd:'kubectl delete namespace dev',note:'Delete namespace + ALL its resources',output:'namespace "dev" deleted\n# WARNING: ALL resources inside are deleted too'},
      ]},
      {title:'ConfigMaps & Secrets',type:'code',lines:[
        {cmd:'kubectl get configmaps',note:'List ConfigMaps (cm)',output:'NAME               DATA   AGE\napp-config         3      5d\nkube-root-ca.crt   1      45d\nnginx-config       2      10d'},
        {cmd:'kubectl create configmap app-config --from-literal=DB_HOST=localhost --from-literal=PORT=5432',note:'Create ConfigMap from literals',output:'configmap/app-config created'},
        {cmd:'kubectl describe configmap app-config',note:'View all keys in ConfigMap',output:'Name:    app-config\nData\n====\nDB_HOST:  localhost\nPORT:     5432\nAPP_ENV:  production'},
        {cmd:'kubectl get secrets',note:'List Secrets (values are base64-encoded)',output:'NAME                  TYPE                                  DATA   AGE\ndefault-token-xxxxx   kubernetes.io/service-account-token   3      45d\ndb-secret             Opaque                                1      5d\ntls-cert              kubernetes.io/tls                     2      10d'},
        {cmd:'kubectl create secret generic db-secret --from-literal=password=abc123',note:'Create a generic Secret',output:'secret/db-secret created'},
        {cmd:'kubectl get secret db-secret -o jsonpath="{.data.password}" | base64 -d',note:'Decode a secret value',output:'abc123'},
      ]},
      {title:'YAML — Apply & Manage',type:'code',lines:[
        {cmd:'kubectl apply -f deployment.yaml',note:'Create or update from YAML file',output:'deployment.apps/nginx created\n# or if updating:\ndeployment.apps/nginx configured'},
        {cmd:'kubectl apply -f ./manifests/',note:'Apply all YAML files in a directory',output:'deployment.apps/api created\nservice/api-svc created\nconfigmap/api-config created\ningress.networking.k8s.io/api-ingress created'},
        {cmd:'kubectl delete -f deployment.yaml',note:'Delete resources defined in YAML',output:'deployment.apps/nginx deleted'},
        {cmd:'kubectl get deployment nginx -o yaml',note:'Export live resource as YAML',output:'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx\n  namespace: default\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: nginx'},
        {cmd:'kubectl diff -f deployment.yaml',note:'Preview changes before applying',output:'-  replicas: 3\n+  replicas: 5\n   image: nginx:1.25\n-  memory: "256Mi"\n+  memory: "512Mi"'},
        {cmd:'kubectl apply --dry-run=client -f deployment.yaml',note:'Validate YAML without creating anything',output:'deployment.apps/nginx created (dry run)'},
        {cmd:'kubectl explain pod.spec.containers',note:'Get inline docs for any field',output:'KIND:     Pod\nVERSION:  v1\nRESOURCE: containers <[]Object>\nDESCRIPTION:\n  List of containers belonging to the pod.\nFIELDS:\n  image <string> -required-\n  name  <string> -required-\n  ports <[]Object>'},
      ]},
      {title:'Troubleshooting',type:'code',lines:[
        {cmd:'kubectl get events --sort-by=.lastTimestamp',note:'Recent cluster events (start here when debugging)',output:'LAST SEEN   TYPE      REASON             OBJECT                    MESSAGE\n2m          Warning   BackOff            pod/crashloop-abc123      Back-off restarting failed container\n1m          Warning   FailedScheduling   pod/worker-pod            0/3 nodes: insufficient memory\n30s         Normal    Pulled             pod/nginx-7d9f-x8k2p      Successfully pulled image "nginx:1.25"'},
        {cmd:'kubectl describe pod crashloop-abc123',note:'Check Events section — shows why pod fails',output:'Events:\n  Warning  Failed     5m  kubelet  Failed to pull image "myapp:v99": not found\n  Warning  Failed     5m  kubelet  Error: ErrImagePull\n  Warning  BackOff    2m  kubelet  Back-off pulling image "myapp:v99"'},
        {cmd:'kubectl get pod nginx -o jsonpath="{.status.phase}"',note:'Get just the pod phase',output:'Running'},
        {cmd:'kubectl top nodes',note:'CPU/memory usage per node (needs metrics-server)',output:'NAME         CPU(cores)  CPU%   MEMORY(bytes)  MEMORY%\nworker-1     320m        8%     1842Mi         47%\nworker-2     105m        2%     924Mi          23%'},
        {cmd:'kubectl top pods',note:'CPU/memory usage per pod',output:'NAME                    CPU(cores)   MEMORY(bytes)\nnginx-7d9f4b5c6-x8k2p   2m           8Mi\napi-6b8d9c7f4-m3n7q      45m          128Mi\nworker-job-8x9zt         310m         512Mi'},
        {cmd:'kubectl auth can-i create pods',note:'Check if current user can create pods',output:'yes'},
        {cmd:'kubectl auth can-i delete nodes',note:'Check if current user can delete nodes',output:'no'},
        {cmd:'kubectl auth can-i list deployments --as=system:serviceaccount:default:my-sa',note:'Check ServiceAccount permissions',output:'no\n# This SA cannot list deployments — needs a RoleBinding'},
      ]},
      {title:'Docker Commands',type:'code',lines:[
        {cmd:'docker build -t myapp:v1.0 .',note:'Build image from Dockerfile in current dir',output:'[+] Building 12.3s (8/8) FINISHED\n => [1/4] FROM docker.io/library/node:18-alpine\n => [2/4] WORKDIR /app\n => [3/4] COPY package*.json ./\n => [4/4] RUN npm install\nSuccessfully tagged myapp:v1.0'},
        {cmd:'docker run -d -p 8080:80 --name web nginx',note:'Run container in background, map ports',output:'3f4a1c2b9e8d7f6a5c4b3a2d1e0f9c8b7a6d5e4f3c2b1a0d9e8f7c6b5a4d3'},
        {cmd:'docker ps',note:'List running containers',output:'CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                  NAMES\n3f4a1c2b9e8d   nginx     "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   0.0.0.0:8080->80/tcp   web'},
        {cmd:'docker ps -a',note:'All containers (including stopped)',output:'CONTAINER ID   IMAGE     COMMAND    CREATED    STATUS                     NAMES\n3f4a1c2b9e8d   nginx     "…"        2m ago     Up 2 minutes               web\nab12cd34ef56   ubuntu    "bash"     1h ago     Exited (0) 58 minutes ago  test-container'},
        {cmd:'docker images',note:'List local images',output:'REPOSITORY   TAG       IMAGE ID       CREATED        SIZE\nmyapp        v1.0      a1b2c3d4e5f6   5 minutes ago  142MB\nnginx        latest    a99a39d9515e   2 weeks ago    187MB\nubuntu       24.04     ca2b0f26964c   3 weeks ago    78.1MB'},
        {cmd:'docker logs web --tail=20 -f',note:'View container logs (follow last 20 lines)',output:'10.0.0.1 - - [30/Mar/2026:14:00:01 +0000] "GET / HTTP/1.1" 200 615\n10.0.0.1 - - [30/Mar/2026:14:00:02 +0000] "GET /health HTTP/1.1" 200 2'},
        {cmd:'docker exec -it web /bin/bash',note:'Shell into running container',output:'root@3f4a1c2b9e8d:/# nginx -v\nnginx version: nginx/1.25.4\nroot@3f4a1c2b9e8d:/# exit'},
        {cmd:'docker stop web && docker rm web',note:'Stop then remove a container',output:'web\nweb'},
        {cmd:'docker push myregistry.io/myapp:v1.0',note:'Push image to registry',output:'The push refers to repository [myregistry.io/myapp]\n5f70bf18a086: Pushed\na3b4c5d6e7f8: Pushed\nv1.0: digest: sha256:abc123... size: 528'},
        {cmd:'docker volume create myvolume && docker run -v myvolume:/data nginx',note:'Create volume and mount into container',output:'myvolume\n# Data written to /data persists after container stops'},
      ]},
    ]
  },
];
