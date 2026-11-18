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
    en: "Future skills, for us, is two things. Hard skills: AI adaptability. Soft skills: management development. Five minutes on what we want to build, and the help we need to get there.",
    zh: "Future Skills，对我们来说是两件事。硬技能，是 AI Adaptability。软技能，是 Management Development。下面五分钟，讲我们想建设什么，以及做到这件事需要什么帮助。"
  },
  skills: {
    cue: { en: "0:20 – 0:45  ·  Two skills", zh: "0:20 – 0:45  ·  两种能力" },
    en: "Hard skills means using the tools for real, and sharing in what that creates. Soft skills, here, means knowing the customer’s business well enough to win the work. Neither one happens if we leave it to people figuring it out on their own.",
    zh: "硬技能，是把工具真正用起来，并分享它带来的结果。软技能这边，是看懂客户的业务，从而拿下订单。这两件事，都不是靠个人自己摸索就能完成的。"
  },
  efficiency: {
    cue: { en: "0:45 – 1:50  ·  Build, hard skills", zh: "0:45 – 1:50  ·  建设，硬技能" },
    en: "Efficiency is already higher. Engineering, documentation, simulation, and fault diagnosis all take less time. On the hard-skills side, that saved time still isn’t showing up when we evaluate people. The tools are saving time, but the people doing the work don’t see that come back to them. We want a simple link between that productivity and performance, so the people who use the tools share in what they create.",
    zh: "效率已经更高了。工程、文档、仿真、故障诊断，花的时间都在变少。硬技能这边，省下的时间还没有体现在对人的评价里。工具在省时间，但真正在做的人还没看到回报。我们希望把这份产出和绩效简单连起来，让愿意用工具的人分享他们创造的结果。"
  },
  tokens: {
    cue: { en: "1:50 – 2:40  ·  Support, hard skills", zh: "1:50 – 2:40  ·  支持，硬技能" },
    en: "Two kinds of help make this practical. First, a token quota at Group level. For digital and software teams, usage in the same range as leading internet companies, so engineers can try things and build at scale. For everyone else, encouragement, not a mandatory target. The quota is there so people can try. Either way, it has to be a Group quota. Second, an approved way to the best overseas AI tools, inside China’s data-security rules, so people can use them without carrying the compliance risk themselves.",
    zh: "要做成，需要两种帮助。第一，集团层面的 token 配额。数字化和软件团队，用量对齐领先的互联网公司，工程师才能放手试、规模化地做。其他同事鼓励就好，不设硬指标，配额是为了让人敢试。不管哪一种，都得是集团配额。第二，在中国数据安全要求之内，有一条被批准的路，能用上最好的海外 AI 工具，同时不把合规风险留在个人身上。"
  },
  orders: {
    cue: { en: "2:40 – 3:25  ·  Build, soft skills", zh: "2:40 – 3:25  ·  建设，软技能" },
    en: "The same change looks different here. Higher efficiency may not create demand, and it may not bring an order. A customer says yes when someone gets their problem, earns their trust, talks about the result they want, and gets our teams lined up to deliver it. Knowing the business, and being able to talk to the customer, matter more, not less.",
    zh: "同样的变化，在软技能这边是另一回事。效率更高，未必创造需求，也未必带来订单。客户点头，是因为有人看懂他的问题，赢得信任，聊的是他想要的结果，还能把我们的团队组织起来做成。所以看懂业务、能和客户说话，会更重要，不是更不重要。"
  },
  judgment: {
    cue: { en: "3:25 – 4:15  ·  What this asks", zh: "3:25 – 4:15  ·  对人的要求" },
    en: "Three things shift. Know the business: it helps to see where the value sits for the customer, in energy cost, uptime, and throughput. Trust: customers can pull the analysis themselves, so it helps to be clear about the trade-offs and close to the people who decide. A second look: answers are easy to get now. Someone still needs to see if they hold up, and keep up as the tools change.",
    zh: "有三处在变。看懂业务：需要看见价值在客户那里的哪一段，比如能耗、开机时间、产出。信任：客户自己就能拿出分析，所以还有用的是把取舍讲清楚，并和做决定的人保持近。再看一眼：答案现在很容易拿到，还是需要有人看看它站不站得住，并在工具变化时跟上。"
  },
  rotation: {
    cue: { en: "4:15 – 4:40  ·  Support, soft skills", zh: "4:15 – 4:40  ·  支持，软技能" },
    en: "AI has made it much faster to turn an idea into a business result. What slows that down is whether people understand the business. Once they do, they can turn AI into growth quickly. We’d like more rotation across businesses, functions, and markets.",
    zh: "AI 已经让一个想法变成业务结果的速度变快了。现在拖住它的，是人看不看懂业务。看懂了，就能很快把 AI 转成增长。所以我们希望有更多轮岗，跨业务、跨职能、跨市场。"
  },
  ask: {
    cue: { en: "4:40 – 5:00  ·  The ask", zh: "4:40 – 5:00  ·  收束" },
    en: "Three things we need. Link AI productivity to how we evaluate people. A Group token quota, and a compliant way to the best tools. Rotation across businesses, functions, and markets. Getting the work done is getting cheaper. Knowing what matters is not.",
    zh: "我们需要三件事。把 AI 带来的产出，和评价人的方式连起来。给出集团 token 配额，并有一条合规用上最好工具的路。跨业务、跨职能、跨市场轮岗。把事做出来会越来越便宜。知道什么重要，不会。"
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
