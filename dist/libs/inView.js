/**
 * @name storm-wall: Interactive animating content wall
 * @version 1.1.1: Thu, 08 Jun 2017 10:11:23 GMT
 * @author stormid
 * @license MIT
 */
export default (element, view) => {
	let box = element.getBoundingClientRect();
	return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
};