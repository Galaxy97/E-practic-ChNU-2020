function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getUserInfo() {
  // var email = Session.getActiveUser().getEmail();
  var email = "im@vu.cdu.edu.ua";
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
