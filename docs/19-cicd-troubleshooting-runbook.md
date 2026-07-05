# CI/CD Troubleshooting Runbook

Use this when a GitHub Actions workflow succeeds but the expected AWS resources
do not appear.

## Scenario: Apply Succeeded But No New Resources Were Created

What happened in SignalForge:

```text
Terraform Dev Apply completed successfully.
AWS had only the VPC resources.
No EC2 instances, ALB, NAT Gateway, or Auto Scaling resources appeared.
```

The confusing log line:

```text
No changes. Your infrastructure matches the configuration.
Apply complete! Resources: 0 added, 0 changed, 0 destroyed.
```

What it actually meant:

```text
The workflow was successful for the code version it checked out.
But that code version was older and only contained the VPC module.
```

Evidence from the workflow log:

```text
Initializing modules...
- vpc in ../../modules/vpc
```

Expected evidence after the newer code is picked up:

```text
Initializing modules...
- alb in ../../modules/alb
- artifacts in ../../modules/artifacts
- compute in ../../modules/compute
- iam in ../../modules/iam
- security_groups in ../../modules/security-groups
- vpc in ../../modules/vpc
```

Root cause:

```text
The manual apply workflow ran against an older dev commit before the new module
changes were actually used by the workflow run.
```

## How To Troubleshoot

Check the workflow run branch and commit:

```text
GitHub -> Actions -> Terraform Dev Apply -> run details
Look for:
  head branch
  checkout SHA
```

Useful GitHub CLI commands:

```bash
gh run list --workflow terraform-dev-apply.yml --limit 5
gh run view <run-id> --log
git ls-remote origin dev feature/java-app main
```

What to compare:

```text
Workflow checkout SHA:
  The exact code version the runner used.

Current dev SHA:
  The latest commit currently on dev.

If they differ, the workflow may have run before the latest merge or against the
wrong selected branch.
```

## Debug Step To Add Temporarily

If the workflow output is confusing, add a temporary debug step after checkout:

```yaml
- name: Debug checked-out Terraform code
  run: |
    git rev-parse HEAD
    ls infra/modules
    sed -n '1,140p' infra/envs/dev/main.tf
```

What this proves:

```text
git rev-parse HEAD:
  Shows the exact commit used by the runner.

ls infra/modules:
  Shows whether the expected module folders exist in the runner.

sed:
  Prints whether dev/main.tf is calling only module "vpc" or the full stack.
```

## Interview Answer

```text
We had a case where Terraform apply succeeded but created no new resources. I
did not assume Terraform was broken. I checked the GitHub Actions logs and saw
that the runner initialized only the VPC module. That told me the workflow was
using an older commit or branch selection. I compared the workflow checkout SHA
with the current dev branch SHA, reran the manual workflow from the correct dev
branch, and then Terraform picked up the new ALB, IAM, security group, artifact,
and Auto Scaling modules.
```

Memory hook:

```text
Successful workflow does not always mean latest code.
Always check branch, SHA, modules initialized, and plan summary.
```

## Scenario: Deploy Succeeded But ALB Still Served Old App

What happened in SignalForge:

```text
GitHub Actions built the new JAR.
GitHub Actions uploaded the new JAR to S3.
SSM copied the new JAR to /opt/signalforge/signalforge-app.jar.
SSM command reported Success.
ALB /actuator/health returned 200.
But ALB / and /api/ops/snapshot returned 404.
```

Why this was confusing:

```text
The infrastructure was healthy.
The targets were healthy.
The deploy command succeeded.
But users still saw old application behavior.
```

Evidence:

```bash
curl -i http://<alb-dns>/
curl -i http://<alb-dns>/api/ops/snapshot
curl -i http://<alb-dns>/actuator/health
aws elbv2 describe-target-health --target-group-arn <target-group-arn>
```

What the evidence meant:

```text
/actuator/health = 200:
  ALB can reach the app and the app process is alive.

/ and /api/ops/snapshot = 404:
  The running process does not contain the new static UI or new API endpoint.

Healthy target group:
  This is not a security group or routing failure.
```

