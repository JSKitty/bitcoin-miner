'use strict';

// CS:GO is an awesome game btw
class StatTrak {
    constructor() {
        this.hashes = 0;
        this.startTime = Date.now();
    }

    addHashes = (n = new Number()) => this.hashes += n;
    getHashes = () => this.hashes;

    getElapsedTime = () => Date.now() - this.startTime;
}

module.exports = StatTrak;