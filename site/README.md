# LLM Field Notes

LLM Tutorial 的静态课程站，使用 VitePress，可发布到 GitHub Pages。
教材、学习记录和路线图继续以仓库根目录的 Markdown 为唯一正文来源。

站点地址：<https://yanickxia.github.io/llm-tutorial/>。
源码仓库：<https://github.com/yanickxia/llm-tutorial>。

## 本地预览

需要 Node.js 22 或更新版本，CI 使用 Node.js 24。

```sh
source ~/.zshrc
cd site
npm ci
npm run dev
```

打开终端显示的本地地址，默认是 `http://127.0.0.1:5173`。
`docs/`、`notes/` 中的 Markdown 修改会触发内容同步和站点重载。
生成结果位于忽略目录 `content/`，不要在这里手改正文。

## 页面和内容来源

- 首页：当前已开放课程、七阶段路线与学习方法。开放数量表示讲义已提供，不表示学习者完成数量。
- `/docs/lesson-NN.html`：课程正文、代码高亮和本页目录。
- `/docs/roadmap.html`：完整路线图与实际学习进度。
- `/notes/`：学习记录；阶段目录页自动生成。
- `/docs/reference/`：参考资料。
- `/source/`：讲义链接到的 Python 实验源码和编写模板，可下载后在本地使用。

`scripts/sync-content.mjs` 读取教材标题、能力说明、对应笔记目录，以及路线图的阶段表。
新增课程时只需添加 `docs/lesson-NN.md` 和对应的 `notes/<阶段>/note-NN.md`，目录会自动收录。
阶段表保持“编号 · 名称 / 能力 / 内容 / 里程碑”四列格式。
站点完整发布 `notes/` 中的学习记录；这里只展示仓库内容，不提供在线编辑或进度打卡。

Markdown 内部链接按源文件相对路径编写，构建时自动转换为站点地址。
目录中的 `README.md` 对应网站的 `index.html`；没有 README 的笔记阶段会生成目录页。
添加其他类型的实验附件时，在同步脚本的下载白名单中登记，避免将原始数据或本地配置打包进站点。

数学公式使用 `$...$` 或独立的 `$$...$$`，构建时渲染；全文搜索在浏览器本地运行。

## 验证与构建

```sh
npm test
npm run preview
```

`npm test` 先构建，再检查所有页面的内部链接、锚点与静态资源，以及正文来源、源码链接和数学公式渲染。
静态产物是 `dist/`，包含 `.nojekyll`，无需服务器端运行时。

验证 GitHub 项目站点的子路径时，构建和预览使用相同的环境变量，并打开终端显示的含子路径地址：

```sh
PAGES_BASE_PATH=/llm-tutorial/ npm test
PAGES_BASE_PATH=/llm-tutorial/ npm run preview
```

## GitHub Pages

[部署工作流](../.github/workflows/pages.yml) 会在 `main` / `master` 推送时构建，
只将默认分支部署到 Pages；PR 只构建和检查，也支持手动触发。

仓库连接到 GitHub 后，在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
默认项目站点路径从仓库名自动计算，例如 `/llm-tutorial/`；`<owner>.github.io` 仓库使用 `/`。
首次推送成功后，部署链接可在 Actions 的 `github-pages` environment 中查看。

若以后配置自定义域名，在 GitHub Pages 设置域名和 DNS，并将仓库的 Actions 变量
`PAGES_BASE_PATH` 设为 `/`。不需要修改教材链接。

仅添加工作流不会自动创建远端仓库或启用 Pages；是否已上线以 Actions 的部署结果为准。
