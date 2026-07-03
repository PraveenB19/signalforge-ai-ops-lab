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

