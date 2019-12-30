function Sheet(id) {
  this.sheet = SpreadsheetApp.openById(id);

  this.readFromSheet = function(sheetName) {
    var sheet = this.sheet.getSheetByName(sheetName);
    try {
      var rows = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
      var dataArray = [];
      for (var i = 1, l = rows.length; i < l; i++) {
        var dataRow = rows[i];
        var record = {};
        if (dataRow.length) {
          for (var j = 0, n = dataRow.length; j < n; j++) {
            record[rows[0][j]] = dataRow[j];
          } //for
          dataArray.push(record);
        } //if
      }
      return dataArray;
    } catch (error) {
      return new Error("error read");
    }
  };

  this.writeInSheet = function(name, data, id) {
    var sheet = this.sheet.getSheetByName(name);
    var keys = this.getKeys(sheet, name);
    if (!keys) {
      // якщо арукш пустий, ключів не має, то їх створити з тих, що будуть в об'єкті даних
      keys = Object.keys(data);
      sheet.appendRow(keys);
    }
    var array = [];
    keys.forEach(function(key) {
      if (data[key]) array.push(data[key]);
      else array.push("FALSE");
    });
    if (id) {
      for (var i = 1; i <= keys.length; i++) {
        if (keys[i] == "id") sheet.getRange(i, 1, 1, array.length).setValues([array]);
      }
    } else sheet.appendRow(array);
  };

  this.getKeys = function(sheet) {
    try {
      var keys = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();
      return keys[0]; // перший елемент бо функція повертає масив масивів
    } catch (error) {
      return undefined;
    }
  };

  this.updateColomn = function(name, findKey, value) {
    var sheet = this.sheet.getSheetByName(name);
    var keys = this.getKeys(sheet, name);
    keys.forEach(function(key, index) {
      if (findKey == key) {
        var height = sheet.getLastRow();
        var col = index + 1;
        for (var row = 2; row <= height; row++) {
          sheet.getRange(row, col).setValue(value);
        }
      }
    });
  };
  this.deleteRowFromSheet = function(name, id) {
    var sheet = this.sheet.getSheetByName(name);
    var keys = this.getKeys(sheet, name);
    keys.forEach(function(key, index) {
      if (key == "id") {
        var allData = sheet.getRange(2, index + 1, sheet.getLastRow()).getValues();
        allData.forEach(function(row, ind) {
          if (row[0] == id) {
            sheet.deleteRow(ind + 1);
            return true;
          }
        });
      }
    });
    return false;
  };
}

//function test() {
//var sheet = new Sheet('1dfeF672k3WmlejytuHIQ2Pea_BzLXJQrLju3qfOsbXM');
//sheet.writeInSheet("main", {
//    code: false,
//    user_email: "nf@vu.cdu.edu.ua",
//    institutes: 1,
//    departments: 3,
//    educational_degree: "1",
//    form_of_training: "2",
//    termin: "on",
//    specialty: "80",
//    academic_discipline: false,
//    typepractice: "1",
//    rulespractice: "1",
//    course_number: "1",
//    semester_number: "2",
//    period: "qew",
//    hours: "qwe",
//    date_launch: "2019-12-30",
//    date_end: "2019-12-30",
//    numbers_of_student: "asd",
//    type_of_control: "1",
//    responsible: "123231",
//    deadline: "2019-12-30",
//    valid: false,
//    id: 1577707616011
//  });
//}
function test() {
  var sheet = new Sheet("1dfeF672k3WmlejytuHIQ2Pea_BzLXJQrLju3qfOsbXM");
  var a = sheet.deleteRowFromSheet("main", 1577664000000);
  Logger.log(a);
}
