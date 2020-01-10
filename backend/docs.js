var folder_ID = "1AHIQ36UnDweulP6vi1mmhASnWQr7j5Ob"; // папка, що містить документи наказів та додатків
var pdfFolder = "1n95lOq_uQVPM3VAuC78ol938-ebZ2usp"; // папка, що містить PDF документи наказів та додатків
var application_template_ID = "1RP3L3gWYbHsGXqPAOrtrPYMcmY-yd0mekg9XP2Insh0"; // шаблон додатку до наказу
var order_template_ID = "1uikVSwgrCHajjkTGioe24RGX3ovAHT1Pay9grOSdfIc"; // шаблон наказу

var numColl = 2; // номер стовпця таблиці зі студентами, який містить бази практик
var numCollS = 1; // номер стовпця з відміткою про старост

var months = [
  "січня",
  "лютого",
  "березеня",
  "квітеня",
  "травеня",
  "червеня",
  "липеня",
  "серпеня",
  "вересеня",
  "жовтеня",
  "листопада",
  "грудня"
];
var nbsp = "\u00A0";

// =============================================================================================
//                               створення наказу
// =============================================================================================
function createOrder(externalData, recordData, orderData, headersID, oldID) {
  var code = orderData.id;
  var docID = copyOrderTemplate(code);
  var obj = getStructureOrderTemplate(externalData, recordData, orderData, headersID);
  var doc = DocumentApp.openById(docID); //відкриваємо новий документ
  var body = doc.getBody();
  //пошук заміна елементів шаблону
  for (var prop in obj) {
    body.replaceText("<<" + prop + ">>", obj[prop]);
  }
  doc.getFooter().replaceText("<<ID>>", code);
  doc.saveAndClose();
  //створюємо PDF
  var pdfURL = convertPDF(docID);
  if (oldID) {
    // delete old version
    DriveApp.getFileById(getIdFromUrl(oldID)).setTrashed(true);
    //// ------------
  }
  return pdfURL;
}

function getIdFromUrl(url) { return url.match(/[-\w]{25,}/); }

function getStructureOrderTemplate(externalData, recordData, orderData, headersID) {
  var prorector = {};
  var kerPrac = {};
  var nachlnik = {};
  var buhgalter = {};
  var yurist = {};
  Object.keys(externalData.handBook.control).forEach(function(persona) {
    if (externalData.handBook.control[persona].practicekey == 2) {
      prorector.position = externalData.handBook.control[persona].position;
      prorector.name =
        externalData.handBook.control[persona].name[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].middlename[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].surname;
    }
    if (externalData.handBook.control[persona].practicekey == 12) {
      kerPrac.position = externalData.handBook.control[persona].positionkogo;
      kerPrac.name =
        externalData.handBook.control[persona].surname +
        nbsp +
        externalData.handBook.control[persona].name[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].middlename[0] +
        ".";
      kerPrac.nameIN =
        externalData.handBook.control[persona].name[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].middlename[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].surname;
    }
    if (externalData.handBook.control[persona].practicekey == 7) {
      buhgalter.position = externalData.handBook.control[persona].positionkogo;
      buhgalter.name =
        externalData.handBook.control[persona].surnamekomu +
        nbsp +
        externalData.handBook.control[persona].name[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].middlename[0] +
        ".";
      buhgalter.nameIN =
        externalData.handBook.control[persona].name[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].middlename[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].surname;
    }
    if (externalData.handBook.control[persona].practicekey == 8) {
      yurist.position = externalData.handBook.control[persona].positionkogo;
      yurist.name =
        externalData.handBook.control[persona].name[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].middlename[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].surname;
    }
    if (externalData.handBook.control[persona].practicekey == 5) {
      nachlnik.position = externalData.handBook.control[persona].positionkogo;
      nachlnik.name =
        externalData.handBook.control[persona].surnamekomu +
        nbsp +
        externalData.handBook.control[persona].name[0] +
        "." +
        nbsp +
        externalData.handBook.control[persona].middlename[0] +
        ".";
    }
  });
  var result = {
    PR1: getPR1(externalData, recordData), //"преамбула 1",
    PR2: getPR2(externalData, recordData),
    TNK: getOrderText(externalData, recordData, orderData, headersID, kerPrac, buhgalter, nachlnik),
    POSK: prorector.position,
    NMK: prorector.name,
    PV: getPV(externalData, recordData),
    PP: getPP(externalData, recordData, orderData, headersID, prorector, kerPrac, nachlnik, buhgalter, yurist)
  };
  return result;
}

