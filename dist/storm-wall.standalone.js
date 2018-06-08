/**
 * @name storm-wall: Interactive animating content wall
 * @version 1.2.3: Fri, 08 Jun 2018 16:17:50 GMT
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
function unwrapExports(x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var rafThrottle_1 = createCommonjsModule(function (module, exports) {
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
});

var throttle = unwrapExports(rafThrottle_1);

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

		this.throttledResize = throttle(function () {
			_this2.equalHeight(_this2.setPanelTop.bind(_this2));
		});

		this.throttledChange = throttle(this.change);
		this.throttledPrevious = throttle(this.previous);
		this.throttledNext = throttle(this.next);
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
			_this7.panel.style.height = easeInOutQuad(currentTime, panelStart, totalPanelChange, duration) + 'px';
			_this7.resizeRow(_this7.items[_this7.openIndex].node, easeInOutQuad(currentTime, rowStart, totalRowChange, duration) + 'px');
			if (currentTime < duration) window.requestAnimationFrame(animateOpen.bind(_this7));else {
				_this7.panel.style.height = 'auto';
				_this7.items[i].node.parentNode.insertBefore(_this7.panel, _this7.items[i].node.nextElementSibling);

				!!window.history && !!window.history.pushState && window.history.pushState({ URL: '#' + _this7.items[i].trigger.getAttribute('id') }, '', '#' + _this7.items[i].trigger.getAttribute('id'));

				if (!inView(_this7.panel, function () {
					return {
						l: 0,
						t: 0,
						b: (window.innerHeight || document.documentElement.clientHeight) - _this7.panel.offsetHeight,
						r: window.innerWidth || document.documentElement.clientWidth
					};
				})) scrollTo(_this7.panel.offsetTop - _this7.settings.offset);
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
			_this8.panel.style.height = easeInOutQuad(currentTime, panelStart, totalPanelChange, duration) + 'px';
			_this8.resizeRow(_this8.items[_this8.openIndex].node, easeInOutQuad(currentTime, rowStart, totalRowChange, duration) + 'px');
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

var stormWall = { init: init };

exports.default = stormWall;;
}));