Root cause:

```text
The workflow copied a new JAR over the old file, but the old Java process kept
running in memory.
```

The bug:

```bash
sudo systemctl enable --now signalforge.service
```

Why:

```text
enable --now starts the service if it is not running, but it does not restart an
already-running service.
```

Fix:

```bash
sudo systemctl enable signalforge.service
sudo systemctl restart signalforge.service
```

How to confirm on EC2:

```bash
systemctl status signalforge.service --no-pager
ps -eo pid,lstart,cmd | grep signalforge-app.jar | grep -v grep
curl -i http://localhost:8080/
curl -i http://localhost:8080/api/ops/snapshot
```

Interview answer:

```text
I debugged a case where deployment succeeded but the ALB still showed old
behavior. I first checked the ALB URL, health endpoint, target health, and new
API path. Health was good, but the new path returned 404, so I knew ALB and
networking were fine and the running app was stale. On the instance, the Java
process start time was older than the deploy time. The workflow had copied the
new JAR but had not restarted systemd. We fixed the pipeline to restart the
service after copying the artifact.
```

## Auto Scaling: What We Implemented

Current SignalForge scaling:

```text
Auto Scaling Group min: 2
Auto Scaling Group desired: 2
Auto Scaling Group max: 3
Scaling policy: target tracking on average CPU utilization
CPU target: 60%
```

Meaning:

```text
AWS tries to keep the average CPU across app instances near 60%.
If average CPU stays high, ASG can add instances up to max size.
If average CPU stays low, ASG can reduce capacity down to min size.
```

Why CPU first:

```text
CPUUtilization is a native EC2/ASG CloudWatch metric.
It works without installing the CloudWatch Agent.
```

Why memory is later:

```text
EC2 memory utilization is not a default AWS metric.
To scale or alert on memory, we install/configure the CloudWatch Agent and emit
mem_used_percent as a custom metric.
```

Interview answer:

```text
For initial ASG scaling, I used target tracking based on average CPU because it
is a native CloudWatch metric and easy to operate. For production Java services,
I would also publish memory, disk, JVM heap, GC, and thread metrics through
CloudWatch Agent or an observability stack, then alert on those signals. I would
be careful scaling on memory because memory pressure may indicate a leak, not
just more traffic.
```

## Scenario: Terraform Apply Failed Creating CloudWatch Dashboard

What happened:

```text
Terraform apply reached aws_cloudwatch_dashboard.ops.
AWS rejected the dashboard body with InvalidParameterInput.
The error said metric widgets should have required property 'region'.
```

Why this happened:

```text
Terraform HCL syntax was valid, but the generated CloudWatch dashboard JSON did
not satisfy the CloudWatch PutDashboard API schema.
```

Important lesson:

```text
terraform validate checks Terraform configuration syntax and provider schema.
It does not guarantee every remote AWS API payload will pass service-specific
runtime validation.
```

Root cause:

```text
The log widgets had region configured, but the metric widgets did not.
CloudWatch metric widgets need a region so CloudWatch knows where to read the
metric data from.
```

Fix:

```text
Added aws_region as an input to the observability module.
Passed data.aws_region.current.name from infra/envs/dev/main.tf.
Set region = var.aws_region on every CloudWatch dashboard metric/log widget.
```

How to explain:

```text
This was not an IAM or CloudWatch alarm issue. Terraform was authenticated and
was able to call CloudWatch, but CloudWatch rejected the dashboard JSON. I read
the validation path from the error, found the affected metric widgets, added the
missing region property, and reran Terraform apply.
```

Interview answer:

```text
I treat Terraform apply failures in two buckets: Terraform configuration errors
and remote provider/API validation errors. In this case, Terraform syntax was
fine, but AWS CloudWatch PutDashboard rejected the JSON because metric widgets
were missing region. The fix was to pass the AWS region into the observability
module and include it in each metric widget. After that, the same apply can be
rerun safely because Terraform is idempotent.
```
