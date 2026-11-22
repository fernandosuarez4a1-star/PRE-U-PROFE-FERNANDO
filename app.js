/**
 * PROFE FERNANDO PRE-U
 * Lógica Principal + Sincronización con Google Apps Script
 */

(function () {
  "use strict";

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwnOIaszthM9mUMYAwfxwCX636_0Oe8kGQ89_RH1dXFe3eVoi2jlvJchLbRqZggZt7c1g/exec";

  const STORAGE_KEYS = {
    QUESTIONS: "pf_preu_questions_v1",
    STUDENTS: "pf_preu_students_v1",
    TEACHER_PIN: "pf_preu_teacher_pin_v1"
  };

  const LEVEL_CONFIG = {
    basico: { key: "basico", label: "Nivel Básico", count: 5, timeLimitSeconds: 0, ruleText: "5 preguntas · Sin límite de tiempo" },
    medio: { key: "medio", label: "Nivel Medio", count: 10, timeLimitSeconds: 15 * 60, ruleText: "10 preguntas · 15 min (90s/preg)" },
    dificil: { key: "dificil", label: "Nivel Difícil", count: 20, timeLimitSeconds: 15 * 60, ruleText: "20 preguntas · 15 min (45s/preg)" },
    desafio_final: { key: "desafio_final", label: "Simulacro General", count: 70, timeLimitSeconds: 75 * 60, ruleText: "70 preguntas integradoras · 75 minutos" }
  };

  let questionBank = [];
  let studentsDB = {};
  let currentStudentKey = null;
  let teacherAuthenticated = false;

  let activeExam = {
    isActive: false,
    mode: "topic",
    topicId: null,
    levelKey: null,
    questions: [],
    answers: [],
    flagged: [],
    currentIndex: 0,
    timerInterval: null,
    secondsElapsed: 0,
    secondsRemaining: 0,
    warningSoundPlayed: false
  };

  document.addEventListener("DOMContentLoaded", () => {
    loadStorageData();
    bindGlobalEvents();
    showView("view-login");
  });

  function loadStorageData() {
    const savedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (savedQuestions) {
      try { questionBank = JSON.parse(savedQuestions); } catch (e) { questionBank = [...DEFAULT_QUESTION_BANK]; }
    } else {
      questionBank = [...DEFAULT_QUESTION_BANK];
      saveQuestions();
    }

    const savedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (savedStudents) {
      try { studentsDB = JSON.parse(savedStudents); } catch (e) { studentsDB = {}; }
    }

    if (!localStorage.getItem(STORAGE_KEYS.TEACHER_PIN)) {
      localStorage.setItem(STORAGE_KEYS.TEACHER_PIN, "1234");
    }
  }

  function saveQuestions() { localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questionBank)); }
  function saveStudents() { localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(studentsDB)); }

  async function syncWithAppsScript(payload) {
    if (!APPS_SCRIPT_URL) return { ok: false };
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          source: "profe_fernando_preu",
          timestamp: new Date().toISOString(),
          ...payload
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json().catch(() => ({ status: "ok" }));
      return { ok: true, data };
    } catch (err) {
      console.warn("Sincronización Apps Script pendiente/offline:", err.message);
      return { ok: false, error: err.message };
    }
  }

  function showView(viewId) {
    document.querySelectorAll(".view-section").forEach(sec => sec.classList.add("hidden"));
    const target = document.getElementById(viewId);
    if (target) target.classList.remove("hidden");

    const userControls = document.getElementById("header-user-controls");
    if (viewId === "view-login") userControls.classList.add("hidden");
    else userControls.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function normalizeStudentKey(fullName) {
    return fullName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
  }

  function formatDisplayName(fullName) {
    return fullName.trim().replace(/\s+/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }

  function bindGlobalEvents() {
    document.getElementById("form-student-login").addEventListener("submit", handleStudentLogin);
    document.getElementById("form-teacher-login").addEventListener("submit", handleTeacherLogin);

    document.getElementById("btn-logout").addEventListener("click", () => {
      if (activeExam.isActive) {
        if (!confirm("Tienes un examen en curso. Si sales ahora se perderá tu progreso actual sin guardar. ¿Deseas salir?")) return;
        stopExamTimer();
        activeExam.isActive = false;
      }
      currentStudentKey = null;
      teacherAuthenticated = false;
      document.getElementById("student-fullname").value = "";
      document.getElementById("teacher-pin").value = "";
      showView("view-login");
    });

    document.querySelectorAll("[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".tab-content").forEach(tc => tc.classList.add("hidden"));
        document.getElementById(btn.dataset.tab).classList.remove("hidden");
      });
    });

    document.getElementById("btn-prev-q").addEventListener("click", () => navigateQuestion(activeExam.currentIndex - 1));
    document.getElementById("btn-next-q").addEventListener("click", () => navigateQuestion(activeExam.currentIndex + 1));
    document.getElementById("chk-flag-question").addEventListener("change", (e) => {
      activeExam.flagged[activeExam.currentIndex] = e.target.checked;
      renderQuestionNavigator();
    });
    document.getElementById("btn-finish-exam-early").addEventListener("click", () => {
      const unanswered = activeExam.answers.filter(a => a === null).length;
      const msg = unanswered > 0
        ? `Aún tienes ${unanswered} pregunta(s) sin responder. Recuerda que este es un INTENTO ÚNICO. ¿Confirmas finalizar y calificar?`
        : "¿Confirmas que deseas finalizar y calificar tu evaluación ahora?";
      if (confirm(msg)) finalizeExam();
    });

    document.getElementById("btn-back-dashboard").addEventListener("click", () => { renderStudentDashboard(); showView("view-student-dashboard"); });
    document.getElementById("btn-close-cert").addEventListener("click", () => { renderStudentDashboard(); showView("view-student-dashboard"); });
    document.getElementById("btn-print-cert").addEventListener("click", () => window.print());

    document.querySelectorAll("[data-teacher-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-teacher-tab]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".teacher-tab-content").forEach(tc => tc.classList.add("hidden"));
        document.getElementById(btn.dataset.teacherTab).classList.remove("hidden");
      });
    });

    document.getElementById("form-manage-question").addEventListener("submit", handleSaveQuestionForm);
    document.getElementById("btn-cancel-edit-q").addEventListener("click", resetQuestionForm);
    document.getElementById("filter-topic-select").addEventListener("change", renderTeacherQuestionsList);
    document.getElementById("filter-level-select").addEventListener("change", renderTeacherQuestionsList);
    document.getElementById("btn-export-bank").addEventListener("click", exportQuestionBankJSON);
    document.getElementById("input-import-bank").addEventListener("change", importQuestionBankJSON);
    document.getElementById("form-change-pin").addEventListener("submit", handleChangeTeacherPin);
    document.getElementById("btn-close-modal").addEventListener("click", () => document.getElementById("modal-student-detail").classList.add("hidden"));
  }

  function handleStudentLogin(e) {
    e.preventDefault();
    const input = document.getElementById("student-fullname");
    const err = document.getElementById("student-login-error");
    const rawVal = input.value.trim();

    const words = rawVal.split(/\s+/).filter(w => w.length >= 2);
    if (words.length < 2) {
      err.classList.remove("hidden");
      input.focus();
      return;
    }
    err.classList.add("hidden");

    const key = normalizeStudentKey(rawVal);
    const displayName = formatDisplayName(rawVal);
    const isNewStudent = !studentsDB[key];

    if (isNewStudent) {
      studentsDB[key] = { key, displayName, registeredAt: new Date().toISOString(), attempts: {}, certificates: {} };
      saveStudents();
    }

    currentStudentKey = key;
    document.getElementById("header-user-badge").textContent = `Estudiante: ${studentsDB[key].displayName}`;

    syncWithAppsScript({
      action: isNewStudent ? "register_student" : "student_login",
      studentKey: key,
      studentName: displayName,
      registeredAt: studentsDB[key].registeredAt
    });

    renderStudentDashboard();
    showView("view-student-dashboard");
  }

  function renderStudentDashboard() {
    const student = studentsDB[currentStudentKey];
    if (!student) return;

    document.getElementById("dash-student-name").textContent = student.displayName;
    let completedLevels = 0, scoreSum = 0;

    OFFICIAL_TOPICS.forEach(topic => {
      ["basico", "medio", "dificil"].forEach(lvl => {
        const att = student.attempts[`topic_${topic.id}_${lvl}`];
        if (att) { completedLevels++; scoreSum += att.score1000; }
      });
    });

    const certsCount = Object.keys(student.certificates).length;
    const avgScore = completedLevels > 0 ? Math.round(scoreSum / completedLevels) : 0;

    document.getElementById("dash-levels-completed").textContent = `${completedLevels} / 33`;
    document.getElementById("dash-certs-count").textContent = `${certsCount} / 12`;
    document.getElementById("tab-cert-badge").textContent = certsCount;
    document.getElementById("dash-avg-score").textContent = `${avgScore} pts`;

    const grid1 = document.getElementById("grid-block-1");
    const grid2 = document.getElementById("grid-block-2");
    grid1.innerHTML = "";
    grid2.innerHTML = "";

    OFFICIAL_TOPICS.forEach(topic => {
      const card = buildTopicCard(topic, student);
      if (topic.block === 1) grid1.appendChild(card);
      else grid2.appendChild(card);
    });

    renderFinalChallengeCard(student);
    renderCertificatesGallery(student);
  }

  function buildTopicCard(topic, student) {
    const cert = student.certificates[`topic_${topic.id}`];
    const div = document.createElement("article");
    div.className = `topic-card ${cert ? "certified" : ""}`;

    let levelsHTML = "";
    ["basico", "medio", "dificil"].forEach(lvlKey => {
      const cfg = LEVEL_CONFIG[lvlKey];
      const attemptKey = `topic_${topic.id}_${lvlKey}`;
      const attempt = student.attempts[attemptKey];

      if (attempt) {
        levelsHTML += `
          <div class="level-row">
            <div class="level-info">
              <strong>${cfg.label} — <span class="text-emerald">Completado (${attempt.score1000} pts)</span></strong>
              <small>Aciertos: ${attempt.correct}/${attempt.total} · Intento único utilizado</small>
            </div>
            <button class="btn btn-outline btn-sm" data-review-attempt="${attemptKey}">Revisar</button>
          </div>`;
      } else {
        levelsHTML += `
          <div class="level-row">
            <div class="level-info">
              <strong>${cfg.label}</strong>
              <small>${cfg.ruleText}</small>
            </div>
            <button class="btn btn-primary btn-sm" data-start-topic="${topic.id}" data-start-level="${lvlKey}">Iniciar</button>
          </div>`;
      }
    });

    div.innerHTML = `
      <div>
        <div class="topic-card-header">
          <h4>${topic.id}. ${topic.title}</h4>
          ${cert ? '<span class="badge badge-emerald">Certificado</span>' : '<span class="badge badge-muted">En curso</span>'}
        </div>
        <div class="topic-card-body">
          <p class="topic-desc">${topic.description}</p>
          <div class="levels-list">${levelsHTML}</div>
        </div>
      </div>
      <div class="topic-card-footer">
        <small class="text-muted">${cert ? `Promedio tema: <strong>${cert.avgScore} pts</strong>` : "Completa los 3 niveles para certificar"}</small>
        ${cert ? `<button class="btn btn-gold btn-sm" data-open-cert="topic_${topic.id}">Ver Certificado</button>` : ""}
      </div>`;

    div.querySelectorAll("[data-start-topic]").forEach(btn => btn.addEventListener("click", () => startTopicExam(Number(btn.dataset.startTopic), btn.dataset.startLevel)));
    div.querySelectorAll("[data-review-attempt]").forEach(btn => btn.addEventListener("click", () => openStoredAttemptReview(btn.dataset.reviewAttempt)));
    const certBtn = div.querySelector("[data-open-cert]");
    if (certBtn) certBtn.addEventListener("click", () => openCertificateView(certBtn.dataset.openCert));

    return div;
  }

  function renderFinalChallengeCard(student) {
    const container = document.getElementById("final-challenge-container");
    const fcAttempt = student.attempts["final_challenge"];
    const fcCert = student.certificates["final_challenge"];

    if (fcAttempt) {
      container.innerHTML = `
        <div class="fc-info">
          <span class="badge badge-emerald">Simulacro Completado</span>
          <h3>Desafío Final — Simulacro General de Ingreso a la Universidad</h3>
          <p>Has completado el examen integrador de 70 preguntas. Calificación global obtenida: <strong>${fcAttempt.score1000} / 1000 puntos</strong> (${fcAttempt.correct}/70 aciertos).</p>
          <div class="fc-specs"><span>✓ Intento único registrado</span><span>✓ Certificación General Habilitada</span></div>
        </div>
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button id="btn-review-fc" class="btn btn-outline-light">Revisar Solucionario</button>
          ${fcCert ? '<button id="btn-cert-fc" class="btn btn-gold">Imprimir Certificado General</button>' : ""}
        </div>`;
      document.getElementById("btn-review-fc").addEventListener("click", () => openStoredAttemptReview("final_challenge"));
      if (fcCert) document.getElementById("btn-cert-fc").addEventListener("click", () => openCertificateView("final_challenge"));
    } else {
      container.innerHTML = `
        <div class="fc-info">
          <span class="badge badge-gold">Evaluación Integradora Oficial</span>
          <h3>Desafío Final — Simulacro General de Ingreso a la Universidad</h3>
          <p>Pon a prueba tus conocimientos en los 11 temas (Matemáticas, Lógica y Razonamiento Abstracto) bajo condiciones reales de examen de admisión.</p>
          <div class="fc-specs"><span>• 70 Preguntas Integradoras</span><span>• 75 Minutos (Cuenta Regresiva)</span><span>• 1 Único Intento Oficial</span></div>
        </div>
        <div><button id="btn-start-final-challenge" class="btn btn-gold">Iniciar Desafío Final (70 Preg.)</button></div>`;
      document.getElementById("btn-start-final-challenge").addEventListener("click", startFinalChallenge);
    }
  }

  function renderCertificatesGallery(student) {
    const gallery = document.getElementById("certificates-gallery");
    gallery.innerHTML = "";

    OFFICIAL_TOPICS.forEach(topic => {
      const certKey = `topic_${topic.id}`;
      const cert = student.certificates[certKey];
      const card = document.createElement("div");
      card.className = `cert-preview-card ${cert ? "" : "locked"}`;
      if (cert) {
        card.innerHTML = `
          <div><span class="badge badge-emerald">Obtenido</span><h4 style="margin-top:0.5rem; color:var(--navy);">${topic.id}. ${topic.title}</h4><p style="font-size:0.85rem; margin-top:0.35rem;">Promedio: <strong>${cert.avgScore} / 1000 pts</strong></p><small class="text-muted">Código: ${cert.code}</small></div>
          <button class="btn btn-gold btn-sm btn-block" data-cert-key="${certKey}">Descargar / Imprimir</button>`;
        card.querySelector("button").addEventListener("click", () => openCertificateView(certKey));
      } else {
        card.innerHTML = `<div><span class="badge badge-muted">Bloqueado</span><h4 style="margin-top:0.5rem; color:var(--text-muted);">${topic.id}. ${topic.title}</h4><p style="font-size:0.82rem; color:var(--text-muted); margin-top:0.35rem;">Completa los niveles Básico, Medio y Difícil para desbloquear.</p></div>`;
      }
      gallery.appendChild(card);
    });

    const fcCert = student.certificates["final_challenge"];
    const fcCard = document.createElement("div");
    fcCard.className = `cert-preview-card ${fcCert ? "" : "locked"}`;
    if (fcCert) {
      fcCard.innerHTML = `
        <div><span class="badge badge-gold">Certificación General</span><h4 style="margin-top:0.5rem; color:var(--navy);">Simulacro General de Ingreso (70 Preguntas)</h4><p style="font-size:0.85rem; margin-top:0.35rem;">Puntaje Global: <strong>${fcCert.avgScore} / 1000 pts</strong></p><small class="text-muted">Código: ${fcCert.code}</small></div>
        <button class="btn btn-gold btn-sm btn-block" data-cert-key="final_challenge">Descargar / Imprimir</button>`;
      fcCard.querySelector("button").addEventListener("click", () => openCertificateView("final_challenge"));
    } else {
      fcCard.innerHTML = `<div><span class="badge badge-muted">Bloqueado</span><h4 style="margin-top:0.5rem; color:var(--text-muted);">Certificado General de Simulacro Universitario</h4><p style="font-size:0.82rem; color:var(--text-muted); margin-top:0.35rem;">Rinde el Desafío Final de 70 preguntas para obtener este certificado.</p></div>`;
    }
    gallery.appendChild(fcCard);
  }

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function startTopicExam(topicId, levelKey) {
    const student = studentsDB[currentStudentKey];
    const attemptKey = `topic_${topicId}_${levelKey}`;
    if (student.attempts[attemptKey]) { alert("Ya has completado este nivel. Solo se permite un único intento por estudiante."); return; }

    const cfg = LEVEL_CONFIG[levelKey];
    const pool = questionBank.filter(q => q.topicId === topicId && q.level === levelKey);
    if (pool.length < cfg.count) { alert(`El banco actual tiene ${pool.length} preguntas para este nivel (se requieren ${cfg.count}). Contacta al docente.`); return; }

    const selectedQuestions = shuffleArray(pool).slice(0, cfg.count);
    const topicObj = OFFICIAL_TOPICS.find(t => t.id === topicId);

    setupAndLaunchExam({ mode: "topic", topicId, levelKey, title: `${topicObj.id}. ${topicObj.title}`, badgeLabel: cfg.label, questions: selectedQuestions, timeLimitSeconds: cfg.timeLimitSeconds });
  }

  function startFinalChallenge() {
    const student = studentsDB[currentStudentKey];
    if (student.attempts["final_challenge"]) { alert("Ya has rendido el Desafío Final. Solo se permite un único intento."); return; }

    const distribution = { 1: 7, 2: 6, 3: 7, 4: 6, 5: 7, 6: 6, 7: 6, 8: 7, 9: 6, 10: 6, 11: 6 };
    let selected = [];
    for (const [tIdStr, countNeeded] of Object.entries(distribution)) {
      const topicPool = shuffleArray(questionBank.filter(q => q.topicId === Number(tIdStr)));
      selected = selected.concat(topicPool.slice(0, countNeeded));
    }
    if (selected.length < 70) {
      const remaining = shuffleArray(questionBank.filter(q => !selected.some(s => s.id === q.id)));
      selected = selected.concat(remaining.slice(0, 70 - selected.length));
    }

    setupAndLaunchExam({ mode: "final", topicId: null, levelKey: "desafio_final", title: "Desafío Final — Simulacro General de Admisión", badgeLabel: "70 Preguntas · 75 Min", questions: shuffleArray(selected).slice(0, 70), timeLimitSeconds: LEVEL_CONFIG.desafio_final.timeLimitSeconds });
  }

  function setupAndLaunchExam({ mode, topicId, levelKey, title, badgeLabel, questions, timeLimitSeconds }) {
    const student = studentsDB[currentStudentKey];
    stopExamTimer();

    activeExam = {
      isActive: true, mode, topicId, levelKey, questions,
      answers: new Array(questions.length).fill(null),
      flagged: new Array(questions.length).fill(false),
      currentIndex: 0, timerInterval: null, secondsElapsed: 0, secondsRemaining: timeLimitSeconds, warningSoundPlayed: false
    };

    document.getElementById("exam-student-tag").textContent = student.displayName;
    document.getElementById("exam-topic-title").textContent = title;
    document.getElementById("exam-level-badge").textContent = badgeLabel;

    showView("view-exam-simulator");
    renderCurrentQuestion();
    renderQuestionNavigator();
    startExamTimer(timeLimitSeconds > 0);
  }

  function startExamTimer(isCountdown) {
    const timerBox = document.getElementById("exam-timer-box");
    const timerDisplay = document.getElementById("exam-timer-display");
    timerBox.classList.remove("warning", "critical");

    const updateDisplay = () => {
      const secs = isCountdown ? activeExam.secondsRemaining : activeExam.secondsElapsed;
      timerDisplay.textContent = formatSeconds(secs);
      if (isCountdown) {
        if (activeExam.mode === "final" && secs <= 600 && secs > 120) {
          timerBox.classList.add("warning");
          if (!activeExam.warningSoundPlayed) { playBeepAlert(); activeExam.warningSoundPlayed = true; }
        } else if (secs <= 120) {
          timerBox.classList.remove("warning");
          timerBox.classList.add("critical");
          if (!activeExam.warningSoundPlayed) { playBeepAlert(); activeExam.warningSoundPlayed = true; }
        }
      }
    };

    updateDisplay();
    activeExam.timerInterval = setInterval(() => {
      activeExam.secondsElapsed++;
      if (isCountdown) {
        activeExam.secondsRemaining--;
        if (activeExam.secondsRemaining <= 0) {
          activeExam.secondsRemaining = 0;
          updateDisplay();
          stopExamTimer();
          alert("¡Tiempo agotado! Tu examen se ha cerrado y calificado automáticamente.");
          finalizeExam();
          return;
        }
      }
      updateDisplay();
    }, 1000);
  }

  function stopExamTimer() { if (activeExam.timerInterval) { clearInterval(activeExam.timerInterval); activeExam.timerInterval = null; } }
  function formatSeconds(totalSeconds) { return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`; }

  function playBeepAlert() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(880, ctx.currentTime); gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  function renderCurrentQuestion() {
    const idx = activeExam.currentIndex, q = activeExam.questions[idx], total = activeExam.questions.length;
    document.getElementById("exam-progress-text").textContent = `Pregunta ${idx + 1} de ${total}`;
    document.getElementById("q-number-label").textContent = `Pregunta #${idx + 1}`;
    document.getElementById("chk-flag-question").checked = activeExam.flagged[idx];
    document.getElementById("q-statement").textContent = q.text;

    const svgBox = document.getElementById("q-svg-container");
    if (q.svg && q.svg.trim() !== "") { svgBox.innerHTML = q.svg; svgBox.classList.remove("hidden"); }
    else { svgBox.innerHTML = ""; svgBox.classList.add("hidden"); }

    const optsContainer = document.getElementById("q-options-list");
    optsContainer.innerHTML = "";
    const letters = ["A", "B", "C", "D"];

    q.options.forEach((optText, optIdx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `option-btn ${activeExam.answers[idx] === optIdx ? "selected" : ""}`;
      btn.innerHTML = `<span class="option-letter">${letters[optIdx]}</span><span>${optText}</span>`;
      btn.addEventListener("click", () => { activeExam.answers[idx] = optIdx; renderCurrentQuestion(); renderQuestionNavigator(); });
      optsContainer.appendChild(btn);
    });

    document.getElementById("btn-prev-q").disabled = idx === 0;
    document.getElementById("btn-next-q").disabled = idx === total - 1;
  }

  function navigateQuestion(newIdx) {
    if (newIdx < 0 || newIdx >= activeExam.questions.length) return;
    activeExam.currentIndex = newIdx;
    renderCurrentQuestion();
    renderQuestionNavigator();
  }

  function renderQuestionNavigator() {
    const grid = document.getElementById("question-grid-nav");
    grid.innerHTML = "";
    activeExam.questions.forEach((_, idx) => {
      const btn = document.createElement("button");
      btn.type = "button"; btn.textContent = idx + 1; btn.className = "q-nav-item";
      if (activeExam.flagged[idx]) btn.classList.add("flagged");
      else if (activeExam.answers[idx] !== null) btn.classList.add("answered");
      if (idx === activeExam.currentIndex) btn.classList.add("current");
      btn.addEventListener("click", () => navigateQuestion(idx));
      grid.appendChild(btn);
    });
  }

  function finalizeExam() {
    stopExamTimer();
    activeExam.isActive = false;

    const student = studentsDB[currentStudentKey];
    const total = activeExam.questions.length;
    let correct = 0;
    activeExam.questions.forEach((q, idx) => { if (activeExam.answers[idx] === q.correctIndex) correct++; });

    const score1000 = Math.round((correct / total) * 1000);
    const timeUsedStr = formatSeconds(activeExam.secondsElapsed);
    const nowDateStr = new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" });

    const attemptRecord = { score1000, correct, total, timeUsed: timeUsedStr, date: nowDateStr, questionsSnapshot: activeExam.questions, userAnswers: [...activeExam.answers] };
    let unlockedCertKey = null, attemptKey = "", certificateCreated = null;

    if (activeExam.mode === "topic") {
      attemptKey = `topic_${activeExam.topicId}_${activeExam.levelKey}`;
      student.attempts[attemptKey] = attemptRecord;

      const bAtt = student.attempts[`topic_${activeExam.topicId}_basico`];
      const mAtt = student.attempts[`topic_${activeExam.topicId}_medio`];
      const dAtt = student.attempts[`topic_${activeExam.topicId}_dificil`];

      if (bAtt && mAtt && dAtt && !student.certificates[`topic_${activeExam.topicId}`]) {
        const topicObj = OFFICIAL_TOPICS.find(t => t.id === activeExam.topicId);
        const avgTopicScore = Math.round((bAtt.score1000 + mAtt.score1000 + dAtt.score1000) / 3);
        const certKey = `topic_${activeExam.topicId}`;
        certificateCreated = { type: "topic", code: `PREU-T${activeExam.topicId}-${Date.now().toString().slice(-5)}`, date: nowDateStr, avgScore: avgTopicScore, title: `${topicObj.id}. ${topicObj.title}` };
        student.certificates[certKey] = certificateCreated;
        unlockedCertKey = certKey;
      }
    } else {
      attemptKey = "final_challenge";
      student.attempts[attemptKey] = attemptRecord;
      certificateCreated = { type: "final", code: `PREU-SIM70-${Date.now().toString().slice(-5)}`, date: nowDateStr, avgScore: score1000, title: "Simulacro General de Ingreso a la Universidad (70 Preguntas)" };
      student.certificates["final_challenge"] = certificateCreated;
      unlockedCertKey = "final_challenge";
    }

    saveStudents();

    syncWithAppsScript({
      action: "exam_completed",
      studentKey: student.key,
      studentName: student.displayName,
      attemptKey, mode: activeExam.mode, topicId: activeExam.topicId, levelKey: activeExam.levelKey,
      score1000, correct, total, timeUsed: timeUsedStr, date: nowDateStr, certificate: certificateCreated
    });

    renderResultsScreen(attemptRecord, activeExam.mode === "final", unlockedCertKey);
    showView("view-exam-results");
  }

  function openStoredAttemptReview(attemptKey) {
    const student = studentsDB[currentStudentKey];
    const record = student.attempts[attemptKey];
    if (!record) return;
    renderResultsScreen(record, attemptKey === "final_challenge", null);
    showView("view-exam-results");
  }

  function renderResultsScreen(record, isFinalChallenge, unlockedCertKey) {
    const student = studentsDB[currentStudentKey];
    document.getElementById("res-student-name").textContent = student.displayName;
    document.getElementById("res-score-1000").textContent = record.score1000;
    document.getElementById("res-correct-count").textContent = `${record.correct} de ${record.total}`;
    document.getElementById("res-wrong-count").textContent = `${record.total - record.correct}`;
    document.getElementById("res-time-used").textContent = record.timeUsed;

    const breakdownBox = document.getElementById("res-breakdown-box");
    const breakdownList = document.getElementById("res-breakdown-list");
    if (isFinalChallenge) {
      breakdownBox.classList.remove("hidden");
      breakdownList.innerHTML = "";
      OFFICIAL_TOPICS.forEach(t => {
        let tTotal = 0, tOk = 0;
        record.questionsSnapshot.forEach((q, idx) => { if (q.topicId === t.id) { tTotal++; if (record.userAnswers[idx] === q.correctIndex) tOk++; } });
        const item = document.createElement("div");
        item.className = "breakdown-item";
        item.innerHTML = `<span>${t.id}. ${t.title.substring(0, 26)}...</span><strong>${tOk}/${tTotal}</strong>`;
        breakdownList.appendChild(item);
      });
    } else {
      breakdownBox.classList.add("hidden");
    }

    const certBanner = document.getElementById("res-cert-unlocked-banner");
    if (unlockedCertKey) {
      certBanner.classList.remove("hidden");
      document.getElementById("btn-res-view-cert").onclick = () => openCertificateView(unlockedCertKey);
    } else {
      certBanner.classList.add("hidden");
    }

    const reviewList = document.getElementById("res-review-list");
    reviewList.innerHTML = "";
    const letters = ["A", "B", "C", "D"];

    record.questionsSnapshot.forEach((q, idx) => {
      const userAns = record.userAnswers[idx];
      const isCorrect = userAns === q.correctIndex;
      const card = document.createElement("div");
      card.className = `review-card ${isCorrect ? "correct" : "wrong"}`;
      const userAnsText = userAns !== null ? `${letters[userAns]}) ${q.options[userAns]}` : "Sin responder";
      const correctAnsText = `${letters[q.correctIndex]}) ${q.options[q.correctIndex]}`;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <strong>Pregunta #${idx + 1}</strong>
          <span class="badge ${isCorrect ? "badge-emerald" : "badge-muted"}">${isCorrect ? "✓ Correcta" : "✕ Incorrecta"}</span>
        </div>
        <p style="margin-bottom:0.6rem;">${q.text}</p>
        ${q.svg ? `<div class="question-svg-box">${q.svg}</div>` : ""}
        <p style="font-size:0.9rem;">Tu respuesta: <strong class="${isCorrect ? "text-emerald" : "text-crimson"}">${userAnsText}</strong></p>
        <p style="font-size:0.9rem;">Respuesta correcta: <strong class="text-emerald">${correctAnsText}</strong></p>
        <div class="review-explanation"><strong>Explicación:</strong> ${q.explanation}</div>`;
      reviewList.appendChild(card);
    });
  }

  function openCertificateView(certKey) {
    const student = studentsDB[currentStudentKey];
    const cert = student.certificates[certKey];
    if (!cert) return;

    document.getElementById("cert-student-name").textContent = student.displayName;
    document.getElementById("cert-topic-name").textContent = cert.title;
    document.getElementById("cert-score-val").textContent = `${cert.avgScore} / 1000 puntos`;
    document.getElementById("cert-date-val").textContent = cert.date;
    document.getElementById("cert-code-val").textContent = cert.code;

    if (cert.type === "final") {
      document.getElementById("cert-doc-title").textContent = "CERTIFICADO GENERAL DE SIMULACRO UNIVERSITARIO";
      document.getElementById("cert-body-text").textContent = "Por haber culminado satisfactoriamente el examen integrador de 70 reactivos evaluando las áreas de Matemáticas, Lógica y Razonamiento Abstracto:";
    } else {
      document.getElementById("cert-doc-title").textContent = "CERTIFICADO DE CULMINACIÓN ACADÉMICA";
      document.getElementById("cert-body-text").textContent = "Por haber culminado satisfactoriamente la práctica completa (niveles Básico, Medio y Difícil) del tema correspondiente:";
    }
    showView("view-certificate-print");
  }

  function handleTeacherLogin(e) {
    e.preventDefault();
    const pinInput = document.getElementById("teacher-pin");
    const err = document.getElementById("teacher-login-error");
    const savedPin = localStorage.getItem(STORAGE_KEYS.TEACHER_PIN) || "1234";

    if (pinInput.value.trim() !== savedPin) { err.classList.remove("hidden"); return; }
    err.classList.add("hidden");
    teacherAuthenticated = true;
    document.getElementById("header-user-badge").textContent = "Modo Docente: Profe Fernando";
    initTeacherDashboard();
    showView("view-teacher-dashboard");
  }

  function initTeacherDashboard() {
    const qSelect = document.getElementById("q-topic-select");
    const fSelect = document.getElementById("filter-topic-select");
    qSelect.innerHTML = "";
    fSelect.innerHTML = '<option value="all">Todos los temas (11)</option>';
    OFFICIAL_TOPICS.forEach(t => {
      qSelect.add(new Option(`${t.id}. ${t.title}`, t.id));
      fSelect.add(new Option(`${t.id}. ${t.title}`, t.id));
    });
    renderTeacherStudentsTable();
    renderTeacherQuestionsList();
  }

  function renderTeacherStudentsTable() {
    const tbody = document.getElementById("teacher-students-tbody");
    tbody.innerHTML = "";
    const studentsList = Object.values(studentsDB);
    if (studentsList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Aún no hay estudiantes registrados en este navegador.</td></tr>';
      return;
    }

    studentsList.forEach(st => {
      let lvls = 0, sum = 0;
      OFFICIAL_TOPICS.forEach(t => {
        ["basico", "medio", "dificil"].forEach(l => {
          const att = st.attempts[`topic_${t.id}_${l}`];
          if (att) { lvls++; sum += att.score1000; }
        });
      });
      const avg = lvls > 0 ? Math.round(sum / lvls) : 0;
      const certs = Object.keys(st.certificates).length;
      const fc = st.attempts["final_challenge"] ? `${st.attempts["final_challenge"].score1000} pts` : "Pendiente";

      const tr = document.createElement("tr");
      tr.innerHTML = `<td><strong>${st.displayName}</strong></td><td>${lvls} / 33</td><td>${avg} pts</td><td>${certs} / 12</td><td><strong>${fc}</strong></td><td><button class="btn btn-outline btn-sm">Gestionar Intentos</button></td>`;
      tr.querySelector("button").addEventListener("click", () => openManageStudentModal(st.key));
      tbody.appendChild(tr);
    });
  }

  function openManageStudentModal(studentKey) {
    const st = studentsDB[studentKey];
    if (!st) return;
    document.getElementById("modal-st-name").textContent = `Gestión de Intentos: ${st.displayName}`;
    const list = document.getElementById("modal-st-attempts-list");
    list.innerHTML = "";

    const attemptEntries = Object.entries(st.attempts);
    if (attemptEntries.length === 0) {
      list.innerHTML = '<p class="text-muted">Este estudiante aún no ha consumido ningún intento.</p>';
    } else {
      attemptEntries.forEach(([attKey, record]) => {
        const row = document.createElement("div");
        row.className = "modal-attempt-row";
        row.innerHTML = `<div><strong>${attKey}</strong><small style="display:block; color:var(--text-muted);">Puntaje: ${record.score1000} pts · Fecha: ${record.date}</small></div><button class="btn btn-danger btn-sm">Habilitar Nuevo Intento</button>`;
        row.querySelector("button").addEventListener("click", () => {
          if (confirm(`¿Deseas reiniciar el intento "${attKey}" para ${st.displayName}?`)) {
            delete st.attempts[attKey];
            if (attKey.startsWith("topic_")) delete st.certificates[`topic_${attKey.split("_")[1]}`];
            else if (attKey === "final_challenge") delete st.certificates["final_challenge"];
            saveStudents();
            syncWithAppsScript({ action: "reset_attempt", studentKey: st.key, studentName: st.displayName, attemptKey: attKey });
            openManageStudentModal(studentKey);
            renderTeacherStudentsTable();
          }
        });
        list.appendChild(row);
      });
    }
    document.getElementById("modal-student-detail").classList.remove("hidden");
  }

  function renderTeacherQuestionsList() {
    document.getElementById("total-q-count").textContent = questionBank.length;
    const topicFilter = document.getElementById("filter-topic-select").value;
    const levelFilter = document.getElementById("filter-level-select").value;
    const container = document.getElementById("teacher-questions-list");
    container.innerHTML = "";

    const filtered = questionBank.filter(q => (topicFilter === "all" || q.topicId === Number(topicFilter)) && (levelFilter === "all" || q.level === levelFilter));
    filtered.slice(0, 60).forEach(q => {
      const item = document.createElement("div");
      item.className = "t-q-item";
      item.innerHTML = `<div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--steel); font-weight:700;"><span>Tema ${q.topicId} · Nivel: ${q.level.toUpperCase()}</span><span>ID: ${q.id}</span></div><p style="font-size:0.88rem; margin:0.35rem 0;">${q.text}</p><div class="t-q-item-actions"><button class="btn btn-outline btn-sm btn-edit-q">Editar</button><button class="btn btn-danger btn-sm btn-del-q">Eliminar</button></div>`;
      item.querySelector(".btn-edit-q").addEventListener("click", () => loadQuestionIntoForm(q));
      item.querySelector(".btn-del-q").addEventListener("click", () => {
        if (confirm("¿Eliminar permanentemente esta pregunta del banco?")) {
          questionBank = questionBank.filter(itemQ => itemQ.id !== q.id);
          saveQuestions();
          renderTeacherQuestionsList();
        }
      });
      container.appendChild(item);
    });
  }

  function loadQuestionIntoForm(q) {
    document.getElementById("q-form-title").textContent = `Editando Pregunta (${q.id})`;
    document.getElementById("edit-q-id").value = q.id;
    document.getElementById("q-topic-select").value = q.topicId;
    document.getElementById("q-level-select").value = q.level;
    document.getElementById("q-text-input").value = q.text;
    document.getElementById("q-svg-input").value = q.svg || "";
    document.getElementById("q-opt-0").value = q.options[0];
    document.getElementById("q-opt-1").value = q.options[1];
    document.getElementById("q-opt-2").value = q.options[2];
    document.getElementById("q-opt-3").value = q.options[3];
    document.getElementById("q-correct-select").value = q.correctIndex;
    document.getElementById("q-explanation-input").value = q.explanation;
    document.getElementById("btn-cancel-edit-q").classList.remove("hidden");
  }

  function resetQuestionForm() {
    document.getElementById("form-manage-question").reset();
    document.getElementById("edit-q-id").value = "";
    document.getElementById("q-form-title").textContent = "Agregar Nueva Pregunta";
    document.getElementById("btn-cancel-edit-q").classList.add("hidden");
  }

  function handleSaveQuestionForm(e) {
    e.preventDefault();
    const editId = document.getElementById("edit-q-id").value;
    const qData = {
      id: editId || `Q-CUSTOM-${Date.now()}`,
      topicId: Number(document.getElementById("q-topic-select").value),
      level: document.getElementById("q-level-select").value,
      text: document.getElementById("q-text-input").value.trim(),
      svg: document.getElementById("q-svg-input").value.trim(),
      options: [document.getElementById("q-opt-0").value.trim(), document.getElementById("q-opt-1").value.trim(), document.getElementById("q-opt-2").value.trim(), document.getElementById("q-opt-3").value.trim()],
      correctIndex: Number(document.getElementById("q-correct-select").value),
      explanation: document.getElementById("q-explanation-input").value.trim()
    };

    if (editId) {
      const idx = questionBank.findIndex(item => item.id === editId);
      if (idx !== -1) questionBank[idx] = qData;
    } else {
      questionBank.unshift(qData);
    }

    saveQuestions(); resetQuestionForm(); renderTeacherQuestionsList();
    alert("Pregunta guardada correctamente en el banco.");
  }

  function exportQuestionBankJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questionBank, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `banco-profe-fernando-preu-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a); a.click(); a.remove();
  }

  function importQuestionBankJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported) || imported.length === 0) throw new Error("Formato inválido");
        questionBank = imported;
        saveQuestions(); renderTeacherQuestionsList();
        alert(`Se importaron ${imported.length} preguntas correctamente.`);
      } catch (err) { alert("El archivo JSON seleccionado no tiene un formato válido."); }
    };
    reader.readAsText(file);
  }

  function handleChangeTeacherPin(e) {
    e.preventDefault();
    const newPin = document.getElementById("new-teacher-pin").value.trim();
    if (newPin.length < 4) return;
    localStorage.setItem(STORAGE_KEYS.TEACHER_PIN, newPin);
    document.getElementById("new-teacher-pin").value = "";
    alert("PIN docente actualizado correctamente.");
  }
})();