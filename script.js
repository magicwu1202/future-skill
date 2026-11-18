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
    en: "Future skills, for us, is two things. Hard skills: AI adaptability. Soft skills: working across functions. Five minutes on what we want to build, and the help we need to get there.",
    zh: "Future Skills，对我们来说是两件事。硬技能是 AI Adaptability。软技能是跨职能协作。下面五分钟，讲我们想建设什么，以及需要什么帮助。"
  },
  skills: {
    cue: { en: "0:20 – 0:45  ·  Two skills", zh: "0:20 – 0:45  ·  两种能力" },
    en: "Hard skills means using the AI tools for real, and sharing in what that creates. Soft skills means working across functions, not staying inside one team. Neither one happens if we leave it to people figuring it out on their own.",
    zh: "硬技能，是把 AI 工具真正用起来，并分享它带来的结果。软技能，是跨职能一起做，而不是只待在自己的团队里。这两件事，都不是靠个人自己摸索就能完成的。"
  },
  efficiency: {
    cue: { en: "0:45 – 1:50  ·  Build, hard skills", zh: "0:45 – 1:50  ·  建设，硬技能" },
    en: "This is how we build the hard skill. It is an AI skill, and we build it on the job. Learn the tools well enough to use them for real. Apply them to the work we already do: engineering, documentation, simulation, and fault diagnosis. Then use them on the next job too. That is how the skill sticks.",
    zh: "硬技能就是 AI 技能，我们在工作里把它建起来。先把工具用到能真正干活。再用到已经在做的事上：工程、文档、仿真、故障诊断。下一份工作也接着用。技能是这么留下来的。"
  },
  tokens: {
    cue: { en: "1:50 – 2:40  ·  Support, hard skills", zh: "1:50 – 2:40  ·  支持，硬技能" },
    en: "To build that skill, we need two kinds of help. First, a Group token quota. Digital and software teams need usage in the same range as leading internet companies, so engineers can try things and build at scale. For everyone else, encourage them. Do not make it a target. The quota is there so people can try. Either way, it has to come from the Group. Second, an approved way to the best overseas AI tools, inside China’s data-security rules, so people can use them without carrying the compliance risk themselves.",
    zh: "要把这个技能建起来，需要两种帮助。第一，集团的 token 配额。数字化和软件团队，用量对齐领先的互联网公司，工程师才能放手试、规模化地做。其他同事鼓励就好，不设硬指标，配额是为了让人敢试。不管哪一种，都得是集团给的。第二，在中国数据安全要求之内，有一条被批准的路，能用上最好的海外 AI 工具，同时不把合规风险留在个人身上。"
  },
  softbuild: {
    cue: { en: "2:40 – 4:15  ·  Build, soft skills", zh: "2:40 – 4:15  ·  建设，软技能" },
    en: "Soft skills are built in three ways, and all three are cross-functional. Fast study: learn another function, another business, or another market quickly. Collaboration: work across functions, not only inside your own team. Decision making: judge what matters, and make the call together.",
    zh: "软技能靠三件事来建，三件都是跨职能的。快速学习：尽快看懂另一个职能、另一块业务，或另一个市场。协作：跨职能一起做，而不是只在自己的团队里。判断与决策：一起判断什么重要，并做出决定。"
  },
  rotation: {
    cue: { en: "4:15 – 4:40  ·  Support, soft skills", zh: "4:15 – 4:40  ·  支持，软技能" },
    en: "The support for soft skills is rotation, across businesses, functions, and markets. That is how people get out of their own function, see how the work fits together, and find where AI can help us grow.",
    zh: "软技能需要的支持是轮岗，跨业务、跨职能、跨市场。人因此走出自己的职能，看见工作是怎么接在一起的，也看见 AI 能在哪里帮我们增长。"
  },
  ask: {
    cue: { en: "4:40 – 5:00  ·  The ask", zh: "4:40 – 5:00  ·  收束" },
    en: "Three things. Link AI productivity to how we evaluate people. A Group token quota, and a compliant way to the best tools. Rotation across businesses, functions, and markets. Doing the work is getting cheaper. The ability to judge and decide, across functions, matters more and more.",
    zh: "三件事。把 AI 带来的产出，和评价人的方式连起来。给出集团 token 配额，并有一条合规用上最好工具的路。跨业务、跨职能、跨市场轮岗。做事会越来越便宜。跨职能做判断和决策的能力，愈发重要。"
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
