"use strict";

const OPS = ["add", "sub", "mul", "div"];
const SYMBOL = { add: "+", sub: "−", mul: "×", div: "÷" };
const PRAISE = ["Super! ⭐", "Great job! 🎉", "Awesome! 🌟", "You rock! 🚀", "Wow! 🦄", "Brilliant! 🏆"];
const MAX_TRIES = 3;

const els = {
  card: document.getElementById("card"),
  qtext: document.getElementById("qtext"),
  answer: document.getElementById("answer"),
  feedback: document.getElementById("feedback"),
  right: document.getElementById("right"),
  wrong: document.getElementById("wrong"),
  streak: document.getElementById("streak"),
};

let mode = "add";
let question = null;
let input = "";
let tries = 0;
let locked = false;
const score = { right: 0, wrong: 0, streak: 0 };

function rnd(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// Operands stay within 1..10; results are always whole numbers >= 0.
function newQuestion() {
  const op = mode === "mix" ? OPS[rnd(0, OPS.length - 1)] : mode;
  let a, b, ans;
  switch (op) {
    case "add":
      a = rnd(1, 10); b = rnd(1, 10); ans = a + b;
      break;
    case "sub": {
      const x = rnd(1, 10), y = rnd(1, 10);
      a = Math.max(x, y); b = Math.min(x, y); ans = a - b;
      break;
    }
    case "mul":
      a = rnd(1, 10); b = rnd(1, 10); ans = a * b;
      break;
    case "div":
      b = rnd(1, 10); ans = rnd(1, 10); a = b * ans;
      break;
  }
  question = { a, b, op, ans };
  input = "";
  tries = 0;
  locked = false;
  els.card.classList.remove("right", "wrong");
  els.feedback.textContent = "";
  els.feedback.className = "feedback";
  els.card.style.animation = "none";
  void els.card.offsetWidth; // restart the pop animation
  els.card.style.animation = "";
  render();
}

function render() {
  els.qtext.textContent = `${question.a} ${SYMBOL[question.op]} ${question.b} =`;
  els.answer.textContent = input === "" ? "?" : input;
  els.answer.classList.toggle("empty", input === "");
  els.right.textContent = score.right;
  els.wrong.textContent = score.wrong;
  els.streak.textContent = score.streak;
}

function press(key) {
  if (locked) return;
  if (key === "back") {
    input = input.slice(0, -1);
  } else if (key === "ok") {
    submit();
    return;
  } else if (input.length < 3) {
    input += key;
  }
  els.card.classList.remove("wrong");
  render();
}

function submit() {
  if (locked || input === "") return;
  if (parseInt(input, 10) === question.ans) {
    locked = true;
    score.right++;
    score.streak++;
    els.card.classList.add("right");
    els.feedback.textContent = PRAISE[rnd(0, PRAISE.length - 1)];
    els.feedback.className = "feedback good";
    render();
    setTimeout(newQuestion, 1000);
  } else {
    score.wrong++;
    score.streak = 0;
    tries++;
    els.card.classList.add("wrong", "shake");
    setTimeout(() => els.card.classList.remove("shake"), 450);
    if (tries >= MAX_TRIES) {
      locked = true;
      input = String(question.ans);
      els.feedback.textContent = `The answer is ${question.ans} 💡`;
      els.feedback.className = "feedback oops";
      render();
      setTimeout(newQuestion, 2000);
    } else {
      input = "";
      els.feedback.textContent = "Try again! 💪";
      els.feedback.className = "feedback oops";
      render();
    }
  }
}

document.getElementById("keypad").addEventListener("click", (e) => {
  const key = e.target.closest(".key");
  if (key) press(key.dataset.k);
});

document.getElementById("ops").addEventListener("click", (e) => {
  const btn = e.target.closest(".op");
  if (!btn) return;
  mode = btn.dataset.op;
  document.querySelectorAll(".op").forEach((b) => b.classList.toggle("active", b === btn));
  newQuestion();
});

// Hardware keyboard support (desktop / tablets with keyboards)
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") press(e.key);
  else if (e.key === "Backspace") press("back");
  else if (e.key === "Enter") press("ok");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

newQuestion();
