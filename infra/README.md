# Infrastructure

This folder will contain Terraform code for AWS infrastructure.

Current implemented environment:

```text
envs/dev:
  First Terraform environment.
  Uses S3 remote state.
  Uses S3 native lockfile.
  Starts with safe AWS identity/region data sources before creating resources.
```

Planned components:

- Terraform backend
- GitHub OIDC IAM role
- VPC
- Public subnets
- Private app subnets
- Private DB subnets
- Internet Gateway
- Optional NAT Gateway
- ALB
- EC2
- RDS
- Security groups
- CloudWatch dashboards and alarms
- VPC Flow Logs
