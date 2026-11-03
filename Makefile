SHELL := /bin/zsh
.DEFAULT_GOAL := help

UV ?= uv

.PHONY: help setup check-tools check site-setup site-dev site-build check-site

help:
	@printf '%s\n' \
	  'make setup        根据 uv.lock 创建或同步 .venv' \
	  'make check-tools  检查 Python 环境并运行第 0 课实验' \
	  'make check        运行当前基础检查' \
	  'make site-setup   安装课程站依赖（Node.js 22+）' \
	  'make site-dev     本地预览课程站' \
	  'make site-build   构建 GitHub Pages 静态页面' \
	  'make check-site   构建并检查课程站'

setup:
	@command -v "$(UV)" >/dev/null 2>&1 || { print -u2 '未找到 uv；请先安装 uv 并载入 ~/.zshrc。'; exit 1; }
	$(UV) sync --frozen

check-tools:
	@command -v "$(UV)" >/dev/null 2>&1 || { print -u2 '未找到 uv；请先安装 uv 并载入 ~/.zshrc。'; exit 1; }
	@test -x .venv/bin/python || { print -u2 '缺少仓库虚拟环境；请先运行 make setup。'; exit 1; }
	$(UV) run --frozen --no-sync python scripts/check_env.py
	$(UV) run --frozen --no-sync python labs/lesson_00/reproducibility.py

check: check-tools

site-setup:
	npm --prefix site ci

site-dev:
	npm --prefix site run dev

site-build:
	npm --prefix site run build

check-site:
	npm --prefix site test
