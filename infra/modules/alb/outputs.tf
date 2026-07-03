output "alb_arn" {
  description = "ARN of the ALB."
  value       = aws_lb.this.arn
}

output "alb_arn_suffix" {
  description = "ARN suffix of the ALB used by CloudWatch metric dimensions."
  value       = aws_lb.this.arn_suffix
}

output "alb_dns_name" {
  description = "Public DNS name of the ALB."
  value       = aws_lb.this.dns_name
}

output "alb_zone_id" {
  description = "Hosted zone ID of the ALB."
  value       = aws_lb.this.zone_id
}

output "target_group_arn" {
  description = "ARN of the app target group."
  value       = aws_lb_target_group.app.arn
}

output "target_group_arn_suffix" {
  description = "ARN suffix of the app target group used by CloudWatch metric dimensions."
  value       = aws_lb_target_group.app.arn_suffix
}
