APICollection = new Mongo.Collection(null);

_.each(DocsData, function(val) {
  // XXX only insert things that are actually in the docs
  if (val.kind !== "namespace") {
    APICollection.insert(val);
  }
});

Session.setDefault("searchOpen", false);
Session.setDefault("searchQuery", "");
Session.setDefault("searchResults", []);
Session.setDefault("selectedResultId", null);

// Close search with ESC
$(document).on("keydown", function(event) {
  if (event.which === 27) {
    Session.set("searchOpen", false);
  }
});

$(document).on("keydown", function(event) {
  // Don't activate search for special keys or keys with modifiers
  if (event.which >= 48 && event.which <= 90 && (! event.ctrlKey) &&
      (! event.metaKey) && (! Session.get("searchOpen"))) {
    Session.set("searchOpen", true);

    Tracker.flush();
    $(".search-query").val("");
    $(".search-query").focus();
  }
});

// scroll $parent to make sure $child is visible
// XXX doesn't work that well, needs improvement
let ensureVisible = function($child, $parent) {
  if (! $child) {
    return;
  }

  // make sure it's inside the visible area
  let parentTop    = $parent.offset() && $parent.offset().top;
  let parentHeight = $parent.height();
  let childTop     = $child.offset() && $child.offset().top;
  let childHeight  = $child.height();

  // check if bottom is below visible part
  if (childTop + childHeight > parentTop + parentHeight) {
    let amount = $parent.scrollTop() +
      (childTop + childHeight - (parentTop + parentHeight));
    $parent.scrollTop(amount);
  }

  // check if top is above visible section
  if (childTop < parentTop) {
    $parent.scrollTop($parent.scrollTop() + childTop - parentTop);
  }
};

// Whenever selectedResultId changes, make sure the selected element is visible
Tracker.autorun(function() {
  if (Session.get("selectedResultId")) {
    Tracker.afterFlush(() => {
      ensureVisible($(".search-results .selected"), $(".search-results"));
    });
  }
});

let indexOfByFunction = function(array, truthFunction) {
  for (let i = 0; i < array.length; i++) {
    if (truthFunction(array[i], i, array)) {
      return i;
    }
  }
  return -1;
};

let selectPrevItem = function() {
  // find currently selected item
  let curIndex = indexOfByFunction(Session.get("searchResults"), (res) => {
    return res._id === Session.get("selectedResultId");
  });

  // select the previous item
  if (curIndex > 0) {
    Session.set("selectedResultId",
      Session.get("searchResults")[curIndex - 1]._id);
  }
};

let selectNextItem = function() {
  // find currently selected item
  let curIndex = indexOfByFunction(Session.get("searchResults"), (res) => {
    return res._id === Session.get("selectedResultId");
  });

  // select the previous item
  if (curIndex < Session.get("searchResults").length - 1) {
    Session.set("selectedResultId",
      Session.get("searchResults")[curIndex + 1]._id);
  }
};

Template.search.events({
  "keyup input"(event) {
    Session.set("searchQuery", event.target.value);
  },
  "click .close-search"() {
    Session.set("searchOpen", false);
    return false;
  },
  "click .search-results > li a"() {
    Session.set("searchOpen", false);
  },
  "keydown"(event) {
    if (event.which === 13) {
      Tracker.afterFlush(function() {
        if (Session.get("selectedResultId")) {
          // XXX make sure this is completely up to date
          let selectedName = APICollection.findOne(Session.get("selectedResultId")).longname;
          let id = selectedName.replace(/[.#]/g, "-");
          let url = "#/full/" + id;

          window.location.replace(url);
          Session.set("searchOpen", false);
        }
      });

      // exit function
      return;
    }

    if (event.which === 38) {
      // up
      selectPrevItem();
      return false;
    } else if (event.which === 40) {
      // down
      selectNextItem();
      return false;
    }
  }
});

// When you have two arrays of search results, use this function to deduplicate
// them
let dedup = function(arrayOfSearchResultsArrays) {
  let ids = {};
  let dedupedResults = [];

  _.each(arrayOfSearchResultsArrays, (searchResults) => {
    _.each(searchResults, (item) => {
      if (! ids.hasOwnProperty(item._id)) {
        ids[item._id] = true;

        dedupedResults.push(item);
      }
    });
  });

  return dedupedResults;
};

// Only update the search results every 200 ms
let updateSearchResults = _.throttle((query) => {
  let regex = new RegExp(query, "i");

  // We do two separate queries so that we can be sure that the name matches
  // are above the summary matches, since they are probably more relevant
  let nameMatches = APICollection.find({
    longname: {
      $regex: regex
    }
  }).fetch();

  let summaryMatches = APICollection.find({
    summary: {
      $regex: regex
    }
  }).fetch();

  let deduplicatedResults = dedup([nameMatches, summaryMatches]);

  Session.set("searchResults", deduplicatedResults);

  if (deduplicatedResults.length) {
    Session.set("selectedResultId", deduplicatedResults[0]._id);
  }
}, 200);

// Call updateSearchResults when the query changes
Tracker.autorun(() => {
  if (Session.get("searchQuery")) {
    updateSearchResults(Session.get("searchQuery"));
  } else {
    Session.set("searchResults", []);
  }
});

Template.search.helpers({
  searchResults() {
    return Session.get("searchResults");
  },
  searchOpen() {
    return Session.get("searchOpen");
  },
  selected(_id) {
    return _id === Session.get("selectedResultId");
  },
  link() {
    return this.longname.replace(/[.#]/g, "-");
  }
});
