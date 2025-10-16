################
# Outputs #
################

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    users         = aws_dynamodb_table.users.name
    organizations = aws_dynamodb_table.organizations.name
    memberships   = aws_dynamodb_table.memberships.name
    projects      = aws_dynamodb_table.projects.name
    wells         = aws_dynamodb_table.wells.name
    stages        = aws_dynamodb_table.stages.name
    events        = aws_dynamodb_table.events.name
    files         = aws_dynamodb_table.files.name
    audit_log     = aws_dynamodb_table.audit_log.name
  }
}

output "s3_bucket_name" {
  description = "S3 bucket name for file uploads"
  value       = aws_s3_bucket.files.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.files.arn
}

output "lambda_role_arn" {
  description = "IAM role ARN for Lambda functions"
  value       = aws_iam_role.api_lambda_role.arn
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

# Dev user credentials (only in dev environment)
output "dev_user_access_key_id" {
  description = "Development user access key ID"
  value       = var.environment == "dev" ? aws_iam_access_key.dev_user_key[0].id : null
  sensitive   = true
}

output "dev_user_secret_access_key" {
  description = "Development user secret access key"
  value       = var.environment == "dev" ? aws_iam_access_key.dev_user_key[0].secret : null
  sensitive   = true
}

# Environment variables for Next.js
output "next_env_vars" {
  description = "Environment variables for Next.js .env.local file"
  value = {
    AWS_REGION                    = var.aws_region
    AWS_S3_BUCKET_NAME           = aws_s3_bucket.files.bucket
    DYNAMODB_TABLE_USERS         = aws_dynamodb_table.users.name
    DYNAMODB_TABLE_ORGANIZATIONS = aws_dynamodb_table.organizations.name
    DYNAMODB_TABLE_MEMBERSHIPS   = aws_dynamodb_table.memberships.name
    DYNAMODB_TABLE_PROJECTS      = aws_dynamodb_table.projects.name
    DYNAMODB_TABLE_WELLS         = aws_dynamodb_table.wells.name
    DYNAMODB_TABLE_STAGES        = aws_dynamodb_table.stages.name
    DYNAMODB_TABLE_EVENTS        = aws_dynamodb_table.events.name
    DYNAMODB_TABLE_FILES         = aws_dynamodb_table.files.name
    DYNAMODB_TABLE_AUDIT_LOG     = aws_dynamodb_table.audit_log.name
  }
}
