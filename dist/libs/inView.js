/**
 * @name storm-wall: Interactive animating content wall
 * @version 1.2.4: Tue, 09 Apr 2019 08:27:53 GMT
 * @author stormid
 * @license MIT
 */
export default (element, view) => {
	let box = element.getBoundingClientRect();
	return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
};