Template.preambleToc.helpers({
  links() {
    if (Template.preamble) {
      let preambleHtml = Template.preamble.renderFunction().value;
      let toParse      = $("<div/>").append(preambleHtml);

      return toParse.find("[id]").toArray();
    }
  },
  tagNameIs(tagName) {
    return this.tagName === tagName;
  }
});
