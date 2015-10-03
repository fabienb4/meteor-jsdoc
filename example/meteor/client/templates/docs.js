Template.docs.helpers({
  preambleExists() {
    return !!Template.preamble;
  },
});

Template.sidebar.helpers({
  showPreambleToc() {
    return !!Template.preamble;
  }
});
