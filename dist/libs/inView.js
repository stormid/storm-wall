/**
 * @name storm-wall: Interactive animating content wall
 * @version 1.1.2: Thu, 27 Jul 2017 16:11:13 GMT
 * @author stormid
 * @license MIT
 */
export default (element, view) => {
	let box = element.getBoundingClientRect();
	return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
};