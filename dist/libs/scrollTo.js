/**
 * @name storm-wall: Interactive animating content wall
 * @version 0.3.0: Wed, 25 Jan 2017 14:51:28 GMT
 * @author stormid
 * @license MIT
 */
import easeInOutQuad from './easeInOutQuad';

const move = amount => {
	document.documentElement.scrollTop = amount;
	document.body.parentNode.scrollTop = amount;
	document.body.scrollTop = amount;
};

const position = () => document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;

export default (to, duration = 500, callback) => {
	let start = position(),
		change = to - start,
		currentTime = 0,
		increment = 20,
		animateScroll = () => {
			currentTime += increment;
			let val = easeInOutQuad(currentTime, start, change, duration);
			move(val);
			
			if (currentTime < duration)  window.requestAnimationFrame(animateScroll);
			else (callback && typeof (callback) === 'function') && callback();
		};
	animateScroll();
};