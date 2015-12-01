Template.registerHelper("sections", function() {
  let ret = [];

  let walk = (items, depth) => {
    _.each(items, item => {
      // Work around (eg) accidental trailing commas leading to spurious holes
      // in IE8.
      if (! item) {
        return;
      }

      if (item instanceof Array) {
        walk(item, depth + 1);

        if (depth === 2) {
          ret.push({ type: "spacer", depth: 2 });
        }
      } else {
        if (typeof(item) === "string") {
          item = {name: item};
        }

        let id = item.name.replace(/[.#]/g, "-");

        ret.push(_.extend({ type: "section", depth: depth, id: id, }, item));
      }
    });
  };

  let namespaces = _.groupBy(DocsNames, name => name.split('.')[0]);

  let toc = _.chain(namespaces).map(
    (functions, namespace) => [namespace, functions]
  ).flatten(true).value();

  walk(toc, 1);

  return ret;
});

Template.registerHelper("type", function(what) {
  return this.type === what;
});

Template.registerHelper("depthIs", function(n) {
  return this.depth === n;
});

Template.registerHelper("isNamespace", function(kind) {
  return kind === "namespace";
});

Template.registerHelper("hasPartial", function(partial) {
  return !!partial;
});