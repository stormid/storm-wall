import Wall from './libs/storm-wall';

const onLoadTasks = [() => {
	Wall.init('.js-wall');
	
	// Load('./js/storm-wall.standalone.js')
	// 	.then(() => {
	// 		StormWall.init('.js-wall');
	// 	});
}];

if('addEventListener' in window) window.addEventListener('load', () => { onLoadTasks.forEach((fn) => fn()); });