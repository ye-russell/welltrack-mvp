# WellTrack MVP — Terraform Infrastructure

This directory contains Terraform configuration for deploying AWS infrastructure for WellTrack MVP.

## 🏗️ Infrastructure Components

### DynamoDB Tables
- `users` — User accounts
- `organizations` — Organizations/companies
- `memberships` — User-organization relationships with roles
- `projects` — Projects (fields)
- `wells` — Well data
- `stages` — Well operation stages
- `events` — Activities and events
- `files` — File metadata
- `audit_log` — Change history and audit trail

### S3
- File upload bucket with versioning and encryption
- CORS configured for direct browser uploads
- Lifecycle policies for cost optimization

### IAM
- Lambda execution role with DynamoDB and S3 access
- Development user with access keys (dev environment only)

## 📋 Prerequisites

1. **AWS CLI** installed and configured
2. **Terraform** >= 1.0 installed
3. **AWS Account** with appropriate permissions

## 🚀 Deployment Instructions

### 1. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

### 2. Initialize Terraform

```bash
cd infra/terraform
terraform init
```

### 3. Create terraform.tfvars

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

Example `terraform.tfvars`:
```hcl
aws_region     = "us-east-1"
environment    = "dev"
s3_bucket_name = ""  # Leave empty for auto-generated name
```

### 4. Plan Deployment

```bash
terraform plan
```

Review the planned changes carefully.

### 5. Apply Configuration

```bash
terraform apply
```

Type `yes` when prompted to confirm.

### 6. Get Outputs

```bash
# View all outputs
terraform output

# Get specific output
terraform output s3_bucket_name
terraform output next_env_vars

# Get sensitive outputs
terraform output -json dev_user_access_key_id
terraform output -json dev_user_secret_access_key
```

### 7. Setup Next.js Environment Variables

After applying, create `frontend/.env.local`:

```bash
# Generate .env.local from Terraform outputs
cd frontend
terraform -chdir=../infra/terraform output -json next_env_vars | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > .env.local

# Add dev credentials (if in dev environment)
echo "AWS_ACCESS_KEY_ID=$(terraform -chdir=../infra/terraform output -raw dev_user_access_key_id)" >> .env.local
echo "AWS_SECRET_ACCESS_KEY=$(terraform -chdir=../infra/terraform output -raw dev_user_secret_access_key)" >> .env.local

# Add auth secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
```

## 🔄 Update Infrastructure

```bash
# Make changes to .tf files
terraform plan
terraform apply
```

## 🗑️ Destroy Infrastructure

**⚠️ WARNING: This will delete all data!**

```bash
terraform destroy
```

## 📊 Cost Estimation

### Monthly Costs (Development)
- **DynamoDB:** $0-5 (Pay-per-request, minimal usage)
- **S3:** $0.50-5 (Depends on storage and requests)
- **Lambda:** Included in Vercel or minimal if self-hosted
- **Total:** ~$1-10/month for MVP testing

### Production Scaling
- Monitor costs in AWS Cost Explorer
- Consider switching to Provisioned Capacity for predictable workloads
- Implement S3 lifecycle policies (already configured)

## 🔐 Security Best Practices

1. **Never commit** `terraform.tfstate` or `.tfvars` files
2. **Use S3 backend** for remote state in production
3. **Enable MFA** on AWS root account
4. **Rotate access keys** regularly
5. **Use IAM roles** instead of access keys in production

## 🐛 Troubleshooting

### Error: Bucket name already exists
```bash
# Generate new random suffix
terraform taint random_id.bucket_suffix
terraform apply
```

### Error: Insufficient permissions
- Ensure your AWS user has `AdministratorAccess` or specific permissions for:
  - DynamoDB
  - S3
  - IAM
  - CloudWatch

### View Terraform State
```bash
terraform show
terraform state list
```

## 📚 Reference

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

## 🔗 Related Documentation

- [Database Schema](../../docs/database-schema.md)
- [Architecture Overview](../../docs/architecture.md)
- [API Documentation](../../docs/api.md) (TBD)
