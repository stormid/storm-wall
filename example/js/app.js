(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var _stormWall = require('./libs/storm-wall');

var _stormWall2 = _interopRequireDefault(_stormWall);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var onLoadTasks = [function () {
	_stormWall2.default.init('.js-wall');

	// Load('./js/storm-wall.standalone.js')
	// 	.then(() => {
	// 		StormWall.init('.js-wall');
	// 	});
}];

if ('addEventListener' in window) window.addEventListener('load', function () {
	onLoadTasks.forEach(function (fn) {
		return fn();
	});
});

},{"./libs/storm-wall":7}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var CONSTANTS = exports.CONSTANTS = {
	ERRORS: {
		ROOT: 'Wall cannot be initialised, no trigger elements found',
		ITEM: 'Wall item cannot be found',
		TRIGGER: 'Wall trigger cannot be found'
	},
	KEYCODES: [13, 32],
	EVENTS: ['click', 'keydown']
};

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var defaults = exports.defaults = {
	classNames: {
		ready: '.js-wall--is-ready',
		trigger: '.js-wall-trigger',
		item: '.js-wall-item',
		content: '.js-wall-child',
		panel: '.js-wall-panel',
		panelInner: '.js-wall-panel-inner',
		open: '.js-wall--is-open',
		animating: '.js-wall--is-animating',
		closeButton: '.js-wall-close',
		nextButton: '.js-wall-next',
		previousButton: '.js-wall-previous'
	},
	offset: 120
};

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

//http://goo.gl/5HLl8
exports.default = function (t, b, c, d) {
	t /= d / 2;
	if (t < 1) {
		return c / 2 * t * t + b;
	}
	t--;
	return -c / 2 * (t * (t - 2) - 1) + b;
};

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (element, view) {
	var box = element.getBoundingClientRect();
	return box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b;
};

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _easeInOutQuad = require('./easeInOutQuad');

var _easeInOutQuad2 = _interopRequireDefault(_easeInOutQuad);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var move = function move(amount) {
	document.documentElement.scrollTop = amount;
	document.body.parentNode.scrollTop = amount;
	document.body.scrollTop = amount;
};

var position = function position() {
	return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;
};

exports.default = function (to) {
	var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
	var callback = arguments[2];

	var start = position(),
	    change = to - start,
	    currentTime = 0,
	    increment = 20,
	    animateScroll = function animateScroll() {
		currentTime += increment;
		var val = (0, _easeInOutQuad2.default)(currentTime, start, change, duration);
		move(val);

		if (currentTime < duration) window.requestAnimationFrame(animateScroll);else callback && typeof callback === 'function' && callback();
	};
	animateScroll();
};

},{"./easeInOutQuad":4}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _rafThrottle = require('raf-throttle');

var _rafThrottle2 = _interopRequireDefault(_rafThrottle);

var _scrollTo = require('./libs/scrollTo');

var _scrollTo2 = _interopRequireDefault(_scrollTo);

var _inView = require('./libs/inView');

var _inView2 = _interopRequireDefault(_inView);

var _easeInOutQuad = require('./libs/easeInOutQuad');

var _easeInOutQuad2 = _interopRequireDefault(_easeInOutQuad);

var _defaults = require('./defaults');

