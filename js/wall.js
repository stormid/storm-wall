/**
 * @name map: StormID interactive wall
 * @version 0.1.0: 13/7/2015
 * @author mjbp
 * @license MIT
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Wall = factory();
  }
}(this, function() {
    'use strict';
    
    //Request animation polyfill
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    // easing functions http://goo.gl/5HLl8
    Math.easeInOutQuad = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t + b;
        }
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    Math.easeInCubic = function (t, b, c, d) {
        var tc = (t /= d) * t * t;
        return b + c * (tc);
    };

    Math.inOutQuintic = function (t, b, c, d) {
        var ts = (t /= d) * t,
        tc = ts * t;
        return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
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
            // increment the time
            currentTime += increment;
            // find the value with the quadratic in-out easing function
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            // move the document.body
            move(val);
            // do the animation unless its over
            if (currentTime < duration) {
                window.requestAnimationFrame(animateScroll);
            } else {
                if (callback && typeof (callback) === 'function') {
                    // the animation is done so lets callback
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
         return function() {
            var a = arguments,
                t = this,
                now = +(new Date()),
                exe = function() { 
                    last = now; 
                    fn.apply(t,a); 
                };
            window.clearTimeout(timeout);
            if(now >= last + ms) {
                exe();
            } else {
                timeout = window.setTimeout(exe, ms);
            }
        };
     }
    
    //Classname and attribute property utility functions
    var classlist = {
        add : function(el, c) {
            el.className = el.className + ' ' + c;
            return this;
        },
        remove: function(el, c) {
            var re = new RegExp("(^|\\s+)" + c + "(\\s+|$)");
            el.className = el.className.replace(re, ' ');
            return this;
        },
        has: function(el, c) {
            var re = new RegExp("(^|\\s+)" + c + "(\\s+|$)");
            return re.test(el.className);
        },
        toggle: function(el, c) {
            var re = new RegExp("(^|\\s+)" + c + "(\\s+|$)");

            if(classlist.has(el, c)) {
                classlist.remove(el, c);
            } else {
                el.className = el.className + ' ' + c;
            }
            return this;
        }
    },
    attributelist = {
        add: function(el, attrs) {
            for(var attr in attrs){
                el.setAttribute(attr, attrs[attr]);
            }
            return this;
         },
        toggle: function(el, attr) {
            el.setAttribute(attr, el.getAttribute(attr) === 'true' ? false : true);
            return this;
        }
    },
    classNames = {
        trigger: '.js-wall-trigger',
        child: '.js-wall-child'
    };
    
    //Wall item constructor
    function WallItem(el, parent, index) {
        this.index = index;
        this.element = el;
        this.trigger = el.querySelector(classNames.trigger);
        this.child = el.querySelector(classNames.child);
        this.throttledToggle = throttle(this.toggle, 750).bind(this);
    }
    
    WallItem.prototype.init = function(parent) {
        this.parent = parent;
        this.initButtons()
            .initListeners();
        
        return this;
    };
    
    WallItem.prototype.initButtons = function() {
        var templates = {
                close: '<button class="js-wall-button-close icon-cancel" aria-label="close"></button>',
                previous: '<button class="js-wall-button-previous icon-angle-left" aria-label="close"></button>',
                next: '<button class="js-wall-button-next icon-angle-right" aria-label="close"></button>'
            },
            controls = '';
        
        if(!!this.child){
            controls += templates.close;
            if(this.index !== 0) {
                controls += templates.previous;
            }
            if(this.index !== this.parent.elements.length - 1) {
                controls += templates.next;
            }
            this.child.innerHTML = controls + this.child.innerHTML;
        }
        return this;
    };
    
    WallItem.prototype.keyFinder = function(e) {
        var triggerKeys = [13, 32];
        
        if(triggerKeys.indexOf(e.keyCode) > -1) {
            e.preventDefault();
            this.throttledToggle.call(this);
        }
    };
    
    WallItem.prototype.initListeners = function() {
        var self = this;
        
        if(!!this.trigger) {
            this.trigger.addEventListener('click', this.throttledToggle.bind(this), false);
            this.trigger.addEventListener('keydown', function(e) {
                self.keyFinder.call(self, e);
            }, false);
        }
        if(!!this.child) {
            this.child.querySelector('.js-wall-button-close').addEventListener('click', this.throttledToggle.bind(this), false);
            if(this.index !== 0) {
                this.child.querySelector('.js-wall-button-previous').addEventListener('click', this.parent.items[this.index - 1].throttledToggle.bind(this.parent.items[this.index - 1]), false);
            }
            if(this.index !== this.parent.elements.length - 1) {
                this.child.querySelector('.js-wall-button-next').addEventListener('click', this.parent.items[this.index + 1].throttledToggle.bind(this.parent.items[this.index + 1]), false);
            }
        }
        return this;
    };
    
    WallItem.prototype.toggle = function() {
        var lastHeight = 0,
            heightCounter = 0,
            animateHeight = function(){
                this.parent.toggleRow(this.element, (+this.parent.heightClosed + this.child.offsetHeight +'px'));
                if (lastHeight === this.child.offsetHeight) {
                    heightCounter++;
                }
                if (heightCounter < 100) {
                    lastHeight = this.child.offsetHeight;
                    window.requestAnimationFrame(animateHeight.bind(this));
                }
            };
        //check if it has any content
        if(!this.child){ return; }
    
        
        attributelist.toggle(this.trigger, 'aria-expanded');
        attributelist.toggle(this.child, 'aria-hidden');

        if(!!this.parent.element.querySelector('.js-wall-item--on')){
            //if it's not this one that's open, close the other then open this
            if(this.parent.elements.indexOf(this.parent.element.querySelector('.js-wall-item--on')) !== this.index) {
                var current = this.parent.items[this.parent.elements.indexOf(this.parent.element.querySelector('.js-wall-item--on'))];
                current.toggle();
                
                //if on the same row...
                if(current.element.offsetTop === this.element.offsetTop) {
                    classlist.add(current.element, 'js-wall-permanent');
                    classlist.add(this.element, 'js-wall-permanent');
                    setTimeout(function(){
                        classlist.remove(current.element, 'js-wall-permanent');
                        classlist.remove(this.element, 'js-wall-permanent');
                    }.bind(this), 760);
                }
                
                setTimeout(function(){
                    this.toggle();
                }.bind(this), 500);
                
                return;
            }
            
            classlist.add(this.element, 'js-is-animating');
            
            setTimeout(function(){
                classlist.toggle(this.element, 'js-wall-item--on');
                classlist.remove(this.element, 'js-is-animating');
                this.element.style.height = this.parent.heightClosed + 'px';
                this.parent.toggleRow(this.element, this.parent.heightClosed + 'px');
            }.bind(this), 500);
            
        } else {
            scrollTo(this.element.offsetTop + 50, 260);
            classlist.toggle(this.element, 'js-wall-item--on');
            setTimeout(function(){
                window.requestAnimationFrame(animateHeight.bind(this));
            }.bind(this), 30);
        }
    };
    
    //Wall constructor
    function Wall() {
        var throttledResize = throttle(this.equalHeight, 60).bind(this);
        
        this.element = document.querySelector('.js-wall');
        this.elements = [].slice.call(this.element.querySelectorAll('.js-wall-item'));
        this.items = this.elements.map(function(el, index){
            return new WallItem(el, this, index);
        }.bind(this));
        
        this.items.forEach(function(i){
            i.init(this);
        }.bind(this));
        
        window.addEventListener('resize', throttledResize, false);
        
        this.equalHeight();
    }
    
    Wall.prototype.toggleRow = function(el, h){
        this.items.forEach(function(item){
            if(item.element.offsetTop === el.offsetTop){
                item.element.style.height = h;
            }
        });
    };
    
    Wall.prototype.equalHeight = function(){
        this.heightOpen = 0;
        this.heightClosed = 0;   
        
        this.items.forEach(function(item){
            if(classlist.has(item.element, '.js-wall-item--on')) {
                this.heightOpen = item.element.offsetHeight;
            } 
            if(classlist.has(item.element, '.js-wall-permanent')) {
                this.heightOpen = item.element.offsetHeight;
            } 
            else {
                item.element.style.height = 'auto';
                if(item.element.offsetHeight > this.heightClosed) {
                    this.heightClosed = item.element.offsetHeight;
                }
            }
        }.bind(this));
        
        this.items.forEach(function(item){
            if(!classlist.has(item.element, '.js-wall-item--on')) {
               item.element.style.height = this.heightClosed + 'px';
            }
        }.bind(this));
        
        //resize the row to the open element height
        if(this.heightOpen > 0) {
            this.toggleRow(this.element.querySelector('.js-wall-item--on'), this.heightOpen + 'px');
        }
    };
    
    function init(){
        if(!document.querySelector('.js-wall')){
            return;
        }
        return new Wall();
    }
    
    /* 
     * Add keyboard support
     * Previous/next buttons
     */
    
    return {
        init: init
    };
 }));