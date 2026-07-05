output "vpc_flow_log_group_name" {
  description = "CloudWatch log group receiving VPC Flow Logs."
  value       = aws_cloudwatch_log_group.vpc_flow_logs.name
}

output "app_runtime_log_group_name" {
  description = "CloudWatch log group receiving application and JVM GC logs."
  value       = aws_cloudwatch_log_group.app_runtime.name
}

output "dashboard_name" {
  description = "CloudWatch dashboard for Orbit/SigForge dev operations."
  value       = aws_cloudwatch_dashboard.ops.dashboard_name
}
