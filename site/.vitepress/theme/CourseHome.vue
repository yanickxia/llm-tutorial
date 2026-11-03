<script setup>
import { withBase } from 'vitepress';
import course from '../../content/course.json';

const firstLesson = course.lessons[0];
const pad = (number) => String(number).padStart(2, '0');
</script>

<template>
  <main class="course-home">
    <section class="course-hero" aria-labelledby="course-title">
      <div class="hero-copy">
        <p class="eyebrow">A PERSONAL LAB FOR LANGUAGE MODELS</p>
        <h1 id="course-title">从第一个预测，<br>到自己的<span>语言模型。</span></h1>
        <p class="hero-description">把一句话变成数字，让模型从数据中学习。<br class="desktop-break">从小实验走向 Transformer，再把理解带进真实应用。</p>
        <div class="hero-actions">
          <a class="course-button primary" :href="withBase(firstLesson.url)">从第 {{ Number(firstLesson.id) }} 课开始 <span aria-hidden="true">↗</span></a>
          <a class="course-button secondary" :href="withBase('/docs/roadmap.html')">浏览学习路线 <span aria-hidden="true">→</span></a>
        </div>
        <p class="hero-caption">中文教程 <span>·</span> Python / PyTorch <span>·</span> 从 CPU 开始</p>
      </div>

      <aside class="model-sheet" aria-label="语言模型的预测过程示意">
        <div class="sheet-heading"><span>THE NEXT TOKEN</span><span class="live-dot">学习从这里开始</span></div>
        <div class="token-row"><span>让</span><span>模型</span><span>学会</span><span class="unknown-token">?</span></div>
        <div class="flow-connector"><span></span><code>context → model → prediction</code><span></span></div>
        <div class="model-block"><div class="model-nodes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><strong>每次，预测下一个 token</strong><small>观察误差，更新参数，再试一次。</small></div>
        <div class="sheet-foot"><span>从文本到预测的概念示意</span><span aria-hidden="true">01 / ∞</span></div>
      </aside>
    </section>

    <section class="open-lesson" aria-labelledby="open-title">
      <div class="lesson-index">{{ firstLesson.id }}</div>
      <div class="open-copy"><p class="eyebrow">START HERE · 已开放 {{ pad(course.lessons.length) }} 课</p><h2 id="open-title">{{ firstLesson.title }}</h2><p>{{ firstLesson.summary }}</p></div>
      <a :href="withBase(firstLesson.url)" class="lesson-entry">打开讲义 <span aria-hidden="true">↗</span></a>
    </section>

    <section class="curriculum" aria-labelledby="curriculum-title">
      <div class="section-heading"><div><p class="eyebrow">THE LEARNING PATH</p><h2 id="curriculum-title">先实现模型，再构建应用。</h2></div><p>七个阶段，一条完整的学习路径。<br>课程随学习逐步展开。</p></div>
      <div class="stage-list">
        <div v-for="stage in course.stages" :key="stage.id" class="stage-row">
          <span class="stage-number">{{ stage.id }}</span>
          <h3>{{ stage.title }}</h3>
          <p>{{ stage.capability }}</p>
          <span class="stage-state" :class="{ available: course.lessons.some(lesson => lesson.section.startsWith(stage.id + '-')) }">{{ course.lessons.some(lesson => lesson.section.startsWith(stage.id + '-')) ? '已有课程' : '路线规划' }}</span>
        </div>
      </div>
      <a class="text-link" :href="withBase('/docs/roadmap.html')">查看各阶段的内容与验收里程碑 <span aria-hidden="true">→</span></a>
    </section>

    <section class="learning-method" aria-labelledby="method-title">
      <div class="method-intro"><p class="eyebrow">HOW WE LEARN</p><h2 id="method-title">把“我懂了”，<br>变成可以验证的证据。</h2><p>教材、实验和学习笔记一起推进。<br>错误的预测，也值得保留。</p></div>
      <ol class="method-steps">
        <li><span>01</span><div><h3>理解与预测</h3><p>先讲清概念，用小例子推导运行结果。</p></div></li>
        <li><span>02</span><div><h3>动手与观察</h3><p>完成一个贯穿实验，检查实际输出与边界。</p></div></li>
        <li><span>03</span><div><h3>解释与复盘</h3><p>对照预测，留下自己的解释和新的问题。</p></div></li>
      </ol>
    </section>

    <section class="reading-desk" aria-label="更多学习入口">
      <a :href="withBase('/notes/')"><span>FIELD NOTES</span><strong>学习记录 <span aria-hidden="true">↗</span></strong><p>把预测、实验结果与追问留在一起。</p></a>
      <a :href="withBase('/docs/reference/')"><span>THE BOOKSHELF</span><strong>参考资料 <span aria-hidden="true">↗</span></strong><p>按当前课程选读，连接实现与原始资料。</p></a>
    </section>
  </main>
</template>
