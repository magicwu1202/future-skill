/** 五分钟展示的翻页、语言、计时和演讲备注。 */

const slides = Array.from(document.querySelectorAll(".slide"));
const dots = Array.from(document.querySelectorAll(".dot"));
const indexNode = document.querySelector(".nav-index");
const timerButton = document.querySelector(".nav-timer");
const notesButton = document.querySelector(".nav-notes");
const notesPanel = document.querySelector(".notes");
const notesCue = document.querySelector(".notes-cue");
const notesBody = document.querySelector(".notes-body");
const timelineFill = document.querySelector(".timeline-fill");
const hint = document.querySelector(".hint");

const talkLengthSeconds = 300;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let currentIndex = 0;
let timerRunning = false;
let timerStartMs = 0;
let timerElapsedMs = 0;
let timerFrame = 0;

/** 每一页的口述稿，按目标时间写好，中英可切换。 */
const notesById = {
  open: {
    cue: { en: "0:00 – 0:20  ·  Open", zh: "0:00 – 0:20  ·  开场" },
    en: "Future skill, as we see it, is two things. A hard skill: AI adaptability. A soft skill: management development. Five minutes on what we want the Group to help build, and the support that makes it real.",
    zh: "Future Skill，我们分成两件事。硬技能，是 AI Adaptability。软技能，是 Management Development。下面五分钟，讲我们希望集团一起建设的能力，以及需要的支持。"
  },
  skills: {
    cue: { en: "0:20 – 0:45  ·  Two skills", zh: "0:20 – 0:45  ·  两种能力" },
    en: "AI adaptability means using the tools at real depth, and sharing in the value that creates. Management development, here, means understanding the customer’s business well enough to earn the order. Neither one happens if we leave it to individual effort.",
    zh: "硬技能，是把工具用到足够深，并让创造价值的人分享价值。软技能这一侧，Management Development 指的是看懂客户的业务，从而赢得订单。这两件事，都不是靠个人自觉就能完成的。"
  },
  fact: {
    cue: { en: "0:45 – 1:05  ·  The fact", zh: "0:45 – 1:05  ·  一个事实" },
    en: "Both sides start from one fact. Delivery is already faster. Engineering, documentation, simulation, and fault diagnosis all take less time.",
    zh: "两边共用一个事实：交付已经变快了。工程、文档、仿真、故障诊断，花费的时间都在减少。"
  },
  evaluate: {
    cue: { en: "1:05 – 1:50  ·  Build, hard skill", zh: "1:05 – 1:50  ·  建设，硬技能" },
    en: "On the hard-skill side, that speed is not showing up where it should. The efficiency does not translate into tangible benefits for the people who drive it. We are asking for a concrete plan that links AI-driven productivity to performance evaluation, so people who actively embrace these tools share in the value they create.",
    zh: "硬技能这边，快出来的效率没有进入评价。工具在省时间，但推动这件事的人没有分享到价值。我们希望有一套具体的办法，把 AI 带来的生产力写进绩效。主动拥抱工具的人，应该分享他们创造的价值。"
  },
  tokens: {
    cue: { en: "1:50 – 2:40  ·  Support, hard skill", zh: "1:50 – 2:40  ·  支持，硬技能" },
    en: "Two kinds of support make this practical. First, a token allocation at Group level. For digital and software teams, hard usage targets comparable to leading internet companies, so engineers can experiment and build at scale. For everyone else, encouragement rather than a mandatory target. The quota is there for experimentation. Either way, a Group quota is what makes it possible. Second, a sanctioned pathway to leading overseas AI tools, inside China’s data-security and regulatory requirements, so teams can use the best tools without carrying the compliance risk themselves.",
    zh: "要落地，需要两种支持。第一，集团层面的 token 配额。数字化和软件团队，设对标领先互联网公司的使用目标，工程师才能规模化地试验和构建。其他同事以鼓励为主，不设强制指标，配额用来支持尝试。没有集团配额，这件事做不成。第二，一条被批准的路径，在中国数据安全和监管要求之内使用领先的海外 AI 工具。让团队用上最好的工具，同时不把合规风险留给个人。"
  },
  orders: {
    cue: { en: "2:40 – 3:25  ·  Build, soft skill", zh: "2:40 – 3:25  ·  建设，软技能" },
    en: "The same speed has a different consequence. Faster delivery does not create demand, and it does not bring orders. A customer buys when someone understands their operational problem, earns their trust, frames the solution around their outcomes, and aligns our teams to deliver it. Business understanding and customer-facing influence are becoming more important, not less.",
    zh: "同样的变快，对软技能是另一件事。更快的交付不会创造需求，也不会带来订单。客户下单，是因为有人看懂他的运营问题，赢得信任，用他在意的结果来定义方案，并组织内部团队交付。所以业务理解，和面向客户的影响力，会更重要，而不是更不重要。"
  },
  judgment: {
    cue: { en: "3:25 – 4:15  ·  What changed", zh: "3:25 – 4:15  ·  三个变化" },
    en: "The requirement has changed in three ways. Business understanding is now the differentiator: the advantage is knowing where value sits, in energy cost, uptime, and throughput. Trust carries more weight, because customers can generate the analysis themselves. Credibility, clear trade-offs, and the relationship decide. Judgment matters more, because someone has to decide what is right, challenge the output, and adapt as the tools change.",
    zh: "要求变了，变在三处。业务理解成为差别：优势在于知道价值在客户流程的哪里，比如能耗、开机时间、产出。信任更有分量：客户自己就能生成分析，决定订单的是可信，是把取舍讲清楚，是和决策者的关系。判断更重要：输出很容易，人必须判断什么是对的，质疑 AI 的结果，并在工具变化时跟上。"
  },
  rotation: {
    cue: { en: "4:15 – 4:40  ·  Support, soft skill", zh: "4:15 – 4:40  ·  支持，软技能" },
    en: "AI has made it much faster to turn an idea into a business outcome. What gates that speed is whether people understand the business. Once they do, they can translate AI into growth quickly. We would welcome more rotation across businesses, functions, and markets.",
    zh: "AI 已经让想法变成业务结果的速度变快了。现在更缺的是对业务的深入理解。理解了，就能很快把 AI 转成增长。所以我们希望有更多轮岗，跨业务、跨职能、跨市场。"
  },
  ask: {
    cue: { en: "4:40 – 5:00  ·  The ask", zh: "4:40 – 5:00  ·  收束" },
    en: "Three decisions. Link AI productivity to performance. Provide a Group token quota, and a compliant path to the best tools. Create rotation that builds business judgment. Execution is getting cheaper. Judgment is not.",
    zh: "请集团定三件事。把 AI 带来的生产力写进绩效。给出集团 token 配额，并开通合规使用最好工具的路径。用轮岗培养业务判断。执行会越来越便宜。判断不会。"
  }
};

