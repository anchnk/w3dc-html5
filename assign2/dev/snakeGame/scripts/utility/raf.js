/* 
 * Michel Shim from course example
 * Have to check current state of polyfills.
 * Will do the job for this example.
 */
define(function() {
            window.requestAnimFrame = (function(callback){
            return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
        })();
        return window.requestAnimFrame;
});