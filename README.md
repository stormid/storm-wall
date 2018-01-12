# Storm Wall

[![Build Status](https://travis-ci.org/mjbp/storm-wall.svg?branch=master)](https://travis-ci.org/mjbp/storm-wall)
[![codecov.io](http://codecov.io/github/mjbp/storm-wall/coverage.svg?branch=master)](http://codecov.io/github/mjbp/storm-wall?branch=master)
[![npm version](https://badge.fury.io/js/storm-wall.svg)](https://badge.fury.io/js/storm-wall)

Interactive animating content wall, loosely based on the Google image search results animating content panels. Use with caution, not to be used on devices that cannot handle heavy UI repainting.
    
## Example
[https://mjbp.github.io/storm-wall](https://mjbp.github.io/storm-wall)

## Usage
HTML
```
<ul class="js-wall">
    <li class="js-wall-item">
        <div role="button" tabindex="0" aria-label="Read more" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-1">
            <img src="http://placehold.it/400x400"> 
        </div>
        <div class="js-wall-child" aria-hidden="true" id="wall-1" tabindex="-1">
            <div style="width:100%;height:250px;color:#ccc;background:red;"></div>
        </div>
    </li>
    <li class="js-wall-item">
        <div role="button" tabindex="0" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-2">
            <img src="http://placehold.it/400x400"> 
        </div>
        <div class="js-wall-child" id="wall-2" aria-hidden="true">
            <div style="width:100%;height:250px;color:#ccc;background:green;"></div>
        </div>
    </li>
    <li class="js-wall-item">
        <div role="button" tabindex="0" aria-label="Read more" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-3">
            <img src="http://placehold.it/400x400"> 
        </div>
        <div class="js-wall-child" aria-hidden="true" id="wall-3" tabindex="-1">
            <div style="width:100%;height:250px;color:#ccc;background:blue;"></div>
        </div>
    </li>
    <li class="js-wall-item">
        <div role="button" tabindex="0" aria-label="Read more" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-4">
            <img src="http://placehold.it/400x400"> 
        </div>
        <div class="js-wall-child" aria-hidden="true" id="wall-4" tabindex="-1">
            <div style="width:100%;height:250px;color:#ccc;background:yellow;"></div>
        </div>
    </li>
    <li class="js-wall-item">
        <div role="button" tabindex="0" aria-label="Read more" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-5">
            <img src="http://placehold.it/400x400"> 
        </div>
        <div class="js-wall-child" aria-hidden="true" id="wall-5" tabindex="-1">
            <div style="width:100%;height:250px;color:#ccc;background:orange;"></div>
        </div>
    </li>
    <li class="js-wall-item">
        <div role="button" tabindex="0" aria-label="Read more" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-6">
            <img src="http://placehold.it/400x400"> 
        </div>
        <div class="js-wall-child" aria-hidden="true" id="wall-6" tabindex="-1">
            <div style="width:100%;height:250px;color:#ccc;background:lightblue;"></div>
        </div>
    </li>
    <li class="js-wall-item">
        <div role="button" tabindex="0" aria-label="Read more" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-6">
            <img src="http://placehold.it/400x400"> 
        </div>
        <div class="js-wall-child" aria-hidden="true" id="wall-6" tabindex="-1">
            <div style="width:100%;height:250px;color:#ccc;background:brown;"></div>
        </div>
    </li>
    <li class="js-wall-item">
        <div role="button" tabindex="0" aria-label="Read more" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-6">
            <img src="http://placehold.it/400x400"> 
        </div>
        <div class="js-wall-child" aria-hidden="true" id="wall-6" tabindex="-1">
            <div style="width:100%;height:250px;color:#ccc;background:gold"></div>
        </div>
    </li>
    <li class="js-wall-item">
        <div role="button" tabindex="0" aria-label="Read more" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-6">
            <img src="http://placehold.it/400x400"> 
        </div>
        <div class="js-wall-child" aria-hidden="true" id="wall-6" tabindex="-1">
            <div style="width:100%;height:250px;color:#ccc;background:DarkViolet"></div>
        </div>
    </li>
    <li class="js-wall-item">
        <div role="button" tabindex="0" aria-label="Read more" class="js-wall-trigger" aria-expanded="false" aria-controls="wall-6">
            <img src="http://placehold.it/400x400"> 
        </div>
        <div class="js-wall-child" aria-hidden="true" id="wall-6" tabindex="-1">
            <div style="width:100%;height:250px;color:#ccc;background:DarkOliveGreen;"></div>
        </div>
    </li>
</ul>
```

JS
```
npm i -S storm-wall
```
either using es6 import
```
import Wall from 'storm-wall';

Wall.init('.js-wall');
```
aynchronous browser loading (use the .standalone version in the /dist folder)
```
import Load from 'storm-load';

Load('/content/js/async/storm-wall.standalone.js')
    .then(() => {
        StormWall.init('.js-wall');
    });
```
CSS
Sample minimum CSS required

```
.js-wall-item {
    will-change: height;
}
.js-wall-trigger {
    width:100%;
    display:block;
    cursor:pointer;
    background:transparent;
    text-align:left;
}
.js-wall-child {
    visibility: hidden;
    position: absolute;
    width: 1px;
    height: 1px;
    clip: rect(0 0 0 0); 
    overflow: hidden;
    border: 0;
    max-height:0;
    z-index: 2;
    background: #262626;
}
.js-wall-close,
.js-wall-previous,
.js-wall-next {
    position: absolute;
    font-size:2rem;
    color:#fff;
    cursor:pointer;
    top:100px;
    z-index:1;
}
.js-wall-close {
    top:20px;
    right:20px;
}
.js-wall-previous {
    left:30px;
}
.js-wall-next {
    right:30px;
}

.js-wall-panel {
    position: absolute;
    top:0;
    left:0;
    right:0;
    width:auto;
    background-color:#262626;
    clear:left;
    overflow:hidden;
    visibility: hidden;
}
.js-wall--is-open .js-wall-panel {
    visibility: visible;
    z-index:1;
}
.js-wall-panel-inner {
    opacity:0;
    will-change:opacity;
    transition:opacity 260ms ease;
}
.js-is-animating.js-wall--is-open .js-wall-panel-inner {
    opacity:0;
    transition:opacity 260ms ease;
}
.js-wall--is-open .js-wall-panel-inner {
    opacity:1;
}
```

## Options
```
{
    ready: '.js-wall--is-ready', //selector added when wall has loaded and is ready to use
    trigger: '.js-wall-trigger', //selector for each wall item trigger button
    item: '.js-wall-item', //selector for each wall item
    content: '.js-wall-child', //selector for each wall item content
    panel: '.js-wall-panel', //selector for each wall item generated content panel
    panelInner: '.js-wall-panel-inner', //selector for each wall item generated content panel inner
    open: '.js-wall--is-open', //className added to wall when it is open
    animating: '.js-wall--is-animating', //className added to wall when it is animating
    closeButton: '.js-wall-close', //panel close button selector
    nextButton: '.js-wall-next', //selector for panel next button to move to next item in series
    previousButton: '.js-wall-previous' //selector for panel previous button to move to previous item in series
}
```

## Tests
```
npm run test
```

## Browser support
This is module has both es6 and es5 distributions. The es6 version should be used in a workflow that transpiles.

The es5 version depends upon window.requestAnimationFrame, Object.assign, element.classList, and Promises so all evergreen browsers are supported out of the box, ie9+ is supported with polyfills. ie8+ will work with even more polyfils for Array functions and eventListeners.

## Dependencies
None external.

Imports lodash.throttle.

## License
MIT
