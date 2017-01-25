/**
 * @name storm-wall: Interactive animating content wall
 * @version 0.3.0: Wed, 25 Jan 2017 14:51:28 GMT
 * @author stormid
 * @license MIT
 */
export default (element, view) => {
	let box = element.getBoundingClientRect();
	return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
};