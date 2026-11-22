/**
 * PROFE FERNANDO PRE-U
 * Banco Oficial de Temas y Reactivos (Matemáticas, Lógica y Razonamiento Abstracto con SVG)
 */

const OFFICIAL_TOPICS = [
  { id: 1, block: 1, title: "Teoría de Conjuntos y Diagramas de Venn", description: "Operaciones (∪, ∩, −, △, Aᶜ), regiones sombreadas en diagramas de Venn SVG y problemas de encuestas." },
  { id: 2, block: 1, title: "Lógica Proposicional y Tablas de Verdad", description: "Conectores lógicos (¬, ∧, ∨, →, ↔), valores de verdad, tautologías, contradicciones y equivalencias." },
  { id: 3, block: 1, title: "Ecuaciones, Despeje de Variables e Inecuaciones", description: "Despeje de x en ecuaciones lineales/cuadráticas, sistemas 2×2 e intervalos en recta numérica SVG." },
  { id: 4, block: 1, title: "Funciones y su Representación Gráfica", description: "Dominio, rango, evaluación e interpretación en plano cartesiano SVG (lineal, cuadrática, exponencial, logarítmica)." },
  { id: 5, block: 1, title: "Razones, Proporciones y Porcentajes", description: "Regla de tres simple y compuesta, variaciones porcentuales, descuentos sucesivos y repartos proporcionales." },
  { id: 6, block: 1, title: "Estadística Básica y Probabilidad", description: "Media, mediana, moda, interpretación de gráficos estadísticos SVG (barras y circulares) y probabilidad simple." },
  { id: 7, block: 1, title: "Geometría: Áreas, Volúmenes y Circunferencia", description: "Perímetros, áreas sombreadas, círculos (radio/diámetro) y volúmenes de sólidos con figuras SVG acotadas." },
  { id: 8, block: 2, title: "Secuencias Gráficas y Patrones de Giro", description: "Series visuales en SVG analizando rotaciones horarias/antihorarias, traslaciones y alternancia de elementos." },
  { id: 9, block: 2, title: "Matrices Gráficas (Cuadrículas 3 × 3)", description: "Tablas 3×3 en SVG con incógnita (?) para deducir reglas lógicas por filas o columnas (superposición, resta, giros)." },
  { id: 10, block: 2, title: "Analogías y Exclusión de Figuras", description: "Relaciones visuales 'A es a B como C es a...' e identificación de figura discordante mediante gráficos SVG." },
  { id: 11, block: 2, title: "Razonamiento Espacial y Vistas de Sólidos", description: "Plantillas desplegadas de cubos (redes de 6 caras en SVG), conteo de bloques 3D y vistas ortogonales." }
];

