var hashWithoutHash = function() {
  return location.hash.replace("#", "");
};

Session.setDefault("urlHash", hashWithoutHash());
$(window).on("hashchange", function () {
  Session.set("urlHash", hashWithoutHash());
});

Template.nav.helpers({
  current: function() {
    return Session.get("urlHash") === this.id ? "current" : "";
  }
});
