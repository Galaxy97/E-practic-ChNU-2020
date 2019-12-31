function doGet() {
  // var email = Session.getActiveUser().getEmail(); // services => see
  // var email = "nf@vu.cdu.edu.ua";
  var email = "infoteh@vu.cdu.edu.ua";
  // var email = "nmv@vu.cdu.edu.ua";
  var template;
  var accountTable = new Sheet("17FqI3CWAc407PEIFzVMAGH2IGbtK6CoHliI-MQVQ7s0");
  var accounts = accountTable.readFromSheet("accounts");
  var uZver = new Users();
  // пошук користувача в таблиці авторизованиї користувачів
  accounts.forEach(function(element) {
    if (element.user_email == email) {
      switch (element.type) {
        case "dep":
          template = HtmlService.createTemplateFromFile("frontend/templates/department"); // сторінка для кафедри
          break;
        case "inst":
          template = HtmlService.createTemplateFromFile("frontend/templates/institutes"); // сторінка для інституту
          break;
        case "admin":
          template = HtmlService.createTemplateFromFile("frontend/templates/admin"); // сторінка для адміна
          break;
        case "practic":
          template = HtmlService.createTemplateFromFile("frontend/templates/zavprac"); // сторінка для адміна
          break;
      }
    }
  });
  if (template) return template.evaluate(); // якщо користувач був в системі, то він отримає свій шаблон
  // інакше потрібно зареєструвати користувача або відмовити в доступі
  var usersTemplate = HtmlService.createTemplateFromFile(
    uZver.findUserByEmail(email, accountTable)
  );
  return usersTemplate.evaluate();
}

function logger(text) {
  var sheet = SpreadsheetApp.openById('17FqI3CWAc407PEIFzVMAGH2IGbtK6CoHliI-MQVQ7s0').getSheetByName('log');
  sheet.appendRow([JSON.stringify(text)]);
}
