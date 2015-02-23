var scrollToHash = function(hash) {
  var $main = $(".main-content");
  var $section = $(hash);

  if ($main.length && $section.length) {
    var sectionTop = $section.offset().top;
    $main.animate({
      scrollTop: $main.scrollTop() + sectionTop - $main.offset().top
    }, "slow");
  }
};

Template.docs.rendered = function() {
  scrollToHash(location.hash);
};

Template.docs.helpers({
  docs: function() {
    return DocsNames;
  }
});
