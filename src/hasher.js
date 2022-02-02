'use strict';

// Single SHA256 round
const sha256 = require('@noble/hashes/sha256').sha256;

// Double SHA256 round
const sha256d = (b) => sha256(sha256(b));

module.exports = {
    sha256,
    sha256d
}