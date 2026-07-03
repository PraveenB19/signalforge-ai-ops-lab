output "db_instance_identifier" {
  description = "RDS instance identifier."
  value       = aws_db_instance.this.identifier
}

output "db_endpoint" {
  description = "RDS endpoint address."
  value       = aws_db_instance.this.address
}

output "db_secret_arn" {
  description = "Secrets Manager ARN containing database credentials."
  value       = aws_secretsmanager_secret.database.arn
}
