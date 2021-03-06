function Users() {
  // витягнути дані з довідника
  this.directories = new Directories().getDirectoriesFromFile();

  // --------------------
  this.createDepartmentRecordForTable = function(department, accountSheet) {
    var fileId = this.createFile(department.namedepartment);

    var object = {
      user_email: department.emaildepartment,
      type: "dep",
      institute_id: department.idparentdepartment,
      department_id: department.iddepartment,
      user_name: department.namedepartment,
      versionDir: this.directories.version,
      user_sheet_id: fileId
    };
    accountSheet.writeInSheet("accounts", object);
    return fileId;
  };
  // --------------------
  this.findUserByEmail = function(email, accountSheet) {
    // пошук на кафедрах
    var departs = this.directories.handBook.departments;
    for (var key in departs) {
      if (email == departs[key].emaildepartment) {
        this.createDepartmentRecordForTable(departs[key], accountSheet);
        return "frontend/templates/department";
      }
    }
    // ----------------------- кінець на кафедрах

    // пошук в інститутах
    var institutes = this.directories.handBook.institutes;
    for (var key in institutes) {
      if (email == institutes[key].emailinstitute) {
        var object = {
          user_email: email,
          type: "inst",
          institute_id: institutes[key].idinstitute,
          department_id: false,
          user_name: institutes[key].nameinstitute,
          versionDir: this.directories.version,
          user_sheet_id: false
        };
        accountSheet.writeInSheet("accounts", object);
        return "frontend/templates/institutes";
      }
    }
    // ----------------------- в інститутах
    // --------------------------------------------------------------------------
    return "frontend/templates/incognito"; // INCOGNITO
    // --------------------------------------------------------------------------
  };
  // --------------------
  this.createFile = function(name) {
    var spreadSheet = SpreadsheetApp.create(name);
    spreadSheet.insertSheet("main");
    spreadSheet.insertSheet("order");
    spreadSheet.insertSheet("basePractic");
    var file = DriveApp.getFileById(spreadSheet.getId());
    var folder = DriveApp.getFolderById("1R2hInxDhtOu2vQoKVPyA7mGNnRJE25_Z");
    var newFile = file.makeCopy(file, folder);
    DriveApp.getFileById(file.getId()).setTrashed(true);
    return newFile.getId();
  };
  // --------------------
  this.findByInstitutes = function(instID) {
    var department = this.directories.handBook.departments[instID];
    var accountTable = new Sheet("17FqI3CWAc407PEIFzVMAGH2IGbtK6CoHliI-MQVQ7s0");
    var accounts = accountTable.readFromSheet("accounts");
    for (var key in accounts) {
      if (accounts[key].user_email == department.emaildepartment) {
        return accounts[key].user_sheet_id;
      }
    }
    // якщо не має кафедри в списку зареєстрованих, зареєструвати
    return this.createDepartmentRecordForTable(department, accountTable);
  };
}
