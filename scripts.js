const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const reveals = document.querySelectorAll(".reveal");
const progress = document.querySelector("[data-progress]");
const spotlight = document.querySelector("[data-light]");
const tilt = document.querySelector("[data-tilt]");
const magneticItems = document.querySelectorAll("[data-magnetic]");
const modeButtons = document.querySelectorAll("[data-mode-button]");
const heroTitle = document.querySelector("[data-hero-title]");
const heroLead = document.querySelector("[data-hero-lead]");
const paperLabel = document.querySelector("[data-paper-label]");
const paperMain = document.querySelector("[data-paper-main]");
const paperMode = document.querySelector("[data-paper-mode]");
const paperDesc = document.querySelector("[data-paper-desc]");
const paperStatus = document.querySelector("[data-paper-status]");
const caseModal = document.querySelector("[data-case-modal]");
const caseButtons = document.querySelectorAll("[data-case-button]");
const caseCloseButtons = document.querySelectorAll("[data-case-close]");

const modes = {
  interface: {
    title: "复杂项目<br />清晰落地",
    lead: "我更擅长把界面 品牌 物料和开发对接整理成一套可执行的视觉系统",
    label: "Interface System",
    main: "系统",
    mode: "界面",
    desc: "大屏 UI APP 界面 原型 规范 切图",
    status: "能设计 也能对接落地",
  },
  brand: {
    title: "一组物料<br />一个系统",
    lead: "从企业宣传 项目品牌 到会议物料和线下触点 让画面保持统一",
    label: "Brand Identity",
    main: "识别",
    mode: "品牌",
    desc: "企业宣传 项目品牌 会议物料 线下触点",
    status: "让一组物料看起来像一个品牌",
  },
  operation: {
    title: "快速内容<br />也要有秩序",
    lead: "专题活动 推荐图 运营位和活动主视觉 重点是先被看见再被理解",
    label: "Campaign Visual",
    main: "触达",
    mode: "运营",
    desc: "专题活动 推荐图 运营位 活动主视觉",
    status: "把信息变成更容易被看见的画面",
  },
  presentation: {
    title: "复杂方案<br />清楚表达",
    lead: "做 PPT 和项目包装时 先理清信息层级 再处理视觉风格",
    label: "Presentation Logic",
    main: "表达",
    mode: "展示",
    desc: "PPT 汇报页 项目说明 方案包装",
    status: "让方案更清楚 更像一个完整项目",
  },
};

const cases = {
  interface: {
    kicker: "Interface Case",
    title: "河北联通少儿 IPTV",
    intro: "适合放大屏 UI 专题页 推荐位 排屏稿和切图对接记录",
    bg: "少儿 IPTV 内容更新频繁 需要稳定视觉规范",
    role: "界面更新 专题活动 推荐位 切图对接",
    show: "放上线画面 前后对比 规范拆解",
    style: "interface",
  },
  brand: {
    kicker: "Brand Material",
    title: "医疗品牌与会议物料",
    intro: "适合放会议主视觉 展架 画册 官网和设备 UI",
    bg: "医疗项目需要专业感和可信度",
    role: "品牌形象 宣传物料 会议活动 官网维护",
    show: "放物料组合 场景照片 视觉规范",
    style: "brand",
  },
  operation: {
    kicker: "Operation Visual",
    title: "专题活动与运营图",
    intro: "适合放活动主视觉 推荐图 公众号配图和运营位",
    bg: "运营内容更新快 需要快速形成统一视觉",
    role: "主视觉 推荐图 专题活动 运营位延展",
    show: "放系列图 活动入口 延展版式",
    style: "operation",
  },
  presentation: {
    kicker: "Presentation",
    title: "PPT 与项目包装",
    intro: "适合放汇报页 项目说明 方案包装和结构优化",
    bg: "复杂信息需要更清楚的汇报结构",
    role: "页面排版 信息层级 视觉包装 交付整理",
    show: "放封面 目录 关键内页 视觉系统",
    style: "presentation",
  },
};

const updateScrollState = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  if (progress) progress.style.width = `${ratio * 100}%`;
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
};

updateScrollState();
window.addEventListener("scroll", updateScrollState, { passive: true });

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!open));
  menu?.classList.toggle("is-open", !open);
  document.body.classList.toggle("menu-open", !open);
});

menu?.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLAnchorElement)) return;
  menuToggle?.setAttribute("aria-expanded", "false");
  menu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  },
  { threshold: 0.18 }
);

for (const item of reveals) revealObserver.observe(item);

for (const button of modeButtons) {
  button.addEventListener("click", () => {
    const mode = button.dataset.modeButton;
    const content = modes[mode];
    if (!content) return;

    document.body.classList.add("is-switching");
    window.setTimeout(() => {
      document.body.dataset.mode = mode;
      if (heroTitle) heroTitle.innerHTML = content.title;
      if (heroLead) heroLead.textContent = content.lead;
      if (paperLabel) paperLabel.textContent = content.label;
      if (paperMain) paperMain.textContent = content.main;
      if (paperMode) paperMode.textContent = content.mode;
      if (paperDesc) paperDesc.textContent = content.desc;
      if (paperStatus) paperStatus.textContent = content.status;
      for (const current of modeButtons) current.classList.toggle("is-active", current === button);
      document.body.classList.remove("is-switching");
    }, 170);
  });
}

const setCaseText = (selector, text) => {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
};

const openCase = (caseKey) => {
  const current = cases[caseKey];
  if (!current || !caseModal) return;

  setCaseText("[data-case-kicker]", current.kicker);
  setCaseText("[data-case-title]", current.title);
  setCaseText("[data-case-intro]", current.intro);
  setCaseText("[data-case-bg]", current.bg);
  setCaseText("[data-case-role]", current.role);
  setCaseText("[data-case-show]", current.show);
  caseModal.dataset.caseStyle = current.style;
  caseModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closeCase = () => {
  if (!caseModal) return;
  caseModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

for (const button of caseButtons) {
  button.addEventListener("click", () => openCase(button.dataset.caseButton));
}

for (const button of caseCloseButtons) {
  button.addEventListener("click", closeCase);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCase();
});

window.addEventListener(
  "pointermove",
  (event) => {
    if (spotlight) {
      spotlight.style.opacity = "1";
      spotlight.style.left = `${event.clientX}px`;
      spotlight.style.top = `${event.clientY}px`;
    }

    if (tilt && window.innerWidth > 900) {
      const rect = tilt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tilt.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    }
  },
  { passive: true }
);

tilt?.addEventListener("pointerleave", () => {
  tilt.style.transform = "rotateY(0deg) rotateX(0deg)";
});

for (const item of magneticItems) {
  item.addEventListener("pointermove", (event) => {
    if (window.innerWidth <= 900) return;
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
    item.style.setProperty("--mag-x", `${x}px`);
    item.style.setProperty("--mag-y", `${y}px`);
  });

  item.addEventListener("pointerleave", () => {
    item.style.setProperty("--mag-x", "0px");
    item.style.setProperty("--mag-y", "0px");
  });
}
