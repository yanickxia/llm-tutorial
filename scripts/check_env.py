"""第 0 课环境检查：只检查当前课程实际需要的工具。"""

import platform
import shutil
import sys
from pathlib import Path


def main():
    root = Path(__file__).resolve().parents[1]
    failures = []
    print(f"platform: {platform.system()} / {platform.machine()}")
    print(f"python: {platform.python_version()}")
    print(f"executable: {sys.executable}")
    print(f"environment: {sys.prefix}")

    if sys.version_info[:2] != (3, 12):
        failures.append(f"Python 版本：期望 3.12.x，实际 {platform.python_version()}")

    expected_env = root / ".venv"
    if sys.prefix == sys.base_prefix or Path(sys.prefix).resolve() != expected_env.resolve():
        failures.append(f"虚拟环境：期望 {expected_env}，实际 {sys.prefix}")

    for tool in ("uv", "git", "make", "zsh"):
        location = shutil.which(tool)
        print(f"{tool}: {location or 'NOT FOUND'}")
        if location is None:
            failures.append(f"工具 {tool}：期望可在 PATH 中找到，实际缺失")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        print("请载入 ~/.zshrc，运行 make setup，再执行 make check-tools。", file=sys.stderr)
        return 1

    print("ENV: OK — 仓库 Python 环境与基础工具可用")
    return 0


if __name__ == "__main__":
    sys.exit(main())
