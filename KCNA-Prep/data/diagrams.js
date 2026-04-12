const DIAGRAMS = {
  containerBasics: [
    {label:'Container Isolation — Namespaces + cgroups', ascii:
`HOST LINUX KERNEL
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Container A │  │  Container B │  │  Container C │
│  pid ns      │  │  pid ns      │  │  pid ns      │
│  net ns      │  │  net ns      │  │  net ns      │
│  mnt ns      │  │  mnt ns      │  │  mnt ns      │
│  user ns     │  │  user ns     │  │  user ns     │
│  ─────────── │  │  ─────────── │  │  ─────────── │
│  cgroups:    │  │  cgroups:    │  │  cgroups:    │
│  CPU, RAM    │  │  CPU, RAM    │  │  CPU, RAM    │
└──────────────┘  └──────────────┘  └──────────────┘
═══════════════════════════════════════════════════════
              Shared Linux Kernel
       namespaces = ISOLATION | cgroups = RESOURCE LIMITS`},
    {label:'Container vs Virtual Machine', ascii:
`  VIRTUAL MACHINE                  CONTAINER
  ┌────────────────────┐            ┌────────────────────┐
  │  App A  │  App B   │            │  App A  │  App B   │
  ├──────────────────--┤            ├────────────────────┤
  │ Guest OS│ Guest OS │            │                    │
  │ (kernel)│ (kernel) │            │  Shared OS Kernel  │
  ├──────────────────--┤            │  (single kernel)   │
  │    Hypervisor      │            ├────────────────────┤
  ├────────────────────┤            │  Container Runtime │
  │   Host Hardware    │            ├────────────────────┤
  └────────────────────┘            │   Host Hardware    │
  Heavier · Slower                  └────────────────────┘
  Stronger isolation                Lighter · Faster
  Each app = own kernel             Shared kernel`},
  ],
  buildingImages: [
    {label:'Docker Image Layer Stack', ascii:
`  RUNNING CONTAINER
  ┌──────────────────────────────────────────────────┐
  │  Read-Write Layer (EPHEMERAL)                    │
  │  ← writes go here — LOST when container stops   │
  ╠══════════════════════════════════════════════════╣
  │  Layer 4: COPY . /app              (read-only)   │
  ├──────────────────────────────────────────────────┤
  │  Layer 3: RUN npm install          (read-only)   │
  ├──────────────────────────────────────────────────┤
  │  Layer 2: WORKDIR /app             (read-only)   │
  ├──────────────────────────────────────────────────┤
  │  Layer 1: FROM node:20             (read-only)   │
  └──────────────────────────────────────────────────┘
  Read-only layers are SHARED across containers using same base`},
    {label:'Build → Push → Pull → Run Pipeline', ascii:
`  Developer                Registry              Any Machine
  ┌────────────┐            ┌──────────┐          ┌──────────┐
  │ Dockerfile │            │          │          │          │
  │            │──build────▶│  Image   │──pull───▶│  Image   │
  │ app code   │            │  v1.2.3  │          │  v1.2.3  │
  └────────────┘            └──────────┘          └────┬─────┘
        │                        ▲                     │
   docker build             docker push           docker run
        │                        │                     ▼
   ┌────▼──────────────┐         │             ┌───────────────┐
   │  Image (local)    │─────────┘             │  Container    │
   └───────────────────┘                       │  (running)    │
                                               └───────────────┘`},
  ],
  containerSecurity: [
    {label:'4Cs of Cloud Native Security — Outside-In', ascii:
`  ┌───────────────────────────────────────────────────┐
  │                     CLOUD                         │
  │   (provider infrastructure, datacenter, region)   │
  │   ┌───────────────────────────────────────────┐   │
  │   │                CLUSTER                    │   │
  │   │   (Kubernetes control plane + nodes)      │   │
  │   │   ┌───────────────────────────────────┐   │   │
  │   │   │            CONTAINER              │   │   │
  │   │   │   (image, runtime, config)        │   │   │
  │   │   │   ┌───────────────────────────┐   │   │   │
  │   │   │   │           CODE            │   │   │   │
  │   │   │   │   (application source)    │   │   │   │
  │   │   │   └───────────────────────────┘   │   │   │
  │   │   └───────────────────────────────────┘   │   │
  │   └───────────────────────────────────────────┘   │
  └───────────────────────────────────────────────────┘
  Weakest outer layer = ALL inner layers exposed`},
  ],
  orchestration: [
    {label:'Control Plane + Worker Nodes Architecture', ascii:
`  ┌─────────────────── CONTROL PLANE ──────────────────────┐
  │                                                         │
  │  kubectl ──▶ kube-apiserver ◀──▶ etcd (cluster state) │
  │                    │                                    │
  │          kube-scheduler       kube-controller-manager  │
  │          (places pods)        (all built-in controllers)│
  └────────────────────┬────────────────────────────────────┘
                       │  schedules + manages
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
  ┌───────────┐  ┌───────────┐  ┌───────────┐
  │ Worker 1  │  │ Worker 2  │  │ Worker 3  │
  │───────────│  │───────────│  │───────────│
  │ kubelet   │  │ kubelet   │  │ kubelet   │
  │ kube-prx  │  │ kube-prx  │  │ kube-prx  │
  │ [Pod A]   │  │ [Pod B]   │  │ [Pod C]   │
  │ [Pod D]   │  │           │  │ [Pod E]   │
  └───────────┘  └───────────┘  └───────────┘
  CONTROL PLANE = decisions only   WORKERS = run containers`},
  ],
  networking: [
    {label:'Network Namespaces — Port Isolation Per Container', ascii:
`  HOST MACHINE (192.168.1.10)
  ┌────────────────────────────────────────────────────┐
  │  Container A             Container B               │
  │  IP: 10.0.0.2            IP: 10.0.0.3             │
  │  port :8080 ✓            port :8080 ✓             │
  │  (own network namespace) (own network namespace)   │
  └────────────────────────────────────────────────────┘
  NO conflict — each container has its own IP via net namespace

  Port Mapping (expose container to outside world):
  External :80  ────────────────▶  Container :8080
  (host port, accessible externally)  (internal port)`},
    {label:'Overlay Network — Cross-Host Container Communication', ascii:
`  HOST A                                   HOST B
  ┌─────────────────────┐                  ┌─────────────────────┐
  │  Container A        │                  │  Container B        │
  │  IP: 10.0.0.2       │                  │  IP: 10.0.0.3       │
  └──────────┬──────────┘                  └──────────┬──────────┘
             │                                        │
  ┌──────────▼────────────────────────────────────────▼──────────┐
  │                  Overlay Network (CNI plugin)                 │
  │   Virtual tunnel: VXLAN / IPIP / WireGuard                   │
  │   Handles automatic IP assignment + cross-host routing        │
  └──────────────────────────────────────────────────────────────┘
  CNI implementations: Calico · Flannel · Cilium · Weave Net`},
  ],
  serviceDiscovery: [
    {label:'Service Registry Pattern — Dynamic Registration', ascii:
`  Service A starts             Service B needs to reach A
       │                                   │
       ▼ auto-register                     ▼ lookup
  ┌─────────────────────────────────────────────────────┐
  │                 Service Registry                     │
  │   ┌───────────────────────────────────────────┐     │
  │   │  service-a  →  10.0.0.2:8080             │     │
  │   │  service-b  →  10.0.0.3:3000             │     │
  │   │  service-c  →  10.0.0.9:5432             │     │
  │   └───────────────────────────────────────────┘     │
  └─────────────────────────────────────────────────────┘
            auto-updates on creation / deletion

  DNS approach:   Modern DNS server with service API
  KV approach:    etcd  |  Consul  |  Apache Zookeeper`},
  ],
  serviceMesh: [
    {label:'Sidecar Pattern — Control Plane vs Data Plane', ascii:
`               ┌─────────── istiod (CONTROL PLANE) ───────────┐
               │  Service Discovery · Config · Cert Rotation   │
               └─────────┬──────────────────────┬──────────────┘
                         │ pushes config         │ pushes config
         ┌───────────────▼────┐           ┌──────▼─────────────┐
         │   Service A Pod    │           │   Service B Pod    │
         │  ┌──────────────┐  │           │  ┌──────────────┐  │
         │  │ Envoy Sidecar│◀─┼───mTLS───▶│  │ Envoy Sidecar│  │
         │  ├──────────────┤  │           │  ├──────────────┤  │
         │  │   App Code   │  │           │  │   App Code   │  │
         │  └──────────────┘  │           │  └──────────────┘  │
         └────────────────────┘           └────────────────────┘
  App code never touches network — Envoy handles all traffic
  DATA PLANE  = all sidecar proxies (ENFORCE rules)
  CONTROL PLANE = istiod (DEFINE rules + distribute certs)`},
  ],
  storage: [
    {label:'Image Layers + Ephemeral RW Layer', ascii:
`  CONTAINER AT RUNTIME
  ┌───────────────────────────────────────────────────┐
  │  Read-Write Layer        (EPHEMERAL)              │
  │  ← writes go here — DESTROYED on container stop  │
  ╠═══════════════════════════════════════════════════╣  ← image boundary
  │  Layer 3: COPY . /app                (read-only) │
  ├───────────────────────────────────────────────────┤
  │  Layer 2: RUN apt-get install ...    (read-only) │
  ├───────────────────────────────────────────────────┤
  │  Layer 1: FROM ubuntu:24.04          (read-only) │
  └───────────────────────────────────────────────────┘
  Volume = mount host directory → data survives container lifecycle`},
    {label:'PersistentVolume Chain (Kubernetes Storage)', ascii:
`  Pod spec
  └──▶ PersistentVolumeClaim (PVC)    ← developer requests storage
            │  (size: 10Gi, accessMode: RWO, storageClass: ssd)
            ▼
       PersistentVolume (PV)           ← provisioned by admin or dynamic
            │  (actual storage resource, lifecycle independent of pod)
            ▼
       StorageClass                    ← defines provisioner + parameters
            │  (standard, premium-ssd, gp2, nfs-client...)
            ▼
       ┌───────────────┬───────────────┬───────────────┐
       │   AWS EBS     │   GCP PD      │  NFS / CephFS │
       │   (RWO)       │   (RWO)       │  (RWX)        │
       └───────────────┴───────────────┴───────────────┘
  CSI = Container Storage Interface (vendor-neutral standard)`},
  ],
  kubernetesCore: [
    {label:'Full Kubernetes Cluster Architecture', ascii:
`  ┌────────────────────── CONTROL PLANE ─────────────────────────┐
  │                                                               │
  │  ┌──────────────────────────────────────────────────────────┐ │
  │  │  kube-apiserver  (ALL traffic — REST — only entry point) │ │
  │  └────────────────────────────────────────────────────────--┘ │
  │           │                              │                    │
  │   ┌───────▼────────┐      ┌──────────────▼──────────────┐    │
  │   │      etcd      │      │   kube-scheduler             │    │
  │   │  (cluster      │      │   (assigns pods to nodes)    │    │
  │   │   state store) │      ├─────────────────────────────-┤    │
  │   └────────────────┘      │   kube-controller-manager    │    │
  │                           │   (Deployment, RS, Node ctlr)│    │
  │                           └──────────────────────────────┘    │
  └───────────────────────────────┬───────────────────────────────┘
                                  │  API calls
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
  ┌────────────┐           ┌────────────┐           ┌────────────┐
  │ Worker Node│           │ Worker Node│           │ Worker Node│
  │ kubelet    │           │ kubelet    │           │ kubelet    │
  │ kube-proxy │           │ kube-proxy │           │ kube-proxy │
  │ containerd │           │ containerd │           │ containerd │
  │ ┌────────┐ │           │ ┌────────┐ │           │ ┌────────┐ │
  │ │ Pod A  │ │           │ │ Pod B  │ │           │ │ Pod C  │ │
  │ └────────┘ │           │ └────────┘ │           │ └────────┘ │
  └────────────┘           └────────────┘           └────────────┘`},
    {label:'Service Types — Reachability Layers', ascii:
`  INTERNET
      │
  ┌───▼──────────────────────────────────────────────────────┐
  │  LoadBalancer  (cloud external IP — production traffic)  │
  │  ┌──────────────────────────────────────────────────┐    │
  │  │  NodePort  (all node IPs : 30000–32767)          │    │
  │  │  ← simple external access, dev/test              │    │
  │  │  ┌────────────────────────────────────────────┐  │    │
  │  │  │  ClusterIP  (virtual IP — cluster only)    │  │    │
  │  │  │  ← internal microservice communication     │  │    │
  │  │  │  ┌──────────────────────────────────────┐  │  │    │
  │  │  │  │  Pod Endpoints  (actual pod IPs)     │  │  │    │
  │  │  │  │  Headless: DNS returns pod IPs       │  │  │    │
  │  │  │  └──────────────────────────────────────┘  │  │    │
  │  │  └────────────────────────────────────────────┘  │    │
  │  └──────────────────────────────────────────────────┘    │
  └──────────────────────────────────────────────────────────┘
  ExternalName = DNS CNAME alias only (no proxy, no virtual IP)`},
    {label:'Ingress — L7 HTTP/HTTPS Routing', ascii:
`  INTERNET
      │
  ┌───▼─────────────────┐
  │   LoadBalancer      │  (one external IP shared by ALL apps)
  └───┬─────────────────┘
      │
  ┌───▼──────────────────────────────────────────────────────┐
  │         Ingress Controller  (nginx / Traefik / HAProxy)  │
  │         reads Ingress resources and routes traffic       │
  └───┬──────────────────────────────────────────────────────┘
      │  Ingress rules:
      ├── api.example.com/v1    ──▶  api-service:8080
      ├── api.example.com/v2    ──▶  api-v2-service:8080
      └── web.example.com       ──▶  web-service:3000

  Without Ingress: 1 LoadBalancer per app  (cost × N apps)
  With Ingress:    1 LoadBalancer total    (all apps share it)`},
  ],
  cloudNativeArch: [
    {label:'CNCF Project Maturity Tiers', ascii:
`  ┌──────────────────────────────────────────────────────────┐
  │  GRADUATED — stable API, security audits, wide adoption  │
  │  Kubernetes · Prometheus · Envoy · Argo CD · Flux        │
  │  etcd · Fluentd · Jaeger · containerd · CoreDNS          │
  │  Linkerd · Rook · OpenTelemetry · Falco                  │
  ├──────────────────────────────────────────────────────────┤
  │  INCUBATING — production use, growing community          │
  │  KEDA · Kyverno · Cilium · Argo Rollouts · Backstage     │
  ├──────────────────────────────────────────────────────────┤
  │  SANDBOX — early stage, experimental, no prod guarantee  │
  │  OpenFeature · Karmada · WasmEdge                        │
  └──────────────────────────────────────────────────────────┘
  CNCF hosts projects — companies DONATE them (e.g. Google donated K8s)`},
    {label:'Cloud Service Models — What You Manage', ascii:
`  FaaS     ████░░░░░░░░░░░░  You manage: function code only
  (Lambda · Knative · OpenFaaS)

  PaaS     ████████░░░░░░░░  You manage: app code + config
  (Heroku · Google App Engine)

  CaaS     ████████████░░░░  You manage: containers + app logic
  (AWS Fargate · Cloud Run)

  IaaS     ████████████████  You manage: OS + runtime + app
  (AWS EC2 · GCP Compute)   ░░░░░░░░  Provider: hardware only

  On-prem  ░░░░░░░░░░░░░░░░  You manage: EVERYTHING

  ████ = you manage   ░ = provider manages
  More abstraction = less control = less to manage`},
  ],
  observability: [
    {label:'Three Pillars — Data Flow Through the Stack', ascii:
`  ┌────────────── Application (instrumented with OTel) ──────────┐
  └───────┬────────────────────────┬──────────────────┬──────────┘
          │ /metrics endpoint      │ stdout logs      │ trace headers
          ▼ (pull, every 15s)      ▼                  ▼
  ┌──────────────────┐   ┌─────────────────┐   ┌────────────────┐
  │   PROMETHEUS     │   │  FLUENTD /      │   │   JAEGER /     │
  │  scrapes targets │   │  PROMTAIL       │   │   ZIPKIN       │
  │  stores metrics  │   │  (DaemonSet)    │   │  stores spans  │
  └────────┬─────────┘   └────────┬────────┘   └───────┬────────┘
           │ query                │                     │ query
           ▼                      ▼ Loki                ▼
  ┌──────────────────────────────────────────────────────────────┐
  │              GRAFANA  (visualization only)                   │
  │              stores NO data — queries all sources            │
  └──────────────────────────────────────────────────────────────┘
  Metrics = what / Logs = when+detail / Traces = where in the chain`},
    {label:'Prometheus Pull Model vs Legacy Push Model', ascii:
`  PROMETHEUS (PULL)              LEGACY TOOLS (PUSH)
  ┌──────────────────┐           ┌──────────────────┐
  │ Prometheus Server│           │ Monitoring Server│
  │                  │           │                  │
  │ pulls /metrics   │           │ ▲ receives data  │
  │ every 15s        │           │ │                │
  └──────────────────┘           └─┼────────────────┘
         │  pull                    │ push
         ▼                          │
  ┌─────────────────────┐      ┌────┴──────────────────┐
  │  Target: App        │      │  Agent (runs on host) │
  │  GET /metrics       │      │  pushes to server     │
  │  node_exporter      │      │  (StatsD, CloudWatch) │
  │  kube-state-metrics │      └───────────────────────┘
  └─────────────────────┘
  Pull: targets EXPOSE endpoint    Push: agents SEND data
  Prometheus scrapes on its schedule   Agent pushes proactively`},
  ],
  appDelivery: [
    {label:'GitOps — Pull-Based CD vs Traditional Push-Based', ascii:
`  PUSH-BASED CD (traditional)          ← security risk
  ──────────────────────────────────────────────────────
  CI Pipeline ──kubectl apply──▶ Kubernetes Cluster
  (CI system holds cluster credentials — external risk)

  PULL-BASED GITOPS                    ← secure + auditable
  ──────────────────────────────────────────────────────
  Developer
       │ git commit + push
       ▼
  Git Repository  ◀── Argo CD / Flux watches this repo
       │                       │
       │ CI updates image tag  │ detects change → pulls
       ▼                       ▼
  Config Repo ───────▶ Kubernetes Cluster (reconciles)
  (YAML manifests)    (actual state → desired state)

  Git = single source of truth
  Rollback = git revert → agent auto-redeploys old version`},
    {label:'Helm Chart Structure + Lifecycle', ascii:
`  my-chart/
  ├── Chart.yaml          ← name, version, description, deps
  ├── values.yaml         ← default configuration values
  ├── templates/
  │   ├── deployment.yaml ← uses {{ .Values.image.tag }}
  │   ├── service.yaml
  │   ├── ingress.yaml
  │   └── _helpers.tpl    ← reusable template snippets
  └── charts/             ← sub-chart dependencies

  helm install  my-release ./my-chart   ← create Release
  helm upgrade  my-release ./my-chart   ← update Release
  helm rollback my-release 2            ← revert to revision 2
  helm list                             ← list all Releases

  Chart = package    Release = deployed instance    Values = config`},
  ],
};
