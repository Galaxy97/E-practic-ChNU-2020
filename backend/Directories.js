function Directories() {
  this.urls = [
    "https://script.google.com/macros/s/AKfycbzF_XIVzhIsH-Dvvqn-NjJrEjTPmGYQsirrKBpU2R4B6JVQyG_i/exec",
    "https://script.google.com/macros/s/AKfycbxKGW0llfpD-AFmlFUNrTjzzvObRcP-zobNtvMaYuxre3goTAU/exec",
    "https://script.google.com/macros/s/AKfycbwt30kDpctZbsELcXLXp38FkKczJfCXsgR98gCF2PEjw9KHLB9Q/exec",
    "https://script.google.com/macros/s/AKfycbxU51MTEWbEzaN0Zg2oteeiIKMU6DzNatY5q4u0eMZTT-Lx67Q/exec",
    "https://script.google.com/macros/s/AKfycbyUse-NHP1hA1T1U8sj2FW3jI-LtC1UKGDNMX3AFiM8F8E3nHI/exec"
  ];
  // ------------------------------------ метод для отримання актуальних даних із джерел довідника
  this.getDataAsOnbject = function() {
    var object = {
      handBook: {}
    };
    var formDataTable = new Sheet("1fFeBfWbkryu_wEn7lmqcniWrbfSy-U8-nX0xyOdFcGE");
    object.formData = formDataTable.readFromSheet("form");
    this.urls.forEach(function(url) {
      var data = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();
      data = JSON.parse(data);
      Object.keys(data).forEach(function(element) {
        object.handBook[element] = data[element];
      });
    });
    object.objectKeys = {
      // ключі в довіднику
      institutes: { value: "idinstitute", text: "nameinstitute" },
      departments: {
        value: "iddepartment",
        text: "namedepartment",
        parantValue: "idparentdepartment"
      },
      specialty: {
        value: "specialtyid",
        text: "namespecialtyintegrated",
        parantValue: "departmentid"
      },
      course_number: { value: "courseid", text: "coursename" },
      form_of_training: { value: "formtrainingid", text: "formtrainingname" },
      educational_degree: { value: "educationaldegreeid", text: "educationaldegreename" },
      semester_number: { value: "semesterid", text: "semestername" },
      type_of_control: { value: "typecontrolid", text: "typecontrolname" },
      typepractice: { value: "typepracticeid", text: "typepracticename" },
      rulespractice: { value: "namepracticeid", text: "namepractice", parantValue: "parentid" }
    };
    return object;
  };
  // ------------------------------------

  // ------------------------------------ метод для створення нового файлу довідника //  використувати лише для створення файлу
  this.create = function() {
    var folder = DriveApp.getFolderById("1CklyNVNQ-sI4orD0Gsdm6I0G8YYbGMys");
    var object = this.getDataAsOnbject();
    object.version = 1;
    folder.createFile("dovidnuk.json", JSON.stringify(object));
  };
  // ------------------------------------

  // ------------------------------------  метод для оновлення довідника із джерел зі зміною версії
  this.update = function() {
    var newObject = this.getDataAsOnbject();
    var files = DriveApp.getFilesByName("dovidnuk.json");
    var count = false;
    var version;
    var fileId;
    while (files.hasNext()) {
      if (count) DriveApp.removeFile(files.next());
      else {
        count = true;
        var file = files.next();
        fileId = file.getId();
        var content = DriveApp.getFileById(fileId)
          .getBlob()
          .getDataAsString();
        var data = JSON.parse(content);
        version = data.version;
      }
    }
    if (typeof version == "number" && version >= 1) newObject.version = ++version;
    var content = DriveApp.getFileById(fileId).setContent(JSON.stringify(newObject));
    // user-information-sheet
    var userSpreadSheet = new Sheet("17FqI3CWAc407PEIFzVMAGH2IGbtK6CoHliI-MQVQ7s0");
    userSpreadSheet.updateColomn("accounts", "versionDir", newObject.version);
  };
  // ------------------------------------

  // ------------------------------------ функція для зчитування довідників з файлу
  this.getDirectoriesFromFile = function() {
    var files = DriveApp.getFilesByName("dovidnuk.json");
    var file = files.next();
    var fileId = file.getId();
    var content = DriveApp.getFileById(fileId)
      .getBlob()
      .getDataAsString();
    return JSON.parse(content);
  };
  // ------------------------------------
}

function updateExternalData(){
  new Directories().update();
}
