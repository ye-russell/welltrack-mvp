# Architecture Overview

Frontend — Next.js 15 (App Router)  
Backend — Next.js API routes + AWS Lambda  
Database — DynamoDB  
Storage — S3  
Auth — Cognito / JWT  
Infra — Serverless Framework or Terraform

## Flow
User → Next.js (SSR) → API Routes → AWS Lambda → DynamoDB / S3
