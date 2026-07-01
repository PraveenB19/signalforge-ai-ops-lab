# Manual Prerequisites

This file lists what you need to do manually before automation can take over.

## Next 30 Minutes

Do these first:

1. Create an empty GitHub repository named:

   ```text
   signalforge-ai-ops-lab
   ```

   Recommended visibility: public if you want portfolio visibility, private if you want to build quietly first.

2. Confirm your AWS account is ready.

   Minimum manual checks:

   ```text
   AWS login works
   Billing alerts are enabled
   MFA is enabled on root user
   You have an admin IAM user or IAM Identity Center access for setup
   Default region selected, preferably us-east-1
   ```

3. Create or confirm a SonarCloud account.

   Start with SonarCloud because it avoids running a SonarQube server on day one.

4. Create or confirm a Slack workspace.

   We can use Slack first because it is easier than PagerDuty for day-two alerting.

5. Decide whether you want a custom domain now or later.

   You do not need a domain for the first working deployment. The ALB DNS name is enough:

   ```text
   http://my-alb-123456.us-east-1.elb.amazonaws.com
   ```

   Buy the domain only when the app is reachable through ALB and you are ready for Route 53/ACM/HTTPS.

6. Keep your OpenAI or Anthropic API key ready.

   We will use it later for AI incident summaries. Do not paste it into code or commit it. It should go into GitHub Secrets or AWS Secrets Manager.

## Accounts Needed

| Account | Required | Purpose |
|---|---:|---|
| GitHub | Yes | Source control, GitHub Actions, artifacts, branch protection |
| AWS | Yes | Infrastructure, EC2, ALB, RDS, CloudWatch |
| SonarCloud | Recommended | Code quality and quality gate |
| Slack | Recommended | Alert notifications |
| PagerDuty | Optional | Production-style incident escalation |
| OpenAI or Anthropic | Optional initially | AI incident summaries and runbook generation |
| Domain registrar | Optional | Custom DNS name |

## AWS Cost Safety

Before creating infrastructure:

1. Enable MFA on AWS root.
2. Create a billing alarm.
3. Use one region for this lab.
4. Destroy resources when not practicing.
5. Avoid NAT Gateway until needed because it adds steady hourly cost.
6. Prefer small EC2 instances for the lab.
7. Use RDS free-tier eligible where possible, or delay RDS until app deployment works.

## GitHub Secrets We Will Eventually Need

```text
SONAR_TOKEN
SLACK_WEBHOOK_URL
OPENAI_API_KEY or ANTHROPIC_API_KEY
```

For AWS, we will avoid static secrets and use GitHub OIDC.

## AWS OIDC Manual Setup

We will automate as much as possible with Terraform, but the first bootstrap may require manual admin credentials.

Target model:

```text
GitHub Actions
  -> requests OIDC token
  -> AWS validates repo/branch/environment claims
  -> workflow assumes IAM role
  -> Terraform runs with short-lived credentials
```

No long-lived AWS access keys should be stored in GitHub.

