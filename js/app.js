(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _stormWall = require('./libs/storm-wall');

var _stormWall2 = _interopRequireDefault(_stormWall);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
	}
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
		this.openIndex = false;

		this.initThrottled();
		this.initItems();
		this.initTriggers();
		this.initPanel();
		this.initButtons();

		window.addEventListener('resize', this.throttledResize.bind(this));
		setTimeout(this.equalHeight.bind(this), 100);

		this.node.classList.add(this.settings.classNames.ready.substr(1));
		return this;
	},
	initThrottled: function initThrottled() {
		var _this = this;

		this.throttledResize = (0, _lodash2.default)(function () {
			_this.equalHeight(_this.setPanelTop.bind(_this));
		}, 60);

		this.throttledChange = (0, _lodash2.default)(this.change, 100);
		this.throttledPrevious = (0, _lodash2.default)(this.previous, 100);
		this.throttledNext = (0, _lodash2.default)(this.next, 100);
	},
	initTriggers: function initTriggers() {
		var _this2 = this;

		this.items.forEach(function (item, i) {
			var trigger = item.node.querySelector(_this2.settings.classNames.trigger);
			if (!trigger) throw new Error(CONSTANTS.ERRORS.TRIGGER);

			CONSTANTS.EVENTS.forEach(function (ev) {
				trigger.addEventListener(ev, function (e) {
					if (e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
					_this2.throttledChange(i);
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
		var _this3 = this;

		var buttonsTemplate = '<button class="' + this.settings.classNames.closeButton.substr(1) + '" aria-label="close">\n\t\t\t\t\t\t\t\t<svg fill="#000000" height="30" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">\n\t\t\t\t\t\t\t\t\t<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>\n\t\t\t\t\t\t\t\t\t<path d="M0 0h24v24H0z" fill="none"/>\n\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t \t\t<button class="' + this.settings.classNames.previousButton.substr(1) + '" aria-label="previous">\n\t\t\t\t\t\t\t\t <svg fill="#000000" height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg">\n\t\t\t\t\t\t\t\t\t\t<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>\n\t\t\t\t\t\t\t\t\t\t<path d="M0 0h24v24H0z" fill="none"/>\n\t\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t \t\t<button class="' + this.settings.classNames.nextButton.substr(1) + '" aria-label="next">\n\t\t\t\t\t\t\t\t\t<svg fill="#000000" height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg">\n\t\t\t\t\t\t\t\t\t\t<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>\n\t\t\t\t\t\t\t\t\t\t<path d="M0 0h24v24H0z" fill="none"/>\n\t\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t\t </button>';

		this.panel.innerHTML = '' + this.panel.innerHTML + buttonsTemplate;

		CONSTANTS.EVENTS.forEach(function (ev) {
			_this3.panel.querySelector(_this3.settings.classNames.closeButton).addEventListener(ev, function (e) {
				if (e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				_this3.close.call(_this3);
			});
			_this3.panel.querySelector(_this3.settings.classNames.previousButton).addEventListener(ev, function (e) {
				if (e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				_this3.throttledPrevious.call(_this3);
			});
			_this3.panel.querySelector(_this3.settings.classNames.nextButton).addEventListener(ev, function (e) {
				if (e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				_this3.throttledNext.call(_this3);
			});
		});
	},
	initItems: function initItems() {
		var _this4 = this;

		var items = [].slice.call(this.node.querySelectorAll(this.settings.classNames.item));

		if (items.length === 0) throw new Error(CONSTANTS.ERRORS.ITEM);

		this.items = items.map(function (item) {
			return {
				node: item,
				content: item.querySelector(_this4.settings.classNames.content),
				trigger: item.querySelector(_this4.settings.classNames.trigger)
			};
		});
	},
	change: function change(i) {
		var _this5 = this;

		if (this.openIndex === false) return this.open(i);
		if (this.openIndex === i) return this.close();
		if (this.items[this.openIndex].node.offsetTop === this.items[i].node.offsetTop) this.close(function () {
			return _this5.open(i, _this5.panel.offsetHeight);
		}, this.panel.offsetHeight);else this.close(function () {
			return _this5.open(i);
		});
	},
	open: function open(i, start, speed) {
		var _this6 = this;

		this.panelSourceContainer = this.items[i].content;
		this.openIndex = i;
		this.setPanelTop();
		this.panelContent = this.panelSourceContainer.firstElementChild.cloneNode(true);
		this.panelInner.appendChild(this.panelContent);
		this.panelSourceContainer.removeChild(this.panelSourceContainer.firstElementChild);
		this.panel.insertBefore(this.panelInner, this.panel.firstElementChild);

		var currentTime = 0,
		    panelStart = start || 0,
		    totalPanelChange = this.panelInner.offsetHeight - panelStart,
		    rowStart = this.closedHeight + panelStart,
		    totalRowChange = totalPanelChange,
		    duration = speed || 16,
		    animateOpen = function animateOpen() {
			currentTime++;
			_this6.panel.style.height = (0, _easeInOutQuad2.default)(currentTime, panelStart, totalPanelChange, duration) + 'px';
			_this6.resizeRow(_this6.items[_this6.openIndex].node, (0, _easeInOutQuad2.default)(currentTime, rowStart, totalRowChange, duration) + 'px');
			if (currentTime < duration) window.requestAnimationFrame(animateOpen.bind(_this6));else {
				_this6.panel.style.height = 'auto';
				_this6.items[i].node.parentNode.insertBefore(_this6.panel, _this6.items[i].node.nextElementSibling);
				if (!(0, _inView2.default)(_this6.panel, function () {
					return {
						l: 0,
						t: 0,
						b: (window.innerHeight || document.documentElement.clientHeight) - _this6.panel.offsetHeight,
						r: window.innerWidth || document.documentElement.clientWidth
					};
				})) (0, _scrollTo2.default)(_this6.panel.offsetTop - 120);
			}
		};

		this.node.classList.add(this.settings.classNames.open.substr(1));

		this.panel.removeAttribute('aria-hidden');
		this.items[i].trigger.setAttribute('aria-expanded', true);

		animateOpen.call(this);

		return this;
	},
	close: function close(cb, end, speed) {
		var _this7 = this;

		var endPoint = end || 0,
		    currentTime = 0,
		    panelStart = this.panel.offsetHeight,
		    totalPanelChange = endPoint - panelStart,
		    rowStart = this.items[this.openIndex].node.offsetHeight,
		    totalRowChange = totalPanelChange,
		    duration = speed || 16,
		    animateClosed = function animateClosed() {
			currentTime++;
			_this7.panel.style.height = (0, _easeInOutQuad2.default)(currentTime, panelStart, totalPanelChange, duration) + 'px';
			_this7.resizeRow(_this7.items[_this7.openIndex].node, (0, _easeInOutQuad2.default)(currentTime, rowStart, totalRowChange, duration) + 'px');
			if (currentTime < duration) window.requestAnimationFrame(animateClosed.bind(_this7));else {
				if (!endPoint) _this7.panel.style.height = 'auto';
				_this7.panelInner.removeChild(_this7.panelContent);
				_this7.panel.setAttribute('aria-hidden', true);
				_this7.items[_this7.openIndex].trigger.setAttribute('aria-expanded', false);
				_this7.panelSourceContainer.appendChild(_this7.panelContent);
				_this7.node.classList.remove(_this7.settings.classNames.animating.substr(1));
				_this7.node.classList.remove(_this7.settings.classNames.open.substr(1));
				_this7.openIndex = false;
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
		var _this8 = this;

		var openHeight = 0,
		    closedHeight = 0;

		this.items.map(function (item, i) {
			item.node.style.height = 'auto';
			if (_this8.openIndex !== false && item.node.offsetTop === _this8.items[_this8.openIndex].node.offsetTop) {
				if (_this8.openIndex === i) openHeight = item.node.offsetHeight + _this8.panel.offsetHeight;
			} else {
				if (item.node.offsetHeight > closedHeight) closedHeight = item.node.offsetHeight;
			}
			return item;
		}).map(function (item, i) {
			if (_this8.openIndex !== i) item.node.style.height = closedHeight + 'px';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvZWFzZUluT3V0UXVhZC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvbGlicy9pblZpZXcuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvc2Nyb2xsVG8uanMiLCJleGFtcGxlL3NyYy9saWJzL3N0b3JtLXdhbGwuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7O0FBRUEsSUFBTSxjQUFjLENBQUMsWUFBTTtBQUMxQixxQkFBSyxJQUFMLENBQVUsVUFBVjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBUG1CLENBQXBCOztBQVNBLElBQUcsc0JBQXNCLE1BQXpCLEVBQWlDLE9BQU8sZ0JBQVAsQ0FBd0IsTUFBeEIsRUFBZ0MsWUFBTTtBQUFFLGFBQVksT0FBWixDQUFvQixVQUFDLEVBQUQ7QUFBQSxTQUFRLElBQVI7QUFBQSxFQUFwQjtBQUFvQyxDQUE1RTs7Ozs7Ozs7O0FDWGpDO2tCQUNlLFVBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFnQjtBQUM5QixNQUFLLElBQUksQ0FBVDtBQUNBLEtBQUksSUFBSSxDQUFSLEVBQVc7QUFDVixTQUFPLElBQUksQ0FBSixHQUFRLENBQVIsR0FBWSxDQUFaLEdBQWdCLENBQXZCO0FBQ0E7QUFDRDtBQUNBLFFBQU8sQ0FBQyxDQUFELEdBQUssQ0FBTCxJQUFVLEtBQUssSUFBSSxDQUFULElBQWMsQ0FBeEIsSUFBNkIsQ0FBcEM7QUFDQSxDOzs7Ozs7Ozs7a0JDUmMsVUFBQyxPQUFELEVBQVUsSUFBVixFQUFtQjtBQUNqQyxLQUFJLE1BQU0sUUFBUSxxQkFBUixFQUFWO0FBQ0EsUUFBUSxJQUFJLEtBQUosSUFBYSxLQUFLLENBQWxCLElBQXVC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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBXYWxsIGZyb20gJy4vbGlicy9zdG9ybS13YWxsJztcblxuY29uc3Qgb25Mb2FkVGFza3MgPSBbKCkgPT4ge1xuXHRXYWxsLmluaXQoJy5qcy13YWxsJyk7XG5cdFxuXHQvLyBMb2FkKCcuL2pzL3N0b3JtLXdhbGwuc3RhbmRhbG9uZS5qcycpXG5cdC8vIFx0LnRoZW4oKCkgPT4ge1xuXHQvLyBcdFx0U3Rvcm1XYWxsLmluaXQoJy5qcy13YWxsJyk7XG5cdC8vIFx0fSk7XG59XTtcblxuaWYoJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7IG9uTG9hZFRhc2tzLmZvckVhY2goKGZuKSA9PiBmbigpKTsgfSk7IiwiLy9odHRwOi8vZ29vLmdsLzVITGw4XG5leHBvcnQgZGVmYXVsdCAodCwgYiwgYywgZCkgPT4ge1xuXHR0IC89IGQgLyAyO1xuXHRpZiAodCA8IDEpIHtcblx0XHRyZXR1cm4gYyAvIDIgKiB0ICogdCArIGI7XG5cdH1cblx0dC0tO1xuXHRyZXR1cm4gLWMgLyAyICogKHQgKiAodCAtIDIpIC0gMSkgKyBiO1xufTsiLCJleHBvcnQgZGVmYXVsdCAoZWxlbWVudCwgdmlldykgPT4ge1xuXHRsZXQgYm94ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0cmV0dXJuIChib3gucmlnaHQgPj0gdmlldy5sICYmIGJveC5ib3R0b20gPj0gdmlldy50ICYmIGJveC5sZWZ0IDw9IHZpZXcuciAmJiBib3gudG9wIDw9IHZpZXcuYik7XG59OyIsImltcG9ydCBlYXNlSW5PdXRRdWFkIGZyb20gJy4vZWFzZUluT3V0UXVhZCc7XG5cbmNvbnN0IG1vdmUgPSBhbW91bnQgPT4ge1xuXHRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wID0gYW1vdW50O1xuXHRkb2N1bWVudC5ib2R5LnBhcmVudE5vZGUuc2Nyb2xsVG9wID0gYW1vdW50O1xuXHRkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA9IGFtb3VudDtcbn07XG5cbmNvbnN0IHBvc2l0aW9uID0gKCkgPT4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnBhcmVudE5vZGUuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuXG5leHBvcnQgZGVmYXVsdCAodG8sIGR1cmF0aW9uID0gNTAwLCBjYWxsYmFjaykgPT4ge1xuXHRsZXQgc3RhcnQgPSBwb3NpdGlvbigpLFxuXHRcdGNoYW5nZSA9IHRvIC0gc3RhcnQsXG5cdFx0Y3VycmVudFRpbWUgPSAwLFxuXHRcdGluY3JlbWVudCA9IDIwLFxuXHRcdGFuaW1hdGVTY3JvbGwgPSAoKSA9PiB7XG5cdFx0XHRjdXJyZW50VGltZSArPSBpbmNyZW1lbnQ7XG5cdFx0XHRsZXQgdmFsID0gZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgc3RhcnQsIGNoYW5nZSwgZHVyYXRpb24pO1xuXHRcdFx0bW92ZSh2YWwpO1xuXHRcdFx0XG5cdFx0XHRpZiAoY3VycmVudFRpbWUgPCBkdXJhdGlvbikgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVNjcm9sbCk7XG5cdFx0XHRlbHNlIChjYWxsYmFjayAmJiB0eXBlb2YgKGNhbGxiYWNrKSA9PT0gJ2Z1bmN0aW9uJykgJiYgY2FsbGJhY2soKTtcblx0XHR9O1xuXHRhbmltYXRlU2Nyb2xsKCk7XG59OyIsImltcG9ydCB0aHJvdHRsZSBmcm9tICdsb2Rhc2gudGhyb3R0bGUnO1xuXG5pbXBvcnQgc2Nyb2xsVG8gZnJvbSAnLi9saWJzL3Njcm9sbFRvJztcbmltcG9ydCBpblZpZXcgZnJvbSAnLi9saWJzL2luVmlldyc7XG5pbXBvcnQgZWFzZUluT3V0UXVhZCBmcm9tICcuL2xpYnMvZWFzZUluT3V0UXVhZCc7XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuXHRjbGFzc05hbWVzOiB7XG5cdFx0cmVhZHk6ICcuanMtd2FsbC0taXMtcmVhZHknLFxuXHRcdHRyaWdnZXI6ICcuanMtd2FsbC10cmlnZ2VyJyxcblx0XHRpdGVtOiAnLmpzLXdhbGwtaXRlbScsXG5cdFx0Y29udGVudDogJy5qcy13YWxsLWNoaWxkJyxcblx0XHRwYW5lbDogJy5qcy13YWxsLXBhbmVsJyxcblx0XHRwYW5lbElubmVyOiAnLmpzLXdhbGwtcGFuZWwtaW5uZXInLFxuXHRcdG9wZW46ICcuanMtd2FsbC0taXMtb3BlbicsXG5cdFx0YW5pbWF0aW5nOiAnLmpzLXdhbGwtLWlzLWFuaW1hdGluZycsXG5cdFx0Y2xvc2VCdXR0b246ICcuanMtd2FsbC1jbG9zZScsXG5cdFx0bmV4dEJ1dHRvbjogJy5qcy13YWxsLW5leHQnLFxuXHRcdHByZXZpb3VzQnV0dG9uOiAnLmpzLXdhbGwtcHJldmlvdXMnXG5cdH1cbn07XG5cbmNvbnN0IENPTlNUQU5UUyA9IHtcblx0RVJST1JTOiB7XG5cdFx0Uk9PVDogJ1dhbGwgY2Fubm90IGJlIGluaXRpYWxpc2VkLCBubyB0cmlnZ2VyIGVsZW1lbnRzIGZvdW5kJyxcblx0XHRJVEVNOiAnV2FsbCBpdGVtIGNhbm5vdCBiZSBmb3VuZCcsXG5cdFx0VFJJR0dFUjogJ1dhbGwgdHJpZ2dlciBjYW5ub3QgYmUgZm91bmQnXG5cdH0sXG5cdEtFWUNPREVTOiBbMTMsIDMyXSxcblx0RVZFTlRTOiBbJ2NsaWNrJywgJ2tleWRvd24nXVxufTtcblxuY29uc3QgU3Rvcm1XYWxsID0ge1xuXHRpbml0KCl7XG5cdFx0dGhpcy5vcGVuSW5kZXggPSBmYWxzZTtcblxuXHRcdHRoaXMuaW5pdFRocm90dGxlZCgpO1xuXHRcdHRoaXMuaW5pdEl0ZW1zKCk7XG5cdFx0dGhpcy5pbml0VHJpZ2dlcnMoKTtcblx0XHR0aGlzLmluaXRQYW5lbCgpO1xuXHRcdHRoaXMuaW5pdEJ1dHRvbnMoKTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnRocm90dGxlZFJlc2l6ZS5iaW5kKHRoaXMpKTtcblx0XHRzZXRUaW1lb3V0KHRoaXMuZXF1YWxIZWlnaHQuYmluZCh0aGlzKSwgMTAwKTtcblx0XHRcblx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMucmVhZHkuc3Vic3RyKDEpKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0aW5pdFRocm90dGxlZCgpe1xuXHRcdHRoaXMudGhyb3R0bGVkUmVzaXplID0gdGhyb3R0bGUoKCkgPT4ge1xuXHRcdFx0dGhpcy5lcXVhbEhlaWdodCh0aGlzLnNldFBhbmVsVG9wLmJpbmQodGhpcykpO1xuXHRcdH0sIDYwKTtcblxuXHRcdHRoaXMudGhyb3R0bGVkQ2hhbmdlID0gdGhyb3R0bGUodGhpcy5jaGFuZ2UsIDEwMCk7XG5cdFx0dGhpcy50aHJvdHRsZWRQcmV2aW91cyA9IHRocm90dGxlKHRoaXMucHJldmlvdXMsIDEwMCk7XG5cdFx0dGhpcy50aHJvdHRsZWROZXh0ID0gdGhyb3R0bGUodGhpcy5uZXh0LCAxMDApO1xuXHR9LFxuXHRpbml0VHJpZ2dlcnMoKXtcblx0XHR0aGlzLml0ZW1zLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcblx0XHRcdGxldCB0cmlnZ2VyID0gaXRlbS5ub2RlLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnRyaWdnZXIpO1xuXHRcdFx0aWYoIXRyaWdnZXIpIHRocm93IG5ldyBFcnJvcihDT05TVEFOVFMuRVJST1JTLlRSSUdHRVIpO1xuXG5cdFx0XHRDT05TVEFOVFMuRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0XHR0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0XHR0aGlzLnRocm90dGxlZENoYW5nZShpKTtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cdGluaXRQYW5lbCgpe1xuXHRcdGxldCBlbGVtZW50RmFjdG9yeSA9IChlbGVtZW50LCBjbGFzc05hbWUsIGF0dHJpYnV0ZXMpID0+IHtcblx0XHRcdFx0bGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50KTtcblx0XHRcdFx0ZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuXHRcdFx0XHRmb3IgKHZhciBrIGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0XHRpZiAoYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuXHRcdFx0XHRcdFx0ZWwuc2V0QXR0cmlidXRlKGssIGF0dHJpYnV0ZXNba10pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZWw7XG5cdFx0XHR9LFxuXHRcdFx0cGFuZWxFbGVtZW50ID0gZWxlbWVudEZhY3RvcnkodGhpcy5pdGVtc1swXS5ub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSwgdGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnBhbmVsLnN1YnN0cigxKSwgeyAnYXJpYS1oaWRkZW4nOiB0cnVlIH0pO1xuXHRcdFxuXHRcdHRoaXMucGFuZWxJbm5lciA9IGVsZW1lbnRGYWN0b3J5KCdkaXYnLCB0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMucGFuZWxJbm5lci5zdWJzdHIoMSkpO1xuXHRcdHRoaXMucGFuZWwgPSB0aGlzLm5vZGUuYXBwZW5kQ2hpbGQocGFuZWxFbGVtZW50KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cdGluaXRCdXR0b25zKCl7XG5cdFx0bGV0IGJ1dHRvbnNUZW1wbGF0ZSA9IGA8YnV0dG9uIGNsYXNzPVwiJHt0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuY2xvc2VCdXR0b24uc3Vic3RyKDEpfVwiIGFyaWEtbGFiZWw9XCJjbG9zZVwiPlxuXHRcdFx0XHRcdFx0XHRcdDxzdmcgZmlsbD1cIiMwMDAwMDBcIiBoZWlnaHQ9XCIzMFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuXHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0xOSA2LjQxTDE3LjU5IDUgMTIgMTAuNTkgNi40MSA1IDUgNi40MSAxMC41OSAxMiA1IDE3LjU5IDYuNDEgMTkgMTIgMTMuNDEgMTcuNTkgMTkgMTkgMTcuNTkgMTMuNDEgMTJ6XCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0wIDBoMjR2MjRIMHpcIiBmaWxsPVwibm9uZVwiLz5cblx0XHRcdFx0XHRcdFx0XHQ8L3N2Zz5cblx0XHRcdFx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdFx0XHQgXHRcdDxidXR0b24gY2xhc3M9XCIke3RoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5wcmV2aW91c0J1dHRvbi5zdWJzdHIoMSl9XCIgYXJpYS1sYWJlbD1cInByZXZpb3VzXCI+XG5cdFx0XHRcdFx0XHRcdFx0IDxzdmcgZmlsbD1cIiMwMDAwMDBcIiBoZWlnaHQ9XCIzNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjM2XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTE1LjQxIDcuNDFMMTQgNmwtNiA2IDYgNiAxLjQxLTEuNDFMMTAuODMgMTJ6XCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTAgMGgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9zdmc+XG5cdFx0XHRcdFx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdFx0XHQgXHRcdDxidXR0b24gY2xhc3M9XCIke3RoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5uZXh0QnV0dG9uLnN1YnN0cigxKX1cIiBhcmlhLWxhYmVsPVwibmV4dFwiPlxuXHRcdFx0XHRcdFx0XHRcdFx0PHN2ZyBmaWxsPVwiIzAwMDAwMFwiIGhlaWdodD1cIjM2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMzZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMTAgNkw4LjU5IDcuNDEgMTMuMTcgMTJsLTQuNTggNC41OUwxMCAxOGw2LTZ6XCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTAgMGgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9zdmc+XG5cdFx0XHRcdFx0XHRcdFx0IDwvYnV0dG9uPmA7XG5cblx0XHR0aGlzLnBhbmVsLmlubmVySFRNTCA9IGAke3RoaXMucGFuZWwuaW5uZXJIVE1MfSR7YnV0dG9uc1RlbXBsYXRlfWA7XG5cdFx0XHRcblx0XHRDT05TVEFOVFMuRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0dGhpcy5wYW5lbC5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5jbG9zZUJ1dHRvbikuYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0dGhpcy5jbG9zZS5jYWxsKHRoaXMpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnBhbmVsLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnByZXZpb3VzQnV0dG9uKS5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlICYmICF+Q09OU1RBTlRTLktFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLnRocm90dGxlZFByZXZpb3VzLmNhbGwodGhpcyk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucGFuZWwucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMubmV4dEJ1dHRvbikuYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0dGhpcy50aHJvdHRsZWROZXh0LmNhbGwodGhpcyk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSxcblx0aW5pdEl0ZW1zKCl7XG5cdFx0bGV0IGl0ZW1zID0gW10uc2xpY2UuY2FsbCh0aGlzLm5vZGUucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuaXRlbSkpO1xuXG5cdFx0aWYoaXRlbXMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoQ09OU1RBTlRTLkVSUk9SUy5JVEVNKTtcblxuXHRcdHRoaXMuaXRlbXMgPSBpdGVtcy5tYXAoaXRlbSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRub2RlOiBpdGVtLFxuXHRcdFx0XHRjb250ZW50OiBpdGVtLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLmNvbnRlbnQpLFxuXHRcdFx0XHR0cmlnZ2VyOiBpdGVtLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnRyaWdnZXIpXG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdH0sXG5cdGNoYW5nZShpKXtcblx0XHRpZih0aGlzLm9wZW5JbmRleCA9PT0gZmFsc2UpIHJldHVybiB0aGlzLm9wZW4oaSk7XG5cdFx0aWYodGhpcy5vcGVuSW5kZXggPT09IGkpIHJldHVybiB0aGlzLmNsb3NlKCk7XG5cdFx0aWYgKHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUub2Zmc2V0VG9wID09PSB0aGlzLml0ZW1zW2ldLm5vZGUub2Zmc2V0VG9wKSB0aGlzLmNsb3NlKCgpID0+IHRoaXMub3BlbihpLCB0aGlzLnBhbmVsLm9mZnNldEhlaWdodCksIHRoaXMucGFuZWwub2Zmc2V0SGVpZ2h0KTtcblx0XHRlbHNlIHRoaXMuY2xvc2UoKCkgPT4gdGhpcy5vcGVuKGkpKTtcblx0fSxcblx0b3BlbihpLCBzdGFydCwgc3BlZWQpe1xuXHRcdHRoaXMucGFuZWxTb3VyY2VDb250YWluZXIgPSB0aGlzLml0ZW1zW2ldLmNvbnRlbnQ7XG5cdFx0dGhpcy5vcGVuSW5kZXggPSBpO1xuXHRcdHRoaXMuc2V0UGFuZWxUb3AoKTtcblx0XHR0aGlzLnBhbmVsQ29udGVudCA9IHRoaXMucGFuZWxTb3VyY2VDb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQuY2xvbmVOb2RlKHRydWUpO1xuXHRcdHRoaXMucGFuZWxJbm5lci5hcHBlbmRDaGlsZCh0aGlzLnBhbmVsQ29udGVudCk7XG5cdFx0dGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLnBhbmVsU291cmNlQ29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkKTtcblx0XHR0aGlzLnBhbmVsLmluc2VydEJlZm9yZSh0aGlzLnBhbmVsSW5uZXIsIHRoaXMucGFuZWwuZmlyc3RFbGVtZW50Q2hpbGQpO1xuXG5cdFx0bGV0IGN1cnJlbnRUaW1lID0gMCxcblx0XHRcdHBhbmVsU3RhcnQgPSBzdGFydCB8fCAwLFxuXHRcdFx0dG90YWxQYW5lbENoYW5nZSA9IHRoaXMucGFuZWxJbm5lci5vZmZzZXRIZWlnaHQgLSBwYW5lbFN0YXJ0LFxuXHRcdFx0cm93U3RhcnQgPSB0aGlzLmNsb3NlZEhlaWdodCArIHBhbmVsU3RhcnQsXG5cdFx0XHR0b3RhbFJvd0NoYW5nZSA9IHRvdGFsUGFuZWxDaGFuZ2UsXG5cdFx0XHRkdXJhdGlvbiA9IHNwZWVkIHx8IDE2LFxuXHRcdFx0YW5pbWF0ZU9wZW4gPSAoKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRUaW1lKys7XG5cdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcGFuZWxTdGFydCwgdG90YWxQYW5lbENoYW5nZSwgZHVyYXRpb24pICsgJ3B4Jztcblx0XHRcdFx0dGhpcy5yZXNpemVSb3codGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZSwgZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcm93U3RhcnQsIHRvdGFsUm93Q2hhbmdlLCBkdXJhdGlvbikgKyAncHgnKTtcblx0XHRcdFx0aWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZU9wZW4uYmluZCh0aGlzKSk7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMuaXRlbXNbaV0ubm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLnBhbmVsLCB0aGlzLml0ZW1zW2ldLm5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKTtcblx0XHRcdFx0XHRpZiAoIWluVmlldyh0aGlzLnBhbmVsLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRsOiAwLFxuXHRcdFx0XHRcdFx0XHR0OiAwLFxuXHRcdFx0XHRcdFx0XHRiOiAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpIC0gdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQsXG5cdFx0XHRcdFx0XHRcdHI6ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH0pKSBzY3JvbGxUbyh0aGlzLnBhbmVsLm9mZnNldFRvcCAtIDEyMCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMub3Blbi5zdWJzdHIoMSkpO1xuXG5cdFx0dGhpcy5wYW5lbC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG5cdFx0dGhpcy5pdGVtc1tpXS50cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIHRydWUpO1xuXG5cdFx0YW5pbWF0ZU9wZW4uY2FsbCh0aGlzKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRjbG9zZShjYiwgZW5kLCBzcGVlZCl7XG5cdFx0bGV0IGVuZFBvaW50ID0gZW5kIHx8IDAsXG5cdFx0XHRjdXJyZW50VGltZSA9IDAsXG5cdFx0XHRwYW5lbFN0YXJ0ID0gdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQsXG5cdFx0XHR0b3RhbFBhbmVsQ2hhbmdlID0gZW5kUG9pbnQgLSBwYW5lbFN0YXJ0LFxuXHRcdFx0cm93U3RhcnQgPSB0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLm9mZnNldEhlaWdodCxcblx0XHRcdHRvdGFsUm93Q2hhbmdlID0gdG90YWxQYW5lbENoYW5nZSxcblx0XHRcdGR1cmF0aW9uID0gc3BlZWQgfHwgMTYsXG5cdFx0XHRhbmltYXRlQ2xvc2VkID0gKCkgPT4ge1xuXHRcdFx0XHRjdXJyZW50VGltZSsrO1xuXHRcdFx0XHR0aGlzLnBhbmVsLnN0eWxlLmhlaWdodCA9IGVhc2VJbk91dFF1YWQoY3VycmVudFRpbWUsIHBhbmVsU3RhcnQsIHRvdGFsUGFuZWxDaGFuZ2UsIGR1cmF0aW9uKSArICdweCc7XG5cdFx0XHRcdHRoaXMucmVzaXplUm93KHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUsIGVhc2VJbk91dFF1YWQoY3VycmVudFRpbWUsIHJvd1N0YXJ0LCB0b3RhbFJvd0NoYW5nZSwgZHVyYXRpb24pICsgJ3B4Jyk7XG5cdFx0XHRcdGlmIChjdXJyZW50VGltZSA8IGR1cmF0aW9uKSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVDbG9zZWQuYmluZCh0aGlzKSk7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGlmICghZW5kUG9pbnQpIHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMucGFuZWxJbm5lci5yZW1vdmVDaGlsZCh0aGlzLnBhbmVsQ29udGVudCk7XG5cdFx0XHRcdFx0dGhpcy5wYW5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG5cdFx0XHRcdFx0dGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0udHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSk7XG5cdFx0XHRcdFx0dGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnBhbmVsQ29udGVudCk7XG5cdFx0XHRcdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLmFuaW1hdGluZy5zdWJzdHIoMSkpO1xuXHRcdFx0XHRcdHRoaXMubm9kZS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5vcGVuLnN1YnN0cigxKSk7XG5cdFx0XHRcdFx0dGhpcy5vcGVuSW5kZXggPSBmYWxzZTtcblx0XHRcdFx0XHR0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicgJiYgY2IoKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcblx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuYW5pbWF0aW5nLnN1YnN0cigxKSk7XG5cblx0XHRhbmltYXRlQ2xvc2VkLmNhbGwodGhpcyk7XG5cdH0sXG5cdHByZXZpb3VzKCkge1xuXHRcdHJldHVybiB0aGlzLmNoYW5nZSgodGhpcy5vcGVuSW5kZXggLSAxIDwgMCA/IHRoaXMuaXRlbXMubGVuZ3RoIC0gMSA6IHRoaXMub3BlbkluZGV4IC0gMSkpO1xuXHR9LFxuXHRuZXh0KCkge1xuXHRcdHJldHVybiB0aGlzLmNoYW5nZSgodGhpcy5vcGVuSW5kZXggKyAxID09PSB0aGlzLml0ZW1zLmxlbmd0aCA/IDAgOiB0aGlzLm9wZW5JbmRleCArIDEpKTtcblx0fSxcblx0ZXF1YWxIZWlnaHQoY2IpIHtcblx0XHRsZXQgb3BlbkhlaWdodCA9IDAsXG5cdFx0XHRjbG9zZWRIZWlnaHQgPSAwO1xuXG5cdFx0dGhpcy5pdGVtcy5tYXAoKGl0ZW0sIGkpID0+IHtcblx0XHRcdGl0ZW0ubm9kZS5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG5cdFx0XHRpZiAodGhpcy5vcGVuSW5kZXggIT09IGZhbHNlICYmIGl0ZW0ubm9kZS5vZmZzZXRUb3AgPT09IHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUub2Zmc2V0VG9wKSB7XG5cdFx0XHRcdGlmICh0aGlzLm9wZW5JbmRleCA9PT0gaSkgb3BlbkhlaWdodCA9IGl0ZW0ubm9kZS5vZmZzZXRIZWlnaHQgKyB0aGlzLnBhbmVsLm9mZnNldEhlaWdodDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChpdGVtLm5vZGUub2Zmc2V0SGVpZ2h0ID4gY2xvc2VkSGVpZ2h0KSBjbG9zZWRIZWlnaHQgPSBpdGVtLm5vZGUub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0fSkubWFwKChpdGVtLCBpKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5vcGVuSW5kZXggIT09IGkpIGl0ZW0ubm9kZS5zdHlsZS5oZWlnaHQgPSBjbG9zZWRIZWlnaHQgKyAncHgnO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5vcGVuSGVpZ2h0ID0gb3BlbkhlaWdodDtcblx0XHR0aGlzLmNsb3NlZEhlaWdodCA9IGNsb3NlZEhlaWdodCA9PT0gMCA/IHRoaXMuY2xvc2VkSGVpZ2h0IDogY2xvc2VkSGVpZ2h0O1xuXG5cdFx0aWYgKHRoaXMub3BlbkhlaWdodCA+IDApIHtcblx0XHRcdHRoaXMucmVzaXplUm93KHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUsIHRoaXMub3BlbkhlaWdodCArICdweCcpO1xuXHRcdFx0dHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICYmIGNiKCk7XG5cdFx0fVxuXHR9LFxuXHRyZXNpemVSb3coZWwsIGhlaWdodCl7XG5cdFx0dGhpcy5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuXHRcdFx0aWYgKGl0ZW0ubm9kZS5vZmZzZXRUb3AgPT09IGVsLm9mZnNldFRvcCkgaXRlbS5ub2RlLnN0eWxlLmhlaWdodCA9IGhlaWdodDtcblx0XHR9KTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0c2V0UGFuZWxUb3AoKSB7XG5cdFx0dGhpcy5wYW5lbC5zdHlsZS50b3AgPSBgJHt0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLm9mZnNldFRvcCArIHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLnRyaWdnZXIub2Zmc2V0SGVpZ2h0fXB4YDtcblx0fVxufTtcblxuY29uc3QgaW5pdCA9IChzZWwsIG9wdHMpID0+IHtcblx0bGV0IGVscyA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcblx0XG5cdGlmKGVscy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcihDT05TVEFOVFMuRVJST1JTLlJPT1QpO1xuXHRcblx0cmV0dXJuIGVscy5tYXAoZWwgPT4ge1xuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoU3Rvcm1XYWxsKSwge1xuXHRcdFx0bm9kZTogZWwsXG5cdFx0XHRzZXR0aW5nczogT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdHMpXG5cdFx0fSkuaW5pdCgpO1xuXHR9KTtcbn07XG5cdFxuZXhwb3J0IGRlZmF1bHQgeyBpbml0IH07IiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHRoZSBgVHlwZUVycm9yYCBtZXNzYWdlIGZvciBcIkZ1bmN0aW9uc1wiIG1ldGhvZHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBOQU4gPSAwIC8gMDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLiAqL1xudmFyIHJlVHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heCxcbiAgICBuYXRpdmVNaW4gPSBNYXRoLm1pbjtcblxuLyoqXG4gKiBHZXRzIHRoZSB0aW1lc3RhbXAgb2YgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2VcbiAqIHRoZSBVbml4IGVwb2NoICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBEYXRlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lc3RhbXAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVmZXIoZnVuY3Rpb24oc3RhbXApIHtcbiAqICAgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTtcbiAqIH0sIF8ubm93KCkpO1xuICogLy8gPT4gTG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgaW52b2NhdGlvbi5cbiAqL1xudmFyIG5vdyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcm9vdC5EYXRlLm5vdygpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZGVsYXlzIGludm9raW5nIGBmdW5jYCB1bnRpbCBhZnRlciBgd2FpdGBcbiAqIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHdhc1xuICogaW52b2tlZC4gVGhlIGRlYm91bmNlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGAgbWV0aG9kIHRvIGNhbmNlbFxuICogZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG8gaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uXG4gKiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGVcbiAqIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWRcbiAqIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnRcbiAqIGNhbGxzIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgXG4gKiBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLmRlYm91bmNlYCBhbmQgYF8udGhyb3R0bGVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVib3VuY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz1mYWxzZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF1cbiAqICBUaGUgbWF4aW11bSB0aW1lIGBmdW5jYCBpcyBhbGxvd2VkIHRvIGJlIGRlbGF5ZWQgYmVmb3JlIGl0J3MgaW52b2tlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZGVib3VuY2VkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBjb3N0bHkgY2FsY3VsYXRpb25zIHdoaWxlIHRoZSB3aW5kb3cgc2l6ZSBpcyBpbiBmbHV4LlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoY2FsY3VsYXRlTGF5b3V0LCAxNTApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHNlbmRNYWlsYCB3aGVuIGNsaWNrZWQsIGRlYm91bmNpbmcgc3Vic2VxdWVudCBjYWxscy5cbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCBfLmRlYm91bmNlKHNlbmRNYWlsLCAzMDAsIHtcbiAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSkpO1xuICpcbiAqIC8vIEVuc3VyZSBgYmF0Y2hMb2dgIGlzIGludm9rZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHMuXG4gKiB2YXIgZGVib3VuY2VkID0gXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7ICdtYXhXYWl0JzogMTAwMCB9KTtcbiAqIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9zdHJlYW0nKTtcbiAqIGpRdWVyeShzb3VyY2UpLm9uKCdtZXNzYWdlJywgZGVib3VuY2VkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIGRlYm91bmNlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgZGVib3VuY2VkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxhc3RBcmdzLFxuICAgICAgbGFzdFRoaXMsXG4gICAgICBtYXhXYWl0LFxuICAgICAgcmVzdWx0LFxuICAgICAgdGltZXJJZCxcbiAgICAgIGxhc3RDYWxsVGltZSxcbiAgICAgIGxhc3RJbnZva2VUaW1lID0gMCxcbiAgICAgIGxlYWRpbmcgPSBmYWxzZSxcbiAgICAgIG1heGluZyA9IGZhbHNlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHdhaXQgPSB0b051bWJlcih3YWl0KSB8fCAwO1xuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gISFvcHRpb25zLmxlYWRpbmc7XG4gICAgbWF4aW5nID0gJ21heFdhaXQnIGluIG9wdGlvbnM7XG4gICAgbWF4V2FpdCA9IG1heGluZyA/IG5hdGl2ZU1heCh0b051bWJlcihvcHRpb25zLm1heFdhaXQpIHx8IDAsIHdhaXQpIDogbWF4V2FpdDtcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRnVuYyh0aW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBsYXN0QXJncyxcbiAgICAgICAgdGhpc0FyZyA9IGxhc3RUaGlzO1xuXG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbGVhZGluZ0VkZ2UodGltZSkge1xuICAgIC8vIFJlc2V0IGFueSBgbWF4V2FpdGAgdGltZXIuXG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIC8vIFN0YXJ0IHRoZSB0aW1lciBmb3IgdGhlIHRyYWlsaW5nIGVkZ2UuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAvLyBJbnZva2UgdGhlIGxlYWRpbmcgZWRnZS5cbiAgICByZXR1cm4gbGVhZGluZyA/IGludm9rZUZ1bmModGltZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZW1haW5pbmdXYWl0KHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lLFxuICAgICAgICByZXN1bHQgPSB3YWl0IC0gdGltZVNpbmNlTGFzdENhbGw7XG5cbiAgICByZXR1cm4gbWF4aW5nID8gbmF0aXZlTWluKHJlc3VsdCwgbWF4V2FpdCAtIHRpbWVTaW5jZUxhc3RJbnZva2UpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkSW52b2tlKHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lO1xuXG4gICAgLy8gRWl0aGVyIHRoaXMgaXMgdGhlIGZpcnN0IGNhbGwsIGFjdGl2aXR5IGhhcyBzdG9wcGVkIGFuZCB3ZSdyZSBhdCB0aGVcbiAgICAvLyB0cmFpbGluZyBlZGdlLCB0aGUgc3lzdGVtIHRpbWUgaGFzIGdvbmUgYmFja3dhcmRzIGFuZCB3ZSdyZSB0cmVhdGluZ1xuICAgIC8vIGl0IGFzIHRoZSB0cmFpbGluZyBlZGdlLCBvciB3ZSd2ZSBoaXQgdGhlIGBtYXhXYWl0YCBsaW1pdC5cbiAgICByZXR1cm4gKGxhc3RDYWxsVGltZSA9PT0gdW5kZWZpbmVkIHx8ICh0aW1lU2luY2VMYXN0Q2FsbCA+PSB3YWl0KSB8fFxuICAgICAgKHRpbWVTaW5jZUxhc3RDYWxsIDwgMCkgfHwgKG1heGluZyAmJiB0aW1lU2luY2VMYXN0SW52b2tlID49IG1heFdhaXQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyRXhwaXJlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgIGlmIChzaG91bGRJbnZva2UodGltZSkpIHtcbiAgICAgIHJldHVybiB0cmFpbGluZ0VkZ2UodGltZSk7XG4gICAgfVxuICAgIC8vIFJlc3RhcnQgdGhlIHRpbWVyLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgcmVtYWluaW5nV2FpdCh0aW1lKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFpbGluZ0VkZ2UodGltZSkge1xuICAgIHRpbWVySWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBPbmx5IGludm9rZSBpZiB3ZSBoYXZlIGBsYXN0QXJnc2Agd2hpY2ggbWVhbnMgYGZ1bmNgIGhhcyBiZWVuXG4gICAgLy8gZGVib3VuY2VkIGF0IGxlYXN0IG9uY2UuXG4gICAgaWYgKHRyYWlsaW5nICYmIGxhc3RBcmdzKSB7XG4gICAgICByZXR1cm4gaW52b2tlRnVuYyh0aW1lKTtcbiAgICB9XG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIGlmICh0aW1lcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB9XG4gICAgbGFzdEludm9rZVRpbWUgPSAwO1xuICAgIGxhc3RBcmdzID0gbGFzdENhbGxUaW1lID0gbGFzdFRoaXMgPSB0aW1lcklkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgcmV0dXJuIHRpbWVySWQgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IHRyYWlsaW5nRWRnZShub3coKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJvdW5jZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKSxcbiAgICAgICAgaXNJbnZva2luZyA9IHNob3VsZEludm9rZSh0aW1lKTtcblxuICAgIGxhc3RBcmdzID0gYXJndW1lbnRzO1xuICAgIGxhc3RUaGlzID0gdGhpcztcbiAgICBsYXN0Q2FsbFRpbWUgPSB0aW1lO1xuXG4gICAgaWYgKGlzSW52b2tpbmcpIHtcbiAgICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmdFZGdlKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgICBpZiAobWF4aW5nKSB7XG4gICAgICAgIC8vIEhhbmRsZSBpbnZvY2F0aW9ucyBpbiBhIHRpZ2h0IGxvb3AuXG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgICAgIHJldHVybiBpbnZva2VGdW5jKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZGVib3VuY2VkLmNhbmNlbCA9IGNhbmNlbDtcbiAgZGVib3VuY2VkLmZsdXNoID0gZmx1c2g7XG4gIHJldHVybiBkZWJvdW5jZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRocm90dGxlZCBmdW5jdGlvbiB0aGF0IG9ubHkgaW52b2tlcyBgZnVuY2AgYXQgbW9zdCBvbmNlIHBlclxuICogZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gVGhlIHRocm90dGxlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGBcbiAqIG1ldGhvZCB0byBjYW5jZWwgZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG9cbiAqIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYFxuICogc2hvdWxkIGJlIGludm9rZWQgb24gdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YFxuICogdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZVxuICogdGhyb3R0bGVkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gcmV0dXJuIHRoZVxuICogcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLnRocm90dGxlYCBhbmQgYF8uZGVib3VuY2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gdGhyb3R0bGUuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhyb3R0bGUgaW52b2NhdGlvbnMgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgdGhyb3R0bGVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBleGNlc3NpdmVseSB1cGRhdGluZyB0aGUgcG9zaXRpb24gd2hpbGUgc2Nyb2xsaW5nLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Njcm9sbCcsIF8udGhyb3R0bGUodXBkYXRlUG9zaXRpb24sIDEwMCkpO1xuICpcbiAqIC8vIEludm9rZSBgcmVuZXdUb2tlbmAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGJ1dCBub3QgbW9yZSB0aGFuIG9uY2UgZXZlcnkgNSBtaW51dGVzLlxuICogdmFyIHRocm90dGxlZCA9IF8udGhyb3R0bGUocmVuZXdUb2tlbiwgMzAwMDAwLCB7ICd0cmFpbGluZyc6IGZhbHNlIH0pO1xuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIHRocm90dGxlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyB0aHJvdHRsZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRocm90dGxlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsZWFkaW5nID0gdHJ1ZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gJ2xlYWRpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMubGVhZGluZyA6IGxlYWRpbmc7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuICByZXR1cm4gZGVib3VuY2UoZnVuYywgd2FpdCwge1xuICAgICdsZWFkaW5nJzogbGVhZGluZyxcbiAgICAnbWF4V2FpdCc6IHdhaXQsXG4gICAgJ3RyYWlsaW5nJzogdHJhaWxpbmdcbiAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgbnVtYmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgbnVtYmVyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvTnVtYmVyKDMuMik7XG4gKiAvLyA9PiAzLjJcbiAqXG4gKiBfLnRvTnVtYmVyKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gNWUtMzI0XG4gKlxuICogXy50b051bWJlcihJbmZpbml0eSk7XG4gKiAvLyA9PiBJbmZpbml0eVxuICpcbiAqIF8udG9OdW1iZXIoJzMuMicpO1xuICogLy8gPT4gMy4yXG4gKi9cbmZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBOQU47XG4gIH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHZhciBvdGhlciA9IHR5cGVvZiB2YWx1ZS52YWx1ZU9mID09ICdmdW5jdGlvbicgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbiAgICB2YWx1ZSA9IGlzT2JqZWN0KG90aGVyKSA/IChvdGhlciArICcnKSA6IG90aGVyO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IDAgPyB2YWx1ZSA6ICt2YWx1ZTtcbiAgfVxuICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmVUcmltLCAnJyk7XG4gIHZhciBpc0JpbmFyeSA9IHJlSXNCaW5hcnkudGVzdCh2YWx1ZSk7XG4gIHJldHVybiAoaXNCaW5hcnkgfHwgcmVJc09jdGFsLnRlc3QodmFsdWUpKVxuICAgID8gZnJlZVBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCBpc0JpbmFyeSA/IDIgOiA4KVxuICAgIDogKHJlSXNCYWRIZXgudGVzdCh2YWx1ZSkgPyBOQU4gOiArdmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlO1xuIl19
