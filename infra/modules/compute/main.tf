data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

locals {
  user_data = <<-USERDATA
    #!/bin/bash
    set -euo pipefail

    mkdir -p /opt/signalforge
    cat > /opt/signalforge/health_server.py <<'PY'
    from http.server import BaseHTTPRequestHandler, HTTPServer
    import json

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path in ["/", "/health", "/actuator/health"]:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "UP", "service": "signalforge-placeholder"}).encode())
            else:
                self.send_response(404)
                self.end_headers()

        def log_message(self, format, *args):
            return

    HTTPServer(("0.0.0.0", ${var.app_port}), Handler).serve_forever()
    PY

    cat > /etc/systemd/system/signalforge-placeholder.service <<'SERVICE'
    [Unit]
    Description=SignalForge placeholder health service
    After=network-online.target
    Wants=network-online.target

    [Service]
    ExecStart=/usr/bin/python3 /opt/signalforge/health_server.py
    Restart=always
    RestartSec=5

    [Install]
    WantedBy=multi-user.target
    SERVICE

    systemctl daemon-reload
    systemctl enable --now signalforge-placeholder.service
  USERDATA
}

resource "aws_launch_template" "app" {
  name_prefix   = "${var.name_prefix}-app-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = var.instance_type

  iam_instance_profile {
    name = var.instance_profile_name
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_put_response_hop_limit = 2
    http_tokens                 = "required"
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [var.app_security_group_id]
  }

  user_data = base64encode(local.user_data)

  tag_specifications {
    resource_type = "instance"

    tags = merge(var.tags, {
      Name = "${var.name_prefix}-app"
    })
  }

  tag_specifications {
    resource_type = "volume"

    tags = merge(var.tags, {
      Name = "${var.name_prefix}-app-root"
    })
  }

  tags = var.tags
}

resource "aws_autoscaling_group" "app" {
  name                = "${var.name_prefix}-app-asg"
  desired_capacity    = var.desired_capacity
  health_check_type   = "ELB"
  max_size            = var.max_size
  min_size            = var.min_size
  target_group_arns   = var.target_group_arns
  vpc_zone_identifier = var.private_subnet_ids

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.name_prefix}-app"
    propagate_at_launch = true
  }

  dynamic "tag" {
    for_each = var.tags

    content {
      key                 = tag.key
      value               = tag.value
      propagate_at_launch = true
    }
  }
}