function getPR1(externalData, recordData) {
  // форма навчання
  var formOfTraining = externalData.handBook.form_of_training[recordData.form_of_training].formtrainingname;
  formOfTraining = formOfTraining.slice(0, formOfTraining.length - 1) + "ої";
  formOfTraining = formOfTraining.toLowerCase();
  // відміннюваня інституту
  var template =
    "Про проведення <<PRACTIC>> студентів <<NUM_KURS>> курсу <<TERMIN>> спеціальності <<TYPE_SPECIAL>> ОС «<<LEVEL>>» <<TYPE_FORM>> форми навчання <<INST>>";
  var keyMaps = {
    PRACTIC: externalData.handBook.rulespractice[recordData.rulespractice].nameyakoi,
    NUM_KURS: externalData.handBook.course_number[recordData.course_number].coursename,
    TERMIN: recordData.termin ? "зі скороченим терміном навчання" : "",
    TYPE_SPECIAL: externalData.handBook.specialty[recordData.specialty].namespecialtyintegrated,
    LEVEL: externalData.handBook.educational_degree[recordData.educational_degree].educationaldegreename,
    TYPE_FORM: formOfTraining,
    INST: getInstitutes(externalData.handBook.institutes[recordData.institutes].nameinstitute, true)
  };
  //  //пошук заміна елементів шаблону
  for (var prop in keyMaps) {
    template = template.replace("<<" + prop + ">>", keyMaps[prop]);
  }
  return template;
} ////"преамбула 1",

function getPR2(externalData, recordData) {
  return (
    "Відповідно до навчального плану підготовки фахівців за спеціальністю «" +
    externalData.handBook.specialty[recordData.specialty].namespecialtyintegrated.trim() +
    "», положення «Про проведення практики студентів вищих навчальних закладів України», затвердженого наказом Міністерства освіти і науки України від 08.04.93 № 93"
  );
} ////"преамбула 2",

