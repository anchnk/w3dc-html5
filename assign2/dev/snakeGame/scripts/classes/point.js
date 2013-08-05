/* -------------------------------------
 *              POINT CLASS             
 * -------------------------------------
 * Java Point Class reverse engineering
 * Handles multiple constructors
 * Note: setLocation isn't overloaded 
 * with int or double
 */

define(function() {
    'use strict';

    function Point(arg1, arg2) {

        this.x = 0;
        this.y = 0;

        if (arguments.length === 0) {
            this.set(0, 0);
        } else if (arguments.length === 1) {
            this.set(arg1.x, arg1.y);
        } else {
            this.set(arg1, arg2);
        }
    }

    Point.prototype = {

        constructor: Point,

        equals: function(obj) {
            if (obj.hasOwnProperty('x') && obj.hasOwnProperty('y')) {
                if (obj.x === this.x && obj.y === this.y) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },

        set: function (x, y) {
            this.x = x;
            this.y = y;
        },

        getLocation: function () {
            return this;
        },

        getX: function () {
            return this.x;
        },

        getY: function () {
            return this.y;
        },

        move: function (x, y) {
            this.set(x, y);
        },

        setLocation: function (arg1, arg2) {
            if (arg2 === undefined) {
                this.set(arg1.getX(), arg1.getY());
            } else {
                this.set(arg1, arg2);
            }
        },

        toString: function () {
            var coords = [this.getX(), this.getY()];
            return coords.toString();
        },

        translate: function (dx, dy) {
            this.set(this.getX() + dx, this.getY() + dy);
        }
    };

    return Point;
});