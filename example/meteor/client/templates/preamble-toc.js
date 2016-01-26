Template.preambleToc.helpers({
  links() {
    if (Template.preamble) {
      let preambleHtml = Blaze.toHTML(Template.preamble);
      let toParse      = $("<div/>").append(preambleHtml);

      return toParse.find("[id]").toArray();
    }
  },
  tagNameIs(tagName) {
    return this.tagName === tagName;
  }
});
