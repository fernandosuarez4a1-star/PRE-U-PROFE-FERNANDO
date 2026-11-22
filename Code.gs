function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Registros_PREU");

    if (!sheet) {
      sheet = ss.insertSheet("Registros_PREU");
      sheet.appendRow([
        "Fecha_Servidor",
        "Accion",
        "Estudiante",
        "Clave_Intento",
        "Puntaje_1000",
        "Aciertos",
        "Total_Preguntas",
        "Tiempo",
        "Codigo_Certificado"
      ]);
    }

    sheet.appendRow([
      new Date(),
      payload.action || "",
      payload.studentName || "",
      payload.attemptKey || "",
      payload.score1000 !== undefined ? payload.score1000 : "",
      payload.correct !== undefined ? payload.correct : "",
      payload.total !== undefined ? payload.total : "",
      payload.timeUsed || "",
      payload.certificate ? payload.certificate.code : ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", action: payload.action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "online", app: "Profe Fernando PRE-U" }))
    .setMimeType(ContentService.MimeType.JSON);
}