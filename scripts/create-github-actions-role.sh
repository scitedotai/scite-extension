#!/usr/bin/env bash
#
# Create the GitHub Actions IAM role for the scite badge release workflow
#
# Prerequisites:
#   - AWS CLI v2 configured with admin-level credentials
#   - The GitHub OIDC provider is created automatically if missing
#
# Usage:
#   bash scripts/create-github-actions-role.sh
#
# What this creates:
#   1. GitHub OIDC identity provider (if it doesn't already exist)
#   2. IAM role: scite-extension-github-actions
#   3. Inline policy badge-deploy-workflow (S3 badge/* in the prod and stage
#      asset buckets, CloudFront invalidation for the badge distributions)
#
# After running, set the role ARN as the AWS_ROLE_ARN Actions variable:
#   bash scripts/setup-github-ci.sh
#
set -euo pipefail

ACCOUNT_ID="797267538066"
REGION="us-west-2"
ROLE_NAME="scite-extension-github-actions"
GITHUB_ORG="scitedotai"
GITHUB_REPO="scite-extension"
OIDC_PROVIDER_URL="token.actions.githubusercontent.com"
OIDC_PROVIDER_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER_URL}"

echo "=== scite-extension GitHub Actions IAM Role Setup ==="
echo ""
echo "Account:  ${ACCOUNT_ID}"
echo "Region:   ${REGION}"
echo "Role:     ${ROLE_NAME}"
echo "Repo:     ${GITHUB_ORG}/${GITHUB_REPO}"
echo ""

# -------------------------------------------------------------------
# Step 1: Ensure GitHub OIDC provider exists
# -------------------------------------------------------------------
echo "--- Step 1: GitHub OIDC Provider ---"

if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "${OIDC_PROVIDER_ARN}" &>/dev/null; then
    echo "OIDC provider already exists: ${OIDC_PROVIDER_ARN}"
else
    echo "Creating OIDC provider..."
    # GitHub rotates certs but AWS validates via the root CA, so this
    # thumbprint is accepted per AWS docs.
    aws iam create-open-id-connect-provider \
        --url "https://${OIDC_PROVIDER_URL}" \
        --client-id-list "sts.amazonaws.com" \
        --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1"
    echo "Created OIDC provider: ${OIDC_PROVIDER_ARN}"
fi

echo ""

# -------------------------------------------------------------------
# Step 2: Create the IAM role
# -------------------------------------------------------------------
echo "--- Step 2: IAM Role ---"

# Trust policy: the deploy job runs in the production or stage environment on
# a badge-v* tag; the tag ref is belt-and-braces.
TRUST_POLICY=$(cat <<EOT
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "${OIDC_PROVIDER_ARN}"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "${OIDC_PROVIDER_URL}:aud": "sts.amazonaws.com"
                },
                "StringLike": {
                    "${OIDC_PROVIDER_URL}:sub": [
                        "repo:${GITHUB_ORG}/${GITHUB_REPO}:environment:production",
                        "repo:${GITHUB_ORG}/${GITHUB_REPO}:environment:stage",
                        "repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/tags/badge-v*"
                    ]
                }
            }
        }
    ]
}
EOT
)

if aws iam get-role --role-name "${ROLE_NAME}" &>/dev/null; then
    echo "Role already exists: ${ROLE_NAME}"
    echo "Updating trust policy..."
    aws iam update-assume-role-policy \
        --role-name "${ROLE_NAME}" \
        --policy-document "${TRUST_POLICY}"
    echo "Trust policy updated."
else
    echo "Creating role: ${ROLE_NAME}"
    aws iam create-role \
        --role-name "${ROLE_NAME}" \
        --assume-role-policy-document "${TRUST_POLICY}" \
        --description "GitHub Actions OIDC role for ${GITHUB_ORG}/${GITHUB_REPO} badge releases"
    echo "Role created."
fi

echo ""

# -------------------------------------------------------------------
# Step 3: Inline policy for the release-badge workflow
# -------------------------------------------------------------------
echo "--- Step 3: Inline policy: badge-deploy-workflow ---"

DEPLOY_POLICY=$(cat <<EOT
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3BadgeObjects",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:AbortMultipartUpload"
            ],
            "Resource": [
                "arn:aws:s3:::scitewebassets/badge/*",
                "arn:aws:s3:::scitewebassets-stage/badge/*"
            ]
        },
        {
            "Sid": "CloudFrontInvalidation",
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation",
                "cloudfront:GetInvalidation"
            ],
            "Resource": [
                "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/ERIXC9NB9NEX7",
                "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/EE31527A00YNS"
            ]
        }
    ]
}
EOT
)

aws iam put-role-policy \
    --role-name "${ROLE_NAME}" \
    --policy-name "badge-deploy-workflow" \
    --policy-document "${DEPLOY_POLICY}"
echo "  Created: badge-deploy-workflow"

echo ""

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

echo "=== Done ==="
echo ""
echo "Role ARN:  ${ROLE_ARN}"
echo ""
echo "The release-badge workflow reads this ARN from the AWS_ROLE_ARN Actions variable."
echo "Set it (plus environments and secrets) with:"
echo "  bash scripts/setup-github-ci.sh"
