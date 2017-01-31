/**
 * @name storm-wall: Interactive animating content wall
 * @version 0.3.0: Tue, 31 Jan 2017 18:17:04 GMT
 * @author stormid
 * @license MIT
 */
import throttle from 'lodash.throttle';

import scrollTo from './libs/scrollTo';
import inView from './libs/inView';
import easeInOutQuad from './libs/easeInOutQuad';

const defaults = {
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

const CONSTANTS = {
	ERRORS: {
		ROOT: 'Wall cannot be initialised, no trigger elements found',
		ITEM: 'Wall item cannot be found',
		TRIGGER: 'Wall trigger cannot be found'
	},
	KEYCODES: [13, 32],
	EVENTS: ['click', 'keydown']
};

const StormWall = {
	init(){
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
	initThrottled(){
		this.throttledResize = throttle(() => {
			this.equalHeight(this.setPanelTop.bind(this));
		}, 60);

		this.throttledChange = throttle(this.change, 100);
		this.throttledPrevious = throttle(this.previous, 100);
		this.throttledNext = throttle(this.next, 100);
	},
	initTriggers(){
		this.items.forEach((item, i) => {
			let trigger = item.node.querySelector(this.settings.classNames.trigger);
			if(!trigger) throw new Error(CONSTANTS.ERRORS.TRIGGER);

			CONSTANTS.EVENTS.forEach(ev => {
				trigger.addEventListener(ev, e => {
					if(e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
					this.throttledChange(i);
					e.preventDefault();
				});
			});
		});
	},
	initPanel(){
		let elementFactory = (element, className, attributes) => {
				let el = document.createElement(element);
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
	initButtons(){
		let buttonsTemplate = `<button class="${this.settings.classNames.closeButton.substr(1)}" aria-label="close">
								<svg fill="#000000" height="30" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
									<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
									<path d="M0 0h24v24H0z" fill="none"/>
								</svg>
							</button>
						 		<button class="${this.settings.classNames.previousButton.substr(1)}" aria-label="previous">
								 <svg fill="#000000" height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg">
										<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
										<path d="M0 0h24v24H0z" fill="none"/>
									</svg>
								</button>
						 		<button class="${this.settings.classNames.nextButton.substr(1)}" aria-label="next">
									<svg fill="#000000" height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg">
										<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
										<path d="M0 0h24v24H0z" fill="none"/>
									</svg>
								 </button>`;

		this.panel.innerHTML = `${this.panel.innerHTML}${buttonsTemplate}`;
			
		CONSTANTS.EVENTS.forEach(ev => {
			this.panel.querySelector(this.settings.classNames.closeButton).addEventListener(ev, e => {
				if(e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				this.close.call(this);
			});
			this.panel.querySelector(this.settings.classNames.previousButton).addEventListener(ev, e => {
				if(e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				this.throttledPrevious.call(this);
			});
			this.panel.querySelector(this.settings.classNames.nextButton).addEventListener(ev, e => {
				if(e.keyCode && !~CONSTANTS.KEYCODES.indexOf(e.keyCode)) return;
				this.throttledNext.call(this);
			});
		});
	},
	initItems(){
		let items = [].slice.call(this.node.querySelectorAll(this.settings.classNames.item));

		if(items.length === 0) throw new Error(CONSTANTS.ERRORS.ITEM);

		this.items = items.map(item => {
			return {
				node: item,
				content: item.querySelector(this.settings.classNames.content),
				trigger: item.querySelector(this.settings.classNames.trigger)
			};
		});

	},
	change(i){
		if(this.openIndex === false) return this.open(i);
		if(this.openIndex === i) return this.close();
		if (this.items[this.openIndex].node.offsetTop === this.items[i].node.offsetTop) this.close(() => this.open(i, this.panel.offsetHeight), this.panel.offsetHeight);
		else this.close(() => this.open(i));
	},
	open(i, start, speed){
		this.panelSourceContainer = this.items[i].content;
		this.openIndex = i;
		this.setPanelTop();
		this.panelContent = this.panelSourceContainer.firstElementChild.cloneNode(true);
		this.panelInner.appendChild(this.panelContent);
		this.panelSourceContainer.removeChild(this.panelSourceContainer.firstElementChild);
		this.panel.insertBefore(this.panelInner, this.panel.firstElementChild);

		let currentTime = 0,
			panelStart = start || 0,
			totalPanelChange = this.panelInner.offsetHeight - panelStart,
			rowStart = this.closedHeight + panelStart,
			totalRowChange = totalPanelChange,
			duration = speed || 16,
			animateOpen = () => {
				currentTime++;
				this.panel.style.height = easeInOutQuad(currentTime, panelStart, totalPanelChange, duration) + 'px';
				this.resizeRow(this.items[this.openIndex].node, easeInOutQuad(currentTime, rowStart, totalRowChange, duration) + 'px');
				if (currentTime < duration) window.requestAnimationFrame(animateOpen.bind(this));
				else {
					this.panel.style.height = 'auto';
					this.items[i].node.parentNode.insertBefore(this.panel, this.items[i].node.nextElementSibling);
					if (!inView(this.panel, () => {
						return {
							l: 0,
							t: 0,
							b: (window.innerHeight || document.documentElement.clientHeight) - this.panel.offsetHeight,
							r: (window.innerWidth || document.documentElement.clientWidth)
						};
					})) scrollTo(this.panel.offsetTop - 120);
				}
			};

		this.node.classList.add(this.settings.classNames.open.substr(1));

		this.panel.removeAttribute('aria-hidden');
		this.items[i].trigger.setAttribute('aria-expanded', true);

		animateOpen.call(this);

		return this;
	},
	close(cb, end, speed){
		let endPoint = end || 0,
			currentTime = 0,
			panelStart = this.panel.offsetHeight,
			totalPanelChange = endPoint - panelStart,
			rowStart = this.items[this.openIndex].node.offsetHeight,
			totalRowChange = totalPanelChange,
			duration = speed || 16,
			animateClosed = () => {
				currentTime++;
				this.panel.style.height = easeInOutQuad(currentTime, panelStart, totalPanelChange, duration) + 'px';
				this.resizeRow(this.items[this.openIndex].node, easeInOutQuad(currentTime, rowStart, totalRowChange, duration) + 'px');
				if (currentTime < duration) window.requestAnimationFrame(animateClosed.bind(this));
				else {
					if (!endPoint) this.panel.style.height = 'auto';
					this.panelInner.removeChild(this.panelContent);
					this.panelSourceContainer.appendChild(this.panelContent);
					this.node.classList.remove('js-is-animating');
					this.node.classList.remove('js-wall--on');
					this.openIndex = false;
					typeof cb === 'function' && cb();
				}
			};
		
		this.panel.setAttribute('aria-hidden', true);
		this.items[this.openIndex].trigger.setAttribute('aria-hidden', false);

		this.node.classList.add('js-is-animating');

		animateClosed.call(this);
	},
	previous() {
		return this.change((this.openIndex - 1 < 0 ? this.items.length - 1 : this.openIndex - 1));
	},
	next() {
		return this.change((this.openIndex + 1 === this.items.length ? 0 : this.openIndex + 1));
	},
	equalHeight(cb) {
		let openHeight = 0,
			closedHeight = 0;

		this.items.map((item, i) => {
			item.node.style.height = 'auto';
			if (this.openIndex !== false && item.node.offsetTop === this.items[this.openIndex].node.offsetTop) {
				if (this.openIndex === i) openHeight = item.node.offsetHeight + this.panel.offsetHeight;
			} else {
				if (item.node.offsetHeight > closedHeight) closedHeight = item.node.offsetHeight;
			}
			return item;
		}).map((item, i) => {
			if (this.openIndex !== i) item.node.style.height = closedHeight + 'px';
		});

		this.openHeight = openHeight;
		this.closedHeight = closedHeight === 0 ? this.closedHeight : closedHeight;

		if (this.openHeight > 0) {
			this.resizeRow(this.items[this.openIndex].node, this.openHeight + 'px');
			typeof cb === 'function' && cb();
		}
	},
	resizeRow(el, height){
		this.items.forEach(item => {
			if (item.node.offsetTop === el.offsetTop) item.node.style.height = height;
		});
		return this;
	},
	setPanelTop() {
		this.panel.style.top = `${this.items[this.openIndex].node.offsetTop + this.items[this.openIndex].trigger.offsetHeight}px`;
	}
};

const init = (sel, opts) => {
	let els = [].slice.call(document.querySelectorAll(sel));
	
	if(els.length === 0) throw new Error(CONSTANTS.ERRORS.ROOT);
	
	return els.map(el => {
		return Object.assign(Object.create(StormWall), {
			node: el,
			settings: Object.assign({}, defaults, opts)
		}).init();
	});
};
	
export default { init };