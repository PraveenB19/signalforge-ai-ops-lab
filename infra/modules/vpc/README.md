# VPC Module

This module creates the first AWS network boundary for SignalForge.

It creates:

```text
VPC
Internet Gateway
Public subnets
Private app subnets
Private DB subnets
Public route table
Private app route table
Private DB route table
Route table associations
```

What it does not create yet:

```text
NAT Gateway
VPC endpoints
VPC Flow Logs
Security groups
```

Why no NAT Gateway yet:

```text
NAT Gateway has steady hourly cost.
For the first network plan, we keep the private subnets private and add NAT later
only when the app tier needs outbound internet access.
```

Traffic model:

```text
Internet
  -> public subnet / ALB later
  -> private app subnet / EC2 later
  -> private DB subnet / RDS later
```