var _constants = require('./constants');

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var StormWall = {
	init: function init() {
		var _this = this;

		this.openIndex = false;

		this.initThrottled();
		this.initItems();
		this.initTriggers();
		this.initPanel();
		this.initButtons();

		window.addEventListener('resize', this.throttledResize.bind(this));
		setTimeout(this.equalHeight.bind(this), 100);

		this.node.classList.add(this.settings.classNames.ready.substr(1));

		setTimeout(function () {
			if (!!window.location.hash && !!~document.getElementById(window.location.hash.slice(1)).className.indexOf(_this.settings.classNames.trigger.substr(1))) document.getElementById(window.location.hash.slice(1)).click();
		}, 260);

		return this;
	},
	initThrottled: function initThrottled() {
		var _this2 = this;

		this.throttledResize = (0, _rafThrottle2.default)(function () {
			_this2.equalHeight(_this2.setPanelTop.bind(_this2));
		});

		this.throttledChange = (0, _rafThrottle2.default)(this.change);
		this.throttledPrevious = (0, _rafThrottle2.default)(this.previous);
		this.throttledNext = (0, _rafThrottle2.default)(this.next);
	},
	initTriggers: function initTriggers() {
		var _this3 = this;

		this.items.forEach(function (item, i) {
			var trigger = item.node.querySelector(_this3.settings.classNames.trigger);
			if (!trigger) throw new Error(_constants.CONSTANTS.ERRORS.TRIGGER);

			_constants.CONSTANTS.EVENTS.forEach(function (ev) {
				trigger.addEventListener(ev, function (e) {
					if (e.keyCode && !~_constants.CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
					_this3.throttledChange(i);
					e.preventDefault();
				});
			});
		});
	},
	initPanel: function initPanel() {
		var elementFactory = function elementFactory(element, className, attributes) {
			var el = document.createElement(element);
			el.className = className;
			for (var k in attributes) {
				if (attributes.hasOwnProperty(k)) {
					el.setAttribute(k, attributes[k]);
				}
			}
			return el;
		},
		    panelElement = elementFactory(this.items[0].node.tagName.toLowerCase(), this.settings.classNames.panel.substr(1), { 'aria-hidden': true });

		this.panelInner = elementFactory('div', this.settings.classNames.panelInner.substr(1));
		this.panel = this.node.appendChild(panelElement);

		return this;
	},
	initButtons: function initButtons() {
		var _this4 = this;

		var buttonsTemplate = '<button class="' + this.settings.classNames.closeButton.substr(1) + '" aria-label="close">\n\t\t\t\t\t\t\t\t<svg fill="#000000" height="30" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">\n\t\t\t\t\t\t\t\t\t<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>\n\t\t\t\t\t\t\t\t\t<path d="M0 0h24v24H0z" fill="none"/>\n\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t \t\t<button class="' + this.settings.classNames.previousButton.substr(1) + '" aria-label="previous">\n\t\t\t\t\t\t\t\t <svg fill="#000000" height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg">\n\t\t\t\t\t\t\t\t\t\t<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>\n\t\t\t\t\t\t\t\t\t\t<path d="M0 0h24v24H0z" fill="none"/>\n\t\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t \t\t<button class="' + this.settings.classNames.nextButton.substr(1) + '" aria-label="next">\n\t\t\t\t\t\t\t\t\t<svg fill="#000000" height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg">\n\t\t\t\t\t\t\t\t\t\t<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>\n\t\t\t\t\t\t\t\t\t\t<path d="M0 0h24v24H0z" fill="none"/>\n\t\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t\t </button>';

		this.panel.innerHTML = '' + this.panel.innerHTML + buttonsTemplate;

		_constants.CONSTANTS.EVENTS.forEach(function (ev) {
			_this4.panel.querySelector(_this4.settings.classNames.closeButton).addEventListener(ev, function (e) {
				if (e.keyCode && !~_constants.CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				_this4.close.call(_this4);
			});
			_this4.panel.querySelector(_this4.settings.classNames.previousButton).addEventListener(ev, function (e) {
				if (e.keyCode && !~_constants.CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				_this4.throttledPrevious.call(_this4);
			});
			_this4.panel.querySelector(_this4.settings.classNames.nextButton).addEventListener(ev, function (e) {
				if (e.keyCode && !~_constants.CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				_this4.throttledNext.call(_this4);
			});
		});
	},
	initItems: function initItems() {
		var _this5 = this;

		var items = [].slice.call(this.node.querySelectorAll(this.settings.classNames.item));

		if (items.length === 0) throw new Error(_constants.CONSTANTS.ERRORS.ITEM);

		this.items = items.map(function (item) {
			return {
				node: item,
				content: item.querySelector(_this5.settings.classNames.content),
				trigger: item.querySelector(_this5.settings.classNames.trigger)
			};
		});
	},
	change: function change(i) {
		var _this6 = this;

		if (this.openIndex === false) return this.open(i);
		if (this.openIndex === i) return this.close();
		if (this.items[this.openIndex].node.offsetTop === this.items[i].node.offsetTop) this.close(function () {
			return _this6.open(i, _this6.panel.offsetHeight);
		}, this.panel.offsetHeight);else this.close(function () {
			return _this6.open(i);
		});
	},
	open: function open(i, start, speed) {
		var _this7 = this;

		this.panelSourceContainer = this.items[i].content;
		this.openIndex = i;
		this.setPanelTop();
		this.panelContent = this.panelSourceContainer.firstElementChild.cloneNode(true);
		this.panelInner.appendChild(this.panelContent);
		this.panelSourceContainer.removeChild(this.panelSourceContainer.firstElementChild);
		this.panel.insertBefore(this.panelInner, this.panel.firstElementChild);

		var currentTime = 0,
		    panelStart = start || 0,
		    totalPanelChange = this.panel.offsetHeight - panelStart,
		    rowStart = this.closedHeight + panelStart,
		    totalRowChange = totalPanelChange,
		    duration = speed || 16,
		    animateOpen = function animateOpen() {
			currentTime++;
			_this7.panel.style.height = (0, _easeInOutQuad2.default)(currentTime, panelStart, totalPanelChange, duration) + 'px';
			_this7.resizeRow(_this7.items[_this7.openIndex].node, (0, _easeInOutQuad2.default)(currentTime, rowStart, totalRowChange, duration) + 'px');
			if (currentTime < duration) window.requestAnimationFrame(animateOpen.bind(_this7));else {
				_this7.panel.style.height = 'auto';
				_this7.items[i].node.parentNode.insertBefore(_this7.panel, _this7.items[i].node.nextElementSibling);

				!!window.history && !!window.history.pushState && window.history.pushState({ URL: '#' + _this7.items[i].trigger.getAttribute('id') }, '', '#' + _this7.items[i].trigger.getAttribute('id'));

				if (!(0, _inView2.default)(_this7.panel, function () {
					return {
						l: 0,
						t: 0,
						b: (window.innerHeight || document.documentElement.clientHeight) - _this7.panel.offsetHeight,
						r: window.innerWidth || document.documentElement.clientWidth
					};
				})) (0, _scrollTo2.default)(_this7.panel.offsetTop - _this7.settings.offset);
			}
		};

		this.node.classList.add(this.settings.classNames.open.substr(1));

		this.panel.removeAttribute('aria-hidden');
		this.items[i].trigger.setAttribute('aria-expanded', true);

		animateOpen.call(this);

		return this;
	},
	close: function close(cb, end, speed) {
		var _this8 = this;

		var endPoint = end || 0,
		    currentTime = 0,
		    panelStart = this.panel.offsetHeight,
		    totalPanelChange = endPoint - panelStart,
		    rowStart = this.items[this.openIndex].node.offsetHeight,
		    totalRowChange = totalPanelChange,
		    duration = speed || 16,
		    animateClosed = function animateClosed() {
			currentTime++;
			_this8.panel.style.height = (0, _easeInOutQuad2.default)(currentTime, panelStart, totalPanelChange, duration) + 'px';
			_this8.resizeRow(_this8.items[_this8.openIndex].node, (0, _easeInOutQuad2.default)(currentTime, rowStart, totalRowChange, duration) + 'px');
			if (currentTime < duration) window.requestAnimationFrame(animateClosed.bind(_this8));else {
				if (!endPoint) _this8.panel.style.height = 'auto';
				_this8.panelInner.removeChild(_this8.panelContent);
				_this8.panel.setAttribute('aria-hidden', true);
				_this8.items[_this8.openIndex].trigger.setAttribute('aria-expanded', false);
				_this8.panelSourceContainer.appendChild(_this8.panelContent);
				_this8.node.classList.remove(_this8.settings.classNames.animating.substr(1));
				_this8.node.classList.remove(_this8.settings.classNames.open.substr(1));
				_this8.openIndex = false;
				typeof cb === 'function' && cb();
			}
		};

		this.node.classList.add(this.settings.classNames.animating.substr(1));

		animateClosed.call(this);
	},
	previous: function previous() {
		return this.change(this.openIndex - 1 < 0 ? this.items.length - 1 : this.openIndex - 1);
	},
	next: function next() {
		return this.change(this.openIndex + 1 === this.items.length ? 0 : this.openIndex + 1);
	},
	equalHeight: function equalHeight(cb) {
		var _this9 = this;

		var openHeight = 0,
		    closedHeight = 0;

		this.items.map(function (item, i) {
			item.node.style.height = 'auto';
			if (_this9.openIndex !== false && item.node.offsetTop === _this9.items[_this9.openIndex].node.offsetTop) {
				if (_this9.openIndex === i) openHeight = item.node.offsetHeight + _this9.panel.offsetHeight;
			} else {
				if (item.node.offsetHeight > closedHeight) closedHeight = item.node.offsetHeight;
			}
			return item;
		}).map(function (item, i) {
			if (_this9.openIndex !== i) item.node.style.height = closedHeight + 'px';
		});

		this.openHeight = openHeight;
		this.closedHeight = closedHeight === 0 ? this.closedHeight : closedHeight;

		if (this.openHeight > 0) {
			this.resizeRow(this.items[this.openIndex].node, this.openHeight + 'px');
			typeof cb === 'function' && cb();
		}
	},
	resizeRow: function resizeRow(el, height) {
		this.items.forEach(function (item) {
			if (item.node.offsetTop === el.offsetTop) item.node.style.height = height;
		});
		return this;
	},
	setPanelTop: function setPanelTop() {
		this.panel.style.top = this.items[this.openIndex].node.offsetTop + this.items[this.openIndex].trigger.offsetHeight + 'px';
	}
};

var init = function init(sel, opts) {
	var els = [].slice.call(document.querySelectorAll(sel));

	if (els.length === 0) throw new Error(_constants.CONSTANTS.ERRORS.ROOT);

	return els.map(function (el) {
		return Object.assign(Object.create(StormWall), {
			node: el,
			settings: Object.assign({}, _defaults.defaults, opts)
		}).init();
	});
};

exports.default = { init: init };

},{"./constants":2,"./defaults":3,"./libs/easeInOutQuad":4,"./libs/inView":5,"./libs/scrollTo":6,"raf-throttle":8}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var rafThrottle = function rafThrottle(callback) {
  var requestId = void 0;

  var later = function later(context, args) {
    return function () {
      requestId = null;
      callback.apply(context, args);
    };
  };

  var throttled = function throttled() {
    if (requestId === null || requestId === undefined) {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      requestId = requestAnimationFrame(later(this, args));
    }
  };

  throttled.cancel = function () {
    return cancelAnimationFrame(requestId);
  };

  return throttled;
};

exports.default = rafThrottle;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbnN0YW50cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvZGVmYXVsdHMuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvZWFzZUluT3V0UXVhZC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvbGlicy9pblZpZXcuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvc2Nyb2xsVG8uanMiLCJleGFtcGxlL3NyYy9saWJzL3N0b3JtLXdhbGwuanMiLCJub2RlX21vZHVsZXMvcmFmLXRocm90dGxlL2xpYi9yYWZUaHJvdHRsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7Ozs7O0FBRUEsSUFBTSxlQUFlLFlBQU0sQUFDMUI7cUJBQUEsQUFBSyxLQUFMLEFBQVUsQUFFVjs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBELEFBQW9CLENBQUE7O0FBU3BCLElBQUcsc0JBQUgsQUFBeUIsZUFBUSxBQUFPLGlCQUFQLEFBQXdCLFFBQVEsWUFBTSxBQUFFO2FBQUEsQUFBWSxRQUFRLFVBQUEsQUFBQyxJQUFEO1NBQUEsQUFBUTtBQUE1QixBQUFvQztBQUE1RSxDQUFBOzs7Ozs7OztBQ1gxQixJQUFNOztRQUNKLEFBQ0QsQUFDTjtRQUZPLEFBRUQsQUFDTjtXQUp1QixBQUNoQixBQUdFLEFBRVY7QUFMUSxBQUNQO1dBSVMsQ0FBQSxBQUFDLElBTmEsQUFNZCxBQUFLLEFBQ2Y7U0FBUSxDQUFBLEFBQUMsU0FQSCxBQUFrQixBQU9oQixBQUFVO0FBUE0sQUFDeEI7Ozs7Ozs7O0FDRE0sSUFBTTs7U0FDQSxBQUNKLEFBQ1A7V0FGVyxBQUVGLEFBQ1Q7UUFIVyxBQUdMLEFBQ047V0FKVyxBQUlGLEFBQ1Q7U0FMVyxBQUtKLEFBQ1A7Y0FOVyxBQU1DLEFBQ1o7UUFQVyxBQU9MLEFBQ047YUFSVyxBQVFBLEFBQ1g7ZUFU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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsImltcG9ydCBXYWxsIGZyb20gJy4vbGlicy9zdG9ybS13YWxsJztcblxuY29uc3Qgb25Mb2FkVGFza3MgPSBbKCkgPT4ge1xuXHRXYWxsLmluaXQoJy5qcy13YWxsJyk7XG5cblx0Ly8gTG9hZCgnLi9qcy9zdG9ybS13YWxsLnN0YW5kYWxvbmUuanMnKVxuXHQvLyBcdC50aGVuKCgpID0+IHtcblx0Ly8gXHRcdFN0b3JtV2FsbC5pbml0KCcuanMtd2FsbCcpO1xuXHQvLyBcdH0pO1xufV07XG5cbmlmKCdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cpIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4geyBvbkxvYWRUYXNrcy5mb3JFYWNoKChmbikgPT4gZm4oKSk7IH0pOyIsImV4cG9ydCBjb25zdCBDT05TVEFOVFMgPSB7XG5cdEVSUk9SUzoge1xuXHRcdFJPT1Q6ICdXYWxsIGNhbm5vdCBiZSBpbml0aWFsaXNlZCwgbm8gdHJpZ2dlciBlbGVtZW50cyBmb3VuZCcsXG5cdFx0SVRFTTogJ1dhbGwgaXRlbSBjYW5ub3QgYmUgZm91bmQnLFxuXHRcdFRSSUdHRVI6ICdXYWxsIHRyaWdnZXIgY2Fubm90IGJlIGZvdW5kJ1xuXHR9LFxuXHRLRVlDT0RFUzogWzEzLCAzMl0sXG5cdEVWRU5UUzogWydjbGljaycsICdrZXlkb3duJ11cbn07IiwiZXhwb3J0IGNvbnN0IGRlZmF1bHRzID0ge1xuXHRjbGFzc05hbWVzOiB7XG5cdFx0cmVhZHk6ICcuanMtd2FsbC0taXMtcmVhZHknLFxuXHRcdHRyaWdnZXI6ICcuanMtd2FsbC10cmlnZ2VyJyxcblx0XHRpdGVtOiAnLmpzLXdhbGwtaXRlbScsXG5cdFx0Y29udGVudDogJy5qcy13YWxsLWNoaWxkJyxcblx0XHRwYW5lbDogJy5qcy13YWxsLXBhbmVsJyxcblx0XHRwYW5lbElubmVyOiAnLmpzLXdhbGwtcGFuZWwtaW5uZXInLFxuXHRcdG9wZW46ICcuanMtd2FsbC0taXMtb3BlbicsXG5cdFx0YW5pbWF0aW5nOiAnLmpzLXdhbGwtLWlzLWFuaW1hdGluZycsXG5cdFx0Y2xvc2VCdXR0b246ICcuanMtd2FsbC1jbG9zZScsXG5cdFx0bmV4dEJ1dHRvbjogJy5qcy13YWxsLW5leHQnLFxuXHRcdHByZXZpb3VzQnV0dG9uOiAnLmpzLXdhbGwtcHJldmlvdXMnXG5cdH0sXG5cdG9mZnNldDogMTIwXG59OyIsIi8vaHR0cDovL2dvby5nbC81SExsOFxuZXhwb3J0IGRlZmF1bHQgKHQsIGIsIGMsIGQpID0+IHtcblx0dCAvPSBkIC8gMjtcblx0aWYgKHQgPCAxKSB7XG5cdFx0cmV0dXJuIGMgLyAyICogdCAqIHQgKyBiO1xuXHR9XG5cdHQtLTtcblx0cmV0dXJuIC1jIC8gMiAqICh0ICogKHQgLSAyKSAtIDEpICsgYjtcbn07IiwiZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQsIHZpZXcpID0+IHtcblx0bGV0IGJveCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdHJldHVybiAoYm94LnJpZ2h0ID49IHZpZXcubCAmJiBib3guYm90dG9tID49IHZpZXcudCAmJiBib3gubGVmdCA8PSB2aWV3LnIgJiYgYm94LnRvcCA8PSB2aWV3LmIpO1xufTsiLCJpbXBvcnQgZWFzZUluT3V0UXVhZCBmcm9tICcuL2Vhc2VJbk91dFF1YWQnO1xuXG5jb25zdCBtb3ZlID0gYW1vdW50ID0+IHtcblx0ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA9IGFtb3VudDtcblx0ZG9jdW1lbnQuYm9keS5wYXJlbnROb2RlLnNjcm9sbFRvcCA9IGFtb3VudDtcblx0ZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPSBhbW91bnQ7XG59O1xuXG5jb25zdCBwb3NpdGlvbiA9ICgpID0+IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5wYXJlbnROb2RlLnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcblxuZXhwb3J0IGRlZmF1bHQgKHRvLCBkdXJhdGlvbiA9IDUwMCwgY2FsbGJhY2spID0+IHtcblx0bGV0IHN0YXJ0ID0gcG9zaXRpb24oKSxcblx0XHRjaGFuZ2UgPSB0byAtIHN0YXJ0LFxuXHRcdGN1cnJlbnRUaW1lID0gMCxcblx0XHRpbmNyZW1lbnQgPSAyMCxcblx0XHRhbmltYXRlU2Nyb2xsID0gKCkgPT4ge1xuXHRcdFx0Y3VycmVudFRpbWUgKz0gaW5jcmVtZW50O1xuXHRcdFx0bGV0IHZhbCA9IGVhc2VJbk91dFF1YWQoY3VycmVudFRpbWUsIHN0YXJ0LCBjaGFuZ2UsIGR1cmF0aW9uKTtcblx0XHRcdG1vdmUodmFsKTtcblx0XHRcdFxuXHRcdFx0aWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVTY3JvbGwpO1xuXHRcdFx0ZWxzZSAoY2FsbGJhY2sgJiYgdHlwZW9mIChjYWxsYmFjaykgPT09ICdmdW5jdGlvbicpICYmIGNhbGxiYWNrKCk7XG5cdFx0fTtcblx0YW5pbWF0ZVNjcm9sbCgpO1xufTsiLCJpbXBvcnQgdGhyb3R0bGUgZnJvbSAncmFmLXRocm90dGxlJztcblxuaW1wb3J0IHNjcm9sbFRvIGZyb20gJy4vbGlicy9zY3JvbGxUbyc7XG5pbXBvcnQgaW5WaWV3IGZyb20gJy4vbGlicy9pblZpZXcnO1xuaW1wb3J0IGVhc2VJbk91dFF1YWQgZnJvbSAnLi9saWJzL2Vhc2VJbk91dFF1YWQnO1xuaW1wb3J0IHsgZGVmYXVsdHMgfSBmcm9tICcuL2RlZmF1bHRzJztcbmltcG9ydCB7IENPTlNUQU5UUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuY29uc3QgU3Rvcm1XYWxsID0ge1xuXHRpbml0KCl7XG5cdFx0dGhpcy5vcGVuSW5kZXggPSBmYWxzZTtcblxuXHRcdHRoaXMuaW5pdFRocm90dGxlZCgpO1xuXHRcdHRoaXMuaW5pdEl0ZW1zKCk7XG5cdFx0dGhpcy5pbml0VHJpZ2dlcnMoKTtcblx0XHR0aGlzLmluaXRQYW5lbCgpO1xuXHRcdHRoaXMuaW5pdEJ1dHRvbnMoKTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnRocm90dGxlZFJlc2l6ZS5iaW5kKHRoaXMpKTtcblx0XHRzZXRUaW1lb3V0KHRoaXMuZXF1YWxIZWlnaHQuYmluZCh0aGlzKSwgMTAwKTtcblxuXHRcdHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5yZWFkeS5zdWJzdHIoMSkpO1xuXG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRpZighIXdpbmRvdy5sb2NhdGlvbi5oYXNoICYmICEhfmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNsaWNlKDEpKS5jbGFzc05hbWUuaW5kZXhPZih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMudHJpZ2dlci5zdWJzdHIoMSkpKSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh3aW5kb3cubG9jYXRpb24uaGFzaC5zbGljZSgxKSkuY2xpY2soKTtcblx0XHR9LCAyNjApO1xuXG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0aW5pdFRocm90dGxlZCgpe1xuXHRcdHRoaXMudGhyb3R0bGVkUmVzaXplID0gdGhyb3R0bGUoKCkgPT4ge1xuXHRcdFx0dGhpcy5lcXVhbEhlaWdodCh0aGlzLnNldFBhbmVsVG9wLmJpbmQodGhpcykpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy50aHJvdHRsZWRDaGFuZ2UgPSB0aHJvdHRsZSh0aGlzLmNoYW5nZSk7XG5cdFx0dGhpcy50aHJvdHRsZWRQcmV2aW91cyA9IHRocm90dGxlKHRoaXMucHJldmlvdXMpO1xuXHRcdHRoaXMudGhyb3R0bGVkTmV4dCA9IHRocm90dGxlKHRoaXMubmV4dCk7XG5cdH0sXG5cdGluaXRUcmlnZ2Vycygpe1xuXHRcdHRoaXMuaXRlbXMuZm9yRWFjaCgoaXRlbSwgaSkgPT4ge1xuXHRcdFx0bGV0IHRyaWdnZXIgPSBpdGVtLm5vZGUucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMudHJpZ2dlcik7XG5cdFx0XHRpZighdHJpZ2dlcikgdGhyb3cgbmV3IEVycm9yKENPTlNUQU5UUy5FUlJPUlMuVFJJR0dFUik7XG5cblx0XHRcdENPTlNUQU5UUy5FVkVOVFMuZm9yRWFjaChldiA9PiB7XG5cdFx0XHRcdHRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdFx0aWYoZS5rZXlDb2RlICYmICF+Q09OU1RBTlRTLktFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHRcdHRoaXMudGhyb3R0bGVkQ2hhbmdlKGkpO1xuXHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSxcblx0aW5pdFBhbmVsKCl7XG5cdFx0bGV0IGVsZW1lbnRGYWN0b3J5ID0gKGVsZW1lbnQsIGNsYXNzTmFtZSwgYXR0cmlidXRlcykgPT4ge1xuXHRcdFx0XHRsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsZW1lbnQpO1xuXHRcdFx0XHRlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG5cdFx0XHRcdGZvciAodmFyIGsgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRcdGlmIChhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGspKSB7XG5cdFx0XHRcdFx0XHRlbC5zZXRBdHRyaWJ1dGUoaywgYXR0cmlidXRlc1trXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBlbDtcblx0XHRcdH0sXG5cdFx0XHRwYW5lbEVsZW1lbnQgPSBlbGVtZW50RmFjdG9yeSh0aGlzLml0ZW1zWzBdLm5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpLCB0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMucGFuZWwuc3Vic3RyKDEpLCB7ICdhcmlhLWhpZGRlbic6IHRydWUgfSk7XG5cblx0XHR0aGlzLnBhbmVsSW5uZXIgPSBlbGVtZW50RmFjdG9yeSgnZGl2JywgdGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnBhbmVsSW5uZXIuc3Vic3RyKDEpKTtcblx0XHR0aGlzLnBhbmVsID0gdGhpcy5ub2RlLmFwcGVuZENoaWxkKHBhbmVsRWxlbWVudCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXHRpbml0QnV0dG9ucygpe1xuXHRcdGxldCBidXR0b25zVGVtcGxhdGUgPSBgPGJ1dHRvbiBjbGFzcz1cIiR7dGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLmNsb3NlQnV0dG9uLnN1YnN0cigxKX1cIiBhcmlhLWxhYmVsPVwiY2xvc2VcIj5cblx0XHRcdFx0XHRcdFx0XHQ8c3ZnIGZpbGw9XCIjMDAwMDAwXCIgaGVpZ2h0PVwiMzBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIyNFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cblx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMTkgNi40MUwxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyelwiLz5cblx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMCAwaDI0djI0SDB6XCIgZmlsbD1cIm5vbmVcIi8+XG5cdFx0XHRcdFx0XHRcdFx0PC9zdmc+XG5cdFx0XHRcdFx0XHRcdDwvYnV0dG9uPlxuXHRcdFx0XHRcdFx0IFx0XHQ8YnV0dG9uIGNsYXNzPVwiJHt0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMucHJldmlvdXNCdXR0b24uc3Vic3RyKDEpfVwiIGFyaWEtbGFiZWw9XCJwcmV2aW91c1wiPlxuXHRcdFx0XHRcdFx0XHRcdCA8c3ZnIGZpbGw9XCIjMDAwMDAwXCIgaGVpZ2h0PVwiMzZcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIzNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0xNS40MSA3LjQxTDE0IDZsLTYgNiA2IDYgMS40MS0xLjQxTDEwLjgzIDEyelwiLz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0wIDBoMjR2MjRIMHpcIiBmaWxsPVwibm9uZVwiLz5cblx0XHRcdFx0XHRcdFx0XHRcdDwvc3ZnPlxuXHRcdFx0XHRcdFx0XHRcdDwvYnV0dG9uPlxuXHRcdFx0XHRcdFx0IFx0XHQ8YnV0dG9uIGNsYXNzPVwiJHt0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMubmV4dEJ1dHRvbi5zdWJzdHIoMSl9XCIgYXJpYS1sYWJlbD1cIm5leHRcIj5cblx0XHRcdFx0XHRcdFx0XHRcdDxzdmcgZmlsbD1cIiMwMDAwMDBcIiBoZWlnaHQ9XCIzNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjM2XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTEwIDZMOC41OSA3LjQxIDEzLjE3IDEybC00LjU4IDQuNTlMMTAgMThsNi02elwiLz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0wIDBoMjR2MjRIMHpcIiBmaWxsPVwibm9uZVwiLz5cblx0XHRcdFx0XHRcdFx0XHRcdDwvc3ZnPlxuXHRcdFx0XHRcdFx0XHRcdCA8L2J1dHRvbj5gO1xuXG5cdFx0dGhpcy5wYW5lbC5pbm5lckhUTUwgPSBgJHt0aGlzLnBhbmVsLmlubmVySFRNTH0ke2J1dHRvbnNUZW1wbGF0ZX1gO1xuXG5cdFx0Q09OU1RBTlRTLkVWRU5UUy5mb3JFYWNoKGV2ID0+IHtcblx0XHRcdHRoaXMucGFuZWwucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuY2xvc2VCdXR0b24pLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRpZihlLmtleUNvZGUgJiYgIX5DT05TVEFOVFMuS0VZQ09ERVMuaW5kZXhPZihlLmtleUNvZGUpKSByZXR1cm47XG5cdFx0XHRcdHRoaXMuY2xvc2UuY2FsbCh0aGlzKTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5wYW5lbC5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5wcmV2aW91c0J1dHRvbikuYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0dGhpcy50aHJvdHRsZWRQcmV2aW91cy5jYWxsKHRoaXMpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnBhbmVsLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLm5leHRCdXR0b24pLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRpZihlLmtleUNvZGUgJiYgIX5DT05TVEFOVFMuS0VZQ09ERVMuaW5kZXhPZihlLmtleUNvZGUpKSByZXR1cm47XG5cdFx0XHRcdHRoaXMudGhyb3R0bGVkTmV4dC5jYWxsKHRoaXMpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cdGluaXRJdGVtcygpe1xuXHRcdGxldCBpdGVtcyA9IFtdLnNsaWNlLmNhbGwodGhpcy5ub2RlLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLml0ZW0pKTtcblxuXHRcdGlmKGl0ZW1zLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKENPTlNUQU5UUy5FUlJPUlMuSVRFTSk7XG5cblx0XHR0aGlzLml0ZW1zID0gaXRlbXMubWFwKGl0ZW0gPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bm9kZTogaXRlbSxcblx0XHRcdFx0Y29udGVudDogaXRlbS5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5jb250ZW50KSxcblx0XHRcdFx0dHJpZ2dlcjogaXRlbS5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy50cmlnZ2VyKVxuXHRcdFx0fTtcblx0XHR9KTtcblxuXHR9LFxuXHRjaGFuZ2UoaSl7XG5cdFx0aWYodGhpcy5vcGVuSW5kZXggPT09IGZhbHNlKSByZXR1cm4gdGhpcy5vcGVuKGkpO1xuXHRcdGlmKHRoaXMub3BlbkluZGV4ID09PSBpKSByZXR1cm4gdGhpcy5jbG9zZSgpO1xuXHRcdGlmICh0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLm9mZnNldFRvcCA9PT0gdGhpcy5pdGVtc1tpXS5ub2RlLm9mZnNldFRvcCkgdGhpcy5jbG9zZSgoKSA9PiB0aGlzLm9wZW4oaSwgdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQpLCB0aGlzLnBhbmVsLm9mZnNldEhlaWdodCk7XG5cdFx0ZWxzZSB0aGlzLmNsb3NlKCgpID0+IHRoaXMub3BlbihpKSk7XG5cdH0sXG5cdG9wZW4oaSwgc3RhcnQsIHNwZWVkKXtcblx0XHR0aGlzLnBhbmVsU291cmNlQ29udGFpbmVyID0gdGhpcy5pdGVtc1tpXS5jb250ZW50O1xuXHRcdHRoaXMub3BlbkluZGV4ID0gaTtcblx0XHR0aGlzLnNldFBhbmVsVG9wKCk7XG5cdFx0dGhpcy5wYW5lbENvbnRlbnQgPSB0aGlzLnBhbmVsU291cmNlQ29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkLmNsb25lTm9kZSh0cnVlKTtcblx0XHR0aGlzLnBhbmVsSW5uZXIuYXBwZW5kQ2hpbGQodGhpcy5wYW5lbENvbnRlbnQpO1xuXHRcdHRoaXMucGFuZWxTb3VyY2VDb250YWluZXIucmVtb3ZlQ2hpbGQodGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZCk7XG5cdFx0dGhpcy5wYW5lbC5pbnNlcnRCZWZvcmUodGhpcy5wYW5lbElubmVyLCB0aGlzLnBhbmVsLmZpcnN0RWxlbWVudENoaWxkKTtcblxuXHRcdGxldCBjdXJyZW50VGltZSA9IDAsXG5cdFx0XHRwYW5lbFN0YXJ0ID0gc3RhcnQgfHwgMCxcblx0XHRcdHRvdGFsUGFuZWxDaGFuZ2UgPSB0aGlzLnBhbmVsLm9mZnNldEhlaWdodCAtIHBhbmVsU3RhcnQsXG5cdFx0XHRyb3dTdGFydCA9IHRoaXMuY2xvc2VkSGVpZ2h0ICsgcGFuZWxTdGFydCxcblx0XHRcdHRvdGFsUm93Q2hhbmdlID0gdG90YWxQYW5lbENoYW5nZSxcblx0XHRcdGR1cmF0aW9uID0gc3BlZWQgfHwgMTYsXG5cdFx0XHRhbmltYXRlT3BlbiA9ICgpID0+IHtcblx0XHRcdFx0Y3VycmVudFRpbWUrKztcblx0XHRcdFx0dGhpcy5wYW5lbC5zdHlsZS5oZWlnaHQgPSBlYXNlSW5PdXRRdWFkKGN1cnJlbnRUaW1lLCBwYW5lbFN0YXJ0LCB0b3RhbFBhbmVsQ2hhbmdlLCBkdXJhdGlvbikgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnJlc2l6ZVJvdyh0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLCBlYXNlSW5PdXRRdWFkKGN1cnJlbnRUaW1lLCByb3dTdGFydCwgdG90YWxSb3dDaGFuZ2UsIGR1cmF0aW9uKSArICdweCcpO1xuXHRcdFx0XHRpZiAoY3VycmVudFRpbWUgPCBkdXJhdGlvbikgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlT3Blbi5iaW5kKHRoaXMpKTtcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5wYW5lbC5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy5pdGVtc1tpXS5ub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMucGFuZWwsIHRoaXMuaXRlbXNbaV0ubm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpO1xuXG5cdFx0XHRcdFx0KCEhd2luZG93Lmhpc3RvcnkgJiYgISF3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpICYmIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7IFVSTDogYCMke3RoaXMuaXRlbXNbaV0udHJpZ2dlci5nZXRBdHRyaWJ1dGUoJ2lkJyl9YH0sICcnLCBgIyR7dGhpcy5pdGVtc1tpXS50cmlnZ2VyLmdldEF0dHJpYnV0ZSgnaWQnKX1gKTtcblxuXHRcdFx0XHRcdGlmICghaW5WaWV3KHRoaXMucGFuZWwsICgpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGw6IDAsXG5cdFx0XHRcdFx0XHRcdHQ6IDAsXG5cdFx0XHRcdFx0XHRcdGI6ICh3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkgLSB0aGlzLnBhbmVsLm9mZnNldEhlaWdodCxcblx0XHRcdFx0XHRcdFx0cjogKHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aClcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fSkpIHNjcm9sbFRvKHRoaXMucGFuZWwub2Zmc2V0VG9wIC0gdGhpcy5zZXR0aW5ncy5vZmZzZXQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5hZGQodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLm9wZW4uc3Vic3RyKDEpKTtcblxuXHRcdHRoaXMucGFuZWwucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWhpZGRlbicpO1xuXHRcdHRoaXMuaXRlbXNbaV0udHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKTtcblxuXHRcdGFuaW1hdGVPcGVuLmNhbGwodGhpcyk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0Y2xvc2UoY2IsIGVuZCwgc3BlZWQpe1xuXHRcdGxldCBlbmRQb2ludCA9IGVuZCB8fCAwLFxuXHRcdFx0Y3VycmVudFRpbWUgPSAwLFxuXHRcdFx0cGFuZWxTdGFydCA9IHRoaXMucGFuZWwub2Zmc2V0SGVpZ2h0LFxuXHRcdFx0dG90YWxQYW5lbENoYW5nZSA9IGVuZFBvaW50IC0gcGFuZWxTdGFydCxcblx0XHRcdHJvd1N0YXJ0ID0gdGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZS5vZmZzZXRIZWlnaHQsXG5cdFx0XHR0b3RhbFJvd0NoYW5nZSA9IHRvdGFsUGFuZWxDaGFuZ2UsXG5cdFx0XHRkdXJhdGlvbiA9IHNwZWVkIHx8IDE2LFxuXHRcdFx0YW5pbWF0ZUNsb3NlZCA9ICgpID0+IHtcblx0XHRcdFx0Y3VycmVudFRpbWUrKztcblx0XHRcdFx0dGhpcy5wYW5lbC5zdHlsZS5oZWlnaHQgPSBlYXNlSW5PdXRRdWFkKGN1cnJlbnRUaW1lLCBwYW5lbFN0YXJ0LCB0b3RhbFBhbmVsQ2hhbmdlLCBkdXJhdGlvbikgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnJlc2l6ZVJvdyh0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLCBlYXNlSW5PdXRRdWFkKGN1cnJlbnRUaW1lLCByb3dTdGFydCwgdG90YWxSb3dDaGFuZ2UsIGR1cmF0aW9uKSArICdweCcpO1xuXHRcdFx0XHRpZiAoY3VycmVudFRpbWUgPCBkdXJhdGlvbikgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlQ2xvc2VkLmJpbmQodGhpcykpO1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRpZiAoIWVuZFBvaW50KSB0aGlzLnBhbmVsLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcblx0XHRcdFx0XHR0aGlzLnBhbmVsSW5uZXIucmVtb3ZlQ2hpbGQodGhpcy5wYW5lbENvbnRlbnQpO1xuXHRcdFx0XHRcdHRoaXMucGFuZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuXHRcdFx0XHRcdHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLnRyaWdnZXIuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpO1xuXHRcdFx0XHRcdHRoaXMucGFuZWxTb3VyY2VDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5wYW5lbENvbnRlbnQpO1xuXHRcdFx0XHRcdHRoaXMubm9kZS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5hbmltYXRpbmcuc3Vic3RyKDEpKTtcblx0XHRcdFx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMub3Blbi5zdWJzdHIoMSkpO1xuXHRcdFx0XHRcdHRoaXMub3BlbkluZGV4ID0gZmFsc2U7XG5cdFx0XHRcdFx0dHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICYmIGNiKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuYW5pbWF0aW5nLnN1YnN0cigxKSk7XG5cblx0XHRhbmltYXRlQ2xvc2VkLmNhbGwodGhpcyk7XG5cdH0sXG5cdHByZXZpb3VzKCkge1xuXHRcdHJldHVybiB0aGlzLmNoYW5nZSgodGhpcy5vcGVuSW5kZXggLSAxIDwgMCA/IHRoaXMuaXRlbXMubGVuZ3RoIC0gMSA6IHRoaXMub3BlbkluZGV4IC0gMSkpO1xuXHR9LFxuXHRuZXh0KCkge1xuXHRcdHJldHVybiB0aGlzLmNoYW5nZSgodGhpcy5vcGVuSW5kZXggKyAxID09PSB0aGlzLml0ZW1zLmxlbmd0aCA/IDAgOiB0aGlzLm9wZW5JbmRleCArIDEpKTtcblx0fSxcblx0ZXF1YWxIZWlnaHQoY2IpIHtcblx0XHRsZXQgb3BlbkhlaWdodCA9IDAsXG5cdFx0XHRjbG9zZWRIZWlnaHQgPSAwO1xuXG5cdFx0dGhpcy5pdGVtcy5tYXAoKGl0ZW0sIGkpID0+IHtcblx0XHRcdGl0ZW0ubm9kZS5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG5cdFx0XHRpZiAodGhpcy5vcGVuSW5kZXggIT09IGZhbHNlICYmIGl0ZW0ubm9kZS5vZmZzZXRUb3AgPT09IHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUub2Zmc2V0VG9wKSB7XG5cdFx0XHRcdGlmICh0aGlzLm9wZW5JbmRleCA9PT0gaSkgb3BlbkhlaWdodCA9IGl0ZW0ubm9kZS5vZmZzZXRIZWlnaHQgKyB0aGlzLnBhbmVsLm9mZnNldEhlaWdodDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChpdGVtLm5vZGUub2Zmc2V0SGVpZ2h0ID4gY2xvc2VkSGVpZ2h0KSBjbG9zZWRIZWlnaHQgPSBpdGVtLm5vZGUub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0fSkubWFwKChpdGVtLCBpKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5vcGVuSW5kZXggIT09IGkpIGl0ZW0ubm9kZS5zdHlsZS5oZWlnaHQgPSBjbG9zZWRIZWlnaHQgKyAncHgnO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5vcGVuSGVpZ2h0ID0gb3BlbkhlaWdodDtcblx0XHR0aGlzLmNsb3NlZEhlaWdodCA9IGNsb3NlZEhlaWdodCA9PT0gMCA/IHRoaXMuY2xvc2VkSGVpZ2h0IDogY2xvc2VkSGVpZ2h0O1xuXG5cdFx0aWYgKHRoaXMub3BlbkhlaWdodCA+IDApIHtcblx0XHRcdHRoaXMucmVzaXplUm93KHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUsIHRoaXMub3BlbkhlaWdodCArICdweCcpO1xuXHRcdFx0dHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICYmIGNiKCk7XG5cdFx0fVxuXHR9LFxuXHRyZXNpemVSb3coZWwsIGhlaWdodCl7XG5cdFx0dGhpcy5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuXHRcdFx0aWYgKGl0ZW0ubm9kZS5vZmZzZXRUb3AgPT09IGVsLm9mZnNldFRvcCkgaXRlbS5ub2RlLnN0eWxlLmhlaWdodCA9IGhlaWdodDtcblx0XHR9KTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0c2V0UGFuZWxUb3AoKSB7XG5cdFx0dGhpcy5wYW5lbC5zdHlsZS50b3AgPSBgJHt0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLm9mZnNldFRvcCArIHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLnRyaWdnZXIub2Zmc2V0SGVpZ2h0fXB4YDtcblx0fVxufTtcblxuY29uc3QgaW5pdCA9IChzZWwsIG9wdHMpID0+IHtcblx0bGV0IGVscyA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcblxuXHRpZihlbHMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoQ09OU1RBTlRTLkVSUk9SUy5ST09UKTtcblxuXHRyZXR1cm4gZWxzLm1hcChlbCA9PiB7XG5cdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShTdG9ybVdhbGwpLCB7XG5cdFx0XHRub2RlOiBlbCxcblx0XHRcdHNldHRpbmdzOiBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgb3B0cylcblx0XHR9KS5pbml0KCk7XG5cdH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgeyBpbml0IH07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgcmFmVGhyb3R0bGUgPSBmdW5jdGlvbiByYWZUaHJvdHRsZShjYWxsYmFjaykge1xuICB2YXIgcmVxdWVzdElkID0gdm9pZCAwO1xuXG4gIHZhciBsYXRlciA9IGZ1bmN0aW9uIGxhdGVyKGNvbnRleHQsIGFyZ3MpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmVxdWVzdElkID0gbnVsbDtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH07XG4gIH07XG5cbiAgdmFyIHRocm90dGxlZCA9IGZ1bmN0aW9uIHRocm90dGxlZCgpIHtcbiAgICBpZiAocmVxdWVzdElkID09PSBudWxsIHx8IHJlcXVlc3RJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0SWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobGF0ZXIodGhpcywgYXJncykpO1xuICAgIH1cbiAgfTtcblxuICB0aHJvdHRsZWQuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjYW5jZWxBbmltYXRpb25GcmFtZShyZXF1ZXN0SWQpO1xuICB9O1xuXG4gIHJldHVybiB0aHJvdHRsZWQ7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSByYWZUaHJvdHRsZTsiXX0=
