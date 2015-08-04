Template.preambleToc.helpers({
  links: function() {
    if (Template.preamble) {
      var preambleHtml = Template.preamble.renderFunction().value;
      var toParse      = $("<div/>").append(preambleHtml);

      return toParse.find("[id]").toArray();
    }
  },
  tagNameIs: function(tagName) {
    return this.tagName === tagName;
  }
});
