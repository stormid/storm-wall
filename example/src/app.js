var UTILS = {
		attributelist: require('storm-attributelist')
	},
	UI = (function(w, d) {
		'use strict';

		var Wall = require('./libs/storm-wall'),
			init = function() {
				Wall.init();
			};

		return {
			init: init
		};

	})(window, document, undefined);


global.STORM = {
    UTILS: UTILS,
    UI: UI
};

if('addEventListener' in window) window.addEventListener('load', STORM.UI.init, false);