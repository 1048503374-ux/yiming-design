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
const paperSub = document.querySelector("[data-paper-sub]");
const caseModal = document.querySelector("[data-case-modal]");
const caseButtons = document.querySelectorAll("[data-case-button]");
const caseCloseButtons = document.querySelectorAll("[data-case-close]");

const modes = {
  contrast: {
    title: "从平面到 UI<br />把项目做成视觉系统",
    lead: "5 年设计经验 做过 IPTV 大屏 UI APP 界面 医疗品牌物料 会议活动 PPT 与官网维护",
    label: "PROJECT",
    main: "系统",
    sub: "落地",
  },
  focus: {
    title: "做过大屏<br />也做过 APP 界面",
    lead: "能处理原型 视觉稿 设计规范 交互流程和开发对接",
    label: "INTERFACE",
    main: "界面",
    sub: "规范",
  },
  order: {
    title: "不只出图<br />也考虑交付现场",
    lead: "会议物料 品牌宣传 材质沟通 现场布置和安装监督都有实际经验",
    label: "DELIVERY",
    main: "交付",
    sub: "现场",
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
      if (paperSub) paperSub.textContent = content.sub;
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
