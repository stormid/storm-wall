import Wall from './libs/storm-wall';

const onLoadTasks = [() => {
	let wall = Wall.init('.js-wall');
	console.log(wall);
}];
    
if('addEventListener' in window) window.addEventListener('load', () => { onLoadTasks.forEach((fn) => fn()); });