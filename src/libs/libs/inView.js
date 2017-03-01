export default (element, view) => {
	let box = element.getBoundingClientRect();
	return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
};