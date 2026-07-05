# End-To-End Dev Test Runbook

Use this when you want to prove the full Orbit Ops path works from browser to
AWS infrastructure to EC2 application.

Memory hook:

```text
Build -> Upload -> Deploy -> Restart -> Health -> ALB -> Metrics -> Simulate -> Fix
```

## Current Dev URL

Until Route 53 is added, use the ALB DNS name:

```text
http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/
```

This is valid for testing. Route 53 is not required for the app to work.

## Do We Need Route 53?

For basic testing:

```text
No. ALB DNS is enough.
```

For a real production-like URL:

```text
Yes. Route 53 gives a friendly domain like app.yourdomain.com.
```

How request flow changes:

```text
Without Route 53:
Browser -> ALB DNS -> ALB -> EC2 target -> app

With Route 53:
Browser -> app.yourdomain.com -> Route 53 alias record -> ALB -> EC2 target -> app
```

Route 53 does not run the app. It only answers, "Which AWS endpoint should this
domain name point to?"

## What Is CloudFront For?

CloudFront is a CDN and edge layer.

Use CloudFront when you want:

```text
1. Global caching closer to users.
2. Faster static assets such as JS, CSS, images.
3. TLS at the edge.
4. WAF protection at the edge.
5. Better control over headers, caching, and origin access.
```

Current project:

```text
Browser -> ALB -> EC2
```

Future production-style project:

```text
Browser -> Route 53 -> CloudFront -> ALB -> EC2
```

Interview answer:

```text
I do not need CloudFront for the first ALB-based dev test. I would add it when I
want edge caching, WAF, global performance, and a production-grade public entry
point. For dynamic API traffic, I would tune caching carefully so we do not cache
user-specific or stale responses.
```

## Slack And PagerDuty Alerts

Start with Slack for this lab.

Why:

```text
Slack has a free plan for basic usage.
It is enough to practice CloudWatch alarm notifications.
It avoids introducing on-call scheduling complexity too early.
```

Slack setup task:

```text
1. Create a free Slack workspace.
2. Create a channel named #orbit-alerts or #devops-alerts.
3. We will connect AWS notifications to that channel later.
```

Current AWS pattern we will implement:

```text
CloudWatch Alarm -> SNS Topic -> AWS Chatbot/Amazon Q Developer in chat applications -> Slack channel
```

PagerDuty:

```text
PagerDuty is useful for real on-call escalation: service ownership, escalation
policies, schedules, acknowledgements, and incident lifecycle.
```

For this lab:

```text
Use Slack first.
Add PagerDuty later if you want to practice on-call incident response.
```

Interview answer:

```text
For team visibility I send CloudWatch alarms to Slack. For production on-call, I
send critical alarms to PagerDuty because it handles escalation, acknowledgement,
and incident ownership.
```

## Normal JAR Deployment Process

For Java on EC2, the common production flow is:

```text
1. Build the JAR.
2. Run tests and quality/security checks.
3. Upload the exact tested JAR to an artifact store.
4. Download that artifact on the server.
5. Put it in a stable runtime path.
6. Restart the service.
7. Verify health locally.
8. Verify ALB target health.
9. Verify public URL.
10. Watch metrics and logs.
```

In this project:

```text
GitHub Actions builds with Maven.
GitHub Actions uploads the JAR to S3.
SSM runs shell commands on private EC2 instances.
EC2 copies the JAR from S3 to /opt/signalforge/signalforge-app.jar.
systemd runs the JAR as signalforge.service.
ALB routes traffic to port 8080 on healthy EC2 targets.
```

Important lesson from our real issue:

```text
Copying a new JAR is not enough.
If the old Java process is still running, users still get old behavior.
Always restart or reload the runtime process after replacing the artifact.
```

Correct deploy behavior:

```bash
sudo systemctl daemon-reload
sudo systemctl enable signalforge.service
sudo systemctl restart signalforge.service
curl -fsS http://localhost:8080/actuator/health
```

## systemctl vs journalctl

Think of `systemctl` as the service control desk.

Use it to ask or change service state:

```bash
sudo systemctl status signalforge.service --no-pager
sudo systemctl start signalforge.service
sudo systemctl stop signalforge.service
sudo systemctl restart signalforge.service
sudo systemctl enable signalforge.service
sudo systemctl disable signalforge.service
```

Meaning:

```text
status:
  Is the service running, failed, stopped, or restarting?

start:
  Start it now.

stop:
  Stop it now.

restart:
  Stop and start it now. Use this after replacing a JAR.

enable:
  Start automatically after server reboot.

disable:
  Do not start automatically after reboot.
```

Think of `journalctl` as the service log viewer.

Use it to read what the service wrote to systemd logs:

```bash
journalctl -u signalforge.service -n 100 --no-pager
journalctl -u signalforge.service -f
journalctl -u signalforge.service --since "10 minutes ago"
journalctl -u signalforge.service --since today
```

