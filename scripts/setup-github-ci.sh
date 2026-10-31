#!/usr/bin/env bash
#
# Configure GitHub repo settings for the GitHub Actions CI/CD workflows
#
# Prerequisites:
#   - gh CLI authenticated (gh auth login) with admin access to the repo
#   - The IAM role from scripts/create-github-actions-role.sh
#
# Usage:
#   bash scripts/setup-github-ci.sh [role-arn] [--require-checks]
#
# What this does (idempotent, safe to re-run):
#   1. Creates the deployment environments: production, stage
#   2. Sets the AWS_ROLE_ARN Actions variable
#   3. Sets missing secrets (MS_TEAMS_WEBHOOK_URL); existing secrets are left
#      untouched. Values are read from same-named env vars, or prompted for.
#   4. With --require-checks: adds "Lint & Test" to master's required status
#      checks (keeps the existing branch protection settings)
#
# Optional, not done here: required reviewers on 'production' (a -prod tag
# rewrites cdn.scite.ai for every embedder) and read-only default workflow
# permissions:
#   gh api -X PUT repos/scitedotai/scite-extension/actions/permissions/workflow \
#     -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false
#
set -euo pipefail

REPO="${REPO:-scitedotai/scite-extension}"
ROLE_ARN="arn:aws:iam::797267538066:role/scite-extension-github-actions"
REQUIRE_CHECKS=false

for arg in "$@"; do
    case "$arg" in
        --require-checks) REQUIRE_CHECKS=true ;;
        arn:aws:iam::*)   ROLE_ARN="$arg" ;;
        *) echo "Unknown argument: $arg" >&2; exit 1 ;;
    esac
done

ENVIRONMENTS=(production stage)
SECRETS=(MS_TEAMS_WEBHOOK_URL)

echo "=== scite-extension GitHub Actions Repo Setup ==="
echo ""
echo "Repo:     ${REPO}"
echo "Role ARN: ${ROLE_ARN}"
echo ""

if ! gh auth status &>/dev/null; then
    echo "Error: gh is not authenticated. Run: gh auth login" >&2
    exit 1
fi

# -------------------------------------------------------------------
# Step 1: Deployment environments
# -------------------------------------------------------------------
echo "--- Step 1: Environments ---"

for env in "${ENVIRONMENTS[@]}"; do
    gh api -X PUT "repos/${REPO}/environments/${env}" --silent
    echo "  Ensured environment: ${env}"
done

echo ""

# -------------------------------------------------------------------
# Step 2: AWS_ROLE_ARN Actions variable
# -------------------------------------------------------------------
echo "--- Step 2: Actions variable ---"

gh variable set AWS_ROLE_ARN --repo "${REPO}" --body "${ROLE_ARN}"
echo "  Set: AWS_ROLE_ARN=${ROLE_ARN}"

echo ""

# -------------------------------------------------------------------
# Step 3: Secrets (skip existing; env var or interactive prompt)
# -------------------------------------------------------------------
echo "--- Step 3: Secrets ---"

EXISTING_SECRETS=$(gh secret list --repo "${REPO}" --json name --jq '.[].name')

for secret in "${SECRETS[@]}"; do
    if echo "${EXISTING_SECRETS}" | grep -qx "${secret}"; then
        echo "  Exists, skipping: ${secret}"
        continue
    fi

    value="${!secret:-}"
    if [ -z "$value" ]; then
        read -rsp "  Enter value for ${secret} (empty to skip): " value
        echo ""
    fi

    if [ -z "$value" ]; then
        echo "  WARNING: ${secret} not set, Teams notifications will be skipped"
        continue
    fi

    gh secret set "${secret}" --repo "${REPO}" --body "${value}"
    echo "  Set: ${secret}"
done

echo ""

# -------------------------------------------------------------------
# Step 4 (optional): Require "Lint & Test" on master
# -------------------------------------------------------------------
if [ "$REQUIRE_CHECKS" = true ]; then
    echo "--- Step 4: Required status checks on master ---"
    gh api -X PATCH "repos/${REPO}/branches/master/protection/required_status_checks" \
        -F 'strict=true' \
        -f 'checks[][context]=Lint & Test' --silent
    echo "  Required check added: Lint & Test"
    echo ""
fi

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------
echo "=== Done ==="
echo ""
echo "Environments: $(gh api "repos/${REPO}/environments" --jq '[.environments[].name] | join(", ")')"
echo "Variables:"
gh variable list --repo "${REPO}" | sed 's/^/  /'
echo "Secrets:"
gh secret list --repo "${REPO}" | sed 's/^/  /'