function getOrderText(externalData, recordData, orderData, headersID, kerPrac, buhgalter, nachlnik) {
  var template = "";
  if (recordData.form_of_training == 2) {
    template +=
      "\t1." + nbsp + "Провести <<HOURS>>-годинну <<PRACTIC>> протягом <<LAUNCH_ZAO>> - <<END_ZAO>> <<YEAR>> року.";
  } else {
    template += "\t1." + nbsp + "Провести <<PERIOD>> (<<HOURS>> годин) <<PRACTIC>> з <<LAUNCH_ST>> по <<END_ST>>.";
  }
  template +=
    " Для проведення практики розподілити студентів за базами її проходження та призначити керівників практики згідно з додатком до наказу." +
    "\n\t2." +
    nbsp +
    "Загальне керівництво та контроль за проведенням практики покласти на <<KERPRACT_POS>> <<KERPRACT>>" +
    "\n\t3." +
    nbsp +
    "Надати навчально-методичне забезпечення і проводити контроль за виконанням програми практики. Провести настановчу конференцію <<DATE_TIME>> ";
  if (headersID.length > 0)
    template += " Відповідальні — завідувач <<ZAV_KAF_POS>> <<ZAV_KAF>>, " + vidpovidalni(externalData, headersID);
  else template += "Відповідальний — завідувач <<ZAV_KAF_POS>> <<ZAV_KAF>>";
  template +=
    "\n\t4." +
    nbsp +
    "Організувати проведення зі студентами інструктажу з питань охорони праці та безпеки життєдіяльності перед початком проведення практики. Відповідальний — <<POS_DIR>> <<INST>> <<INST_DIR>>" +
    "\n\t5." +
    nbsp +
    "Систематично контролювати виконання програми практики. Відповідальні — керівники практики." +
    "\n\t6." +
    nbsp +
    "Створити комісію в складі керівників практики і викладачів фахової кафедри та провести захисти звітів студентів за результатами практики. Термін виконання до " +
    "<<DEADLINE>>.";
  if (headersID.length > 0)
    template += " Відповідальні — завідувач <<ZAV_KAF_POS>> <<ZAV_KAF>>, " + vidpovidalni(externalData, headersID);
  else template += " Відповідальний — завідувач <<ZAV_KAF_POS>> <<ZAV_KAF>>";
  if (recordData.typepractice == 2 && recordData.form_of_training == 1 && recordData.educational_degree == 1) {
    template +=
      "\n\t7." +
      nbsp +
      "Головному бухгалтеру <<BUHGALTER>> відшкодувати витрати щодо організації і проведення практики студентів відповідно до чинного законодавства (згідно з договором про проведення практики)." +
      "\n\t8." +
      nbsp +
      "Контроль за виконанням наказу покласти на <<NACHALNIK_POS>> <<NACHALNIK>>";
  } else template += "\n\t7." + nbsp + "Контроль за виконанням наказу покласти на <<NACHALNIK_POS>> <<NACHALNIK>>";

  var keyMaps = {
    HOURS: recordData.hours,
    PERIOD: recordData.period,
    PRACTIC: externalData.handBook.rulespractice[recordData.rulespractice].nameyakoi,
    LAUNCH_ST: Utilities.formatDate(new Date(recordData.date_launch), "Europe/Kiev", "dd.MM.yyyy"),
    END_ST: Utilities.formatDate(new Date(orderData.confDate), "Europe/Kiev", "dd.MM.yyyy"),
    LAUNCH_ZAO: months[new Date(recordData.date_launch).getMonth()],
    END_ZAO: months[new Date(recordData.date_end).getMonth()],
    YEAR: new Date(recordData.date_end).getFullYear(),
    KERPRACT_POS: kerPrac.position,
    KERPRACT: kerPrac.name,
    DATE_TIME: getConfTime(orderData),
    ZAV_KAF_POS: "кафедри" + externalData.handBook.departments[recordData.departments].namedepartment.slice(7),
    ZAV_KAF: getZavKaf(externalData, recordData.departments),
    POS_DIR: externalData.handBook.director[recordData.institutes].position,
    INST: getInstitutes(externalData.handBook.institutes[recordData.institutes].nameinstitute, true),
    INST_DIR: getDirectorInst(externalData.handBook.director[recordData.institutes]),
    DEADLINE: Utilities.formatDate(new Date(recordData.deadline), "Europe/Kiev", "dd.MM.yyyy").trim(),
    BUHGALTER: buhgalter.name,
    NACHALNIK: nachlnik.name,
    NACHALNIK_POS: nachlnik.position
  };
  for (var prop in keyMaps) {
    while (template.search("<<" + prop + ">>") > 0) {
      template = template.replace("<<" + prop + ">>", keyMaps[prop]);
    }
  }
  return template;
}

function getPV(externalData, recordData) {
  var text =
    "завідувач кафедри " +
    externalData.handBook.departments[recordData.departments].namedepartment.slice(7) +
    "\n_____________ " +
    getZavKaf(externalData, recordData.departments, true) +
    "\n__________________\n";
  return text;
}

