function Sheet(id) {
  this.sheet = SpreadsheetApp.openById(id);
}

Sheet.prototype.readFromSheet = function(sheetName) {
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
    return new Error('error read');
  }
};
