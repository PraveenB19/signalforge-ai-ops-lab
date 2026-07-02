resource "aws_security_group" "alb" {
  name        = "${var.name_prefix}-alb-sg"
  description = "Allow public HTTP traffic to the application load balancer."
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-alb-sg"
  })
}

resource "aws_security_group" "app" {
  name        = "${var.name_prefix}-app-sg"
  description = "Allow application traffic only from the ALB security group."
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-app-sg"
  })
}

resource "aws_security_group" "db" {
  name        = "${var.name_prefix}-db-sg"
  description = "Allow database traffic only from the application security group."
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-db-sg"
  })
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 80
  ip_protocol = "tcp"
  to_port     = 80

  description = "Allow public HTTP traffic to ALB."
}

resource "aws_vpc_security_group_egress_rule" "alb_to_app" {
  security_group_id = aws_security_group.alb.id

  referenced_security_group_id = aws_security_group.app.id
  from_port                    = var.app_port
  ip_protocol                  = "tcp"
  to_port                      = var.app_port

  description = "Allow ALB to forward traffic to app instances."
}

resource "aws_vpc_security_group_ingress_rule" "app_from_alb" {
  security_group_id = aws_security_group.app.id

  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = var.app_port
  ip_protocol                  = "tcp"
  to_port                      = var.app_port

  description = "Allow app traffic from ALB only."
}

resource "aws_vpc_security_group_egress_rule" "app_https_out" {
  security_group_id = aws_security_group.app.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 443
  ip_protocol = "tcp"
  to_port     = 443

  description = "Allow app instances to reach HTTPS endpoints through NAT."
}

resource "aws_vpc_security_group_egress_rule" "app_to_db" {
  security_group_id = aws_security_group.app.id

  referenced_security_group_id = aws_security_group.db.id
  from_port                    = var.database_port
  ip_protocol                  = "tcp"
  to_port                      = var.database_port

  description = "Allow app instances to connect to the database."
}

resource "aws_vpc_security_group_ingress_rule" "db_from_app" {
  security_group_id = aws_security_group.db.id

  referenced_security_group_id = aws_security_group.app.id
  from_port                    = var.database_port
  ip_protocol                  = "tcp"
  to_port                      = var.database_port

  description = "Allow database traffic from app instances only."
}
