# AWS Console And Runtime Navigation Runbook

Use this during the live deploy session. The goal is to connect AWS console
screens, CLI commands, application behavior, and interview explanation.

## Fast Definitions

### JVM Heap

The JVM heap is the main memory area where Java stores application objects.

Example:

```text
When a Spring Boot request creates objects, those objects usually live in heap.
If the app keeps references and never releases them, heap usage grows.
```

Interview line:

```text
High memory does not always mean heap leak. I first check OS memory, process
RSS, JVM heap, GC behavior, thread count, and recent traffic or deployment.
```

### GC

GC means garbage collection. The JVM automatically removes Java objects that are
no longer reachable.

Why it matters:

```text
If heap is under pressure, GC runs more often. That can increase latency because
the JVM spends more time cleaning memory and less time serving requests.
```

Commands:

```bash
jcmd <pid> GC.heap_info
jstat -gc <pid> 1000 5
jcmd <pid> Thread.print
```

### Throttling

Throttling means intentionally slowing or limiting traffic.

Examples:

```text
API rate limit allows only 100 requests per minute.
WAF blocks abusive traffic.
Client receives HTTP 429 Too Many Requests.
Autoscaling protects capacity, but throttling protects the service.
```

Interview line:

```text
If traffic is overwhelming the system, I may throttle non-critical traffic or
enforce rate limits while scaling or fixing the backend.
```

### Caching

Caching means storing a response or data temporarily so the system does not
recompute or refetch it every time.

Types:

```text
Browser cache:
  User browser stores JS/CSS/images.

CloudFront cache:
  Edge locations cache static or safe dynamic responses.

Application cache:
  App stores frequently used data in memory or Redis/ElastiCache.

Database cache:
  DB engine caches frequently read pages.
```

Risk:

```text
Do not cache user-specific/private data incorrectly.
Do not cache stale API responses without understanding TTL and invalidation.
```

## AWS Console Navigation For This Project

### 1. EC2

Console path:

```text
AWS Console -> EC2 -> Instances
```

Look for:

```text
Name: signalforge-dev-app
State: running
Private IP
IAM role
Subnet
Security groups
```

CLI:

```bash
aws ec2 describe-instances \
  --profile admin-user \
  --region us-east-1 \
  --filters "Name=tag:Name,Values=signalforge-dev-app" \
  --query "Reservations[].Instances[].{Id:InstanceId,State:State.Name,PrivateIp:PrivateIpAddress,Subnet:SubnetId}" \
  --output table
```

### 2. Session Manager

Console path:

```text
AWS Console -> Systems Manager -> Session Manager -> Start session
```

Why Session Manager:

```text
No SSH key.
No inbound port 22.
No public IP needed.
IAM-controlled and auditable.
Works with private EC2.
```

Inside instance:

```bash
systemctl status signalforge.service --no-pager
journalctl -u signalforge.service -n 100 --no-pager
ss -lntp | grep 8080
curl -i http://localhost:8080/actuator/health
curl -i http://localhost:8080/
```

### 3. Load Balancer

Console path:

```text
AWS Console -> EC2 -> Load Balancers -> signalforge-dev-alb
```

Check:

```text
DNS name
Scheme: internet-facing
Listeners: HTTP :80
Security group
Availability zones
```

CLI:

```bash
aws elbv2 describe-load-balancers \
  --profile admin-user \
  --region us-east-1 \
  --names signalforge-dev-alb
```

### 4. Target Group

Console path:

```text
AWS Console -> EC2 -> Target Groups -> signalforge-dev-app-tg -> Targets
```

Check:

```text
Target instances are healthy.
Port is 8080.
Health check path is /actuator/health.
```

CLI:

```bash
aws elbv2 describe-target-health \
  --profile admin-user \
  --region us-east-1 \
  --target-group-arn <target-group-arn>
```

### 5. Auto Scaling Group

Console path:

```text
AWS Console -> EC2 -> Auto Scaling Groups -> signalforge-dev-app-asg
```

