'use strict';
const sha = require('sha.js').sha256;

// Single SHA256 round
const sha256 = (b) => (new sha).update(b).digest();

// Double SHA256 round
const sha256d = (b) => sha256(sha256(b));

module.exports = {
    sha256,
    sha256d
}