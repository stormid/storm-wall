/**
 * @name storm-wall: Interactive animating content wall
 * @version 1.1.5: Fri, 16 Feb 2018 10:53:46 GMT
 * @author stormid
 * @license MIT
 */
//http://goo.gl/5HLl8
export default (t, b, c, d) => {
	t /= d / 2;
	if (t < 1) {
		return c / 2 * t * t + b;
	}
	t--;
	return -c / 2 * (t * (t - 2) - 1) + b;
};