Check:

```text
Desired capacity
Min/max capacity
Instance health
Target group attachment
Scaling policy
Activity history
```

CLI:

```bash
aws autoscaling describe-auto-scaling-groups \
  --profile admin-user \
  --region us-east-1 \
  --auto-scaling-group-names signalforge-dev-app-asg
```

### 6. CloudWatch

Console path:

```text
AWS Console -> CloudWatch
```

Open:

```text
Dashboards -> signalforge-dev-ops-dashboard
Alarms -> signalforge-dev*
Metrics -> ApplicationELB / EC2 / RDS
Log groups -> /aws/vpc/signalforge-dev/flow-logs
```

Important metrics:

```text
RequestCount
HTTPCode_ELB_5XX_Count
HTTPCode_Target_5XX_Count
TargetResponseTime
HealthyHostCount
UnHealthyHostCount
CPUUtilization
RDS DatabaseConnections
RDS CPUUtilization
RDS FreeStorageSpace
```

### 7. RDS

Console path:

```text
AWS Console -> RDS -> Databases -> signalforge-dev-postgres
```

Check:

```text
Status
Endpoint
Port 5432
Subnet group
Security group
Backups
Monitoring
```

Important:

```text
RDS is private. You usually cannot connect from your laptop directly unless you
use VPN/bastion/SSM tunnel. For this lab, query from EC2 in the VPC.
```

Install psql on Amazon Linux if needed:

```bash
sudo dnf install -y postgresql15
```

Get secret:

```bash
aws secretsmanager get-secret-value \
  --region us-east-1 \
  --secret-id <db-secret-arn> \
  --query SecretString \
  --output text
```

Connect:

```bash
psql -h <rds-endpoint> -U <username> -d <database>
```

Basic queries:

```sql
select now();
select current_database();
select current_user;
select pid, state, wait_event_type, query from pg_stat_activity;
select datname, numbackends, xact_commit, xact_rollback from pg_stat_database;
```

## IAM Roles Created/Used

### GitHub Actions OIDC Role

Role:

```text
signalforge-github-actions-dev
```

Used by:

```text
GitHub Actions workflows.
```

Purpose:

```text
Terraform apply/destroy, AWS deploy commands, S3 upload, SSM send-command.
```

Why:

```text
GitHub does not store long-lived AWS access keys. It receives short-lived AWS
credentials through OIDC and STS.
```

### EC2 Instance Role

Created by Terraform:

```text
signalforge-dev-ec2-role
signalforge-dev-ec2-profile
```

Used by:

```text
EC2 app instances.
```

Current permissions:

```text
AmazonSSMManagedInstanceCore:
  Allows Session Manager and SSM Run Command.

CloudWatchAgentServerPolicy:
  Allows CloudWatch Agent usage later.

S3 artifact read policy:
  Allows EC2 to download the JAR artifact from S3.
```

### VPC Flow Logs Role

Created by Terraform:

```text
signalforge-dev-flow-logs-role
```

Used by:

```text
VPC Flow Logs service.
```

Purpose:

```text
Allows VPC Flow Logs to write network ACCEPT/REJECT records to CloudWatch Logs.
```

## What To Say In Interview

```text
I know which IAM role is used at each layer. GitHub Actions uses an OIDC-based
IAM role for infrastructure and deployment automation. EC2 uses an instance role
for SSM, CloudWatch Agent, and artifact download. VPC Flow Logs uses a service
role to write network logs to CloudWatch. I avoid long-lived access keys and
scope roles by environment and responsibility.
```

## First Live Walkthrough Order

Use this after deployment:

```text
1. Open ALB URL.
2. Open CloudWatch dashboard.
3. Check target group health.
4. Start Session Manager.
5. Check systemctl status.
6. Check journalctl logs.
7. Check port 8080.
8. Curl localhost health.
9. Run one simulation.
10. Watch CloudWatch and Orbit UI metrics.
11. Explain what changed and why.
```

