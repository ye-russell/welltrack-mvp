# WellTrack MVP — Quick Start Guide

This guide will help you get the WellTrack MVP up and running.

## 📋 Prerequisites

- **Node.js** 20+ and npm
- **AWS Account** with administrator access
- **Terraform** 1.0+ installed
- **AWS CLI** installed and configured
- **Git** installed

---

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/ye-russell/welltrack-mvp.git
cd welltrack-mvp

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

### Step 3: Deploy Infrastructure with Terraform

```bash
# Navigate to Terraform directory
cd infra/terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars file
cat > terraform.tfvars << EOF
aws_region     = "us-east-1"
environment    = "dev"
s3_bucket_name = ""
EOF

# Review the plan
terraform plan

# Apply the configuration
terraform apply
# Type 'yes' when prompted
```

Wait for deployment to complete (~2-3 minutes).

### Step 4: Setup Environment Variables

```bash
# Navigate to frontend directory
cd ../../frontend

# Create .env.local file
touch .env.local

# Get AWS region from Terraform
echo "AWS_REGION=$(cd ../infra/terraform && terraform output -raw aws_region)" >> .env.local

# Get S3 bucket name
echo "AWS_S3_BUCKET_NAME=$(cd ../infra/terraform && terraform output -raw s3_bucket_name)" >> .env.local

# Get DynamoDB table names
cd ../infra/terraform
terraform output -json next_env_vars | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' >> ../../frontend/.env.local

# Get dev user credentials
echo "AWS_ACCESS_KEY_ID=$(terraform output -raw dev_user_access_key_id)" >> ../../frontend/.env.local
echo "AWS_SECRET_ACCESS_KEY=$(terraform output -raw dev_user_secret_access_key)" >> ../../frontend/.env.local

cd ../../frontend

# Generate NextAuth secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
```

**Or manually create `.env.local`:**

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<from terraform output>
AWS_SECRET_ACCESS_KEY=<from terraform output>
AWS_S3_BUCKET_NAME=<from terraform output>

# DynamoDB Tables
DYNAMODB_TABLE_USERS=welltrack-dev-users
DYNAMODB_TABLE_ORGANIZATIONS=welltrack-dev-organizations
DYNAMODB_TABLE_MEMBERSHIPS=welltrack-dev-memberships
DYNAMODB_TABLE_PROJECTS=welltrack-dev-projects
DYNAMODB_TABLE_WELLS=welltrack-dev-wells
DYNAMODB_TABLE_STAGES=welltrack-dev-stages
DYNAMODB_TABLE_EVENTS=welltrack-dev-events
DYNAMODB_TABLE_FILES=welltrack-dev-files
DYNAMODB_TABLE_AUDIT_LOG=welltrack-dev-audit-log

# NextAuth
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

### Step 5: Start Development Server

```bash
# Make sure you're in the frontend directory
cd frontend

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verify Setup

### Check AWS Resources

```bash
# List DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Check S3 bucket
aws s3 ls

# Verify IAM user
aws iam get-user --user-name welltrack-dev-dev-user
```

### Test API Endpoints (Once Implemented)

```bash
# Health check
curl http://localhost:3000/api/health

# Register user (once auth is implemented)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'
```

---

## 🔧 Common Issues & Solutions

### Issue: Terraform apply fails with "bucket name already exists"

**Solution:**
```bash
cd infra/terraform
terraform taint random_id.bucket_suffix
terraform apply
```

### Issue: AWS credentials not found

**Solution:**
```bash
# Check AWS CLI configuration
aws configure list

# Verify credentials
aws sts get-caller-identity
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
# On Linux/Mac:
lsof -ti:3000 | xargs kill -9

# On Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or run on different port
npm run dev -- -p 3001
```

### Issue: Module not found errors

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. **Review Documentation**
   - [Database Schema](../docs/database-schema.md)
   - [Requirements](../docs/requirements_en.md)
   - [Project Status](../docs/project-status.md)

2. **Start Development**
   - Implement authentication
   - Build API routes
   - Create UI components

3. **Join Development**
   - Follow coding standards
   - Write tests
   - Submit pull requests

---

## 🗑️ Cleanup (Remove Everything)

**⚠️ WARNING: This will delete all data and resources!**

```bash
# Destroy AWS infrastructure
cd infra/terraform
terraform destroy
# Type 'yes' when prompted

# Remove environment files
cd ../../frontend
rm .env.local

# Remove node modules
rm -rf node_modules
```

---

## 🆘 Getting Help

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/ye-russell/welltrack-mvp/issues)
- **Terraform**: [infra/terraform/README.md](../infra/terraform/README.md)

---

**Last Updated:** October 16, 2025  
**Status:** MVP Foundation Ready
