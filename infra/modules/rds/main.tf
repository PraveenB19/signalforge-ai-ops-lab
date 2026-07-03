resource "random_password" "database" {
  length           = 24
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.name_prefix}-db-subnets"
  subnet_ids = var.private_db_subnet_ids

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-db-subnets"
  })
}

resource "aws_secretsmanager_secret" "database" {
  name                    = "${var.name_prefix}/database"
  description             = "SignalForge dev database credentials."
  recovery_window_in_days = 0

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "database" {
  secret_id = aws_secretsmanager_secret.database.id

  secret_string = jsonencode({
    username = var.database_username
    password = random_password.database.result
    database = var.database_name
  })
}

resource "aws_db_instance" "this" {
  identifier = "${var.name_prefix}-postgres"

  allocated_storage      = var.allocated_storage
  db_name                = var.database_name
  db_subnet_group_name   = aws_db_subnet_group.this.name
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = var.instance_class
  password               = random_password.database.result
  publicly_accessible    = false
  skip_final_snapshot    = var.skip_final_snapshot
  storage_encrypted      = true
  username               = var.database_username
  vpc_security_group_ids = [var.db_security_group_id]

  backup_retention_period = 1
  deletion_protection     = false

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-postgres"
  })
}
