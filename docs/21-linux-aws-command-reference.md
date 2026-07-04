# Linux And AWS Command Reference

Use this when you want commands to copy, practice, and explain in interviews.

Memory hook:

```text
Who am I? Where am I? What is running? What is listening? What changed? What do logs say?
```

## Terminal Help

```bash
man systemctl
systemctl --help
journalctl --help
curl --help
aws help
aws s3 cp help
terraform -help
terraform plan -help
```

Meaning:

```text
man:
  Full manual page.

--help:
  Quick command syntax and flags.

aws <service> <command> help:
  AWS CLI help for one command.
```

## OS And Machine Info

```bash
cat /etc/os-release
uname -a
hostname
hostname -I
uptime
whoami
id
date
timedatectl
df -h
lsblk
free -m
lscpu
```

What to say:

```text
I first identify the OS distribution, kernel, hostname, uptime, logged-in user,
time sync, disk, memory, and CPU before making changes.
```

## systemctl: Service Control

```bash
sudo systemctl status signalforge.service --no-pager
sudo systemctl start signalforge.service
sudo systemctl stop signalforge.service
sudo systemctl restart signalforge.service
sudo systemctl enable signalforge.service
sudo systemctl disable signalforge.service
sudo systemctl daemon-reload
systemctl list-units --type=service --state=running
systemctl list-units --type=service --state=failed
```

Use `systemctl` to control services.

## journalctl: Service Logs

```bash
journalctl -u signalforge.service -n 100 --no-pager
journalctl -u signalforge.service -f
journalctl -u signalforge.service --since "10 minutes ago"
journalctl -u signalforge.service --since today
journalctl -p err -n 50 --no-pager
```

Use `journalctl` to read logs captured by systemd.

## Process Checks

```bash
ps aux | grep signalforge
pgrep -af signalforge
top
top -H -p $(pgrep -f signalforge-app)
sudo lsof -i :8080
ss -lntp | grep 8080
```

Meaning:

```text
ps/pgrep:
  Find the process.

top:
  CPU and memory pressure.

top -H:
  Thread-level CPU for Java troubleshooting.

lsof/ss:
  Which process is listening on a port.
```

## JVM And Java Troubleshooting

```bash
java -version
which java
echo $JAVA_HOME
jcmd
jcmd <pid> VM.version
jcmd <pid> VM.command_line
jcmd <pid> GC.heap_info
jcmd <pid> Thread.print
jstat -gc <pid> 1000 5
jmap -histo:live <pid> | head
```

What to check:

```text
Java version:
  Is the server running the expected Java version?

VM.command_line:
  Which JAR and JVM arguments started the process?

GC.heap_info:
  Heap usage and GC state.

Thread.print:
  Blocked, waiting, or CPU-heavy threads.

jstat:
  GC behavior over time.
```

## Network And Packet Checks

```bash
ip addr
ip route
cat /etc/resolv.conf
dig example.com
nslookup example.com
ping -c 5 <host-or-ip>
traceroute <host-or-ip>
curl -v http://localhost:8080/actuator/health
sudo tcpdump -i any port 8080 -nn
sudo tcpdump -i any host <ip-address> -nn
```

Packet loss:

```bash
ping -c 20 <host-or-ip>
```

Look for:

```text
packet loss percentage
average latency
large latency variation
```

Note:

```text
Some cloud hosts block ICMP ping. If ping fails but curl works, the service may
still be healthy.
```

## curl And wget

`curl` is usually better for API and HTTP troubleshooting.

```bash
curl -i http://<alb-dns>/
curl -v http://<alb-dns>/
curl -s http://<alb-dns>/api/ops/snapshot
curl -w 'status=%{http_code} dns=%{time_namelookup} connect=%{time_connect} ttfb=%{time_starttransfer} total=%{time_total}\n' -o /dev/null -s http://<alb-dns>/
curl -H 'Host: app.example.com' -i http://<alb-dns>/
```

`wget` is often used to download files.

```bash
wget https://example.com/file.tar.gz
wget -O app.jar https://example.com/app.jar
```

Interview answer:

```text
I use curl when I need to inspect status codes, headers, timing, payloads, and
TLS behavior. I use wget mostly for downloading files.
```

## SSH vs Session Manager

SSH:

```bash
ssh -i key.pem ec2-user@<public-ip>
```

Session Manager:

```bash
aws ssm start-session \
  --profile admin-user \
  --region us-east-1 \
  --target <instance-id>
```

Why Session Manager:

```text
No inbound SSH port 22.
No public IP required.
No SSH key distribution.
IAM-controlled access.
Auditable through AWS.
Works with private EC2 instances.
```

Interview answer:

```text
I prefer Session Manager for private EC2 access because it removes public SSH
exposure and key-management overhead. Access is IAM-based and auditable.
```

## AWS Identity And Resource Checks

```bash
aws sts get-caller-identity --profile admin-user

aws ec2 describe-instances \
  --profile admin-user \
  --region us-east-1 \
  --filters "Name=tag:Name,Values=signalforge-dev-app" \
  --query "Reservations[].Instances[].{Id:InstanceId,State:State.Name,PrivateIp:PrivateIpAddress}" \
  --output table

aws elbv2 describe-load-balancers \
  --profile admin-user \
  --region us-east-1

aws elbv2 describe-target-health \
  --profile admin-user \
  --region us-east-1 \
  --target-group-arn <target-group-arn>
```

## CloudWatch Checks

```bash
aws cloudwatch describe-alarms \
  --profile admin-user \
  --region us-east-1 \
  --alarm-name-prefix signalforge-dev

aws logs describe-log-groups \
  --profile admin-user \
  --region us-east-1 \
  --log-group-name-prefix /aws/vpc/signalforge-dev

aws cloudwatch get-dashboard \
  --profile admin-user \
  --region us-east-1 \
  --dashboard-name signalforge-dev-ops-dashboard
```

## S3 Artifact Commands

```bash
aws s3 ls s3://<artifact-bucket>/
aws s3 ls s3://<artifact-bucket>/releases/
aws s3 cp app/target/signalforge-app-0.1.0-SNAPSHOT.jar s3://<artifact-bucket>/releases/app.jar
aws s3 cp s3://<artifact-bucket>/releases/app.jar /opt/signalforge/signalforge-app.jar
aws s3api head-object --bucket <artifact-bucket> --key releases/app.jar
```

Copy local file to S3:

```bash
aws s3 cp ./notes.txt s3://<bucket>/practice/notes.txt
```

Copy S3 file to local:

```bash
aws s3 cp s3://<bucket>/practice/notes.txt ./notes-downloaded.txt
```

## Simple Python S3 Upload

Later, when we practice Python:

```python
import boto3

s3 = boto3.client("s3")
s3.upload_file("notes.txt", "my-bucket-name", "practice/notes.txt")
```

What to explain:

```text
The AWS CLI and boto3 both call AWS APIs. CLI is convenient for shell work.
boto3 is useful when automation needs logic, loops, validation, or integration
with other code.
```

## NTP And Time Sync

```bash
date
timedatectl
timedatectl status
chronyc tracking
```

Why time matters:

```text
Wrong time can break TLS, logs correlation, token validation, and incident
timelines.
```

## Safe Troubleshooting Order

```text
1. Confirm user impact with curl/browser.
2. Check ALB target health.
3. Start Session Manager.
4. Check systemctl status.
5. Check journalctl logs.
6. Check port 8080 with ss.
7. Check local health endpoint.
8. Check CPU, memory, disk.
9. Check JVM threads/heap if Java issue.
10. Check DB/network/dependencies.
```

