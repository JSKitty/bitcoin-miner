'use strict';
const BTCMiner = require('.');
const MerkleTree = require('./src/merkletree');
const util = require('./src/util');
const chalk = require('chalk');

const testBlocks = [
	// Example Version 1 block:
	// Web Explorer:  https://insight.bitpay.com/block/0000000000000000e067a478024addfecdc93628978aa52d91fabd4292982a50
	// JSON download: https://insight.bitpay.com/api/block/0000000000000000e067a478024addfecdc93628978aa52d91fabd4292982a50
	{
		block: {
			version: 2,
			previousblockhash: '000000000000000117c80378b8da0e33559b5997f2ad55e2f7d18ec1975b9717',
			merkleroot: '871714dcbae6c8193a2bb9b2a69fe1c0440399f38d94b3a0f1b447275a29978a',
			time: 1392872245,
			bits: '19015f53'
		},
		initialNonce: 855500320 // Correct nonce will be:  856192328
	},
	// Example Version 02000000 block
	// Web Explorer:  https://insight.bitpay.com/block/000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943
	// JSON download: https://insight.bitpay.com/api/block/000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943
	{
		block: {
			version: 536870912,
			previousblockhash: '000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943',
			merkleroot: '871148c57dad60c0cde483233b099daa3e6492a91c13b337a5413a4c4f842978',
			time: 1515252561,
			bits: '180091c1',
			transactions: []
		},
		initialNonce: 45291990 // Correct nonce will be: 45291998
	},
	// Example 50,001 block
	// Web Explorer: https://blockchair.com/bitcoin/block/50001
	{
		block: {
			version: 1, // TODO: Load from getblocktemplate RPC
			previousblockhash: '000000001aeae195809d120b5d66a39c83eb48792e068f8ea1fea19d84a4278a', // TODO: Load from getblocktemplate RPC
			merkleroot: '',
			time: 1270917100, // TODO: Set to Date.now recursively (?)
			bits: '1c2a1115', // TODO: Load from getblocktemplate RPC (?)
			transactions: [
				{
					"raw": "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff080415112a1c02cc00ffffffff0100f2052a01000000434104c1b5671c8975087cc796d6ea73d2407591528b5c669106f9b6ab6ef6e373a57553e14866aaeffc44a9f58e5ee0c7faa7add7474f0a2c55a22cb40b949fdc933cac00000000",
					"txid": "e1882d41800d96d0fddc196cd8d3f0b45d65b030c652d97eaba79a1174e64d58",
					"hash": "e1882d41800d96d0fddc196cd8d3f0b45d65b030c652d97eaba79a1174e64d58",
					"version": 1,
					"size": 135,
					"vsize": 135,
					"weight": 540,
					"locktime": 0,
					"vin": [
						{
							"coinbase": "0415112a1c02cc00",
							"sequence": 4294967295
						}
					],
					"vout": [
						{
							"value": 50,
							"n": 0,
							"scriptPubKey": {
								"asm": "04c1b5671c8975087cc796d6ea73d2407591528b5c669106f9b6ab6ef6e373a57553e14866aaeffc44a9f58e5ee0c7faa7add7474f0a2c55a22cb40b949fdc933c OP_CHECKSIG",
								"hex": "4104c1b5671c8975087cc796d6ea73d2407591528b5c669106f9b6ab6ef6e373a57553e14866aaeffc44a9f58e5ee0c7faa7add7474f0a2c55a22cb40b949fdc933cac",
								"type": "pubkey"
							}
						}
					]
				},
				{
					"raw": "0100000002eaa6b49cd5b9393ec478df7b6baddaca9738686b07be605f05e57b750ad7a876000000004a493046022100e0bc99e312e428ea1559b5bc2e3210f3a7202a7f8b2ee124c6ea9aeda497ecac022100ccda2dc6aac965b4ba3116bc529838538ac0c99fe1a295941d00b5e351f86f0f01ffffffffc91489013f73209650e8b3e3bece46d78e678f02883c4b4e5f3540624c39d00d00000000494830450221008e991969e0ba7ddcb036c42286403ceb495f6654a13854b01f36fcedc373320d02206a7bb838a88350e492b5f4eecd6b060f5e50b0c76d2353857db97fb48e5d61bb01ffffffff0100e40b54020000001976a914b5cd7aaed869cd5ccb45868e8666e7e934a2373688ac00000000",
					"txid": "7940cdde4d713e171849efc6bd89939185be270266c94e92369e3877ad89455a",
					"hash": "7940cdde4d713e171849efc6bd89939185be270266c94e92369e3877ad89455a",
					"version": 1,
					"size": 273,
					"vsize": 273,
					"weight": 1092,
					"locktime": 0,
					"vin": [
						{
							"txid": "76a8d70a757be5055f60be076b683897cadaad6b7bdf78c43e39b9d59cb4a6ea",
							"vout": 0,
							"scriptSig": {
								"asm": "3046022100e0bc99e312e428ea1559b5bc2e3210f3a7202a7f8b2ee124c6ea9aeda497ecac022100ccda2dc6aac965b4ba3116bc529838538ac0c99fe1a295941d00b5e351f86f0f[ALL]",
								"hex": "493046022100e0bc99e312e428ea1559b5bc2e3210f3a7202a7f8b2ee124c6ea9aeda497ecac022100ccda2dc6aac965b4ba3116bc529838538ac0c99fe1a295941d00b5e351f86f0f01"
							},
							"sequence": 4294967295
						},
						{
							"txid": "0dd0394c6240355f4e4b3c88028f678ed746cebee3b3e8509620733f018914c9",
							"vout": 0,
							"scriptSig": {
								"asm": "30450221008e991969e0ba7ddcb036c42286403ceb495f6654a13854b01f36fcedc373320d02206a7bb838a88350e492b5f4eecd6b060f5e50b0c76d2353857db97fb48e5d61bb[ALL]",
								"hex": "4830450221008e991969e0ba7ddcb036c42286403ceb495f6654a13854b01f36fcedc373320d02206a7bb838a88350e492b5f4eecd6b060f5e50b0c76d2353857db97fb48e5d61bb01"
							},
							"sequence": 4294967295
						}
					],
					"vout": [
						{
							"value": 100,
							"n": 0,
							"scriptPubKey": {
								"asm": "OP_DUP OP_HASH160 b5cd7aaed869cd5ccb45868e8666e7e934a23736 OP_EQUALVERIFY OP_CHECKSIG",
								"hex": "76a914b5cd7aaed869cd5ccb45868e8666e7e934a2373688ac",
								"address": "1HaHTfmvoUW6i6nhJf8jJs6tU4cHNmBQHQ",
								"type": "pubkeyhash",
								"addresses": [
									"1HaHTfmvoUW6i6nhJf8jJs6tU4cHNmBQHQ"
								],
								"reqSigs": 1
							}
						}
					]
				},
				{
					"raw": "01000000011632b99d5e40fe3257f203d05c43542a8631ad09f7803b43f891f9892b52370d000000004948304502204066eef7b0f0b4869da7b841dbcde2279d0b787d7ea45d4b22ceb4d52474eb430221008ebf879fadadf71d426ed54d12fbb414ae63c8dc66b542ec186ec0208f0ae2ac01ffffffff0100f2052a010000001976a914b5cd7aaed869cd5ccb45868e8666e7e934a2373688ac00000000",
					"txid": "f84761459a00c6df3176ae5d94c99e69f25100d09548e5686bd0c354bb8cc60a",
					"hash": "f84761459a00c6df3176ae5d94c99e69f25100d09548e5686bd0c354bb8cc60a",
					"version": 1,
					"size": 158,
					"vsize": 158,
					"weight": 632,
					"locktime": 0,
					"vin": [
						{
							"txid": "0d37522b89f991f8433b80f709ad31862a54435cd003f25732fe405e9db93216",
							"vout": 0,
							"scriptSig": {
								"asm": "304502204066eef7b0f0b4869da7b841dbcde2279d0b787d7ea45d4b22ceb4d52474eb430221008ebf879fadadf71d426ed54d12fbb414ae63c8dc66b542ec186ec0208f0ae2ac[ALL]",
								"hex": "48304502204066eef7b0f0b4869da7b841dbcde2279d0b787d7ea45d4b22ceb4d52474eb430221008ebf879fadadf71d426ed54d12fbb414ae63c8dc66b542ec186ec0208f0ae2ac01"
							},
							"sequence": 4294967295
						}
					],
					"vout": [
						{
							"value": 50,
							"n": 0,
							"scriptPubKey": {
								"asm": "OP_DUP OP_HASH160 b5cd7aaed869cd5ccb45868e8666e7e934a23736 OP_EQUALVERIFY OP_CHECKSIG",
								"hex": "76a914b5cd7aaed869cd5ccb45868e8666e7e934a2373688ac",
								"address": "1HaHTfmvoUW6i6nhJf8jJs6tU4cHNmBQHQ",
								"type": "pubkeyhash",
								"addresses": [
									"1HaHTfmvoUW6i6nhJf8jJs6tU4cHNmBQHQ"
								],
								"reqSigs": 1
							}
						}
					]
				}
			]
		},
		initialNonce: 56010043 // Correct nonce will be: 56717043
	},
	// Example 721,386 block
	// Web Explorer:  https://blockchair.com/bitcoin/block/721386
	// Raw JSON View: https://learnmeabitcoin.com/explorer/block/json.php?hash=000000000000000000072f7aa71b04436897ee8e68e01bc94874fc111ee616fc
	{
		block: {
			version: 536870916,
			previousblockhash: '0000000000000000000904a7b01dd6662c0dd8107b8bb517a402fb88b78e0b8a',
			merkleroot: 'efcd701b329babb661999e8ab3000b04069d6bcf9581077e76358b6acc8f5e5c',
			time: 1643745961,
			bits: '170a9080',
			transactions: []
		},
		initialNonce: 3398504747 // Correct nonce will be: 3398594747
	}
];

const selectedBlock = 3;
const {block} = testBlocks[selectedBlock];
let nonce = testBlocks[selectedBlock].initialNonce;

// Process block data to produce necessary properties (merkles, etc)
if (block.transactions && block.transactions.length)
	block.merkleroot = new MerkleTree(block.transactions.map(a => a.txid || a.hash)).getRootHex();

const miner = new BTCMiner(block);

// Calculate the target based on current difficulty for this block (block.bits)
const target = miner.getTarget();
console.log('The target for this block is:');
console.log(target.toString('hex'));
console.log('The difficulty for this block is:');
console.log(miner.getDifficulty().toString());

console.log('\n[Start Mining with initial nonce:', nonce, ']');
const nStart = Date.now();
while (nonce < 8561950000) {
	if (miner.checkHash(miner.getHash(nonce))) {
		miner.verifyNonce(block, nonce);
		miner.progressReport();
		return console.log('Complete in ' + chalk.green(((Date.now() - nStart) / 1000) + 's'));
	} else if (nonce % 250000 === 0) {
		miner.progressReport();
	}
	nonce++;
}
