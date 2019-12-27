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
        if (dataRow[0] != undefined) {
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

  this.writeInSheet = function(name, data, rowNumber) {
    var sheet = this.sheet.getSheetByName(name);
    var keys = this.getKeys(sheet, name);
    if (!keys) {
      // якщо арукш пустий, ключів не має, то їх створити з тих, що будуть в об'єкті даних
      keys = Object.keys(data);
      keys.push("rowNumber");
      sheet.getRange(1, 1, 1, keys.length).setValues([keys]);
    }
    var array = [];
    keys.forEach(function(key) {
      if (data[key]) array.push(data[key]);
      else array.push("FALSE");
    });
    if (rowNumber) rows = sheet.getRange(rowNumber, 1, 1, array.length).setValues([array]);
    else {
      var newSheet = sheet.appendRow(array);
      sheet
        .getRange(newSheet.getLastRow(), newSheet.getLastColumn())
        .setValue(newSheet.getLastRow());
    }
  };

  this.getKeys = function(sheet, name) {
    try {
      var keys = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();
      return keys[0]; // перший елемент бо функція повертає масив масивів
    } catch (error) {
      return undefined;
    }
  };
}