function getPP(externalData, recordData, orderData, headersID, prorector, kerPrac, nachlnik, buhgalter, yurist) {
  var text = yurist.position + "\n" + "_____________" + yurist.name + "\n__________________\n";
  if (recordData.typepractice == 2 && recordData.form_of_training == 1 && recordData.educational_degree == 1) {
    text += buhgalter.position + "\n" + "_____________" + buhgalter.nameIN + "\n__________________\n";
  }
  text += "завідувач практики" + "\n" + "_____________" + kerPrac.nameIN + "\n__________________\n";
  text +=
    externalData.handBook.director[recordData.institutes].position +
    " " +
    getInstitutes(externalData.handBook.institutes[recordData.institutes].nameinstitute) +
    "\n_____________" +
    getDirectorInst(externalData.handBook.director[recordData.institutes], true) +
    "\n__________________\n";
  if (recordData.typepractice == 2 && recordData.form_of_training == 1 && recordData.educational_degree == 1) {
  }
  if (headersID.length > 0) {
    headersID.forEach(function(id) {
      text +=
        "завідувач кафедри" +
        externalData.handBook.departments[id].namedepartment.slice(7) +
        "\n_____________ " +
        getZavKaf(externalData, id, true) +
        "\n__________________\n";
    });
  }
  return text;
}

function getConfTime(orderData) {
  if (orderData.confTime.slice(0, 2) == "11") {
    return (
      Utilities.formatDate(new Date(orderData.confDate), "Europe/Kiev", "dd.MM.yyyy") +
      " об " +
      orderData.confTime.slice(0, 2) +
      ":" +
      orderData.confTime.slice(3) +
      " год."
    );
  }
  return (
    Utilities.formatDate(new Date(orderData.confDate), "Europe/Kiev", "dd.MM.yyyy") +
    " о " +
    orderData.confTime.slice(0, 2) +
    ":" +
    orderData.confTime.slice(3) +
    " год."
  );
}

function getZavKaf(externalData, depID, invert) {
  if (invert) {
    return (
      externalData.handBook.zavkaf[depID].name[0] +
      "." +
      nbsp +
      externalData.handBook.zavkaf[depID].middlename[0] +
      "." +
      nbsp +
      externalData.handBook.zavkaf[depID].surname
    );
  } else
    return (
      externalData.handBook.zavkaf[depID].surname +
      nbsp +
      externalData.handBook.zavkaf[depID].name[0] +
      "." +
      nbsp +
      externalData.handBook.zavkaf[depID].middlename[0] +
      "."
    );
}

function vidpovidalni(externalData, headersID) {
  var template = "";
  for (var i = 0; i < headersID.length; i++) {
    template +=
      "завідувач кафедри " +
      externalData.handBook.departments[headersID[i]].namedepartment.slice(7) +
      nbsp +
      getZavKaf(externalData, headersID[i], true);
    if (i + 1 != headersID.length) template += ",";
    else template += ".";
  }
  return template;
}

function getDirectorInst(info, invert) {
  if (invert) return info.name[0] + "." + nbsp + info.middlename[0] + "." + nbsp + info.surname;
  else return info.surname + nbsp + info.name[0] + "." + nbsp + info.middlename[0] + ".";
}

function getInstitutes(inst, full) {
  if (full) {
    if (inst.slice(0, 27) == "Навчально-науковий інститут") {
      return "Навчально-наукового інституту" + inst.slice(27);
    }
    if (inst.slice(0, 24) == "Навчально-науковий центр") {
      return "Навчально-наукового центру" + inst.slice(24);
    }
    if (inst.slice(0, 9) == "Факультет") {
      return "Факультету" + inst.slice(9);
    }
    if (inst.slice(0, 4) == "Псих") {
      return "Психологічного факультету";
    }
  } else {
    if (inst.slice(0, 27) == "Навчально-науковий інститут") {
      return "ННІ" + inst.slice(27);
    }
    if (inst.slice(0, 24) == "Навчально-науковий центр") {
      return "ННЦ" + inst.slice(24);
    }
    if (inst.slice(0, 9) == "Факультет") {
      return "Факультету" + inst.slice(9);
    }
    if (inst.slice(0, 4) == "Псих") {
      return "Психологічного факультету";
    }
  }
}
// =============================================================================================
//                               кінець створення наказу
// =============================================================================================

