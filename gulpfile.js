const gulp = require("gulp");
const exec = require("child_process").exec;

gulp.task("push", function(done) {
  exec("clasp push", function(err, stdout, stderr) {
    done(err);
  });
});

gulp.task("watch", function(done) {
  gulp.watch(["**/*.js", "**/*.html"], gulp.series("push"));
  done();
});

gulp.task("default", gulp.series("push", "watch"));
