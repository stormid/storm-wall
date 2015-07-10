/*
 * An accessible vanilla js version of Gold Interactive's The Wall
 */

/* 
Calculate current index, number of items per row, height of the content to be displayed
Add margin-bottom to all items on current row

On resize recalculate current row
*/
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Wall = factory();
  }
}(this, function() {
    'use strict';
    
    
    function Wall() {
        this.element = document.querySelector('.js-wall');
        //this.items = [].slice.call(this.element.querySelectorAll('.js-wall-item'));
        this.items = [].slice.call(this.element.children);
        
        [].slice.call(this.element.querySelectorAll('.js-wall-item')).forEach(function(){
            
        });
    }
    
    Wall.prototype.listeners = function(){
        this.items.forEach(function(i){
            this.addEventListener('click', function(){
                console.log('this');
            }.bind(this), false);
        });
    };
    
    function init(){
        if(!document.querySelector('.js-wall')){
            throw new Error('StormWall error: no element');
        }
        return new Wall();
    }
    
    return {
        init: init
    };
 }));