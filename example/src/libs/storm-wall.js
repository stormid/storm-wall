/**
 * @name storm-toggle: Toggle UI state accessibly
 * @version 0.2.0: Wed, 22 Jun 2016 15:28:11 GMT
 * @author stormid
 * @license MIT
 */(function (root, factory) {if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.StormWall = factory();
    }
}(this, function () {
    'use strict';

    /*
     * Helpers
     */
    // easing function http://goo.gl/5HLl8
    Math.easeInOutQuad = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t + b;
        }
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    //scrollTo
    function scrollTo(to, duration, callback) {
        // because it's so fucking difficult to detect the scrolling element, just move them all
        function move(amount) {
            document.documentElement.scrollTop = amount;
            document.body.parentNode.scrollTop = amount;
            document.body.scrollTop = amount;
        }
        function position() {
            return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;
        }
        var start = position(),
          change = to - start,
          currentTime = 0,
          increment = 20;
        duration = (typeof (duration) === 'undefined') ? 500 : duration;
        var animateScroll = function () {
            currentTime += increment;
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            move(val);
            if (currentTime < duration) {
                window.requestAnimationFrame(animateScroll);
            } else {
                if (callback && typeof (callback) === 'function') {
                    callback();
                }
            }
        };
        animateScroll();
    }

    //throttler
    function throttle(fn, ms) {
        var timeout,
            last = 0;
        return function () {
            var a = arguments,
                t = this,
                now = +(new Date()),
                exe = function () {
                    last = now;
                    fn.apply(t, a);
                };
            window.clearTimeout(timeout);
            if (now >= last + ms) {
                exe();
            } else {
                timeout = window.setTimeout(exe, ms);
            }
        };
    }

    function inView(element, view) {
        var box = element.getBoundingClientRect();
        return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
    }
    var classNames = {
        trigger: '.js-wall-trigger',
        child: '.js-wall-child',
        panel: '.js-wall-panel',
        open: '.js-wall--is-open'
    };

    //Wall item constructor
    function WallItem(el, parent, index) {
        this.index = index;
        this.element = el;
        this.trigger = el.querySelector(classNames.trigger);
        this.child = el.querySelector(classNames.child);
    }

    WallItem.prototype.init = function (parent) {
        this.parent = parent;
        this.initListeners();

        return this;
    };

    WallItem.prototype.keyFinder = function (e) {
        var triggerKeys = [13, 32];

        if (triggerKeys.indexOf(e.keyCode) > -1) {
            e.preventDefault();
            this.parent.throttledChange.call(this.parent, this.index);
        }
    };

    WallItem.prototype.initListeners = function () {
        var self = this;

        if (!!this.trigger) {
            this.trigger.addEventListener('click', this.parent.throttledChange.bind(this.parent, this.index), false);
            this.trigger.addEventListener('keydown', function (e) {
                self.keyFinder.call(self, e);
            }, false);
        }
        return this;
    };

    //Wall constructor
    function Wall() {
        var throttledResize = throttle(function () {
            this.equalHeight.call(this, function () {
                this.setPanelTop.call(this);
            }.bind(this));
        }.bind(this), 60).bind(this);

        this.element = document.querySelector('.js-wall');
        this.elements = [].slice.call(this.element.querySelectorAll('.js-wall-item'));
        this.openIndex = null;
        this.throttledChange = throttle(this.change, 460).bind(this);
        this.throttledPrevious = throttle(this.previous, 460).bind(this);
        this.throttledNext = throttle(this.next, 460).bind(this);


        this.items = this.elements.map(function (el, index) {
            return new WallItem(el, this, index);
        }.bind(this));

        this.items.forEach(function (i) {
            i.init(this);
        }.bind(this));

        this.createPanel()
            .initButtons()
            .initListeners();

        window.addEventListener('resize', throttledResize, false);

        setTimeout(this.equalHeight.bind(this), 10);
    }

    Wall.prototype.createPanel = function () {
        var elementFactory = function (element, className, attributes) {
            var el = document.createElement(element);

            el.className = className;

            for (var k in attributes) {
                if (attributes.hasOwnProperty(k)) {
                    el.setAttribute(k, attributes[k]);
                }
            }

            return el;
        },
            frag = document.createDocumentFragment(),
            panelElement = elementFactory(this.elements[0].tagName.toLowerCase(), classNames.panel.substring(1), { 'aria-hidden': true });
        this.panelInner = elementFactory('div', 'js-wall-panel-inner');

        this.panel = this.element.appendChild(panelElement);

        return this;
    };

    Wall.prototype.initButtons = function () {
        var templates = ['<button class="js-wall-button-close icon-close" aria-label="close"></button>',
                         '<button class="js-wall-button-previous icon-left" aria-label="previous"></button>',
                         '<button class="js-wall-button-next icon-right" aria-label="next"></button>'
        ].join('');

        this.panel.innerHTML = templates + this.panel.innerHTML;
        return this;
    };

    Wall.prototype.initListeners = function () {
        this.panel.querySelector('.js-wall-button-close').addEventListener('click', this.close.bind(this), false);

        this.panel.querySelector('.js-wall-button-previous').addEventListener('click', this.throttledPrevious.bind(this), false);
        this.panel.querySelector('.js-wall-button-next').addEventListener('click', this.throttledNext.bind(this), false);

        return this;
    };

    Wall.prototype.getItem = function (i) {
        return this.items[i];
    };

    Wall.prototype.switch = function (el) {
        return this.close(function () {
            this.open(el, this.panel.offsetHeight);
        }.bind(this), this.panel.offsetHeight);
    };

    Wall.prototype.previous = function () {
        return this.change((this.openIndex - 1 < 0 ? this.items.length - 1 : this.openIndex - 1));
    };

    Wall.prototype.next = function () {
        return this.change((this.openIndex + 1 === this.items.length ? 0 : this.openIndex + 1));
    };

    Wall.prototype.close = function (cb, end, speed) {
        var endPoint = end || 0,
            currentTime = 0,
            panelStart = this.panel.offsetHeight,
            totalPanelChange = (end || 0) - panelStart,
            rowStart = this.elements[this.openIndex].offsetHeight,
            totalRowChange = totalPanelChange,
            duration = speed || 16,
            animateClosed = function () {
                currentTime++;
                this.panel.style.height = Math.easeInOutQuad(currentTime, panelStart, totalPanelChange, duration) + 'px';
                this.resizeRow(this.elements[this.openIndex], Math.easeInOutQuad(currentTime, rowStart, totalRowChange, duration) + 'px');
                if (currentTime < duration) {
                    window.requestAnimationFrame(animateClosed.bind(this));
                } else {
                    if (!end) { this.panel.style.height = 'auto'; }
                    this.panelInner.removeChild(this.panelContent);
                    this.element.classList.remove('js-is-animating');
                    this.element.classList.remove('js-wall--on');
                    this.openIndex = null;
                    if (!!cb && typeof cb === 'function') {
                        cb.call(this);
                    }
                }
            };
        STORM.UTILS.attributelist.toggle(this.panel, 'aria-hidden');
        STORM.UTILS.attributelist.toggle(this.items[this.openIndex].trigger, 'aria-expanded');
        this.element.classList.add('js-is-animating');
        animateClosed.call(this);
    };

    Wall.prototype.open = function (el, start, speed) {
        this.openIndex = el.index;
        this.setPanelTop();
        this.panelContent = el.child.firstElementChild.cloneNode(true);
        this.panelInner.appendChild(this.panelContent);
        this.panel.appendChild(this.panelInner);

        var currentTime = 0,
            panelStart = start || 0,
            totalPanelChange = this.panelInner.offsetHeight - panelStart,
            rowStart = this.closedHeight + panelStart,
            totalRowChange = totalPanelChange,
            duration = speed || 16,
            animateOpen = function () {
                currentTime++;
                this.panel.style.height = Math.easeInOutQuad(currentTime, panelStart, totalPanelChange, duration) + 'px';
                this.resizeRow(this.elements[this.openIndex], Math.easeInOutQuad(currentTime, rowStart, totalRowChange, duration) + 'px');
                if (currentTime < duration) {
                    window.requestAnimationFrame(animateOpen.bind(this));
                } else {
                    this.panel.style.height = 'auto';
                    if (!inView(this.panel, function () {
                        return {
                        l: 0,
                        t: 0,
                        b: (window.innerHeight || document.documentElement.clientHeight) - this.panel.offsetHeight,
                        r: (window.innerWidth || document.documentElement.clientWidth)
                    };
                    }.call(this))) {
                        scrollTo(this.panel.offsetTop - 120);
                    }
                }
            };

        this.element.classList.add('js-wall--on');
        STORM.UTILS.attributelist.toggle(this.panel, 'aria-hidden');
        STORM.UTILS.attributelist.toggle(el.trigger, 'aria-expanded');

        animateOpen.call(this);

        return this;
    };

    Wall.prototype.setPanelTop = function () {
        this.panel.style.top = this.elements[this.openIndex].offsetTop + this.elements[this.openIndex].offsetHeight - this.panel.offsetHeight + 'px';
        return this;
    };

    Wall.prototype.change = function (i) {
        var item = this.getItem(i);
        if (this.element.classList.contains('js-wall--on')) {
            if (this.openIndex === item.index) {
                this.close();
                return;
            }
            if (this.elements[this.openIndex].offsetTop === item.element.offsetTop) {
                this.switch(item);
            } else {
                this.close(function () {
                    this.open(item);
                }.bind(this));
            }

        } else {
            this.open(item);
        }

        return this;
    };

    Wall.prototype.resizeRow = function (el, h) {
        this.items.forEach(function (item) {
            if (item.element.offsetTop === el.offsetTop) {
                item.element.style.height = h;
            }
        });

        return this;
    };

    Wall.prototype.equalHeight = function (cb) {
        var openHeight = 0,
            closedHeight = 0;

        this.items.forEach(function (item) {
            if (this.openIndex !== null && item.element.offsetTop === this.elements[this.openIndex].offsetTop) {
                if (this.openIndex === item.index) {
                    item.element.style.height = 'auto';
                    openHeight = item.element.offsetHeight + this.panel.offsetHeight;
                }
            } else {
                item.element.style.height = 'auto';
                if (item.element.offsetHeight > closedHeight) {
                    closedHeight = item.element.offsetHeight;
                }
            }
        }.bind(this));

        this.openHeight = openHeight;
        this.closedHeight = closedHeight === 0 ? this.closedHeight : closedHeight;

        this.items.forEach(function (item) {
            if (this.openIndex !== item.index) {
                item.element.style.height = closedHeight + 'px';
            }
        }.bind(this));

        if (this.openHeight > 0) {
            this.resizeRow(this.getItem(this.openIndex).element, this.openHeight + 'px');
            if (!!cb) { cb(); }
        }
    };

    function init() {
        if (!document.querySelector('.js-wall')) {
            return;
        }
        return new Wall();
    }

    return {
        init: init
    };
}));