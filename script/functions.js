SC.initialize({ client_id: '96e6f2775568dab677d60e32e82b74d3' });

var Playlist = Backbone.Model.extend({
	defaults: function() {
		return {
			title: "~~ (new playlist) ~~",
			description: "~~ (about) ~~",
			tracks: [],
			created: +Date.now()
		};
	}
});

var TapeCollection = Backbone.Collection.extend({
	model: Playlist,
	localStorage: new Store("TapeCollection"),
	comparator: function(playlist) {
		return -playlist.get('created');
	}
});

var PlaylistView = Backbone.View.extend({
	tag: "div",
	
	events: {
		"keyup h3": "updateMetadata",
		"keyup p": "updateMetadata"
	},
	
	initialize: function() {
		this.model.bind("change", function() { this.model.save(); }, this);
	},
	
	render: function() {
		this.$el
			.append(this.buildTagWithField("<h3/>", "title"))
			.append(this.buildTagWithField("<p/>", "description"));
	},
	
	buildTagWithField: function(tag, field) {
		return $(tag, {
			className: field,
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
		"click #add": "createPlaylist"
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
	}
});

var tapeView = new TapeView();