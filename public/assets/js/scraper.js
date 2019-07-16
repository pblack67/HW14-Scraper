$(document).on("click", "#scrape", function() {
  $.get("/scrape").then(function(data) {
    location.reload();
  });
});
