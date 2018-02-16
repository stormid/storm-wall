/**
 * @name storm-wall: Interactive animating content wall
 * @version 1.1.5: Fri, 16 Feb 2018 10:53:46 GMT
 * @author stormid
 * @license MIT
 */
export default (element, view) => {
	let box = element.getBoundingClientRect();
	return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
};