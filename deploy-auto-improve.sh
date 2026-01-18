#!/bin/bash

# Deploy Auto-Improve System to All BREZ Repositories
# This script distributes:
# 1. auto-improve.sh script
# 2. GitHub Actions workflow
# 3. DOCUMENTARY_CREW.md documentation

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    error "GitHub CLI (gh) is required but not installed."
    error "Install it with: brew install gh"
    exit 1
fi

# Check if authenticated with GitHub
if ! gh auth status &> /dev/null; then
    error "Not authenticated with GitHub CLI."
    error "Run: gh auth login"
    exit 1
fi

# Get organization name
ORG="${1:-aro-brez}"
log "Deploying to organization: $ORG"

# Get list of all repositories
log "Fetching repository list..."
REPOS=$(gh repo list "$ORG" --limit 1000 --json name --jq '.[].name')

if [ -z "$REPOS" ]; then
    error "No repositories found for organization: $ORG"
    exit 1
fi

REPO_COUNT=$(echo "$REPOS" | wc -l)
log "Found $REPO_COUNT repositories"

# Files to deploy
SOURCE_DIR="/Users/aaronnosbisch/brez-growth-generator"
FILES_TO_DEPLOY=(
    "auto-improve.sh"
    ".github/workflows/auto-improve.yml"
    "docs/DOCUMENTARY_CREW.md"
)

# Verify source files exist
log "Verifying source files..."
for file in "${FILES_TO_DEPLOY[@]}"; do
    if [ ! -f "$SOURCE_DIR/$file" ]; then
        error "Source file not found: $SOURCE_DIR/$file"
        exit 1
    fi
    log "✓ Found: $file"
done

# Create temporary working directory
WORK_DIR=$(mktemp -d)
log "Working directory: $WORK_DIR"

# Counter for tracking
DEPLOYED=0
SKIPPED=0
FAILED=0

# Deploy to each repository
echo "$REPOS" | while IFS= read -r repo; do
    log "Processing: $repo"

    REPO_DIR="$WORK_DIR/$repo"

    # Clone repository
    if ! gh repo clone "$ORG/$repo" "$REPO_DIR" -- --depth 1 2>&1; then
        error "Failed to clone $repo"
        ((FAILED++))
        continue
    fi

    cd "$REPO_DIR"

    # Check if auto-improve already exists
    if [ -f "auto-improve.sh" ]; then
        warn "$repo already has auto-improve.sh - skipping"
        ((SKIPPED++))
        cd "$WORK_DIR"
        rm -rf "$REPO_DIR"
        continue
    fi

    # Create necessary directories
    mkdir -p .github/workflows
    mkdir -p docs

    # Copy files
    cp "$SOURCE_DIR/auto-improve.sh" .
    chmod +x auto-improve.sh
    cp "$SOURCE_DIR/.github/workflows/auto-improve.yml" .github/workflows/
    cp "$SOURCE_DIR/docs/DOCUMENTARY_CREW.md" docs/

    # Create .gitignore entry for proposals
    if ! grep -q ".auto-improve-proposals.json" .gitignore 2>/dev/null; then
        echo ".auto-improve-proposals.json" >> .gitignore
    fi

    # Commit and push
    git config user.name "BREZ Auto-Improve Bot"
    git config user.email "bot@brez.com"
    git add auto-improve.sh .github/workflows/auto-improve.yml docs/DOCUMENTARY_CREW.md .gitignore

    if git diff --staged --quiet; then
        warn "$repo - no changes to commit"
        ((SKIPPED++))
    else
        git commit -m "🤖 Add auto-improve system and documentary crew

- Auto-improve script with SEED loop implementation
- GitHub Actions workflow for automated improvements
- Documentary crew documentation for content production

Implements autonomous repository improvement via Claude API.
Requires ANTHROPIC_API_KEY secret to be configured.

Co-Authored-By: BREZ Auto-Improve Bot <bot@brez.com>"

        if git push origin HEAD; then
            log "✅ Deployed to $repo"
            ((DEPLOYED++))
        else
            error "Failed to push to $repo"
            ((FAILED++))
        fi
    fi

    # Clean up
    cd "$WORK_DIR"
    rm -rf "$REPO_DIR"
done

# Clean up working directory
rm -rf "$WORK_DIR"

# Summary
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "DEPLOYMENT COMPLETE"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Total repositories: $REPO_COUNT"
log "Deployed: $DEPLOYED"
log "Skipped: $SKIPPED"
log "Failed: $FAILED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "⚠️  IMPORTANT: Configure ANTHROPIC_API_KEY secret for each repository"
log "Run the following command for each repo:"
log "gh secret set ANTHROPIC_API_KEY --repo $ORG/[repo-name]"
log ""
log "Or use the companion script: configure-secrets.sh"
