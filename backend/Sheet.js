function Sheet(id) {
  this.sheet = SpreadsheetApp.openById(id);

  this.readRowById = function(sheetName, id) {
    try {
      var sheet = this.sheet.getSheetByName(sheetName);
      var keys = this.getKeys(sheet);
      if (!keys) return undefined;
      for (var key = 0; key < keys.length; key++) {
        if (keys[key] == "id") {
          var rows = sheet.getRange(2, key + 1, sheet.getLastRow()).getValues();
          for (var row = 0; row < rows.length; row++) {
            var obj = {};
            if (rows[row] == id) {
              var rowData = sheet.getRange(row + 2, 1, 1, sheet.getLastColumn()).getValues();
              keys.forEach(function(key, index) {
                obj[key] = rowData[0][index];
              });
              return obj;
            }
          }
          return undefined;
          break;
        }
      }
    } catch (error) {
      new Error("error read id:" + id);
    }
  };

  this.readFromSheet = function(sheetName) {
    try {
      var sheet = this.sheet.getSheetByName(sheetName);
      var keys = this.getKeys(sheet);
      if (keys) {
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
      } else return undefined;
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
      keys.forEach(function(key, index) {
        if (key == "id") {
          var allData = sheet.getRange(2, index + 1, sheet.getLastRow()).getValues();
          allData.forEach(function(row, ind) {
            if (row[0] == id) {
              sheet.getRange(ind + 2, 1, 1, array.length).setValues([array]);
            }
          });
        }
      });
    } else sheet.appendRow(array);
  };
  this.writeNewKeysAndValue = function(sheetName, headers, values) {
    var sheet = this.sheet.getSheetByName(sheetName);
    sheet.deleteRows(1, 2);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(2, 1, 1, values.length).setValues([values]);
  };
  this.getBasePractic = function() {
    var sheet = this.sheet.getSheetByName("basePractic");
    try {
      var data = sheet.getRange(1, 1, sheet.getLastRow()).getValues();
      var res = [];
      data.forEach(function(elem) {
        res.push(elem[0]);
      })
      return res;
      } catch (error) {
      return false;
    }
  };
  this.setBasePractic = function(base) {
    var sheet = this.sheet.getSheetByName("basePractic");
    sheet.appendRow([base]);
  };

  this.getKeys = function(sheet) {
    try {
      var keys = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();
      return keys[0]; // перший елемент бо функція повертає масив масивів
    } catch (error) {
      return undefined;
    }
  };
  this.getHeaders = function(sheetName) {
    try {
      var sheet = this.sheet.getSheetByName(sheetName);
      var keys = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();
      var headers = [];
      keys[0].forEach(function(key){
        if (key.slice(0,3) == 'key') {
          headers.push(key.slice(4, key.indexOf("-", 4)));
        }
      })
      return headers;
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
            sheet.deleteRow(ind + 2);
            return true;
          }
        });
      }
    });
    return false;
  };
}

function test() {
  var sheet = new Sheet("1PhgGe8ZlGzgI-qVX_s0PYRHvstVyOYY9zN48g4AW46M");
  var a = sheet.getBasePractic();
  Logger.log(a);
}
