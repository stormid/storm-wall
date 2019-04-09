/**
 * @name storm-wall: Interactive animating content wall
 * @version 1.2.4: Tue, 09 Apr 2019 08:27:53 GMT
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