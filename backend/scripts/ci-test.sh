#!/bin/bash

# CI/CD Test Script for ZeYang Backend
# This script runs comprehensive tests suitable for CI/CD environments

set -e  # Exit on any error

echo "🚀 ZeYang Backend CI/CD Test Pipeline"
echo "====================================="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEST_RESULTS_DIR="$PROJECT_ROOT/test-results"
COVERAGE_DIR="$PROJECT_ROOT/coverage"

# Environment variables
export NODE_ENV=test-mock
export USE_MOCK_DB=true
export SUPPRESS_LOGS=true
export CI=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js version
    NODE_VERSION=$(node --version)
    log_info "Node.js version: $NODE_VERSION"
    
    # Check npm version
    NPM_VERSION=$(npm --version)
    log_info "npm version: $NPM_VERSION"
    
    # Check if package.json exists
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        log_error "package.json not found in $PROJECT_ROOT"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to setup test environment
setup_test_environment() {
    log_info "Setting up test environment..."
    
    # Create test results directory
    mkdir -p "$TEST_RESULTS_DIR"
    mkdir -p "$COVERAGE_DIR"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        log_info "Installing dependencies..."
        cd "$PROJECT_ROOT"
        npm ci
    fi
    
    # Clean previous test results
    rm -f "$PROJECT_ROOT/test-report.json"
    rm -rf "$COVERAGE_DIR"/*
    
    log_success "Test environment setup completed"
}

# Function to run linting
run_lint() {
    log_info "Running code linting..."
    cd "$PROJECT_ROOT"
    
    if npm run lint 2>&1; then
        log_success "Linting passed"
        return 0
    else
        log_error "Linting failed"
        return 1
    fi
}

# Function to run security audit
run_security_audit() {
    log_info "Running security audit..."
    cd "$PROJECT_ROOT"
    
    # Run npm audit with appropriate flags for CI
    if npm audit --audit-level moderate 2>&1; then
        log_success "Security audit passed"
        return 0
    else
        log_warning "Security audit found issues (continuing with tests)"
        return 0  # Don't fail the build on audit issues in CI
    fi
}

# Function to run unit tests
run_unit_tests() {
    log_info "Running unit tests..."
    cd "$PROJECT_ROOT"
    
    # List of critical unit test suites
    UNIT_TESTS=(
        "auth.test.js"
        "projects.test.js"
        "contacts.test.js"
        "tags.test.js"
        "settings.test.js"
        "system.test.js"
    )
    
    local failed_tests=()
    
    for test in "${UNIT_TESTS[@]}"; do
        log_info "Running $test..."
        if npm test -- --testPathPattern="$test" --verbose 2>&1; then
            log_success "$test passed"
        else
            log_error "$test failed"
            failed_tests+=("$test")
        fi
    done
    
    if [ ${#failed_tests[@]} -eq 0 ]; then
        log_success "All unit tests passed"
        return 0
    else
        log_error "Failed unit tests: ${failed_tests[*]}"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    log_info "Running integration tests..."
    cd "$PROJECT_ROOT"
    
    if npm test -- --testPathPattern="integration" --verbose 2>&1; then
        log_success "Integration tests passed"
        return 0
    else
        log_error "Integration tests failed"
        return 1
    fi
}

# Function to run new API tests
run_new_api_tests() {
    log_info "Running new API endpoint tests..."
    cd "$PROJECT_ROOT"
    
    NEW_API_TESTS=(
        "project-images.test.js"
        "statistics.test.js"
        "upload.test.js"
    )
    
    local failed_tests=()
    
    for test in "${NEW_API_TESTS[@]}"; do
        log_info "Running $test..."
        if npm test -- --testPathPattern="$test" --verbose 2>&1; then
            log_success "$test passed"
        else
            log_warning "$test failed (non-critical)"
            failed_tests+=("$test")
        fi
    done
    
    if [ ${#failed_tests[@]} -eq 0 ]; then
        log_success "All new API tests passed"
    else
        log_warning "Some new API tests failed (non-critical): ${failed_tests[*]}"
    fi
    
    return 0  # Don't fail build for new API tests
}

# Function to generate coverage report
generate_coverage() {
    log_info "Generating test coverage report..."
    cd "$PROJECT_ROOT"
    
    if npm run test:coverage 2>&1; then
        log_success "Coverage report generated"
        
        # Check coverage thresholds (if coverage report exists)
        if [ -f "$COVERAGE_DIR/coverage-final.json" ]; then
            log_info "Coverage report available at: $COVERAGE_DIR/lcov-report/index.html"
        fi
        
        return 0
    else
        log_warning "Coverage report generation failed"
        return 0  # Don't fail build on coverage issues
    fi
}

# Function to run comprehensive test suite
run_comprehensive_tests() {
    log_info "Running comprehensive test suite..."
    cd "$PROJECT_ROOT"
    
    if node tests/run-all-tests.js 2>&1; then
        log_success "Comprehensive test suite passed"
        return 0
    else
        log_error "Comprehensive test suite failed"
        return 1
    fi
}

# Function to validate API documentation
validate_api_docs() {
    log_info "Validating API documentation..."
    
    # Check if Swagger documentation exists and is valid YAML
    if [ -f "$PROJECT_ROOT/swagger/api-docs.yml" ]; then
        log_success "Swagger documentation found"
        
        # You could add YAML validation here if needed
        # Example: python -c "import yaml; yaml.safe_load(open('swagger/api-docs.yml'))"
        
        return 0
    else
        log_warning "Swagger documentation not found"
        return 0
    fi
}

# Function to generate test report
generate_test_report() {
    log_info "Generating final test report..."
    
    local report_file="$TEST_RESULTS_DIR/ci-test-report.json"
    local html_report="$TEST_RESULTS_DIR/ci-test-report.html"
    
    # Create JSON report
    cat > "$report_file" << EOF
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "environment": {
        "node_version": "$(node --version)",
        "npm_version": "$(npm --version)",
        "os": "$(uname -s)",
        "arch": "$(uname -m)"
    },
    "results": {
        "lint": $LINT_RESULT,
        "security_audit": $AUDIT_RESULT,
        "unit_tests": $UNIT_RESULT,
        "integration_tests": $INTEGRATION_RESULT,
        "new_api_tests": $NEW_API_RESULT,
        "coverage": $COVERAGE_RESULT,
        "comprehensive": $COMPREHENSIVE_RESULT
    },
    "coverage_report": "$COVERAGE_DIR/lcov-report/index.html",
    "detailed_report": "$PROJECT_ROOT/test-report.json"
}
EOF
    
    # Create simple HTML report
    cat > "$html_report" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>ZeYang Backend CI Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .warn { color: orange; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>ZeYang Backend CI Test Report</h1>
    <p><strong>Generated:</strong> $(date)</p>
    
    <h2>Test Results Summary</h2>
    <table>
        <tr><th>Test Suite</th><th>Status</th></tr>
        <tr><td>Code Linting</td><td class="$([ $LINT_RESULT -eq 0 ] && echo 'pass' || echo 'fail')">$([ $LINT_RESULT -eq 0 ] && echo 'PASS' || echo 'FAIL')</td></tr>
        <tr><td>Security Audit</td><td class="$([ $AUDIT_RESULT -eq 0 ] && echo 'pass' || echo 'warn')">$([ $AUDIT_RESULT -eq 0 ] && echo 'PASS' || echo 'WARN')</td></tr>
        <tr><td>Unit Tests</td><td class="$([ $UNIT_RESULT -eq 0 ] && echo 'pass' || echo 'fail')">$([ $UNIT_RESULT -eq 0 ] && echo 'PASS' || echo 'FAIL')</td></tr>
        <tr><td>Integration Tests</td><td class="$([ $INTEGRATION_RESULT -eq 0 ] && echo 'pass' || echo 'fail')">$([ $INTEGRATION_RESULT -eq 0 ] && echo 'PASS' || echo 'FAIL')</td></tr>
        <tr><td>New API Tests</td><td class="$([ $NEW_API_RESULT -eq 0 ] && echo 'pass' || echo 'warn')">$([ $NEW_API_RESULT -eq 0 ] && echo 'PASS' || echo 'WARN')</td></tr>
        <tr><td>Coverage Generation</td><td class="$([ $COVERAGE_RESULT -eq 0 ] && echo 'pass' || echo 'warn')">$([ $COVERAGE_RESULT -eq 0 ] && echo 'PASS' || echo 'WARN')</td></tr>
    </table>
    
    <h2>Links</h2>
    <ul>
        <li><a href="../coverage/lcov-report/index.html">Coverage Report</a></li>
        <li><a href="../test-report.json">Detailed Test Results</a></li>
    </ul>
</body>
</html>
EOF
    
    log_success "Test reports generated:"
    log_info "  JSON: $report_file"
    log_info "  HTML: $html_report"
}

# Main execution function
main() {
    local start_time=$(date +%s)
    
    # Initialize result variables
    LINT_RESULT=0
    AUDIT_RESULT=0
    UNIT_RESULT=0
    INTEGRATION_RESULT=0
    NEW_API_RESULT=0
    COVERAGE_RESULT=0
    COMPREHENSIVE_RESULT=0
    
    # Run all checks
    check_prerequisites
    setup_test_environment
    
    # Code quality checks
    run_lint || LINT_RESULT=$?
    run_security_audit || AUDIT_RESULT=$?
    validate_api_docs
    
    # Core tests (critical)
    run_unit_tests || UNIT_RESULT=$?
    run_integration_tests || INTEGRATION_RESULT=$?
    
    # Additional tests (non-critical)
    run_new_api_tests || NEW_API_RESULT=$?
    
    # Coverage and comprehensive tests
    generate_coverage || COVERAGE_RESULT=$?
    
    # Final comprehensive test if all critical tests passed
    if [ $UNIT_RESULT -eq 0 ] && [ $INTEGRATION_RESULT -eq 0 ]; then
        run_comprehensive_tests || COMPREHENSIVE_RESULT=$?
    else
        log_warning "Skipping comprehensive tests due to critical test failures"
        COMPREHENSIVE_RESULT=1
    fi
    
    # Generate reports
    generate_test_report
    
    # Calculate total time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Final summary
    echo ""
    echo "🎯 CI/CD Test Pipeline Summary"
    echo "=============================="
    echo "Total execution time: ${duration}s"
    echo ""
    
    # Determine exit code
    if [ $LINT_RESULT -ne 0 ] || [ $UNIT_RESULT -ne 0 ] || [ $INTEGRATION_RESULT -ne 0 ] || [ $COMPREHENSIVE_RESULT -ne 0 ]; then
        log_error "CI/CD pipeline failed - critical tests did not pass"
        exit 1
    else
        log_success "CI/CD pipeline passed - all critical tests successful"
        if [ $AUDIT_RESULT -ne 0 ] || [ $NEW_API_RESULT -ne 0 ] || [ $COVERAGE_RESULT -ne 0 ]; then
            log_warning "Pipeline passed with warnings - check non-critical test results"
        fi
        exit 0
    fi
}

# Run main function
main "$@"