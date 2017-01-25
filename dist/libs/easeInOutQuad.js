/**
 * @name storm-wall: Interactive animating content wall
 * @version 0.3.0: Wed, 25 Jan 2017 14:51:28 GMT
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