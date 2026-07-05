resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/${var.name_prefix}/flow-logs"
  retention_in_days = 7

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "app_runtime" {
  name              = "/aws/ec2/${var.name_prefix}/signalforge"
  retention_in_days = 7

  tags = var.tags
}

data "aws_iam_policy_document" "flow_logs_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["vpc-flow-logs.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "flow_logs_write" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams"
    ]

    resources = ["${aws_cloudwatch_log_group.vpc_flow_logs.arn}:*"]
  }
}

resource "aws_iam_role" "flow_logs" {
  name               = "${var.name_prefix}-flow-logs-role"
  assume_role_policy = data.aws_iam_policy_document.flow_logs_assume_role.json

  tags = var.tags
}

resource "aws_iam_role_policy" "flow_logs" {
  name   = "${var.name_prefix}-flow-logs-write"
  role   = aws_iam_role.flow_logs.id
  policy = data.aws_iam_policy_document.flow_logs_write.json
}

resource "aws_flow_log" "vpc" {
  iam_role_arn    = aws_iam_role.flow_logs.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-vpc-flow-logs"
  })
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "${var.name_prefix}-alb-5xx"
  alarm_description   = "ALB is returning HTTP 5xx responses."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "target_5xx" {
  alarm_name          = "${var.name_prefix}-target-5xx"
  alarm_description   = "Application targets are returning HTTP 5xx responses."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "target_latency" {
  alarm_name          = "${var.name_prefix}-target-p95-latency"
  alarm_description   = "Application target p95 latency is high."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  extended_statistic  = "p95"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  threshold           = 1
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "unhealthy_targets" {
  alarm_name          = "${var.name_prefix}-unhealthy-targets"
  alarm_description   = "ALB has unhealthy application targets."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "asg_cpu_high" {
  alarm_name          = "${var.name_prefix}-asg-cpu-high"
  alarm_description   = "Average app ASG CPU utilization is high."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 70
  treat_missing_data  = "notBreaching"

  dimensions = {
    AutoScalingGroupName = var.autoscaling_group_name
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "asg_memory_high" {
  alarm_name          = "${var.name_prefix}-asg-memory-high"
  alarm_description   = "CloudWatch Agent reports high memory usage across app instances."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  treat_missing_data  = "missing"

  dimensions = {
    AutoScalingGroupName = var.autoscaling_group_name
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "asg_disk_high" {
  alarm_name          = "${var.name_prefix}-asg-disk-high"
  alarm_description   = "CloudWatch Agent reports high root filesystem usage on app instances."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "disk_used_percent"
  namespace           = "CWAgent"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  treat_missing_data  = "missing"

  dimensions = {
    AutoScalingGroupName = var.autoscaling_group_name
    path                 = "/"
  }

  tags = var.tags
}

resource "aws_cloudwatch_dashboard" "ops" {
  dashboard_name = "${var.name_prefix}-ops-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 2
        properties = {
          markdown = "# ${var.name_prefix} Ops Dashboard\nWatch traffic, errors, latency, target health, and ASG CPU while running Orbit drills."
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 2
        width  = 12
        height = 6
        properties = {
          title   = "ALB request rate and errors"
          view    = "timeSeries"
          stacked = false
          period  = 60
          stat    = "Sum"
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix, { label = "Requests" }],
            [".", "HTTPCode_ELB_5XX_Count", ".", ".", { label = "ALB 5xx" }],
            [".", "HTTPCode_Target_5XX_Count", ".", ".", "TargetGroup", var.target_group_arn_suffix, { label = "Target 5xx" }]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 2
        width  = 12
        height = 6
        properties = {
          title   = "Target latency p95"
          view    = "timeSeries"
          stacked = false
          period  = 60
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix, "TargetGroup", var.target_group_arn_suffix, { stat = "p95", label = "p95 latency" }],
            [".", ".", ".", ".", ".", ".", { stat = "Average", label = "avg latency" }]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 8
        width  = 12
        height = 6
        properties = {
          title   = "Target health"
          view    = "timeSeries"
          stacked = false
          period  = 60
          stat    = "Average"
          metrics = [
            ["AWS/ApplicationELB", "HealthyHostCount", "LoadBalancer", var.alb_arn_suffix, "TargetGroup", var.target_group_arn_suffix, { label = "Healthy targets" }],
            [".", "UnHealthyHostCount", ".", ".", ".", ".", { label = "Unhealthy targets" }]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 8
        width  = 12
        height = 6
        properties = {
          title   = "Auto Scaling CPU"
          view    = "timeSeries"
          stacked = false
          period  = 60
          stat    = "Average"
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", var.autoscaling_group_name, { label = "ASG average CPU" }]
          ]
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 14
        width  = 24
        height = 6
        properties = {
          title  = "Recent VPC rejected traffic"
          region = "us-east-1"
          query  = "SOURCE '${aws_cloudwatch_log_group.vpc_flow_logs.name}' | fields @timestamp, srcAddr, dstAddr, dstPort, protocol, action | filter action = 'REJECT' | sort @timestamp desc | limit 20"
          view   = "table"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 20
        width  = 12
        height = 6
        properties = {
          title   = "EC2 memory from CloudWatch Agent"
          view    = "timeSeries"
          stacked = false
          period  = 60
          stat    = "Average"
          metrics = [
            ["CWAgent", "mem_used_percent", "AutoScalingGroupName", var.autoscaling_group_name, { label = "ASG memory used %" }]
          ]
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 20
        width  = 12
        height = 6
        properties = {
          title   = "Root disk usage from CloudWatch Agent"
          view    = "timeSeries"
          stacked = false
          period  = 60
          stat    = "Average"
          metrics = [
            ["CWAgent", "disk_used_percent", "AutoScalingGroupName", var.autoscaling_group_name, "path", "/", { label = "Root disk used %" }]
          ]
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 26
        width  = 12
        height = 6
        properties = {
          title  = "Application systemd/stdout logs"
          region = "us-east-1"
          query  = "SOURCE '${aws_cloudwatch_log_group.app_runtime.name}' | fields @timestamp, @logStream, @message | filter @logStream like /app/ | sort @timestamp desc | limit 40"
          view   = "table"
        }
      },
      {
        type   = "log"
        x      = 12
        y      = 26
        width  = 12
        height = 6
        properties = {
          title  = "JVM GC log events"
          region = "us-east-1"
          query  = "SOURCE '${aws_cloudwatch_log_group.app_runtime.name}' | fields @timestamp, @logStream, @message | filter @logStream like /gc/ | sort @timestamp desc | limit 40"
          view   = "table"
        }
      }
    ]
  })
}
