const form = document.querySelector("#form");
const resultPanel = document.querySelector("#resultPanel");
const resultText = document.querySelector("#resultText");
const copyButton = document.querySelector("#copyButton");
const mailLink = document.querySelector("#mailLink");
const planLabels = document.querySelectorAll(".plan");

for (const label of planLabels) {
  label.addEventListener("click", () => {
    for (const item of planLabels) item.classList.toggle("active", item === label);
    const input = label.querySelector("input");
    if (input) input.checked = true;
  });
}

const getCheckedValues = (formData, name) => {
  return formData.getAll(name).filter(Boolean).join("、") || "暂时不确定";
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const selectedPlan = document.querySelector(".plan input:checked");
  const plan = selectedPlan?.value || "视觉诊断体验版";
  const brand = data.get("brand") || "未填写";
  const industry = data.get("industry") || "未填写";
  const contact = data.get("contact") || "未填写";
  const problem = data.get("problem") || "未填写";
  const needs = getCheckedValues(data, "needs");
  const materials = data.get("materials") || "未填写";

  const text = `你好，我想做一次视觉诊断。

【意向版本】
${plan}

【公司/品牌】
${brand}

【行业】
${industry}

【联系方式】
${contact}

【现在最不满意的问题】
${problem}

【想优先优化】
${needs}

【资料链接或补充说明】
${materials}

请先帮我判断哪里最影响专业感，以及应该先改哪里。`;

  resultText.value = text;
  resultPanel.hidden = false;
  mailLink.href = `mailto:1048503374@qq.com?subject=${encodeURIComponent("视觉诊断咨询")}&body=${encodeURIComponent(text)}`;
  resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultText.value);
    copyButton.textContent = "已复制";
    setTimeout(() => {
      copyButton.textContent = "复制文本";
    }, 1400);
  } catch {
    resultText.select();
    document.execCommand("copy");
  }
});