/** 把秒数格式化成 m:ss。 */
function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return minutes + ":" + String(seconds).padStart(2, "0");
}

/** 同步页码、圆点、深浅色和备注。 */
function setActive(slide) {
  const index = slides.indexOf(slide);
  if (index < 0) return;
  currentIndex = index;
  slide.classList.add("is-in");
  dots.forEach((dot, dotIndex) => {
    if (dotIndex === index) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
  indexNode.textContent = String(index + 1).padStart(2, "0");
  document.body.dataset.surface = slide.dataset.theme === "dark" ? "dark" : "light";
  if (index > 0 && hint) hint.classList.add("is-hidden");
  if (location.hash !== "#" + slide.id) {
    history.replaceState(null, "", "#" + slide.id);
  }
  renderNotes();
}

/** 滚动到指定页。 */
function goToSlide(index) {
  const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
  const slide = slides[nextIndex];
  const distance = Math.abs(nextIndex - currentIndex);
  const behavior = reducedMotion || distance > 1 ? "auto" : "smooth";
  scrollLockUntil = performance.now() + (behavior === "smooth" ? 900 : 80);
  slide.scrollIntoView({ behavior, block: "start" });
  setActive(slide);
}

/** 渲染当前页的口述稿。 */
function renderNotes() {
  const slide = slides[currentIndex];
  const note = notesById[slide.id];
  if (!note) return;
  notesCue.textContent = note.cue.en;
  notesBody.textContent = note.en;
}

/** 打开或关闭演讲备注。 */
function toggleNotes(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : notesPanel.hidden;
  notesPanel.hidden = !shouldOpen;
  notesButton.setAttribute("aria-pressed", shouldOpen ? "true" : "false");
  if (shouldOpen && hint) hint.classList.add("is-hidden");
}

/** 计算已经走过的毫秒。 */
function elapsedMilliseconds() {
  if (!timerRunning) return timerElapsedMs;
  return timerElapsedMs + (performance.now() - timerStartMs);
}

/** 刷新时钟和五分钟进度条。 */
function paintTimer() {
  const elapsedSeconds = elapsedMilliseconds() / 1000;
  const progress = Math.min(elapsedSeconds / talkLengthSeconds, 1);
  timelineFill.style.width = (progress * 100) + "%";
  timerButton.textContent = formatClock(elapsedSeconds);
  timerButton.classList.toggle("is-running", timerRunning);
  timerButton.classList.toggle("is-over", elapsedSeconds > talkLengthSeconds);
  timelineFill.classList.toggle("is-over", elapsedSeconds > talkLengthSeconds);
}

/** 按帧刷新计时，直到暂停。 */
function tickTimer() {
  paintTimer();
  if (timerRunning) timerFrame = requestAnimationFrame(tickTimer);
}

/** 开始或继续计时。 */
function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerStartMs = performance.now();
  if (hint) hint.classList.add("is-hidden");
  tickTimer();
}

/** 暂停计时。 */
function pauseTimer() {
  if (!timerRunning) return;
  timerElapsedMs += performance.now() - timerStartMs;
  timerRunning = false;
  cancelAnimationFrame(timerFrame);
  paintTimer();
}

/** 在开始和暂停之间切换。 */
function toggleTimer() {
  if (timerRunning) pauseTimer();
  else startTimer();
}

/** 进入或退出全屏。 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

let scrollLockUntil = 0;
let scrollTick = false;

/** 按视口中心认定当前页，避免只靠比例漏掉超高的页。 */
function syncActiveFromScroll() {
  if (performance.now() < scrollLockUntil) return;
  const viewportMiddle = window.innerHeight / 2;
  let closestSlide = slides[0];
  let closestDistance = Infinity;
  slides.forEach((slide) => {
    const rect = slide.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - viewportMiddle);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSlide = slide;
    }
  });
  if (closestSlide !== slides[currentIndex]) setActive(closestSlide);
}

