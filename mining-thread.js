'use strict';
const { parentPort, workerData } = require("worker_threads");
const BTCMiner = require('./index');

// Load necessary mining data
const block = workerData.block; // Block data to hash
const jump = workerData.jump;   // Jump distance per-hash (5 = jump 5 nonces per-hash)
let nonce = workerData.nonce;   // Starting nonce
const id = workerData.id;

// Compute and setup the block miner thread in local buffer space (threads cannot transfer buffers)
const miner = new BTCMiner(block);

// Keep track of hashes so we can report only 'new' hashes to the Master process
let lastHashes = 0;
// Keep track of reporting times so we can consistently return performance updates
let nextReport = 5e5;

// Hash the block as fast as possible! If we hit the max nonce, then bail out.
while (nonce <= 4294967295) {
    // Compute the hash, then compare it against the block's target
    if (miner.checkHash(miner.getHash(nonce))) {
        // Hash is good! Post and shutdown thread early.
        parentPort.postMessage({'type': 2, 'nonce': nonce, 'worker': id});
    } else if (miner.stats.hashes >= nextReport) {
        // Hash no good! Report our hashrate performance anyway
        parentPort.postMessage({'type': 1, 'hashes': miner.stats.hashes - lastHashes, 'worker': id});
        lastHashes = miner.stats.hashes;
        nextReport = miner.stats.hashes + 5e5;
    }
    // Increment the nonce by the amount of threads
    nonce += jump;
}