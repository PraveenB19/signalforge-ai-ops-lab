output "launch_template_id" {
  description = "ID of the app launch template."
  value       = aws_launch_template.app.id
}

output "autoscaling_group_name" {
  description = "Name of the app Auto Scaling group."
  value       = aws_autoscaling_group.app.name
}
