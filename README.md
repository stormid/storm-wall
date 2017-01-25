#Storm Wall

[![Build Status](https://travis-ci.org/mjbp/storm-wall.svg?branch=master)](https://travis-ci.org/mjbp/storm-wall)
[![codecov.io](http://codecov.io/github/mjbp/storm-wall/coverage.svg?branch=master)](http://codecov.io/github/mjbp/storm-wall?branch=master)
[![npm version](https://badge.fury.io/js/storm-wall.svg)](https://badge.fury.io/js/storm-wall)

Interactive animating content wall, loosely based on Google image search results animating content panels.
    
##Example
[https://mjbp.github.io/storm-wall](https://mjbp.github.io/storm-wall)

##Usage
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

##Tests
```
npm run test
```

##Browser support
This is module has both es6 and es5 distributions. The es6 version should be used in a workflow that transpiles.

The es5 version depends unpon Object.assign, element.classList, and Promises so all evergreen browsers are supported out of the box, ie9+ is supported with polyfills. ie8+ will work with even more polyfils for Array functions and eventListeners.

##Dependencies
None

##License
MIT