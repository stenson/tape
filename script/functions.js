SC.initialize({ client_id: '96e6f2775568dab677d60e32e82b74d3' });

var Playlist = Backbone.Model.extend({
  defaults: function() {
    return {
      title: "~~ (new playlist) ~~",
      description: "~~ (about) ~~",
      tracks: [],
      created: +Date.now()
    };
  },

  initialize: function(tracks) {
    this.trackSet = new TrackSet();
    if (tracks) {
      this.trackSet.add(tracks);
    }
  },

  render: function() {
    _.each(this.resultsSet.models, this.renderTrack, this);
  },

  renderTrack: function() {

  }
});

var Track = Backbone.Model.extend({});

var TapeCollection = Backbone.Collection.extend({
  model: Playlist,
  localStorage: new Store("TapeCollection"),
  comparator: function(playlist) {
    return playlist.get('created');
  }
});

var TrackSet = Backbone.Collection.extend({ model: Track });

var PlaylistView = Backbone.View.extend({
  tag: "div",

  events: {
    "keyup h3.title": "updateMetadata",
    "keyup p.description": "updateMetadata"
  },

  initialize: function() {
    this.model.bind("change", function() { this.model.save(); }, this);
  },

  render: function() {
    this.$el.addClass("playlist")
      .append(this.buildTagWithField("<h3/>", "title"))
      .append(this.buildTagWithField("<p/>", "description"));
  },

  buildTagWithField: function(tag, field) {
    return $(tag, {
      "class": field,
      data: { field: field },
      text: this.model.get(field),
      contentEditable: true
    });
  },

  updateMetadata: function(event) {
    var $target = $(event.target);
    this.model.set($target.data('field'), $target.text());
  }
});

var TapeView = Backbone.View.extend({
  el: $("#tape"),

  events: {
    "click #add": "createPlaylist",
    "click #track-search button": "searchTracks"
  },

  initialize: function() {
    this.tapeCollection = new TapeCollection();
    this.tapeCollection
      .bind('reset', this.render, this)
      .bind('add', this.renderPlaylist, this)
      .bind('remove', this.removePlaylist, this)
      .fetch();
  },

  render: function() {
    _.each(this.tapeCollection.models, this.renderPlaylist, this);
  },

  renderPlaylist: function(playlist) {
    var view = new PlaylistView({ model: playlist });
    view.render();
    this.$("#playlists").append(view.$el);
  },

  removePlaylist: function(playlist) {
    console.log("remove");
  },

  createPlaylist: function() {
    this.tapeCollection.push().save();
  },

  searchTracks: function(a,b,c) {
    var q = this.$("#track-search input.q").val();
    SC.get('/tracks', { q: q }, _.bind(function(tracks) {
      var results = new SearchResultView(tracks);
      results.render();
      this.$("#results").append(results.$el);
    }, this));
  }
});

var tapeView = new TapeView();