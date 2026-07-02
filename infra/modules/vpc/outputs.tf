output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets."
  value       = values(aws_subnet.public)[*].id
}

output "private_app_subnet_ids" {
  description = "IDs of the private application subnets."
  value       = values(aws_subnet.private_app)[*].id
}

output "private_db_subnet_ids" {
  description = "IDs of the private database subnets."
  value       = values(aws_subnet.private_db)[*].id
}

output "internet_gateway_id" {
  description = "ID of the internet gateway."
  value       = aws_internet_gateway.this.id
}
