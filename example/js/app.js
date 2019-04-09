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
				if (typeof cb === 'function') cb();else !!window.history && !!window.history.pushState && history.pushState('', document.title, window.location.pathname + window.location.search);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2NvbnN0YW50cy5qcyIsImV4YW1wbGUvc3JjL2xpYnMvZGVmYXVsdHMuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvZWFzZUluT3V0UXVhZC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvbGlicy9pblZpZXcuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvc2Nyb2xsVG8uanMiLCJleGFtcGxlL3NyYy9saWJzL3N0b3JtLXdhbGwuanMiLCJub2RlX21vZHVsZXMvcmFmLXRocm90dGxlL2xpYi9yYWZUaHJvdHRsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7Ozs7O0FBRUEsSUFBTSxlQUFlLFlBQU0sQUFDMUI7cUJBQUEsQUFBSyxLQUFMLEFBQVUsQUFFVjs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVBELEFBQW9CLENBQUE7O0FBU3BCLElBQUcsc0JBQUgsQUFBeUIsZUFBUSxBQUFPLGlCQUFQLEFBQXdCLFFBQVEsWUFBTSxBQUFFO2FBQUEsQUFBWSxRQUFRLFVBQUEsQUFBQyxJQUFEO1NBQUEsQUFBUTtBQUE1QixBQUFvQztBQUE1RSxDQUFBOzs7Ozs7OztBQ1gxQixJQUFNOztRQUNKLEFBQ0QsQUFDTjtRQUZPLEFBRUQsQUFDTjtXQUp1QixBQUNoQixBQUdFLEFBRVY7QUFMUSxBQUNQO1dBSVMsQ0FBQSxBQUFDLElBTmEsQUFNZCxBQUFLLEFBQ2Y7U0FBUSxDQUFBLEFBQUMsU0FQSCxBQUFrQixBQU9oQixBQUFVO0FBUE0sQUFDeEI7Ozs7Ozs7O0FDRE0sSUFBTTs7U0FDQSxBQUNKLEFBQ1A7V0FGVyxBQUVGLEFBQ1Q7UUFIVyxBQUdMLEFBQ047V0FKVyxBQUlGLEFBQ1Q7U0FMVyxBQUtKLEFBQ1A7Y0FOVyxBQU1DLEFBQ1o7UUFQVyxBQU9MLEFBQ047YUFSVyxBQVFBLEFBQ1g7ZUFU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QUFDSDtBQUxELEFBQU8sQUFNUCxFQU5PO0FBTFI7O2tCQWFlLEVBQUUsTSxBQUFGOzs7QUNwUWY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJpbXBvcnQgV2FsbCBmcm9tICcuL2xpYnMvc3Rvcm0td2FsbCc7XG5cbmNvbnN0IG9uTG9hZFRhc2tzID0gWygpID0+IHtcblx0V2FsbC5pbml0KCcuanMtd2FsbCcpO1xuXG5cdC8vIExvYWQoJy4vanMvc3Rvcm0td2FsbC5zdGFuZGFsb25lLmpzJylcblx0Ly8gXHQudGhlbigoKSA9PiB7XG5cdC8vIFx0XHRTdG9ybVdhbGwuaW5pdCgnLmpzLXdhbGwnKTtcblx0Ly8gXHR9KTtcbn1dO1xuXG5pZignYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93KSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHsgb25Mb2FkVGFza3MuZm9yRWFjaCgoZm4pID0+IGZuKCkpOyB9KTsiLCJleHBvcnQgY29uc3QgQ09OU1RBTlRTID0ge1xuXHRFUlJPUlM6IHtcblx0XHRST09UOiAnV2FsbCBjYW5ub3QgYmUgaW5pdGlhbGlzZWQsIG5vIHRyaWdnZXIgZWxlbWVudHMgZm91bmQnLFxuXHRcdElURU06ICdXYWxsIGl0ZW0gY2Fubm90IGJlIGZvdW5kJyxcblx0XHRUUklHR0VSOiAnV2FsbCB0cmlnZ2VyIGNhbm5vdCBiZSBmb3VuZCdcblx0fSxcblx0S0VZQ09ERVM6IFsxMywgMzJdLFxuXHRFVkVOVFM6IFsnY2xpY2snLCAna2V5ZG93biddXG59OyIsImV4cG9ydCBjb25zdCBkZWZhdWx0cyA9IHtcblx0Y2xhc3NOYW1lczoge1xuXHRcdHJlYWR5OiAnLmpzLXdhbGwtLWlzLXJlYWR5Jyxcblx0XHR0cmlnZ2VyOiAnLmpzLXdhbGwtdHJpZ2dlcicsXG5cdFx0aXRlbTogJy5qcy13YWxsLWl0ZW0nLFxuXHRcdGNvbnRlbnQ6ICcuanMtd2FsbC1jaGlsZCcsXG5cdFx0cGFuZWw6ICcuanMtd2FsbC1wYW5lbCcsXG5cdFx0cGFuZWxJbm5lcjogJy5qcy13YWxsLXBhbmVsLWlubmVyJyxcblx0XHRvcGVuOiAnLmpzLXdhbGwtLWlzLW9wZW4nLFxuXHRcdGFuaW1hdGluZzogJy5qcy13YWxsLS1pcy1hbmltYXRpbmcnLFxuXHRcdGNsb3NlQnV0dG9uOiAnLmpzLXdhbGwtY2xvc2UnLFxuXHRcdG5leHRCdXR0b246ICcuanMtd2FsbC1uZXh0Jyxcblx0XHRwcmV2aW91c0J1dHRvbjogJy5qcy13YWxsLXByZXZpb3VzJ1xuXHR9LFxuXHRvZmZzZXQ6IDEyMFxufTsiLCIvL2h0dHA6Ly9nb28uZ2wvNUhMbDhcbmV4cG9ydCBkZWZhdWx0ICh0LCBiLCBjLCBkKSA9PiB7XG5cdHQgLz0gZCAvIDI7XG5cdGlmICh0IDwgMSkge1xuXHRcdHJldHVybiBjIC8gMiAqIHQgKiB0ICsgYjtcblx0fVxuXHR0LS07XG5cdHJldHVybiAtYyAvIDIgKiAodCAqICh0IC0gMikgLSAxKSArIGI7XG59OyIsImV4cG9ydCBkZWZhdWx0IChlbGVtZW50LCB2aWV3KSA9PiB7XG5cdGxldCBib3ggPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRyZXR1cm4gKGJveC5yaWdodCA+PSB2aWV3LmwgJiYgYm94LmJvdHRvbSA+PSB2aWV3LnQgJiYgYm94LmxlZnQgPD0gdmlldy5yICYmIGJveC50b3AgPD0gdmlldy5iKTtcbn07IiwiaW1wb3J0IGVhc2VJbk91dFF1YWQgZnJvbSAnLi9lYXNlSW5PdXRRdWFkJztcblxuY29uc3QgbW92ZSA9IGFtb3VudCA9PiB7XG5cdGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgPSBhbW91bnQ7XG5cdGRvY3VtZW50LmJvZHkucGFyZW50Tm9kZS5zY3JvbGxUb3AgPSBhbW91bnQ7XG5cdGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gYW1vdW50O1xufTtcblxuY29uc3QgcG9zaXRpb24gPSAoKSA9PiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkucGFyZW50Tm9kZS5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG5cbmV4cG9ydCBkZWZhdWx0ICh0bywgZHVyYXRpb24gPSA1MDAsIGNhbGxiYWNrKSA9PiB7XG5cdGxldCBzdGFydCA9IHBvc2l0aW9uKCksXG5cdFx0Y2hhbmdlID0gdG8gLSBzdGFydCxcblx0XHRjdXJyZW50VGltZSA9IDAsXG5cdFx0aW5jcmVtZW50ID0gMjAsXG5cdFx0YW5pbWF0ZVNjcm9sbCA9ICgpID0+IHtcblx0XHRcdGN1cnJlbnRUaW1lICs9IGluY3JlbWVudDtcblx0XHRcdGxldCB2YWwgPSBlYXNlSW5PdXRRdWFkKGN1cnJlbnRUaW1lLCBzdGFydCwgY2hhbmdlLCBkdXJhdGlvbik7XG5cdFx0XHRtb3ZlKHZhbCk7XG5cdFx0XHRcblx0XHRcdGlmIChjdXJyZW50VGltZSA8IGR1cmF0aW9uKSAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlU2Nyb2xsKTtcblx0XHRcdGVsc2UgKGNhbGxiYWNrICYmIHR5cGVvZiAoY2FsbGJhY2spID09PSAnZnVuY3Rpb24nKSAmJiBjYWxsYmFjaygpO1xuXHRcdH07XG5cdGFuaW1hdGVTY3JvbGwoKTtcbn07IiwiaW1wb3J0IHRocm90dGxlIGZyb20gJ3JhZi10aHJvdHRsZSc7XG5cbmltcG9ydCBzY3JvbGxUbyBmcm9tICcuL2xpYnMvc2Nyb2xsVG8nO1xuaW1wb3J0IGluVmlldyBmcm9tICcuL2xpYnMvaW5WaWV3JztcbmltcG9ydCBlYXNlSW5PdXRRdWFkIGZyb20gJy4vbGlicy9lYXNlSW5PdXRRdWFkJztcbmltcG9ydCB7IGRlZmF1bHRzIH0gZnJvbSAnLi9kZWZhdWx0cyc7XG5pbXBvcnQgeyBDT05TVEFOVFMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmNvbnN0IFN0b3JtV2FsbCA9IHtcblx0aW5pdCgpe1xuXHRcdHRoaXMub3BlbkluZGV4ID0gZmFsc2U7XG5cblx0XHR0aGlzLmluaXRUaHJvdHRsZWQoKTtcblx0XHR0aGlzLmluaXRJdGVtcygpO1xuXHRcdHRoaXMuaW5pdFRyaWdnZXJzKCk7XG5cdFx0dGhpcy5pbml0UGFuZWwoKTtcblx0XHR0aGlzLmluaXRCdXR0b25zKCk7XG5cblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy50aHJvdHRsZWRSZXNpemUuYmluZCh0aGlzKSk7XG5cdFx0c2V0VGltZW91dCh0aGlzLmVxdWFsSGVpZ2h0LmJpbmQodGhpcyksIDEwMCk7XG5cblx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMucmVhZHkuc3Vic3RyKDEpKTtcblxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0aWYoISF3aW5kb3cubG9jYXRpb24uaGFzaCAmJiAhIX5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCh3aW5kb3cubG9jYXRpb24uaGFzaC5zbGljZSgxKSkuY2xhc3NOYW1lLmluZGV4T2YodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnRyaWdnZXIuc3Vic3RyKDEpKSkgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQod2luZG93LmxvY2F0aW9uLmhhc2guc2xpY2UoMSkpLmNsaWNrKCk7XG5cdFx0fSwgMjYwKTtcblxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGluaXRUaHJvdHRsZWQoKXtcblx0XHR0aGlzLnRocm90dGxlZFJlc2l6ZSA9IHRocm90dGxlKCgpID0+IHtcblx0XHRcdHRoaXMuZXF1YWxIZWlnaHQodGhpcy5zZXRQYW5lbFRvcC5iaW5kKHRoaXMpKTtcblx0XHR9KTtcblxuXHRcdHRoaXMudGhyb3R0bGVkQ2hhbmdlID0gdGhyb3R0bGUodGhpcy5jaGFuZ2UpO1xuXHRcdHRoaXMudGhyb3R0bGVkUHJldmlvdXMgPSB0aHJvdHRsZSh0aGlzLnByZXZpb3VzKTtcblx0XHR0aGlzLnRocm90dGxlZE5leHQgPSB0aHJvdHRsZSh0aGlzLm5leHQpO1xuXHR9LFxuXHRpbml0VHJpZ2dlcnMoKXtcblx0XHR0aGlzLml0ZW1zLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcblx0XHRcdGxldCB0cmlnZ2VyID0gaXRlbS5ub2RlLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnRyaWdnZXIpO1xuXHRcdFx0aWYoIXRyaWdnZXIpIHRocm93IG5ldyBFcnJvcihDT05TVEFOVFMuRVJST1JTLlRSSUdHRVIpO1xuXG5cdFx0XHRDT05TVEFOVFMuRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0XHR0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0XHR0aGlzLnRocm90dGxlZENoYW5nZShpKTtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cdGluaXRQYW5lbCgpe1xuXHRcdGxldCBlbGVtZW50RmFjdG9yeSA9IChlbGVtZW50LCBjbGFzc05hbWUsIGF0dHJpYnV0ZXMpID0+IHtcblx0XHRcdFx0bGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50KTtcblx0XHRcdFx0ZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuXHRcdFx0XHRmb3IgKHZhciBrIGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0XHRpZiAoYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuXHRcdFx0XHRcdFx0ZWwuc2V0QXR0cmlidXRlKGssIGF0dHJpYnV0ZXNba10pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZWw7XG5cdFx0XHR9LFxuXHRcdFx0cGFuZWxFbGVtZW50ID0gZWxlbWVudEZhY3RvcnkodGhpcy5pdGVtc1swXS5ub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSwgdGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnBhbmVsLnN1YnN0cigxKSwgeyAnYXJpYS1oaWRkZW4nOiB0cnVlIH0pO1xuXG5cdFx0dGhpcy5wYW5lbElubmVyID0gZWxlbWVudEZhY3RvcnkoJ2RpdicsIHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5wYW5lbElubmVyLnN1YnN0cigxKSk7XG5cdFx0dGhpcy5wYW5lbCA9IHRoaXMubm9kZS5hcHBlbmRDaGlsZChwYW5lbEVsZW1lbnQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblx0aW5pdEJ1dHRvbnMoKXtcblx0XHRsZXQgYnV0dG9uc1RlbXBsYXRlID0gYDxidXR0b24gY2xhc3M9XCIke3RoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5jbG9zZUJ1dHRvbi5zdWJzdHIoMSl9XCIgYXJpYS1sYWJlbD1cImNsb3NlXCI+XG5cdFx0XHRcdFx0XHRcdFx0PHN2ZyBmaWxsPVwiIzAwMDAwMFwiIGhlaWdodD1cIjMwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTE5IDYuNDFMMTcuNTkgNSAxMiAxMC41OSA2LjQxIDUgNSA2LjQxIDEwLjU5IDEyIDUgMTcuNTkgNi40MSAxOSAxMiAxMy40MSAxNy41OSAxOSAxOSAxNy41OSAxMy40MSAxMnpcIi8+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTAgMGgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIvPlxuXHRcdFx0XHRcdFx0XHRcdDwvc3ZnPlxuXHRcdFx0XHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdFx0XHRcdCBcdFx0PGJ1dHRvbiBjbGFzcz1cIiR7dGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnByZXZpb3VzQnV0dG9uLnN1YnN0cigxKX1cIiBhcmlhLWxhYmVsPVwicHJldmlvdXNcIj5cblx0XHRcdFx0XHRcdFx0XHQgPHN2ZyBmaWxsPVwiIzAwMDAwMFwiIGhlaWdodD1cIjM2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMzZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMTUuNDEgNy40MUwxNCA2bC02IDYgNiA2IDEuNDEtMS40MUwxMC44MyAxMnpcIi8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMCAwaDI0djI0SDB6XCIgZmlsbD1cIm5vbmVcIi8+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L3N2Zz5cblx0XHRcdFx0XHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdFx0XHRcdCBcdFx0PGJ1dHRvbiBjbGFzcz1cIiR7dGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLm5leHRCdXR0b24uc3Vic3RyKDEpfVwiIGFyaWEtbGFiZWw9XCJuZXh0XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8c3ZnIGZpbGw9XCIjMDAwMDAwXCIgaGVpZ2h0PVwiMzZcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIzNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0xMCA2TDguNTkgNy40MSAxMy4xNyAxMmwtNC41OCA0LjU5TDEwIDE4bDYtNnpcIi8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMCAwaDI0djI0SDB6XCIgZmlsbD1cIm5vbmVcIi8+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L3N2Zz5cblx0XHRcdFx0XHRcdFx0XHQgPC9idXR0b24+YDtcblxuXHRcdHRoaXMucGFuZWwuaW5uZXJIVE1MID0gYCR7dGhpcy5wYW5lbC5pbm5lckhUTUx9JHtidXR0b25zVGVtcGxhdGV9YDtcblxuXHRcdENPTlNUQU5UUy5FVkVOVFMuZm9yRWFjaChldiA9PiB7XG5cdFx0XHR0aGlzLnBhbmVsLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLmNsb3NlQnV0dG9uKS5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlICYmICF+Q09OU1RBTlRTLktFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLmNsb3NlLmNhbGwodGhpcyk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucGFuZWwucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMucHJldmlvdXNCdXR0b24pLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRpZihlLmtleUNvZGUgJiYgIX5DT05TVEFOVFMuS0VZQ09ERVMuaW5kZXhPZihlLmtleUNvZGUpKSByZXR1cm47XG5cdFx0XHRcdHRoaXMudGhyb3R0bGVkUHJldmlvdXMuY2FsbCh0aGlzKTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5wYW5lbC5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5uZXh0QnV0dG9uKS5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlICYmICF+Q09OU1RBTlRTLktFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLnRocm90dGxlZE5leHQuY2FsbCh0aGlzKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9LFxuXHRpbml0SXRlbXMoKXtcblx0XHRsZXQgaXRlbXMgPSBbXS5zbGljZS5jYWxsKHRoaXMubm9kZS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5pdGVtKSk7XG5cblx0XHRpZihpdGVtcy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcihDT05TVEFOVFMuRVJST1JTLklURU0pO1xuXG5cdFx0dGhpcy5pdGVtcyA9IGl0ZW1zLm1hcChpdGVtID0+IHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG5vZGU6IGl0ZW0sXG5cdFx0XHRcdGNvbnRlbnQ6IGl0ZW0ucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuY29udGVudCksXG5cdFx0XHRcdHRyaWdnZXI6IGl0ZW0ucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMudHJpZ2dlcilcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0fSxcblx0Y2hhbmdlKGkpe1xuXHRcdGlmKHRoaXMub3BlbkluZGV4ID09PSBmYWxzZSkgcmV0dXJuIHRoaXMub3BlbihpKTtcblx0XHRpZih0aGlzLm9wZW5JbmRleCA9PT0gaSkgcmV0dXJuIHRoaXMuY2xvc2UoKTtcblx0XHRpZiAodGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZS5vZmZzZXRUb3AgPT09IHRoaXMuaXRlbXNbaV0ubm9kZS5vZmZzZXRUb3ApIHRoaXMuY2xvc2UoKCkgPT4gdGhpcy5vcGVuKGksIHRoaXMucGFuZWwub2Zmc2V0SGVpZ2h0KSwgdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQpO1xuXHRcdGVsc2UgdGhpcy5jbG9zZSgoKSA9PiB0aGlzLm9wZW4oaSkpO1xuXHR9LFxuXHRvcGVuKGksIHN0YXJ0LCBzcGVlZCl7XG5cdFx0dGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lciA9IHRoaXMuaXRlbXNbaV0uY29udGVudDtcblx0XHR0aGlzLm9wZW5JbmRleCA9IGk7XG5cdFx0dGhpcy5zZXRQYW5lbFRvcCgpO1xuXHRcdHRoaXMucGFuZWxDb250ZW50ID0gdGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZC5jbG9uZU5vZGUodHJ1ZSk7XG5cdFx0dGhpcy5wYW5lbElubmVyLmFwcGVuZENoaWxkKHRoaXMucGFuZWxDb250ZW50KTtcblx0XHR0aGlzLnBhbmVsU291cmNlQ29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMucGFuZWxTb3VyY2VDb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQpO1xuXHRcdHRoaXMucGFuZWwuaW5zZXJ0QmVmb3JlKHRoaXMucGFuZWxJbm5lciwgdGhpcy5wYW5lbC5maXJzdEVsZW1lbnRDaGlsZCk7XG5cblx0XHRsZXQgY3VycmVudFRpbWUgPSAwLFxuXHRcdFx0cGFuZWxTdGFydCA9IHN0YXJ0IHx8IDAsXG5cdFx0XHR0b3RhbFBhbmVsQ2hhbmdlID0gdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQgLSBwYW5lbFN0YXJ0LFxuXHRcdFx0cm93U3RhcnQgPSB0aGlzLmNsb3NlZEhlaWdodCArIHBhbmVsU3RhcnQsXG5cdFx0XHR0b3RhbFJvd0NoYW5nZSA9IHRvdGFsUGFuZWxDaGFuZ2UsXG5cdFx0XHRkdXJhdGlvbiA9IHNwZWVkIHx8IDE2LFxuXHRcdFx0YW5pbWF0ZU9wZW4gPSAoKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRUaW1lKys7XG5cdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcGFuZWxTdGFydCwgdG90YWxQYW5lbENoYW5nZSwgZHVyYXRpb24pICsgJ3B4Jztcblx0XHRcdFx0dGhpcy5yZXNpemVSb3codGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZSwgZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcm93U3RhcnQsIHRvdGFsUm93Q2hhbmdlLCBkdXJhdGlvbikgKyAncHgnKTtcblx0XHRcdFx0aWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZU9wZW4uYmluZCh0aGlzKSk7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMuaXRlbXNbaV0ubm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLnBhbmVsLCB0aGlzLml0ZW1zW2ldLm5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKTtcblxuXHRcdFx0XHRcdCghIXdpbmRvdy5oaXN0b3J5ICYmICEhd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSAmJiB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoeyBVUkw6IGAjJHt0aGlzLml0ZW1zW2ldLnRyaWdnZXIuZ2V0QXR0cmlidXRlKCdpZCcpfWB9LCAnJywgYCMke3RoaXMuaXRlbXNbaV0udHJpZ2dlci5nZXRBdHRyaWJ1dGUoJ2lkJyl9YCk7XG5cblx0XHRcdFx0XHRpZiAoIWluVmlldyh0aGlzLnBhbmVsLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRsOiAwLFxuXHRcdFx0XHRcdFx0XHR0OiAwLFxuXHRcdFx0XHRcdFx0XHRiOiAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpIC0gdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQsXG5cdFx0XHRcdFx0XHRcdHI6ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH0pKSBzY3JvbGxUbyh0aGlzLnBhbmVsLm9mZnNldFRvcCAtIHRoaXMuc2V0dGluZ3Mub2Zmc2V0KTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5vcGVuLnN1YnN0cigxKSk7XG5cblx0XHR0aGlzLnBhbmVsLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcblx0XHR0aGlzLml0ZW1zW2ldLnRyaWdnZXIuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSk7XG5cblx0XHRhbmltYXRlT3Blbi5jYWxsKHRoaXMpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGNsb3NlKGNiLCBlbmQsIHNwZWVkKXtcblx0XHRsZXQgZW5kUG9pbnQgPSBlbmQgfHwgMCxcblx0XHRcdGN1cnJlbnRUaW1lID0gMCxcblx0XHRcdHBhbmVsU3RhcnQgPSB0aGlzLnBhbmVsLm9mZnNldEhlaWdodCxcblx0XHRcdHRvdGFsUGFuZWxDaGFuZ2UgPSBlbmRQb2ludCAtIHBhbmVsU3RhcnQsXG5cdFx0XHRyb3dTdGFydCA9IHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUub2Zmc2V0SGVpZ2h0LFxuXHRcdFx0dG90YWxSb3dDaGFuZ2UgPSB0b3RhbFBhbmVsQ2hhbmdlLFxuXHRcdFx0ZHVyYXRpb24gPSBzcGVlZCB8fCAxNixcblx0XHRcdGFuaW1hdGVDbG9zZWQgPSAoKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRUaW1lKys7XG5cdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcGFuZWxTdGFydCwgdG90YWxQYW5lbENoYW5nZSwgZHVyYXRpb24pICsgJ3B4Jztcblx0XHRcdFx0dGhpcy5yZXNpemVSb3codGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZSwgZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcm93U3RhcnQsIHRvdGFsUm93Q2hhbmdlLCBkdXJhdGlvbikgKyAncHgnKTtcblx0XHRcdFx0aWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZUNsb3NlZC5iaW5kKHRoaXMpKTtcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0aWYgKCFlbmRQb2ludCkgdGhpcy5wYW5lbC5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy5wYW5lbElubmVyLnJlbW92ZUNoaWxkKHRoaXMucGFuZWxDb250ZW50KTtcblx0XHRcdFx0XHR0aGlzLnBhbmVsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcblx0XHRcdFx0XHR0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS50cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIGZhbHNlKTtcblx0XHRcdFx0XHR0aGlzLnBhbmVsU291cmNlQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucGFuZWxDb250ZW50KTtcblx0XHRcdFx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuYW5pbWF0aW5nLnN1YnN0cigxKSk7XG5cdFx0XHRcdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLm9wZW4uc3Vic3RyKDEpKTtcblx0XHRcdFx0XHR0aGlzLm9wZW5JbmRleCA9IGZhbHNlO1xuXHRcdFx0XHRcdGlmKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgY2IoKTtcblx0XHRcdFx0XHRlbHNlICghIXdpbmRvdy5oaXN0b3J5ICYmICEhd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSAmJiBoaXN0b3J5LnB1c2hTdGF0ZSgnJywgZG9jdW1lbnQudGl0bGUsIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5hZGQodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLmFuaW1hdGluZy5zdWJzdHIoMSkpO1xuXG5cdFx0YW5pbWF0ZUNsb3NlZC5jYWxsKHRoaXMpO1xuXHR9LFxuXHRwcmV2aW91cygpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGFuZ2UoKHRoaXMub3BlbkluZGV4IC0gMSA8IDAgPyB0aGlzLml0ZW1zLmxlbmd0aCAtIDEgOiB0aGlzLm9wZW5JbmRleCAtIDEpKTtcblx0fSxcblx0bmV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGFuZ2UoKHRoaXMub3BlbkluZGV4ICsgMSA9PT0gdGhpcy5pdGVtcy5sZW5ndGggPyAwIDogdGhpcy5vcGVuSW5kZXggKyAxKSk7XG5cdH0sXG5cdGVxdWFsSGVpZ2h0KGNiKSB7XG5cdFx0bGV0IG9wZW5IZWlnaHQgPSAwLFxuXHRcdFx0Y2xvc2VkSGVpZ2h0ID0gMDtcblxuXHRcdHRoaXMuaXRlbXMubWFwKChpdGVtLCBpKSA9PiB7XG5cdFx0XHRpdGVtLm5vZGUuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0aWYgKHRoaXMub3BlbkluZGV4ICE9PSBmYWxzZSAmJiBpdGVtLm5vZGUub2Zmc2V0VG9wID09PSB0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLm9mZnNldFRvcCkge1xuXHRcdFx0XHRpZiAodGhpcy5vcGVuSW5kZXggPT09IGkpIG9wZW5IZWlnaHQgPSBpdGVtLm5vZGUub2Zmc2V0SGVpZ2h0ICsgdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoaXRlbS5ub2RlLm9mZnNldEhlaWdodCA+IGNsb3NlZEhlaWdodCkgY2xvc2VkSGVpZ2h0ID0gaXRlbS5ub2RlLm9mZnNldEhlaWdodDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBpdGVtO1xuXHRcdH0pLm1hcCgoaXRlbSwgaSkgPT4ge1xuXHRcdFx0aWYgKHRoaXMub3BlbkluZGV4ICE9PSBpKSBpdGVtLm5vZGUuc3R5bGUuaGVpZ2h0ID0gY2xvc2VkSGVpZ2h0ICsgJ3B4Jztcblx0XHR9KTtcblxuXHRcdHRoaXMub3BlbkhlaWdodCA9IG9wZW5IZWlnaHQ7XG5cdFx0dGhpcy5jbG9zZWRIZWlnaHQgPSBjbG9zZWRIZWlnaHQgPT09IDAgPyB0aGlzLmNsb3NlZEhlaWdodCA6IGNsb3NlZEhlaWdodDtcblxuXHRcdGlmICh0aGlzLm9wZW5IZWlnaHQgPiAwKSB7XG5cdFx0XHR0aGlzLnJlc2l6ZVJvdyh0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLCB0aGlzLm9wZW5IZWlnaHQgKyAncHgnKTtcblx0XHRcdHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJyAmJiBjYigpO1xuXHRcdH1cblx0fSxcblx0cmVzaXplUm93KGVsLCBoZWlnaHQpe1xuXHRcdHRoaXMuaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdGlmIChpdGVtLm5vZGUub2Zmc2V0VG9wID09PSBlbC5vZmZzZXRUb3ApIGl0ZW0ubm9kZS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQ7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHNldFBhbmVsVG9wKCkge1xuXHRcdHRoaXMucGFuZWwuc3R5bGUudG9wID0gYCR7dGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZS5vZmZzZXRUb3AgKyB0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS50cmlnZ2VyLm9mZnNldEhlaWdodH1weGA7XG5cdH1cbn07XG5cbmNvbnN0IGluaXQgPSAoc2VsLCBvcHRzKSA9PiB7XG5cdGxldCBlbHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKSk7XG5cblx0aWYoZWxzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKENPTlNUQU5UUy5FUlJPUlMuUk9PVCk7XG5cblx0cmV0dXJuIGVscy5tYXAoZWwgPT4ge1xuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoU3Rvcm1XYWxsKSwge1xuXHRcdFx0bm9kZTogZWwsXG5cdFx0XHRzZXR0aW5nczogT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdHMpXG5cdFx0fSkuaW5pdCgpO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHsgaW5pdCB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xudmFyIHJhZlRocm90dGxlID0gZnVuY3Rpb24gcmFmVGhyb3R0bGUoY2FsbGJhY2spIHtcbiAgdmFyIHJlcXVlc3RJZCA9IHZvaWQgMDtcblxuICB2YXIgbGF0ZXIgPSBmdW5jdGlvbiBsYXRlcihjb250ZXh0LCBhcmdzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlcXVlc3RJZCA9IG51bGw7XG4gICAgICBjYWxsYmFjay5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIHZhciB0aHJvdHRsZWQgPSBmdW5jdGlvbiB0aHJvdHRsZWQoKSB7XG4gICAgaWYgKHJlcXVlc3RJZCA9PT0gbnVsbCB8fCByZXF1ZXN0SWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdElkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGxhdGVyKHRoaXMsIGFyZ3MpKTtcbiAgICB9XG4gIH07XG5cbiAgdGhyb3R0bGVkLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY2FuY2VsQW5pbWF0aW9uRnJhbWUocmVxdWVzdElkKTtcbiAgfTtcblxuICByZXR1cm4gdGhyb3R0bGVkO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gcmFmVGhyb3R0bGU7Il19
