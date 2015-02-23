var hashWithoutHash = function() {
  return location.hash.replace("#", "");
};

Session.setDefault("urlHash", hashWithoutHash());
$(window).on("hashchange", function () {
  Session.set("urlHash", hashWithoutHash());
});

console.log(Session.get("urlHash"));

Template.nav.helpers({
  current: function() {
    console.log(this);
    return Session.get("urlHash") === this.id ? "current" : "";
  }
});
