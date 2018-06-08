/**
 * @name storm-wall: Interactive animating content wall
 * @version 1.2.3: Fri, 08 Jun 2018 16:17:49 GMT
 * @author stormid
 * @license MIT
 */
export default (element, view) => {
	let box = element.getBoundingClientRect();
	return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
};