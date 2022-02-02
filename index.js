'use strict';
const hasher = require('./src/hasher');
const util = require('./src/util');
const chalk = require('chalk');
const BN = require('BigNumber.js');

const powLimit = 0x00000000FFFF0000000000000000000000000000000000000000000000000000;

class Miner {
	constructor(block) {
		// Initialize statistical variables for progress reports
		this.stats = {
			hashes: 0,
			timeSpentHashing: 0,
			timeSpentMisc: 0,
			timeSpentLogs: 0
		}

		// Initialize local variables with Block data
		const prevBlockHash = Buffer.from(block.previousblockhash, 'hex');
		const mrklRoot = Buffer.from(block.merkleroot, 'hex');
		const {time, version} = block;

		// Calculate target based on block's "bits",
		// The "bits" variable is a packed representation of the Difficulty in 8 bytes, to unpack it:
		// First two bytes make the "exponent", and the following 4 bytes make the "mantissa":
		// https://en.bitcoin.it/wiki/Difficulty#What_is_the_formula_for_difficulty
		const bits = parseInt('0x' + block.bits, 16);
		const exponent = bits >> 24;
		const mantissa = bits & 0xFFFFFF;
		this.ntarget = mantissa * (2 ** (8 * (exponent - 3)));
		const target = this.ntarget.toString('16');

		// Make target a Buffer object
		this.targetBuffer = Buffer.from('0'.repeat(64 - target.length) + target, 'hex');

		// Create little-endian long int (4 bytes) with the version (2) on the first byte
		this.versionBuffer = Buffer.alloc(4);
		this.versionBuffer.writeInt32LE(version, 0);

		// Reverse the previous Block Hash and the merkle_root
		this.reversedPrevBlockHash = this.reverseBuffer(prevBlockHash);
		this.reversedMrklRoot = this.reverseBuffer(mrklRoot);

		// Buffer with time (4 Bytes), bits (4 Bytes) and nonce (4 Bytes) (later added and updated on each hash)
		this.timeBitsNonceBuffer = Buffer.alloc(12);
		this.timeBitsNonceBuffer.writeInt32LE(time, 0);
		this.timeBitsNonceBuffer.writeInt32LE(bits, 4);
	}

	reverseBuffer(src) {
		const timeStarted = Date.now();
		const buffer = util.reverseBuffer(src);
		this.stats.timeSpentMisc += Date.now() - timeStarted;
		return buffer;
	}

	getHash(nonce) {
		const timeStarted = Date.now();
		// Update nonce in header Buffer
		this.timeBitsNonceBuffer.writeUint32LE(nonce, 8);

		// Double sha256 hash the header
		const hash = this.reverseBuffer(hasher.sha256d(Buffer.concat([this.versionBuffer, this.reversedPrevBlockHash, this.reversedMrklRoot, this.timeBitsNonceBuffer])));
		this.stats.hashes++;
		this.stats.timeSpentHashing += Date.now() - timeStarted;
		return hash;
	}

	progressReport(h, t) {
		const timeStarted = Date.now();
		console.log('\n[Progress Report]');
		const strHashes = (h || this.stats.hashes ).toLocaleString('en-gb');
		console.log('Hashes: ' + strHashes);
		console.log(util.prettyHashrate(this.getHashrate(h, t)));
		console.log('Est:    ' + util.prettyHitEst(this.getEstimateHitTime(h, t)));
		if (!h && !t) console.log('Timing: ' + chalk.yellow('misc ' + this.stats.timeSpentMisc.toFixed(0) + ' ms') + ' ' + chalk.cyanBright('hashing ' + this.stats.timeSpentHashing.toFixed(0) + ' ms') + ' ' + chalk.blue('logs ' + this.stats.timeSpentLogs.toFixed(0) + 'ms') + ' ' + chalk.red('total ' + (this.stats.timeSpentHashing + this.stats.timeSpentMisc).toFixed(0) + ' ms'));
		this.stats.timeSpentLogs += Date.now() - timeStarted;
	}

	verifyNonce(block, checknonce) {
		// This is a (maybe easier) way to build the header from scratch, it should generate the same hash:
		console.log(`\n[Verify Nonce ${checknonce} ${checknonce.toString(16)}]`);
		const version = util.reverseString(block.version.toString(16));
		const prevhash = util.reverseString(block.previousblockhash);
		const merkleroot = util.reverseString(block.merkleroot);
		const nbits = util.reverseString(block.bits);
		const ntime = util.reverseString(block.time.toString(16));
		const nonce = util.reverseString(checknonce.toString(16));

		console.log('        ', chalk.gray('version') + ' '.repeat(version.length - 7) + chalk.cyanBright('prevhash') + ' '.repeat(prevhash.length - 8) + chalk.blue('merkleroot') + ' '.repeat(prevhash.length - 10) + chalk.magenta('ntime') + ' '.repeat(ntime.length - 5) + chalk.cyan('nbits') + ' '.repeat(nbits.length - 5) + chalk.yellow('nonce'));
		console.log('Header: ', chalk.gray(version) + chalk.cyanBright(prevhash) + chalk.blue(merkleroot) + chalk.magenta(ntime) + chalk.cyan(nbits) + chalk.yellow(nonce));

		const header = version + prevhash + merkleroot + ntime + nbits + nonce;
		const hash = util.reverseString(hasher.sha256d(Buffer.from(header, 'hex')));
		console.log('Target: ', this.getTarget().toString('hex'));
		console.log('Hash:   ', hash.toString('hex'));

		const isvalid = this.getTarget().toString('hex') > hash;
		const result = isvalid ? 'valid' : 'not a valid';
		const color = isvalid ? chalk.green : chalk.red;
		console.log('Result: ', color(`${checknonce} is a ${result} nonce`));
		return isvalid;
	}

	getTarget = () => this.targetBuffer;

	getDifficulty = () => BN(powLimit).dividedBy(BN(this.ntarget));

	getHashrate = (h, t) => (((h || this.stats.hashes) / (t || this.stats.timeSpentHashing)) * 1000);

	getEstimateHitTime = (h, t) => Number(this.getDifficulty().multipliedBy(BN(2).exponentiatedBy(32)).dividedBy(this.getHashrate(h, t)).toString());

	checkHash = (h) => Buffer.compare(this.getTarget(), h) > 0;
}

module.exports = Miner;
