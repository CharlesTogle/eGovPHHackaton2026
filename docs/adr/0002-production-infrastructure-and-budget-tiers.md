# Production infrastructure and budget tiers

Status: accepted

HANDA production will run in a single AWS Singapore region with Cloudflare in front, AWS ALB as the application gateway, EC2 Auto Scaling Group instances running Docker Compose, and RDS PostgreSQL Multi-AZ. This keeps the architecture understandable for DICT and barangay rollout while still allowing horizontal scaling during disaster traffic.

The first production runtime is EC2 Auto Scaling Group + Docker Compose, not Kubernetes. ECS Fargate and EKS remain future options if EC2 operations become the bottleneck or container orchestration requirements outgrow the simpler model.

Baseline topology:

- Cloudflare CDN/WAF/DDoS protection in front of AWS.
- AWS ALB for layer-7 routing, TLS termination to the app tier as required, health checks, and traffic distribution.
- EC2 Auto Scaling Group across multiple Availability Zones.
- Docker Compose on each EC2 instance for the Go API and any local sidecars needed for deployment/metrics.
- RDS PostgreSQL Multi-AZ with encryption at rest and automated backups.
- AWS KMS for key management.
- Append-only audit events in PostgreSQL.
- OpenSearch only if log/search volume or eGovPH/DICT requirements justify it.

Initial sizing estimates for technical Q&A, not procurement final pricing:

| Tier | Use case | App tier | Database | Expected monthly AWS cost |
| --- | --- | --- | --- | --- |
| Pilot | limited barangays/city demo with real users | 2 x t3.small/t3.medium EC2 across AZs | RDS db.t4g.medium Multi-AZ | PHP 20k-60k |
| City/province | sustained official use and moderate citizen traffic | 2-4 x t3.medium/t3.large EC2 | RDS db.t4g.large/r6g.large Multi-AZ | PHP 80k-250k |
| National surge | disaster event with heavy read/SSE traffic | 4-12 x c7g/m7g large-class EC2 via ASG | RDS r6g.xlarge+ Multi-AZ, read replica if needed | PHP 300k-1M+ during surge |

These are order-of-magnitude estimates. Final pricing depends on traffic, retention, backup storage, NAT/data transfer, Cloudflare plan, observability, and whether DICT mandates OpenSearch or additional security tooling.

Considered options:

- Lightsail: rejected for production because Auto Scaling, ALB integration, network controls, and operational maturity are weaker than EC2/RDS.
- Kubernetes/EKS now: rejected as avoidable platform overhead for one backend service.
- AWS-only WAF without Cloudflare: rejected for now because Cloudflare gives simpler edge caching, DDoS posture, and operational familiarity while ALB still owns AWS routing.
- Active-active multi-region: rejected for first production because the accepted target is single-region Multi-AZ with RPO <= 5 minutes and RTO <= 30 minutes.

Consequences:

- Disaster reliability is handled by Multi-AZ, idempotent writes, autoscaling, health checks, rollback-capable deployments, and database backups, not by adding every managed service upfront.
- Redis, queues, Kubernetes, and OpenSearch are explicitly future scaling paths, not day-one requirements.
