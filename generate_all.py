"""
Legacy entry point for full library generation.
Forwards to the componentized orchestrator: generate.py --all
"""
import sys
import subprocess

if __name__ == "__main__":
    cmd = [sys.executable, "generate.py", "--all"] + sys.argv[1:]
    sys.exit(subprocess.call(cmd))
