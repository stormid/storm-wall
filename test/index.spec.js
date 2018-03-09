import should from 'should';
import Wall from '../dist/storm-wall.standalone';
import 'jsdom-global/register';

var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
								|| window[vendors[x]+'CancelRequestAnimationFrame'];
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

const html = `<ul class="js-wall">
            <li class="js-wall-item">
                <div role="button" tabindex="0" aria-label="Read more" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-1">
                    <img src="http://placehold.it/400x400"> 
                </div>
                <div class="js-wall-child" aria-hidden="true" id="wall-1" tabindex="-1">
                    <div style="width:100%;height:250px;color:#ccc;background:red;"></div>
                </div>
            </li>
            <li class="js-wall-item">
                <div role="button" tabindex="0" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-2">
                    <img src="http://placehold.it/400x400"> 
                </div>
                <div class="js-wall-child" id="wall-2" aria-hidden="true">
                    <div style="width:100%;height:250px;color:#ccc;background:green;"></div>
                </div>
            </li>
		</ul>`;

document.body.innerHTML = html;

let WallItem = Wall.init('.js-wall');


describe('Initialisation', () => {
	it('should return an object with the correct properties', () => {
		should(WallItem)
			.Array()
			.and.have.lengthOf(1);
	});

	it('should throw an error if no walls are found', () => {
		Wall.init.bind(Wall, '.js-err').should.throw();
	});

	//To do - testable assertions
	//Shoud be re-written for async
	it('should attach the handleClick eventListener to DOMElement click event to toggle documentElement aria', () => {
		WallItem[0].items[0].trigger.click();
		document.querySelector(WallItem[0].settings.classNames.nextButton).click();
		document.querySelector(WallItem[0].settings.classNames.previousButton).click();
		document.querySelector(WallItem[0].settings.classNames.closeButton).click();
		window.setTimeout(() => { 
			
			should(WallItem[0].items[0].trigger.getAttribute('aria-expanded')).equal('true');
			
			WallItem[0].items[1].trigger.click();
			document.querySelector(WallItem[0].settings.classNames.nextButton).click();
			document.querySelector(WallItem[0].settings.classNames.previousButton).click();
			document.querySelector(WallItem[0].settings.classNames.closeButton).click();
		
		}, 0);
	});
});


//To do - testable assertions
describe('Keyboard interaction', () => {
	
	it('should attach keydown eventListener to each toggler', () => {

		//not a trigger
		WallItem[0].items[0].trigger.dispatchEvent(
			new window.KeyboardEvent('keydown', { 
				code : 33,
				keyCode: 33
			})
		);
		should(WallItem[0].items[0].trigger.getAttribute('aria-expanded')).equal('false');

		//trigger
		WallItem[0].items[0].trigger.dispatchEvent(
			new window.KeyboardEvent('keydown', { 
				code : 32,
				keyCode: 32
			})
		);
		window.setTimeout(() => { 
			should(WallItem[0].items[0].trigger.getAttribute('aria-expanded')).equal('true');
		}, 0);
		
	});
});

describe('API', () => {

	it('should open a panel when change is invoked', () => {
		WallItem[0].openIndex = false;
		WallItem[0].change[3];
		window.setTimeout(() => { 
			should(WallItem[0].items[3].trigger.getAttribute('aria-expanded')).equal('true');
		}, 0);
		WallItem[0].change[3];

		//Multiple nested async events are not testable using this method...
		WallItem[0].previous();
		WallItem[0].next();
	});
	
});