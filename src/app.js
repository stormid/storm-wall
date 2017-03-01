import Load from 'storm-load';

const onLoadTasks = [() => {

	Load('./js/storm-wall.standalone.js')
		.then(() => {
			StormWall.init('.js-wall');
		});
}];

if('addEventListener' in window) window.addEventListener('load', () => { onLoadTasks.forEach((fn) => fn()); });