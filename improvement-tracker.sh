#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Array of all improvement branches
BRANCHES=(
  "data/request-caching"
  "data/weather-api"
  "data/polling-frequency"
  "perf/code-splitting"
  "perf/render-optimization"
  "perf/bundle-size"
  "arch/typescript"
  "arch/error-boundaries"
  "arch/feature-organization"
  "arch/auto-scroll"
  "code/date-parsing"
  "code/team-colors"
  "code/api-standardization"
  "code/game-state"
)

# Function to display status
function display_status() {
  echo -e "\n${YELLOW}=== Turbo Scores Improvement Status ===${NC}\n"
  
  local completed=0
  local total=${#BRANCHES[@]}
  
  for branch in "${BRANCHES[@]}"; do
    # Check if branch has commits beyond main
    if git log --oneline main..$branch 2>/dev/null | grep -q .; then
      echo -e "${GREEN}[✓] $branch${NC}"
      completed=$((completed + 1))
    else
      echo -e "${RED}[ ] $branch${NC}"
    fi
  done
  
  echo -e "\n${YELLOW}Progress: $completed/$total improvements${NC}\n"
}

# Function to switch to a branch
function switch_branch() {
  if [[ -z "$1" ]]; then
    echo -e "${RED}Please specify a branch to switch to${NC}"
    echo -e "Usage: $0 switch [branch-name]"
    return 1
  fi
  
  # Check if branch exists
  if git show-ref --verify --quiet refs/heads/$1; then
    git checkout $1
    echo -e "${GREEN}Switched to branch $1${NC}"
  else
    echo -e "${RED}Branch $1 does not exist${NC}"
    echo -e "Available branches:"
    for branch in "${BRANCHES[@]}"; do
      echo "  $branch"
    done
  fi
}

# Function to list all branches
function list_branches() {
  echo -e "${YELLOW}Available improvement branches:${NC}"
  for branch in "${BRANCHES[@]}"; do
    echo "  $branch"
  done
}

# Main command parser
case "$1" in
  status)
    display_status
    ;;
  switch)
    switch_branch "$2"
    ;;
  list)
    list_branches
    ;;
  *)
    echo -e "${YELLOW}Turbo Scores Improvement Tracker${NC}"
    echo -e "Usage:"
    echo -e "  $0 status  - Display improvement status"
    echo -e "  $0 list    - List all improvement branches"
    echo -e "  $0 switch [branch-name] - Switch to an improvement branch"
    ;;
esac 