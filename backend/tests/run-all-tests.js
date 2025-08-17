#!/usr/bin/env node

/**
 * Comprehensive Test Runner for ZeYang Backend
 * This script runs all test suites in a controlled manner with proper reporting
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  timeout: 60000, // 60 seconds per test suite
  maxRetries: 2,
  coverage: true,
  verbose: true
};

// Define test suites in order of execution
const TEST_SUITES = [
  {
    name: 'Unit Tests - Authentication',
    command: 'npm',
    args: ['run', 'test:auth'],
    critical: true
  },
  {
    name: 'Unit Tests - Projects',
    command: 'npm',
    args: ['run', 'test:projects'],
    critical: true
  },
  {
    name: 'Unit Tests - Contacts',
    command: 'npm',
    args: ['run', 'test:contacts'],
    critical: true
  },
  {
    name: 'Unit Tests - Tags',
    command: 'npm',
    args: ['run', 'test:tags'],
    critical: true
  },
  {
    name: 'Unit Tests - System',
    command: 'npm',
    args: ['run', 'test:system'],
    critical: false
  },
  {
    name: 'Unit Tests - Settings',
    command: 'npm',
    args: ['test', '--', 'settings.test.js'],
    critical: true
  },
  {
    name: 'Unit Tests - Project Images',
    command: 'npm',
    args: ['test', '--', 'project-images.test.js'],
    critical: false
  },
  {
    name: 'Unit Tests - Statistics',
    command: 'npm',
    args: ['test', '--', 'statistics.test.js'],
    critical: false
  },
  {
    name: 'Unit Tests - Upload',
    command: 'npm',
    args: ['test', '--', 'upload.test.js'],
    critical: false
  },
  {
    name: 'Integration Tests - Complete Workflow',
    command: 'npm',
    args: ['test', '--', 'complete-workflow.test.js'],
    critical: true
  },
  {
    name: 'Coverage Report',
    command: 'npm',
    args: ['run', 'test:coverage'],
    critical: false
  }
];

class TestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.totalTests = TEST_SUITES.length;
  }

  async run() {
    console.log('🚀 Starting ZeYang Backend Test Suite');
    console.log('=====================================');
    console.log(`Total test suites: ${this.totalTests}`);
    console.log(`Timeout per suite: ${TEST_CONFIG.timeout / 1000}s`);
    console.log(`Max retries: ${TEST_CONFIG.maxRetries}`);
    console.log('=====================================\n');

    // Ensure test environment is set up
    await this.setupTestEnvironment();

    // Run each test suite
    for (let i = 0; i < TEST_SUITES.length; i++) {
      const suite = TEST_SUITES[i];
      console.log(`📋 Running test suite ${i + 1}/${this.totalTests}: ${suite.name}`);

      const result = await this.runTestSuite(suite);
      this.results.push(result);

      // Stop execution if critical test fails
      if (!result.success && suite.critical) {
        console.log(`❌ Critical test suite failed: ${suite.name}`);
        console.log('🛑 Stopping test execution due to critical failure');
        break;
      }

      console.log(); // Add spacing between test suites
    }

    // Generate final report
    await this.generateFinalReport();
  }

  async setupTestEnvironment() {
    console.log('🔧 Setting up test environment...');

    // Check if test database exists and is accessible
    try {
      // You could add database ping here if needed
      console.log('✅ Test environment ready');
    } catch (error) {
      console.error('❌ Failed to setup test environment:', error.message);
      process.exit(1);
    }
  }

  runTestSuite(suite) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let attempt = 0;

      const runAttempt = () => {
        attempt++;
        console.log(`   Attempt ${attempt}/${TEST_CONFIG.maxRetries + 1}`);

        const child = spawn(suite.command, suite.args, {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: {
            ...process.env,
            NODE_ENV: 'test-mock',
            USE_MOCK_DB: 'true'
          }
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
          if (TEST_CONFIG.verbose) {
            process.stdout.write(data);
          }
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
          if (TEST_CONFIG.verbose) {
            process.stderr.write(data);
          }
        });

        const timeout = setTimeout(() => {
          child.kill('SIGTERM');
          console.log(`   ⏰ Test suite timed out after ${TEST_CONFIG.timeout / 1000}s`);
        }, TEST_CONFIG.timeout);

        child.on('close', (code) => {
          clearTimeout(timeout);
          const endTime = Date.now();
          const duration = endTime - startTime;

          const result = {
            name: suite.name,
            success: code === 0,
            code,
            duration,
            attempt,
            stdout,
            stderr,
            critical: suite.critical
          };

          if (code === 0) {
            console.log(`   ✅ ${suite.name} passed (${duration}ms)`);
            resolve(result);
          } else if (attempt <= TEST_CONFIG.maxRetries) {
            console.log(`   ⚠️  Attempt ${attempt} failed, retrying...`);
            setTimeout(runAttempt, 1000); // Wait 1 second before retry
          } else {
            console.log(`   ❌ ${suite.name} failed after ${attempt} attempts (${duration}ms)`);
            resolve(result);
          }
        });

        child.on('error', (error) => {
          clearTimeout(timeout);
          console.log(`   ❌ Failed to start test: ${error.message}`);
          resolve({
            name: suite.name,
            success: false,
            code: -1,
            duration: Date.now() - startTime,
            attempt,
            stdout: '',
            stderr: error.message,
            critical: suite.critical
          });
        });
      };

      runAttempt();
    });
  }

  async generateFinalReport() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const criticalFailed = this.results.filter(r => !r.success && r.critical).length;

    console.log('\n🎯 Test Execution Summary');
    console.log('=========================');
    console.log(`Total time: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`Passed: ${passed}/${this.results.length}`);
    console.log(`Failed: ${failed}/${this.results.length}`);
    console.log(`Critical failures: ${criticalFailed}`);

    // Detailed results
    console.log('\n📊 Detailed Results');
    console.log('===================');
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const critical = result.critical ? '🔴' : '🟡';
      const duration = (result.duration / 1000).toFixed(2);
      console.log(`${status} ${critical} ${result.name} (${duration}s)`);

      if (!result.success && result.stderr) {
        console.log(`     Error: ${result.stderr.split('\n')[0]}`);
      }
    });

    // Generate JSON report
    const report = {
      summary: {
        totalSuites: this.results.length,
        passed,
        failed,
        criticalFailed,
        totalDuration,
        timestamp: new Date().toISOString()
      },
      results: this.results
    };

    const reportPath = path.join(__dirname, '..', 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    if (criticalFailed > 0) {
      console.log('\n🚨 Test execution failed due to critical test failures');
      process.exit(1);
    } else if (failed > 0) {
      console.log('\n⚠️  Test execution completed with non-critical failures');
      process.exit(0);
    } else {
      console.log('\n🎉 All tests passed successfully!');
      process.exit(0);
    }
  }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch((error) => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
