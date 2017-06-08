(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		    totalPanelChange = this.panelInner.offsetHeight - panelStart,
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
				})) (0, _scrollTo2.default)(_this7.panel.offsetTop - 120);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL3NyYy9hcHAuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvZWFzZUluT3V0UXVhZC5qcyIsImV4YW1wbGUvc3JjL2xpYnMvbGlicy9pblZpZXcuanMiLCJleGFtcGxlL3NyYy9saWJzL2xpYnMvc2Nyb2xsVG8uanMiLCJleGFtcGxlL3NyYy9saWJzL3N0b3JtLXdhbGwuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7Ozs7QUFFQSxJQUFNLGVBQWUsWUFBTSxBQUMxQjtxQkFBQSxBQUFLLEtBQUwsQUFBVSxBQUVWOztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUEQsQUFBb0IsQ0FBQTs7QUFTcEIsSUFBRyxzQkFBSCxBQUF5QixlQUFRLEFBQU8saUJBQVAsQUFBd0IsUUFBUSxZQUFNLEFBQUU7YUFBQSxBQUFZLFFBQVEsVUFBQSxBQUFDLElBQUQ7U0FBQSxBQUFRO0FBQTVCLEFBQW9DO0FBQTVFLENBQUE7Ozs7Ozs7OztBQ1hqQztrQkFDZSxVQUFBLEFBQUMsR0FBRCxBQUFJLEdBQUosQUFBTyxHQUFQLEFBQVUsR0FBTSxBQUM5QjtNQUFLLElBQUwsQUFBUyxBQUNUO0tBQUksSUFBSixBQUFRLEdBQUcsQUFDVjtTQUFPLElBQUEsQUFBSSxJQUFKLEFBQVEsSUFBUixBQUFZLElBQW5CLEFBQXVCLEFBQ3ZCO0FBQ0Q7QUFDQTtRQUFPLENBQUEsQUFBQyxJQUFELEFBQUssS0FBSyxLQUFLLElBQUwsQUFBUyxLQUFuQixBQUF3QixLQUEvQixBQUFvQyxBQUNwQztBOzs7Ozs7Ozs7a0JDUmMsVUFBQSxBQUFDLFNBQUQsQUFBVSxNQUFTLEFBQ2pDO0tBQUksTUFBTSxRQUFWLEFBQVUsQUFBUSxBQUNsQjtRQUFRLElBQUEsQUFBSSxTQUFTLEtBQWIsQUFBa0IsS0FBSyxJQUFBLEFB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFdhbGwgZnJvbSAnLi9saWJzL3N0b3JtLXdhbGwnO1xuXG5jb25zdCBvbkxvYWRUYXNrcyA9IFsoKSA9PiB7XG5cdFdhbGwuaW5pdCgnLmpzLXdhbGwnKTtcblx0XG5cdC8vIExvYWQoJy4vanMvc3Rvcm0td2FsbC5zdGFuZGFsb25lLmpzJylcblx0Ly8gXHQudGhlbigoKSA9PiB7XG5cdC8vIFx0XHRTdG9ybVdhbGwuaW5pdCgnLmpzLXdhbGwnKTtcblx0Ly8gXHR9KTtcbn1dO1xuXG5pZignYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93KSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHsgb25Mb2FkVGFza3MuZm9yRWFjaCgoZm4pID0+IGZuKCkpOyB9KTsiLCIvL2h0dHA6Ly9nb28uZ2wvNUhMbDhcbmV4cG9ydCBkZWZhdWx0ICh0LCBiLCBjLCBkKSA9PiB7XG5cdHQgLz0gZCAvIDI7XG5cdGlmICh0IDwgMSkge1xuXHRcdHJldHVybiBjIC8gMiAqIHQgKiB0ICsgYjtcblx0fVxuXHR0LS07XG5cdHJldHVybiAtYyAvIDIgKiAodCAqICh0IC0gMikgLSAxKSArIGI7XG59OyIsImV4cG9ydCBkZWZhdWx0IChlbGVtZW50LCB2aWV3KSA9PiB7XG5cdGxldCBib3ggPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRyZXR1cm4gKGJveC5yaWdodCA+PSB2aWV3LmwgJiYgYm94LmJvdHRvbSA+PSB2aWV3LnQgJiYgYm94LmxlZnQgPD0gdmlldy5yICYmIGJveC50b3AgPD0gdmlldy5iKTtcbn07IiwiaW1wb3J0IGVhc2VJbk91dFF1YWQgZnJvbSAnLi9lYXNlSW5PdXRRdWFkJztcblxuY29uc3QgbW92ZSA9IGFtb3VudCA9PiB7XG5cdGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgPSBhbW91bnQ7XG5cdGRvY3VtZW50LmJvZHkucGFyZW50Tm9kZS5zY3JvbGxUb3AgPSBhbW91bnQ7XG5cdGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gYW1vdW50O1xufTtcblxuY29uc3QgcG9zaXRpb24gPSAoKSA9PiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkucGFyZW50Tm9kZS5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG5cbmV4cG9ydCBkZWZhdWx0ICh0bywgZHVyYXRpb24gPSA1MDAsIGNhbGxiYWNrKSA9PiB7XG5cdGxldCBzdGFydCA9IHBvc2l0aW9uKCksXG5cdFx0Y2hhbmdlID0gdG8gLSBzdGFydCxcblx0XHRjdXJyZW50VGltZSA9IDAsXG5cdFx0aW5jcmVtZW50ID0gMjAsXG5cdFx0YW5pbWF0ZVNjcm9sbCA9ICgpID0+IHtcblx0XHRcdGN1cnJlbnRUaW1lICs9IGluY3JlbWVudDtcblx0XHRcdGxldCB2YWwgPSBlYXNlSW5PdXRRdWFkKGN1cnJlbnRUaW1lLCBzdGFydCwgY2hhbmdlLCBkdXJhdGlvbik7XG5cdFx0XHRtb3ZlKHZhbCk7XG5cdFx0XHRcblx0XHRcdGlmIChjdXJyZW50VGltZSA8IGR1cmF0aW9uKSAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlU2Nyb2xsKTtcblx0XHRcdGVsc2UgKGNhbGxiYWNrICYmIHR5cGVvZiAoY2FsbGJhY2spID09PSAnZnVuY3Rpb24nKSAmJiBjYWxsYmFjaygpO1xuXHRcdH07XG5cdGFuaW1hdGVTY3JvbGwoKTtcbn07IiwiaW1wb3J0IHRocm90dGxlIGZyb20gJ2xvZGFzaC50aHJvdHRsZSc7XG5cbmltcG9ydCBzY3JvbGxUbyBmcm9tICcuL2xpYnMvc2Nyb2xsVG8nO1xuaW1wb3J0IGluVmlldyBmcm9tICcuL2xpYnMvaW5WaWV3JztcbmltcG9ydCBlYXNlSW5PdXRRdWFkIGZyb20gJy4vbGlicy9lYXNlSW5PdXRRdWFkJztcblxuY29uc3QgZGVmYXVsdHMgPSB7XG5cdGNsYXNzTmFtZXM6IHtcblx0XHRyZWFkeTogJy5qcy13YWxsLS1pcy1yZWFkeScsXG5cdFx0dHJpZ2dlcjogJy5qcy13YWxsLXRyaWdnZXInLFxuXHRcdGl0ZW06ICcuanMtd2FsbC1pdGVtJyxcblx0XHRjb250ZW50OiAnLmpzLXdhbGwtY2hpbGQnLFxuXHRcdHBhbmVsOiAnLmpzLXdhbGwtcGFuZWwnLFxuXHRcdHBhbmVsSW5uZXI6ICcuanMtd2FsbC1wYW5lbC1pbm5lcicsXG5cdFx0b3BlbjogJy5qcy13YWxsLS1pcy1vcGVuJyxcblx0XHRhbmltYXRpbmc6ICcuanMtd2FsbC0taXMtYW5pbWF0aW5nJyxcblx0XHRjbG9zZUJ1dHRvbjogJy5qcy13YWxsLWNsb3NlJyxcblx0XHRuZXh0QnV0dG9uOiAnLmpzLXdhbGwtbmV4dCcsXG5cdFx0cHJldmlvdXNCdXR0b246ICcuanMtd2FsbC1wcmV2aW91cydcblx0fVxufTtcblxuY29uc3QgQ09OU1RBTlRTID0ge1xuXHRFUlJPUlM6IHtcblx0XHRST09UOiAnV2FsbCBjYW5ub3QgYmUgaW5pdGlhbGlzZWQsIG5vIHRyaWdnZXIgZWxlbWVudHMgZm91bmQnLFxuXHRcdElURU06ICdXYWxsIGl0ZW0gY2Fubm90IGJlIGZvdW5kJyxcblx0XHRUUklHR0VSOiAnV2FsbCB0cmlnZ2VyIGNhbm5vdCBiZSBmb3VuZCdcblx0fSxcblx0S0VZQ09ERVM6IFsxMywgMzJdLFxuXHRFVkVOVFM6IFsnY2xpY2snLCAna2V5ZG93biddXG59O1xuXG5jb25zdCBTdG9ybVdhbGwgPSB7XG5cdGluaXQoKXtcblx0XHR0aGlzLm9wZW5JbmRleCA9IGZhbHNlO1xuXG5cdFx0dGhpcy5pbml0VGhyb3R0bGVkKCk7XG5cdFx0dGhpcy5pbml0SXRlbXMoKTtcblx0XHR0aGlzLmluaXRUcmlnZ2VycygpO1xuXHRcdHRoaXMuaW5pdFBhbmVsKCk7XG5cdFx0dGhpcy5pbml0QnV0dG9ucygpO1xuXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMudGhyb3R0bGVkUmVzaXplLmJpbmQodGhpcykpO1xuXHRcdHNldFRpbWVvdXQodGhpcy5lcXVhbEhlaWdodC5iaW5kKHRoaXMpLCAxMDApO1xuXHRcdFxuXHRcdHRoaXMubm9kZS5jbGFzc0xpc3QuYWRkKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5yZWFkeS5zdWJzdHIoMSkpO1xuXG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRpZighIXdpbmRvdy5sb2NhdGlvbi5oYXNoICYmICEhfmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNsaWNlKDEpKS5jbGFzc05hbWUuaW5kZXhPZih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMudHJpZ2dlci5zdWJzdHIoMSkpKSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh3aW5kb3cubG9jYXRpb24uaGFzaC5zbGljZSgxKSkuY2xpY2soKTtcblx0XHR9LCAyNjApO1xuXG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0aW5pdFRocm90dGxlZCgpe1xuXHRcdHRoaXMudGhyb3R0bGVkUmVzaXplID0gdGhyb3R0bGUoKCkgPT4ge1xuXHRcdFx0dGhpcy5lcXVhbEhlaWdodCh0aGlzLnNldFBhbmVsVG9wLmJpbmQodGhpcykpO1xuXHRcdH0sIDYwKTtcblxuXHRcdHRoaXMudGhyb3R0bGVkQ2hhbmdlID0gdGhyb3R0bGUodGhpcy5jaGFuZ2UsIDEwMCk7XG5cdFx0dGhpcy50aHJvdHRsZWRQcmV2aW91cyA9IHRocm90dGxlKHRoaXMucHJldmlvdXMsIDEwMCk7XG5cdFx0dGhpcy50aHJvdHRsZWROZXh0ID0gdGhyb3R0bGUodGhpcy5uZXh0LCAxMDApO1xuXHR9LFxuXHRpbml0VHJpZ2dlcnMoKXtcblx0XHR0aGlzLml0ZW1zLmZvckVhY2goKGl0ZW0sIGkpID0+IHtcblx0XHRcdGxldCB0cmlnZ2VyID0gaXRlbS5ub2RlLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnRyaWdnZXIpO1xuXHRcdFx0aWYoIXRyaWdnZXIpIHRocm93IG5ldyBFcnJvcihDT05TVEFOVFMuRVJST1JTLlRSSUdHRVIpO1xuXG5cdFx0XHRDT05TVEFOVFMuRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0XHR0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGUgPT4ge1xuXHRcdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0XHR0aGlzLnRocm90dGxlZENoYW5nZShpKTtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cdGluaXRQYW5lbCgpe1xuXHRcdGxldCBlbGVtZW50RmFjdG9yeSA9IChlbGVtZW50LCBjbGFzc05hbWUsIGF0dHJpYnV0ZXMpID0+IHtcblx0XHRcdFx0bGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50KTtcblx0XHRcdFx0ZWwuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuXHRcdFx0XHRmb3IgKHZhciBrIGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0XHRpZiAoYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuXHRcdFx0XHRcdFx0ZWwuc2V0QXR0cmlidXRlKGssIGF0dHJpYnV0ZXNba10pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZWw7XG5cdFx0XHR9LFxuXHRcdFx0cGFuZWxFbGVtZW50ID0gZWxlbWVudEZhY3RvcnkodGhpcy5pdGVtc1swXS5ub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSwgdGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnBhbmVsLnN1YnN0cigxKSwgeyAnYXJpYS1oaWRkZW4nOiB0cnVlIH0pO1xuXHRcdFxuXHRcdHRoaXMucGFuZWxJbm5lciA9IGVsZW1lbnRGYWN0b3J5KCdkaXYnLCB0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMucGFuZWxJbm5lci5zdWJzdHIoMSkpO1xuXHRcdHRoaXMucGFuZWwgPSB0aGlzLm5vZGUuYXBwZW5kQ2hpbGQocGFuZWxFbGVtZW50KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cdGluaXRCdXR0b25zKCl7XG5cdFx0bGV0IGJ1dHRvbnNUZW1wbGF0ZSA9IGA8YnV0dG9uIGNsYXNzPVwiJHt0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuY2xvc2VCdXR0b24uc3Vic3RyKDEpfVwiIGFyaWEtbGFiZWw9XCJjbG9zZVwiPlxuXHRcdFx0XHRcdFx0XHRcdDxzdmcgZmlsbD1cIiMwMDAwMDBcIiBoZWlnaHQ9XCIzMFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjI0XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuXHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0xOSA2LjQxTDE3LjU5IDUgMTIgMTAuNTkgNi40MSA1IDUgNi40MSAxMC41OSAxMiA1IDE3LjU5IDYuNDEgMTkgMTIgMTMuNDEgMTcuNTkgMTkgMTkgMTcuNTkgMTMuNDEgMTJ6XCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0wIDBoMjR2MjRIMHpcIiBmaWxsPVwibm9uZVwiLz5cblx0XHRcdFx0XHRcdFx0XHQ8L3N2Zz5cblx0XHRcdFx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdFx0XHQgXHRcdDxidXR0b24gY2xhc3M9XCIke3RoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5wcmV2aW91c0J1dHRvbi5zdWJzdHIoMSl9XCIgYXJpYS1sYWJlbD1cInByZXZpb3VzXCI+XG5cdFx0XHRcdFx0XHRcdFx0IDxzdmcgZmlsbD1cIiMwMDAwMDBcIiBoZWlnaHQ9XCIzNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjM2XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTE1LjQxIDcuNDFMMTQgNmwtNiA2IDYgNiAxLjQxLTEuNDFMMTAuODMgMTJ6XCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTAgMGgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9zdmc+XG5cdFx0XHRcdFx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdFx0XHQgXHRcdDxidXR0b24gY2xhc3M9XCIke3RoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5uZXh0QnV0dG9uLnN1YnN0cigxKX1cIiBhcmlhLWxhYmVsPVwibmV4dFwiPlxuXHRcdFx0XHRcdFx0XHRcdFx0PHN2ZyBmaWxsPVwiIzAwMDAwMFwiIGhlaWdodD1cIjM2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMzZcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMTAgNkw4LjU5IDcuNDEgMTMuMTcgMTJsLTQuNTggNC41OUwxMCAxOGw2LTZ6XCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8cGF0aCBkPVwiTTAgMGgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9zdmc+XG5cdFx0XHRcdFx0XHRcdFx0IDwvYnV0dG9uPmA7XG5cblx0XHR0aGlzLnBhbmVsLmlubmVySFRNTCA9IGAke3RoaXMucGFuZWwuaW5uZXJIVE1MfSR7YnV0dG9uc1RlbXBsYXRlfWA7XG5cdFx0XHRcblx0XHRDT05TVEFOVFMuRVZFTlRTLmZvckVhY2goZXYgPT4ge1xuXHRcdFx0dGhpcy5wYW5lbC5xdWVyeVNlbGVjdG9yKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5jbG9zZUJ1dHRvbikuYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0dGhpcy5jbG9zZS5jYWxsKHRoaXMpO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnBhbmVsLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnByZXZpb3VzQnV0dG9uKS5hZGRFdmVudExpc3RlbmVyKGV2LCBlID0+IHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlICYmICF+Q09OU1RBTlRTLktFWUNPREVTLmluZGV4T2YoZS5rZXlDb2RlKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLnRocm90dGxlZFByZXZpb3VzLmNhbGwodGhpcyk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMucGFuZWwucXVlcnlTZWxlY3Rvcih0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMubmV4dEJ1dHRvbikuYWRkRXZlbnRMaXN0ZW5lcihldiwgZSA9PiB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSAmJiAhfkNPTlNUQU5UUy5LRVlDT0RFUy5pbmRleE9mKGUua2V5Q29kZSkpIHJldHVybjtcblx0XHRcdFx0dGhpcy50aHJvdHRsZWROZXh0LmNhbGwodGhpcyk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSxcblx0aW5pdEl0ZW1zKCl7XG5cdFx0bGV0IGl0ZW1zID0gW10uc2xpY2UuY2FsbCh0aGlzLm5vZGUucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuaXRlbSkpO1xuXG5cdFx0aWYoaXRlbXMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoQ09OU1RBTlRTLkVSUk9SUy5JVEVNKTtcblxuXHRcdHRoaXMuaXRlbXMgPSBpdGVtcy5tYXAoaXRlbSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRub2RlOiBpdGVtLFxuXHRcdFx0XHRjb250ZW50OiBpdGVtLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLmNvbnRlbnQpLFxuXHRcdFx0XHR0cmlnZ2VyOiBpdGVtLnF1ZXJ5U2VsZWN0b3IodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLnRyaWdnZXIpXG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdH0sXG5cdGNoYW5nZShpKXtcblx0XHRpZih0aGlzLm9wZW5JbmRleCA9PT0gZmFsc2UpIHJldHVybiB0aGlzLm9wZW4oaSk7XG5cdFx0aWYodGhpcy5vcGVuSW5kZXggPT09IGkpIHJldHVybiB0aGlzLmNsb3NlKCk7XG5cdFx0aWYgKHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUub2Zmc2V0VG9wID09PSB0aGlzLml0ZW1zW2ldLm5vZGUub2Zmc2V0VG9wKSB0aGlzLmNsb3NlKCgpID0+IHRoaXMub3BlbihpLCB0aGlzLnBhbmVsLm9mZnNldEhlaWdodCksIHRoaXMucGFuZWwub2Zmc2V0SGVpZ2h0KTtcblx0XHRlbHNlIHRoaXMuY2xvc2UoKCkgPT4gdGhpcy5vcGVuKGkpKTtcblx0fSxcblx0b3BlbihpLCBzdGFydCwgc3BlZWQpe1xuXHRcdHRoaXMucGFuZWxTb3VyY2VDb250YWluZXIgPSB0aGlzLml0ZW1zW2ldLmNvbnRlbnQ7XG5cdFx0dGhpcy5vcGVuSW5kZXggPSBpO1xuXHRcdHRoaXMuc2V0UGFuZWxUb3AoKTtcblx0XHR0aGlzLnBhbmVsQ29udGVudCA9IHRoaXMucGFuZWxTb3VyY2VDb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQuY2xvbmVOb2RlKHRydWUpO1xuXHRcdHRoaXMucGFuZWxJbm5lci5hcHBlbmRDaGlsZCh0aGlzLnBhbmVsQ29udGVudCk7XG5cdFx0dGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLnBhbmVsU291cmNlQ29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkKTtcblx0XHR0aGlzLnBhbmVsLmluc2VydEJlZm9yZSh0aGlzLnBhbmVsSW5uZXIsIHRoaXMucGFuZWwuZmlyc3RFbGVtZW50Q2hpbGQpO1xuXG5cdFx0bGV0IGN1cnJlbnRUaW1lID0gMCxcblx0XHRcdHBhbmVsU3RhcnQgPSBzdGFydCB8fCAwLFxuXHRcdFx0dG90YWxQYW5lbENoYW5nZSA9IHRoaXMucGFuZWxJbm5lci5vZmZzZXRIZWlnaHQgLSBwYW5lbFN0YXJ0LFxuXHRcdFx0cm93U3RhcnQgPSB0aGlzLmNsb3NlZEhlaWdodCArIHBhbmVsU3RhcnQsXG5cdFx0XHR0b3RhbFJvd0NoYW5nZSA9IHRvdGFsUGFuZWxDaGFuZ2UsXG5cdFx0XHRkdXJhdGlvbiA9IHNwZWVkIHx8IDE2LFxuXHRcdFx0YW5pbWF0ZU9wZW4gPSAoKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRUaW1lKys7XG5cdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcGFuZWxTdGFydCwgdG90YWxQYW5lbENoYW5nZSwgZHVyYXRpb24pICsgJ3B4Jztcblx0XHRcdFx0dGhpcy5yZXNpemVSb3codGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0ubm9kZSwgZWFzZUluT3V0UXVhZChjdXJyZW50VGltZSwgcm93U3RhcnQsIHRvdGFsUm93Q2hhbmdlLCBkdXJhdGlvbikgKyAncHgnKTtcblx0XHRcdFx0aWYgKGN1cnJlbnRUaW1lIDwgZHVyYXRpb24pIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZU9wZW4uYmluZCh0aGlzKSk7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMuaXRlbXNbaV0ubm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLnBhbmVsLCB0aGlzLml0ZW1zW2ldLm5vZGUubmV4dEVsZW1lbnRTaWJsaW5nKTtcblxuXHRcdFx0XHRcdCghIXdpbmRvdy5oaXN0b3J5ICYmICEhd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSAmJiB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoeyBVUkw6IGAjJHt0aGlzLml0ZW1zW2ldLnRyaWdnZXIuZ2V0QXR0cmlidXRlKCdpZCcpfWB9LCAnJywgYCMke3RoaXMuaXRlbXNbaV0udHJpZ2dlci5nZXRBdHRyaWJ1dGUoJ2lkJyl9YCk7XG5cblx0XHRcdFx0XHRpZiAoIWluVmlldyh0aGlzLnBhbmVsLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRsOiAwLFxuXHRcdFx0XHRcdFx0XHR0OiAwLFxuXHRcdFx0XHRcdFx0XHRiOiAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpIC0gdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQsXG5cdFx0XHRcdFx0XHRcdHI6ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH0pKSBzY3JvbGxUbyh0aGlzLnBhbmVsLm9mZnNldFRvcCAtIDEyMCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMub3Blbi5zdWJzdHIoMSkpO1xuXG5cdFx0dGhpcy5wYW5lbC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG5cdFx0dGhpcy5pdGVtc1tpXS50cmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIHRydWUpO1xuXG5cdFx0YW5pbWF0ZU9wZW4uY2FsbCh0aGlzKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRjbG9zZShjYiwgZW5kLCBzcGVlZCl7XG5cdFx0bGV0IGVuZFBvaW50ID0gZW5kIHx8IDAsXG5cdFx0XHRjdXJyZW50VGltZSA9IDAsXG5cdFx0XHRwYW5lbFN0YXJ0ID0gdGhpcy5wYW5lbC5vZmZzZXRIZWlnaHQsXG5cdFx0XHR0b3RhbFBhbmVsQ2hhbmdlID0gZW5kUG9pbnQgLSBwYW5lbFN0YXJ0LFxuXHRcdFx0cm93U3RhcnQgPSB0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLm9mZnNldEhlaWdodCxcblx0XHRcdHRvdGFsUm93Q2hhbmdlID0gdG90YWxQYW5lbENoYW5nZSxcblx0XHRcdGR1cmF0aW9uID0gc3BlZWQgfHwgMTYsXG5cdFx0XHRhbmltYXRlQ2xvc2VkID0gKCkgPT4ge1xuXHRcdFx0XHRjdXJyZW50VGltZSsrO1xuXHRcdFx0XHR0aGlzLnBhbmVsLnN0eWxlLmhlaWdodCA9IGVhc2VJbk91dFF1YWQoY3VycmVudFRpbWUsIHBhbmVsU3RhcnQsIHRvdGFsUGFuZWxDaGFuZ2UsIGR1cmF0aW9uKSArICdweCc7XG5cdFx0XHRcdHRoaXMucmVzaXplUm93KHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUsIGVhc2VJbk91dFF1YWQoY3VycmVudFRpbWUsIHJvd1N0YXJ0LCB0b3RhbFJvd0NoYW5nZSwgZHVyYXRpb24pICsgJ3B4Jyk7XG5cdFx0XHRcdGlmIChjdXJyZW50VGltZSA8IGR1cmF0aW9uKSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVDbG9zZWQuYmluZCh0aGlzKSk7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGlmICghZW5kUG9pbnQpIHRoaXMucGFuZWwuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMucGFuZWxJbm5lci5yZW1vdmVDaGlsZCh0aGlzLnBhbmVsQ29udGVudCk7XG5cdFx0XHRcdFx0dGhpcy5wYW5lbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XG5cdFx0XHRcdFx0dGhpcy5pdGVtc1t0aGlzLm9wZW5JbmRleF0udHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSk7XG5cdFx0XHRcdFx0dGhpcy5wYW5lbFNvdXJjZUNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnBhbmVsQ29udGVudCk7XG5cdFx0XHRcdFx0dGhpcy5ub2RlLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5zZXR0aW5ncy5jbGFzc05hbWVzLmFuaW1hdGluZy5zdWJzdHIoMSkpO1xuXHRcdFx0XHRcdHRoaXMubm9kZS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuc2V0dGluZ3MuY2xhc3NOYW1lcy5vcGVuLnN1YnN0cigxKSk7XG5cdFx0XHRcdFx0dGhpcy5vcGVuSW5kZXggPSBmYWxzZTtcblx0XHRcdFx0XHR0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicgJiYgY2IoKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcblx0XHR0aGlzLm5vZGUuY2xhc3NMaXN0LmFkZCh0aGlzLnNldHRpbmdzLmNsYXNzTmFtZXMuYW5pbWF0aW5nLnN1YnN0cigxKSk7XG5cblx0XHRhbmltYXRlQ2xvc2VkLmNhbGwodGhpcyk7XG5cdH0sXG5cdHByZXZpb3VzKCkge1xuXHRcdHJldHVybiB0aGlzLmNoYW5nZSgodGhpcy5vcGVuSW5kZXggLSAxIDwgMCA/IHRoaXMuaXRlbXMubGVuZ3RoIC0gMSA6IHRoaXMub3BlbkluZGV4IC0gMSkpO1xuXHR9LFxuXHRuZXh0KCkge1xuXHRcdHJldHVybiB0aGlzLmNoYW5nZSgodGhpcy5vcGVuSW5kZXggKyAxID09PSB0aGlzLml0ZW1zLmxlbmd0aCA/IDAgOiB0aGlzLm9wZW5JbmRleCArIDEpKTtcblx0fSxcblx0ZXF1YWxIZWlnaHQoY2IpIHtcblx0XHRsZXQgb3BlbkhlaWdodCA9IDAsXG5cdFx0XHRjbG9zZWRIZWlnaHQgPSAwO1xuXG5cdFx0dGhpcy5pdGVtcy5tYXAoKGl0ZW0sIGkpID0+IHtcblx0XHRcdGl0ZW0ubm9kZS5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG5cdFx0XHRpZiAodGhpcy5vcGVuSW5kZXggIT09IGZhbHNlICYmIGl0ZW0ubm9kZS5vZmZzZXRUb3AgPT09IHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUub2Zmc2V0VG9wKSB7XG5cdFx0XHRcdGlmICh0aGlzLm9wZW5JbmRleCA9PT0gaSkgb3BlbkhlaWdodCA9IGl0ZW0ubm9kZS5vZmZzZXRIZWlnaHQgKyB0aGlzLnBhbmVsLm9mZnNldEhlaWdodDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChpdGVtLm5vZGUub2Zmc2V0SGVpZ2h0ID4gY2xvc2VkSGVpZ2h0KSBjbG9zZWRIZWlnaHQgPSBpdGVtLm5vZGUub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0fSkubWFwKChpdGVtLCBpKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5vcGVuSW5kZXggIT09IGkpIGl0ZW0ubm9kZS5zdHlsZS5oZWlnaHQgPSBjbG9zZWRIZWlnaHQgKyAncHgnO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5vcGVuSGVpZ2h0ID0gb3BlbkhlaWdodDtcblx0XHR0aGlzLmNsb3NlZEhlaWdodCA9IGNsb3NlZEhlaWdodCA9PT0gMCA/IHRoaXMuY2xvc2VkSGVpZ2h0IDogY2xvc2VkSGVpZ2h0O1xuXG5cdFx0aWYgKHRoaXMub3BlbkhlaWdodCA+IDApIHtcblx0XHRcdHRoaXMucmVzaXplUm93KHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLm5vZGUsIHRoaXMub3BlbkhlaWdodCArICdweCcpO1xuXHRcdFx0dHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICYmIGNiKCk7XG5cdFx0fVxuXHR9LFxuXHRyZXNpemVSb3coZWwsIGhlaWdodCl7XG5cdFx0dGhpcy5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuXHRcdFx0aWYgKGl0ZW0ubm9kZS5vZmZzZXRUb3AgPT09IGVsLm9mZnNldFRvcCkgaXRlbS5ub2RlLnN0eWxlLmhlaWdodCA9IGhlaWdodDtcblx0XHR9KTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0c2V0UGFuZWxUb3AoKSB7XG5cdFx0dGhpcy5wYW5lbC5zdHlsZS50b3AgPSBgJHt0aGlzLml0ZW1zW3RoaXMub3BlbkluZGV4XS5ub2RlLm9mZnNldFRvcCArIHRoaXMuaXRlbXNbdGhpcy5vcGVuSW5kZXhdLnRyaWdnZXIub2Zmc2V0SGVpZ2h0fXB4YDtcblx0fVxufTtcblxuY29uc3QgaW5pdCA9IChzZWwsIG9wdHMpID0+IHtcblx0bGV0IGVscyA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcblx0XG5cdGlmKGVscy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcihDT05TVEFOVFMuRVJST1JTLlJPT1QpO1xuXHRcblx0cmV0dXJuIGVscy5tYXAoZWwgPT4ge1xuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUoU3Rvcm1XYWxsKSwge1xuXHRcdFx0bm9kZTogZWwsXG5cdFx0XHRzZXR0aW5nczogT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdHMpXG5cdFx0fSkuaW5pdCgpO1xuXHR9KTtcbn07XG5cdFxuZXhwb3J0IGRlZmF1bHQgeyBpbml0IH07IiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHRoZSBgVHlwZUVycm9yYCBtZXNzYWdlIGZvciBcIkZ1bmN0aW9uc1wiIG1ldGhvZHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBOQU4gPSAwIC8gMDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLiAqL1xudmFyIHJlVHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heCxcbiAgICBuYXRpdmVNaW4gPSBNYXRoLm1pbjtcblxuLyoqXG4gKiBHZXRzIHRoZSB0aW1lc3RhbXAgb2YgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2VcbiAqIHRoZSBVbml4IGVwb2NoICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBEYXRlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lc3RhbXAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVmZXIoZnVuY3Rpb24oc3RhbXApIHtcbiAqICAgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTtcbiAqIH0sIF8ubm93KCkpO1xuICogLy8gPT4gTG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgaW52b2NhdGlvbi5cbiAqL1xudmFyIG5vdyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcm9vdC5EYXRlLm5vdygpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZGVsYXlzIGludm9raW5nIGBmdW5jYCB1bnRpbCBhZnRlciBgd2FpdGBcbiAqIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHdhc1xuICogaW52b2tlZC4gVGhlIGRlYm91bmNlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGAgbWV0aG9kIHRvIGNhbmNlbFxuICogZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG8gaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uXG4gKiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGVcbiAqIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWRcbiAqIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnRcbiAqIGNhbGxzIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgXG4gKiBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLmRlYm91bmNlYCBhbmQgYF8udGhyb3R0bGVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVib3VuY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz1mYWxzZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF1cbiAqICBUaGUgbWF4aW11bSB0aW1lIGBmdW5jYCBpcyBhbGxvd2VkIHRvIGJlIGRlbGF5ZWQgYmVmb3JlIGl0J3MgaW52b2tlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZGVib3VuY2VkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBjb3N0bHkgY2FsY3VsYXRpb25zIHdoaWxlIHRoZSB3aW5kb3cgc2l6ZSBpcyBpbiBmbHV4LlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoY2FsY3VsYXRlTGF5b3V0LCAxNTApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHNlbmRNYWlsYCB3aGVuIGNsaWNrZWQsIGRlYm91bmNpbmcgc3Vic2VxdWVudCBjYWxscy5cbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCBfLmRlYm91bmNlKHNlbmRNYWlsLCAzMDAsIHtcbiAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSkpO1xuICpcbiAqIC8vIEVuc3VyZSBgYmF0Y2hMb2dgIGlzIGludm9rZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHMuXG4gKiB2YXIgZGVib3VuY2VkID0gXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7ICdtYXhXYWl0JzogMTAwMCB9KTtcbiAqIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9zdHJlYW0nKTtcbiAqIGpRdWVyeShzb3VyY2UpLm9uKCdtZXNzYWdlJywgZGVib3VuY2VkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIGRlYm91bmNlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgZGVib3VuY2VkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxhc3RBcmdzLFxuICAgICAgbGFzdFRoaXMsXG4gICAgICBtYXhXYWl0LFxuICAgICAgcmVzdWx0LFxuICAgICAgdGltZXJJZCxcbiAgICAgIGxhc3RDYWxsVGltZSxcbiAgICAgIGxhc3RJbnZva2VUaW1lID0gMCxcbiAgICAgIGxlYWRpbmcgPSBmYWxzZSxcbiAgICAgIG1heGluZyA9IGZhbHNlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHdhaXQgPSB0b051bWJlcih3YWl0KSB8fCAwO1xuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gISFvcHRpb25zLmxlYWRpbmc7XG4gICAgbWF4aW5nID0gJ21heFdhaXQnIGluIG9wdGlvbnM7XG4gICAgbWF4V2FpdCA9IG1heGluZyA/IG5hdGl2ZU1heCh0b051bWJlcihvcHRpb25zLm1heFdhaXQpIHx8IDAsIHdhaXQpIDogbWF4V2FpdDtcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRnVuYyh0aW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBsYXN0QXJncyxcbiAgICAgICAgdGhpc0FyZyA9IGxhc3RUaGlzO1xuXG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbGVhZGluZ0VkZ2UodGltZSkge1xuICAgIC8vIFJlc2V0IGFueSBgbWF4V2FpdGAgdGltZXIuXG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIC8vIFN0YXJ0IHRoZSB0aW1lciBmb3IgdGhlIHRyYWlsaW5nIGVkZ2UuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAvLyBJbnZva2UgdGhlIGxlYWRpbmcgZWRnZS5cbiAgICByZXR1cm4gbGVhZGluZyA/IGludm9rZUZ1bmModGltZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZW1haW5pbmdXYWl0KHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lLFxuICAgICAgICByZXN1bHQgPSB3YWl0IC0gdGltZVNpbmNlTGFzdENhbGw7XG5cbiAgICByZXR1cm4gbWF4aW5nID8gbmF0aXZlTWluKHJlc3VsdCwgbWF4V2FpdCAtIHRpbWVTaW5jZUxhc3RJbnZva2UpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkSW52b2tlKHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lO1xuXG4gICAgLy8gRWl0aGVyIHRoaXMgaXMgdGhlIGZpcnN0IGNhbGwsIGFjdGl2aXR5IGhhcyBzdG9wcGVkIGFuZCB3ZSdyZSBhdCB0aGVcbiAgICAvLyB0cmFpbGluZyBlZGdlLCB0aGUgc3lzdGVtIHRpbWUgaGFzIGdvbmUgYmFja3dhcmRzIGFuZCB3ZSdyZSB0cmVhdGluZ1xuICAgIC8vIGl0IGFzIHRoZSB0cmFpbGluZyBlZGdlLCBvciB3ZSd2ZSBoaXQgdGhlIGBtYXhXYWl0YCBsaW1pdC5cbiAgICByZXR1cm4gKGxhc3RDYWxsVGltZSA9PT0gdW5kZWZpbmVkIHx8ICh0aW1lU2luY2VMYXN0Q2FsbCA+PSB3YWl0KSB8fFxuICAgICAgKHRpbWVTaW5jZUxhc3RDYWxsIDwgMCkgfHwgKG1heGluZyAmJiB0aW1lU2luY2VMYXN0SW52b2tlID49IG1heFdhaXQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyRXhwaXJlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgIGlmIChzaG91bGRJbnZva2UodGltZSkpIHtcbiAgICAgIHJldHVybiB0cmFpbGluZ0VkZ2UodGltZSk7XG4gICAgfVxuICAgIC8vIFJlc3RhcnQgdGhlIHRpbWVyLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgcmVtYWluaW5nV2FpdCh0aW1lKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFpbGluZ0VkZ2UodGltZSkge1xuICAgIHRpbWVySWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBPbmx5IGludm9rZSBpZiB3ZSBoYXZlIGBsYXN0QXJnc2Agd2hpY2ggbWVhbnMgYGZ1bmNgIGhhcyBiZWVuXG4gICAgLy8gZGVib3VuY2VkIGF0IGxlYXN0IG9uY2UuXG4gICAgaWYgKHRyYWlsaW5nICYmIGxhc3RBcmdzKSB7XG4gICAgICByZXR1cm4gaW52b2tlRnVuYyh0aW1lKTtcbiAgICB9XG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIGlmICh0aW1lcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB9XG4gICAgbGFzdEludm9rZVRpbWUgPSAwO1xuICAgIGxhc3RBcmdzID0gbGFzdENhbGxUaW1lID0gbGFzdFRoaXMgPSB0aW1lcklkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgcmV0dXJuIHRpbWVySWQgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IHRyYWlsaW5nRWRnZShub3coKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJvdW5jZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKSxcbiAgICAgICAgaXNJbnZva2luZyA9IHNob3VsZEludm9rZSh0aW1lKTtcblxuICAgIGxhc3RBcmdzID0gYXJndW1lbnRzO1xuICAgIGxhc3RUaGlzID0gdGhpcztcbiAgICBsYXN0Q2FsbFRpbWUgPSB0aW1lO1xuXG4gICAgaWYgKGlzSW52b2tpbmcpIHtcbiAgICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmdFZGdlKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgICBpZiAobWF4aW5nKSB7XG4gICAgICAgIC8vIEhhbmRsZSBpbnZvY2F0aW9ucyBpbiBhIHRpZ2h0IGxvb3AuXG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgICAgIHJldHVybiBpbnZva2VGdW5jKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZGVib3VuY2VkLmNhbmNlbCA9IGNhbmNlbDtcbiAgZGVib3VuY2VkLmZsdXNoID0gZmx1c2g7XG4gIHJldHVybiBkZWJvdW5jZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRocm90dGxlZCBmdW5jdGlvbiB0aGF0IG9ubHkgaW52b2tlcyBgZnVuY2AgYXQgbW9zdCBvbmNlIHBlclxuICogZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gVGhlIHRocm90dGxlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGBcbiAqIG1ldGhvZCB0byBjYW5jZWwgZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG9cbiAqIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYFxuICogc2hvdWxkIGJlIGludm9rZWQgb24gdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YFxuICogdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZVxuICogdGhyb3R0bGVkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gcmV0dXJuIHRoZVxuICogcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLnRocm90dGxlYCBhbmQgYF8uZGVib3VuY2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gdGhyb3R0bGUuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhyb3R0bGUgaW52b2NhdGlvbnMgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgdGhyb3R0bGVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBleGNlc3NpdmVseSB1cGRhdGluZyB0aGUgcG9zaXRpb24gd2hpbGUgc2Nyb2xsaW5nLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Njcm9sbCcsIF8udGhyb3R0bGUodXBkYXRlUG9zaXRpb24sIDEwMCkpO1xuICpcbiAqIC8vIEludm9rZSBgcmVuZXdUb2tlbmAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGJ1dCBub3QgbW9yZSB0aGFuIG9uY2UgZXZlcnkgNSBtaW51dGVzLlxuICogdmFyIHRocm90dGxlZCA9IF8udGhyb3R0bGUocmVuZXdUb2tlbiwgMzAwMDAwLCB7ICd0cmFpbGluZyc6IGZhbHNlIH0pO1xuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIHRocm90dGxlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyB0aHJvdHRsZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRocm90dGxlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsZWFkaW5nID0gdHJ1ZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gJ2xlYWRpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMubGVhZGluZyA6IGxlYWRpbmc7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuICByZXR1cm4gZGVib3VuY2UoZnVuYywgd2FpdCwge1xuICAgICdsZWFkaW5nJzogbGVhZGluZyxcbiAgICAnbWF4V2FpdCc6IHdhaXQsXG4gICAgJ3RyYWlsaW5nJzogdHJhaWxpbmdcbiAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgbnVtYmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgbnVtYmVyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvTnVtYmVyKDMuMik7XG4gKiAvLyA9PiAzLjJcbiAqXG4gKiBfLnRvTnVtYmVyKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gNWUtMzI0XG4gKlxuICogXy50b051bWJlcihJbmZpbml0eSk7XG4gKiAvLyA9PiBJbmZpbml0eVxuICpcbiAqIF8udG9OdW1iZXIoJzMuMicpO1xuICogLy8gPT4gMy4yXG4gKi9cbmZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBOQU47XG4gIH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHZhciBvdGhlciA9IHR5cGVvZiB2YWx1ZS52YWx1ZU9mID09ICdmdW5jdGlvbicgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbiAgICB2YWx1ZSA9IGlzT2JqZWN0KG90aGVyKSA/IChvdGhlciArICcnKSA6IG90aGVyO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IDAgPyB2YWx1ZSA6ICt2YWx1ZTtcbiAgfVxuICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmVUcmltLCAnJyk7XG4gIHZhciBpc0JpbmFyeSA9IHJlSXNCaW5hcnkudGVzdCh2YWx1ZSk7XG4gIHJldHVybiAoaXNCaW5hcnkgfHwgcmVJc09jdGFsLnRlc3QodmFsdWUpKVxuICAgID8gZnJlZVBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCBpc0JpbmFyeSA/IDIgOiA4KVxuICAgIDogKHJlSXNCYWRIZXgudGVzdCh2YWx1ZSkgPyBOQU4gOiArdmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlO1xuIl19
