function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getUserInfo() {
  // var email = Session.getActiveUser().getEmail();
  // var email = "nf@vu.cdu.edu.ua";
  var email = "infoteh@vu.cdu.edu.ua";
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
