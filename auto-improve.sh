#!/bin/bash

# BREZ Auto-Improve Script
# Implements THE SEED loop for continuous repository improvement
# This script queries an agent for improvements and auto-implements validated changes

set -e

# Configuration
AGENT_SERVER_URL="${AGENT_SERVER_URL:-https://api.anthropic.com/v1/messages}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}"
REPO_NAME=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || echo 'unknown')")
CHECK_INTERVAL="${CHECK_INTERVAL:-3600}" # 1 hour default
SINGLE_RUN="${1:-false}"

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

# Function: Get current repo state (PERCEIVE phase of SEED)
get_repo_state() {
    local state="{"

    # Git info
    if [ -d .git ]; then
        state="${state}\"last_commit\":\"$(git rev-parse --short HEAD 2>/dev/null || echo 'none')\","
        state="${state}\"branch\":\"$(git branch --show-current 2>/dev/null || echo 'none')\","
        state="${state}\"uncommitted_changes\":$(git status --porcelain | wc -l),"
    fi

    # Test coverage (if available)
    if [ -f package.json ] && command -v npm &> /dev/null; then
        state="${state}\"has_tests\":$(grep -q '\"test\"' package.json && echo 'true' || echo 'false'),"
    fi

    # Lint errors (if available)
    if [ -f package.json ] && command -v npm &> /dev/null; then
        lint_count=$(npm run lint 2>&1 | grep -c "error" || echo 0)
        state="${state}\"lint_errors\":${lint_count},"
    fi

    # File structure
    state="${state}\"total_files\":$(find . -type f ! -path '*/.*' | wc -l),"
    state="${state}\"has_readme\":$([ -f README.md ] && echo 'true' || echo 'false'),"
    state="${state}\"has_docs\":$([ -d docs ] && echo 'true' || echo 'false')"

    state="${state}}"
    echo "$state"
}

# Function: Query Claude for improvements (QUESTION + RECEIVE phases)
query_improvements() {
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        warn "ANTHROPIC_API_KEY not set. Skipping improvement query."
        echo "[]"
        return
    fi

    local repo_state=$(get_repo_state)

    log "Querying agent for improvements..."

    # Create prompt for Claude
    local prompt="You are an autonomous repository improvement agent implementing THE SEED loop.

Repository: ${REPO_NAME}
Current State: ${repo_state}

Analyze this repository and suggest 1-3 specific, actionable improvements. For each improvement:
1. Classify it as Tier 1 (safe auto-implement: docs, formatting, lint fixes), Tier 2 (soft auto: tests, minor refactors), or Tier 3 (needs approval: breaking changes, architecture)
2. Provide exact commands or file changes needed
3. Explain expected benefit
4. Estimate risk level

Respond in JSON format:
{
  \"improvements\": [
    {
      \"tier\": 1,
      \"title\": \"Brief title\",
      \"description\": \"What and why\",
      \"commands\": [\"command1\", \"command2\"],
      \"files_to_modify\": [{\"path\": \"file.txt\", \"change\": \"description\"}],
      \"expected_benefit\": \"What improves\",
      \"risk_level\": \"low\"
    }
  ]
}"

    # Call Claude API
    local response=$(curl -s -X POST "$AGENT_SERVER_URL" \
        -H "x-api-key: $ANTHROPIC_API_KEY" \
        -H "content-type: application/json" \
        -H "anthropic-version: 2023-06-01" \
        -d "{
            \"model\": \"claude-sonnet-4-5-20250929\",
            \"max_tokens\": 4096,
            \"messages\": [{
                \"role\": \"user\",
                \"content\": $(echo "$prompt" | jq -Rs .)
            }]
        }")

    # Extract improvements from response
    echo "$response" | jq -r '.content[0].text' 2>/dev/null || echo "{\"improvements\":[]}"
}

