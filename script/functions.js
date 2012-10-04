SC.initialize({ client_id: '96e6f2775568dab677d60e32e82b74d3' });

var Playlist = Backbone.Model.extend({
	defaults: function() {
		return {
			title: "~~ (new playlist) ~~",
			description: "~~ (about) ~~",
			tracks: []
		};
	}
});

var TapeCollection = Backbone.Collection.extend({
	model: Playlist,
	localStorage: new Store("TapeCollection")
});

var PlaylistView = Backbone.View.extend({
	tag: "div",
	
	events: {
		"keyup h3": "updateMetadata",
		"keyup p": "updateMetadata"
	},
	
	buildTagWithField: function(tag, field) {
		return $(tag, {
			className: field,
			data: { field: field },
			text: this.model.get(field),
			contentEditable: true
		});
	},
	
	render: function() {
		this.$el
			.append(this.buildTagWithField("<h3/>", "title"))
			.append(this.buildTagWithField("<p/>", "description"));
	},
	
	updateMetadata: function(event) {
		var $target = $(event.target);
		this.model.set($target.data('field'), $target.text());
		this.model.save();
	}
});

var TapeView = Backbone.View.extend({
	el: $("#playlists"),
	
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
		this.$el.append(view.$el);
	},
	
	removePlaylist: function(playlist) {
		console.log("remove");
	}
});

var tapeView = new TapeView();