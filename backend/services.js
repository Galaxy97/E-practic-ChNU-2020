function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getUserInfo() {
  var email = Session.getActiveUser().getEmail();
  // var email = "akit.ck@vu.cdu.edu.ua";
  //  var email = "infoteh@vu.cdu.edu.ua";
  // var email = "nmv@vu.cdu.edu.ua";
  var accountTable = new Sheet("17FqI3CWAc407PEIFzVMAGH2IGbtK6CoHliI-MQVQ7s0");
  var accounts = accountTable.readFromSheet("accounts");
  for (var row in accounts) {
    if (accounts[row].user_email == email) {
      return accounts[row];
    }
  }
  return undefined;
}

function getExternalData() {
  try {
    return new Directories().getDirectoriesFromFile();
  } catch (error) {
    return new Error("fail from load file");
  }
}
function findDepartmentSheet(instititeID) {
  var uZver = new Users();
  return uZver.findByInstitutes(instititeID);
}
function getDateFromTableById(sheetID, tableName, id) {
  var sheet = new Sheet(sheetID);
  try {
    return JSON.stringify(sheet.readRowById(tableName, id));
  } catch (e) {
    return e;
  }
}

function getDataFromTable(sheetID, tableName) {
  var sheet = new Sheet(sheetID);
  try {
    return JSON.stringify(sheet.readFromSheet(tableName));
  } catch (e) {
    return e;
  }
}
function getBasePractic(sheetID) {
  var sheet = new Sheet(sheetID);
  try {
    return JSON.stringify(sheet.getBasePractic());
  } catch (e) {
    return e;
  }
}
function setBasePractic(sheetID, base) {
  var sheet = new Sheet(sheetID);
  try {
    sheet.setBasePractic(base);
    return true;
  } catch (e) {
    return e;
  }
}
function sendDataToSheet(sheetID, sheetName, record, id) {
  var sheet = new Sheet(sheetID);
  try {
    sheet.writeInSheet(sheetName, JSON.parse(record), id);
    return true;
  } catch (error) {
    return false;
  }
}
function reWriteKeys(sheetID, sheetName, headers, values) {
  var sheet = new Sheet(sheetID);
  try {
    sheet.writeNewKeysAndValue(sheetName, headers, values);
    return true;
  } catch (error) {
    return false;
  }
}
function deleteRecordInTable(sheetID, name, id, code) {
  var sheet = new Sheet(sheetID);
  try {
    sheet.deleteRowFromSheet(name, id);
    if (code) {
      sheet.sheet.deleteSheet(sheet.sheet.getSheetByName(code));
      sheet.deleteRowFromSheet("order", code);
    }
    return true;
  } catch (error) {
    return false;
  }
}
function createCode(userInfo, id, prefix) {
  var sheet = new Sheet(userInfo.user_sheet_id);
  var data = sheet.readRowById("main", id);
  var code = createShufr(prefix); // створення шифру
  // присвоєня шифру та погодження в таблиці графіку
  data.code = code;
  data.valid = true;
  sheet.writeInSheet("main", data, id); // запис цих змін в таблиці
  // створення об'єкту для запису order даних
  var practicData = {};
  practicData.id = code;
  practicData.confDate = false;
  practicData.confTime = false;
  practicData.orderUrl = false;
  practicData.additionUrl = false;
  sheet.writeInSheet("order", practicData); // запис цих даних в таблицю order

  // створення тиблиці з назвою як шифр
  sheet.sheet.insertSheet(code);
  return code;
}

function createShufr(prefix) {
  var sheet = SpreadsheetApp.openById("17FqI3CWAc407PEIFzVMAGH2IGbtK6CoHliI-MQVQ7s0").getSheetByName("instituteCode");
  var lastCode = sheet.getRange(1, 1).getValue() + 1;
  var numCode;
  if (lastCode < 10) {
    numCode = "000" + lastCode;
  } else if (lastCode < 100) {
    numCode = "00" + lastCode;
  } else if (lastCode < 1000) {
    numCode = "0" + lastCode;
  } else {
    numCode = lastCode;
  }
  sheet.getRange(1, 1).setValue(lastCode);
  var date = new Date();
  var years;
  var year1 = date.getFullYear();
  var year2;
  if (date.getMonth < 5) {
    year2 = String(year1 - 1);
  } else year2 = String(year1 + 1);
  return prefix + "-" + String(year1).slice(2) + "/" + year2.slice(2) + "-" + numCode;
}

function updateExternalData() {
  try {
    new Directories().update();
    return true;
  } catch (error) {
    return error;
  }
}

function createAdditionalDoc(sheetID, tableName) {
  var sheet = new Sheet(sheetID);
  try {
    var data = sheet.readFromSheet(tableName);
    var studentsArray = [];
    data.forEach(function(row) {
      const array = [];
      for (key in row) {
        if (key == "id") continue;
        if (key == "captain") row[key] = row[key] ? "Староста" : "";
        array.push(row[key]);
      }
      studentsArray.push(array);
    });
    var url = createAplication(tableName, studentsArray);
    return url;
  } catch (e) {
    return e;
  }
}
function createOrderDoc(sheetID, code) {
  sheetID = "1PhgGe8ZlGzgI-qVX_s0PYRHvstVyOYY9zN48g4AW46M";
  code = 'IT-19/20-0007';
  try {
    var sheet = new Sheet(sheetID);
    var externalData = getExternalData();
    var recordData = {};
    var sourceData = sheet.readFromSheet("main");
    for (var index in sourceData) {
      if (sourceData[index].code == code) {
        recordData = sourceData[index];
        break;
      }
    }
    var orderData = sheet.readRowById('order', code);
    var headersID = sheet.getHeaders(code);
    var url = createOrder(externalData, recordData, orderData, headersID);
    return url;
  } catch (e) {
    return e.toString();
  }
}
// var m = [
//   ["Прізвище Ініціали", "Чи староста", "База практики", "Керівник практики"],
//   ["Окунь В.П.", "Староста", "ЧНУ", "Величко С.П."],
//   ["Прокопенко П.П.", "", "ЧНУ", "Величко С.П."],
//   ["Яструб Г.М.", "", "ЧБК", "Заїка Г.Я."],
//   ["Вареник С.Н.", "", "ЧНУ", "Теличко В.В."],
//   ["Пономаренко В.А.", "Староста", "ЧБК", "Лящ З.Є."],
// ];
