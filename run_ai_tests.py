#!/usr/bin/env python3
"""
Enhanced AI model test runner with detailed pass/fail reporting.
This script can be run from the root directory to execute all AI model tests.
"""

import os
import sys
import subprocess
import argparse

def main():
    parser = argparse.ArgumentParser(description='Run AI model tests with detailed reporting')
    parser.add_argument('--module', '-m', help='Run specific test module (e.g., test_food_classifier)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--coverage', '-c', action='store_true', help='Run with coverage report')
    parser.add_argument('--detailed', '-d', action='store_true', default=True, help='Use detailed test runner (default)')
    parser.add_argument('--simple', '-s', action='store_true', help='Use simple unittest runner')
    
    args = parser.parse_args()
    
    # Change to the project root directory
    project_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_root)
    
    # Use detailed runner by default unless simple is requested
    use_detailed = not args.simple
    
    if args.coverage:
        # Run with coverage
        cmd = ['python', '-m', 'coverage', 'run', '-m', 'unittest']
        if args.module:
            cmd.append(f'tests.{args.module}')
        else:
            cmd.extend(['discover', 'tests/', '-p', 'test_*.py'])
        
        if args.verbose:
            cmd.append('-v')
        
        print("🔍 Running tests with coverage...")
        result = subprocess.run(cmd)
        
        if result.returncode == 0:
            print("\n📊 Generating coverage report...")
            subprocess.run(['python', '-m', 'coverage', 'report'])
            subprocess.run(['python', '-m', 'coverage', 'html'])
            print("📄 HTML coverage report generated in htmlcov/")
        
    elif use_detailed:
        # Use our enhanced test runner
        cmd = ['python', 'tests/run_tests.py']
        if args.module:
            cmd.append(args.module)
        
        result = subprocess.run(cmd)
        
    else:
        # Use simple unittest runner
        cmd = ['python', '-m', 'unittest']
        
        if args.module:
            cmd.append(f'tests.{args.module}')
        else:
            cmd.extend(['discover', 'tests/', '-p', 'test_*.py'])
        
        if args.verbose:
            cmd.append('-v')
        
        print("🧪 Running AI model tests...")
        result = subprocess.run(cmd)
    
    return result.returncode

if __name__ == '__main__':
    sys.exit(main())