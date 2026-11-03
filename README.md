# LLM Tutorial

从零理解并实现一个小型语言模型，再把模型用于真实应用的中文学习仓库。

主线是：**数值计算与梯度 → 最小语言模型 → Transformer → 训练与推理 → 微调与评估 → RAG 与 Agent**。
先用小数据和可观察的实验理解模型，再接入成熟的预训练模型，完成检索、工具调用和应用评估。

教学方式参考 `x86-64-os-lab`：教材、实验和个人笔记一起推进，每课先讲原理、做预测，再动手并用证据验收。
数学随实验引入；默认从 CPU 开始，前期不要求独立 GPU 或付费模型 API。

## 从这里开始

先读 [第 0 课：建立可复现的实验环境](docs/lesson-00.md)，在讲义提示的位置运行：

```sh
source ~/.zshrc
make setup
make check-tools
```

需要 `uv`、`make` 和 Git。项目使用 Python 3.12；`uv` 会选择已有解释器，缺少时可能需要下载。
依赖安装在仓库的 `.venv/`，第 0 课仅使用 Python 标准库。后续引入 PyTorch 时再更新依赖与锁文件。

把自己的预测与观察写入 [第 0 课学习记录](notes/01-基础与实验环境/note-00.md)。
完整规划和实际进度见 [课程路线图](docs/roadmap.md)。

## 学习方式

- 一课建立一个完整能力，通常用一个实验和 2–3 个必答项验收。
- 学习者完成核心练习；导师负责先修讲解、脚手架、逐级提示和审阅。
- 原预测即使错误也保留，实验后用证据修订。
- 测试通过只是行为证据，还需要能解释结果与边界。
- 课程随学习进度展开，路线图里的后续阶段不表示已经提供了教材或实现。

## 仓库结构

```text
docs/             逐课教材、路线图、参考资料与编写模板
labs/             逐课实验，lesson_NN 对应第 NN 课
notes/            按阶段分组的学习记录
scripts/          环境与实验验收工具
data/             数据说明与后续教学样例
site/             GitHub Pages 课程站，直接读取教材与笔记
AGENTS.md         AI 导师的教学约定
CLAUDE.md         指向 AGENTS.md，保持同一套约定
pyproject.toml    Python 版本和依赖声明
uv.lock           依赖解析结果
Makefile          统一命令入口，运行 make 查看帮助
```

常用命令：`make setup` 同步环境，`make check-tools` 自检，`make check` 运行当前基础检查。
课程编写规则见 [导师指南](AGENTS.md)，资料入口见 [参考资料](docs/reference/README.md)。

## 课程网站

在线阅读：[LLM Field Notes](https://yanickxia.github.io/llm-tutorial/)。
源码仓库：[yanickxia/llm-tutorial](https://github.com/yanickxia/llm-tutorial)。

课程站支持课程导航、全文搜索、数学公式和学习笔记阅读。使用 Node.js 22+：

```sh
make site-setup
make site-dev
```

`make check-site` 构建并检查页面和链接。GitHub Pages 的自动部署配置已放在
[工作流](.github/workflows/pages.yml)，远端首次启用步骤和子路径配置见 [站点说明](site/README.md)。