const SVG_BUILDERS = {
  vennUnion: () => `<svg viewBox="0 0 260 150" width="260" height="150"><rect x="5" y="5" width="250" height="140" fill="#F4F6F9" stroke="#0F2942" stroke-width="2"/><text x="15" y="24" font-size="13" font-weight="bold" fill="#0F2942">U</text><circle cx="105" cy="78" r="45" fill="#1E4E79" fill-opacity="0.75" stroke="#0F2942" stroke-width="2"/><circle cx="155" cy="78" r="45" fill="#1E4E79" fill-opacity="0.75" stroke="#0F2942" stroke-width="2"/><text x="78" y="82" font-size="14" font-weight="bold" fill="#FFFFFF">A</text><text x="172" y="82" font-size="14" font-weight="bold" fill="#FFFFFF">B</text></svg>`,
  vennDiff: () => `<svg viewBox="0 0 260 150" width="260" height="150"><rect x="5" y="5" width="250" height="140" fill="#F4F6F9" stroke="#0F2942" stroke-width="2"/><circle cx="105" cy="78" r="45" fill="#B48327" stroke="#0F2942" stroke-width="2"/><circle cx="155" cy="78" r="45" fill="#FFFFFF" stroke="#0F2942" stroke-width="2"/><circle cx="105" cy="78" r="45" fill="none" stroke="#0F2942" stroke-width="2"/><text x="76" y="82" font-size="14" font-weight="bold" fill="#FFFFFF">A</text><text x="168" y="82" font-size="14" font-weight="bold" fill="#0F2942">B</text></svg>`,
  numberLine: (a, b, openA, openB) => `<svg viewBox="0 0 320 80" width="320" height="80"><line x1="20" y1="45" x2="300" y2="45" stroke="#0F2942" stroke-width="2"/><polygon points="300,45 292,40 292,50" fill="#0F2942"/><polygon points="20,45 28,40 28,50" fill="#0F2942"/><line x1="95" y1="30" x2="225" y2="30" stroke="#1E4E79" stroke-width="5"/><line x1="95" y1="30" x2="95" y2="45" stroke="#1E4E79" stroke-width="2"/><line x1="225" y1="30" x2="225" y2="45" stroke="#1E4E79" stroke-width="2"/><circle cx="95" cy="30" r="6" fill="${openA ? '#FFFFFF' : '#1E4E79'}" stroke="#1E4E79" stroke-width="2.5"/><circle cx="225" cy="30" r="6" fill="${openB ? '#FFFFFF' : '#1E4E79'}" stroke="#1E4E79" stroke-width="2.5"/><text x="95" y="66" font-size="13" font-weight="bold" text-anchor="middle" fill="#0F2942">${a}</text><text x="225" y="66" font-size="13" font-weight="bold" text-anchor="middle" fill="#0F2942">${b}</text></svg>`,
  parabola: (vx, vy) => `<svg viewBox="0 0 220 180" width="220" height="180"><rect width="220" height="180" fill="#FFFFFF" stroke="#D1D9E2"/><line x1="20" y1="120" x2="200" y2="120" stroke="#0F2942" stroke-width="1.5"/><line x1="90" y1="15" x2="90" y2="165" stroke="#0F2942" stroke-width="1.5"/><path d="M 65 25 Q 115 160 165 25" fill="none" stroke="#1E4E79" stroke-width="3"/><circle cx="115" cy="92" r="4.5" fill="#DC3545"/><text x="122" y="106" font-size="12" font-weight="bold" fill="#0F2942">V(${vx}, ${vy})</text></svg>`,
  barChart: (vals) => `<svg viewBox="0 0 280 160" width="280" height="160"><line x1="35" y1="130" x2="260" y2="130" stroke="#0F2942" stroke-width="2"/><line x1="35" y1="20" x2="35" y2="130" stroke="#0F2942" stroke-width="2"/><rect x="55" y="${130 - vals[0]*2}" width="32" height="${vals[0]*2}" fill="#1E4E79"/><text x="71" y="${125 - vals[0]*2}" font-size="11" font-weight="bold" text-anchor="middle">${vals[0]}</text><text x="71" y="146" font-size="11" text-anchor="middle">A</text><rect x="108" y="${130 - vals[1]*2}" width="32" height="${vals[1]*2}" fill="#B48327"/><text x="124" y="${125 - vals[1]*2}" font-size="11" font-weight="bold" text-anchor="middle">${vals[1]}</text><text x="124" y="146" font-size="11" text-anchor="middle">B</text><rect x="161" y="${130 - vals[2]*2}" width="32" height="${vals[2]*2}" fill="#0F2942"/><text x="177" y="${125 - vals[2]*2}" font-size="11" font-weight="bold" text-anchor="middle">${vals[2]}</text><text x="177" y="146" font-size="11" text-anchor="middle">C</text><rect x="214" y="${130 - vals[3]*2}" width="32" height="${vals[3]*2}" fill="#198754"/><text x="230" y="${125 - vals[3]*2}" font-size="11" font-weight="bold" text-anchor="middle">${vals[3]}</text><text x="230" y="146" font-size="11" text-anchor="middle">D</text></svg>`,
  circleRadius: (r) => `<svg viewBox="0 0 200 160" width="200" height="160"><circle cx="100" cy="80" r="58" fill="#EBF4FF" stroke="#0F2942" stroke-width="2.5"/><circle cx="100" cy="80" r="3.5" fill="#0F2942"/><line x1="100" y1="80" x2="158" y2="80" stroke="#DC3545" stroke-width="2.5"/><text x="129" y="72" font-size="13" font-weight="bold" text-anchor="middle" fill="#DC3545">r = ${r} cm</text></svg>`,
  rotationSeq: (deg1, deg2, deg3) => `<svg viewBox="0 0 340 95" width="340" height="95"><g transform="translate(15,10)"><rect width="70" height="70" fill="#FFFFFF" stroke="#0F2942" stroke-width="2"/><g transform="translate(35,35) rotate(${deg1})"><line x1="0" y1="0" x2="0" y2="-26" stroke="#1E4E79" stroke-width="4"/><circle cx="0" cy="-26" r="5" fill="#B48327"/></g></g><g transform="translate(100,10)"><rect width="70" height="70" fill="#FFFFFF" stroke="#0F2942" stroke-width="2"/><g transform="translate(35,35) rotate(${deg2})"><line x1="0" y1="0" x2="0" y2="-26" stroke="#1E4E79" stroke-width="4"/><circle cx="0" cy="-26" r="5" fill="#B48327"/></g></g><g transform="translate(185,10)"><rect width="70" height="70" fill="#FFFFFF" stroke="#0F2942" stroke-width="2"/><g transform="translate(35,35) rotate(${deg3})"><line x1="0" y1="0" x2="0" y2="-26" stroke="#1E4E79" stroke-width="4"/><circle cx="0" cy="-26" r="5" fill="#B48327"/></g></g><g transform="translate(270,10)"><rect width="60" height="70" fill="#F4F6F9" stroke="#B48327" stroke-width="2" stroke-dasharray="4"/><text x="30" y="43" font-size="24" font-weight="bold" text-anchor="middle" fill="#0F2942">?</text></g></svg>`,
  matrix3x3: () => `<svg viewBox="0 0 210 210" width="210" height="210"><rect x="5" y="5" width="200" height="200" fill="#FFFFFF" stroke="#0F2942" stroke-width="2.5"/><line x1="71" y1="5" x2="71" y2="205" stroke="#0F2942" stroke-width="2"/><line x1="138" y1="5" x2="138" y2="205" stroke="#0F2942" stroke-width="2"/><line x1="5" y1="71" x2="205" y2="71" stroke="#0F2942" stroke-width="2"/><line x1="5" y1="138" x2="205" y2="138" stroke="#0F2942" stroke-width="2"/><line x1="20" y1="38" x2="56" y2="38" stroke="#1E4E79" stroke-width="4"/><line x1="105" y1="20" x2="105" y2="56" stroke="#1E4E79" stroke-width="4"/><line x1="154" y1="38" x2="190" y2="38" stroke="#1E4E79" stroke-width="4"/><line x1="172" y1="20" x2="172" y2="56" stroke="#1E4E79" stroke-width="4"/><circle cx="38" cy="105" r="16" fill="none" stroke="#1E4E79" stroke-width="3"/><circle cx="105" cy="105" r="5" fill="#B48327"/><circle cx="172" cy="105" r="16" fill="none" stroke="#1E4E79" stroke-width="3"/><circle cx="172" cy="105" r="5" fill="#B48327"/><rect x="23" y="156" width="30" height="30" fill="none" stroke="#1E4E79" stroke-width="3"/><line x1="90" y1="186" x2="120" y2="156" stroke="#B48327" stroke-width="3"/><text x="172" y="180" font-size="26" font-weight="bold" text-anchor="middle" fill="#DC3545">?</text></svg>`,
  cubeNet: () => `<svg viewBox="0 0 240 180" width="240" height="180"><rect x="70" y="10" width="45" height="45" fill="#FFFFFF" stroke="#0F2942" stroke-width="2"/><text x="92" y="38" font-size="16" font-weight="bold" text-anchor="middle" fill="#1E4E79">▲</text><rect x="25" y="55" width="45" height="45" fill="#FFFFFF" stroke="#0F2942" stroke-width="2"/><text x="47" y="83" font-size="16" font-weight="bold" text-anchor="middle" fill="#B48327">●</text><rect x="70" y="55" width="45" height="45" fill="#EBF4FF" stroke="#0F2942" stroke-width="2"/><text x="92" y="83" font-size="16" font-weight="bold" text-anchor="middle" fill="#0F2942">★</text><rect x="115" y="55" width="45" height="45" fill="#FFFFFF" stroke="#0F2942" stroke-width="2"/><text x="137" y="83" font-size="16" font-weight="bold" text-anchor="middle" fill="#198754">■</text><rect x="160" y="55" width="45" height="45" fill="#FFFFFF" stroke="#0F2942" stroke-width="2"/><text x="182" y="83" font-size="16" font-weight="bold" text-anchor="middle" fill="#DC3545">✖</text><rect x="70" y="100" width="45" height="45" fill="#FFFFFF" stroke="#0F2942" stroke-width="2"/><text x="92" y="128" font-size="16" font-weight="bold" text-anchor="middle" fill="#0F2942">◆</text></svg>`
};

