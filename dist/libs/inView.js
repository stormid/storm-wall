/**
 * @name storm-wall: Interactive animating content wall
 * @version 1.2.0: Fri, 09 Mar 2018 17:46:23 GMT
 * @author stormid
 * @license MIT
 */
export default (element, view) => {
	let box = element.getBoundingClientRect();
	return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
};