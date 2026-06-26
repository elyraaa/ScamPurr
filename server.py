from __future__ import annotations

import os
import subprocess
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
BACKEND_PORT = os.environ.get("BACKEND_PORT", "8000")
FRONTEND_PORT = os.environ.get("FRONTEND_PORT", "5173")


def backend_python() -> Path:
    if os.name == "nt":
        preferred = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"
        if preferred.exists():
            return preferred
        return BACKEND_DIR / "venv" / "Scripts" / "python.exe"
    preferred = BACKEND_DIR / ".venv" / "bin" / "python"
    if preferred.exists():
        return preferred
    return BACKEND_DIR / "venv" / "bin" / "python"


def npm_command() -> str:
    return "npm.cmd" if os.name == "nt" else "npm"


def ensure_setup() -> None:
    missing: list[str] = []

    if not backend_python().exists():
        missing.append("backend virtual environment: backend/venv")

    if not (FRONTEND_DIR / "node_modules").exists():
        missing.append("frontend dependencies: frontend/node_modules")

    if missing:
        print("ScamPurr AI is missing setup files:")
        for item in missing:
            print(f"  - {item}")
        print()
        print("Run these once, then start this file again:")
        print("  cd backend")
        print("  py -m venv venv")
        print("  .\\venv\\Scripts\\python.exe -m pip install -r requirements.txt")
        print("  cd ..\\frontend")
        print("  npm install")
        raise SystemExit(1)


def start_processes() -> list[subprocess.Popen]:
    backend = subprocess.Popen(
        [
            str(backend_python()),
            "-m",
            "uvicorn",
            "app.main:app",
            "--reload",
            "--port",
            BACKEND_PORT,
        ],
        cwd=BACKEND_DIR,
    )

    frontend = subprocess.Popen(
        [npm_command(), "run", "dev", "--", "--host", "localhost", "--port", FRONTEND_PORT],
        cwd=FRONTEND_DIR,
        shell=False,
    )

    return [backend, frontend]


def stop_processes(processes: list[subprocess.Popen]) -> None:
    for process in processes:
        if process.poll() is None:
            process.terminate()

    for process in processes:
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()


def main() -> None:
    ensure_setup()

    print("Starting ScamPurr AI locally...")
    print(f"Backend API: http://localhost:{BACKEND_PORT}")
    print(f"API docs:    http://localhost:{BACKEND_PORT}/docs")
    print(f"Frontend:    http://localhost:{FRONTEND_PORT}")
    print("Press Ctrl+C to stop both servers.")
    print()

    processes = start_processes()

    try:
        while True:
            for process in processes:
                if process.poll() is not None:
                    raise RuntimeError(f"A server stopped unexpectedly with exit code {process.returncode}.")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping ScamPurr AI...")
    finally:
        stop_processes(processes)


if __name__ == "__main__":
    main()
