SC.initialize({ client_id: '96e6f2775568dab677d60e32e82b74d3' });
//SC.get('/tracks/13158665', {}, function(response, err) {});

var emptyStore = {
	tracks: []
};

var keys = {
	metadata: 'VLFTape_metadata',
	playlists: 'VLFTape_playlists'
};

var $playlists = $("#playlists");
var history = [];
var historyPointer = null;

var initialize = function() {
	Object.keys(store.getAll()).forEach(function(key) {
		if (key.match(keys.playlists)) {
			drawPlaylist(store.get(key), $playlists);
		}
	});
	
	$playlists.on("keyup", "h3", function() {
		setTimeout(function() {
			tapeVerbs.editPlaylistTitle($(this).text(), $(this).data('playlist-id'));
		}.bind(this), 0);
	});
};

var drawPlaylist = function(playlist, $el) {
	var $tracks = $("<div/>", { "class": "tracks" });
	var $title = $("<h3/>", {
		text: playlist.title || playlist.id,
		contentEditable: "true",
		data: { "playlist-id": playlist.id }
	});
	var $playlist = $("<div/>");
	$playlist.append($title).append($tracks);
	$el.append($playlist);
	
	playlist.tracks.forEach(function(trackId) {
		drawTrack(trackId, $tracks);
	});
};

var drawTrack = function(trackId, $el) {
	var $track = $("<div/>", { "class": "track", text: "..." });
	$el.append($track);
	
	SC.get('/tracks/' + trackId, function(info) {
		$track.text(info.title);
	});
};

// data-store modifying functions

var getPlaylist = function(id) {
	return store.get(keys.playlists + "_" + id) || console.error("no such playlist");
};

var savePlaylist = function(playlist) {
	store.set(keys.playlists + "_" + playlist.id, playlist);
};

var tapeVerbs = {
	addTrackToPlaylist: function(trackId, playlistId, index) {
		var playlist = getPlaylist(playlistId);
		
		if (index) {
			playlist.tracks.splice(index, 0, trackId);
		} else {
			index = playlist.tracks.push(trackId) - 1;
		}
		
		savePlaylist(playlist);
		recordReverseInHistory("deleteTrackAtIndexFromPlaylist", [index, playlistId]);
	},
	
	deleteTrackAtIndexFromPlaylist: function(index, playlistId) {
		var playlist = getPlaylist(playlistId);
		var trackId = playlist.tracks.splice(index, 1);
		savePlaylist(playlist);
		recordReverseInHistory("addTrackToPlaylist", [trackId, playlistId, index]);
	},
	
	editPlaylistTitle: function(title, playlistId) {
		var playlist = getPlaylist(playlistId);
		var oldTitle = playlist.title;
		playlist.title = title;
		savePlaylist(playlist);
		// undos automatically given contentEditable?
	},
	
	addPlaylist: function(playlistId) {
		var playlist = Playlist(playlistId);
		savePlaylist(playlist);
		recordReverseInHistory("deletePlaylist", [playlist.id]);
		return playlist.id;
	},
	
	deletePlaylist: function(playlistId) {
		var playlist = getPlaylist(playlistId);
		store.set(keys.playlists + "_" + playlistId + "_deleted", playlist);
		store.set(keys.playlists + "_" + playlistId, null);
		recordReverseInHistory("addPlaylist", [playlistId]);
	}
};

var undo = function() {
	if (history.length > 0) {
		var action = history[historyPointer - 1];
		historyPointer++; // need to clear dead history
		tapeVerbs[action[0]].apply(null, action[1]);
	} else {
		console.log("Nothing to undo");
	}
};

var redo = function() {
	
};

// @subject — { "tape", "playlist" }
// @verb — { "delete", "add", "edit" }
var recordReverseInHistory = function(functionName, arguments) {
	historyPointer -= 1;
	history.push([functionName, arguments]);
};

var Playlist = function(id, title, description, tracks) {
	return {
		id: id || +Date.now(),
		title: title || "New Playlist",
		tracks: tracks || [],
		description: description || ""
	};
};

initialize();