output "launch_template_id" {
  description = "ID of the app launch template."
  value       = aws_launch_template.app.id
}

output "autoscaling_group_name" {
  description = "Name of the app Auto Scaling group."
  value       = aws_autoscaling_group.app.name
}

output "cpu_scaling_policy_arn" {
  description = "ARN of the ASG CPU target tracking scaling policy."
  value       = aws_autoscaling_policy.cpu_target_tracking.arn
}
