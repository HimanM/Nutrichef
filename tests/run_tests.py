#!/usr/bin/env python3
"""
Enhanced test runner for all AI model tests.
Run this script to execute all unit tests with detailed pass/fail reporting.
"""

import unittest
import sys
import os
import time
from io import StringIO

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

class DetailedTestResult(unittest.TextTestResult):
    """Custom test result class that tracks individual test results."""
    
    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self.test_results = []
        self.current_test_start_time = None
        
    def startTest(self, test):
        super().startTest(test)
        self.current_test_start_time = time.time()
        
    def addSuccess(self, test):
        super().addSuccess(test)
        duration = time.time() - self.current_test_start_time
        self.test_results.append({
            'test': test,
            'status': 'PASS',
            'duration': duration,
            'message': None
        })
        
    def addError(self, test, err):
        super().addError(test, err)
        duration = time.time() - self.current_test_start_time
        self.test_results.append({
            'test': test,
            'status': 'ERROR',
            'duration': duration,
            'message': self._exc_info_to_string(err, test)
        })
        
    def addFailure(self, test, err):
        super().addFailure(test, err)
        duration = time.time() - self.current_test_start_time
        self.test_results.append({
            'test': test,
            'status': 'FAIL',
            'duration': duration,
            'message': self._exc_info_to_string(err, test)
        })
        
    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        duration = time.time() - self.current_test_start_time
        self.test_results.append({
            'test': test,
            'status': 'SKIP',
            'duration': duration,
            'message': reason
        })

class DetailedTestRunner(unittest.TextTestRunner):
    """Custom test runner that provides detailed output."""
    
    def __init__(self, **kwargs):
        kwargs['resultclass'] = DetailedTestResult
        super().__init__(**kwargs)
        
    def run(self, test):
        result = super().run(test)
        self._print_detailed_results(result)
        return result
        
    def _print_detailed_results(self, result):
        """Print detailed test results organized by module."""
        print("\n" + "="*80)
        print("DETAILED TEST RESULTS")
        print("="*80)
        
        # Group tests by module
        modules = {}
        for test_result in result.test_results:
            test_name = str(test_result['test'])
            module_name = test_name.split('.')[0] if '.' in test_name else 'Unknown'
            
            if module_name not in modules:
                modules[module_name] = []
            modules[module_name].append(test_result)
        
        # Print results by module
        total_pass = 0
        total_fail = 0
        total_error = 0
        total_skip = 0
        
        for module_name in sorted(modules.keys()):
            tests = modules[module_name]
            module_pass = sum(1 for t in tests if t['status'] == 'PASS')
            module_fail = sum(1 for t in tests if t['status'] == 'FAIL')
            module_error = sum(1 for t in tests if t['status'] == 'ERROR')
            module_skip = sum(1 for t in tests if t['status'] == 'SKIP')
            
            total_pass += module_pass
            total_fail += module_fail
            total_error += module_error
            total_skip += module_skip
            
            print(f"\n📁 {module_name}")
            print("-" * 60)
            
            for test_result in tests:
                test_name = str(test_result['test'])
                # Extract just the test method name
                if '.' in test_name:
                    method_name = test_name.split('.')[-1]
                    class_name = test_name.split('.')[-2]
                    display_name = f"{class_name}.{method_name}"
                else:
                    display_name = test_name
                
                status = test_result['status']
                duration = test_result['duration']
                
                # Status icons and colors
                if status == 'PASS':
                    icon = "✅"
                    status_text = f"{icon} PASS"
                elif status == 'FAIL':
                    icon = "❌"
                    status_text = f"{icon} FAIL"
                elif status == 'ERROR':
                    icon = "💥"
                    status_text = f"{icon} ERROR"
                else:  # SKIP
                    icon = "⏭️"
                    status_text = f"{icon} SKIP"
                
                print(f"  {status_text:<12} {display_name:<50} ({duration:.3f}s)")
                
                # Print error/failure details if present
                if test_result['message'] and status in ['FAIL', 'ERROR']:
                    # Show just the key error line, not full traceback
                    lines = test_result['message'].split('\n')
                    for line in lines:
                        if 'AssertionError:' in line or 'Error:' in line:
                            print(f"    💬 {line.strip()}")
                            break
            
            # Module summary
            print(f"  📊 Module Summary: {module_pass} pass, {module_fail} fail, {module_error} error, {module_skip} skip")
        
        # Overall summary
        print("\n" + "="*80)
        print("OVERALL SUMMARY")
        print("="*80)
        total_tests = total_pass + total_fail + total_error + total_skip
        success_rate = (total_pass / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📈 Total Tests: {total_tests}")
        print(f"✅ Passed: {total_pass}")
        print(f"❌ Failed: {total_fail}")
        print(f"💥 Errors: {total_error}")
        print(f"⏭️ Skipped: {total_skip}")
        print(f"🎯 Success Rate: {success_rate:.1f}%")
        
        if success_rate == 100.0:
            print("🎉 ALL TESTS PASSED! 🎉")
        elif success_rate >= 90.0:
            print("🟢 Excellent test coverage!")
        elif success_rate >= 75.0:
            print("🟡 Good test coverage, some issues to address")
        else:
            print("🔴 Significant issues found, please review failures")

def run_all_tests():
    """Discover and run all tests in the tests directory."""
    print("🚀 Starting AI Model Test Suite...")
    print("="*80)
    
    # Discover tests
    loader = unittest.TestLoader()
    start_dir = os.path.dirname(os.path.abspath(__file__))
    suite = loader.discover(start_dir, pattern='test_*.py')
    
    # Count total tests
    def count_tests(suite):
        count = 0
        for test in suite:
            if hasattr(test, '_tests'):
                count += count_tests(test)
            else:
                count += 1
        return count
    
    total_tests = count_tests(suite)
    print(f"📋 Found {total_tests} tests to run")
    
    # Run tests with detailed output
    runner = DetailedTestRunner(verbosity=0, buffer=True)
    start_time = time.time()
    result = runner.run(suite)
    end_time = time.time()
    
    print(f"\n⏱️ Total execution time: {end_time - start_time:.2f} seconds")
    
    return result.wasSuccessful()

def run_specific_test(test_module):
    """Run tests for a specific module."""
    print(f"🎯 Running tests for: {test_module}")
    print("="*60)
    
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromName(test_module)
    
    runner = DetailedTestRunner(verbosity=0, buffer=True)
    result = runner.run(suite)
    
    return result.wasSuccessful()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        # Run specific test module
        test_module = sys.argv[1]
        success = run_specific_test(test_module)
    else:
        # Run all tests
        success = run_all_tests()
    
    sys.exit(0 if success else 1)