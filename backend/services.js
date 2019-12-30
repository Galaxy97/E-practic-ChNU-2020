function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getUserInfo() {
  // var email = Session.getActiveUser().getEmail();
  var email = "nf@vu.cdu.edu.ua";
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

function getDataFromTable(sheetID) {
  var sheet = new Sheet(sheetID);
  try {
    return JSON.stringify(sheet.readFromSheet("main"));
  } catch (e) {
    return e;
  }
}
function sendDataToSheet(sheetID, record, id) {
  var sheet = new Sheet(sheetID);
  try {
    sheet.writeInSheet("main", JSON.parse(record), id);
    return true;
  } catch (error) {
    return false;
  }
}
function deleteRecordInTable(sheetID, name, id) {
  var sheet = new Sheet(sheetID);
  try {
    sheet.deleteRowFromSheet(name, id);
    return true;
  } catch (error) {
    return false;
  }
}
