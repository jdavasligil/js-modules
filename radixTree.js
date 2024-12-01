/**
 * @fileoverview Provides an implementation of the radix tree data structure.
 * @author J. Davasligil <jdavasligil.dev@proton.me>
 * @version 1.0.0
 *
 * @license MIT No Attribution
 * @copyright Copyright 2024 github.com/jdavasligil
 */

/** RadixNode represents a node in the radix tree. */
class RadixNode {

  /**
   * Creates a new RadixNode.
   * @param {string} edgeLabel
   * @param {boolean} isWord
   */
  constructor(edgeLabel, isWord=false) {
    /**
     * edgeLabel represents the prefix substring required to reach this node.
     * @property {string} edgeLabel
     * @public
     */
    this.edgeLabel = edgeLabel;

    /**
     * children is an object which maps prefixes to RadixNodes.
     * @property {Object.<string, RadixNode>} children
     * @public
     */
    this.children = {};

    /**
     * isWord is used to check if the node is terminal.
     * @property {boolean} isWord
     * @public
     */
    this.isWord = isWord;
  }

  /** 
   * List of words found by the prefix search.
   * @public
   */
  static searchList = [];

  /**
   * Find the largest common prefix between two strings.
   * @param {string} a
   * @param {string} b
   * @returns {string}
   * @private
   */
  static largestCommonPrefix(a, b) {
    let commonPrefix = '';

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] !== b[i]) {
        return commonPrefix;
      }

      commonPrefix += a[i];
    }

    return commonPrefix;
  }

  /**
   * Insert a word into the tree recursively.
   * @param {string} word
   * @public
   */
  insert(word) {

    // Base Case 1: The word is the prefix of the node.
    // Result: Set the node as the leaf.
    if (this.edgeLabel === word && !this.isWord) {
      this.isWord = true;
      return;
    }

    const wordChar = word[0];

    // Base Case 2: The node has no edges containing a prefix to the word.
    // Result: Attach a new node containing the word to the current one.
    if (!(wordChar in this.children)) {
      this.children[wordChar] = new RadixNode(word, true);
      return;
    }

    // The node must have an edge containing a prefix to the word by now.
    const incomingNode = this.children[wordChar];
    const prefix = incomingNode.edgeLabel;
    const commonPrefix = RadixNode.largestCommonPrefix(prefix, word);
    const commonPrefixChar = commonPrefix[0];
    const remainingPrefix = prefix.substring(commonPrefix.length);
    const remainingWord = word.substring(commonPrefix.length);

    // Case 1: The node prefix is equal to the common prefix
    // Result: Insert the remaining word on the next node
    if (remainingPrefix === '') {
      this.children[commonPrefixChar].insert(remainingWord);
    }

    // Case 2: The word is greater than or equal to the common prefix.
    // Result: Create a node in the middle of both nodes. Change prefixes
    // and add the new node for the remaining word.
    else {
      incomingNode.edgeLabel = remainingPrefix;

      const tmpNode = this.children[commonPrefixChar];
      this.children[commonPrefixChar] = new RadixNode(commonPrefix, false);
      this.children[commonPrefixChar].children[remainingPrefix[0]] = tmpNode;

      if (remainingWord === '') {
        this.children[commonPrefixChar].isWord = true;
      } else {
        this.children[commonPrefixChar].insert(remainingWord);
      }
    }
  }

  /**
   * Recursively search for the list of words matching a given prefix.
   * @param {string} prefix
   * @returns {Array.<string>}
   * @public
   */
  search(prefix, word = '') {
    word += this.edgeLabel;
    prefix = prefix.substring(this.edgeLabel.length);

    if (this.isWord && word.includes(prefix)) {
      RadixNode.searchList.push(word);
    }

    if (prefix !== '') {
      if (!(prefix[0] in this.children)) {
        return;
      }
      this.children[prefix[0]].search(prefix, word);
    } else {
      for (const node of Object.values(this.children)) {
        node.search('', word);
      }
    }
  }

  /**
   * Recursively print out the tree.
   * @param {int} height
   * @public
   */
  print(height = 0) {
    if (this.edgeLabel !== 0) {
      console.log('-'.repeat(height), this.edgeLabel, this.isWord ? " (leaf)" : '');
    }

    for (const node of Object.values(this.children)) {
      node.print(height + 1);
    }
  }
}


/** RadixTree represents a radix tree (compressed trie). */
export class RadixTree {

  /** Creates a new RadixTree. */
  constructor() {
    /**
     * root is the root node for the tree.
     * @property {RadixNode} root
     * @private
     */
    this.root = new RadixNode('');
  }

  /**
   * Insert a word into the tree.
   * @param {string} word
   * @public
   */
  insert(word) {
    this.root.insert(word);
  }

  /**
   * Search for the list of words matching a given prefix.
   * @param {string} prefix
   * @returns {Array.<string>}
   * @public
   */
  search(prefix) {
    const words = [];

    this.root.search(prefix);

    while (RadixNode.searchList.length > 0) {
      words.push(RadixNode.searchList.pop());
    }

    return words;
  }

  /**
   * Print out the tree.
   * @public
   */
  print() {
    this.root.print();
  }
}


// UNIT TESTS
console.log('[TESTING]\n');

let rt = new RadixTree();

const words = [
  'romane',
  'romanus',
  'romulus',
  'rubens',
  'ruber',
  'rubicon',
  'rubicundus',
];

const tests = [
  {'prefix': 'r', 'expected': words},
  {'prefix': 'ro', 'expected': words.slice(0,3)},
  {'prefix': 'ru', 'expected': words.slice(3)},
  {'prefix': 'rubi', 'expected': words.slice(5)},
];

for (const word of words) {
  rt.insert(word);
}

console.log('Radix Tree:');
rt.print();

console.log('\n');

let successCount = 0;
for (let i = 0; i < tests.length; i++) {
  const test = tests[i];
  const prefix = test['prefix'];
  const expected = JSON.stringify(test['expected'].sort());
  const got = JSON.stringify(rt.search(prefix).sort());

  if (expected !== got) {
    console.log(`Test ${i} Failed:`);
    console.log(`\tExp: ${expected}`);
    console.log(`\tGot: ${got}`);
  } else {
    successCount += 1;
  }
}
console.log(`[${successCount}/${tests.length} TESTS SUCCEEDED]`);
