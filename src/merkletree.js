'use strict';

const { sha256 } = require('./hasher');
const util = require('./util');

const txToInt256LE = (tx) => {
    const bytes = new Array(32);
    for (var i = 0, j = 31, len = tx.length; i < len; i += 2, j--)
        bytes[j] = parseInt(tx[i] + tx[i + 1], 16);
    return Buffer.from(bytes);
};

class MerkleTree {
  constructor(transactions) {
    this.levels = [];
    this.merkleRoot = '';
    this.generateMerkleRoot(transactions);
  }

  generateMerkleRoot(transactions) {
    if (transactions.length === 0) return undefined;

    if (transactions.length === 1) return transactions[0];

    const transactionsIn256LE = transactions.map(txToInt256LE);

    // BFS to process transactions
    while (transactionsIn256LE.length > 1) {
      if ((transactionsIn256LE.length & 1) === 1)
        transactionsIn256LE.push(transactionsIn256LE[transactionsIn256LE.length - 1]);

      this.levels.push(transactionsIn256LE.slice());
      const size = transactionsIn256LE.length;
      for (let i = 1; i <= size; i += 2) {
        const hashLeftChild = transactionsIn256LE.shift();
        const hashRightChild = transactionsIn256LE.shift();

        const parent = sha256(sha256(Buffer.concat([hashLeftChild, hashRightChild])));
        transactionsIn256LE.push(parent);
      }
    }

    // Storing the last level(root) is redundant
    this.merkleRoot = util.reverseBuffer(transactionsIn256LE[0]);
  }

  getRoot = () => this.merkleRoot;

  getRootHex = () => Buffer.from(this.merkleRoot, 'ascii').toString('hex');

  getLevels = () => this.levels;

  getPath(tx) {
    const leaf = txToInt256LE(tx);
    let index = -1;
    for (let i = 0; i < this.levels[0].length; i++) {
      const bufferComparison = Buffer.compare(leaf, this.levels[0][i]);
      if (0 === bufferComparison) {
        index = i;
        break;
      }
    }

    if (index === -1) return [];

    const proof = [];

    for (let i = 0; i < this.levels.length; i++) {
      const isLeftNode = index % 2 === 0;
      const neededIdx = isLeftNode ? index + 1 : index - 1;

      if (neededIdx < this.levels[i].length) {
        const data = this.levels[i][neededIdx];
        const position = isLeftNode ? 'right' : 'left';
        proof.push({
          data,
          position,
        });
      }

      // set index to parent index
      index = (index / 2) | 0;
    }
    return proof;
  }

  verifyProof(proof, targetNode) {
    let currHash = Buffer.from(txToInt256LE(targetNode));

    for (let i = 0; i < proof.length; i++) {
      const nextNode = proof[i];
      const isNextNodeLeft = nextNode.position === 'left';

      const newNodeData = Buffer.from(nextNode.data);
      
      const pairOfHashes = [];
      if (isNextNodeLeft) {
        pairOfHashes.push(newNodeData);
        pairOfHashes.push(currHash);
      } else {
        pairOfHashes.push(currHash);
        pairOfHashes.push(newNodeData);
      }

      currHash = sha256(sha256(Buffer.concat(pairOfHashes)));
    }

    return this.merkleRoot === util.reverseBuffer(currHash);
  }
}

module.exports = MerkleTree;