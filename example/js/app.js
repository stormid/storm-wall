(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _stormWall = require('./libs/storm-wall');

var _stormWall2 = _interopRequireDefault(_stormWall);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onLoadTasks = [function () {
	var wall = _stormWall2.default.init('.js-wall');
	console.log(wall);
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

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

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

		this.throttledResize = (0, _throttle2.default)(function () {
			_this.equalHeight(_this.setPanelTop.bind(_this));
		}, 60);

		this.throttledChange = (0, _throttle2.default)(this.change, 100);
		this.throttledPrevious = (0, _throttle2.default)(this.previous, 100);
		this.throttledNext = (0, _throttle2.default)(this.next, 100);
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
				_this7.panelSourceContainer.appendChild(_this7.panelContent);
				_this7.node.classList.remove('js-is-animating');
				_this7.node.classList.remove('js-wall--on');
				_this7.openIndex = false;
				typeof cb === 'function' && cb();
			}
		};

		this.panel.setAttribute('aria-hidden', true);
		this.items[this.openIndex].trigger.setAttribute('aria-hidden', false);

		this.node.classList.add('js-is-animating');

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

},{"./libs/easeInOutQuad":2,"./libs/inView":3,"./libs/scrollTo":4,"lodash/throttle":17}],6:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":11}],7:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":6,"./_getRawTag":9,"./_objectToString":10}],8:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":6}],10:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],11:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":8}],12:[function(require,module,exports){
var isObject = require('./isObject'),
    now = require('./now'),
    toNumber = require('./toNumber');

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

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

module.exports = debounce;

},{"./isObject":13,"./now":16,"./toNumber":18}],13:[function(require,module,exports){
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
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],14:[function(require,module,exports){
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
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],15:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

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
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;

},{"./_baseGetTag":7,"./isObjectLike":14}],16:[function(require,module,exports){
var root = require('./_root');

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

module.exports = now;

},{"./_root":11}],17:[function(require,module,exports){
var debounce = require('./debounce'),
    isObject = require('./isObject');

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

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

module.exports = throttle;

},{"./debounce":12,"./isObject":13}],18:[function(require,module,exports){
var isObject = require('./isObject'),
    isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

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

module.exports = toNumber;

},{"./isObject":13,"./isSymbol":15}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvZWFzZUluT3V0UXVhZC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvbGlicy9pblZpZXcuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvc2Nyb2xsVG8uanMiLCJleGFtcGxlL3NyYy9saWJzL3N0b3JtLXdhbGwuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19TeW1ib2wuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlR2V0VGFnLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX29iamVjdFRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvZGVib3VuY2UuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdExpa2UuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzU3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9ub3cuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL3Rocm90dGxlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC90b051bWJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQUVBLElBQU0sY0FBYyxDQUFDLFlBQU07QUFDMUIsS0FBSSxPQUFPLG9CQUFLLElBQUwsQ0FBVSxVQUFWLENBQVg7QUFDQSxTQUFRLEdBQVIsQ0FBWSxJQUFaO0FBQ0EsQ0FIbUIsQ0FBcEI7O0FBS0EsSUFBRyxzQkFBc0IsTUFBekIsRUFBaUMsT0FBTyxnQkFBUCxDQUF3QixNQUF4QixFQUFnQyxZQUFNO0FBQUUs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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFdhbGwgZnJvbSAnLi9saWJzL3N0b3JtLXdhbGwnO1xuXG5jb25zdCBvbkxvYWRUYXNrcyA9IFsoKSA9PiB7XG5cdGxldCB3YWxsID0gV2FsbC5pbml0KCcuanMtd2FsbCcpO1xuXHRjb25zb2xlLmxvZyh3YWxsKTtcbn1dO1xuICAgIFxuaWYoJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdykgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7IG9uTG9hZFRhc2tzLmZvckVhY2goKGZuKSA9PiBmbigpKTsgfSk7IiwiLy9odHRwOi8vZ29vLmdsLzVITGw4XG5leHBvcnQgZGVmYXVsdCAodCwgYiwgYywgZCkgPT4ge1xuXHR0IC89IGQgLyAyO1xuXHRpZiAodCA8IDEpIHtcblx0XHRyZXR1cm4gYyAvIDIgKiB0ICogdCArIGI7XG5cdH1cblx0dC0tO1xuXHRyZXR1cm4gLWMgLyAyICogKHQgKiAodCAtIDIpIC0gMSkgKyBiO1xufTsiLCJleHBvcnQgZGVmYXVsdCAoZWxlbWVudCwgdmlldykgPT4ge1xuXHRsZXQgYm94ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0cmV0dXJuIChib3gucmlnaHQgPj0gdmlldy5sICYmIGJveC5ib3R0b20gPj0gdmlldy50ICYmIGJveC5sZWZ0IDw9IHZpZXcuciAmJiBib3gudG9wIDw9IHZpZXcuYik7XG59OyIsImltcG9ydCBlYXNlSW5PdXRRdWFkIGZyb20gJy4vZWFzZUluT3V0UXVhZCc7XG5cbmNvbnN0IG1vdmUgPSBhbW91bnQgPT4ge1xuXHRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wID0gYW1vdW50O1xuXHRkb2N1bWVudC5ib2R5LnBhcmVudE5vZGUuc2Nyb2xsVG9wID0gYW1vdW50O1xuXHRkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA9IGFtb3VudDtcbn07XG5cbmNvbnN0IHBvc2l0aW9uID0gKCkgPT4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnBhcmVudE5vZGUuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuXG5leHBvcnQgZGVmYXVsdCAodG8sIGR1cmF0aW9uID0gNTAwLCBjYWxsYmFjaykgPT4ge1xuXHRsZXQgc3RhcnQgPSBwb3NpdGlvbigpLFxuXHRcdGNoYW5nZSA9IHRvIC0gc3RhcnQsXG5cdFx0Y3VycmVudFRpbWUgPSAwLFxuXHRcdGluY3JlbWVudCA9IDIwLFxuXHRcdGFuaW1hdGVTY3JvbGwgPSAoKSA9PiB7XG5cdFx0XHRjdXJyZW50VGltZSArPSBpbmNyZW1lbnQ7XG5cdFx0XHRsZXQgdmFsID0gZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgc3RhcnQsIGNoYW5nZSwgZHVyYXRpb24pO1xuXHRcdFx0bW92ZSh2YWwpO1xuXHRcdFx0XG5cdFx0XHRpZiAoY3VycmVudFRpbWUgPCBkdXJhdGlvbikgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVNjcm9sbCk7XG5cdFx0XHRlbHNlIChjYWxsYmFjayAmJiB0eXBlb2YgKGNhbGxiYWNrKSA9PT0gJ2Z1bmN0aW9uJykgJiYgY2FsbGJhY2soKTtcblx0XHR9O1xuXHRhbmltYXRlU2Nyb2xsKCk7XG59OyIsImltcG9ydCB0aHJvdHRsZSBmcm9tICdsb2Rhc2gvdGhyb3R0bGUnO1xuXG5pbXBvcnQgc2Nyb2xsVG8gZnJvbSAnLi9saWJzL3Njcm9sbFRvJztcbmltcG9ydCBpblZpZXcgZnJvbSAnLi9saWJzL2luVmlldyc7XG5pbXBvcnQgZWFzZUluT3V0UXVhZCBmcm9tICcuL2xpYnMvZWFzZUluT3V0UXVhZCc7XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuXHRjbGFzc05hbWVzOiB7XG5cdFx0cmVhZHk6ICcuanMtd2FsbC0taXMtcmVhZHknLFxuXHRcdHRyaWdnZXI6ICcuanMtd2FsbC10cmlnZ2VyJyxcblx0XHRpdGVtOiAnLmpzLXdhbGwtaXRlbScsXG5cdFx0Y29udGVudDogJy5qcy13YWxsLWNoaWxkJyxcblx0XHRwYW5lbDogJy5qcy13YWxsLXBhbmVsJyxcblx0XHRwYW5lbElubmVyOiAnLmpzLXdhbGwtcGFuZWwtaW5uZXInLFxuXHRcdG9wZW46ICcuanMtd2FsbC0taXMtb3BlbicsXG5cdFx0Y2xvc2VCdXR0b246ICcuanMtd2FsbC1jbG9zZScsXG5cdFx0bmV4dEJ1dHRvbjogJy5qcy13YWxsLW5leHQnLFxuXHRcdHByZXZpb3VzQnV0dG9uOiAnLmpzLXdhbGwtcHJldmlvdXMnXG5cdH1cbn07XG5cbmNvbnN0IENPTlNUQU5UUyA9IHtcblx0RVJST1JTOiB7XG5cdFx0Uk9PVDogJ1dhbGwgY2Fubm90IGJlIGluaXRpYWxpc2VkLCBubyB0cmlnZ2VyIGVsZW1lbnRzIGZvdW5kJyxcblx0XHRJVEVNOiAnV2FsbCBpdGVtIGNhbm5vdCBiZSBmb3VuZCcsXG5cdFx0VFJJR0dFUjogJ1dhbGwgdHJpZ2dlciBjYW5ub3QgYmUgZm91bmQnXG5cdH0sXG5cdEtFWUNPREVTOiBbMTMsIDMyXSxcblx0RVZFTlRTOiBbJ2NsaWNrJywgJ2tleWRvd24nXVxufTtcblxuY29uc3QgU3Rvcm1XYWxsID0ge1xuXHRpbml0KCl7XG5cdFx0dGhpcy5vcGVuSW5kZXggPSBmYWxzZTtcblxuXHRcdHRoaXMuaW5pdFRocm90dGxlZCgpO1xuXHRcdHRoaXMuaW5pdEl0ZW1zKCk7XG5cdFx0dGhpcy5pbml0VHJpZ2dlcnMoKTtcblx0XHR0aGlzLmluaXRQYW5lbCgpO1xuXHRcdHRoaXMuaW5pdEJ1dHRvbnMoKTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnRocm90dGxlZFJlc2l6ZS5iaW5kKHRoaXMpKTtcblx0XHRzZXRUaW1lb3V0KHRoaXMuZXF1YWxIZWlnaHQuYmluZCh0aGlzKSwgMTAwKTtcblx0XHRcblx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMucmVhZHkuc3Vic3RyKDEpKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0aW5pdFRocm90dGxlZCgpe1xuXHRcdHRoaXMudGhyb3R0bGVkUmVzaXplID0gdGhyb3R0bGUoKCkgPT4ge1xuXHRcdFx0dGhpcy5lcXVhbEhlaWdodCh0aGlzLnNldFBhbmVsVG9wLmJpbmQodGhpcykpO1xuXHRcdH0sIDYwKTtcblxuXHRcdHRoaXMudGhyb3R0bGVkQ2hhbmdlID0gdGhyb3R0bGUodGhpcy5jaGFuZ2UsIDEwMCk7XG5cdFx0dGhpcy50aHJvdHRsZWRQcmV2aW91cyA9IHRocm90dGxlKHRoaXMucHJldmlvdXMsIDEwMCk7XG5cdFx0dGhpcy50aHJvdHRsZWROZXh0ID0gdGhyb3R0bGUodGhpcy5uZXh0LCAxMDApO1xuXHR9LFxuXHRpbml0VHJpZ2dlcnMoKXtcblx0XHR0aGlzLml0ZW1zLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcblx0XHRcdGxldCB0cmlnZ2VyID0gaXRlbS5ub2RlLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnRyaWdnZXIpO1xuXHRcdFx0aWYoIXRyaWdnZXIpIHRocm93IG5ldyBFcnJvcihDT05TVEFOVFMuRVJST1JTLlRSSUdHRVIpO1xuXG5cdFx0XHRDT05TVEFOVFMuRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0XHR0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0XHR0aGlzLnRocm90dGxlZENoYW5nZShpKTtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cdGluaXRQYW5lbCgpe1xuXHRcdGxldCBlbGVtZW50RmFjdG9yeSA9IChlbGVtZW50LCBjbGFzc05hbWUsIGF0dHJpYnV0ZXMpID0+IHtcblx0XHRcdFx0bGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50KTtcblx0XHRcdFx0ZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuXHRcdFx0XHRmb3IgKHZhciBrIGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0XHRpZiAoYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuXHRcdFx0XHRcdFx0ZWwuc2V0QXR0cmlidXRlKGssIGF0dHJpYnV0ZXNba10pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZWw7XG5cdFx0XHR9LFxuXHRcdFx0cGFuZWxFbGVtZW50ID0gZWxlbWVudEZhY3RvcnkodGhpcy5pdGVtc1swXS5ub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSwgdGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnBhbmVsLnN1YnN0cigxKSwgeyAnYXJpYS1oaWRkZW4nOiB0cnVlIH0pO1xuXHRcdFxuXHRcdHRoaXMucGFuZWxJbm5lciA9IGVsZW1lbnRGYWN0b3J5KCdkaXYnLCB0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMucGFuZWxJbm5lci5zdWJzdHIoMSkpO1xuXHRcdHRoaXMucGFuZWwgPSB0aGlzLm5vZGUuYXBwZW5kQ2hpbGQocGFuZWxFbGVtZW50KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cdGluaXRCdXR0b25zKCl7XG5cdFx0bGV0IGJ1dHRvbnNUZW1wbGF0ZSA9IGA8YnV0dG9uIGNsYXNzPVwiJHt0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuY2xvc2VCdXR0b24uc3Vic3RyKDEpfVwiIGFyaWEtbGFiZWw9XCJjbG9zZVwiPlxuXHRcdFx0XHRcdFx0XHRcdDxzdmcgZmlsbD1cIiMwMDAwMDBcIiBoZWlnaHQ9XCIzMFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuXHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0xOSA2LjQxTDE3LjU5IDUgMTIgMTAuNTkgNi40MSA1IDUgNi40MSAxMC41OSAxMiA1IDE3LjU5IDYuNDEgMTkgMTIgMTMuNDEgMTcuNTkgMTkgMTkgMTcuNTkgMTMuNDEgMTJ6XCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0wIDBoMjR2MjRIMHpcIiBmaWxsPVwibm9uZVwiLz5cblx0XHRcdFx0XHRcdFx0XHQ8L3N2Zz5cblx0XHRcdFx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdFx0XHQgXHRcdDxidXR0b24gY2xhc3M9XCIke3RoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5wcmV2aW91c0J1dHRvbi5zdWJzdHIoMSl9XCIgYXJpYS1sYWJlbD1cInByZXZpb3VzXCI+XG5cdFx0XHRcdFx0XHRcdFx0IDxzdmcgZmlsbD1cIiMwMDAwMDBcIiBoZWlnaHQ9XCIzNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjM2XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTE1LjQxIDcuNDFMMTQgNmwtNiA2IDYgNiAxLjQxLTEuNDFMMTAuODMgMTJ6XCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTAgMGgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9zdmc+XG5cdFx0XHRcdFx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdFx0XHQgXHRcdDxidXR0b24gY2xhc3M9XCIke3RoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5uZXh0QnV0dG9uLnN1YnN0cigxKX1cIiBhcmlhLWxhYmVsPVwibmV4dFwiPlxuXHRcdFx0XHRcdFx0XHRcdFx0PHN2ZyBmaWxsPVwiIzAwMDAwMFwiIGhlaWdodD1cIjM2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMzZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMTAgNkw4LjU5IDcuNDEgMTMuMTcgMTJsLTQuNTggNC41OUwxMCAxOGw2LTZ6XCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTAgMGgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9zdmc+XG5cdFx0XHRcdFx0XHRcdFx0IDwvYnV0dG9uPmA7XG5cblx0XHR0aGlzLnBhbmVsLmlubmVySFRNTCA9IGAke3RoaXMucGFuZWwuaW5uZXJIVE1MfSR7YnV0dG9uc1RlbXBsYXRlfWA7XG5cdFx0XHRcblx0XHRDT05TVEFOVFMuRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0dGhpcy5wYW5lbC5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5jbG9zZUJ1dHRvbikuYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0dGhpcy5jbG9zZS5jYWxsKHRoaXMpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnBhbmVsLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnByZXZpb3VzQnV0dG9uKS5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlICYmICF+Q09OU1RBTlRTLktFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLnRocm90dGxlZFByZXZpb3VzLmNhbGwodGhpcyk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucGFuZWwucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMubmV4dEJ1dHRvbikuYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0dGhpcy50aHJvdHRsZWROZXh0LmNhbGwodGhpcyk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSxcblx0aW5pdEl0ZW1zKCl7XG5cdFx0bGV0IGl0ZW1zID0gW10uc2xpY2UuY2FsbCh0aGlzLm5vZGUucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuaXRlbSkpO1xuXG5cdFx0aWYoaXRlbXMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoQ09OU1RBTlRTLkVSUk9SUy5JVEVNKTtcblxuXHRcdHRoaXMuaXRlbXMgPSBpdGVtcy5tYXAoaXRlbSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRub2RlOiBpdGVtLFxuXHRcdFx0XHRjb250ZW50OiBpdGVtLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLmNvbnRlbnQpLFxuXHRcdFx0XHR0cmlnZ2VyOiBpdGVtLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnRyaWdnZXIpXG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdH0sXG5cdGNoYW5nZShpKXtcblx0XHRpZih0aGlzLm9wZW5JbmRleCA9PT0gZmFsc2UpIHJldHVybiB0aGlzLm9wZW4oaSk7XG5cdFx0aWYodGhpcy5vcGVuSW5kZXggPT09IGkpIHJldHVybiB0aGlzLmNsb3NlKCk7XG5cdFx0aWYgKHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUub2Zmc2V0VG9wID09PSB0aGlzLml0ZW1zW2ldLm5vZGUub2Zmc2V0VG9wKSB0aGlzLmNsb3NlKCgpID0+IHRoaXMub3BlbihpLCB0aGlzLnBhbmVsLm9mZnNldEhlaWdodCksIHRoaXMucGFuZWwub2Zmc2V0SGVpZ2h0KTtcblx0XHRlbHNlIHRoaXMuY2xvc2UoKCkgPT4gdGhpcy5vcGVuKGkpKTtcblx0fSxcblx0b3BlbihpLCBzdGFydCwgc3BlZWQpe1xuXHRcdHRoaXMucGFuZWxTb3VyY2VDb250YWluZXIgPSB0aGlzLml0ZW1zW2ldLmNvbnRlbnQ7XG5cdFx0dGhpcy5vcGVuSW5kZXggPSBpO1xuXHRcdHRoaXMuc2V0UGFuZWxUb3AoKTtcblx0XHR0aGlzLnBhbmVsQ29udGVudCA9IHRoaXMucGFuZWxTb3VyY2VDb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQuY2xvbmVOb2RlKHRydWUpO1xuXHRcdHRoaXMucGFuZWxJbm5lci5hcHBlbmRDaGlsZCh0aGlzLnBhbmVsQ29udGVudCk7XG5cdFx0dGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLnBhbmVsU291cmNlQ29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkKTtcblx0XHR0aGlzLnBhbmVsLmluc2VydEJlZm9yZSh0aGlzLnBhbmVsSW5uZXIsIHRoaXMucGFuZWwuZmlyc3RFbGVtZW50Q2hpbGQpO1xuXG5cdFx0bGV0IGN1cnJlbnRUaW1lID0gMCxcblx0XHRcdHBhbmVsU3RhcnQgPSBzdGFydCB8fCAwLFxuXHRcdFx0dG90YWxQYW5lbENoYW5nZSA9IHRoaXMucGFuZWxJbm5lci5vZmZzZXRIZWlnaHQgLSBwYW5lbFN0YXJ0LFxuXHRcdFx0cm93U3RhcnQgPSB0aGlzLmNsb3NlZEhlaWdodCArIHBhbmVsU3RhcnQsXG5cdFx0XHR0b3RhbFJvd0NoYW5nZSA9IHRvdGFsUGFuZWxDaGFuZ2UsXG5cdFx0XHRkdXJhdGlvbiA9IHNwZWVkIHx8IDE2LFxuXHRcdFx0YW5pbWF0ZU9wZW4gPSAoKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRUaW1lKys7XG5cdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcGFuZWxTdGFydCwgdG90YWxQYW5lbENoYW5nZSwgZHVyYXRpb24pICsgJ3B4Jztcblx0XHRcdFx0dGhpcy5yZXNpemVSb3codGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZSwgZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcm93U3RhcnQsIHRvdGFsUm93Q2hhbmdlLCBkdXJhdGlvbikgKyAncHgnKTtcblx0XHRcdFx0aWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZU9wZW4uYmluZCh0aGlzKSk7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMuaXRlbXNbaV0ubm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLnBhbmVsLCB0aGlzLml0ZW1zW2ldLm5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKTtcblx0XHRcdFx0XHRpZiAoIWluVmlldyh0aGlzLnBhbmVsLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRsOiAwLFxuXHRcdFx0XHRcdFx0XHR0OiAwLFxuXHRcdFx0XHRcdFx0XHRiOiAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpIC0gdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQsXG5cdFx0XHRcdFx0XHRcdHI6ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH0pKSBzY3JvbGxUbyh0aGlzLnBhbmVsLm9mZnNldFRvcCAtIDEyMCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMub3Blbi5zdWJzdHIoMSkpO1xuXG5cdFx0dGhpcy5wYW5lbC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG5cdFx0dGhpcy5pdGVtc1tpXS50cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIHRydWUpO1xuXG5cdFx0YW5pbWF0ZU9wZW4uY2FsbCh0aGlzKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRjbG9zZShjYiwgZW5kLCBzcGVlZCl7XG5cdFx0bGV0IGVuZFBvaW50ID0gZW5kIHx8IDAsXG5cdFx0XHRjdXJyZW50VGltZSA9IDAsXG5cdFx0XHRwYW5lbFN0YXJ0ID0gdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQsXG5cdFx0XHR0b3RhbFBhbmVsQ2hhbmdlID0gZW5kUG9pbnQgLSBwYW5lbFN0YXJ0LFxuXHRcdFx0cm93U3RhcnQgPSB0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLm9mZnNldEhlaWdodCxcblx0XHRcdHRvdGFsUm93Q2hhbmdlID0gdG90YWxQYW5lbENoYW5nZSxcblx0XHRcdGR1cmF0aW9uID0gc3BlZWQgfHwgMTYsXG5cdFx0XHRhbmltYXRlQ2xvc2VkID0gKCkgPT4ge1xuXHRcdFx0XHRjdXJyZW50VGltZSsrO1xuXHRcdFx0XHR0aGlzLnBhbmVsLnN0eWxlLmhlaWdodCA9IGVhc2VJbk91dFF1YWQoY3VycmVudFRpbWUsIHBhbmVsU3RhcnQsIHRvdGFsUGFuZWxDaGFuZ2UsIGR1cmF0aW9uKSArICdweCc7XG5cdFx0XHRcdHRoaXMucmVzaXplUm93KHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUsIGVhc2VJbk91dFF1YWQoY3VycmVudFRpbWUsIHJvd1N0YXJ0LCB0b3RhbFJvd0NoYW5nZSwgZHVyYXRpb24pICsgJ3B4Jyk7XG5cdFx0XHRcdGlmIChjdXJyZW50VGltZSA8IGR1cmF0aW9uKSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVDbG9zZWQuYmluZCh0aGlzKSk7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGlmICghZW5kUG9pbnQpIHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMucGFuZWxJbm5lci5yZW1vdmVDaGlsZCh0aGlzLnBhbmVsQ29udGVudCk7XG5cdFx0XHRcdFx0dGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnBhbmVsQ29udGVudCk7XG5cdFx0XHRcdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5yZW1vdmUoJ2pzLWlzLWFuaW1hdGluZycpO1xuXHRcdFx0XHRcdHRoaXMubm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdqcy13YWxsLS1vbicpO1xuXHRcdFx0XHRcdHRoaXMub3BlbkluZGV4ID0gZmFsc2U7XG5cdFx0XHRcdFx0dHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICYmIGNiKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XG5cdFx0dGhpcy5wYW5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG5cdFx0dGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0udHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgZmFsc2UpO1xuXG5cdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5hZGQoJ2pzLWlzLWFuaW1hdGluZycpO1xuXG5cdFx0YW5pbWF0ZUNsb3NlZC5jYWxsKHRoaXMpO1xuXHR9LFxuXHRwcmV2aW91cygpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGFuZ2UoKHRoaXMub3BlbkluZGV4IC0gMSA8IDAgPyB0aGlzLml0ZW1zLmxlbmd0aCAtIDEgOiB0aGlzLm9wZW5JbmRleCAtIDEpKTtcblx0fSxcblx0bmV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy5jaGFuZ2UoKHRoaXMub3BlbkluZGV4ICsgMSA9PT0gdGhpcy5pdGVtcy5sZW5ndGggPyAwIDogdGhpcy5vcGVuSW5kZXggKyAxKSk7XG5cdH0sXG5cdGVxdWFsSGVpZ2h0KGNiKSB7XG5cdFx0bGV0IG9wZW5IZWlnaHQgPSAwLFxuXHRcdFx0Y2xvc2VkSGVpZ2h0ID0gMDtcblxuXHRcdHRoaXMuaXRlbXMubWFwKChpdGVtLCBpKSA9PiB7XG5cdFx0XHRpdGVtLm5vZGUuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0aWYgKHRoaXMub3BlbkluZGV4ICE9PSBmYWxzZSAmJiBpdGVtLm5vZGUub2Zmc2V0VG9wID09PSB0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLm9mZnNldFRvcCkge1xuXHRcdFx0XHRpZiAodGhpcy5vcGVuSW5kZXggPT09IGkpIG9wZW5IZWlnaHQgPSBpdGVtLm5vZGUub2Zmc2V0SGVpZ2h0ICsgdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoaXRlbS5ub2RlLm9mZnNldEhlaWdodCA+IGNsb3NlZEhlaWdodCkgY2xvc2VkSGVpZ2h0ID0gaXRlbS5ub2RlLm9mZnNldEhlaWdodDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBpdGVtO1xuXHRcdH0pLm1hcCgoaXRlbSwgaSkgPT4ge1xuXHRcdFx0aWYgKHRoaXMub3BlbkluZGV4ICE9PSBpKSBpdGVtLm5vZGUuc3R5bGUuaGVpZ2h0ID0gY2xvc2VkSGVpZ2h0ICsgJ3B4Jztcblx0XHR9KTtcblxuXHRcdHRoaXMub3BlbkhlaWdodCA9IG9wZW5IZWlnaHQ7XG5cdFx0dGhpcy5jbG9zZWRIZWlnaHQgPSBjbG9zZWRIZWlnaHQgPT09IDAgPyB0aGlzLmNsb3NlZEhlaWdodCA6IGNsb3NlZEhlaWdodDtcblxuXHRcdGlmICh0aGlzLm9wZW5IZWlnaHQgPiAwKSB7XG5cdFx0XHR0aGlzLnJlc2l6ZVJvdyh0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLCB0aGlzLm9wZW5IZWlnaHQgKyAncHgnKTtcblx0XHRcdHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJyAmJiBjYigpO1xuXHRcdH1cblx0fSxcblx0cmVzaXplUm93KGVsLCBoZWlnaHQpe1xuXHRcdHRoaXMuaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdGlmIChpdGVtLm5vZGUub2Zmc2V0VG9wID09PSBlbC5vZmZzZXRUb3ApIGl0ZW0ubm9kZS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQ7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHNldFBhbmVsVG9wKCkge1xuXHRcdHRoaXMucGFuZWwuc3R5bGUudG9wID0gYCR7dGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZS5vZmZzZXRUb3AgKyB0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS50cmlnZ2VyLm9mZnNldEhlaWdodH1weGA7XG5cdH1cbn07XG5cbmNvbnN0IGluaXQgPSAoc2VsLCBvcHRzKSA9PiB7XG5cdGxldCBlbHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKSk7XG5cdFxuXHRpZihlbHMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoQ09OU1RBTlRTLkVSUk9SUy5ST09UKTtcblx0XG5cdHJldHVybiBlbHMubWFwKGVsID0+IHtcblx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKFN0b3JtV2FsbCksIHtcblx0XHRcdG5vZGU6IGVsLFxuXHRcdFx0c2V0dGluZ3M6IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBvcHRzKVxuXHRcdH0pLmluaXQoKTtcblx0fSk7XG59O1xuXHRcbmV4cG9ydCBkZWZhdWx0IHsgaW5pdCB9OyIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgZ2V0UmF3VGFnID0gcmVxdWlyZSgnLi9fZ2V0UmF3VGFnJyksXG4gICAgb2JqZWN0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19vYmplY3RUb1N0cmluZycpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0VGFnO1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VG9TdHJpbmc7XG4iLCJ2YXIgZnJlZUdsb2JhbCA9IHJlcXVpcmUoJy4vX2ZyZWVHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvb3Q7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgbm93ID0gcmVxdWlyZSgnLi9ub3cnKSxcbiAgICB0b051bWJlciA9IHJlcXVpcmUoJy4vdG9OdW1iZXInKTtcblxuLyoqIEVycm9yIG1lc3NhZ2UgY29uc3RhbnRzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCBkZWxheXMgaW52b2tpbmcgYGZ1bmNgIHVudGlsIGFmdGVyIGB3YWl0YFxuICogbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2FzXG4gKiBpbnZva2VkLiBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYCBtZXRob2QgdG8gY2FuY2VsXG4gKiBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0byBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS5cbiAqIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZVxuICogbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZFxuICogd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbi4gU3Vic2VxdWVudFxuICogY2FsbHMgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2BcbiAqIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8uZGVib3VuY2VgIGFuZCBgXy50aHJvdHRsZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPWZhbHNlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXYWl0XVxuICogIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBpbnZva2VkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXguXG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCkpO1xuICpcbiAqIC8vIEludm9rZSBgc2VuZE1haWxgIHdoZW4gY2xpY2tlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzLlxuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKlxuICogLy8gRW5zdXJlIGBiYXRjaExvZ2AgaXMgaW52b2tlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxscy5cbiAqIHZhciBkZWJvdW5jZWQgPSBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHsgJ21heFdhaXQnOiAxMDAwIH0pO1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogalF1ZXJ5KHNvdXJjZSkub24oJ21lc3NhZ2UnLCBkZWJvdW5jZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgZGVib3VuY2VkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCBkZWJvdW5jZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGFzdEFyZ3MsXG4gICAgICBsYXN0VGhpcyxcbiAgICAgIG1heFdhaXQsXG4gICAgICByZXN1bHQsXG4gICAgICB0aW1lcklkLFxuICAgICAgbGFzdENhbGxUaW1lLFxuICAgICAgbGFzdEludm9rZVRpbWUgPSAwLFxuICAgICAgbGVhZGluZyA9IGZhbHNlLFxuICAgICAgbWF4aW5nID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgd2FpdCA9IHRvTnVtYmVyKHdhaXQpIHx8IDA7XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAhIW9wdGlvbnMubGVhZGluZztcbiAgICBtYXhpbmcgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucztcbiAgICBtYXhXYWl0ID0gbWF4aW5nID8gbmF0aXZlTWF4KHRvTnVtYmVyKG9wdGlvbnMubWF4V2FpdCkgfHwgMCwgd2FpdCkgOiBtYXhXYWl0O1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VGdW5jKHRpbWUpIHtcbiAgICB2YXIgYXJncyA9IGxhc3RBcmdzLFxuICAgICAgICB0aGlzQXJnID0gbGFzdFRoaXM7XG5cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsZWFkaW5nRWRnZSh0aW1lKSB7XG4gICAgLy8gUmVzZXQgYW55IGBtYXhXYWl0YCB0aW1lci5cbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgLy8gU3RhcnQgdGhlIHRpbWVyIGZvciB0aGUgdHJhaWxpbmcgZWRnZS5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIC8vIEludm9rZSB0aGUgbGVhZGluZyBlZGdlLlxuICAgIHJldHVybiBsZWFkaW5nID8gaW52b2tlRnVuYyh0aW1lKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbWFpbmluZ1dhaXQodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUsXG4gICAgICAgIHJlc3VsdCA9IHdhaXQgLSB0aW1lU2luY2VMYXN0Q2FsbDtcblxuICAgIHJldHVybiBtYXhpbmcgPyBuYXRpdmVNaW4ocmVzdWx0LCBtYXhXYWl0IC0gdGltZVNpbmNlTGFzdEludm9rZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRJbnZva2UodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWU7XG5cbiAgICAvLyBFaXRoZXIgdGhpcyBpcyB0aGUgZmlyc3QgY2FsbCwgYWN0aXZpdHkgaGFzIHN0b3BwZWQgYW5kIHdlJ3JlIGF0IHRoZVxuICAgIC8vIHRyYWlsaW5nIGVkZ2UsIHRoZSBzeXN0ZW0gdGltZSBoYXMgZ29uZSBiYWNrd2FyZHMgYW5kIHdlJ3JlIHRyZWF0aW5nXG4gICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgIHJldHVybiAobGFzdENhbGxUaW1lID09PSB1bmRlZmluZWQgfHwgKHRpbWVTaW5jZUxhc3RDYWxsID49IHdhaXQpIHx8XG4gICAgICAodGltZVNpbmNlTGFzdENhbGwgPCAwKSB8fCAobWF4aW5nICYmIHRpbWVTaW5jZUxhc3RJbnZva2UgPj0gbWF4V2FpdCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGltZXJFeHBpcmVkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgaWYgKHNob3VsZEludm9rZSh0aW1lKSkge1xuICAgICAgcmV0dXJuIHRyYWlsaW5nRWRnZSh0aW1lKTtcbiAgICB9XG4gICAgLy8gUmVzdGFydCB0aGUgdGltZXIuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCByZW1haW5pbmdXYWl0KHRpbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYWlsaW5nRWRnZSh0aW1lKSB7XG4gICAgdGltZXJJZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAvLyBkZWJvdW5jZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBpZiAodHJhaWxpbmcgJiYgbGFzdEFyZ3MpIHtcbiAgICAgIHJldHVybiBpbnZva2VGdW5jKHRpbWUpO1xuICAgIH1cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIH1cbiAgICBsYXN0SW52b2tlVGltZSA9IDA7XG4gICAgbGFzdEFyZ3MgPSBsYXN0Q2FsbFRpbWUgPSBsYXN0VGhpcyA9IHRpbWVySWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICByZXR1cm4gdGltZXJJZCA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogdHJhaWxpbmdFZGdlKG5vdygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpLFxuICAgICAgICBpc0ludm9raW5nID0gc2hvdWxkSW52b2tlKHRpbWUpO1xuXG4gICAgbGFzdEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGFzdFRoaXMgPSB0aGlzO1xuICAgIGxhc3RDYWxsVGltZSA9IHRpbWU7XG5cbiAgICBpZiAoaXNJbnZva2luZykge1xuICAgICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgLy8gSGFuZGxlIGludm9jYXRpb25zIGluIGEgdGlnaHQgbG9vcC5cbiAgICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAgICAgcmV0dXJuIGludm9rZUZ1bmMobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBkZWJvdW5jZWQuY2FuY2VsID0gY2FuY2VsO1xuICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJvdW5jZTtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3ltYm9sO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKlxuICogR2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlXG4gKiB0aGUgVW5peCBlcG9jaCAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgRGF0ZVxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgdGltZXN0YW1wLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmRlZmVyKGZ1bmN0aW9uKHN0YW1wKSB7XG4gKiAgIGNvbnNvbGUubG9nKF8ubm93KCkgLSBzdGFtcCk7XG4gKiB9LCBfLm5vdygpKTtcbiAqIC8vID0+IExvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGludm9jYXRpb24uXG4gKi9cbnZhciBub3cgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHJvb3QuRGF0ZS5ub3coKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbm93O1xuIiwidmFyIGRlYm91bmNlID0gcmVxdWlyZSgnLi9kZWJvdW5jZScpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogRXJyb3IgbWVzc2FnZSBjb25zdGFudHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKipcbiAqIENyZWF0ZXMgYSB0aHJvdHRsZWQgZnVuY3Rpb24gdGhhdCBvbmx5IGludm9rZXMgYGZ1bmNgIGF0IG1vc3Qgb25jZSBwZXJcbiAqIGV2ZXJ5IGB3YWl0YCBtaWxsaXNlY29uZHMuIFRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgXG4gKiBtZXRob2QgdG8gY2FuY2VsIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvXG4gKiBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS4gUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2BcbiAqIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGBcbiAqIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZCB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGVcbiAqIHRocm90dGxlZCBmdW5jdGlvbi4gU3Vic2VxdWVudCBjYWxscyB0byB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHJldHVybiB0aGVcbiAqIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIHRocm90dGxlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy50aHJvdHRsZWAgYW5kIGBfLmRlYm91bmNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIGludm9jYXRpb25zIHRvLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHRocm90dGxlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgZXhjZXNzaXZlbHkgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIHdoaWxlIHNjcm9sbGluZy5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdzY3JvbGwnLCBfLnRocm90dGxlKHVwZGF0ZVBvc2l0aW9uLCAxMDApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHJlbmV3VG9rZW5gIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBidXQgbm90IG1vcmUgdGhhbiBvbmNlIGV2ZXJ5IDUgbWludXRlcy5cbiAqIHZhciB0aHJvdHRsZWQgPSBfLnRocm90dGxlKHJlbmV3VG9rZW4sIDMwMDAwMCwgeyAndHJhaWxpbmcnOiBmYWxzZSB9KTtcbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCB0aHJvdHRsZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgdGhyb3R0bGVkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCB0aHJvdHRsZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGVhZGluZyA9IHRydWUsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICdsZWFkaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLmxlYWRpbmcgOiBsZWFkaW5nO1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cbiAgcmV0dXJuIGRlYm91bmNlKGZ1bmMsIHdhaXQsIHtcbiAgICAnbGVhZGluZyc6IGxlYWRpbmcsXG4gICAgJ21heFdhaXQnOiB3YWl0LFxuICAgICd0cmFpbGluZyc6IHRyYWlsaW5nXG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIGlzU3ltYm9sID0gcmVxdWlyZSgnLi9pc1N5bWJvbCcpO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBOQU4gPSAwIC8gMDtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS4gKi9cbnZhciByZVRyaW0gPSAvXlxccyt8XFxzKyQvZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJhZCBzaWduZWQgaGV4YWRlY2ltYWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmFkSGV4ID0gL15bLStdMHhbMC05YS1mXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiaW5hcnkgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmluYXJ5ID0gL14wYlswMV0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb2N0YWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzT2N0YWwgPSAvXjBvWzAtN10rJC9pO1xuXG4vKiogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgd2l0aG91dCBhIGRlcGVuZGVuY3kgb24gYHJvb3RgLiAqL1xudmFyIGZyZWVQYXJzZUludCA9IHBhcnNlSW50O1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9OdW1iZXIoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIE5BTjtcbiAgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgdmFyIG90aGVyID0gdHlwZW9mIHZhbHVlLnZhbHVlT2YgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgIHZhbHVlID0gaXNPYmplY3Qob3RoZXIpID8gKG90aGVyICsgJycpIDogb3RoZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogK3ZhbHVlO1xuICB9XG4gIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZVRyaW0sICcnKTtcbiAgdmFyIGlzQmluYXJ5ID0gcmVJc0JpbmFyeS50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIChpc0JpbmFyeSB8fCByZUlzT2N0YWwudGVzdCh2YWx1ZSkpXG4gICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgOiAocmVJc0JhZEhleC50ZXN0KHZhbHVlKSA/IE5BTiA6ICt2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9OdW1iZXI7XG4iXX0=
