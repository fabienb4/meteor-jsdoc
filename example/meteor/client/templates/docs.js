Template.docs.helpers({
  preambleExists: function() {
    return !!Template.preamble;
  },
});

Template.sidebar.helpers({
  showPreambleToc: function() {
    return !!Template.preamble;
  }
});
