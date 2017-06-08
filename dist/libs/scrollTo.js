/**
 * @name storm-wall: Interactive animating content wall
 * @version 1.1.1: Thu, 08 Jun 2017 10:11:23 GMT
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