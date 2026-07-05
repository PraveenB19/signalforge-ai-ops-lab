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

output "app_cpu_scaling_policy_arn" {
  description = "ARN of the app CPU target tracking scaling policy."
  value       = module.compute.cpu_scaling_policy_arn
}

output "db_endpoint" {
  description = "Private RDS endpoint for the dev database."
  value       = module.rds.db_endpoint
}

output "db_secret_arn" {
  description = "Secrets Manager secret ARN for dev database credentials."
  value       = module.rds.db_secret_arn
}

output "vpc_flow_log_group_name" {
  description = "CloudWatch log group for VPC Flow Logs."
  value       = module.observability.vpc_flow_log_group_name
}

output "app_runtime_log_group_name" {
  description = "CloudWatch log group for application and JVM GC logs."
  value       = module.observability.app_runtime_log_group_name
}

output "cloudwatch_dashboard_name" {
  description = "CloudWatch dashboard for dev operational testing."
  value       = module.observability.dashboard_name
}
