##########################
# IAM Roles and Policies #
##########################

# IAM Role for Next.js API routes (if using Lambda)
resource "aws_iam_role" "api_lambda_role" {
  name = "${local.project_name}-api-lambda-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

# Policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "${local.project_name}-lambda-dynamodb"
  role = aws_iam_role.api_lambda_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.organizations.arn,
          aws_dynamodb_table.memberships.arn,
          aws_dynamodb_table.projects.arn,
          aws_dynamodb_table.wells.arn,
          aws_dynamodb_table.stages.arn,
          aws_dynamodb_table.events.arn,
          aws_dynamodb_table.files.arn,
          aws_dynamodb_table.audit_log.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          "${aws_dynamodb_table.memberships.arn}/index/*",
          "${aws_dynamodb_table.projects.arn}/index/*",
          "${aws_dynamodb_table.wells.arn}/index/*",
          "${aws_dynamodb_table.stages.arn}/index/*",
          "${aws_dynamodb_table.events.arn}/index/*",
          "${aws_dynamodb_table.files.arn}/index/*",
          "${aws_dynamodb_table.audit_log.arn}/index/*"
        ]
      }
    ]
  })
}

# Policy for Lambda to access S3
resource "aws_iam_role_policy" "lambda_s3_policy" {
  name = "${local.project_name}-lambda-s3"
  role = aws_iam_role.api_lambda_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.files.arn,
          "${aws_s3_bucket.files.arn}/*"
        ]
      }
    ]
  })
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.api_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# IAM User for local development (optional)
resource "aws_iam_user" "dev_user" {
  count = var.environment == "dev" ? 1 : 0
  name  = "${local.project_name}-dev-user"
  
  tags = local.common_tags
}

resource "aws_iam_user_policy" "dev_user_policy" {
  count = var.environment == "dev" ? 1 : 0
  name  = "${local.project_name}-dev-policy"
  user  = aws_iam_user.dev_user[0].name
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:*",
          "s3:*"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.organizations.arn,
          aws_dynamodb_table.memberships.arn,
          aws_dynamodb_table.projects.arn,
          aws_dynamodb_table.wells.arn,
          aws_dynamodb_table.stages.arn,
          aws_dynamodb_table.events.arn,
          aws_dynamodb_table.files.arn,
          aws_dynamodb_table.audit_log.arn,
          "${aws_dynamodb_table.users.arn}/index/*",
          "${aws_dynamodb_table.memberships.arn}/index/*",
          "${aws_dynamodb_table.projects.arn}/index/*",
          "${aws_dynamodb_table.wells.arn}/index/*",
          "${aws_dynamodb_table.stages.arn}/index/*",
          "${aws_dynamodb_table.events.arn}/index/*",
          "${aws_dynamodb_table.files.arn}/index/*",
          "${aws_dynamodb_table.audit_log.arn}/index/*",
          aws_s3_bucket.files.arn,
          "${aws_s3_bucket.files.arn}/*"
        ]
      }
    ]
  })
}

# Generate access keys for dev user (store securely!)
resource "aws_iam_access_key" "dev_user_key" {
  count = var.environment == "dev" ? 1 : 0
  user  = aws_iam_user.dev_user[0].name
}