function buildInitialQuestionBank() {
  const bank = [];
  let idCounter = 1;
  const addQ = (topicId, level, text, svg, options, correctIndex, explanation) => {
    bank.push({ id: `Q-${idCounter++}`, topicId, level, text, svg: svg || "", options, correctIndex, explanation });
  };

  // TEMA 1
  addQ(1, "basico", "Identifica la operación de conjuntos que representa la región sombreada en el diagrama de Venn:", SVG_BUILDERS.vennUnion(), ["A ∩ B", "A ∪ B", "A − B", "B − A"], 1, "Están sombreados todos los elementos que pertenecen tanto a A como a B (A ∪ B).");
  addQ(1, "basico", "En el siguiente diagrama de Venn, la región sombreada exclusivamente en dorado corresponde a:", SVG_BUILDERS.vennDiff(), ["A − B (Solo A)", "B − A (Solo B)", "A ∩ B", "(A ∪ B)ᶜ"], 0, "La zona pintada abarca los elementos de A excluyendo B (A − B).");
  addQ(1, "basico", "Si U = {1, 2, 3, 4, 5, 6} y A = {2, 4, 6}, ¿cuál es el conjunto complemento Aᶜ?", "", ["{1, 3, 5}", "{2, 4, 6}", "{1, 2, 3}", "∅"], 0, "El complemento Aᶜ contiene los elementos de U que no están en A: {1, 3, 5}.");
  addQ(1, "basico", "Dados M = {a, b, c, d} y N = {c, d, e, f}, determina M ∩ N:", "", ["{a, b}", "{e, f}", "{c, d}", "{a, b, c, d, e, f}"], 2, "La intersección M ∩ N agrupa los elementos comunes: {c, d}.");
  addQ(1, "basico", "¿Cuántos subconjuntos propios tiene un conjunto de 3 elementos?", "", ["8", "7", "6", "9"], 1, "2³ − 1 = 7 subconjuntos propios.");
  for (let i = 1; i <= 10; i++) {
    const total = 40 + i * 5, mat = 25 + i * 2, fis = 20 + i * 2, ambos = mat + fis - total;
    addQ(1, "medio", `[Encuesta #${i}] De ${total} postulantes, ${mat} estudian Matemática y ${fis} estudian Física. Si todos estudian al menos una materia, ¿cuántos estudian ambas?`, "", [`${ambos}`, `${ambos + 3}`, `${Math.max(1, ambos - 2)}`, `${total - ambos}`], 0, `|M ∩ F| = ${mat} + ${fis} − ${total} = ${ambos}.`);
  }
  for (let i = 1; i <= 20; i++) {
    const a = i + 2, b = i + 5;
    addQ(1, "dificil", `[Nivel Admisión #${i}] Si n(A) = ${a + 4}, n(B) = ${b + 3} y n(A ∩ B) = 4, calcula n(A △ B):`, "", [`${a + b - 1}`, `${a + b + 3}`, `${a + b + 7}`, `${a + b - 4}`], 0, `n(A △ B) = (${a + 4} + ${b + 3} − 4) − 4 = ${a + b - 1}.`);
  }

  // TEMA 2
  addQ(2, "basico", "Si p es Verdadera (V) y q es Falsa (F), ¿cuál es el valor de verdad de (p → q)?", "", ["Verdadero (V)", "Falso (F)", "Indeterminado", "Tautología"], 1, "En la implicación p → q, V → F es Falso.");
  addQ(2, "basico", "¿Cuál es la negación lógica de: 'Todos los estudiantes aprobaron'?", "", ["Ningún estudiante aprobó", "Algunos estudiantes no aprobaron", "Todos reprobaron", "Pocos aprobaron"], 1, "La negación de 'Todos P' es 'Algunos no P'.");
  addQ(2, "basico", "La proposición (p ∨ ¬p) se clasifica siempre como:", "", ["Contradicción", "Contingencia", "Tautología", "Falacia"], 2, "Siempre es verdadera (Tautología).");
  addQ(2, "basico", "¿Qué conector es verdadero únicamente cuando ambas proposiciones tienen el mismo valor de verdad?", "", ["Conjunción (∧)", "Disyunción (∨)", "Bicondicional (↔)", "Condicional (→)"], 2, "El bicondicional (p ↔ q).");
  addQ(2, "basico", "Si ¬(p ∧ q) es Falso, se deduce que:", "", ["p = F, q = F", "p = V, q = V", "p = V, q = F", "p = F, q = V"], 1, "p ∧ q es Verdadera, por tanto p = V y q = V.");
  for (let i = 1; i <= 10; i++) {
    addQ(2, "medio", `[Equivalencia #${i}] Según De Morgan, ¬(p ∨ ¬q) equivale a:`, "", ["¬p ∧ q", "¬p ∨ q", "p ∧ ¬q", "¬p ∧ ¬q"], 0, "¬(p ∨ ¬q) ≡ ¬p ∧ q.");
  }
  for (let i = 1; i <= 20; i++) {
    addQ(2, "dificil", `[Inferencia #${i}] Si [(p → q) ∧ ¬q] es Verdadero, determina p y q:`, "", ["p = F, q = F", "p = V, q = F", "p = F, q = V", "p = V, q = V"], 0, "Por Modus Tollens, p = F y q = F.");
  }

  // TEMA 3
  addQ(3, "basico", "Observa el intervalo graficado en la recta numérica SVG. ¿A qué inecuación corresponde?", SVG_BUILDERS.numberLine(-2, 5, false, true), ["−2 ≤ x < 5", "−2 < x ≤ 5", "−2 < x < 5", "−2 ≤ x ≤ 5"], 0, "Cerrado en −2 (≤) y abierto en 5 (<).");
  addQ(3, "basico", "Resuelve: 3(x − 2) + 4 = 19", "", ["x = 5", "x = 7", "x = 6", "x = 4"], 1, "3x − 2 = 19 → x = 7.");
  addQ(3, "basico", "Despeja 't' en: d = v · t + d₀", "", ["t = (d − d₀) / v", "t = (d + d₀) / v", "t = d / v − d₀", "t = v / (d − d₀)"], 0, "t = (d − d₀) / v.");
  addQ(3, "basico", "Halla la suma de raíces de: x² − 7x + 12 = 0", "", ["12", "−7", "7", "5"], 2, "−b/a = 7.");
  addQ(3, "basico", "Conjunto solución de 2x − 5 > 9:", "", ["x > 2", "x > 7", "x < 7", "x ≥ 7"], 1, "2x > 14 → x > 7.");
  for (let i = 1; i <= 10; i++) {
    const x = i + 2, y = i, s = x + y, d = x - y;
    addQ(3, "medio", `[Sistema 2×2 #${i}] Si x + y = ${s} y x − y = ${d}, halla (2x + y):`, "", [`${2 * x + y}`, `${2 * y + x}`, `${x + y + 2}`, `${2 * x - y}`], 0, `x = ${x}, y = ${y} → 2x + y = ${2 * x + y}.`);
  }
  for (let i = 1; i <= 20; i++) {
    const r1 = i, r2 = i + 3;
    addQ(3, "dificil", `[Cuadrática #${i}] Halla la raíz mayor de x² − ${r1 + r2}x + ${r1 * r2} = 0:`, "", [`${r2}`, `${r1}`, `${r2 + 1}`, `${r1 + r2}`], 0, `Raíces ${r1} y ${r2}; la mayor es ${r2}.`);
  }

  // TEMA 4
  addQ(4, "basico", "Observa la parábola en SVG con vértice V(2, −3). ¿Cuál es el rango?", SVG_BUILDERS.parabola(2, -3), ["[−3, +∞)", "(−∞, −3]", "[2, +∞)", "(−∞, +∞)"], 0, "Rango: [−3, +∞).");
  addQ(4, "basico", "Dada f(x) = 4x − 5, calcula f(3) + f(0):", "", ["2", "7", "12", "−5"], 0, "7 + (−5) = 2.");
  addQ(4, "basico", "Dominio real de f(x) = (x + 1) / (x − 4):", "", ["ℝ − {4}", "ℝ − {−1}", "ℝ − {0}", "[4, +∞)"], 0, "x ≠ 4.");
  addQ(4, "basico", "Si f(x) = 2ˣ, ¿cuál es x cuando f(x) = 32?", "", ["4", "5", "6", "16"], 1, "2⁵ = 32 → x = 5.");
  addQ(4, "basico", "Calcula log₃(81):", "", ["3", "4", "9", "27"], 1, "3⁴ = 81.");
  for (let i = 1; i <= 10; i++) {
    const h = i + 1, k = i * 2;
    addQ(4, "medio", `[Función Cuadrática #${i}] Ordenada del vértice de f(x) = (x − ${h})² + ${k}:`, "", [`${k}`, `${h}`, `${-k}`, `${h + k}`], 0, `Vértice (${h}, ${k}), ordenada = ${k}.`);
  }
  for (let i = 1; i <= 20; i++) {
    const a = i + 2;
    addQ(4, "dificil", `[Dominio Radical #${i}] Dominio de f(x) = √(3x − ${3 * a}):`, "", [`[${a}, +∞)`, `(${a}, +∞)`, `(−∞, ${a}]`, `[${3 * a}, +∞)`], 0, `3x ≥ ${3 * a} → x ≥ ${a}.`);
  }

  // TEMA 5
  addQ(5, "basico", "Un artículo cuesta $80 con 25% de descuento. ¿Cuánto se paga?", "", ["$60", "$55", "$65", "$75"], 0, "80 − 20 = $60.");
  addQ(5, "basico", "Si 6 obreros hacen un muro en 10 días, ¿cuántos días tardan 12 obreros?", "", ["20 días", "5 días", "8 días", "6 días"], 1, "60 / 12 = 5 días.");
  addQ(5, "basico", "Edades de Ana y Luis en razón 3 : 5 y suman 40 años. Edad de Luis:", "", ["15 años", "25 años", "24 años", "30 años"], 1, "5 × 5 = 25 años.");
  addQ(5, "basico", "Descuento único equivalente a 10% y 20% sucesivos:", "", ["30%", "28%", "25%", "32%"], 1, "1 − 0.72 = 28%.");
  addQ(5, "basico", "En un aula de 50 alumnos, 18 son varones. Porcentaje de mujeres:", "", ["36%", "64%", "32%", "68%"], 1, "32/50 = 64%.");
  for (let i = 1; i <= 10; i++) {
    const base = 100 + i * 20, finalPrice = Math.round(base * 1.15);
    addQ(5, "medio", `[IVA #${i}] Precio base $${base} más 15% de impuesto:`, "", [`$${finalPrice}`, `$${base + 15}`, `$${finalPrice + 10}`, `$${base - 15}`], 0, `$${base} × 1.15 = $${finalPrice}.`);
  }
  for (let i = 1; i <= 20; i++) {
    const k = i + 4, total = 10 * k;
    addQ(5, "dificil", `[Reparto #${i}] Repartir $${total} proporcional a 2, 3 y 5. Parte mayor:`, "", [`$${5 * k}`, `$${3 * k}`, `$${2 * k}`, `$${4 * k}`], 0, `5 × ${k} = $${5 * k}.`);
  }

  // TEMA 6
  addQ(6, "basico", "Según el gráfico de barras SVG, ¿cuál es la media de A, B, C y D?", SVG_BUILDERS.barChart([20, 30, 40, 30]), ["30", "25", "35", "40"], 0, "120 / 4 = 30.");
  addQ(6, "basico", "Mediana de {14, 18, 12, 20, 16}:", "", ["12", "16", "18", "15"], 1, "Valor central ordenado: 16.");
  addQ(6, "basico", "Probabilidad de obtener un número primo al lanzar un dado:", "", ["1/2", "1/3", "2/3", "1/6"], 0, "{2, 3, 5} → 3/6 = 1/2.");
  addQ(6, "basico", "Urna con 4 rojas y 6 azules. Probabilidad de extraer roja:", "", ["0.40", "0.60", "0.25", "0.50"], 0, "4/10 = 0.40.");
  addQ(6, "basico", "Moda de {7, 9, 5, 9, 8, 7, 9, 6}:", "", ["7", "8", "9", "7.5"], 2, "El 9 aparece 3 veces.");
  for (let i = 1; i <= 10; i++) {
    const m = 12 + i;
    addQ(6, "medio", `[Promedio #${i}] Promedio de 4 notas es ${m}. Si la quinta nota es ${m + 5}, nuevo promedio:`, "", [`${m + 1}`, `${m + 2}`, `${m + 2.5}`, `${m}`], 0, `Nuevo promedio = ${m + 1}.`);
  }
  for (let i = 1; i <= 20; i++) {
    const blancas = i + 2, negras = i + 6, tot = blancas + negras;
    addQ(6, "dificil", `[Probabilidad #${i}] Caja con ${blancas} blancas y ${negras} negras. Probabilidad de NO sacar blanca:`, "", [`${negras}/${tot}`, `${blancas}/${tot}`, `1/${tot}`, `${negras}/${blancas}`], 0, `${negras}/${tot}.`);
  }

  // TEMA 7
  addQ(7, "basico", "Calcula el área del círculo mostrado en SVG:", SVG_BUILDERS.circleRadius(6), ["12π cm²", "36π cm²", "6π cm²", "24π cm²"], 1, "π · 6² = 36π cm².");
  addQ(7, "basico", "Volumen de cilindro con r = 3 cm y h = 10 cm:", "", ["30π cm³", "90π cm³", "60π cm³", "45π cm³"], 1, "π · 9 · 10 = 90π cm³.");
  addQ(7, "basico", "Longitud de circunferencia de diámetro 14 cm:", "", ["7π cm", "14π cm", "49π cm", "28π cm"], 1, "L = 14π cm.");
  addQ(7, "basico", "Volumen de cubo de arista 4 cm:", "", ["16 cm³", "64 cm³", "48 cm³", "32 cm³"], 1, "4³ = 64 cm³.");
  addQ(7, "basico", "Área de triángulo rectángulo de catetos 6 cm y 8 cm:", "", ["48 cm²", "24 cm²", "14 cm²", "28 cm²"], 1, "(6×8)/2 = 24 cm².");
  for (let i = 1; i <= 10; i++) {
    const r = i + 2;
    addQ(7, "medio", `[Cono #${i}] Volumen de cono con r = ${r} cm y h = 9 cm:`, "", [`${3 * r * r}π cm³`, `${9 * r * r}π cm³`, `${6 * r * r}π cm³`, `${r * r}π cm³`], 0, `(1/3)π(${r}²)(9) = ${3 * r * r}π cm³.`);
  }
  for (let i = 1; i <= 20; i++) {
    const lado = i + 3;
    addQ(7, "dificil", `[Área Sombreada #${i}] Cuadrado de lado ${2 * lado} cm con círculo inscrito. Área exterior al círculo:`, "", [`${4 * lado * lado} − ${lado * lado}π cm²`, `${lado * lado}π − ${4 * lado * lado} cm²`, `${2 * lado * lado} − ${lado * lado}π cm²`, `${4 * lado * lado} − ${2 * lado}π cm²`], 0, `${4 * lado * lado} − ${lado * lado}π cm².`);
  }

  // TEMA 8
  addQ(8, "basico", "Analiza el giro en SVG. ¿Qué posición sigue en '?'?", SVG_BUILDERS.rotationSeq(0, 45, 90), ["135° (Diagonal inferior derecha)", "180°", "0°", "270°"], 0, "Gira +45° horarios: 0° → 45° → 90° → 135°.");
  addQ(8, "basico", "3 pasos de 90° en sentido antihorario equivalen a:", "", ["270° antihorario (90° horario)", "180°", "360°", "90° antihorario"], 0, "3 × 90° = 270° antihorario.");
  addQ(8, "basico", "Serie: Triángulo → Cuadrado → Pentágono → ?:", "", ["Hexágono (6 lados)", "Octágono", "Círculo", "Rombo"], 0, "Aumenta 1 lado por paso.");
  addQ(8, "basico", "1 punto arriba, 2 derecha, 3 abajo, 4 izquierda. Sigue:", "", ["5 puntos arriba", "5 puntos abajo", "4 puntos arriba", "1 punto derecha"], 0, "5 puntos arriba.");
  addQ(8, "basico", "Flecha apunta Norte → Este → Sur. Regla:", "", ["Giro horario de 90°", "Giro antihorario 90°", "Giro 180°", "Reflexión"], 0, "Giro horario de 90°.");
  for (let i = 1; i <= 10; i++) {
    const start = (i * 45) % 360, d2 = (start + 90) % 360, d3 = (start + 180) % 360, ans = (start + 270) % 360;
    addQ(8, "medio", `[Rotación #${i}] Saltos de +90° horarios en SVG. Ángulo en '?':`, SVG_BUILDERS.rotationSeq(start, d2, d3), [`${ans}°`, `${(ans + 45) % 360}°`, `${(ans + 90) % 360}°`, `${(ans + 180) % 360}°`], 0, `${ans}°.`);
  }
  for (let i = 1; i <= 20; i++) {
    const step = (i % 2 === 0) ? 45 : 135, d2 = step, d3 = (step * 2) % 360, ans = (step * 3) % 360;
    addQ(8, "dificil", `[Giro Compuesto #${i}] Orientación angular en '?':`, SVG_BUILDERS.rotationSeq(0, d2, d3), [`${ans}°`, `${(ans + 90) % 360}°`, `${(ans + 45) % 360}°`, `${(ans + 180) % 360}°`], 0, `Paso +${step}° → ${ans}°.`);
  }

  // TEMA 9
  addQ(9, "basico", "Observa la matriz 3×3 en SVG. ¿Qué figura va en '?'?", SVG_BUILDERS.matrix3x3(), ["Cuadrado con diagonal interna", "Solo cuadrado", "Cruz en círculo", "Dos diagonales"], 0, "Superposición de Columna 1 + Columna 2.");
  addQ(9, "basico", "Fila 3 tiene [3, 4, ?] trazos. Valor de '?':", "", ["5 trazos", "6 trazos", "4 trazos", "7 trazos"], 0, "Incremento +1 → 5 trazos.");
  addQ(9, "basico", "Regla XOR entre (+) y (—):", "", ["Línea vertical (|)", "Cruz (+)", "Vacío", "Cuadrado"], 0, "Se cancela el trazo horizontal y queda (|).");
  addQ(9, "basico", "Sudoku gráfico (círculo, triángulo, cuadrado). Si hay círculo y cuadrado, falta:", "", ["Triángulo", "Círculo", "Pentágono", "Rombo"], 0, "Falta el triángulo.");
  addQ(9, "basico", "Columnas muestran Grande → Mediano → Pequeño. Patrón:", "", ["Escalamiento decreciente", "Rotación", "Inversión color", "Simetría"], 0, "Escalamiento decreciente.");
  for (let i = 1; i <= 10; i++) {
    addQ(9, "medio", `[Matriz Lógica #${i}] Superposición por filas en matriz 3×3 SVG. Resultado en '?':`, SVG_BUILDERS.matrix3x3(), ["Cuadrado con diagonal ascendente", "Círculo con diagonal", "Triángulo inscrito", "Cuadrado sombreado"], 0, "Cuadrado + diagonal.");
  }
  for (let i = 1; i <= 20; i++) {
    addQ(9, "dificil", `[Matriz Avanzada #${i}] Columna 3 suma vértices de Col 1 (Triángulo=3) y Col 2 (Cuadrado=4). Polígono en '?':`, "", ["Heptágono (7 vértices)", "Hexágono (6)", "Octágono (8)", "Pentágono (5)"], 0, "3 + 4 = 7 vértices (Heptágono).");
  }

  // TEMA 10
  addQ(10, "basico", "Triángulo es a 3 lados como Octágono es a:", "", ["8 lados", "6 lados", "10 lados", "7 lados"], 0, "8 lados.");
  addQ(10, "basico", "Figura que NO pertenece: Cubo, Esfera, Cilindro, Trapecio:", "", ["Trapecio (es 2D)", "Cubo", "Esfera", "Cilindro"], 0, "El trapecio es plano (2D).");
  addQ(10, "basico", "Círculo grande blanco es a pequeño negro, como cuadrado grande blanco es a:", "", ["Cuadrado pequeño negro", "Cuadrado grande negro", "Triángulo pequeño negro", "Círculo pequeño blanco"], 0, "Reduce tamaño e invierte color.");
  addQ(10, "basico", "Letra sin eje de simetría:", "", ["H", "O", "F", "X"], 2, "La F es asimétrica.");
  addQ(10, "basico", "Reflexión vertical de 'p':", "", ["Letra b", "Letra q", "Letra d", "Letra o"], 0, "Forma la letra 'b'.");
  for (let i = 1; i <= 10; i++) {
    addQ(10, "medio", `[Exclusión #${i}] Elemento discordante: 4, 9, 16, 24, 36:`, "", ["24 (no es cuadrado perfecto)", "9", "16", "36"], 0, "24 no es cuadrado perfecto.");
  }
  for (let i = 1; i <= 20; i++) {
    addQ(10, "dificil", `[Analogía #${i}] Polígono de ${i + 2} lados es a ${i + 4} lados, como Pentágono (5) es a:`, "", ["Heptágono (7 lados)", "Hexágono (6)", "Octágono (8)", "Decágono (10)"], 0, "5 + 2 = 7 lados.");
  }

  // TEMA 11
  addQ(11, "basico", "En la plantilla del cubo SVG, ¿qué símbolo es opuesto a la estrella (★)?", SVG_BUILDERS.cubeNet(), ["✖ (Equis roja)", "▲ (Triángulo)", "◆ (Rombo)", "● (Círculo)"], 0, "Caras alternas: ★ opuesta a ✖.");
  addQ(11, "basico", "En la plantilla SVG, ¿qué símbolo es opuesto al triángulo (▲)?", SVG_BUILDERS.cubeNet(), ["◆ (Rombo inferior)", "★ (Estrella)", "● (Círculo)", "■ (Cuadrado)"], 0, "▲ es opuesto a ◆.");
  addQ(11, "basico", "Caras, vértices y aristas de un cubo:", "", ["6 caras, 8 vértices y 12 aristas", "8, 6, 12", "6, 12, 8", "6, 8, 10"], 0, "6 caras, 8 vértices, 12 aristas.");
  addQ(11, "basico", "Base 3×3 y 2 pisos de altura. Total de cubos:", "", ["18 cubos", "12 cubos", "9 cubos", "27 cubos"], 0, "3×3×2 = 18 cubos.");
  addQ(11, "basico", "Vista superior de un cilindro vertical:", "", ["Un círculo", "Un rectángulo", "Un triángulo", "Un óvalo"], 0, "Proyecta un círculo.");
  for (let i = 1; i <= 10; i++) {
    const base = i + 2, totalCubes = base * base + (base - 1) * (base - 1);
    addQ(11, "medio", `[Bloques #${i}] Pirámide de base ${base}×${base} y segundo nivel ${base - 1}×${base - 1}. Total:`, "", [`${totalCubes} cubos`, `${base * base} cubos`, `${totalCubes + 2} cubos`, `${totalCubes - 1} cubos`], 0, `${totalCubes} cubos.`);
  }
  for (let i = 1; i <= 20; i++) {
    const n = i + 2, paintedTwoFaces = 12 * (n - 2);
    addQ(11, "dificil", `[Cubo Pintado #${i}] Cubo ${n}×${n}×${n} pintado exteriormente. Cubitos con 2 caras pintadas:`, "", [`${paintedTwoFaces} cubitos`, "8 cubitos", `${6 * (n - 2) * (n - 2)} cubitos`, `${12 * n} cubitos`], 0, `12 × (${n} − 2) = ${paintedTwoFaces}.`);
  }

  return bank;
}

const DEFAULT_QUESTION_BANK = buildInitialQuestionBank();