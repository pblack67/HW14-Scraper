$(document).on("click", "#submitButton", function(event) {
  event.preventDefault();
  let requestBody = {
    title: $("#title")
      .val()
      .trim(),
    body: $("#body")
      .val()
      .trim()
  };
  $.post(location.href, requestBody).then(function(data) {
    location.reload();
  });
});
