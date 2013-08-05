/* -------------------------------------
 *           LINKEDLIST CLASS           
 * -------------------------------------
 * Java LinkedList Class reverse 
 * engineering
 * Note: this version is a very basic
 * example made for work in this 
 * special use case and not really
 * useful in a production code. Not all 
 * java methods are available.
 */
define(function() {
    'use strict';

    function LinkedList() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    LinkedList.prototype = {

        add: function(arg1, arg2) {

            var current, i, node = {
                data: null,
                next: null,
                prev: null
            };

            // Appends the specified element to the end of this list.
            if (arg2 === undefined) {

                node.data = arg1;

                // LinkedList is empty
                if (this.length === 0) {

                    this.head = node;
                    this.tail = node;

                } else {

                    this.tail.next = node;
                    node.prev = this.tail;
                    this.tail = node;
                }

            this.length++;
            return true;

            //Inserts the specified element at the specified position in this list.
            } else {

                node.data = arg2;

                // check if index isn't out of bounds
                if (arg1 > -1 && arg1 <= this.length) {

                    // insert node at head
                    if (arg1 === 0) {

                        this.head.prev = node;
                        node.next = this.head;
                        this.head = node;

                    // insert node in body
                    } else if (arg1 < this.length ) { 

                        current = this.head;
                        i = 0;

                        while (i++ < arg1) {
                            current = current.next;
                        }

                        node.prev = current.prev;
                        node.next = current;
                        current.prev = node;
                        this.getNode(arg1 - 1).next = node;

                    // insert node at tail
                    } else {

                        this.tail.next = node;
                        node.prev = this.tail;
                        this.tail = node;
 
                    }
                }
            }

            this.length ++;
        },

        addFirst: function(data) {

            var node = {
                data: data,
                next: null,
                prev: null
            };

            if (this.length === 0) {
                this.add(data);
            } else {
                this.add(0, data);
            }

            //this.length++;
        },

        addLast: function(data) {

           var node = {
                data: data,
                next: null,
                prev: null
            };

            if (this.length === 0) {
                this.add(data);
            } else {
                this.add(this.length, data);
            }
        },

        getNode: function(index) {
            var current, i = 0;

            // check ouf of bounds index
            if (index > -1 && index < this.length) {

                current = this.head; 

                while (i++ < index) {
                    current = current.next;
                }

                return current; 
            } 
            // return null if the index is out of bounds
            else {
                return null;
            }
        }, 

        get: function(index) {

            var current, i = 0;

            // check ouf of bounds index
            if (index > -1 && index < this.length) {

                current = this.head; 

                while (i++ < index) {
                    current = current.next;
                }

                return current.data; 
            } 
            // return null if the index is out of bounds
            else {
                return null;
            }
        },

        getFirst: function() {
            return this.get(0);
        },

        getLast: function() {
            return this.get(this.size() - 1);
        },

        clear: function() {
            this.head = null;
            this.tail = null;
            this.length = 0;
        },

        size: function() {
            return this.length;
        }

    };

    return LinkedList;
});