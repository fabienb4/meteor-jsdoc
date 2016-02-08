let hashWithoutHash = () => {
  return location.hash.replace("#", "");
};

Session.setDefault("urlHash", hashWithoutHash());

$(window).on("hashchange", () => Session.set("urlHash", hashWithoutHash()));

Session.setDefault("showAllTypes", false);

Template.nav.events({
  "change .show-all-types input"(event) {
    Session.set("showAllTypes", event.target.checked);
  },
  "click a"() {
    Session.set("sidebarOpen", false);
  }
});

Template.nav.helpers({
  current() {
    return Session.get("urlHash") === this.id ? "current" : "";
  },
  showAllTypes() {
    return Session.get("showAllTypes");
  },
  nameBraced() {
    return "{{ " + this.name + " }}";
  }
});
