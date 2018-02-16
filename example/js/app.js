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

},{"./libs/storm-wall":5}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (element, view) {
	var box = element.getBoundingClientRect();
	return box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b;
};

},{}],4:[function(require,module,exports){
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

},{"./easeInOutQuad":2}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

var _scrollTo = require('./libs/scrollTo');

var _scrollTo2 = _interopRequireDefault(_scrollTo);

var _inView = require('./libs/inView');

var _inView2 = _interopRequireDefault(_inView);

var _easeInOutQuad = require('./libs/easeInOutQuad');

var _easeInOutQuad2 = _interopRequireDefault(_easeInOutQuad);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var defaults = {
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

var CONSTANTS = {
	ERRORS: {
		ROOT: 'Wall cannot be initialised, no trigger elements found',
		ITEM: 'Wall item cannot be found',
		TRIGGER: 'Wall trigger cannot be found'
	},
	KEYCODES: [13, 32],
	EVENTS: ['click', 'keydown']
};

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

		this.throttledResize = (0, _lodash2.default)(function () {
			_this2.equalHeight(_this2.setPanelTop.bind(_this2));
		}, 60);

		this.throttledChange = (0, _lodash2.default)(this.change, 100);
		this.throttledPrevious = (0, _lodash2.default)(this.previous, 100);
		this.throttledNext = (0, _lodash2.default)(this.next, 100);
	},
	initTriggers: function initTriggers() {
		var _this3 = this;

		this.items.forEach(function (item, i) {
			var trigger = item.node.querySelector(_this3.settings.classNames.trigger);
			if (!trigger) throw new Error(CONSTANTS.ERRORS.TRIGGER);

			CONSTANTS.EVENTS.forEach(function (ev) {
				trigger.addEventListener(ev, function (e) {
					if (e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
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

		CONSTANTS.EVENTS.forEach(function (ev) {
			_this4.panel.querySelector(_this4.settings.classNames.closeButton).addEventListener(ev, function (e) {
				if (e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				_this4.close.call(_this4);
			});
			_this4.panel.querySelector(_this4.settings.classNames.previousButton).addEventListener(ev, function (e) {
				if (e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				_this4.throttledPrevious.call(_this4);
			});
			_this4.panel.querySelector(_this4.settings.classNames.nextButton).addEventListener(ev, function (e) {
				if (e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				_this4.throttledNext.call(_this4);
			});
		});
	},
	initItems: function initItems() {
		var _this5 = this;

		var items = [].slice.call(this.node.querySelectorAll(this.settings.classNames.item));

		if (items.length === 0) throw new Error(CONSTANTS.ERRORS.ITEM);

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

	if (els.length === 0) throw new Error(CONSTANTS.ERRORS.ROOT);

	return els.map(function (el) {
		return Object.assign(Object.create(StormWall), {
			node: el,
			settings: Object.assign({}, defaults, opts)
		}).init();
	});
};

exports.default = { init: init };

},{"./libs/easeInOutQuad":2,"./libs/inView":3,"./libs/scrollTo":4,"lodash.throttle":6}],6:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvZWFzZUluT3V0UXVhZC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvbGlicy9pblZpZXcuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvc2Nyb2xsVG8uanMiLCJleGFtcGxlL3NyYy9saWJzL3N0b3JtLXdhbGwuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7Ozs7QUFFQSxJQUFNLGVBQWUsWUFBTSxBQUMxQjtxQkFBQSxBQUFLLEtBQUwsQUFBVSxBQUVWOztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEQsQUFBb0IsQ0FBQTs7QUFTcEIsSUFBRyxzQkFBSCxBQUF5QixlQUFRLEFBQU8saUJBQVAsQUFBd0IsUUFBUSxZQUFNLEFBQUU7YUFBQSxBQUFZLFFBQVEsVUFBQSxBQUFDLElBQUQ7U0FBQSxBQUFRO0FBQTVCLEFBQW9DO0FBQTVFLENBQUE7Ozs7Ozs7OztBQ1hqQztrQkFDZSxVQUFBLEFBQUMsR0FBRCxBQUFJLEdBQUosQUFBTyxHQUFQLEFBQVUsR0FBTSxBQUM5QjtNQUFLLElBQUwsQUFBUyxBQUNUO0tBQUksSUFBSixBQUFRLEdBQUcsQUFDVjtTQUFPLElBQUEsQUFBSSxJQUFKLEFBQVEsSUFBUixBQUFZLElBQW5CLEFBQXVCLEFBQ3ZCO0FBQ0Q7QUFDQTtRQUFPLENBQUEsQUFBQyxJQUFELEFBQUssS0FBSyxLQUFLLElBQUwsQUFBUyxLQUFuQixBQUF3QixLQUEvQixBQUFvQyxBQUNwQztBOzs7Ozs7Ozs7a0JDUmMsVUFBQSxBQUFDLFNBQUQsQUFBVSxNQUFTLEFBQ2pDO0tBQUksTUFBTSxRQUFWLEFBQVUsQUFBUSxBQUNsQjtRQUFRLElBQUEsQUFBSSxTQUFTLEtBQWIsQUFBa0IsS0FBSyxJQUFBLEFB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJpbXBvcnQgV2FsbCBmcm9tICcuL2xpYnMvc3Rvcm0td2FsbCc7XG5cbmNvbnN0IG9uTG9hZFRhc2tzID0gWygpID0+IHtcblx0V2FsbC5pbml0KCcuanMtd2FsbCcpO1xuXG5cdC8vIExvYWQoJy4vanMvc3Rvcm0td2FsbC5zdGFuZGFsb25lLmpzJylcblx0Ly8gXHQudGhlbigoKSA9PiB7XG5cdC8vIFx0XHRTdG9ybVdhbGwuaW5pdCgnLmpzLXdhbGwnKTtcblx0Ly8gXHR9KTtcbn1dO1xuXG5pZignYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93KSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHsgb25Mb2FkVGFza3MuZm9yRWFjaCgoZm4pID0+IGZuKCkpOyB9KTsiLCIvL2h0dHA6Ly9nb28uZ2wvNUhMbDhcbmV4cG9ydCBkZWZhdWx0ICh0LCBiLCBjLCBkKSA9PiB7XG5cdHQgLz0gZCAvIDI7XG5cdGlmICh0IDwgMSkge1xuXHRcdHJldHVybiBjIC8gMiAqIHQgKiB0ICsgYjtcblx0fVxuXHR0LS07XG5cdHJldHVybiAtYyAvIDIgKiAodCAqICh0IC0gMikgLSAxKSArIGI7XG59OyIsImV4cG9ydCBkZWZhdWx0IChlbGVtZW50LCB2aWV3KSA9PiB7XG5cdGxldCBib3ggPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRyZXR1cm4gKGJveC5yaWdodCA+PSB2aWV3LmwgJiYgYm94LmJvdHRvbSA+PSB2aWV3LnQgJiYgYm94LmxlZnQgPD0gdmlldy5yICYmIGJveC50b3AgPD0gdmlldy5iKTtcbn07IiwiaW1wb3J0IGVhc2VJbk91dFF1YWQgZnJvbSAnLi9lYXNlSW5PdXRRdWFkJztcblxuY29uc3QgbW92ZSA9IGFtb3VudCA9PiB7XG5cdGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgPSBhbW91bnQ7XG5cdGRvY3VtZW50LmJvZHkucGFyZW50Tm9kZS5zY3JvbGxUb3AgPSBhbW91bnQ7XG5cdGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gYW1vdW50O1xufTtcblxuY29uc3QgcG9zaXRpb24gPSAoKSA9PiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkucGFyZW50Tm9kZS5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG5cbmV4cG9ydCBkZWZhdWx0ICh0bywgZHVyYXRpb24gPSA1MDAsIGNhbGxiYWNrKSA9PiB7XG5cdGxldCBzdGFydCA9IHBvc2l0aW9uKCksXG5cdFx0Y2hhbmdlID0gdG8gLSBzdGFydCxcblx0XHRjdXJyZW50VGltZSA9IDAsXG5cdFx0aW5jcmVtZW50ID0gMjAsXG5cdFx0YW5pbWF0ZVNjcm9sbCA9ICgpID0+IHtcblx0XHRcdGN1cnJlbnRUaW1lICs9IGluY3JlbWVudDtcblx0XHRcdGxldCB2YWwgPSBlYXNlSW5PdXRRdWFkKGN1cnJlbnRUaW1lLCBzdGFydCwgY2hhbmdlLCBkdXJhdGlvbik7XG5cdFx0XHRtb3ZlKHZhbCk7XG5cdFx0XHRcblx0XHRcdGlmIChjdXJyZW50VGltZSA8IGR1cmF0aW9uKSAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlU2Nyb2xsKTtcblx0XHRcdGVsc2UgKGNhbGxiYWNrICYmIHR5cGVvZiAoY2FsbGJhY2spID09PSAnZnVuY3Rpb24nKSAmJiBjYWxsYmFjaygpO1xuXHRcdH07XG5cdGFuaW1hdGVTY3JvbGwoKTtcbn07IiwiaW1wb3J0IHRocm90dGxlIGZyb20gJ2xvZGFzaC50aHJvdHRsZSc7XG5cbmltcG9ydCBzY3JvbGxUbyBmcm9tICcuL2xpYnMvc2Nyb2xsVG8nO1xuaW1wb3J0IGluVmlldyBmcm9tICcuL2xpYnMvaW5WaWV3JztcbmltcG9ydCBlYXNlSW5PdXRRdWFkIGZyb20gJy4vbGlicy9lYXNlSW5PdXRRdWFkJztcblxuY29uc3QgZGVmYXVsdHMgPSB7XG5cdGNsYXNzTmFtZXM6IHtcblx0XHRyZWFkeTogJy5qcy13YWxsLS1pcy1yZWFkeScsXG5cdFx0dHJpZ2dlcjogJy5qcy13YWxsLXRyaWdnZXInLFxuXHRcdGl0ZW06ICcuanMtd2FsbC1pdGVtJyxcblx0XHRjb250ZW50OiAnLmpzLXdhbGwtY2hpbGQnLFxuXHRcdHBhbmVsOiAnLmpzLXdhbGwtcGFuZWwnLFxuXHRcdHBhbmVsSW5uZXI6ICcuanMtd2FsbC1wYW5lbC1pbm5lcicsXG5cdFx0b3BlbjogJy5qcy13YWxsLS1pcy1vcGVuJyxcblx0XHRhbmltYXRpbmc6ICcuanMtd2FsbC0taXMtYW5pbWF0aW5nJyxcblx0XHRjbG9zZUJ1dHRvbjogJy5qcy13YWxsLWNsb3NlJyxcblx0XHRuZXh0QnV0dG9uOiAnLmpzLXdhbGwtbmV4dCcsXG5cdFx0cHJldmlvdXNCdXR0b246ICcuanMtd2FsbC1wcmV2aW91cydcblx0fSxcblx0b2Zmc2V0OiAxMjBcbn07XG5cbmNvbnN0IENPTlNUQU5UUyA9IHtcblx0RVJST1JTOiB7XG5cdFx0Uk9PVDogJ1dhbGwgY2Fubm90IGJlIGluaXRpYWxpc2VkLCBubyB0cmlnZ2VyIGVsZW1lbnRzIGZvdW5kJyxcblx0XHRJVEVNOiAnV2FsbCBpdGVtIGNhbm5vdCBiZSBmb3VuZCcsXG5cdFx0VFJJR0dFUjogJ1dhbGwgdHJpZ2dlciBjYW5ub3QgYmUgZm91bmQnXG5cdH0sXG5cdEtFWUNPREVTOiBbMTMsIDMyXSxcblx0RVZFTlRTOiBbJ2NsaWNrJywgJ2tleWRvd24nXVxufTtcblxuY29uc3QgU3Rvcm1XYWxsID0ge1xuXHRpbml0KCl7XG5cdFx0dGhpcy5vcGVuSW5kZXggPSBmYWxzZTtcblxuXHRcdHRoaXMuaW5pdFRocm90dGxlZCgpO1xuXHRcdHRoaXMuaW5pdEl0ZW1zKCk7XG5cdFx0dGhpcy5pbml0VHJpZ2dlcnMoKTtcblx0XHR0aGlzLmluaXRQYW5lbCgpO1xuXHRcdHRoaXMuaW5pdEJ1dHRvbnMoKTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnRocm90dGxlZFJlc2l6ZS5iaW5kKHRoaXMpKTtcblx0XHRzZXRUaW1lb3V0KHRoaXMuZXF1YWxIZWlnaHQuYmluZCh0aGlzKSwgMTAwKTtcblxuXHRcdHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5yZWFkeS5zdWJzdHIoMSkpO1xuXG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRpZighIXdpbmRvdy5sb2NhdGlvbi5oYXNoICYmICEhfmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNsaWNlKDEpKS5jbGFzc05hbWUuaW5kZXhPZih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMudHJpZ2dlci5zdWJzdHIoMSkpKSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh3aW5kb3cubG9jYXRpb24uaGFzaC5zbGljZSgxKSkuY2xpY2soKTtcblx0XHR9LCAyNjApO1xuXG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0aW5pdFRocm90dGxlZCgpe1xuXHRcdHRoaXMudGhyb3R0bGVkUmVzaXplID0gdGhyb3R0bGUoKCkgPT4ge1xuXHRcdFx0dGhpcy5lcXVhbEhlaWdodCh0aGlzLnNldFBhbmVsVG9wLmJpbmQodGhpcykpO1xuXHRcdH0sIDYwKTtcblxuXHRcdHRoaXMudGhyb3R0bGVkQ2hhbmdlID0gdGhyb3R0bGUodGhpcy5jaGFuZ2UsIDEwMCk7XG5cdFx0dGhpcy50aHJvdHRsZWRQcmV2aW91cyA9IHRocm90dGxlKHRoaXMucHJldmlvdXMsIDEwMCk7XG5cdFx0dGhpcy50aHJvdHRsZWROZXh0ID0gdGhyb3R0bGUodGhpcy5uZXh0LCAxMDApO1xuXHR9LFxuXHRpbml0VHJpZ2dlcnMoKXtcblx0XHR0aGlzLml0ZW1zLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcblx0XHRcdGxldCB0cmlnZ2VyID0gaXRlbS5ub2RlLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnRyaWdnZXIpO1xuXHRcdFx0aWYoIXRyaWdnZXIpIHRocm93IG5ldyBFcnJvcihDT05TVEFOVFMuRVJST1JTLlRSSUdHRVIpO1xuXG5cdFx0XHRDT05TVEFOVFMuRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0XHR0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0XHR0aGlzLnRocm90dGxlZENoYW5nZShpKTtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cdGluaXRQYW5lbCgpe1xuXHRcdGxldCBlbGVtZW50RmFjdG9yeSA9IChlbGVtZW50LCBjbGFzc05hbWUsIGF0dHJpYnV0ZXMpID0+IHtcblx0XHRcdFx0bGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50KTtcblx0XHRcdFx0ZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuXHRcdFx0XHRmb3IgKHZhciBrIGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0XHRpZiAoYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuXHRcdFx0XHRcdFx0ZWwuc2V0QXR0cmlidXRlKGssIGF0dHJpYnV0ZXNba10pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZWw7XG5cdFx0XHR9LFxuXHRcdFx0cGFuZWxFbGVtZW50ID0gZWxlbWVudEZhY3RvcnkodGhpcy5pdGVtc1swXS5ub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSwgdGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnBhbmVsLnN1YnN0cigxKSwgeyAnYXJpYS1oaWRkZW4nOiB0cnVlIH0pO1xuXG5cdFx0dGhpcy5wYW5lbElubmVyID0gZWxlbWVudEZhY3RvcnkoJ2RpdicsIHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5wYW5lbElubmVyLnN1YnN0cigxKSk7XG5cdFx0dGhpcy5wYW5lbCA9IHRoaXMubm9kZS5hcHBlbmRDaGlsZChwYW5lbEVsZW1lbnQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblx0aW5pdEJ1dHRvbnMoKXtcblx0XHRsZXQgYnV0dG9uc1RlbXBsYXRlID0gYDxidXR0b24gY2xhc3M9XCIke3RoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5jbG9zZUJ1dHRvbi5zdWJzdHIoMSl9XCIgYXJpYS1sYWJlbD1cImNsb3NlXCI+XG5cdFx0XHRcdFx0XHRcdFx0PHN2ZyBmaWxsPVwiIzAwMDAwMFwiIGhlaWdodD1cIjMwXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMjRcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTE5IDYuNDFMMTcuNTkgNSAxMiAxMC41OSA2LjQxIDUgNSA2LjQxIDEwLjU5IDEyIDUgMTcuNTkgNi40MSAxOSAxMiAxMy40MSAxNy41OSAxOSAxOSAxNy41OSAxMy40MSAxMnpcIi8+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTAgMGgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIvPlxuXHRcdFx0XHRcdFx0XHRcdDwvc3ZnPlxuXHRcdFx0XHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdFx0XHRcdCBcdFx0PGJ1dHRvbiBjbGFzcz1cIiR7dGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnByZXZpb3VzQnV0dG9uLnN1YnN0cigxKX1cIiBhcmlhLWxhYmVsPVwicHJldmlvdXNcIj5cblx0XHRcdFx0XHRcdFx0XHQgPHN2ZyBmaWxsPVwiIzAwMDAwMFwiIGhlaWdodD1cIjM2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMzZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMTUuNDEgNy40MUwxNCA2bC02IDYgNiA2IDEuNDEtMS40MUwxMC44MyAxMnpcIi8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMCAwaDI0djI0SDB6XCIgZmlsbD1cIm5vbmVcIi8+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L3N2Zz5cblx0XHRcdFx0XHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdFx0XHRcdCBcdFx0PGJ1dHRvbiBjbGFzcz1cIiR7dGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLm5leHRCdXR0b24uc3Vic3RyKDEpfVwiIGFyaWEtbGFiZWw9XCJuZXh0XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8c3ZnIGZpbGw9XCIjMDAwMDAwXCIgaGVpZ2h0PVwiMzZcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIzNlwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0xMCA2TDguNTkgNy40MSAxMy4xNyAxMmwtNC41OCA0LjU5TDEwIDE4bDYtNnpcIi8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMCAwaDI0djI0SDB6XCIgZmlsbD1cIm5vbmVcIi8+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8L3N2Zz5cblx0XHRcdFx0XHRcdFx0XHQgPC9idXR0b24+YDtcblxuXHRcdHRoaXMucGFuZWwuaW5uZXJIVE1MID0gYCR7dGhpcy5wYW5lbC5pbm5lckhUTUx9JHtidXR0b25zVGVtcGxhdGV9YDtcblxuXHRcdENPTlNUQU5UUy5FVkVOVFMuZm9yRWFjaChldiA9PiB7XG5cdFx0XHR0aGlzLnBhbmVsLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLmNsb3NlQnV0dG9uKS5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlICYmICF+Q09OU1RBTlRTLktFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLmNsb3NlLmNhbGwodGhpcyk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucGFuZWwucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMucHJldmlvdXNCdXR0b24pLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRpZihlLmtleUNvZGUgJiYgIX5DT05TVEFOVFMuS0VZQ09ERVMuaW5kZXhPZihlLmtleUNvZGUpKSByZXR1cm47XG5cdFx0XHRcdHRoaXMudGhyb3R0bGVkUHJldmlvdXMuY2FsbCh0aGlzKTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5wYW5lbC5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5uZXh0QnV0dG9uKS5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlICYmICF+Q09OU1RBTlRTLktFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLnRocm90dGxlZE5leHQuY2FsbCh0aGlzKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9LFxuXHRpbml0SXRlbXMoKXtcblx0XHRsZXQgaXRlbXMgPSBbXS5zbGljZS5jYWxsKHRoaXMubm9kZS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5pdGVtKSk7XG5cblx0XHRpZihpdGVtcy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcihDT05TVEFOVFMuRVJST1JTLklURU0pO1xuXG5cdFx0dGhpcy5pdGVtcyA9IGl0ZW1zLm1hcChpdGVtID0+IHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG5vZGU6IGl0ZW0sXG5cdFx0XHRcdGNvbnRlbnQ6IGl0ZW0ucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuY29udGVudCksXG5cdFx0XHRcdHRyaWdnZXI6IGl0ZW0ucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMudHJpZ2dlcilcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0fSxcblx0Y2hhbmdlKGkpe1xuXHRcdGlmKHRoaXMub3BlbkluZGV4ID09PSBmYWxzZSkgcmV0dXJuIHRoaXMub3BlbihpKTtcblx0XHRpZih0aGlzLm9wZW5JbmRleCA9PT0gaSkgcmV0dXJuIHRoaXMuY2xvc2UoKTtcblx0XHRpZiAodGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZS5vZmZzZXRUb3AgPT09IHRoaXMuaXRlbXNbaV0ubm9kZS5vZmZzZXRUb3ApIHRoaXMuY2xvc2UoKCkgPT4gdGhpcy5vcGVuKGksIHRoaXMucGFuZWwub2Zmc2V0SGVpZ2h0KSwgdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQpO1xuXHRcdGVsc2UgdGhpcy5jbG9zZSgoKSA9PiB0aGlzLm9wZW4oaSkpO1xuXHR9LFxuXHRvcGVuKGksIHN0YXJ0LCBzcGVlZCl7XG5cdFx0dGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lciA9IHRoaXMuaXRlbXNbaV0uY29udGVudDtcblx0XHR0aGlzLm9wZW5JbmRleCA9IGk7XG5cdFx0dGhpcy5zZXRQYW5lbFRvcCgpO1xuXHRcdHRoaXMucGFuZWxDb250ZW50ID0gdGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZC5jbG9uZU5vZGUodHJ1ZSk7XG5cdFx0dGhpcy5wYW5lbElubmVyLmFwcGVuZENoaWxkKHRoaXMucGFuZWxDb250ZW50KTtcblx0XHR0aGlzLnBhbmVsU291cmNlQ29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMucGFuZWxTb3VyY2VDb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQpO1xuXHRcdHRoaXMucGFuZWwuaW5zZXJ0QmVmb3JlKHRoaXMucGFuZWxJbm5lciwgdGhpcy5wYW5lbC5maXJzdEVsZW1lbnRDaGlsZCk7XG5cblx0XHRsZXQgY3VycmVudFRpbWUgPSAwLFxuXHRcdFx0cGFuZWxTdGFydCA9IHN0YXJ0IHx8IDAsXG5cdFx0XHR0b3RhbFBhbmVsQ2hhbmdlID0gdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQgLSBwYW5lbFN0YXJ0LFxuXHRcdFx0cm93U3RhcnQgPSB0aGlzLmNsb3NlZEhlaWdodCArIHBhbmVsU3RhcnQsXG5cdFx0XHR0b3RhbFJvd0NoYW5nZSA9IHRvdGFsUGFuZWxDaGFuZ2UsXG5cdFx0XHRkdXJhdGlvbiA9IHNwZWVkIHx8IDE2LFxuXHRcdFx0YW5pbWF0ZU9wZW4gPSAoKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRUaW1lKys7XG5cdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcGFuZWxTdGFydCwgdG90YWxQYW5lbENoYW5nZSwgZHVyYXRpb24pICsgJ3B4Jztcblx0XHRcdFx0dGhpcy5yZXNpemVSb3codGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZSwgZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcm93U3RhcnQsIHRvdGFsUm93Q2hhbmdlLCBkdXJhdGlvbikgKyAncHgnKTtcblx0XHRcdFx0aWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZU9wZW4uYmluZCh0aGlzKSk7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMuaXRlbXNbaV0ubm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLnBhbmVsLCB0aGlzLml0ZW1zW2ldLm5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKTtcblxuXHRcdFx0XHRcdCghIXdpbmRvdy5oaXN0b3J5ICYmICEhd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSAmJiB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoeyBVUkw6IGAjJHt0aGlzLml0ZW1zW2ldLnRyaWdnZXIuZ2V0QXR0cmlidXRlKCdpZCcpfWB9LCAnJywgYCMke3RoaXMuaXRlbXNbaV0udHJpZ2dlci5nZXRBdHRyaWJ1dGUoJ2lkJyl9YCk7XG5cblx0XHRcdFx0XHRpZiAoIWluVmlldyh0aGlzLnBhbmVsLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRsOiAwLFxuXHRcdFx0XHRcdFx0XHR0OiAwLFxuXHRcdFx0XHRcdFx0XHRiOiAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpIC0gdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQsXG5cdFx0XHRcdFx0XHRcdHI6ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH0pKSBzY3JvbGxUbyh0aGlzLnBhbmVsLm9mZnNldFRvcCAtIHRoaXMuc2V0dGluZ3Mub2Zmc2V0KTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5vcGVuLnN1YnN0cigxKSk7XG5cblx0XHR0aGlzLnBhbmVsLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcblx0XHR0aGlzLml0ZW1zW2ldLnRyaWdnZXIuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSk7XG5cblx0XHRhbmltYXRlT3Blbi5jYWxsKHRoaXMpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGNsb3NlKGNiLCBlbmQsIHNwZWVkKXtcblx0XHRsZXQgZW5kUG9pbnQgPSBlbmQgfHwgMCxcblx0XHRcdGN1cnJlbnRUaW1lID0gMCxcblx0XHRcdHBhbmVsU3RhcnQgPSB0aGlzLnBhbmVsLm9mZnNldEhlaWdodCxcblx0XHRcdHRvdGFsUGFuZWxDaGFuZ2UgPSBlbmRQb2ludCAtIHBhbmVsU3RhcnQsXG5cdFx0XHRyb3dTdGFydCA9IHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUub2Zmc2V0SGVpZ2h0LFxuXHRcdFx0dG90YWxSb3dDaGFuZ2UgPSB0b3RhbFBhbmVsQ2hhbmdlLFxuXHRcdFx0ZHVyYXRpb24gPSBzcGVlZCB8fCAxNixcblx0XHRcdGFuaW1hdGVDbG9zZWQgPSAoKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRUaW1lKys7XG5cdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcGFuZWxTdGFydCwgdG90YWxQYW5lbENoYW5nZSwgZHVyYXRpb24pICsgJ3B4Jztcblx0XHRcdFx0dGhpcy5yZXNpemVSb3codGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZSwgZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcm93U3RhcnQsIHRvdGFsUm93Q2hhbmdlLCBkdXJhdGlvbikgKyAncHgnKTtcblx0XHRcdFx0aWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZUNsb3NlZC5iaW5kKHRoaXMpKTtcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0aWYgKCFlbmRQb2ludCkgdGhpcy5wYW5lbC5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy5wYW5lbElubmVyLnJlbW92ZUNoaWxkKHRoaXMucGFuZWxDb250ZW50KTtcblx0XHRcdFx0XHR0aGlzLnBhbmVsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCB0cnVlKTtcblx0XHRcdFx0XHR0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS50cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIGZhbHNlKTtcblx0XHRcdFx0XHR0aGlzLnBhbmVsU291cmNlQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucGFuZWxDb250ZW50KTtcblx0XHRcdFx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuYW5pbWF0aW5nLnN1YnN0cigxKSk7XG5cdFx0XHRcdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLm9wZW4uc3Vic3RyKDEpKTtcblx0XHRcdFx0XHR0aGlzLm9wZW5JbmRleCA9IGZhbHNlO1xuXHRcdFx0XHRcdHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJyAmJiBjYigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5hZGQodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLmFuaW1hdGluZy5zdWJzdHIoMSkpO1xuXG5cdFx0YW5pbWF0ZUNsb3NlZC5jYWxsKHRoaXMpO1xuXHR9LFxuXHRwcmV2aW91cygpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGFuZ2UoKHRoaXMub3BlbkluZGV4IC0gMSA8IDAgPyB0aGlzLml0ZW1zLmxlbmd0aCAtIDEgOiB0aGlzLm9wZW5JbmRleCAtIDEpKTtcblx0fSxcblx0bmV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGFuZ2UoKHRoaXMub3BlbkluZGV4ICsgMSA9PT0gdGhpcy5pdGVtcy5sZW5ndGggPyAwIDogdGhpcy5vcGVuSW5kZXggKyAxKSk7XG5cdH0sXG5cdGVxdWFsSGVpZ2h0KGNiKSB7XG5cdFx0bGV0IG9wZW5IZWlnaHQgPSAwLFxuXHRcdFx0Y2xvc2VkSGVpZ2h0ID0gMDtcblxuXHRcdHRoaXMuaXRlbXMubWFwKChpdGVtLCBpKSA9PiB7XG5cdFx0XHRpdGVtLm5vZGUuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0aWYgKHRoaXMub3BlbkluZGV4ICE9PSBmYWxzZSAmJiBpdGVtLm5vZGUub2Zmc2V0VG9wID09PSB0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLm9mZnNldFRvcCkge1xuXHRcdFx0XHRpZiAodGhpcy5vcGVuSW5kZXggPT09IGkpIG9wZW5IZWlnaHQgPSBpdGVtLm5vZGUub2Zmc2V0SGVpZ2h0ICsgdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoaXRlbS5ub2RlLm9mZnNldEhlaWdodCA+IGNsb3NlZEhlaWdodCkgY2xvc2VkSGVpZ2h0ID0gaXRlbS5ub2RlLm9mZnNldEhlaWdodDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBpdGVtO1xuXHRcdH0pLm1hcCgoaXRlbSwgaSkgPT4ge1xuXHRcdFx0aWYgKHRoaXMub3BlbkluZGV4ICE9PSBpKSBpdGVtLm5vZGUuc3R5bGUuaGVpZ2h0ID0gY2xvc2VkSGVpZ2h0ICsgJ3B4Jztcblx0XHR9KTtcblxuXHRcdHRoaXMub3BlbkhlaWdodCA9IG9wZW5IZWlnaHQ7XG5cdFx0dGhpcy5jbG9zZWRIZWlnaHQgPSBjbG9zZWRIZWlnaHQgPT09IDAgPyB0aGlzLmNsb3NlZEhlaWdodCA6IGNsb3NlZEhlaWdodDtcblxuXHRcdGlmICh0aGlzLm9wZW5IZWlnaHQgPiAwKSB7XG5cdFx0XHR0aGlzLnJlc2l6ZVJvdyh0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLCB0aGlzLm9wZW5IZWlnaHQgKyAncHgnKTtcblx0XHRcdHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJyAmJiBjYigpO1xuXHRcdH1cblx0fSxcblx0cmVzaXplUm93KGVsLCBoZWlnaHQpe1xuXHRcdHRoaXMuaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdGlmIChpdGVtLm5vZGUub2Zmc2V0VG9wID09PSBlbC5vZmZzZXRUb3ApIGl0ZW0ubm9kZS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQ7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHNldFBhbmVsVG9wKCkge1xuXHRcdHRoaXMucGFuZWwuc3R5bGUudG9wID0gYCR7dGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZS5vZmZzZXRUb3AgKyB0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS50cmlnZ2VyLm9mZnNldEhlaWdodH1weGA7XG5cdH1cbn07XG5cbmNvbnN0IGluaXQgPSAoc2VsLCBvcHRzKSA9PiB7XG5cdGxldCBlbHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKSk7XG5cblx0aWYoZWxzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKENPTlNUQU5UUy5FUlJPUlMuUk9PVCk7XG5cblx0cmV0dXJuIGVscy5tYXAoZWwgPT4ge1xuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoU3Rvcm1XYWxsKSwge1xuXHRcdFx0bm9kZTogZWwsXG5cdFx0XHRzZXR0aW5nczogT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdHMpXG5cdFx0fSkuaW5pdCgpO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHsgaW5pdCB9OyIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xuXG4vKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTkFOID0gMCAvIDA7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS4gKi9cbnZhciByZVRyaW0gPSAvXlxccyt8XFxzKyQvZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJhZCBzaWduZWQgaGV4YWRlY2ltYWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmFkSGV4ID0gL15bLStdMHhbMC05YS1mXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiaW5hcnkgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmluYXJ5ID0gL14wYlswMV0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb2N0YWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzT2N0YWwgPSAvXjBvWzAtN10rJC9pO1xuXG4vKiogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgd2l0aG91dCBhIGRlcGVuZGVuY3kgb24gYHJvb3RgLiAqL1xudmFyIGZyZWVQYXJzZUludCA9IHBhcnNlSW50O1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXgsXG4gICAgbmF0aXZlTWluID0gTWF0aC5taW47XG5cbi8qKlxuICogR2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlXG4gKiB0aGUgVW5peCBlcG9jaCAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgRGF0ZVxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgdGltZXN0YW1wLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmRlZmVyKGZ1bmN0aW9uKHN0YW1wKSB7XG4gKiAgIGNvbnNvbGUubG9nKF8ubm93KCkgLSBzdGFtcCk7XG4gKiB9LCBfLm5vdygpKTtcbiAqIC8vID0+IExvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGludm9jYXRpb24uXG4gKi9cbnZhciBub3cgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHJvb3QuRGF0ZS5ub3coKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlYm91bmNlZCBmdW5jdGlvbiB0aGF0IGRlbGF5cyBpbnZva2luZyBgZnVuY2AgdW50aWwgYWZ0ZXIgYHdhaXRgXG4gKiBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiB3YXNcbiAqIGludm9rZWQuIFRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgIG1ldGhvZCB0byBjYW5jZWxcbiAqIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLlxuICogUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb24gdGhlXG4gKiBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkXG4gKiB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50XG4gKiBjYWxscyB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYFxuICogaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIGRlYm91bmNlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy5kZWJvdW5jZWAgYW5kIGBfLnRocm90dGxlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdXG4gKiAgVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGludm9rZWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGRlYm91bmNlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgY29zdGx5IGNhbGN1bGF0aW9ucyB3aGlsZSB0aGUgd2luZG93IHNpemUgaXMgaW4gZmx1eC5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBfLmRlYm91bmNlKGNhbGN1bGF0ZUxheW91dCwgMTUwKSk7XG4gKlxuICogLy8gSW52b2tlIGBzZW5kTWFpbGAgd2hlbiBjbGlja2VkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHMuXG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgXy5kZWJvdW5jZShzZW5kTWFpbCwgMzAwLCB7XG4gKiAgICdsZWFkaW5nJzogdHJ1ZSxcbiAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAqIH0pKTtcbiAqXG4gKiAvLyBFbnN1cmUgYGJhdGNoTG9nYCBpcyBpbnZva2VkIG9uY2UgYWZ0ZXIgMSBzZWNvbmQgb2YgZGVib3VuY2VkIGNhbGxzLlxuICogdmFyIGRlYm91bmNlZCA9IF8uZGVib3VuY2UoYmF0Y2hMb2csIDI1MCwgeyAnbWF4V2FpdCc6IDEwMDAgfSk7XG4gKiB2YXIgc291cmNlID0gbmV3IEV2ZW50U291cmNlKCcvc3RyZWFtJyk7XG4gKiBqUXVlcnkoc291cmNlKS5vbignbWVzc2FnZScsIGRlYm91bmNlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyBkZWJvdW5jZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIGRlYm91bmNlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsYXN0QXJncyxcbiAgICAgIGxhc3RUaGlzLFxuICAgICAgbWF4V2FpdCxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHRpbWVySWQsXG4gICAgICBsYXN0Q2FsbFRpbWUsXG4gICAgICBsYXN0SW52b2tlVGltZSA9IDAsXG4gICAgICBsZWFkaW5nID0gZmFsc2UsXG4gICAgICBtYXhpbmcgPSBmYWxzZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICB3YWl0ID0gdG9OdW1iZXIod2FpdCkgfHwgMDtcbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICEhb3B0aW9ucy5sZWFkaW5nO1xuICAgIG1heGluZyA9ICdtYXhXYWl0JyBpbiBvcHRpb25zO1xuICAgIG1heFdhaXQgPSBtYXhpbmcgPyBuYXRpdmVNYXgodG9OdW1iZXIob3B0aW9ucy5tYXhXYWl0KSB8fCAwLCB3YWl0KSA6IG1heFdhaXQ7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGludm9rZUZ1bmModGltZSkge1xuICAgIHZhciBhcmdzID0gbGFzdEFyZ3MsXG4gICAgICAgIHRoaXNBcmcgPSBsYXN0VGhpcztcblxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxlYWRpbmdFZGdlKHRpbWUpIHtcbiAgICAvLyBSZXNldCBhbnkgYG1heFdhaXRgIHRpbWVyLlxuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICAvLyBTdGFydCB0aGUgdGltZXIgZm9yIHRoZSB0cmFpbGluZyBlZGdlLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgLy8gSW52b2tlIHRoZSBsZWFkaW5nIGVkZ2UuXG4gICAgcmV0dXJuIGxlYWRpbmcgPyBpbnZva2VGdW5jKHRpbWUpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtYWluaW5nV2FpdCh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZSxcbiAgICAgICAgcmVzdWx0ID0gd2FpdCAtIHRpbWVTaW5jZUxhc3RDYWxsO1xuXG4gICAgcmV0dXJuIG1heGluZyA/IG5hdGl2ZU1pbihyZXN1bHQsIG1heFdhaXQgLSB0aW1lU2luY2VMYXN0SW52b2tlKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3VsZEludm9rZSh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZTtcblxuICAgIC8vIEVpdGhlciB0aGlzIGlzIHRoZSBmaXJzdCBjYWxsLCBhY3Rpdml0eSBoYXMgc3RvcHBlZCBhbmQgd2UncmUgYXQgdGhlXG4gICAgLy8gdHJhaWxpbmcgZWRnZSwgdGhlIHN5c3RlbSB0aW1lIGhhcyBnb25lIGJhY2t3YXJkcyBhbmQgd2UncmUgdHJlYXRpbmdcbiAgICAvLyBpdCBhcyB0aGUgdHJhaWxpbmcgZWRnZSwgb3Igd2UndmUgaGl0IHRoZSBgbWF4V2FpdGAgbGltaXQuXG4gICAgcmV0dXJuIChsYXN0Q2FsbFRpbWUgPT09IHVuZGVmaW5lZCB8fCAodGltZVNpbmNlTGFzdENhbGwgPj0gd2FpdCkgfHxcbiAgICAgICh0aW1lU2luY2VMYXN0Q2FsbCA8IDApIHx8IChtYXhpbmcgJiYgdGltZVNpbmNlTGFzdEludm9rZSA+PSBtYXhXYWl0KSk7XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lckV4cGlyZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICBpZiAoc2hvdWxkSW52b2tlKHRpbWUpKSB7XG4gICAgICByZXR1cm4gdHJhaWxpbmdFZGdlKHRpbWUpO1xuICAgIH1cbiAgICAvLyBSZXN0YXJ0IHRoZSB0aW1lci5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHJlbWFpbmluZ1dhaXQodGltZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhaWxpbmdFZGdlKHRpbWUpIHtcbiAgICB0aW1lcklkID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gT25seSBpbnZva2UgaWYgd2UgaGF2ZSBgbGFzdEFyZ3NgIHdoaWNoIG1lYW5zIGBmdW5jYCBoYXMgYmVlblxuICAgIC8vIGRlYm91bmNlZCBhdCBsZWFzdCBvbmNlLlxuICAgIGlmICh0cmFpbGluZyAmJiBsYXN0QXJncykge1xuICAgICAgcmV0dXJuIGludm9rZUZ1bmModGltZSk7XG4gICAgfVxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICBpZiAodGltZXJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgfVxuICAgIGxhc3RJbnZva2VUaW1lID0gMDtcbiAgICBsYXN0QXJncyA9IGxhc3RDYWxsVGltZSA9IGxhc3RUaGlzID0gdGltZXJJZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHJldHVybiB0aW1lcklkID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiB0cmFpbGluZ0VkZ2Uobm93KCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVib3VuY2VkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCksXG4gICAgICAgIGlzSW52b2tpbmcgPSBzaG91bGRJbnZva2UodGltZSk7XG5cbiAgICBsYXN0QXJncyA9IGFyZ3VtZW50cztcbiAgICBsYXN0VGhpcyA9IHRoaXM7XG4gICAgbGFzdENhbGxUaW1lID0gdGltZTtcblxuICAgIGlmIChpc0ludm9raW5nKSB7XG4gICAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nRWRnZShsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgICAgaWYgKG1heGluZykge1xuICAgICAgICAvLyBIYW5kbGUgaW52b2NhdGlvbnMgaW4gYSB0aWdodCBsb29wLlxuICAgICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgICAgICByZXR1cm4gaW52b2tlRnVuYyhsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGRlYm91bmNlZC5jYW5jZWwgPSBjYW5jZWw7XG4gIGRlYm91bmNlZC5mbHVzaCA9IGZsdXNoO1xuICByZXR1cm4gZGVib3VuY2VkO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB0aHJvdHRsZWQgZnVuY3Rpb24gdGhhdCBvbmx5IGludm9rZXMgYGZ1bmNgIGF0IG1vc3Qgb25jZSBwZXJcbiAqIGV2ZXJ5IGB3YWl0YCBtaWxsaXNlY29uZHMuIFRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgXG4gKiBtZXRob2QgdG8gY2FuY2VsIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvXG4gKiBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS4gUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2BcbiAqIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGBcbiAqIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZCB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGVcbiAqIHRocm90dGxlZCBmdW5jdGlvbi4gU3Vic2VxdWVudCBjYWxscyB0byB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHJldHVybiB0aGVcbiAqIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIHRocm90dGxlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy50aHJvdHRsZWAgYW5kIGBfLmRlYm91bmNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIGludm9jYXRpb25zIHRvLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHRocm90dGxlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgZXhjZXNzaXZlbHkgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIHdoaWxlIHNjcm9sbGluZy5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdzY3JvbGwnLCBfLnRocm90dGxlKHVwZGF0ZVBvc2l0aW9uLCAxMDApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHJlbmV3VG9rZW5gIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBidXQgbm90IG1vcmUgdGhhbiBvbmNlIGV2ZXJ5IDUgbWludXRlcy5cbiAqIHZhciB0aHJvdHRsZWQgPSBfLnRocm90dGxlKHJlbmV3VG9rZW4sIDMwMDAwMCwgeyAndHJhaWxpbmcnOiBmYWxzZSB9KTtcbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCB0aHJvdHRsZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgdGhyb3R0bGVkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCB0aHJvdHRsZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGVhZGluZyA9IHRydWUsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICdsZWFkaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLmxlYWRpbmcgOiBsZWFkaW5nO1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cbiAgcmV0dXJuIGRlYm91bmNlKGZ1bmMsIHdhaXQsIHtcbiAgICAnbGVhZGluZyc6IGxlYWRpbmcsXG4gICAgJ21heFdhaXQnOiB3YWl0LFxuICAgICd0cmFpbGluZyc6IHRyYWlsaW5nXG4gIH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIG51bWJlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b051bWJlcigzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b051bWJlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9OdW1iZXIoSW5maW5pdHkpO1xuICogLy8gPT4gSW5maW5pdHlcbiAqXG4gKiBfLnRvTnVtYmVyKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gTkFOO1xuICB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICB2YXIgb3RoZXIgPSB0eXBlb2YgdmFsdWUudmFsdWVPZiA9PSAnZnVuY3Rpb24nID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG4gICAgdmFsdWUgPSBpc09iamVjdChvdGhlcikgPyAob3RoZXIgKyAnJykgOiBvdGhlcjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiArdmFsdWU7XG4gIH1cbiAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHJlVHJpbSwgJycpO1xuICB2YXIgaXNCaW5hcnkgPSByZUlzQmluYXJ5LnRlc3QodmFsdWUpO1xuICByZXR1cm4gKGlzQmluYXJ5IHx8IHJlSXNPY3RhbC50ZXN0KHZhbHVlKSlcbiAgICA/IGZyZWVQYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgaXNCaW5hcnkgPyAyIDogOClcbiAgICA6IChyZUlzQmFkSGV4LnRlc3QodmFsdWUpID8gTkFOIDogK3ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZTtcbiJdfQ==
