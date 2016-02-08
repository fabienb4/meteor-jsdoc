Template.body.events({
  "click .open-sidebar"() {
    Session.set("sidebarOpen", true);
  },
  "click .close-sidebar"() {
    Session.set("sidebarOpen", false);
  }
});

Template.body.helpers({
  openSidebar() {
    return Session.get("sidebarOpen") ? "sidebar-open" : "sidebar-closed";
  }
});