Meaning:

```text
-u signalforge.service:
  Show logs only for this service.

-n 100:
  Show last 100 log lines.

-f:
  Follow logs live, like tail -f.

--no-pager:
  Print directly instead of opening an interactive pager.

--since:
  Limit logs to a time window.
```

Interview answer:

```text
I use systemctl to manage the service lifecycle and journalctl to inspect the
service logs. For example, if ALB returns 502, I check whether the app service is
running with systemctl, then check startup errors, stack traces, or port binding
errors with journalctl.
```

## Is This Same For Python, Node, Or Other Apps?

The pattern is mostly the same:

```text
Build/package -> publish artifact -> download artifact -> update service -> restart -> health check -> observe
```

What changes by runtime:

```text
Java:
  Artifact is usually a JAR.
  Runtime command is java -jar app.jar.
  Troubleshoot JVM heap, GC, threads, classpath, Java version.

Python:
  Artifact may be a zip, wheel, container image, or source package.
  Runtime command may be gunicorn/uvicorn/python.
  Troubleshoot virtualenv, dependencies, worker count, import errors.

Node.js:
  Artifact may be built JS, npm package, or container image.
  Runtime command may be node/server.js or pm2.
  Troubleshoot node version, npm install, memory limit, event loop lag.

Container:
  Artifact is an image.
  Runtime is ECS/EKS/Docker.
  Troubleshoot image tag, pull permissions, env vars, container logs, probes.
```

Interview answer:

```text
The deployment principles are common across runtimes: deploy a versioned
artifact, restart or roll the runtime, verify health, and watch metrics. The
commands differ because Java has JVM-specific checks, Python has virtual
environment and worker checks, and containers have image and probe checks.
```

## End-To-End Test Checklist

### 1. Confirm AWS identity

```bash
aws sts get-caller-identity --profile admin-user
```

Expected account:

```text
575108962419
```

### 2. Confirm ALB exists

```bash
aws elbv2 describe-load-balancers \
  --profile admin-user \
  --region us-east-1 \
  --names signalforge-dev-alb
```

Look for:

```text
State: active
Scheme: internet-facing
DNSName: signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com
```

### 3. Confirm target health

```bash
aws elbv2 describe-target-health \
  --profile admin-user \
  --region us-east-1 \
  --target-group-arn <target-group-arn>
```

Healthy output means:

```text
ALB can reach the app on port 8080.
The health check path /actuator/health returns 200.
```

If unhealthy:

```text
Check app process, port 8080, health endpoint, security group, NACL, route table,
and instance boot/deploy logs.
```

### 4. Confirm public app

```bash
curl -i http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/
```

Expected:

```text
HTTP/1.1 200
HTML title: Orbit Ops
```

### 5. Confirm static files

```bash
curl -I http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/app.js
curl -I http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/styles.css
```

Expected:

```text
HTTP 200
Content-Type: text/javascript or text/css
```

### 6. Confirm app API

```bash
curl -s http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/api/ops/snapshot
```

Expected:

```text
JSON with requestRatePerMinute, successRatePercent, http4xxRatePercent,
http5xxRatePercent, p50Ms, p95Ms, p99Ms, healthyTargets.
```

### 7. Confirm CloudWatch alarms

```bash
aws cloudwatch describe-alarms \
  --profile admin-user \
  --region us-east-1 \
  --alarm-name-prefix signalforge-dev
```

Current alarms:

```text
signalforge-dev-alb-5xx
signalforge-dev-target-5xx
signalforge-dev-target-p95-latency
signalforge-dev-unhealthy-targets
signalforge-dev-asg-cpu-high
```

## Cost Safety Checklist Before Destroy And After Destroy

The expensive learning-lab resources are usually:

```text
NAT Gateway hourly charge
ALB hourly/LCU charge
EC2 instance hours
RDS instance hours
EBS volumes/snapshots
Public IPv4 addresses, especially idle Elastic IPs
Secrets Manager secrets
CloudWatch logs if retention is high
```

After running Terraform destroy, verify:

```bash
aws elbv2 describe-load-balancers --profile admin-user --region us-east-1
aws ec2 describe-nat-gateways --profile admin-user --region us-east-1
aws rds describe-db-instances --profile admin-user --region us-east-1
aws ec2 describe-instances --profile admin-user --region us-east-1
aws ec2 describe-addresses --profile admin-user --region us-east-1
aws ec2 describe-volumes --profile admin-user --region us-east-1
```

Important:

```text
If an Elastic IP is allocated but not associated with anything, it can still cost
money. Release it only when you are sure it is not needed.
```

Release an unused Elastic IP:

```bash
aws ec2 release-address \
  --profile admin-user \
  --region us-east-1 \
  --allocation-id <allocation-id>
```

