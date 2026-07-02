# Infrastructure

This folder will contain Terraform code for AWS infrastructure.

Current implemented environment:

```text
envs/dev:
  First Terraform environment.
  Uses S3 remote state.
  Uses S3 native lockfile.
  Plans the first VPC network boundary.
```

Planned components:

- Terraform backend
- GitHub OIDC IAM role
- VPC: planned
- Public subnets: planned
- Private app subnets: planned
- Private DB subnets: planned
- Internet Gateway: planned
- Optional NAT Gateway
- ALB
- EC2
- RDS
- Security groups
- CloudWatch dashboards and alarms
- VPC Flow Logs