/** 滚动时节流更新当前页。 */
function watchSlides() {
  document.addEventListener("scroll", () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      scrollTick = false;
      syncActiveFromScroll();
    });
  }, { passive: true });
}

/** 绑定键盘、按钮和页点。 */
function bindControls() {
  document.querySelector(".nav-brand").addEventListener("click", () => goToSlide(0));
  timerButton.addEventListener("click", toggleTimer);
  notesButton.addEventListener("click", () => toggleNotes());
  dots.forEach((dot) => {
    dot.addEventListener("click", () => goToSlide(Number(dot.dataset.go)));
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key === "ArrowDown" || key === "ArrowRight" || key === "PageDown" || key === " ") {
      event.preventDefault();
      goToSlide(currentIndex + 1);
    } else if (key === "ArrowUp" || key === "ArrowLeft" || key === "PageUp") {
      event.preventDefault();
      goToSlide(currentIndex - 1);
    } else if (key === "Home") {
      event.preventDefault();
      goToSlide(0);
    } else if (key === "End") {
      event.preventDefault();
      goToSlide(slides.length - 1);
    } else if (key === "n" || key === "N") {
      toggleNotes();
    } else if (key === "b" || key === "B") {
      toggleTimer();
    } else if (key === "f" || key === "F") {
      toggleFullscreen();
    } else if (key === "Escape" && !notesPanel.hidden && !document.fullscreenElement) {
      toggleNotes(false);
    }
  });
}

/** 定位到地址栏指定的页，并清掉以前记住的中文。 */
function restoreView() {
  try {
    localStorage.removeItem("futureSkillLang");
  } catch (error) {
    /* 本地文件打开时存储可能不可用，忽略即可。 */
  }
  const targetId = location.hash.replace("#", "");
  const found = slides.findIndex((slide) => slide.id === targetId);
  if (found > 0) goToSlide(found);
  else setActive(slides[0]);
  paintTimer();
}

bindControls();
watchSlides();
restoreView();
