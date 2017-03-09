/**
 * @name storm-wall: Interactive animating content wall
 * @version 0.3.0: Thu, 09 Mar 2017 12:07:07 GMT
 * @author stormid
 * @license MIT
 */
(function(root, factory) {
   var mod = {
       exports: {}
   };
   if (typeof exports !== 'undefined'){
       mod.exports = exports
       factory(mod.exports)
       module.exports = mod.exports.default
   } else {
       factory(mod.exports);
       root.StormWall = mod.exports.default
   }

}(this, function(exports) {
   'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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
var freeGlobal = (typeof commonjsGlobal === 'undefined' ? 'undefined' : _typeof(commonjsGlobal)) == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self && self.Object === Object && self;

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
var nativeMax = Math.max;
var nativeMin = Math.min;

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
var now = function now() {
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
    return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
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
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
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
  return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
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
  return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'symbol' || isObjectLike(value) && objectToString.call(value) == symbolTag;
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
    value = isObject(other) ? other + '' : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}

var index = throttle;

//http://goo.gl/5HLl8
var easeInOutQuad = function easeInOutQuad(t, b, c, d) {
  t /= d / 2;
  if (t < 1) {
    return c / 2 * t * t + b;
  }
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};

var move = function move(amount) {
  document.documentElement.scrollTop = amount;
  document.body.parentNode.scrollTop = amount;
  document.body.scrollTop = amount;
};

var position = function position() {
  return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;
};

var scrollTo = function scrollTo(to) {
  var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
  var callback = arguments[2];

  var start = position(),
      change = to - start,
      currentTime = 0,
      increment = 20,
      animateScroll = function animateScroll() {
    currentTime += increment;
    var val = easeInOutQuad(currentTime, start, change, duration);
    move(val);

    if (currentTime < duration) window.requestAnimationFrame(animateScroll);else callback && typeof callback === 'function' && callback();
  };
  animateScroll();
};

var inView = function inView(element, view) {
  var box = element.getBoundingClientRect();
  return box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b;
};

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

    this.throttledResize = index(function () {
      _this.equalHeight(_this.setPanelTop.bind(_this));
    }, 60);

    this.throttledChange = index(this.change, 100);
    this.throttledPrevious = index(this.previous, 100);
    this.throttledNext = index(this.next, 100);
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
      _this6.panel.style.height = easeInOutQuad(currentTime, panelStart, totalPanelChange, duration) + 'px';
      _this6.resizeRow(_this6.items[_this6.openIndex].node, easeInOutQuad(currentTime, rowStart, totalRowChange, duration) + 'px');
      if (currentTime < duration) window.requestAnimationFrame(animateOpen.bind(_this6));else {
        _this6.panel.style.height = 'auto';
        _this6.items[i].node.parentNode.insertBefore(_this6.panel, _this6.items[i].node.nextElementSibling);
        if (!inView(_this6.panel, function () {
          return {
            l: 0,
            t: 0,
            b: (window.innerHeight || document.documentElement.clientHeight) - _this6.panel.offsetHeight,
            r: window.innerWidth || document.documentElement.clientWidth
          };
        })) scrollTo(_this6.panel.offsetTop - 120);
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
      _this7.panel.style.height = easeInOutQuad(currentTime, panelStart, totalPanelChange, duration) + 'px';
      _this7.resizeRow(_this7.items[_this7.openIndex].node, easeInOutQuad(currentTime, rowStart, totalRowChange, duration) + 'px');
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

var stormWall = { init: init };

exports.default = stormWall;;
}));