function createAplication(code, data, url) {
  //створення документу додатку до наказу
  //  var code = "IT-2019/2020-0002";//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //  var data = m;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  var docID = copyApplicationTemplate(code);
  var newData = getNewData(data); //перетворюємо дані у потрібний формат (групування даних про студентів за видами практик)
  newData = delCollMonitor(newData, numCollS); // знищення стовпця з відмітками про старост
  var doc = DocumentApp.openById(docID); //IDtemplate
  var body = doc.getBody();
  body.clear();
  var styleCell = {};
  var style2 = {};
  var style1 = {};
  style1[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.RIGHT;
  style1[DocumentApp.Attribute.FONT_FAMILY] = "Times New Roman";
  style1[DocumentApp.Attribute.FONT_SIZE] = 12;
  style1[DocumentApp.Attribute.BOLD] = true;
  ////////////////////////////////////////////////
  style2[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.LEFT;
  style2[DocumentApp.Attribute.FONT_FAMILY] = "Times New Roman";
  style2[DocumentApp.Attribute.FONT_SIZE] = 12;
  style2[DocumentApp.Attribute.BOLD] = false;
  style2[DocumentApp.Attribute.LINE_SPACING] = 1; // міжрядковий інтервал 1
  body
    .insertParagraph(
      0,
      "Додаток\nдо наказу Черкаського\nнаціонального університету\nімені Богдана Хмельницького\nвід _____________ № _____\n"
    )
    .setIndentFirstLine(570)
    .setIndentStart(570) //відступ - координата початку лівого поля абзацу
    .setAttributes(style2)
    .setLineSpacing(1); //міжрядковий інтервал;
  //====================ВСТАВЛЯЄМО ДАНІ В ТАБЛИЦЮ===========================================
  var table = body.insertTable(1, newData).setAttributes(style2);

  var padd = 0.05;
  var padd2 = 4;
  var maxLastColumn = newData[0].length;
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! КОПІЮЄМО ШАБЛОН ОБ'ЄДНАНИХ КОМІРОК !!!!!!!!!!!!!!!!!!!!!
  var docTables = DocumentApp.openById("1EFOxGwlE2DeK276zTon8o-3VGfCUadJK0lD5_PFCt_M"); //документ, що містить шаблони таблиць
  var docTablesBody = docTables.getBody();
  var tables = docTablesBody.getTables();
  var srcTable = tables[maxLastColumn]; //таблиця з потрібною кількістю обєднаних комірок
  //=============форматування комірок таблиці==================================
  for (var i = 0; i < newData.length; i++) {
    var lastColumn = newData[i].length;
    for (var j = 0; j < lastColumn; j++) {
      var tc = table.getCell(i, j);
      tc.getChild(0)
        .asParagraph()
        .setAttributes(style2);
      tc.setPaddingTop(padd);
      tc.setPaddingBottom(padd);
      tc.setPaddingLeft(padd2);
      tc.setPaddingRight(padd2);
    }
    if (lastColumn == 1) {
      //якщо рядок з базою практик (його довжина дорівнює 1)
      for (var j = 1; j < maxLastColumn; j++) table.getRow(i).appendTableCell(); //додаємо порожні комірки для дозаповнення рядка з назвою бази практитки
      var valueCell = table
        .getRow(i)
        .getCell(0)
        .getText();
      var srcCell = srcTable.getCell(0, 0).copy();
      var dstCell = table.getChild(i).insertTableCell(0, srcCell);
      table
        .getRow(i)
        .getCell(1)
        .removeFromParent();
      table
        .getRow(i)
        .getCell(0)
        .setText(valueCell);
      tc = table.getCell(i, 0);
      tc.getChild(0)
        .asParagraph()
        .setAttributes(style2);
      tc.setPaddingTop(padd);
      tc.setPaddingBottom(padd);
      tc.setPaddingLeft(padd2);
      tc.setPaddingRight(padd2);
    } //if (lastColumn == 1)
  }

  table
    .getRow(0)
    .editAsText()
    .setBold(true); //заголовочний рядок виділяємо напівжирним
  doc.saveAndClose();

  //створюємо PDF
  var pdfURL = convertPDF(docID);
  //  var docPDF = DocumentApp.openById(pdfID);
  if (url) {
    // delete old version
    var id = getIdFromUrl(url);
    DriveApp.getFileById(id).setTrashed(true);
    //// ------------
  }
  return pdfURL;
}

function copyApplicationTemplate(code) {
  var fileName = "Додаток " + code;
  var file = DriveApp.getFileById(application_template_ID);
  var folder = DriveApp.getFolderById(folder_ID);
  var id = file.makeCopy(fileName, folder).getId();
  return id;
}

function getNewData(arr) {
  // Отримуємо дані згруповані за базою практики
  var dataUNI = getColumn(arr, numColl); //отримуємо список баз практик
  dataUNI = dataUNI.filter(uniqueVal); //отримуємо унікальний список баз практик
  dataUNI.splice(0, 1); //видаляєм перший елемент списку (оскільки він заголовок)
  var newData = new Array();
  newData = getFRow(numColl, arr); //заголовочний рядок
  var arrS = new Array();
  for (var k = 0; k < dataUNI.length; k++) {
    arrS = getMyDataValidations(dataUNI[k], numColl, arr);
    newData = newData.concat(arrS);
  }
  return newData;
}

function getFRow(IdCol, data) {
  //рядок заголовку
  var arr = data[0]; //maxColl = IdCol;
  var Data = new Array();
  Data[0] = [];
  for (var p = 0; p < arr.length; p++) {
    if (p != IdCol) Data[0].push(arr[p]);
  } //for p
  return Data;
}

function getMyDataValidations(value, IdCol, data) {
  //таблиця за певною базою практики
  var numRow = data.length;
  // var maxColl = IdCol;
  var DataValid = new Array();
  DataValid[0] = [];
  DataValid[0][0] = value;
  var u = 0;
  for (var z = 1; z < numRow; z++)
    if (data[z][IdCol] == value) {
      var arr = data[z];
      u++;
      DataValid[u] = [];

      for (var p = 0; p < arr.length; p++) {
        if (p != IdCol) DataValid[u].push(arr[p]);
      } //for p
    } //if value
  return DataValid;
}

function uniqueVal(value, index, self) {
  // отримуємо унікальні значення для фільтра : arr.filter(uniqueVal)
  return self.indexOf(value) === index;
}

function getColumn(matrix, column) {
  //отримуємо лінійний масив значень елементів стовпця двовимірного масиву
  var result = [];
  matrix.forEach(function(value) {
    result.push(value[column]);
  });

  return result;
}

function delCollMonitor(data, IdCol) {
  //знищення стовпця з відміткою про старост
  data.forEach(function(value) {
    if (value[IdCol]) value[0] += " (староста)";
  });
  // видаляємо стовпець з відміткою про старосту
  var newData = data.map(function(val, ind) {
    return val.filter(function(val, ind) {
      return ind != IdCol;
    });
  });
  return newData;
}

function copyOrderTemplate(code) {
  //створення копії файлу наказу з шаблону
  var fileName = "Наказ " + code;
  var file = DriveApp.getFileById(order_template_ID);
  var folder = DriveApp.getFolderById(folder_ID);
  var id = file.makeCopy(fileName, folder).getId();
  return id;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
///                                               PDF                                                 ///
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function convertPDF(IdDoc) {
  var doc = DocumentApp.openById(IdDoc); //IDtemplate
  var docblob = doc.getAs("application/pdf");
  /* Add the PDF extension */
  docblob.setName(doc.getName() + ".pdf");
  var file = DriveApp.createFile(docblob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // ADDED
  var fileId = file.getId();
  moveFile(fileId, pdfFolder); //переміщуємо документ в потрібну папку
  return file.getUrl();
  //  return fileId;
}

function moveFile(fileId, toFolderId) {
  var file = DriveApp.getFileById(fileId);
  var source_folder = DriveApp.getFileById(fileId)
    .getParents()
    .next();
  var folder = DriveApp.getFolderById(toFolderId);
  folder.addFile(file);
  source_folder.removeFile(file);
}
