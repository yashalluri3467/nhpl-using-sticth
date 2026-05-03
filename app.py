import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent


if __name__ == "__main__":
    print("This prototype now runs on Node.js.")
    print("Starting `npm start` from the project root...")
    try:
        raise SystemExit(subprocess.call(["npm", "start"], cwd=ROOT))
    except FileNotFoundError:
        print("npm was not found. Install Node.js 20+ and run `npm install` first.", file=sys.stderr)
        raise SystemExit(1)