## How To Log In With Session Manager

Session Manager lets you connect to private EC2 instances without opening SSH.

Find instances:

```bash
aws ec2 describe-instances \
  --profile admin-user \
  --region us-east-1 \
  --filters "Name=tag:Name,Values=signalforge-dev-app" \
  --query "Reservations[].Instances[].{Id:InstanceId,State:State.Name,PrivateIp:PrivateIpAddress}" \
  --output table
```

Start a session:

```bash
aws ssm start-session \
  --profile admin-user \
  --region us-east-1 \
  --target <instance-id>
```

Inside the instance, check:

```bash
systemctl status signalforge.service --no-pager
journalctl -u signalforge.service -n 100 --no-pager
ss -lntp | grep 8080
curl -i http://localhost:8080/actuator/health
curl -i http://localhost:8080/
```

What each proves:

```text
systemctl:
  Is systemd managing the app?

journalctl:
  What did the app log during startup or failure?

ss:
  Is any process listening on port 8080?

local curl:
  Does the app work before ALB is involved?
```

## How To Simulate Issues

Run through ALB:

```bash
curl -i "http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/simulate/error?status=502"
curl -i "http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/simulate/error?status=503"
curl -i "http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/simulate/latency?ms=1800"
curl -i "http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/simulate/cpu?seconds=6"
curl -i "http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/simulate/memory?mb=96"
```

Why quotes matter:

```text
In zsh, URLs with ? should be quoted. Otherwise the shell may treat ? as a file
pattern.
```

Then refresh:

```text
http://signalforge-dev-alb-93763886.us-east-1.elb.amazonaws.com/
```

Watch:

```text
Request rate
Success rate
4xx rate
5xx rate
P50/P95/P99
Recent request stream
Correlation coach
```

## Common Troubleshooting Scenarios

### Scenario: ALB returns 404 for /

Meaning:

```text
ALB reached the app, but the deployed app does not have the expected route or
static index.
```

Check:

```bash
curl -i http://<alb-dns>/
curl -i http://<alb-dns>/app.js
curl -i http://<alb-dns>/api/ops/snapshot
```

If health is 200 but these are 404:

```text
The app is running, but it may be an older artifact or missing static resources.
```

Fix:

```text
Deploy the correct artifact and restart the service.
```

### Scenario: New JAR copied but app still old

What happened in this project:

```text
GitHub Actions copied the new JAR to /opt/signalforge/signalforge-app.jar.
The old Java process kept running in memory.
ALB still served old routes.
```

Root cause:

```text
systemctl enable --now signalforge.service does not restart an already-running
service.
```

Fix:

```bash
sudo systemctl restart signalforge.service
```

Permanent workflow fix:

```bash
sudo systemctl enable signalforge.service
sudo systemctl restart signalforge.service
```

Interview answer:

```text
We had a deploy where the S3 artifact was updated and SSM succeeded, but ALB
still served old behavior. I checked target health, then called the app routes
directly through ALB. Health was 200, but new routes were 404. On the instance,
the Java process start time was older than the deploy time. That proved the JAR
was copied but the process was not restarted. We fixed the workflow to restart
the systemd service after copying the artifact.
```

### Scenario: ALB returns 503

Meaning:

```text
ALB has no healthy targets or cannot safely route traffic.
```

Check:

```bash
aws elbv2 describe-target-health --target-group-arn <target-group-arn>
aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names <asg-name>
```

Fix path:

```text
Restore healthy EC2 targets, fix health check path, fix port/security group, or
rollback bad deploy.
```

### Scenario: ALB returns 502

Meaning:

```text
ALB reached toward the target but did not receive a valid response.
```

Check on EC2:

```bash
ss -lntp | grep 8080
systemctl status signalforge.service --no-pager
journalctl -u signalforge.service -n 100 --no-pager
```

Fix path:

```text
Start/restart app, fix app crash, fix security group, fix timeout or protocol
mismatch.
```

### Scenario: Latency increases

Check:

```bash
curl -w 'status=%{http_code} ttfb=%{time_starttransfer} total=%{time_total}\n' -o /dev/null -s http://<alb-dns>/
top
free -m
jcmd <pid> Thread.print
jcmd <pid> GC.heap_info
jstat -gc <pid> 1000 5
```

Fix path:

```text
Find whether the wait is CPU, JVM GC, thread pool, DB query, or downstream API.
Scale only after confirming this is load-driven and not a code/config bug.
```

## What To Say In An Interview

```text
I validate deployment from both outside-in and inside-out. Outside-in means I
hit the ALB URL, static assets, health endpoint, and app API. Inside-out means I
connect through Session Manager, check systemd, logs, listening ports, and local
curl. Then I correlate with ALB target health and CloudWatch alarms. This helps
separate DNS/ALB/network issues from application/runtime issues.
```
