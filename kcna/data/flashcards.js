const FLASHCARDS = [
// CONTAINER BASICS
{id:'fc-cb1',topic:'containerBasics',difficulty:'easy',front:'What is chroot?',back:'Unix command (1979, Version 7) that restricts a process to a subdirectory — the "chroot jail". Ancestor of container isolation.'},
{id:'fc-cb2',topic:'containerBasics',difficulty:'easy',front:'What do Linux namespaces provide?',back:'Isolation — giving containers their own view of system resources (PIDs, network, mounts, users, hostname, etc.).'},
{id:'fc-cb3',topic:'containerBasics',difficulty:'easy',front:'What do cgroups provide?',back:'Resource limits — controlling how much CPU, RAM, and I/O a process group can consume. Stands for "control groups".'},
{id:'fc-cb4',topic:'containerBasics',difficulty:'easy',front:'When was Docker launched?',back:'2013. Docker did NOT invent namespaces or cgroups — it stitched existing Linux technology together into a usable platform.'},
{id:'fc-cb5',topic:'containerBasics',difficulty:'medium',front:'How many namespaces does Linux Kernel 5.6 provide?',back:'Exactly 8: pid, net, mnt, ipc, user, uts, cgroup, time\n\n🔴 CRITICAL exam number — know it cold.'},
{id:'fc-cb6',topic:'containerBasics',difficulty:'medium',front:'Which namespace gives a container its own IP address?',back:'net (network) namespace — gives each container its own full network stack including IP address, interfaces, and routing table.'},
{id:'fc-cb7',topic:'containerBasics',difficulty:'medium',front:'Which is the NEWEST Linux namespace?',back:'time — added in Linux Kernel 5.6. It virtualises the system clock so containers can have different time offsets from the host.'},
{id:'fc-cb8',topic:'containerBasics',difficulty:'medium',front:'What does the uts namespace control?',back:'Hostname and domain name. UTS = Unix Time Sharing. Lets each container have its own hostname distinct from the host.'},
{id:'fc-cb9',topic:'containerBasics',difficulty:'hard',front:'What does the ipc namespace isolate?',back:'Named shared memory segments (Inter-Process Communication). Prevents containers from accessing each other\'s shared memory.'},
{id:'fc-cb10',topic:'containerBasics',difficulty:'hard',front:'Key difference: namespaces vs cgroups?',back:'Namespaces = ISOLATION (what you can see)\ncgroups = RESOURCE LIMITS (how much you can use)\n\n⚠️ TRAP: These are different things — do not mix them up.'},
{id:'fc-cb11',topic:'containerBasics',difficulty:'easy',front:'Containers vs VMs — key difference?',back:'Containers share the host kernel. VMs have their own guest kernel via a hypervisor.\n\nContainers = isolated processes. VMs = isolated machines.'},

// BUILDING IMAGES
{id:'fc-bi1',topic:'buildingImages',difficulty:'easy',front:'What is a container image?',back:'A lightweight, standalone, executable package containing: code, runtime, system tools, system libraries, and settings. Everything needed to run an application.'},
{id:'fc-bi2',topic:'buildingImages',difficulty:'easy',front:'What is a Dockerfile?',back:'A text file with build instructions to create a container image. Instructions are similar to installing software on a server, but automated and reproducible.'},
{id:'fc-bi3',topic:'buildingImages',difficulty:'easy',front:'What is a container registry?',back:'A web server for uploading (push) and downloading (pull) container images. How images are shared and distributed across teams and systems.'},
{id:'fc-bi4',topic:'buildingImages',difficulty:'medium',front:'Key Dockerfile instructions?',back:'FROM — sets base image\nRUN — executes commands during build\nCOPY — copies files into image\nWORKDIR — sets working directory\nCMD — sets startup process'},
{id:'fc-bi5',topic:'buildingImages',difficulty:'medium',front:'When did Docker donate its image format to OCI?',back:'2015 — Docker donated the image format to the Open Container Initiative (OCI). It is now called OCI image-spec.\n\n🔴 CRITICAL: Year = 2015, Org = OCI'},
{id:'fc-bi6',topic:'buildingImages',difficulty:'medium',front:'What are the 2 parts of a container image?',back:'1. Filesystem bundle — actual files (/bin/java, /opt/app.jar, /lib/libc)\n2. Metadata — image index (target platform) + config (execution command)'},
{id:'fc-bi7',topic:'buildingImages',difficulty:'hard',front:'What ISO standard is referenced by the "container" name?',back:'ISO 668 — the standard for physical shipping containers. Same principle: standard format runs anywhere regardless of contents. Many cloud native terms follow this nautical theme.'},
{id:'fc-bi8',topic:'buildingImages',difficulty:'easy',front:'What was the crucial breakthrough that made containers mainstream?',back:'Container IMAGES — they made containers portable and easy to reuse across different systems. Docker reused existing Linux tech (namespaces + cgroups) but images were the missing piece.'},

// CONTAINER SECURITY
{id:'fc-cs1',topic:'containerSecurity',difficulty:'easy',front:'What are the 4Cs of Cloud Native Security?',back:'Cloud → Cluster → Container → Code\n\nOutermost to innermost. Each outer layer protects all inner layers.\n📝 Source: Kubernetes documentation'},
{id:'fc-cs2',topic:'containerSecurity',difficulty:'easy',front:'Most serious container security risk?',back:'Running as root / administrator — applies to BOTH containers AND traditional environments. Many containers today still run with root access.'},
{id:'fc-cs3',topic:'containerSecurity',difficulty:'medium',front:'Why is shared kernel a security risk?',back:'All containers share the same host OS kernel. A container with excessive permissions (kernel capabilities) can execute kernel functions, terminate processes, or alter host network settings.'},
{id:'fc-cs4',topic:'containerSecurity',difficulty:'medium',front:'Public image risk — what is it?',back:'Images from public registries (Docker Hub, Quay) may be tampered with or contain malicious software.\n\nVerify public images before use.\n⚠️ This is a NEW risk introduced by containers.'},
{id:'fc-cs5',topic:'containerSecurity',difficulty:'hard',front:'4Cs — what does each layer refer to?',back:'Cloud = underlying cloud/datacenter infrastructure\nCluster = the Kubernetes cluster\nContainer = images, runtime, config\nCode = the application code itself (innermost)'},
{id:'fc-cs6',topic:'containerSecurity',difficulty:'medium',front:'Container security is described as:',back:'An ONGOING PROCESS — it cannot be achieved in isolation and must evolve continuously. Not a one-time task at setup.'},

// ORCHESTRATION
{id:'fc-or1',topic:'orchestration',difficulty:'easy',front:'What is container orchestration?',back:'A dedicated system to manage and run containers across a cluster of multiple servers — solving compute, scheduling, resources, availability, scaling, networking, and storage.'},
{id:'fc-or2',topic:'orchestration',difficulty:'easy',front:'Control Plane vs Worker Nodes?',back:'Control Plane = MANAGES the cluster (scheduling, decisions, monitoring)\nWorker Nodes = RUNS the containers (executes instructions)\n\n⚠️ TRAP: Control Plane does NOT run containers.'},
{id:'fc-or3',topic:'orchestration',difficulty:'medium',front:'The 7 problems orchestration solves?',back:'1. Compute resources\n2. Scheduling\n3. Resource allocation\n4. Availability management\n5. Scaling\n6. Networking\n7. Storage'},
{id:'fc-or4',topic:'orchestration',difficulty:'easy',front:'What is a microservice?',back:'A small, independent container handling one specific piece of business logic. Microservice architecture = application composed of many such containers.'},
{id:'fc-or5',topic:'orchestration',difficulty:'hard',front:'Why does lightweight nature of containers create orchestration need?',back:'Lightweight → more containers per app → microservices architecture → exponentially more IPs, ports, failures to manage → orchestration becomes essential.\n\n💡 The solution creates the problem.'},

// NETWORKING
{id:'fc-nw1',topic:'networking',difficulty:'easy',front:'What is CNI?',back:'Container Network Interface — a STANDARD (not a tool) defining how network plugins connect containers. Works across all container orchestration platforms.'},
{id:'fc-nw2',topic:'networking',difficulty:'easy',front:'What is an overlay network?',back:'A virtual network spanning multiple hosts — enables seamless container-to-container communication across different servers. Handles IP assignment and routing automatically.'},
{id:'fc-nw3',topic:'networking',difficulty:'medium',front:'Same port on two containers — possible?',back:'YES — because each container has its own IP address via the network namespace. Different IPs = no port conflict, even both listening on port 8080.'},
{id:'fc-nw4',topic:'networking',difficulty:'medium',front:'When is an overlay network needed?',back:'Only for containers on DIFFERENT hosts. Same-host container communication does not require an overlay network.\n\n⚠️ TRAP: Overlay = cross-HOST only.'},
{id:'fc-nw5',topic:'networking',difficulty:'hard',front:'CNI vs specific networking tool (e.g. Calico)?',back:'CNI = the standard/interface specification\nCalico/Flannel/Cilium = implementations (plugins) that follow CNI\n\nThe orchestrator communicates with the plugin via the CNI interface.'},

// SERVICE DISCOVERY
{id:'fc-sd1',topic:'serviceDiscovery',difficulty:'easy',front:'What is a Service Registry?',back:'A system that automatically tracks and updates information about running services. Acts as the single source of truth for service names, IPs, ports, and status.'},
{id:'fc-sd2',topic:'serviceDiscovery',difficulty:'easy',front:'2 approaches to service discovery?',back:'1. DNS-based — DNS servers with APIs auto-register services. Most straightforward and widely adopted.\n2. Key-value store — strongly consistent datastore (etcd, Consul, Zookeeper).'},
{id:'fc-sd3',topic:'serviceDiscovery',difficulty:'medium',front:'3 named key-value stores for service discovery?',back:'1. etcd — also Kubernetes\' own internal backing store\n2. Consul — popular for clustering\n3. Apache Zookeeper — popular for distributed coordination\n\n🔴 Know all 3 names.'},
{id:'fc-sd4',topic:'serviceDiscovery',difficulty:'hard',front:'Service Registry vs Service Discovery?',back:'Registry = the STORE (tracks service info automatically)\nDiscovery = the CAPABILITY (finding and connecting to services dynamically)\n\nRegistry enables Discovery — they are distinct concepts.'},
{id:'fc-sd5',topic:'serviceDiscovery',difficulty:'medium',front:'Why does manual IP tracking fail at scale?',back:'4 reasons:\n1. 100s-1000s of containers\n2. Distributed across multiple hosts/regions\n3. DNS-based comms needed\n4. Dynamic lifecycle — containers created & deleted constantly'},

// SERVICE MESH
{id:'fc-sm1',topic:'serviceMesh',difficulty:'easy',front:'What is a service mesh?',back:'A system that automatically deploys a lightweight proxy (sidecar) alongside every container — handling all network communication, security, and observability transparently.'},
{id:'fc-sm2',topic:'serviceMesh',difficulty:'easy',front:'Data plane vs Control plane in service mesh?',back:'Data plane = ALL the sidecar proxies → ENFORCES traffic rules\nControl plane = central manager → DEFINES rules and distributes config\n\n⚠️ TRAP: Don\'t mix up which defines and which enforces.'},
{id:'fc-sm3',topic:'serviceMesh',difficulty:'medium',front:'What does istiod do?',back:'istiod is Istio\'s control plane component. It handles:\n1. Service discovery\n2. Configuration distribution to proxies\n3. Certificate distribution (for mTLS)'},
{id:'fc-sm4',topic:'serviceMesh',difficulty:'medium',front:'What is SMI?',back:'Service Mesh Interface — a FORMAL SPECIFICATION (not a service mesh) for implementing service meshes consistently.\n\nFocused on Kubernetes. Available on GitHub.\n⚠️ SMI is a spec, NOT a mesh tool.'},
{id:'fc-sm5',topic:'serviceMesh',difficulty:'hard',front:'3 named proxy tools in the course?',back:'1. Nginx\n2. HAProxy\n3. Envoy ← most associated with service meshes; used by Istio as its sidecar proxy'},

// STORAGE
{id:'fc-st1',topic:'storage',difficulty:'easy',front:'What is a volume (container storage)?',back:'A host directory mounted directly into the container filesystem. Data persists on the host — surviving container stop, removal, or restart.'},
{id:'fc-st2',topic:'storage',difficulty:'easy',front:'Container image layers — read-only or read-write?',back:'READ-ONLY — image layers cannot be modified. This ensures every container start gives the same behavior. A temporary read-write layer is added on top at runtime.'},
{id:'fc-st3',topic:'storage',difficulty:'medium',front:'What happens to data written inside a container (no volume) when it stops?',back:'LOST — all writes go to the temporary read-write layer which is destroyed when the container stops or is removed.\n\n📝 Analogy: like RAM being cleared on shutdown.'},
{id:'fc-st4',topic:'storage',difficulty:'medium',front:'What is CSI?',back:'Container Storage Interface — a vendor-neutral standard for connecting storage backends to container orchestration systems. Works with cloud AND on-premises storage.'},
{id:'fc-st5',topic:'storage',difficulty:'hard',front:'Why is local-host storage insufficient at container scale?',back:'2 problems:\n1. Containers on DIFFERENT hosts may need the SAME data\n2. A rescheduled container must still reach its storage\n\nSolution: shared storage accessible from any cluster host.'},
{id:'fc-st6',topic:'storage',difficulty:'medium',front:'Trade-off of using volumes?',back:'Volumes reduce container ISOLATION — the container gains controlled access to part of the host filesystem. Deliberate trade-off: persistence vs isolation.'},

// CONTAINER BASICS — extra
{id:'fc-cb12',topic:'containerBasics',difficulty:'medium',front:'What does the mnt namespace provide?',back:'Abstracts the filesystem view and mount points — each container sees its own root filesystem, entirely separate from the host\'s mount table. Enables the container "jail".'},
{id:'fc-cb13',topic:'containerBasics',difficulty:'easy',front:'What is OCI?',back:'Open Container Initiative — founded 2015. Maintains two key specifications:\n• image-spec — container image format\n• runtime-spec — how to run a container\n\n🔴 OCI = standards body, not a tool.'},
{id:'fc-cb14',topic:'containerBasics',difficulty:'hard',front:'What are kernel capabilities?',back:'Fine-grained permissions within the Linux kernel. A container with excess capabilities can execute kernel functions, kill processes, or alter host networking.\n\n⚠️ Root inside a container + capabilities = serious host risk.'},

// BUILDING IMAGES — extra
{id:'fc-bi9',topic:'buildingImages',difficulty:'medium',front:'How does Docker layer caching work?',back:'Each Dockerfile instruction creates a read-only layer. If nothing changed in that layer\'s context, Docker reuses the CACHED layer instead of rebuilding.\n\n💡 Put rarely-changing instructions (apt-get install) EARLY to maximise cache hits.'},
{id:'fc-bi10',topic:'buildingImages',difficulty:'easy',front:'RUN vs CMD in Dockerfile?',back:'RUN = executes at BUILD TIME → creates a new image layer (e.g. apt-get install)\nCMD = executes at RUNTIME when the container STARTS (e.g. python app.py)\n\n⚠️ TRAP: RUN ≠ CMD — different phases.'},

// CONTAINER SECURITY — extra
{id:'fc-cs7',topic:'containerSecurity',difficulty:'hard',front:'What does the Cloud layer in 4Cs mean?',back:'The underlying cloud/datacenter infrastructure (VMs, hypervisors, physical servers). If the Cloud layer is compromised, all inner layers (Cluster, Container, Code) are at risk.\n\n📝 Outer → inner protection: each layer depends on the outer being secure.'},
{id:'fc-cs8',topic:'containerSecurity',difficulty:'easy',front:'Where should container security scanning happen?',back:'Both at BUILD TIME (in the CI/CD pipeline — scan Dockerfile and image layers) AND at RUNTIME (monitor running containers for anomalies).\n\nSecurity is an ONGOING PROCESS, not a one-time gate.'},

// ORCHESTRATION — extra
{id:'fc-or6',topic:'orchestration',difficulty:'easy',front:'What is Kubernetes?',back:'An open-source container orchestration system — automates deployment, scaling, and management of containerised applications across a cluster of machines.\n\n🔴 Kubernetes = the dominant orchestration platform. Also called "K8s".'},
{id:'fc-or7',topic:'orchestration',difficulty:'medium',front:'Why do microservices REQUIRE orchestration?',back:'Microservices = many small containers. Each has its own IP, port, and lifecycle.\n\n⚠️ 100s of services → manual management impossible:\n• IPs change dynamically\n• Failures need auto-recovery\n• Traffic needs balancing'},
{id:'fc-or8',topic:'orchestration',difficulty:'hard',front:'4 reasons manual container management fails at scale?',back:'1. Too many containers (100s–1000s)\n2. Dynamic lifecycle — created & destroyed constantly\n3. Distributed across many hosts — different IPs\n4. Failure recovery must be automatic and fast\n\nOrchestration solves ALL four.'},

// NETWORKING — extra
{id:'fc-nw6',topic:'networking',difficulty:'medium',front:'What is port mapping (publishing)?',back:'Mapping a container\'s INTERNAL port to a HOST port, allowing external traffic to reach the container.\n\nExample: -p 8080:80 → host port 8080 → container port 80\n\n💡 Without mapping, container ports are only reachable internally.'},
{id:'fc-nw7',topic:'networking',difficulty:'easy',front:'What happens to container networking without CNI?',back:'Every orchestration system would need its own networking implementation — making plugins non-portable.\n\nCNI provides a SINGLE STANDARD so Calico, Flannel, Cilium all work with any orchestrator that supports CNI.'},

// SERVICE DISCOVERY — extra
{id:'fc-sd6',topic:'serviceDiscovery',difficulty:'medium',front:'DNS-based vs key-value store service discovery?',back:'DNS-based: DNS server with auto-registration API. Simple, widely adopted.\nKey-value store: strongly consistent DB (etcd, Consul, Zookeeper). More powerful but complex.\n\n💡 DNS is most common in Kubernetes. KV stores add consistency guarantees.'},

// SERVICE MESH — extra
{id:'fc-sm6',topic:'serviceMesh',difficulty:'medium',front:'mTLS without a service mesh — the problem?',back:'Every service team must MANUALLY implement TLS: generate certs, handle rotation, code mutual auth. Error-prone and inconsistent.\n\nWith service mesh: proxies handle ALL of this automatically — zero code changes required.'},
{id:'fc-sm7',topic:'serviceMesh',difficulty:'easy',front:'What is a sidecar proxy?',back:'A lightweight proxy container deployed ALONGSIDE each application container — same Pod in Kubernetes. Intercepts ALL inbound and outbound traffic without any changes to app code.\n\n🔴 This is the core pattern of a service mesh.'},

// STORAGE — extra
{id:'fc-st7',topic:'storage',difficulty:'hard',front:'CSI vs CNI — what is the difference?',back:'CSI = Container Storage Interface — standardises STORAGE connections (volumes, disks, cloud storage)\nCNI = Container Network Interface — standardises NETWORK connections (IPs, routing)\n\n⚠️ TRAP: Both are interface standards — CSI≠CNI. Remember: S=Storage, N=Network.'},
{id:'fc-st8',topic:'storage',difficulty:'medium',front:'What is shared/distributed storage for?',back:'Allows containers on DIFFERENT hosts to access the SAME data.\n\nExamples: NFS, Ceph, cloud block storage (EBS, GCS PD)\n\n💡 Critical when a container is rescheduled to a different node but needs its previous data.'},
];
