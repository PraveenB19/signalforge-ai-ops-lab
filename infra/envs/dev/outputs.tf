output "account_id" {
  description = "AWS account Terraform is authenticated to."
  value       = data.aws_caller_identity.current.account_id
}

output "region" {
  description = "AWS region Terraform is using."
  value       = data.aws_region.current.region
}

output "name_prefix" {
  description = "Prefix that future dev resources will use."
  value       = local.name_prefix
}

output "vpc_id" {
  description = "Planned VPC ID after apply."
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Planned public subnet IDs after apply."
  value       = module.vpc.public_subnet_ids
}

output "private_app_subnet_ids" {
  description = "Planned private app subnet IDs after apply."
  value       = module.vpc.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  description = "Planned private DB subnet IDs after apply."
  value       = module.vpc.private_db_subnet_ids
}

output "nat_gateway_id" {
  description = "NAT gateway ID used by private app subnets."
  value       = module.vpc.nat_gateway_id
}

output "artifact_bucket_name" {
  description = "S3 bucket used for SignalForge application artifacts."
  value       = module.artifacts.bucket_name
}

output "alb_dns_name" {
  description = "Public DNS name for the dev ALB."
  value       = module.alb.alb_dns_name
}

output "alb_url" {
  description = "HTTP URL for the dev ALB."
  value       = "http://${module.alb.alb_dns_name}"
}

output "app_autoscaling_group_name" {
  description = "Name of the app Auto Scaling group."
  value       = module.compute.autoscaling_group_name
}