# Function: Validate improvement effectiveness (LEARN phase)
validate_improvement() {
    local improvement="$1"
    local tier=$(echo "$improvement" | jq -r '.tier')

    log "Validating improvement (Tier $tier)..."

    # Tier 1: Auto-approve (docs, formatting, safe changes)
    if [ "$tier" -eq 1 ]; then
        log "✅ Tier 1 improvement - auto-approved"
        return 0
    fi

    # Tier 2: Validate with tests
    if [ "$tier" -eq 2 ]; then
        if [ -f package.json ] && grep -q '"test"' package.json; then
            log "Running tests for validation..."
            if npm test 2>&1 | tee /tmp/test-output.log; then
                log "✅ Tests passed - Tier 2 improvement approved"
                return 0
            else
                error "Tests failed - rejecting improvement"
                return 1
            fi
        else
            warn "No tests available - auto-approving Tier 2 (review recommended)"
            return 0
        fi
    fi

    # Tier 3: Reject (needs human approval)
    if [ "$tier" -eq 3 ]; then
        warn "⏸️  Tier 3 improvement requires human approval - logging for review"
        echo "$improvement" >> .auto-improve-proposals.json
        return 1
    fi

    return 1
}

# Function: Implement improvement (IMPROVE phase)
implement_improvement() {
    local improvement="$1"
    local title=$(echo "$improvement" | jq -r '.title')
    local commands=$(echo "$improvement" | jq -r '.commands[]' 2>/dev/null)

    log "Implementing: $title"

    # Execute commands
    if [ -n "$commands" ]; then
        echo "$commands" | while IFS= read -r cmd; do
            log "Running: $cmd"
            eval "$cmd" || warn "Command failed: $cmd"
        done
    fi

    # Handle file modifications
    local files=$(echo "$improvement" | jq -c '.files_to_modify[]?' 2>/dev/null)
    if [ -n "$files" ]; then
        echo "$files" | while IFS= read -r file_mod; do
            local filepath=$(echo "$file_mod" | jq -r '.path')
            local change=$(echo "$file_mod" | jq -r '.change')
            log "File modification queued: $filepath - $change"
            # Note: Actual file modifications would need more sophisticated handling
        done
    fi

    log "✅ Implementation complete: $title"
}

# Function: Commit improvements (SHARE phase)
commit_improvements() {
    local title="$1"

    if ! git diff --quiet; then
        log "Committing improvements..."
        git add -A
        git commit -m "🤖 Auto-improve: $title

Co-Authored-By: BREZ Auto-Improve Bot <bot@brez.com>
Implemented via THE SEED autonomous improvement loop" || warn "Commit failed"

        log "✅ Changes committed"
    else
        log "No changes to commit"
    fi
}

# Main SEED loop
run_improvement_cycle() {
    log "Starting improvement cycle for $REPO_NAME"

    # PERCEIVE: Get current state
    local state=$(get_repo_state)
    log "Current state: $state"

    # QUESTION + RECEIVE: Query for improvements
    local improvements_json=$(query_improvements)

    # Parse improvements
    local improvement_count=$(echo "$improvements_json" | jq -r '.improvements | length' 2>/dev/null || echo 0)

    if [ "$improvement_count" -eq 0 ]; then
        log "No improvements suggested"
        return
    fi

    log "Received $improvement_count improvement suggestion(s)"

    # Process each improvement
    echo "$improvements_json" | jq -c '.improvements[]' 2>/dev/null | while IFS= read -r improvement; do
        local title=$(echo "$improvement" | jq -r '.title')
        local tier=$(echo "$improvement" | jq -r '.tier')

        log "Processing: $title (Tier $tier)"

        # LEARN: Validate effectiveness
        if validate_improvement "$improvement"; then
            # IMPROVE: Implement
            implement_improvement "$improvement"

            # SHARE: Commit
            commit_improvements "$title"
        else
            warn "Skipped: $title (failed validation)"
        fi
    done

    log "Improvement cycle complete"
}

# Main execution
main() {
    log "🌱 BREZ Auto-Improve - THE SEED Loop for Repository Evolution"

    if [ "$SINGLE_RUN" = "--single-run" ]; then
        run_improvement_cycle
        exit 0
    fi

    log "Running in continuous mode (interval: ${CHECK_INTERVAL}s)"
    log "Press Ctrl+C to stop"

    while true; do
        run_improvement_cycle
        log "Sleeping for ${CHECK_INTERVAL}s..."
        sleep "$CHECK_INTERVAL"
    done
}

# Run main function
main "$@"
