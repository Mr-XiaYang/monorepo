'use strict';

var Fastify = require('fastify');
var FastifyPlugin = require('fastify-plugin');
var fastifySwagger = require('@fastify/swagger');
var fastifyWebsocket = require('@fastify/websocket');
var typebox = require('@sinclair/typebox');
var client = require('@redis/client');
var pino = require('pino');
var pinoPretty = require('pino-pretty');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Fastify__default = /*#__PURE__*/_interopDefaultLegacy(Fastify);
var FastifyPlugin__default = /*#__PURE__*/_interopDefaultLegacy(FastifyPlugin);
var fastifySwagger__default = /*#__PURE__*/_interopDefaultLegacy(fastifySwagger);
var fastifyWebsocket__default = /*#__PURE__*/_interopDefaultLegacy(fastifyWebsocket);
var pino__default = /*#__PURE__*/_interopDefaultLegacy(pino);
var pinoPretty__default = /*#__PURE__*/_interopDefaultLegacy(pinoPretty);

var vary = {};

var support$1 = {};

support$1.ARRAY_BUFFER_SUPPORT = typeof ArrayBuffer !== 'undefined';
support$1.SYMBOL_SUPPORT = typeof Symbol !== 'undefined';

var support = support$1;

var ARRAY_BUFFER_SUPPORT = support.ARRAY_BUFFER_SUPPORT;
var SYMBOL_SUPPORT = support.SYMBOL_SUPPORT;

/**
 * Function able to iterate over almost any iterable JS value.
 *
 * @param  {any}      iterable - Iterable value.
 * @param  {function} callback - Callback function.
 */
var foreach = function forEach(iterable, callback) {
  var iterator, k, i, l, s;

  if (!iterable) throw new Error('obliterator/forEach: invalid iterable.');

  if (typeof callback !== 'function')
    throw new Error('obliterator/forEach: expecting a callback.');

  // The target is an array or a string or function arguments
  if (
    Array.isArray(iterable) ||
    (ARRAY_BUFFER_SUPPORT && ArrayBuffer.isView(iterable)) ||
    typeof iterable === 'string' ||
    iterable.toString() === '[object Arguments]'
  ) {
    for (i = 0, l = iterable.length; i < l; i++) callback(iterable[i], i);
    return;
  }

  // The target has a #.forEach method
  if (typeof iterable.forEach === 'function') {
    iterable.forEach(callback);
    return;
  }

  // The target is iterable
  if (
    SYMBOL_SUPPORT &&
    Symbol.iterator in iterable &&
    typeof iterable.next !== 'function'
  ) {
    iterable = iterable[Symbol.iterator]();
  }

  // The target is an iterator
  if (typeof iterable.next === 'function') {
    iterator = iterable;
    i = 0;

    while (((s = iterator.next()), s.done !== true)) {
      callback(s.value, i);
      i++;
    }

    return;
  }

  // The target is a plain object
  for (k in iterable) {
    if (iterable.hasOwnProperty(k)) {
      callback(iterable[k], k);
    }
  }

  return;
};

var comparators$3 = {};

var DEFAULT_COMPARATOR$3 = function(a, b) {
  if (a < b)
    return -1;
  if (a > b)
    return 1;

  return 0;
};

var DEFAULT_REVERSE_COMPARATOR = function(a, b) {
  if (a < b)
    return 1;
  if (a > b)
    return -1;

  return 0;
};

/**
 * Function used to reverse a comparator.
 */
function reverseComparator$3(comparator) {
  return function(a, b) {
    return comparator(b, a);
  };
}

/**
 * Function returning a tuple comparator.
 */
function createTupleComparator$1(size) {
  if (size === 2) {
    return function(a, b) {
      if (a[0] < b[0])
        return -1;

      if (a[0] > b[0])
        return 1;

      if (a[1] < b[1])
        return -1;

      if (a[1] > b[1])
        return 1;

      return 0;
    };
  }

  return function(a, b) {
    var i = 0;

    while (i < size) {
      if (a[i] < b[i])
        return -1;

      if (a[i] > b[i])
        return 1;

      i++;
    }

    return 0;
  };
}

/**
 * Exporting.
 */
comparators$3.DEFAULT_COMPARATOR = DEFAULT_COMPARATOR$3;
comparators$3.DEFAULT_REVERSE_COMPARATOR = DEFAULT_REVERSE_COMPARATOR;
comparators$3.reverseComparator = reverseComparator$3;
comparators$3.createTupleComparator = createTupleComparator$1;

var iterables$c = {};

var typedArrays = {};

(function (exports) {
	/**
	 * When using an unsigned integer array to store pointers, one might want to
	 * choose the optimal word size in regards to the actual numbers of pointers
	 * to store.
	 *
	 * This helpers does just that.
	 *
	 * @param  {number} size - Expected size of the array to map.
	 * @return {TypedArray}
	 */
	var MAX_8BIT_INTEGER = Math.pow(2, 8) - 1,
	    MAX_16BIT_INTEGER = Math.pow(2, 16) - 1,
	    MAX_32BIT_INTEGER = Math.pow(2, 32) - 1;

	var MAX_SIGNED_8BIT_INTEGER = Math.pow(2, 7) - 1,
	    MAX_SIGNED_16BIT_INTEGER = Math.pow(2, 15) - 1,
	    MAX_SIGNED_32BIT_INTEGER = Math.pow(2, 31) - 1;

	exports.getPointerArray = function(size) {
	  var maxIndex = size - 1;

	  if (maxIndex <= MAX_8BIT_INTEGER)
	    return Uint8Array;

	  if (maxIndex <= MAX_16BIT_INTEGER)
	    return Uint16Array;

	  if (maxIndex <= MAX_32BIT_INTEGER)
	    return Uint32Array;

	  throw new Error('mnemonist: Pointer Array of size > 4294967295 is not supported.');
	};

	exports.getSignedPointerArray = function(size) {
	  var maxIndex = size - 1;

	  if (maxIndex <= MAX_SIGNED_8BIT_INTEGER)
	    return Int8Array;

	  if (maxIndex <= MAX_SIGNED_16BIT_INTEGER)
	    return Int16Array;

	  if (maxIndex <= MAX_SIGNED_32BIT_INTEGER)
	    return Int32Array;

	  return Float64Array;
	};

	/**
	 * Function returning the minimal type able to represent the given number.
	 *
	 * @param  {number} value - Value to test.
	 * @return {TypedArrayClass}
	 */
	exports.getNumberType = function(value) {

	  // <= 32 bits itnteger?
	  if (value === (value | 0)) {

	    // Negative
	    if (Math.sign(value) === -1) {
	      if (value <= 127 && value >= -128)
	        return Int8Array;

	      if (value <= 32767 && value >= -32768)
	        return Int16Array;

	      return Int32Array;
	    }
	    else {

	      if (value <= 255)
	        return Uint8Array;

	      if (value <= 65535)
	        return Uint16Array;

	      return Uint32Array;
	    }
	  }

	  // 53 bits integer & floats
	  // NOTE: it's kinda hard to tell whether we could use 32bits or not...
	  return Float64Array;
	};

	/**
	 * Function returning the minimal type able to represent the given array
	 * of JavaScript numbers.
	 *
	 * @param  {array}    array  - Array to represent.
	 * @param  {function} getter - Optional getter.
	 * @return {TypedArrayClass}
	 */
	var TYPE_PRIORITY = {
	  Uint8Array: 1,
	  Int8Array: 2,
	  Uint16Array: 3,
	  Int16Array: 4,
	  Uint32Array: 5,
	  Int32Array: 6,
	  Float32Array: 7,
	  Float64Array: 8
	};

	// TODO: make this a one-shot for one value
	exports.getMinimalRepresentation = function(array, getter) {
	  var maxType = null,
	      maxPriority = 0,
	      p,
	      t,
	      v,
	      i,
	      l;

	  for (i = 0, l = array.length; i < l; i++) {
	    v = getter ? getter(array[i]) : array[i];
	    t = exports.getNumberType(v);
	    p = TYPE_PRIORITY[t.name];

	    if (p > maxPriority) {
	      maxPriority = p;
	      maxType = t;
	    }
	  }

	  return maxType;
	};

	/**
	 * Function returning whether the given value is a typed array.
	 *
	 * @param  {any} value - Value to test.
	 * @return {boolean}
	 */
	exports.isTypedArray = function(value) {
	  return typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(value);
	};

	/**
	 * Function used to concat byte arrays.
	 *
	 * @param  {...ByteArray}
	 * @return {ByteArray}
	 */
	exports.concat = function() {
	  var length = 0,
	      i,
	      o,
	      l;

	  for (i = 0, l = arguments.length; i < l; i++)
	    length += arguments[i].length;

	  var array = new (arguments[0].constructor)(length);

	  for (i = 0, o = 0; i < l; i++) {
	    array.set(arguments[i], o);
	    o += arguments[i].length;
	  }

	  return array;
	};

	/**
	 * Function used to initialize a byte array of indices.
	 *
	 * @param  {number}    length - Length of target.
	 * @return {ByteArray}
	 */
	exports.indices = function(length) {
	  var PointerArray = exports.getPointerArray(length);

	  var array = new PointerArray(length);

	  for (var i = 0; i < length; i++)
	    array[i] = i;

	  return array;
	};
} (typedArrays));

var forEach$m = foreach;

var typed$8 = typedArrays;

/**
 * Function used to determine whether the given object supports array-like
 * random access.
 *
 * @param  {any} target - Target object.
 * @return {boolean}
 */
function isArrayLike(target) {
  return Array.isArray(target) || typed$8.isTypedArray(target);
}

/**
 * Function used to guess the length of the structure over which we are going
 * to iterate.
 *
 * @param  {any} target - Target object.
 * @return {number|undefined}
 */
function guessLength(target) {
  if (typeof target.length === 'number')
    return target.length;

  if (typeof target.size === 'number')
    return target.size;

  return;
}

/**
 * Function used to convert an iterable to an array.
 *
 * @param  {any}   target - Iteration target.
 * @return {array}
 */
function toArray(target) {
  var l = guessLength(target);

  var array = typeof l === 'number' ? new Array(l) : [];

  var i = 0;

  // TODO: we could optimize when given target is array like
  forEach$m(target, function(value) {
    array[i++] = value;
  });

  return array;
}

/**
 * Same as above but returns a supplementary indices array.
 *
 * @param  {any}   target - Iteration target.
 * @return {array}
 */
function toArrayWithIndices(target) {
  var l = guessLength(target);

  var IndexArray = typeof l === 'number' ?
    typed$8.getPointerArray(l) :
    Array;

  var array = typeof l === 'number' ? new Array(l) : [];
  var indices = typeof l === 'number' ? new IndexArray(l) : [];

  var i = 0;

  // TODO: we could optimize when given target is array like
  forEach$m(target, function(value) {
    array[i] = value;
    indices[i] = i++;
  });

  return [array, indices];
}

/**
 * Exporting.
 */
iterables$c.isArrayLike = isArrayLike;
iterables$c.guessLength = guessLength;
iterables$c.toArray = toArray;
iterables$c.toArrayWithIndices = toArrayWithIndices;

var forEach$l = foreach,
    comparators$2 = comparators$3,
    iterables$b = iterables$c;

var DEFAULT_COMPARATOR$2 = comparators$2.DEFAULT_COMPARATOR,
    reverseComparator$2 = comparators$2.reverseComparator;

/**
 * Heap helper functions.
 */

/**
 * Function used to sift down.
 *
 * @param {function} compare    - Comparison function.
 * @param {array}    heap       - Array storing the heap's data.
 * @param {number}   startIndex - Starting index.
 * @param {number}   i          - Index.
 */
function siftDown(compare, heap, startIndex, i) {
  var item = heap[i],
      parentIndex,
      parent;

  while (i > startIndex) {
    parentIndex = (i - 1) >> 1;
    parent = heap[parentIndex];

    if (compare(item, parent) < 0) {
      heap[i] = parent;
      i = parentIndex;
      continue;
    }

    break;
  }

  heap[i] = item;
}

/**
 * Function used to sift up.
 *
 * @param {function} compare - Comparison function.
 * @param {array}    heap    - Array storing the heap's data.
 * @param {number}   i       - Index.
 */
function siftUp$1(compare, heap, i) {
  var endIndex = heap.length,
      startIndex = i,
      item = heap[i],
      childIndex = 2 * i + 1,
      rightIndex;

  while (childIndex < endIndex) {
    rightIndex = childIndex + 1;

    if (
      rightIndex < endIndex &&
      compare(heap[childIndex], heap[rightIndex]) >= 0
    ) {
      childIndex = rightIndex;
    }

    heap[i] = heap[childIndex];
    i = childIndex;
    childIndex = 2 * i + 1;
  }

  heap[i] = item;
  siftDown(compare, heap, startIndex, i);
}

/**
 * Function used to push an item into a heap represented by a raw array.
 *
 * @param {function} compare - Comparison function.
 * @param {array}    heap    - Array storing the heap's data.
 * @param {any}      item    - Item to push.
 */
function push(compare, heap, item) {
  heap.push(item);
  siftDown(compare, heap, 0, heap.length - 1);
}

/**
 * Function used to pop an item from a heap represented by a raw array.
 *
 * @param  {function} compare - Comparison function.
 * @param  {array}    heap    - Array storing the heap's data.
 * @return {any}
 */
function pop(compare, heap) {
  var lastItem = heap.pop();

  if (heap.length !== 0) {
    var item = heap[0];
    heap[0] = lastItem;
    siftUp$1(compare, heap, 0);

    return item;
  }

  return lastItem;
}

/**
 * Function used to pop the heap then push a new value into it, thus "replacing"
 * it.
 *
 * @param  {function} compare - Comparison function.
 * @param  {array}    heap    - Array storing the heap's data.
 * @param  {any}      item    - The item to push.
 * @return {any}
 */
function replace(compare, heap, item) {
  if (heap.length === 0)
    throw new Error('mnemonist/heap.replace: cannot pop an empty heap.');

  var popped = heap[0];
  heap[0] = item;
  siftUp$1(compare, heap, 0);

  return popped;
}

/**
 * Function used to push an item in the heap then pop the heap and return the
 * popped value.
 *
 * @param  {function} compare - Comparison function.
 * @param  {array}    heap    - Array storing the heap's data.
 * @param  {any}      item    - The item to push.
 * @return {any}
 */
function pushpop(compare, heap, item) {
  var tmp;

  if (heap.length !== 0 && compare(heap[0], item) < 0) {
    tmp = heap[0];
    heap[0] = item;
    item = tmp;
    siftUp$1(compare, heap, 0);
  }

  return item;
}

/**
 * Converts and array into an abstract heap in linear time.
 *
 * @param {function} compare - Comparison function.
 * @param {array}    array   - Target array.
 */
function heapify(compare, array) {
  var n = array.length,
      l = n >> 1,
      i = l;

  while (--i >= 0)
    siftUp$1(compare, array, i);
}

/**
 * Fully consumes the given heap.
 *
 * @param  {function} compare - Comparison function.
 * @param  {array}    heap    - Array storing the heap's data.
 * @return {array}
 */
function consume$1(compare, heap) {
  var l = heap.length,
      i = 0;

  var array = new Array(l);

  while (i < l)
    array[i++] = pop(compare, heap);

  return array;
}

/**
 * Function used to retrieve the n smallest items from the given iterable.
 *
 * @param {function} compare  - Comparison function.
 * @param {number}   n        - Number of top items to retrieve.
 * @param {any}      iterable - Arbitrary iterable.
 * @param {array}
 */
function nsmallest(compare, n, iterable) {
  if (arguments.length === 2) {
    iterable = n;
    n = compare;
    compare = DEFAULT_COMPARATOR$2;
  }

  var reverseCompare = reverseComparator$2(compare);

  var i, l, v;

  var min = Infinity;

  var result;

  // If n is equal to 1, it's just a matter of finding the minimum
  if (n === 1) {
    if (iterables$b.isArrayLike(iterable)) {
      for (i = 0, l = iterable.length; i < l; i++) {
        v = iterable[i];

        if (min === Infinity || compare(v, min) < 0)
          min = v;
      }

      result = new iterable.constructor(1);
      result[0] = min;

      return result;
    }

    forEach$l(iterable, function(value) {
      if (min === Infinity || compare(value, min) < 0)
        min = value;
    });

    return [min];
  }

  if (iterables$b.isArrayLike(iterable)) {

    // If n > iterable length, we just clone and sort
    if (n >= iterable.length)
      return iterable.slice().sort(compare);

    result = iterable.slice(0, n);
    heapify(reverseCompare, result);

    for (i = n, l = iterable.length; i < l; i++)
      if (reverseCompare(iterable[i], result[0]) > 0)
        replace(reverseCompare, result, iterable[i]);

    // NOTE: if n is over some number, it becomes faster to consume the heap
    return result.sort(compare);
  }

  // Correct for size
  var size = iterables$b.guessLength(iterable);

  if (size !== null && size < n)
    n = size;

  result = new Array(n);
  i = 0;

  forEach$l(iterable, function(value) {
    if (i < n) {
      result[i] = value;
    }
    else {
      if (i === n)
        heapify(reverseCompare, result);

      if (reverseCompare(value, result[0]) > 0)
        replace(reverseCompare, result, value);
    }

    i++;
  });

  if (result.length > i)
    result.length = i;

  // NOTE: if n is over some number, it becomes faster to consume the heap
  return result.sort(compare);
}

/**
 * Function used to retrieve the n largest items from the given iterable.
 *
 * @param {function} compare  - Comparison function.
 * @param {number}   n        - Number of top items to retrieve.
 * @param {any}      iterable - Arbitrary iterable.
 * @param {array}
 */
function nlargest(compare, n, iterable) {
  if (arguments.length === 2) {
    iterable = n;
    n = compare;
    compare = DEFAULT_COMPARATOR$2;
  }

  var reverseCompare = reverseComparator$2(compare);

  var i, l, v;

  var max = -Infinity;

  var result;

  // If n is equal to 1, it's just a matter of finding the maximum
  if (n === 1) {
    if (iterables$b.isArrayLike(iterable)) {
      for (i = 0, l = iterable.length; i < l; i++) {
        v = iterable[i];

        if (max === -Infinity || compare(v, max) > 0)
          max = v;
      }

      result = new iterable.constructor(1);
      result[0] = max;

      return result;
    }

    forEach$l(iterable, function(value) {
      if (max === -Infinity || compare(value, max) > 0)
        max = value;
    });

    return [max];
  }

  if (iterables$b.isArrayLike(iterable)) {

    // If n > iterable length, we just clone and sort
    if (n >= iterable.length)
      return iterable.slice().sort(reverseCompare);

    result = iterable.slice(0, n);
    heapify(compare, result);

    for (i = n, l = iterable.length; i < l; i++)
      if (compare(iterable[i], result[0]) > 0)
        replace(compare, result, iterable[i]);

    // NOTE: if n is over some number, it becomes faster to consume the heap
    return result.sort(reverseCompare);
  }

  // Correct for size
  var size = iterables$b.guessLength(iterable);

  if (size !== null && size < n)
    n = size;

  result = new Array(n);
  i = 0;

  forEach$l(iterable, function(value) {
    if (i < n) {
      result[i] = value;
    }
    else {
      if (i === n)
        heapify(compare, result);

      if (compare(value, result[0]) > 0)
        replace(compare, result, value);
    }

    i++;
  });

  if (result.length > i)
    result.length = i;

  // NOTE: if n is over some number, it becomes faster to consume the heap
  return result.sort(reverseCompare);
}

/**
 * Binary Minimum Heap.
 *
 * @constructor
 * @param {function} comparator - Comparator function to use.
 */
function Heap$3(comparator) {
  this.clear();
  this.comparator = comparator || DEFAULT_COMPARATOR$2;

  if (typeof this.comparator !== 'function')
    throw new Error('mnemonist/Heap.constructor: given comparator should be a function.');
}

/**
 * Method used to clear the heap.
 *
 * @return {undefined}
 */
Heap$3.prototype.clear = function() {

  // Properties
  this.items = [];
  this.size = 0;
};

/**
 * Method used to push an item into the heap.
 *
 * @param  {any}    item - Item to push.
 * @return {number}
 */
Heap$3.prototype.push = function(item) {
  push(this.comparator, this.items, item);
  return ++this.size;
};

/**
 * Method used to retrieve the "first" item of the heap.
 *
 * @return {any}
 */
Heap$3.prototype.peek = function() {
  return this.items[0];
};

/**
 * Method used to retrieve & remove the "first" item of the heap.
 *
 * @return {any}
 */
Heap$3.prototype.pop = function() {
  if (this.size !== 0)
    this.size--;

  return pop(this.comparator, this.items);
};

/**
 * Method used to pop the heap, then push an item and return the popped
 * item.
 *
 * @param  {any} item - Item to push into the heap.
 * @return {any}
 */
Heap$3.prototype.replace = function(item) {
  return replace(this.comparator, this.items, item);
};

/**
 * Method used to push the heap, the pop it and return the pooped item.
 *
 * @param  {any} item - Item to push into the heap.
 * @return {any}
 */
Heap$3.prototype.pushpop = function(item) {
  return pushpop(this.comparator, this.items, item);
};

/**
 * Method used to consume the heap fully and return its items as a sorted array.
 *
 * @return {array}
 */
Heap$3.prototype.consume = function() {
  this.size = 0;
  return consume$1(this.comparator, this.items);
};

/**
 * Method used to convert the heap to an array. Note that it basically clone
 * the heap and consumes it completely. This is hardly performant.
 *
 * @return {array}
 */
Heap$3.prototype.toArray = function() {
  return consume$1(this.comparator, this.items.slice());
};

/**
 * Convenience known methods.
 */
Heap$3.prototype.inspect = function() {
  var proxy = this.toArray();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: Heap$3,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  Heap$3.prototype[Symbol.for('nodejs.util.inspect.custom')] = Heap$3.prototype.inspect;

/**
 * Binary Maximum Heap.
 *
 * @constructor
 * @param {function} comparator - Comparator function to use.
 */
function MaxHeap(comparator) {
  this.clear();
  this.comparator = comparator || DEFAULT_COMPARATOR$2;

  if (typeof this.comparator !== 'function')
    throw new Error('mnemonist/MaxHeap.constructor: given comparator should be a function.');

  this.comparator = reverseComparator$2(this.comparator);
}

MaxHeap.prototype = Heap$3.prototype;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a heap.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @param  {function} comparator - Custom comparator function.
 * @return {Heap}
 */
Heap$3.from = function(iterable, comparator) {
  var heap = new Heap$3(comparator);

  var items;

  // If iterable is an array, we can be clever about it
  if (iterables$b.isArrayLike(iterable))
    items = iterable.slice();
  else
    items = iterables$b.toArray(iterable);

  heapify(heap.comparator, items);
  heap.items = items;
  heap.size = items.length;

  return heap;
};

MaxHeap.from = function(iterable, comparator) {
  var heap = new MaxHeap(comparator);

  var items;

  // If iterable is an array, we can be clever about it
  if (iterables$b.isArrayLike(iterable))
    items = iterable.slice();
  else
    items = iterables$b.toArray(iterable);

  heapify(heap.comparator, items);
  heap.items = items;
  heap.size = items.length;

  return heap;
};

/**
 * Exporting.
 */
Heap$3.siftUp = siftUp$1;
Heap$3.siftDown = siftDown;
Heap$3.push = push;
Heap$3.pop = pop;
Heap$3.replace = replace;
Heap$3.pushpop = pushpop;
Heap$3.heapify = heapify;
Heap$3.consume = consume$1;

Heap$3.nsmallest = nsmallest;
Heap$3.nlargest = nlargest;

Heap$3.MinHeap = Heap$3;
Heap$3.MaxHeap = MaxHeap;

var heap = Heap$3;

/**
 * Mnemonist Fibonacci Heap
 * =========================
 *
 * Fibonacci heap implementation.
 */
var comparators$1 = comparators$3,
    forEach$k = foreach;

var DEFAULT_COMPARATOR$1 = comparators$1.DEFAULT_COMPARATOR,
    reverseComparator$1 = comparators$1.reverseComparator;

/**
 * Fibonacci Heap.
 *
 * @constructor
 */
function FibonacciHeap$1(comparator) {
  this.clear();
  this.comparator = comparator || DEFAULT_COMPARATOR$1;

  if (typeof this.comparator !== 'function')
    throw new Error('mnemonist/FibonacciHeap.constructor: given comparator should be a function.');
}

/**
 * Method used to clear the heap.
 *
 * @return {undefined}
 */
FibonacciHeap$1.prototype.clear = function() {

  // Properties
  this.root = null;
  this.min = null;
  this.size = 0;
};

/**
 * Function used to create a node.
 *
 * @param  {any}    item - Target item.
 * @return {object}
 */
function createNode(item) {
  return {
    item: item,
    degree: 0
  };
}

/**
 * Function used to merge the given node with the root list.
 *
 * @param {FibonacciHeap} heap - Target heap.
 * @param {Node}          node - Target node.
 */
function mergeWithRoot(heap, node) {
  if (!heap.root) {
    heap.root = node;
  }
  else {
    node.right = heap.root.right;
    node.left = heap.root;
    heap.root.right.left = node;
    heap.root.right = node;
  }
}

/**
 * Method used to push an item into the heap.
 *
 * @param  {any}    item - Item to push.
 * @return {number}
 */
FibonacciHeap$1.prototype.push = function(item) {
  var node = createNode(item);
  node.left = node;
  node.right = node;
  mergeWithRoot(this, node);

  if (!this.min || this.comparator(node.item, this.min.item) <= 0)
    this.min = node;

  return ++this.size;
};

/**
 * Method used to get the "first" item of the heap.
 *
 * @return {any}
 */
FibonacciHeap$1.prototype.peek = function() {
  return this.min ? this.min.item : undefined;
};

/**
 * Function used to consume the given linked list.
 *
 * @param {Node} head - Head node.
 * @param {array}
 */
function consumeLinkedList(head) {
  var nodes = [],
      node = head,
      flag = false;

  while (true) {
    if (node === head && flag)
      break;
    else if (node === head)
      flag = true;

    nodes.push(node);
    node = node.right;
  }

  return nodes;
}

/**
 * Function used to remove the target node from the root list.
 *
 * @param {FibonacciHeap} heap - Target heap.
 * @param {Node}          node - Target node.
 */
function removeFromRoot(heap, node) {
  if (heap.root === node)
    heap.root = node.right;
  node.left.right = node.right;
  node.right.left = node.left;
}

/**
 * Function used to merge the given node with the child list of a root node.
 *
 * @param {Node} parent - Parent node.
 * @param {Node} node   - Target node.
 */
function mergeWithChild(parent, node) {
  if (!parent.child) {
    parent.child = node;
  }
  else {
    node.right = parent.child.right;
    node.left = parent.child;
    parent.child.right.left = node;
    parent.child.right = node;
  }
}

/**
 * Function used to link one node to another in the root list.
 *
 * @param {FibonacciHeap} heap - Target heap.
 * @param {Node}          y - Y node.
 * @param {Node}          x - X node.
 */
function link(heap, y, x) {
  removeFromRoot(heap, y);
  y.left = y;
  y.right = y;
  mergeWithChild(x, y);
  x.degree++;
  y.parent = x;
}

/**
 * Function used to consolidate the heap.
 *
 * @param {FibonacciHeap} heap - Target heap.
 */
function consolidate(heap) {
  var A = new Array(heap.size),
      nodes = consumeLinkedList(heap.root),
      i, l, x, y, d, t;

  for (i = 0, l = nodes.length; i < l; i++) {
    x = nodes[i];
    d = x.degree;

    while (A[d]) {
      y = A[d];

      if (heap.comparator(x.item, y.item) > 0) {
        t = x;
        x = y;
        y = t;
      }

      link(heap, y, x);
      A[d] = null;
      d++;
    }

    A[d] = x;
  }

  for (i = 0; i < heap.size; i++) {
    if (A[i] && heap.comparator(A[i].item, heap.min.item) <= 0)
      heap.min = A[i];
  }
}

/**
 * Method used to retrieve & remove the "first" item of the heap.
 *
 * @return {any}
 */
FibonacciHeap$1.prototype.pop = function() {
  if (!this.size)
    return undefined;

  var z = this.min;

  if (z.child) {
    var nodes = consumeLinkedList(z.child),
        node,
        i,
        l;

    for (i = 0, l = nodes.length; i < l; i++) {
      node = nodes[i];

      mergeWithRoot(this, node);
      delete node.parent;
    }
  }

  removeFromRoot(this, z);

  if (z === z.right) {
    this.min = null;
    this.root = null;
  }
  else {
    this.min = z.right;
    consolidate(this);
  }

  this.size--;

  return z.item;
};

/**
 * Convenience known methods.
 */
FibonacciHeap$1.prototype.inspect = function() {
  var proxy = {
    size: this.size
  };

  if (this.min && 'item' in this.min)
    proxy.top = this.min.item;

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: FibonacciHeap$1,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  FibonacciHeap$1.prototype[Symbol.for('nodejs.util.inspect.custom')] = FibonacciHeap$1.prototype.inspect;

/**
 * Fibonacci Maximum Heap.
 *
 * @constructor
 */
function MaxFibonacciHeap(comparator) {
  this.clear();
  this.comparator = comparator || DEFAULT_COMPARATOR$1;

  if (typeof this.comparator !== 'function')
    throw new Error('mnemonist/FibonacciHeap.constructor: given comparator should be a function.');

  this.comparator = reverseComparator$1(this.comparator);
}

MaxFibonacciHeap.prototype = FibonacciHeap$1.prototype;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a heap.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @param  {function} comparator - Custom comparator function.
 * @return {FibonacciHeap}
 */
FibonacciHeap$1.from = function(iterable, comparator) {
  var heap = new FibonacciHeap$1(comparator);

  forEach$k(iterable, function(value) {
    heap.push(value);
  });

  return heap;
};

MaxFibonacciHeap.from = function(iterable, comparator) {
  var heap = new MaxFibonacciHeap(comparator);

  forEach$k(iterable, function(value) {
    heap.push(value);
  });

  return heap;
};

/**
 * Exporting.
 */
FibonacciHeap$1.MinFibonacciHeap = FibonacciHeap$1;
FibonacciHeap$1.MaxFibonacciHeap = MaxFibonacciHeap;
var fibonacciHeap = FibonacciHeap$1;

/**
 * Constants.
 */
var SEPARATOR = '\u0001';

/**
 * Function used to sort the triples.
 *
 * @param {string|array} string - Padded sequence.
 * @param {array}        array  - Array to sort (will be mutated).
 * @param {number}       offset - Index offset.
 */
function sort(string, array, offset) {
  var l = array.length,
      buckets = [],
      i = l,
      j = -1,
      b,
      d = 0,
      bits;

  while (i--)
    j = Math.max(string[array[i] + offset], j);

  bits = j >> 24 && 32 || j >> 16 && 24 || j >> 8 && 16 || 8;

  for (; d < bits; d += 4) {
    for (i = 16; i--;)
      buckets[i] = [];
    for (i = l; i--;)
      buckets[((string[array[i] + offset]) >> d) & 15].push(array[i]);
    for (b = 0; b < 16; b++) {
      for (j = buckets[b].length; j--;)
        array[++i] = buckets[b][j];
    }
  }
}

/**
 * Comparison helper.
 */
function compare(string, lookup, m, n) {
  return (
    (string[m] - string[n]) ||
    (m % 3 === 2 ?
      (string[m + 1] - string[n + 1]) || (lookup[m + 2] - lookup[n + 2]) :
      (lookup[m + 1] - lookup[n + 1]))
  );
}

/**
 * Recursive function used to build the suffix tree in linear time.
 *
 * @param  {string|array} string - Padded sequence.
 * @param  {number}       l      - True length of sequence (unpadded).
 * @return {array}
 */
function build(string, l) {
  var a = [],
      b = [],
      al = (2 * l / 3) | 0,
      bl = l - al,
      r = (al + 1) >> 1,
      i = al,
      j = 0,
      k,
      lookup = [],
      result = [];

  if (l === 1)
    return [0];

  while (i--)
    a[i] = ((i * 3) >> 1) + 1;

  for (i = 3; i--;)
    sort(string, a, i);

  j = b[((a[0] / 3) | 0) + (a[0] % 3 === 1 ? 0 : r)] = 1;

  for (i = 1; i < al; i++) {
    if (string[a[i]] !== string[a[i - 1]] ||
        string[a[i] + 1] !== string[a[i - 1] + 1] ||
        string[a[i] + 2] !== string[a[i - 1] + 2])
      j++;

    b[((a[i] / 3) | 0) + (a[i] % 3 === 1 ? 0 : r)] = j;
  }

  if (j < al) {
    b = build(b, al);

    for (i = al; i--;)
      a[i] = b[i] < r ? b[i] * 3 + 1 : ((b[i] - r) * 3 + 2);
  }

  for (i = al; i--;)
    lookup[a[i]] = i;
  lookup[l] = -1;
  lookup[l + 1] = -2;

  b = l % 3 === 1 ? [l - 1] : [];

  for (i = 0; i < al; i++) {
    if (a[i] % 3 === 1)
      b.push(a[i] - 1);
  }

  sort(string, b, 0);

  for (i = 0, j = 0, k = 0; i < al && j < bl;)
    result[k++] = (
      compare(string, lookup, a[i], b[j]) < 0 ?
        a[i++] :
        b[j++]
    );

  while (i < al)
    result[k++] = a[i++];

  while (j < bl)
    result[k++] = b[j++];

  return result;
}

/**
 * Function used to create the array we are going to work on.
 *
 * @param  {string|array} target - Target sequence.
 * @return {array}
 */
function convert(target) {

  // Creating the alphabet array
  var length = target.length,
      paddingOffset = length % 3,
      array = new Array(length + paddingOffset),
      l,
      i;

  // If we have an arbitrary sequence, we need to transform it
  if (typeof target !== 'string') {
    var uniqueTokens = Object.create(null);

    for (i = 0; i < length; i++) {
      if (!uniqueTokens[target[i]])
        uniqueTokens[target[i]] = true;
    }

    var alphabet = Object.create(null),
        sortedUniqueTokens = Object.keys(uniqueTokens).sort();

    for (i = 0, l = sortedUniqueTokens.length; i < l; i++)
      alphabet[sortedUniqueTokens[i]] = i + 1;

    for (i = 0; i < length; i++) {
      array[i] = alphabet[target[i]];
    }
  }
  else {
    for (i = 0; i < length; i++)
      array[i] = target.charCodeAt(i);
  }

  // Padding the array
  for (; i < paddingOffset; i++)
    array[i] = 0;

  return array;
}

/**
 * Suffix Array.
 *
 * @constructor
 * @param {string|array} string - Sequence for which to build the suffix array.
 */
function SuffixArray$1(string) {

  // Properties
  this.hasArbitrarySequence = typeof string !== 'string';
  this.string = string;
  this.length = string.length;

  // Building the array
  this.array = build(convert(string), this.length);
}

/**
 * Convenience known methods.
 */
SuffixArray$1.prototype.toString = function() {
  return this.array.join(',');
};

SuffixArray$1.prototype.toJSON = function() {
  return this.array;
};

SuffixArray$1.prototype.inspect = function() {
  var array = new Array(this.length);

  for (var i = 0; i < this.length; i++)
    array[i] = this.string.slice(this.array[i]);

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: SuffixArray$1,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  SuffixArray$1.prototype[Symbol.for('nodejs.util.inspect.custom')] = SuffixArray$1.prototype.inspect;

/**
 * Generalized Suffix Array.
 *
 * @constructor
 */
function GeneralizedSuffixArray(strings) {

  // Properties
  this.hasArbitrarySequence = typeof strings[0] !== 'string';
  this.size = strings.length;

  if (this.hasArbitrarySequence) {
    this.text = [];

    for (var i = 0, l = this.size; i < l; i++) {
      this.text.push.apply(this.text, strings[i]);

      if (i < l - 1)
        this.text.push(SEPARATOR);
    }
  }
  else {
    this.text = strings.join(SEPARATOR);
  }

  this.firstLength = strings[0].length;
  this.length = this.text.length;

  // Building the array
  this.array = build(convert(this.text), this.length);
}

/**
 * Method used to retrieve the longest common subsequence of the generalized
 * suffix array.
 *
 * @return {string|array}
 */
GeneralizedSuffixArray.prototype.longestCommonSubsequence = function() {
  var lcs = this.hasArbitrarySequence ? [] : '',
      lcp,
      i,
      j,
      s,
      t;

  for (i = 1; i < this.length; i++) {
    s = this.array[i];
    t = this.array[i - 1];

    if (s < this.firstLength &&
        t < this.firstLength)
      continue;

    if (s > this.firstLength &&
        t > this.firstLength)
      continue;

    lcp = Math.min(this.length - s, this.length - t);

    for (j = 0; j < lcp; j++) {
      if (this.text[s + j] !== this.text[t + j]) {
        lcp = j;
        break;
      }
    }

    if (lcp > lcs.length)
      lcs = this.text.slice(s, s + lcp);
  }

  return lcs;
};

/**
 * Convenience known methods.
 */
GeneralizedSuffixArray.prototype.toString = function() {
  return this.array.join(',');
};

GeneralizedSuffixArray.prototype.toJSON = function() {
  return this.array;
};

GeneralizedSuffixArray.prototype.inspect = function() {
  var array = new Array(this.length);

  for (var i = 0; i < this.length; i++)
    array[i] = this.text.slice(this.array[i]);

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: GeneralizedSuffixArray,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  GeneralizedSuffixArray.prototype[Symbol.for('nodejs.util.inspect.custom')] = GeneralizedSuffixArray.prototype.inspect;

/**
 * Exporting.
 */
SuffixArray$1.GeneralizedSuffixArray = GeneralizedSuffixArray;
var suffixArray = SuffixArray$1;

var forEach$j = foreach;

/**
 * Inverse Map.
 *
 * @constructor
 */
function InverseMap(original) {

  this.size = 0;
  this.items = new Map();
  this.inverse = original;
}

/**
 * BiMap.
 *
 * @constructor
 */
function BiMap() {

  this.size = 0;
  this.items = new Map();
  this.inverse = new InverseMap(this);
}

/**
 * Method used to clear the map.
 *
 * @return {undefined}
 */
function clear() {
  this.size = 0;
  this.items.clear();
  this.inverse.items.clear();
}

BiMap.prototype.clear = clear;
InverseMap.prototype.clear = clear;

/**
 * Method used to set a relation.
 *
 * @param  {any} key - Key.
 * @param  {any} value - Value.
 * @return {BiMap|InverseMap}
 */
function set$1(key, value) {

  // First we need to attempt to see if the relation is not flawed
  if (this.items.has(key)) {
    var currentValue = this.items.get(key);

    // The relation already exists, we do nothing
    if (currentValue === value)
      return this;
    else
      this.inverse.items.delete(currentValue);
  }

  if (this.inverse.items.has(value)) {
    var currentKey = this.inverse.items.get(value);

    if (currentKey === key)
      return this;
    else
      this.items.delete(currentKey);
  }

  // Here we actually add the relation
  this.items.set(key, value);
  this.inverse.items.set(value, key);

  // Size
  this.size = this.items.size;
  this.inverse.size = this.inverse.items.size;

  return this;
}

BiMap.prototype.set = set$1;
InverseMap.prototype.set = set$1;

/**
 * Method used to delete a relation.
 *
 * @param  {any} key - Key.
 * @return {boolean}
 */
function del(key) {
  if (this.items.has(key)) {
    var currentValue = this.items.get(key);

    this.items.delete(key);
    this.inverse.items.delete(currentValue);

    // Size
    this.size = this.items.size;
    this.inverse.size = this.inverse.items.size;

    return true;
  }

  return false;
}

BiMap.prototype.delete = del;
InverseMap.prototype.delete = del;

/**
 * Mapping some Map prototype function unto our two classes.
 */
var METHODS = ['has', 'get', 'forEach', 'keys', 'values', 'entries'];

METHODS.forEach(function(name) {
  BiMap.prototype[name] = InverseMap.prototype[name] = function() {
    return Map.prototype[name].apply(this.items, arguments);
  };
});

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined') {
  BiMap.prototype[Symbol.iterator] = BiMap.prototype.entries;
  InverseMap.prototype[Symbol.iterator] = InverseMap.prototype.entries;
}

/**
 * Convenience known methods.
 */
BiMap.prototype.inspect = function() {
  var dummy = {
    left: this.items,
    right: this.inverse.items
  };

  // Trick so that node displays the name of the constructor
  Object.defineProperty(dummy, 'constructor', {
    value: BiMap,
    enumerable: false
  });

  return dummy;
};

if (typeof Symbol !== 'undefined')
  BiMap.prototype[Symbol.for('nodejs.util.inspect.custom')] = BiMap.prototype.inspect;

InverseMap.prototype.inspect = function() {
  var dummy = {
    left: this.inverse.items,
    right: this.items
  };

  // Trick so that node displays the name of the constructor
  Object.defineProperty(dummy, 'constructor', {
    value: InverseMap,
    enumerable: false
  });

  return dummy;
};

if (typeof Symbol !== 'undefined')
  InverseMap.prototype[Symbol.for('nodejs.util.inspect.custom')] = InverseMap.prototype.inspect;


/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a bimap.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @return {BiMap}
 */
BiMap.from = function(iterable) {
  var bimap = new BiMap();

  forEach$j(iterable, function(value, key) {
    bimap.set(key, value);
  });

  return bimap;
};

/**
 * Exporting.
 */
var biMap = BiMap;

/**
 * Iterator class.
 *
 * @constructor
 * @param {function} next - Next function.
 */
function Iterator$h(next) {
  if (typeof next !== 'function')
    throw new Error('obliterator/iterator: expecting a function!');

  this.next = next;
}

/**
 * If symbols are supported, we add `next` to `Symbol.iterator`.
 */
if (typeof Symbol !== 'undefined')
  Iterator$h.prototype[Symbol.iterator] = function () {
    return this;
  };

/**
 * Returning an iterator of the given values.
 *
 * @param  {any...} values - Values.
 * @return {Iterator}
 */
Iterator$h.of = function () {
  var args = arguments,
    l = args.length,
    i = 0;

  return new Iterator$h(function () {
    if (i >= l) return {done: true};

    return {done: false, value: args[i++]};
  });
};

/**
 * Returning an empty iterator.
 *
 * @return {Iterator}
 */
Iterator$h.empty = function () {
  var iterator = new Iterator$h(function () {
    return {done: true};
  });

  return iterator;
};

/**
 * Returning an iterator over the given indexed sequence.
 *
 * @param  {string|Array} sequence - Target sequence.
 * @return {Iterator}
 */
Iterator$h.fromSequence = function (sequence) {
  var i = 0,
    l = sequence.length;

  return new Iterator$h(function () {
    if (i >= l) return {done: true};

    return {done: false, value: sequence[i++]};
  });
};

/**
 * Returning whether the given value is an iterator.
 *
 * @param  {any} value - Value.
 * @return {boolean}
 */
Iterator$h.is = function (value) {
  if (value instanceof Iterator$h) return true;

  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.next === 'function'
  );
};

/**
 * Exporting.
 */
var iterator = Iterator$h;

var bitwise$2 = {};

(function (exports) {
	/**
	 * Takes a 32 bits integer and returns its MSB using SWAR strategy.
	 *
	 * @param  {number} x - Target number.
	 * @return {number}
	 */
	function msb32(x) {
	  x |= (x >> 1);
	  x |= (x >> 2);
	  x |= (x >> 4);
	  x |= (x >> 8);
	  x |= (x >> 16);

	  return (x & ~(x >> 1));
	}
	exports.msb32 = msb32;

	/**
	 * Takes a byte and returns its MSB using SWAR strategy.
	 *
	 * @param  {number} x - Target number.
	 * @return {number}
	 */
	function msb8(x) {
	  x |= (x >> 1);
	  x |= (x >> 2);
	  x |= (x >> 4);

	  return (x & ~(x >> 1));
	}
	exports.msb8 = msb8;

	/**
	 * Takes a number and return bit at position.
	 *
	 * @param  {number} x   - Target number.
	 * @param  {number} pos - Position.
	 * @return {number}
	 */
	exports.test = function(x, pos) {
	  return (x >> pos) & 1;
	};

	/**
	 * Compare two bytes and return their critical bit.
	 *
	 * @param  {number} a - First byte.
	 * @param  {number} b - Second byte.
	 * @return {number}
	 */
	exports.criticalBit8 = function(a, b) {
	  return msb8(a ^ b);
	};

	exports.criticalBit8Mask = function(a, b) {
	  return (~msb8(a ^ b) >>> 0) & 0xff;
	};

	exports.testCriticalBit8 = function(x, mask) {
	  return (1 + (x | mask)) >> 8;
	};

	exports.criticalBit32Mask = function(a, b) {
	  return (~msb32(a ^ b) >>> 0) & 0xffffffff;
	};

	/**
	 * Takes a 32 bits integer and returns its population count (number of 1 of
	 * the binary representation).
	 *
	 * @param  {number} x - Target number.
	 * @return {number}
	 */
	exports.popcount = function(x) {
	  x -= x >> 1 & 0x55555555;
	  x = (x & 0x33333333) + (x >> 2 & 0x33333333);
	  x = x + (x >> 4) & 0x0f0f0f0f;
	  x += x >> 8;
	  x += x >> 16;
	  return x & 0x7f;
	};

	/**
	 * Slightly faster popcount function based on a precomputed table of 8bits
	 * words.
	 *
	 * @param  {number} x - Target number.
	 * @return {number}
	 */
	var TABLE8 = new Uint8Array(Math.pow(2, 8));

	for (var i = 0, l = TABLE8.length; i < l; i++)
	  TABLE8[i] = exports.popcount(i);

	exports.table8Popcount = function(x) {
	  return (
	    TABLE8[x & 0xff] +
	    TABLE8[(x >> 8) & 0xff] +
	    TABLE8[(x >> 16) & 0xff] +
	    TABLE8[(x >> 24) & 0xff]
	  );
	};
} (bitwise$2));

var Iterator$g = iterator,
    bitwise$1 = bitwise$2;

/**
 * BitSet.
 *
 * @constructor
 */
function BitSet(length) {

  // Properties
  this.length = length;
  this.clear();

  // Methods

  // Statics
}

/**
 * Method used to clear the bit set.
 *
 * @return {undefined}
 */
BitSet.prototype.clear = function() {

  // Properties
  this.size = 0;
  this.array = new Uint32Array(Math.ceil(this.length / 32));
};

/**
 * Method used to set the given bit's value.
 *
 * @param  {number} index - Target bit index.
 * @param  {number} value - Value to set.
 * @return {BitSet}
 */
BitSet.prototype.set = function(index, value) {
  var byteIndex = index >> 5,
      pos = index & 0x0000001f,
      oldBytes = this.array[byteIndex],
      newBytes;

  if (value === 0 || value === false)
    newBytes = this.array[byteIndex] &= ~(1 << pos);
  else
    newBytes = this.array[byteIndex] |= (1 << pos);

  // The operands of all bitwise operators are converted to *signed* 32-bit integers.
  // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators#Signed_32-bit_integers
  // Shifting by 31 changes the sign (i.e. 1 << 31 = -2147483648).
  // Therefore, get unsigned representation by applying '>>> 0'.
  newBytes = newBytes >>> 0;

  // Updating size
  if (newBytes > oldBytes)
    this.size++;
  else if (newBytes < oldBytes)
    this.size--;

  return this;
};

/**
* Method used to reset the given bit's value.
*
* @param  {number} index - Target bit index.
* @return {BitSet}
*/
BitSet.prototype.reset = function(index) {
  var byteIndex = index >> 5,
      pos = index & 0x0000001f,
      oldBytes = this.array[byteIndex],
      newBytes;

  newBytes = this.array[byteIndex] &= ~(1 << pos);

  // Updating size
  if (newBytes < oldBytes)
    this.size--;

  return this;
};

/**
 * Method used to flip the value of the given bit.
 *
 * @param  {number} index - Target bit index.
 * @return {BitSet}
 */
BitSet.prototype.flip = function(index) {
  var byteIndex = index >> 5,
      pos = index & 0x0000001f,
      oldBytes = this.array[byteIndex];

  var newBytes = this.array[byteIndex] ^= (1 << pos);

  // Get unsigned representation.
  newBytes = newBytes >>> 0;

  // Updating size
  if (newBytes > oldBytes)
    this.size++;
  else if (newBytes < oldBytes)
    this.size--;

  return this;
};

/**
 * Method used to get the given bit's value.
 *
 * @param  {number} index - Target bit index.
 * @return {number}
 */
BitSet.prototype.get = function(index) {
  var byteIndex = index >> 5,
      pos = index & 0x0000001f;

  return (this.array[byteIndex] >> pos) & 1;
};

/**
 * Method used to test the given bit's value.
 *
 * @param  {number} index - Target bit index.
 * @return {BitSet}
 */
BitSet.prototype.test = function(index) {
  return Boolean(this.get(index));
};

/**
 * Method used to return the number of 1 from the beginning of the set up to
 * the ith index.
 *
 * @param  {number} i - Ith index (cannot be > length).
 * @return {number}
 */
BitSet.prototype.rank = function(i) {
  if (this.size === 0)
    return 0;

  var byteIndex = i >> 5,
      pos = i & 0x0000001f,
      r = 0;

  // Accessing the bytes before the last one
  for (var j = 0; j < byteIndex; j++)
    r += bitwise$1.table8Popcount(this.array[j]);

  // Handling masked last byte
  var maskedByte = this.array[byteIndex] & ((1 << pos) - 1);

  r += bitwise$1.table8Popcount(maskedByte);

  return r;
};

/**
 * Method used to return the position of the rth 1 in the set or -1 if the
 * set is empty.
 *
 * Note: usually select is implemented using binary search over rank but I
 * tend to think the following linear implementation is faster since here
 * rank is O(n) anyway.
 *
 * @param  {number} r - Rth 1 to select (should be < length).
 * @return {number}
 */
BitSet.prototype.select = function(r) {
  if (this.size === 0)
    return -1;

  // TODO: throw?
  if (r >= this.length)
    return -1;

  var byte,
      b = 32,
      p = 0,
      c = 0;

  for (var i = 0, l = this.array.length; i < l; i++) {
    byte = this.array[i];

    // The byte is empty, let's continue
    if (byte === 0)
      continue;

    // TODO: This branching might not be useful here
    if (i === l - 1)
      b = this.length % 32 || 32;

    // TODO: popcount should speed things up here

    for (var j = 0; j < b; j++, p++) {
      c += (byte >> j) & 1;

      if (c === r)
        return p;
    }
  }
};

/**
 * Method used to iterate over the bit set's values.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
BitSet.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  var length = this.length,
      byte,
      bit,
      b = 32;

  for (var i = 0, l = this.array.length; i < l; i++) {
    byte = this.array[i];

    if (i === l - 1)
      b = length % 32 || 32;

    for (var j = 0; j < b; j++) {
      bit = (byte >> j) & 1;

      callback.call(scope, bit, i * 32 + j);
    }
  }
};

/**
 * Method used to create an iterator over a set's values.
 *
 * @return {Iterator}
 */
BitSet.prototype.values = function() {
  var length = this.length,
      inner = false,
      byte,
      bit,
      array = this.array,
      l = array.length,
      i = 0,
      j = -1,
      b = 32;

  return new Iterator$g(function next() {
    if (!inner) {

      if (i >= l)
        return {
          done: true
        };

      if (i === l - 1)
        b = length % 32 || 32;

      byte = array[i++];
      inner = true;
      j = -1;
    }

    j++;

    if (j >= b) {
      inner = false;
      return next();
    }

    bit = (byte >> j) & 1;

    return {
      value: bit
    };
  });
};

/**
 * Method used to create an iterator over a set's entries.
 *
 * @return {Iterator}
 */
BitSet.prototype.entries = function() {
  var length = this.length,
      inner = false,
      byte,
      bit,
      array = this.array,
      index,
      l = array.length,
      i = 0,
      j = -1,
      b = 32;

  return new Iterator$g(function next() {
    if (!inner) {

      if (i >= l)
        return {
          done: true
        };

      if (i === l - 1)
        b = length % 32 || 32;

      byte = array[i++];
      inner = true;
      j = -1;
    }

    j++;
    index = (~-i) * 32 + j;

    if (j >= b) {
      inner = false;
      return next();
    }

    bit = (byte >> j) & 1;

    return {
      value: [index, bit]
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  BitSet.prototype[Symbol.iterator] = BitSet.prototype.values;

/**
 * Convenience known methods.
 */
BitSet.prototype.inspect = function() {
  var proxy = new Uint8Array(this.length);

  this.forEach(function(bit, i) {
    proxy[i] = bit;
  });

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: BitSet,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  BitSet.prototype[Symbol.for('nodejs.util.inspect.custom')] = BitSet.prototype.inspect;

BitSet.prototype.toJSON = function() {
  return Array.from(this.array);
};

/**
 * Exporting.
 */
var bitSet = BitSet;

var Iterator$f = iterator,
    bitwise = bitwise$2;

/**
 * Constants.
 */
var DEFAULT_GROWING_POLICY$1 = function(capacity) {
  return Math.max(1, Math.ceil(capacity * 1.5));
};

/**
 * Helpers.
 */
function createByteArray(capacity) {
  return new Uint32Array(Math.ceil(capacity / 32));
}

/**
 * BitVector.
 *
 * @constructor
 */
function BitVector(initialLengthOrOptions) {
  var initialLength = initialLengthOrOptions || 0,
      policy = DEFAULT_GROWING_POLICY$1;

  if (typeof initialLengthOrOptions === 'object') {
    initialLength = (
      initialLengthOrOptions.initialLength ||
      initialLengthOrOptions.initialCapacity ||
      0
    );
    policy = initialLengthOrOptions.policy || policy;
  }

  this.size = 0;
  this.length = initialLength;
  this.capacity = Math.ceil(this.length / 32) * 32;
  this.policy = policy;
  this.array = createByteArray(this.capacity);
}

/**
 * Method used to set the given bit's value.
 *
 * @param  {number} index - Target bit index.
 * @param  {number|boolean} value - Value to set.
 * @return {BitVector}
 */
BitVector.prototype.set = function(index, value) {

  // Out of bounds?
  if (this.length < index)
    throw new Error('BitVector.set: index out of bounds.');

  var byteIndex = index >> 5,
      pos = index & 0x0000001f,
      oldBytes = this.array[byteIndex],
      newBytes;

  if (value === 0 || value === false)
    newBytes = this.array[byteIndex] &= ~(1 << pos);
  else
    newBytes = this.array[byteIndex] |= (1 << pos);

  // Get unsigned representation.
  newBytes = newBytes >>> 0;

  // Updating size
  if (newBytes > oldBytes)
    this.size++;
  else if (newBytes < oldBytes)
    this.size--;

  return this;
};

/**
* Method used to reset the given bit's value.
*
* @param  {number} index - Target bit index.
* @return {BitVector}
*/
BitVector.prototype.reset = function(index) {
  var byteIndex = index >> 5,
      pos = index & 0x0000001f,
      oldBytes = this.array[byteIndex],
      newBytes;

  newBytes = this.array[byteIndex] &= ~(1 << pos);

  // Updating size
  if (newBytes < oldBytes)
    this.size--;

  return this;
};

/**
 * Method used to flip the value of the given bit.
 *
 * @param  {number} index - Target bit index.
 * @return {BitVector}
 */
BitVector.prototype.flip = function(index) {
  var byteIndex = index >> 5,
      pos = index & 0x0000001f,
      oldBytes = this.array[byteIndex];

  var newBytes = this.array[byteIndex] ^= (1 << pos);

  // Get unsigned representation.
  newBytes = newBytes >>> 0;

  // Updating size
  if (newBytes > oldBytes)
    this.size++;
  else if (newBytes < oldBytes)
    this.size--;

  return this;
};

/**
 * Method used to apply the growing policy.
 *
 * @param  {number} [override] - Override capacity.
 * @return {number}
 */
BitVector.prototype.applyPolicy = function(override) {
  var newCapacity = this.policy(override || this.capacity);

  if (typeof newCapacity !== 'number' || newCapacity < 0)
    throw new Error('mnemonist/bit-vector.applyPolicy: policy returned an invalid value (expecting a positive integer).');

  if (newCapacity <= this.capacity)
    throw new Error('mnemonist/bit-vector.applyPolicy: policy returned a less or equal capacity to allocate.');

  // TODO: we should probably check that the returned number is an integer

  // Ceil to nearest 32
  return Math.ceil(newCapacity / 32) * 32;
};

/**
 * Method used to reallocate the underlying array.
 *
 * @param  {number}       capacity - Target capacity.
 * @return {BitVector}
 */
BitVector.prototype.reallocate = function(capacity) {
  var virtualCapacity = capacity;

  capacity = Math.ceil(capacity / 32) * 32;

  if (virtualCapacity < this.length)
    this.length = virtualCapacity;

  if (capacity === this.capacity)
    return this;

  var oldArray = this.array;

  var storageLength = capacity / 32;

  if (storageLength === this.array.length)
    return this;

  if (storageLength > this.array.length) {
    this.array = new Uint32Array(storageLength);
    this.array.set(oldArray, 0);
  }
  else {
    this.array = oldArray.slice(0, storageLength);
  }

  this.capacity = capacity;

  return this;
};

/**
 * Method used to grow the array.
 *
 * @param  {number}       [capacity] - Optional capacity to match.
 * @return {BitVector}
 */
BitVector.prototype.grow = function(capacity) {
  var newCapacity;

  if (typeof capacity === 'number') {

    if (this.capacity >= capacity)
      return this;

    // We need to match the given capacity
    newCapacity = this.capacity;

    while (newCapacity < capacity)
      newCapacity = this.applyPolicy(newCapacity);

    this.reallocate(newCapacity);

    return this;
  }

  // We need to run the policy once
  newCapacity = this.applyPolicy();
  this.reallocate(newCapacity);

  return this;
};

/**
 * Method used to resize the array. Won't deallocate.
 *
 * @param  {number}       length - Target length.
 * @return {BitVector}
 */
BitVector.prototype.resize = function(length) {
  if (length === this.length)
    return this;

  if (length < this.length) {
    this.length = length;
    return this;
  }

  this.length = length;
  this.reallocate(length);

  return this;
};

/**
 * Method used to push a value in the set.
 *
 * @param  {number|boolean} value
 * @return {BitVector}
 */
BitVector.prototype.push = function(value) {
  if (this.capacity === this.length)
    this.grow();

  if (value === 0 || value === false)
    return ++this.length;

  this.size++;

  var index = this.length++,
      byteIndex = index >> 5,
      pos = index & 0x0000001f;

  this.array[byteIndex] |= (1 << pos);

  return this.length;
};

/**
 * Method used to pop the last value of the set.
 *
 * @return {number} - The popped value.
 */
BitVector.prototype.pop = function() {
  if (this.length === 0)
    return;

  var index = --this.length;

  var byteIndex = index >> 5,
      pos = index & 0x0000001f;

  return (this.array[byteIndex] >> pos) & 1;
};

/**
 * Method used to get the given bit's value.
 *
 * @param  {number} index - Target bit index.
 * @return {number}
 */
BitVector.prototype.get = function(index) {
  if (this.length < index)
    return undefined;

  var byteIndex = index >> 5,
      pos = index & 0x0000001f;

  return (this.array[byteIndex] >> pos) & 1;
};

/**
 * Method used to test the given bit's value.
 *
 * @param  {number} index - Target bit index.
 * @return {BitVector}
 */
BitVector.prototype.test = function(index) {
  if (this.length < index)
    return false;

  return Boolean(this.get(index));
};

/**
 * Method used to return the number of 1 from the beginning of the set up to
 * the ith index.
 *
 * @param  {number} i - Ith index (cannot be > length).
 * @return {number}
 */
BitVector.prototype.rank = function(i) {
  if (this.size === 0)
    return 0;

  var byteIndex = i >> 5,
      pos = i & 0x0000001f,
      r = 0;

  // Accessing the bytes before the last one
  for (var j = 0; j < byteIndex; j++)
    r += bitwise.table8Popcount(this.array[j]);

  // Handling masked last byte
  var maskedByte = this.array[byteIndex] & ((1 << pos) - 1);

  r += bitwise.table8Popcount(maskedByte);

  return r;
};

/**
 * Method used to return the position of the rth 1 in the set or -1 if the
 * set is empty.
 *
 * Note: usually select is implemented using binary search over rank but I
 * tend to think the following linear implementation is faster since here
 * rank is O(n) anyway.
 *
 * @param  {number} r - Rth 1 to select (should be < length).
 * @return {number}
 */
BitVector.prototype.select = function(r) {
  if (this.size === 0)
    return -1;

  // TODO: throw?
  if (r >= this.length)
    return -1;

  var byte,
      b = 32,
      p = 0,
      c = 0;

  for (var i = 0, l = this.array.length; i < l; i++) {
    byte = this.array[i];

    // The byte is empty, let's continue
    if (byte === 0)
      continue;

    // TODO: This branching might not be useful here
    if (i === l - 1)
      b = this.length % 32 || 32;

    // TODO: popcount should speed things up here

    for (var j = 0; j < b; j++, p++) {
      c += (byte >> j) & 1;

      if (c === r)
        return p;
    }
  }
};

/**
 * Method used to iterate over the bit set's values.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
BitVector.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  var length = this.length,
      byte,
      bit,
      b = 32;

  for (var i = 0, l = this.array.length; i < l; i++) {
    byte = this.array[i];

    if (i === l - 1)
      b = length % 32 || 32;

    for (var j = 0; j < b; j++) {
      bit = (byte >> j) & 1;

      callback.call(scope, bit, i * 32 + j);
    }
  }
};

/**
 * Method used to create an iterator over a set's values.
 *
 * @return {Iterator}
 */
BitVector.prototype.values = function() {
  var length = this.length,
      inner = false,
      byte,
      bit,
      array = this.array,
      l = array.length,
      i = 0,
      j = -1,
      b = 32;

  return new Iterator$f(function next() {
    if (!inner) {

      if (i >= l)
        return {
          done: true
        };

      if (i === l - 1)
        b = length % 32 || 32;

      byte = array[i++];
      inner = true;
      j = -1;
    }

    j++;

    if (j >= b) {
      inner = false;
      return next();
    }

    bit = (byte >> j) & 1;

    return {
      value: bit
    };
  });
};

/**
 * Method used to create an iterator over a set's entries.
 *
 * @return {Iterator}
 */
BitVector.prototype.entries = function() {
  var length = this.length,
      inner = false,
      byte,
      bit,
      array = this.array,
      index,
      l = array.length,
      i = 0,
      j = -1,
      b = 32;

  return new Iterator$f(function next() {
    if (!inner) {

      if (i >= l)
        return {
          done: true
        };

      if (i === l - 1)
        b = length % 32 || 32;

      byte = array[i++];
      inner = true;
      j = -1;
    }

    j++;
    index = (~-i) * 32 + j;

    if (j >= b) {
      inner = false;
      return next();
    }

    bit = (byte >> j) & 1;

    return {
      value: [index, bit]
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  BitVector.prototype[Symbol.iterator] = BitVector.prototype.values;

/**
 * Convenience known methods.
 */
BitVector.prototype.inspect = function() {
  var proxy = new Uint8Array(this.length);

  this.forEach(function(bit, i) {
    proxy[i] = bit;
  });

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: BitVector,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  BitVector.prototype[Symbol.for('nodejs.util.inspect.custom')] = BitVector.prototype.inspect;

BitVector.prototype.toJSON = function() {
  return Array.from(this.array.slice(0, (this.length >> 5) + 1));
};

/**
 * Exporting.
 */
var bitVector = BitVector;

/**
 * Mnemonist MurmurHash 3
 * =======================
 *
 * Straightforward implementation of the third version of MurmurHash.
 *
 * Note: this piece of code belong to haschisch.
 */

/**
 * Various helpers.
 */
function mul32(a, b) {
  return (a & 0xffff) * b + (((a >>> 16) * b & 0xffff) << 16) & 0xffffffff;
}

function sum32(a, b) {
  return (a & 0xffff) + (b >>> 16) + (((a >>> 16) + b & 0xffff) << 16) & 0xffffffff;
}

function rotl32(a, b) {
  return (a << b) | (a >>> (32 - b));
}

/**
 * MumurHash3 function.
 *
 * @param  {number}    seed - Seed.
 * @param  {ByteArray} data - Data.
 */
var murmurhash3$1 = function murmurhash3(seed, data) {
  var c1 = 0xcc9e2d51,
      c2 = 0x1b873593,
      r1 = 15,
      r2 = 13,
      m = 5,
      n = 0x6b64e654;

  var hash = seed,
      k1,
      i,
      l;

  for (i = 0, l = data.length - 4; i <= l; i += 4) {
    k1 = (
      data[i] |
      (data[i + 1] << 8) |
      (data[i + 2] << 16) |
      (data[i + 3] << 24)
    );

    k1 = mul32(k1, c1);
    k1 = rotl32(k1, r1);
    k1 = mul32(k1, c2);

    hash ^= k1;
    hash = rotl32(hash, r2);
    hash = mul32(hash, m);
    hash = sum32(hash, n);
  }

  k1 = 0;

  switch (data.length & 3) {
    case 3:
      k1 ^= data[i + 2] << 16;
    case 2:
      k1 ^= data[i + 1] << 8;
    case 1:
      k1 ^= data[i];
      k1 = mul32(k1, c1);
      k1 = rotl32(k1, r1);
      k1 = mul32(k1, c2);
      hash ^= k1;
  }

  hash ^= data.length;
  hash ^= hash >>> 16;
  hash = mul32(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = mul32(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;

  return hash >>> 0;
};

var murmurhash3 = murmurhash3$1,
    forEach$i = foreach;

/**
 * Constants.
 */
var LN2_SQUARED = Math.LN2 * Math.LN2;

/**
 * Defaults.
 */
var DEFAULTS = {
  errorRate: 0.005
};

/**
 * Function used to convert a string into a Uint16 byte array.
 *
 * @param  {string}      string - Target string.
 * @return {Uint16Array}
 */
function stringToByteArray(string) {
  var array = new Uint16Array(string.length),
      i,
      l;

  for (i = 0, l = string.length; i < l; i++)
    array[i] = string.charCodeAt(i);

  return array;
}

/**
 * Function used to hash the given byte array.
 *
 * @param  {number}      length - Length of the filter's byte array.
 * @param  {number}      seed   - Seed to use for the hash function.
 * @param  {Uint16Array}        - Byte array representing the string.
 * @return {number}             - The hash.
 *
 * @note length * 8 should probably already be computed as well as seeds.
 */
function hashArray(length, seed, array) {
  var hash = murmurhash3((seed * 0xFBA4C795) & 0xFFFFFFFF, array);

  return hash % (length * 8);
}

/**
 * Bloom Filter.
 *
 * @constructor
 * @param {number|object} capacityOrOptions - Capacity or options.
 */
function BloomFilter(capacityOrOptions) {
  var options = {};

  if (!capacityOrOptions)
    throw new Error('mnemonist/BloomFilter.constructor: a BloomFilter must be created with a capacity.');

  if (typeof capacityOrOptions === 'object')
    options = capacityOrOptions;
  else
    options.capacity = capacityOrOptions;

  // Handling capacity
  if (typeof options.capacity !== 'number' || options.capacity <= 0)
    throw new Error('mnemonist/BloomFilter.constructor: `capacity` option should be a positive integer.');

  this.capacity = options.capacity;

  // Handling error rate
  this.errorRate = options.errorRate || DEFAULTS.errorRate;

  if (typeof this.errorRate !== 'number' || options.errorRate <= 0)
    throw new Error('mnemonist/BloomFilter.constructor: `errorRate` option should be a positive float.');

  this.clear();
}

/**
 * Method used to clear the filter.
 *
 * @return {undefined}
 */
BloomFilter.prototype.clear = function() {

  // Optimizing number of bits & number of hash functions
  var bits = -1 / LN2_SQUARED * this.capacity * Math.log(this.errorRate),
      length = (bits / 8) | 0;

  this.hashFunctions = (length * 8 / this.capacity * Math.LN2) | 0;

  // Creating the data array
  this.data = new Uint8Array(length);

  return;
};

/**
 * Method used to add an string to the filter.
 *
 * @param  {string} string - Item to add.
 * @return {BloomFilter}
 *
 * @note Should probably create a hash function working directly on a string.
 */
BloomFilter.prototype.add = function(string) {

  // Converting the string to a byte array
  var array = stringToByteArray(string);

  // Applying the n hash functions
  for (var i = 0, l = this.hashFunctions; i < l; i++) {
    var index = hashArray(this.data.length, i, array),
        position = (1 << (7 & index));

    this.data[index >> 3] |= position;
  }

  return this;
};

/**
 * Method used to test the given string.
 *
 * @param  {string} string - Item to test.
 * @return {boolean}
 */
BloomFilter.prototype.test = function(string) {

  // Converting the string to a byte array
  var array = stringToByteArray(string);

  // Applying the n hash functions
  for (var i = 0, l = this.hashFunctions; i < l; i++) {
    var index = hashArray(this.data.length, i, array);

    if (!(this.data[index >> 3] & (1 << (7 & index))))
      return false;
  }

  return true;
};

/**
 * Convenience known methods.
 */
BloomFilter.prototype.toJSON = function() {
  return this.data;
};

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a filter.
 *
 * @param  {Iterable}    iterable - Target iterable.
 * @return {BloomFilter}
 */
BloomFilter.from = function(iterable, options) {
  if (!options) {
    options = iterable.length || iterable.size;

    if (typeof options !== 'number')
      throw new Error('BloomFilter.from: could not infer the filter\'s capacity. Try passing it as second argument.');
  }

  var filter = new BloomFilter(options);

  forEach$i(iterable, function(value) {
    filter.add(value);
  });

  return filter;
};

/**
 * Exporting.
 */
var bloomFilter = BloomFilter;

/**
 * Mnemonist BK Tree
 * ==================
 *
 * Implementation of a Burkhard-Keller tree, allowing fast lookups of words
 * that lie within a specified distance of the query word.
 *
 * [Reference]:
 * https://en.wikipedia.org/wiki/BK-tree
 *
 * [Article]:
 * W. Burkhard and R. Keller. Some approaches to best-match file searching,
 * CACM, 1973
 */
var forEach$h = foreach;

/**
 * BK Tree.
 *
 * @constructor
 * @param {function} distance - Distance function to use.
 */
function BKTree(distance) {

  if (typeof distance !== 'function')
    throw new Error('mnemonist/BKTree.constructor: given `distance` should be a function.');

  this.distance = distance;
  this.clear();
}

/**
 * Method used to add an item to the tree.
 *
 * @param  {any} item - Item to add.
 * @return {BKTree}
 */
BKTree.prototype.add = function(item) {

  // Initializing the tree with the first given word
  if (!this.root) {
    this.root = {
      item: item,
      children: {}
    };

    this.size++;
    return this;
  }

  var node = this.root,
      d;

  while (true) {
    d = this.distance(item, node.item);

    if (!node.children[d])
      break;

    node = node.children[d];
  }

  node.children[d] = {
    item: item,
    children: {}
  };

  this.size++;
  return this;
};

/**
 * Method used to query the tree.
 *
 * @param  {number} n     - Maximum distance between query & item.
 * @param  {any}    query - Query
 * @return {BKTree}
 */
BKTree.prototype.search = function(n, query) {
  if (!this.root)
    return [];

  var found = [],
      stack = [this.root],
      node,
      child,
      d,
      i,
      l;

  while (stack.length) {
    node = stack.pop();
    d = this.distance(query, node.item);

    if (d <= n)
      found.push({item: node.item, distance: d});

    for (i = d - n, l = d + n + 1; i < l; i++) {
      child = node.children[i];

      if (child)
        stack.push(child);
    }
  }

  return found;
};

/**
 * Method used to clear the tree.
 *
 * @return {undefined}
 */
BKTree.prototype.clear = function() {

  // Properties
  this.size = 0;
  this.root = null;
};

/**
 * Convenience known methods.
 */
BKTree.prototype.toJSON = function() {
  return this.root;
};

BKTree.prototype.inspect = function() {
  var array = [],
      stack = [this.root],
      node,
      d;

  while (stack.length) {
    node = stack.pop();

    if (!node)
      continue;

    array.push(node.item);

    for (d in node.children)
      stack.push(node.children[d]);
  }

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: BKTree,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  BKTree.prototype[Symbol.for('nodejs.util.inspect.custom')] = BKTree.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a tree.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @param  {function} distance - Distance function.
 * @return {Heap}
 */
BKTree.from = function(iterable, distance) {
  var tree = new BKTree(distance);

  forEach$h(iterable, function(value) {
    tree.add(value);
  });

  return tree;
};

/**
 * Exporting.
 */
var bkTree = BKTree;

var iterables$a = iterables$c,
    Iterator$e = iterator;

/**
 * FixedDeque.
 *
 * @constructor
 */
function FixedDeque$1(ArrayClass, capacity) {

  if (arguments.length < 2)
    throw new Error('mnemonist/fixed-deque: expecting an Array class and a capacity.');

  if (typeof capacity !== 'number' || capacity <= 0)
    throw new Error('mnemonist/fixed-deque: `capacity` should be a positive number.');

  this.ArrayClass = ArrayClass;
  this.capacity = capacity;
  this.items = new ArrayClass(this.capacity);
  this.clear();
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
FixedDeque$1.prototype.clear = function() {

  // Properties
  this.start = 0;
  this.size = 0;
};

/**
 * Method used to append a value to the deque.
 *
 * @param  {any}    item - Item to append.
 * @return {number}      - Returns the new size of the deque.
 */
FixedDeque$1.prototype.push = function(item) {
  if (this.size === this.capacity)
    throw new Error('mnemonist/fixed-deque.push: deque capacity (' + this.capacity + ') exceeded!');

  var index = (this.start + this.size) % this.capacity;

  this.items[index] = item;

  return ++this.size;
};

/**
 * Method used to prepend a value to the deque.
 *
 * @param  {any}    item - Item to prepend.
 * @return {number}      - Returns the new size of the deque.
 */
FixedDeque$1.prototype.unshift = function(item) {
  if (this.size === this.capacity)
    throw new Error('mnemonist/fixed-deque.unshift: deque capacity (' + this.capacity + ') exceeded!');

  var index = this.start - 1;

  if (this.start === 0)
    index = this.capacity - 1;

  this.items[index] = item;
  this.start = index;

  return ++this.size;
};

/**
 * Method used to pop the deque.
 *
 * @return {any} - Returns the popped item.
 */
FixedDeque$1.prototype.pop = function() {
  if (this.size === 0)
    return;

  const index = (this.start + this.size - 1) % this.capacity;

  this.size--;

  return this.items[index];
};

/**
 * Method used to shift the deque.
 *
 * @return {any} - Returns the shifted item.
 */
FixedDeque$1.prototype.shift = function() {
  if (this.size === 0)
    return;

  var index = this.start;

  this.size--;
  this.start++;

  if (this.start === this.capacity)
    this.start = 0;

  return this.items[index];
};

/**
 * Method used to peek the first value of the deque.
 *
 * @return {any}
 */
FixedDeque$1.prototype.peekFirst = function() {
  if (this.size === 0)
    return;

  return this.items[this.start];
};

/**
 * Method used to peek the last value of the deque.
 *
 * @return {any}
 */
FixedDeque$1.prototype.peekLast = function() {
  if (this.size === 0)
    return;

  var index = this.start + this.size - 1;

  if (index > this.capacity)
    index -= this.capacity;

  return this.items[index];
};

/**
 * Method used to get the desired value of the deque.
 *
 * @param  {number} index
 * @return {any}
 */
FixedDeque$1.prototype.get = function(index) {
  if (this.size === 0)
    return;

  index = this.start + index;

  if (index > this.capacity)
    index -= this.capacity;

  return this.items[index];
};

/**
 * Method used to iterate over the deque.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
FixedDeque$1.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  var c = this.capacity,
      l = this.size,
      i = this.start,
      j = 0;

  while (j < l) {
    callback.call(scope, this.items[i], j, this);
    i++;
    j++;

    if (i === c)
      i = 0;
  }
};

/**
 * Method used to convert the deque to a JavaScript array.
 *
 * @return {array}
 */
// TODO: optional array class as argument?
FixedDeque$1.prototype.toArray = function() {

  // Optimization
  var offset = this.start + this.size;

  if (offset < this.capacity)
    return this.items.slice(this.start, offset);

  var array = new this.ArrayClass(this.size),
      c = this.capacity,
      l = this.size,
      i = this.start,
      j = 0;

  while (j < l) {
    array[j] = this.items[i];
    i++;
    j++;

    if (i === c)
      i = 0;
  }

  return array;
};

/**
 * Method used to create an iterator over the deque's values.
 *
 * @return {Iterator}
 */
FixedDeque$1.prototype.values = function() {
  var items = this.items,
      c = this.capacity,
      l = this.size,
      i = this.start,
      j = 0;

  return new Iterator$e(function() {
    if (j >= l)
      return {
        done: true
      };

    var value = items[i];

    i++;
    j++;

    if (i === c)
      i = 0;

    return {
      value: value,
      done: false
    };
  });
};

/**
 * Method used to create an iterator over the deque's entries.
 *
 * @return {Iterator}
 */
FixedDeque$1.prototype.entries = function() {
  var items = this.items,
      c = this.capacity,
      l = this.size,
      i = this.start,
      j = 0;

  return new Iterator$e(function() {
    if (j >= l)
      return {
        done: true
      };

    var value = items[i];

    i++;

    if (i === c)
      i = 0;

    return {
      value: [j++, value],
      done: false
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  FixedDeque$1.prototype[Symbol.iterator] = FixedDeque$1.prototype.values;

/**
 * Convenience known methods.
 */
FixedDeque$1.prototype.inspect = function() {
  var array = this.toArray();

  array.type = this.ArrayClass.name;
  array.capacity = this.capacity;

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: FixedDeque$1,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  FixedDeque$1.prototype[Symbol.for('nodejs.util.inspect.custom')] = FixedDeque$1.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a deque.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @param  {function} ArrayClass - Array class to use.
 * @param  {number}   capacity   - Desired capacity.
 * @return {FiniteStack}
 */
FixedDeque$1.from = function(iterable, ArrayClass, capacity) {
  if (arguments.length < 3) {
    capacity = iterables$a.guessLength(iterable);

    if (typeof capacity !== 'number')
      throw new Error('mnemonist/fixed-deque.from: could not guess iterable length. Please provide desired capacity as last argument.');
  }

  var deque = new FixedDeque$1(ArrayClass, capacity);

  if (iterables$a.isArrayLike(iterable)) {
    var i, l;

    for (i = 0, l = iterable.length; i < l; i++)
      deque.items[i] = iterable[i];

    deque.size = l;

    return deque;
  }

  iterables$a.forEach(iterable, function(value) {
    deque.push(value);
  });

  return deque;
};

/**
 * Exporting.
 */
var fixedDeque = FixedDeque$1;

var iterables$9 = iterables$c,
    FixedDeque = fixedDeque;

/**
 * CircularBuffer.
 *
 * @constructor
 */
function CircularBuffer(ArrayClass, capacity) {

  if (arguments.length < 2)
    throw new Error('mnemonist/circular-buffer: expecting an Array class and a capacity.');

  if (typeof capacity !== 'number' || capacity <= 0)
    throw new Error('mnemonist/circular-buffer: `capacity` should be a positive number.');

  this.ArrayClass = ArrayClass;
  this.capacity = capacity;
  this.items = new ArrayClass(this.capacity);
  this.clear();
}

/**
 * Pasting most of the prototype from FixedDeque.
 */
function paste(name) {
  CircularBuffer.prototype[name] = FixedDeque.prototype[name];
}

Object.keys(FixedDeque.prototype).forEach(paste);

if (typeof Symbol !== 'undefined')
  Object.getOwnPropertySymbols(FixedDeque.prototype).forEach(paste);

/**
 * Method used to append a value to the buffer.
 *
 * @param  {any}    item - Item to append.
 * @return {number}      - Returns the new size of the buffer.
 */
CircularBuffer.prototype.push = function(item) {
  var index = (this.start + this.size) % this.capacity;

  this.items[index] = item;

  // Overwriting?
  if (this.size === this.capacity) {

    // If start is at the end, we wrap around the buffer
    this.start = (index + 1) % this.capacity;

    return this.size;
  }

  return ++this.size;
};

/**
 * Method used to prepend a value to the buffer.
 *
 * @param  {any}    item - Item to prepend.
 * @return {number}      - Returns the new size of the buffer.
 */
CircularBuffer.prototype.unshift = function(item) {
  var index = this.start - 1;

  if (this.start === 0)
    index = this.capacity - 1;

  this.items[index] = item;

  // Overwriting
  if (this.size === this.capacity) {

    this.start = index;

    return this.size;
  }

  this.start = index;

  return ++this.size;
};

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a circular buffer.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @param  {function} ArrayClass - Array class to use.
 * @param  {number}   capacity   - Desired capacity.
 * @return {FiniteStack}
 */
CircularBuffer.from = function(iterable, ArrayClass, capacity) {
  if (arguments.length < 3) {
    capacity = iterables$9.guessLength(iterable);

    if (typeof capacity !== 'number')
      throw new Error('mnemonist/circular-buffer.from: could not guess iterable length. Please provide desired capacity as last argument.');
  }

  var buffer = new CircularBuffer(ArrayClass, capacity);

  if (iterables$9.isArrayLike(iterable)) {
    var i, l;

    for (i = 0, l = iterable.length; i < l; i++)
      buffer.items[i] = iterable[i];

    buffer.size = l;

    return buffer;
  }

  iterables$9.forEach(iterable, function(value) {
    buffer.push(value);
  });

  return buffer;
};

/**
 * Exporting.
 */
var circularBuffer = CircularBuffer;

/**
 * DefaultMap.
 *
 * @constructor
 */
function DefaultMap(factory) {
  if (typeof factory !== 'function')
    throw new Error('mnemonist/DefaultMap.constructor: expecting a function.');

  this.items = new Map();
  this.factory = factory;
  this.size = 0;
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
DefaultMap.prototype.clear = function() {

  // Properties
  this.items.clear();
  this.size = 0;
};

/**
 * Method used to get the value set for given key. If the key does not exist,
 * the value will be created using the provided factory.
 *
 * @param  {any} key - Target key.
 * @return {any}
 */
DefaultMap.prototype.get = function(key) {
  var value = this.items.get(key);

  if (typeof value === 'undefined') {
    value = this.factory(key, this.size);
    this.items.set(key, value);
    this.size++;
  }

  return value;
};

/**
 * Method used to get the value set for given key. If the key does not exist,
 * a value won't be created.
 *
 * @param  {any} key - Target key.
 * @return {any}
 */
DefaultMap.prototype.peek = function(key) {
  return this.items.get(key);
};

/**
 * Method used to set a value for given key.
 *
 * @param  {any} key   - Target key.
 * @param  {any} value - Value.
 * @return {DefaultMap}
 */
DefaultMap.prototype.set = function(key, value) {
  this.items.set(key, value);
  this.size = this.items.size;

  return this;
};

/**
 * Method used to test the existence of a key in the map.
 *
 * @param  {any} key   - Target key.
 * @return {boolean}
 */
DefaultMap.prototype.has = function(key) {
  return this.items.has(key);
};

/**
 * Method used to delete target key.
 *
 * @param  {any} key   - Target key.
 * @return {boolean}
 */
DefaultMap.prototype.delete = function(key) {
  var deleted = this.items.delete(key);

  this.size = this.items.size;

  return deleted;
};

/**
 * Method used to iterate over each of the key/value pairs.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
DefaultMap.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  this.items.forEach(callback, scope);
};

/**
 * Iterators.
 */
DefaultMap.prototype.entries = function() {
  return this.items.entries();
};

DefaultMap.prototype.keys = function() {
  return this.items.keys();
};

DefaultMap.prototype.values = function() {
  return this.items.values();
};

/**
 * Attaching the #.entries method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  DefaultMap.prototype[Symbol.iterator] = DefaultMap.prototype.entries;

/**
 * Convenience known methods.
 */
DefaultMap.prototype.inspect = function() {
  return this.items;
};

if (typeof Symbol !== 'undefined')
  DefaultMap.prototype[Symbol.for('nodejs.util.inspect.custom')] = DefaultMap.prototype.inspect;

/**
 * Typical factories.
 */
DefaultMap.autoIncrement = function() {
  var i = 0;

  return function() {
    return i++;
  };
};

/**
 * Exporting.
 */
var defaultMap = DefaultMap;

/**
 * DefaultWeakMap.
 *
 * @constructor
 */
function DefaultWeakMap(factory) {
  if (typeof factory !== 'function')
    throw new Error('mnemonist/DefaultWeakMap.constructor: expecting a function.');

  this.items = new WeakMap();
  this.factory = factory;
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
DefaultWeakMap.prototype.clear = function() {

  // Properties
  this.items = new WeakMap();
};

/**
 * Method used to get the value set for given key. If the key does not exist,
 * the value will be created using the provided factory.
 *
 * @param  {any} key - Target key.
 * @return {any}
 */
DefaultWeakMap.prototype.get = function(key) {
  var value = this.items.get(key);

  if (typeof value === 'undefined') {
    value = this.factory(key);
    this.items.set(key, value);
  }

  return value;
};

/**
 * Method used to get the value set for given key. If the key does not exist,
 * a value won't be created.
 *
 * @param  {any} key - Target key.
 * @return {any}
 */
DefaultWeakMap.prototype.peek = function(key) {
  return this.items.get(key);
};

/**
 * Method used to set a value for given key.
 *
 * @param  {any} key   - Target key.
 * @param  {any} value - Value.
 * @return {DefaultMap}
 */
DefaultWeakMap.prototype.set = function(key, value) {
  this.items.set(key, value);
  return this;
};

/**
 * Method used to test the existence of a key in the map.
 *
 * @param  {any} key   - Target key.
 * @return {boolean}
 */
DefaultWeakMap.prototype.has = function(key) {
  return this.items.has(key);
};

/**
 * Method used to delete target key.
 *
 * @param  {any} key   - Target key.
 * @return {boolean}
 */
DefaultWeakMap.prototype.delete = function(key) {
  return this.items.delete(key);
};

/**
 * Convenience known methods.
 */
DefaultWeakMap.prototype.inspect = function() {
  return this.items;
};

if (typeof Symbol !== 'undefined')
  DefaultWeakMap.prototype[Symbol.for('nodejs.util.inspect.custom')] = DefaultWeakMap.prototype.inspect;

/**
 * Exporting.
 */
var defaultWeakMap = DefaultWeakMap;

/**
 * Mnemonist StaticDisjointSet
 * ============================
 *
 * JavaScript implementation of a static disjoint set (union-find).
 *
 * Note that to remain performant, this implementation needs to know a size
 * beforehand.
 */
var helpers$1 = typedArrays;

/**
 * StaticDisjointSet.
 *
 * @constructor
 */
function StaticDisjointSet(size) {

  // Optimizing the typed array types
  var ParentsTypedArray = helpers$1.getPointerArray(size),
      RanksTypedArray = helpers$1.getPointerArray(Math.log2(size));

  // Properties
  this.size = size;
  this.dimension = size;
  this.parents = new ParentsTypedArray(size);
  this.ranks = new RanksTypedArray(size);

  // Initializing parents
  for (var i = 0; i < size; i++)
    this.parents[i] = i;
}

/**
 * Method used to find the root of the given item.
 *
 * @param  {number} x - Target item.
 * @return {number}
 */
StaticDisjointSet.prototype.find = function(x) {
  var y = x;

  var c, p;

  while (true) {
    c = this.parents[y];

    if (y === c)
      break;

    y = c;
  }

  // Path compression
  while (true) {
    p = this.parents[x];

    if (p === y)
      break;

    this.parents[x] = y;
    x = p;
  }

  return y;
};

/**
 * Method used to perform the union of two items.
 *
 * @param  {number} x - First item.
 * @param  {number} y - Second item.
 * @return {StaticDisjointSet}
 */
StaticDisjointSet.prototype.union = function(x, y) {
  var xRoot = this.find(x),
      yRoot = this.find(y);

  // x and y are already in the same set
  if (xRoot === yRoot)
    return this;

  this.dimension--;

  // x and y are not in the same set, we merge them
  var xRank = this.ranks[x],
      yRank = this.ranks[y];

  if (xRank < yRank) {
    this.parents[xRoot] = yRoot;
  }
  else if (xRank > yRank) {
    this.parents[yRoot] = xRoot;
  }
  else {
    this.parents[yRoot] = xRoot;
    this.ranks[xRoot]++;
  }

  return this;
};

/**
 * Method returning whether two items are connected.
 *
 * @param  {number} x - First item.
 * @param  {number} y - Second item.
 * @return {boolean}
 */
StaticDisjointSet.prototype.connected = function(x, y) {
  var xRoot = this.find(x);

  return xRoot === this.find(y);
};

/**
 * Method returning the set mapping.
 *
 * @return {TypedArray}
 */
StaticDisjointSet.prototype.mapping = function() {
  var MappingClass = helpers$1.getPointerArray(this.dimension);

  var ids = {},
      mapping = new MappingClass(this.size),
      c = 0;

  var r;

  for (var i = 0, l = this.parents.length; i < l; i++) {
    r = this.find(i);

    if (typeof ids[r] === 'undefined') {
      mapping[i] = c;
      ids[r] = c++;
    }
    else {
      mapping[i] = ids[r];
    }
  }

  return mapping;
};

/**
 * Method used to compile the disjoint set into an array of arrays.
 *
 * @return {array}
 */
StaticDisjointSet.prototype.compile = function() {
  var ids = {},
      result = new Array(this.dimension),
      c = 0;

  var r;

  for (var i = 0, l = this.parents.length; i < l; i++) {
    r = this.find(i);

    if (typeof ids[r] === 'undefined') {
      result[c] = [i];
      ids[r] = c++;
    }
    else {
      result[ids[r]].push(i);
    }
  }

  return result;
};

/**
 * Convenience known methods.
 */
StaticDisjointSet.prototype.inspect = function() {
  var array = this.compile();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: StaticDisjointSet,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  StaticDisjointSet.prototype[Symbol.for('nodejs.util.inspect.custom')] = StaticDisjointSet.prototype.inspect;


/**
 * Exporting.
 */
var staticDisjointSet = StaticDisjointSet;

var comparators = comparators$3,
    Heap$2 = heap;

var DEFAULT_COMPARATOR = comparators.DEFAULT_COMPARATOR,
    reverseComparator = comparators.reverseComparator;

/**
 * Helper functions.
 */

/**
 * Function used to sift up.
 *
 * @param {function} compare - Comparison function.
 * @param {array}    heap    - Array storing the heap's data.
 * @param {number}   size    - Heap's true size.
 * @param {number}   i       - Index.
 */
function siftUp(compare, heap, size, i) {
  var endIndex = size,
      startIndex = i,
      item = heap[i],
      childIndex = 2 * i + 1,
      rightIndex;

  while (childIndex < endIndex) {
    rightIndex = childIndex + 1;

    if (
      rightIndex < endIndex &&
      compare(heap[childIndex], heap[rightIndex]) >= 0
    ) {
      childIndex = rightIndex;
    }

    heap[i] = heap[childIndex];
    i = childIndex;
    childIndex = 2 * i + 1;
  }

  heap[i] = item;
  Heap$2.siftDown(compare, heap, startIndex, i);
}

/**
 * Fully consumes the given heap.
 *
 * @param  {function} ArrayClass - Array class to use.
 * @param  {function} compare    - Comparison function.
 * @param  {array}    heap       - Array storing the heap's data.
 * @param  {number}   size       - True size of the heap.
 * @return {array}
 */
function consume(ArrayClass, compare, heap, size) {
  var l = size,
      i = l;

  var array = new ArrayClass(size),
      lastItem,
      item;

  while (i > 0) {
    lastItem = heap[--i];

    if (i !== 0) {
      item = heap[0];
      heap[0] = lastItem;
      siftUp(compare, heap, --size, 0);
      lastItem = item;
    }

    array[i] = lastItem;
  }

  return array;
}

/**
 * Binary Minimum FixedReverseHeap.
 *
 * @constructor
 * @param {function} ArrayClass - The class of array to use.
 * @param {function} comparator - Comparator function.
 * @param {number}   capacity   - Maximum number of items to keep.
 */
function FixedReverseHeap$2(ArrayClass, comparator, capacity) {

  // Comparator can be omitted
  if (arguments.length === 2) {
    capacity = comparator;
    comparator = null;
  }

  this.ArrayClass = ArrayClass;
  this.capacity = capacity;

  this.items = new ArrayClass(capacity);
  this.clear();
  this.comparator = comparator || DEFAULT_COMPARATOR;

  if (typeof capacity !== 'number' && capacity <= 0)
    throw new Error('mnemonist/FixedReverseHeap.constructor: capacity should be a number > 0.');

  if (typeof this.comparator !== 'function')
    throw new Error('mnemonist/FixedReverseHeap.constructor: given comparator should be a function.');

  this.comparator = reverseComparator(this.comparator);
}

/**
 * Method used to clear the heap.
 *
 * @return {undefined}
 */
FixedReverseHeap$2.prototype.clear = function() {

  // Properties
  this.size = 0;
};

/**
 * Method used to push an item into the heap.
 *
 * @param  {any}    item - Item to push.
 * @return {number}
 */
FixedReverseHeap$2.prototype.push = function(item) {

  // Still some place
  if (this.size < this.capacity) {
    this.items[this.size] = item;
    Heap$2.siftDown(this.comparator, this.items, 0, this.size);
    this.size++;
  }

  // Heap is full, we need to replace worst item
  else {

    if (this.comparator(item, this.items[0]) > 0)
      Heap$2.replace(this.comparator, this.items, item);
  }

  return this.size;
};

/**
 * Method used to peek the worst item in the heap.
 *
 * @return {any}
 */
FixedReverseHeap$2.prototype.peek = function() {
  return this.items[0];
};

/**
 * Method used to consume the heap fully and return its items as a sorted array.
 *
 * @return {array}
 */
FixedReverseHeap$2.prototype.consume = function() {
  var items = consume(this.ArrayClass, this.comparator, this.items, this.size);
  this.size = 0;

  return items;
};

/**
 * Method used to convert the heap to an array. Note that it basically clone
 * the heap and consumes it completely. This is hardly performant.
 *
 * @return {array}
 */
FixedReverseHeap$2.prototype.toArray = function() {
  return consume(this.ArrayClass, this.comparator, this.items.slice(0, this.size), this.size);
};

/**
 * Convenience known methods.
 */
FixedReverseHeap$2.prototype.inspect = function() {
  var proxy = this.toArray();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: FixedReverseHeap$2,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  FixedReverseHeap$2.prototype[Symbol.for('nodejs.util.inspect.custom')] = FixedReverseHeap$2.prototype.inspect;

/**
 * Exporting.
 */
var fixedReverseHeap = FixedReverseHeap$2;

var forEach$g = foreach;

var identity$2 = function(x) {
  return x;
};

/**
 * FuzzyMap.
 *
 * @constructor
 * @param {array|function} descriptor - Hash functions descriptor.
 */
function FuzzyMap(descriptor) {
  this.items = new Map();
  this.clear();

  if (Array.isArray(descriptor)) {
    this.writeHashFunction = descriptor[0];
    this.readHashFunction = descriptor[1];
  }
  else {
    this.writeHashFunction = descriptor;
    this.readHashFunction = descriptor;
  }

  if (!this.writeHashFunction)
    this.writeHashFunction = identity$2;
  if (!this.readHashFunction)
    this.readHashFunction = identity$2;

  if (typeof this.writeHashFunction !== 'function')
    throw new Error('mnemonist/FuzzyMap.constructor: invalid hash function given.');

  if (typeof this.readHashFunction !== 'function')
    throw new Error('mnemonist/FuzzyMap.constructor: invalid hash function given.');
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
FuzzyMap.prototype.clear = function() {
  this.items.clear();

  // Properties
  this.size = 0;
};

/**
 * Method used to add an item to the FuzzyMap.
 *
 * @param  {any} item - Item to add.
 * @return {FuzzyMap}
 */
FuzzyMap.prototype.add = function(item) {
  var key = this.writeHashFunction(item);

  this.items.set(key, item);
  this.size = this.items.size;

  return this;
};

/**
 * Method used to set an item in the FuzzyMap using the given key.
 *
 * @param  {any} key  - Key to use.
 * @param  {any} item - Item to add.
 * @return {FuzzyMap}
 */
FuzzyMap.prototype.set = function(key, item) {
  key = this.writeHashFunction(key);

  this.items.set(key, item);
  this.size = this.items.size;

  return this;
};

/**
 * Method used to retrieve an item from the FuzzyMap.
 *
 * @param  {any} key - Key to use.
 * @return {any}
 */
FuzzyMap.prototype.get = function(key) {
  key = this.readHashFunction(key);

  return this.items.get(key);
};

/**
 * Method used to test the existence of an item in the map.
 *
 * @param  {any} key - Key to check.
 * @return {boolean}
 */
FuzzyMap.prototype.has = function(key) {
  key = this.readHashFunction(key);

  return this.items.has(key);
};

/**
 * Method used to iterate over each of the FuzzyMap's values.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
FuzzyMap.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  this.items.forEach(function(value) {
    callback.call(scope, value, value);
  });
};

/**
 * Method returning an iterator over the FuzzyMap's values.
 *
 * @return {FuzzyMapIterator}
 */
FuzzyMap.prototype.values = function() {
  return this.items.values();
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  FuzzyMap.prototype[Symbol.iterator] = FuzzyMap.prototype.values;

/**
 * Convenience known method.
 */
FuzzyMap.prototype.inspect = function() {
  var array = Array.from(this.items.values());

  Object.defineProperty(array, 'constructor', {
    value: FuzzyMap,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  FuzzyMap.prototype[Symbol.for('nodejs.util.inspect.custom')] = FuzzyMap.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable}       iterable   - Target iterable.
 * @param  {array|function} descriptor - Hash functions descriptor.
 * @param  {boolean}        useSet     - Whether to use #.set or #.add
 * @return {FuzzyMap}
 */
FuzzyMap.from = function(iterable, descriptor, useSet) {
  var map = new FuzzyMap(descriptor);

  forEach$g(iterable, function(value, key) {
    if (useSet)
      map.set(key, value);
    else
      map.add(value);
  });

  return map;
};

/**
 * Exporting.
 */
var fuzzyMap = FuzzyMap;

var Iterator$d = iterator,
    forEach$f = foreach;

/**
 * MultiMap.
 *
 * @constructor
 */
function MultiMap$1(Container) {

  this.Container = Container || Array;
  this.items = new Map();
  this.clear();

  Object.defineProperty(this.items, 'constructor', {
    value: MultiMap$1,
    enumerable: false
  });
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
MultiMap$1.prototype.clear = function() {

  // Properties
  this.size = 0;
  this.dimension = 0;
  this.items.clear();
};

/**
 * Method used to set a value.
 *
 * @param  {any}      key   - Key.
 * @param  {any}      value - Value to add.
 * @return {MultiMap}
 */
MultiMap$1.prototype.set = function(key, value) {
  var container = this.items.get(key),
      sizeBefore;

  if (!container) {
    this.dimension++;
    container = new this.Container();
    this.items.set(key, container);
  }

  if (this.Container === Set) {
    sizeBefore = container.size;
    container.add(value);

    if (sizeBefore < container.size)
      this.size++;
  }
  else {
    container.push(value);
    this.size++;
  }

  return this;
};

/**
 * Method used to delete the given key.
 *
 * @param  {any}     key - Key to delete.
 * @return {boolean}
 */
MultiMap$1.prototype.delete = function(key) {
  var container = this.items.get(key);

  if (!container)
    return false;

  this.size -= (this.Container === Set ? container.size : container.length);
  this.dimension--;
  this.items.delete(key);

  return true;
};

/**
 * Method used to delete the remove an item in the container stored at the
 * given key.
 *
 * @param  {any}     key - Key to delete.
 * @return {boolean}
 */
MultiMap$1.prototype.remove = function(key, value) {
  var container = this.items.get(key),
      wasDeleted,
      index;

  if (!container)
    return false;

  if (this.Container === Set) {
    wasDeleted = container.delete(value);

    if (wasDeleted)
      this.size--;

    if (container.size === 0) {
      this.items.delete(key);
      this.dimension--;
    }

    return wasDeleted;
  }
  else {
    index = container.indexOf(value);

    if (index === -1)
      return false;

    this.size--;

    if (container.length === 1) {
      this.items.delete(key);
      this.dimension--;

      return true;
    }

    container.splice(index, 1);

    return true;
  }
};

/**
 * Method used to return whether the given keys exists in the map.
 *
 * @param  {any}     key - Key to check.
 * @return {boolean}
 */
MultiMap$1.prototype.has = function(key) {
  return this.items.has(key);
};

/**
 * Method used to return the container stored at the given key or `undefined`.
 *
 * @param  {any}     key - Key to get.
 * @return {boolean}
 */
MultiMap$1.prototype.get = function(key) {
  return this.items.get(key);
};

/**
 * Method used to return the multiplicity of the given key, meaning the number
 * of times it is set, or, more trivially, the size of the attached container.
 *
 * @param  {any}     key - Key to check.
 * @return {number}
 */
MultiMap$1.prototype.multiplicity = function(key) {
  var container = this.items.get(key);

  if (typeof container === 'undefined')
    return 0;

  return this.Container === Set ? container.size : container.length;
};
MultiMap$1.prototype.count = MultiMap$1.prototype.multiplicity;

/**
 * Method used to iterate over each of the key/value pairs.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
MultiMap$1.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  // Inner iteration function is created here to avoid creating it in the loop
  var key;
  function inner(value) {
    callback.call(scope, value, key);
  }

  this.items.forEach(function(container, k) {
    key = k;
    container.forEach(inner);
  });
};

/**
 * Method used to iterate over each of the associations.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
MultiMap$1.prototype.forEachAssociation = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  this.items.forEach(callback, scope);
};

/**
 * Method returning an iterator over the map's keys.
 *
 * @return {Iterator}
 */
MultiMap$1.prototype.keys = function() {
  return this.items.keys();
};

/**
 * Method returning an iterator over the map's keys.
 *
 * @return {Iterator}
 */
MultiMap$1.prototype.values = function() {
  var iterator = this.items.values(),
      inContainer = false,
      countainer,
      step,
      i,
      l;

  if (this.Container === Set)
    return new Iterator$d(function next() {
      if (!inContainer) {
        step = iterator.next();

        if (step.done)
          return {done: true};

        inContainer = true;
        countainer = step.value.values();
      }

      step = countainer.next();

      if (step.done) {
        inContainer = false;
        return next();
      }

      return {
        done: false,
        value: step.value
      };
    });

  return new Iterator$d(function next() {
    if (!inContainer) {
      step = iterator.next();

      if (step.done)
        return {done: true};

      inContainer = true;
      countainer = step.value;
      i = 0;
      l = countainer.length;
    }

    if (i >= l) {
      inContainer = false;
      return next();
    }

    return {
      done: false,
      value: countainer[i++]
    };
  });
};

/**
 * Method returning an iterator over the map's entries.
 *
 * @return {Iterator}
 */
MultiMap$1.prototype.entries = function() {
  var iterator = this.items.entries(),
      inContainer = false,
      countainer,
      step,
      key,
      i,
      l;

  if (this.Container === Set)
    return new Iterator$d(function next() {
      if (!inContainer) {
        step = iterator.next();

        if (step.done)
          return {done: true};

        inContainer = true;
        key = step.value[0];
        countainer = step.value[1].values();
      }

      step = countainer.next();

      if (step.done) {
        inContainer = false;
        return next();
      }

      return {
        done: false,
        value: [key, step.value]
      };
    });

  return new Iterator$d(function next() {
    if (!inContainer) {
      step = iterator.next();

      if (step.done)
        return {done: true};

      inContainer = true;
      key = step.value[0];
      countainer = step.value[1];
      i = 0;
      l = countainer.length;
    }

    if (i >= l) {
      inContainer = false;
      return next();
    }

    return {
      done: false,
      value: [key, countainer[i++]]
    };
  });
};

/**
 * Method returning an iterator over the map's containers.
 *
 * @return {Iterator}
 */
MultiMap$1.prototype.containers = function() {
  return this.items.values();
};

/**
 * Method returning an iterator over the map's associations.
 *
 * @return {Iterator}
 */
MultiMap$1.prototype.associations = function() {
  return this.items.entries();
};

/**
 * Attaching the #.entries method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  MultiMap$1.prototype[Symbol.iterator] = MultiMap$1.prototype.entries;

/**
 * Convenience known methods.
 */
MultiMap$1.prototype.inspect = function() {
  return this.items;
};

if (typeof Symbol !== 'undefined')
  MultiMap$1.prototype[Symbol.for('nodejs.util.inspect.custom')] = MultiMap$1.prototype.inspect;
MultiMap$1.prototype.toJSON = function() {
  return this.items;
};

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable} iterable  - Target iterable.
 * @param  {Class}    Container - Container.
 * @return {MultiMap}
 */
MultiMap$1.from = function(iterable, Container) {
  var map = new MultiMap$1(Container);

  forEach$f(iterable, function(value, key) {
    map.set(key, value);
  });

  return map;
};

/**
 * Exporting.
 */
var multiMap = MultiMap$1;

var MultiMap = multiMap,
    forEach$e = foreach;

var identity$1 = function(x) {
  return x;
};

/**
 * FuzzyMultiMap.
 *
 * @constructor
 * @param {array|function} descriptor - Hash functions descriptor.
 * @param {function}       Container  - Container to use.
 */
function FuzzyMultiMap(descriptor, Container) {
  this.items = new MultiMap(Container);
  this.clear();

  if (Array.isArray(descriptor)) {
    this.writeHashFunction = descriptor[0];
    this.readHashFunction = descriptor[1];
  }
  else {
    this.writeHashFunction = descriptor;
    this.readHashFunction = descriptor;
  }

  if (!this.writeHashFunction)
    this.writeHashFunction = identity$1;
  if (!this.readHashFunction)
    this.readHashFunction = identity$1;

  if (typeof this.writeHashFunction !== 'function')
    throw new Error('mnemonist/FuzzyMultiMap.constructor: invalid hash function given.');

  if (typeof this.readHashFunction !== 'function')
    throw new Error('mnemonist/FuzzyMultiMap.constructor: invalid hash function given.');
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
FuzzyMultiMap.prototype.clear = function() {
  this.items.clear();

  // Properties
  this.size = 0;
  this.dimension = 0;
};

/**
 * Method used to add an item to the index.
 *
 * @param  {any} item - Item to add.
 * @return {FuzzyMultiMap}
 */
FuzzyMultiMap.prototype.add = function(item) {
  var key = this.writeHashFunction(item);

  this.items.set(key, item);
  this.size = this.items.size;
  this.dimension = this.items.dimension;

  return this;
};

/**
 * Method used to set an item in the index using the given key.
 *
 * @param  {any} key  - Key to use.
 * @param  {any} item - Item to add.
 * @return {FuzzyMultiMap}
 */
FuzzyMultiMap.prototype.set = function(key, item) {
  key = this.writeHashFunction(key);

  this.items.set(key, item);
  this.size = this.items.size;
  this.dimension = this.items.dimension;

  return this;
};

/**
 * Method used to retrieve an item from the index.
 *
 * @param  {any} key - Key to use.
 * @return {any}
 */
FuzzyMultiMap.prototype.get = function(key) {
  key = this.readHashFunction(key);

  return this.items.get(key);
};

/**
 * Method used to test the existence of an item in the map.
 *
 * @param  {any} key - Key to check.
 * @return {boolean}
 */
FuzzyMultiMap.prototype.has = function(key) {
  key = this.readHashFunction(key);

  return this.items.has(key);
};

/**
 * Method used to iterate over each of the index's values.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
FuzzyMultiMap.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  this.items.forEach(function(value) {
    callback.call(scope, value, value);
  });
};

/**
 * Method returning an iterator over the index's values.
 *
 * @return {FuzzyMultiMapIterator}
 */
FuzzyMultiMap.prototype.values = function() {
  return this.items.values();
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  FuzzyMultiMap.prototype[Symbol.iterator] = FuzzyMultiMap.prototype.values;

/**
 * Convenience known method.
 */
FuzzyMultiMap.prototype.inspect = function() {
  var array = Array.from(this);

  Object.defineProperty(array, 'constructor', {
    value: FuzzyMultiMap,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  FuzzyMultiMap.prototype[Symbol.for('nodejs.util.inspect.custom')] = FuzzyMultiMap.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable}       iterable   - Target iterable.
 * @param  {array|function} descriptor - Hash functions descriptor.
 * @param  {function}       Container  - Container to use.
 * @param  {boolean}        useSet     - Whether to use #.set or #.add
 * @return {FuzzyMultiMap}
 */
FuzzyMultiMap.from = function(iterable, descriptor, Container, useSet) {
  if (arguments.length === 3) {
    if (typeof Container === 'boolean') {
      useSet = Container;
      Container = Array;
    }
  }

  var map = new FuzzyMultiMap(descriptor, Container);

  forEach$e(iterable, function(value, key) {
    if (useSet)
      map.set(key, value);
    else
      map.add(value);
  });

  return map;
};

/**
 * Exporting.
 */
var fuzzyMultiMap = FuzzyMultiMap;

/**
 * Defaults.
 */
var DEFAULT_BLOCK_SIZE = 1024;

/**
 * Helpers.
 */
function powerOfTwo(x) {
  return (x & (x - 1)) === 0;
}

/**
 * HashedArrayTree.
 *
 * @constructor
 * @param {function}      ArrayClass           - An array constructor.
 * @param {number|object} initialCapacityOrOptions - Self-explanatory.
 */
function HashedArrayTree(ArrayClass, initialCapacityOrOptions) {
  if (arguments.length < 1)
    throw new Error('mnemonist/hashed-array-tree: expecting at least a byte array constructor.');

  var initialCapacity = initialCapacityOrOptions || 0,
      blockSize = DEFAULT_BLOCK_SIZE,
      initialLength = 0;

  if (typeof initialCapacityOrOptions === 'object') {
    initialCapacity = initialCapacityOrOptions.initialCapacity || 0;
    initialLength = initialCapacityOrOptions.initialLength || 0;
    blockSize = initialCapacityOrOptions.blockSize || DEFAULT_BLOCK_SIZE;
  }

  if (!blockSize || !powerOfTwo(blockSize))
    throw new Error('mnemonist/hashed-array-tree: block size should be a power of two.');

  var capacity = Math.max(initialLength, initialCapacity),
      initialBlocks = Math.ceil(capacity / blockSize);

  this.ArrayClass = ArrayClass;
  this.length = initialLength;
  this.capacity = initialBlocks * blockSize;
  this.blockSize = blockSize;
  this.offsetMask = blockSize - 1;
  this.blockMask = Math.log2(blockSize);

  // Allocating initial blocks
  this.blocks = new Array(initialBlocks);

  for (var i = 0; i < initialBlocks; i++)
    this.blocks[i] = new this.ArrayClass(this.blockSize);
}

/**
 * Method used to set a value.
 *
 * @param  {number} index - Index to edit.
 * @param  {any}    value - Value.
 * @return {HashedArrayTree}
 */
HashedArrayTree.prototype.set = function(index, value) {

  // Out of bounds?
  if (this.length < index)
    throw new Error('HashedArrayTree(' + this.ArrayClass.name + ').set: index out of bounds.');

  var block = index >> this.blockMask,
      i = index & this.offsetMask;

  this.blocks[block][i] = value;

  return this;
};

/**
 * Method used to get a value.
 *
 * @param  {number} index - Index to retrieve.
 * @return {any}
 */
HashedArrayTree.prototype.get = function(index) {
  if (this.length < index)
    return;

  var block = index >> this.blockMask,
      i = index & this.offsetMask;

  return this.blocks[block][i];
};

/**
 * Method used to grow the array.
 *
 * @param  {number}          capacity - Optional capacity to accomodate.
 * @return {HashedArrayTree}
 */
HashedArrayTree.prototype.grow = function(capacity) {
  if (typeof capacity !== 'number')
    capacity = this.capacity + this.blockSize;

  if (this.capacity >= capacity)
    return this;

  while (this.capacity < capacity) {
    this.blocks.push(new this.ArrayClass(this.blockSize));
    this.capacity += this.blockSize;
  }

  return this;
};

/**
 * Method used to resize the array. Won't deallocate.
 *
 * @param  {number}       length - Target length.
 * @return {HashedArrayTree}
 */
HashedArrayTree.prototype.resize = function(length) {
  if (length === this.length)
    return this;

  if (length < this.length) {
    this.length = length;
    return this;
  }

  this.length = length;
  this.grow(length);

  return this;
};

/**
 * Method used to push a value into the array.
 *
 * @param  {any}    value - Value to push.
 * @return {number}       - Length of the array.
 */
HashedArrayTree.prototype.push = function(value) {
  if (this.capacity === this.length)
    this.grow();

  var index = this.length;

  var block = index >> this.blockMask,
      i = index & this.offsetMask;

  this.blocks[block][i] = value;

  return ++this.length;
};

/**
 * Method used to pop the last value of the array.
 *
 * @return {number} - The popped value.
 */
HashedArrayTree.prototype.pop = function() {
  if (this.length === 0)
    return;

  var lastBlock = this.blocks[this.blocks.length - 1];

  var i = (--this.length) & this.offsetMask;

  return lastBlock[i];
};

/**
 * Convenience known methods.
 */
HashedArrayTree.prototype.inspect = function() {
  var proxy = new this.ArrayClass(this.length),
      block;

  for (var i = 0, l = this.length; i < l; i++) {
    block = i >> this.blockMask;
    proxy[i] = this.blocks[block][i & this.offsetMask];
  }

  proxy.type = this.ArrayClass.name;
  proxy.items = this.length;
  proxy.capacity = this.capacity;
  proxy.blockSize = this.blockSize;

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: HashedArrayTree,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  HashedArrayTree.prototype[Symbol.for('nodejs.util.inspect.custom')] = HashedArrayTree.prototype.inspect;

/**
 * Exporting.
 */
var hashedArrayTree = HashedArrayTree;

var Iterator$c = iterator,
    iterables$8 = iterables$c;

/**
 * FixedStack
 *
 * @constructor
 * @param {function} ArrayClass - Array class to use.
 * @param {number}   capacity   - Desired capacity.
 */
function FixedStack$1(ArrayClass, capacity) {

  if (arguments.length < 2)
    throw new Error('mnemonist/fixed-stack: expecting an Array class and a capacity.');

  if (typeof capacity !== 'number' || capacity <= 0)
    throw new Error('mnemonist/fixed-stack: `capacity` should be a positive number.');

  this.capacity = capacity;
  this.ArrayClass = ArrayClass;
  this.items = new this.ArrayClass(this.capacity);
  this.clear();
}

/**
 * Method used to clear the stack.
 *
 * @return {undefined}
 */
FixedStack$1.prototype.clear = function() {

  // Properties
  this.size = 0;
};

/**
 * Method used to add an item to the stack.
 *
 * @param  {any}    item - Item to add.
 * @return {number}
 */
FixedStack$1.prototype.push = function(item) {
  if (this.size === this.capacity)
    throw new Error('mnemonist/fixed-stack.push: stack capacity (' + this.capacity + ') exceeded!');

  this.items[this.size++] = item;
  return this.size;
};

/**
 * Method used to retrieve & remove the last item of the stack.
 *
 * @return {any}
 */
FixedStack$1.prototype.pop = function() {
  if (this.size === 0)
    return;

  return this.items[--this.size];
};

/**
 * Method used to get the last item of the stack.
 *
 * @return {any}
 */
FixedStack$1.prototype.peek = function() {
  return this.items[this.size - 1];
};

/**
 * Method used to iterate over the stack.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
FixedStack$1.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  for (var i = 0, l = this.items.length; i < l; i++)
    callback.call(scope, this.items[l - i - 1], i, this);
};

/**
 * Method used to convert the stack to a JavaScript array.
 *
 * @return {array}
 */
FixedStack$1.prototype.toArray = function() {
  var array = new this.ArrayClass(this.size),
      l = this.size - 1,
      i = this.size;

  while (i--)
    array[i] = this.items[l - i];

  return array;
};

/**
 * Method used to create an iterator over a stack's values.
 *
 * @return {Iterator}
 */
FixedStack$1.prototype.values = function() {
  var items = this.items,
      l = this.size,
      i = 0;

  return new Iterator$c(function() {
    if (i >= l)
      return {
        done: true
      };

    var value = items[l - i - 1];
    i++;

    return {
      value: value,
      done: false
    };
  });
};

/**
 * Method used to create an iterator over a stack's entries.
 *
 * @return {Iterator}
 */
FixedStack$1.prototype.entries = function() {
  var items = this.items,
      l = this.size,
      i = 0;

  return new Iterator$c(function() {
    if (i >= l)
      return {
        done: true
      };

    var value = items[l - i - 1];

    return {
      value: [i++, value],
      done: false
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  FixedStack$1.prototype[Symbol.iterator] = FixedStack$1.prototype.values;


/**
 * Convenience known methods.
 */
FixedStack$1.prototype.toString = function() {
  return this.toArray().join(',');
};

FixedStack$1.prototype.toJSON = function() {
  return this.toArray();
};

FixedStack$1.prototype.inspect = function() {
  var array = this.toArray();

  array.type = this.ArrayClass.name;
  array.capacity = this.capacity;

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: FixedStack$1,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  FixedStack$1.prototype[Symbol.for('nodejs.util.inspect.custom')] = FixedStack$1.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a stack.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @param  {function} ArrayClass - Array class to use.
 * @param  {number}   capacity   - Desired capacity.
 * @return {FixedStack}
 */
FixedStack$1.from = function(iterable, ArrayClass, capacity) {

  if (arguments.length < 3) {
    capacity = iterables$8.guessLength(iterable);

    if (typeof capacity !== 'number')
      throw new Error('mnemonist/fixed-stack.from: could not guess iterable length. Please provide desired capacity as last argument.');
  }

  var stack = new FixedStack$1(ArrayClass, capacity);

  if (iterables$8.isArrayLike(iterable)) {
    var i, l;

    for (i = 0, l = iterable.length; i < l; i++)
      stack.items[i] = iterable[i];

    stack.size = l;

    return stack;
  }

  iterables$8.forEach(iterable, function(value) {
    stack.push(value);
  });

  return stack;
};

/**
 * Exporting.
 */
var fixedStack = FixedStack$1;

var iterables$7 = iterables$c,
    typed$7 = typedArrays;

var FixedStack = fixedStack;


// TODO: pass index to getters
// TODO: custom comparison
// TODO: possibility to pass offset buffer

// TODO: intervals() => Symbol.iterator
// TODO: dfs()

/**
 * Helpers.
 */

/**
 * Recursive function building the BST from the sorted list of interval
 * indices.
 *
 * @param  {array}    intervals     - Array of intervals to index.
 * @param  {function} endGetter     - Getter function for end of intervals.
 * @param  {array}    sortedIndices - Sorted indices of the intervals.
 * @param  {array}    tree          - BST memory.
 * @param  {array}    augmentations - Array of node augmentations.
 * @param  {number}   i             - BST index of current node.
 * @param  {number}   low           - Dichotomy low index.
 * @param  {number}   high          - Dichotomy high index.
 * @return {number}                 - Created node augmentation value.
 */
function buildBST(
  intervals,
  endGetter,
  sortedIndices,
  tree,
  augmentations,
  i,
  low,
  high
) {
  var mid = (low + (high - low) / 2) | 0,
      midMinusOne = ~-mid,
      midPlusOne = -~mid;

  var current = sortedIndices[mid];
  tree[i] = current + 1;

  var end = endGetter ? endGetter(intervals[current]) : intervals[current][1];

  var left = i * 2 + 1,
      right = i * 2 + 2;

  var leftEnd = -Infinity,
      rightEnd = -Infinity;

  if (low <= midMinusOne) {
    leftEnd = buildBST(
      intervals,
      endGetter,
      sortedIndices,
      tree,
      augmentations,
      left,
      low,
      midMinusOne
    );
  }

  if (midPlusOne <= high) {
    rightEnd = buildBST(
      intervals,
      endGetter,
      sortedIndices,
      tree,
      augmentations,
      right,
      midPlusOne,
      high
    );
  }

  var augmentation = Math.max(end, leftEnd, rightEnd);

  var augmentationPointer = current;

  if (augmentation === leftEnd)
    augmentationPointer = augmentations[tree[left] - 1];
  else if (augmentation === rightEnd)
    augmentationPointer = augmentations[tree[right] - 1];

  augmentations[current] = augmentationPointer;

  return augmentation;
}

/**
 * StaticIntervalTree.
 *
 * @constructor
 * @param {array}           intervals - Array of intervals to index.
 * @param {array<function>} getters   - Optional getters.
 */
function StaticIntervalTree(intervals, getters) {

  // Properties
  this.size = intervals.length;
  this.intervals = intervals;

  var startGetter = null,
      endGetter = null;

  if (Array.isArray(getters)) {
    startGetter = getters[0];
    endGetter = getters[1];
  }

  // Building the indices array
  var length = intervals.length;

  var IndicesArray = typed$7.getPointerArray(length + 1);

  var indices = new IndicesArray(length);

  var i;

  for (i = 1; i < length; i++)
    indices[i] = i;

  // Sorting indices array
  // TODO: check if some version of radix sort can outperform this part
  indices.sort(function(a, b) {
    a = intervals[a];
    b = intervals[b];

    if (startGetter) {
      a = startGetter(a);
      b = startGetter(b);
    }
    else {
      a = a[0];
      b = b[0];
    }

    if (a < b)
      return -1;

    if (a > b)
      return 1;

    // TODO: use getters
    // TODO: this ordering has the following invariant: if query interval
    // contains [nodeStart, max], then whole right subtree can be collected
    // a = a[1];
    // b = b[1];

    // if (a < b)
    //   return 1;

    // if (a > b)
    //   return -1;

    return 0;
  });

  // Building the binary tree
  var height = Math.ceil(Math.log2(length + 1)),
      treeSize = Math.pow(2, height) - 1;

  var tree = new IndicesArray(treeSize);

  var augmentations = new IndicesArray(length);

  buildBST(
    intervals,
    endGetter,
    indices,
    tree,
    augmentations,
    0,
    0,
    length - 1
  );

  // Dropping indices
  indices = null;

  // Storing necessary information
  this.height = height;
  this.tree = tree;
  this.augmentations = augmentations;
  this.startGetter = startGetter;
  this.endGetter = endGetter;

  // Initializing DFS stack
  this.stack = new FixedStack(IndicesArray, this.height);
}

/**
 * Method returning a list of intervals containing the given point.
 *
 * @param  {any}   point - Target point.
 * @return {array}
 */
StaticIntervalTree.prototype.intervalsContainingPoint = function(point) {
  var matches = [];

  var stack = this.stack;

  stack.clear();
  stack.push(0);

  var l = this.tree.length;

  var bstIndex,
      intervalIndex,
      interval,
      maxInterval,
      start,
      end,
      max,
      left,
      right;

  while (stack.size) {
    bstIndex = stack.pop();
    intervalIndex = this.tree[bstIndex] - 1;
    interval = this.intervals[intervalIndex];
    maxInterval = this.intervals[this.augmentations[intervalIndex]];

    max = this.endGetter ? this.endGetter(maxInterval) : maxInterval[1];

    // No possible match, point is farther right than the max end value
    if (point > max)
      continue;

    // Searching left
    left = bstIndex * 2 + 1;

    if (left < l && this.tree[left] !== 0)
      stack.push(left);

    start = this.startGetter ? this.startGetter(interval) : interval[0];
    end = this.endGetter ? this.endGetter(interval) : interval[1];

    // Checking current node
    if (point >= start && point <= end)
      matches.push(interval);

    // If the point is to the left of the start of the current interval,
    // then it cannot be in the right child
    if (point < start)
      continue;

    // Searching right
    right = bstIndex * 2 + 2;

    if (right < l && this.tree[right] !== 0)
      stack.push(right);
  }

  return matches;
};

/**
 * Method returning a list of intervals overlapping the given interval.
 *
 * @param  {any}   interval - Target interval.
 * @return {array}
 */
StaticIntervalTree.prototype.intervalsOverlappingInterval = function(interval) {
  var intervalStart = this.startGetter ? this.startGetter(interval) : interval[0],
      intervalEnd = this.endGetter ? this.endGetter(interval) : interval[1];

  var matches = [];

  var stack = this.stack;

  stack.clear();
  stack.push(0);

  var l = this.tree.length;

  var bstIndex,
      intervalIndex,
      currentInterval,
      maxInterval,
      start,
      end,
      max,
      left,
      right;

  while (stack.size) {
    bstIndex = stack.pop();
    intervalIndex = this.tree[bstIndex] - 1;
    currentInterval = this.intervals[intervalIndex];
    maxInterval = this.intervals[this.augmentations[intervalIndex]];

    max = this.endGetter ? this.endGetter(maxInterval) : maxInterval[1];

    // No possible match, start is farther right than the max end value
    if (intervalStart > max)
      continue;

    // Searching left
    left = bstIndex * 2 + 1;

    if (left < l && this.tree[left] !== 0)
      stack.push(left);

    start = this.startGetter ? this.startGetter(currentInterval) : currentInterval[0];
    end = this.endGetter ? this.endGetter(currentInterval) : currentInterval[1];

    // Checking current node
    if (intervalEnd >= start && intervalStart <= end)
      matches.push(currentInterval);

    // If the end is to the left of the start of the current interval,
    // then it cannot be in the right child
    if (intervalEnd < start)
      continue;

    // Searching right
    right = bstIndex * 2 + 2;

    if (right < l && this.tree[right] !== 0)
      stack.push(right);
  }

  return matches;
};

/**
 * Convenience known methods.
 */
StaticIntervalTree.prototype.inspect = function() {
  var proxy = this.intervals.slice();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: StaticIntervalTree,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  StaticIntervalTree.prototype[Symbol.for('nodejs.util.inspect.custom')] = StaticIntervalTree.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @return {StaticIntervalTree}
 */
StaticIntervalTree.from = function(iterable, getters) {
  if (iterables$7.isArrayLike(iterable))
    return new StaticIntervalTree(iterable, getters);

  return new StaticIntervalTree(Array.from(iterable), getters);
};

/**
 * Exporting.
 */
var staticIntervalTree = StaticIntervalTree;

var merge = {};

var binarySearch = {};

/**
 * Function returning the index of the search value in the array or `-1` if
 * not found.
 *
 * @param  {array} array - Haystack.
 * @param  {any}   value - Needle.
 * @return {number}
 */
binarySearch.search = function(array, value, lo, hi) {
  var mid = 0;

  lo = typeof lo !== 'undefined' ? lo : 0;
  hi = typeof hi !== 'undefined' ? hi : array.length;

  hi--;

  var current;

  while (lo <= hi) {
    mid = (lo + hi) >>> 1;

    current = array[mid];

    if (current > value) {
      hi = ~-mid;
    }
    else if (current < value) {
      lo = -~mid;
    }
    else {
      return mid;
    }
  }

  return -1;
};

/**
 * Same as above, but can use a custom comparator function.
 *
 * @param  {function} comparator - Custom comparator function.
 * @param  {array}    array      - Haystack.
 * @param  {any}      value      - Needle.
 * @return {number}
 */
binarySearch.searchWithComparator = function(comparator, array, value) {
  var mid = 0,
      lo = 0,
      hi = ~-array.length,
      comparison;

  while (lo <= hi) {
    mid = (lo + hi) >>> 1;

    comparison = comparator(array[mid], value);

    if (comparison > 0) {
      hi = ~-mid;
    }
    else if (comparison < 0) {
      lo = -~mid;
    }
    else {
      return mid;
    }
  }

  return -1;
};

/**
 * Function returning the lower bound of the given value in the array.
 *
 * @param  {array}  array - Haystack.
 * @param  {any}    value - Needle.
 * @param  {number} [lo] - Start index.
 * @param  {numner} [hi] - End index.
 * @return {number}
 */
binarySearch.lowerBound = function(array, value, lo, hi) {
  var mid = 0;

  lo = typeof lo !== 'undefined' ? lo : 0;
  hi = typeof hi !== 'undefined' ? hi : array.length;

  while (lo < hi) {
    mid = (lo + hi) >>> 1;

    if (value <= array[mid]) {
      hi = mid;
    }
    else {
      lo = -~mid;
    }
  }

  return lo;
};

/**
 * Same as above, but can use a custom comparator function.
 *
 * @param  {function} comparator - Custom comparator function.
 * @param  {array}    array      - Haystack.
 * @param  {any}      value      - Needle.
 * @return {number}
 */
binarySearch.lowerBoundWithComparator = function(comparator, array, value) {
  var mid = 0,
      lo = 0,
      hi = array.length;

  while (lo < hi) {
    mid = (lo + hi) >>> 1;

    if (comparator(value, array[mid]) <= 0) {
      hi = mid;
    }
    else {
      lo = -~mid;
    }
  }

  return lo;
};

/**
 * Same as above, but can work on sorted indices.
 *
 * @param  {array}    array - Haystack.
 * @param  {array}    array - Indices.
 * @param  {any}      value - Needle.
 * @return {number}
 */
binarySearch.lowerBoundIndices = function(array, indices, value, lo, hi) {
  var mid = 0;

  lo = typeof lo !== 'undefined' ? lo : 0;
  hi = typeof hi !== 'undefined' ? hi : array.length;

  while (lo < hi) {
    mid = (lo + hi) >>> 1;

    if (value <= array[indices[mid]]) {
      hi = mid;
    }
    else {
      lo = -~mid;
    }
  }

  return lo;
};

/**
 * Function returning the upper bound of the given value in the array.
 *
 * @param  {array}  array - Haystack.
 * @param  {any}    value - Needle.
 * @param  {number} [lo] - Start index.
 * @param  {numner} [hi] - End index.
 * @return {number}
 */
binarySearch.upperBound = function(array, value, lo, hi) {
  var mid = 0;

  lo = typeof lo !== 'undefined' ? lo : 0;
  hi = typeof hi !== 'undefined' ? hi : array.length;

  while (lo < hi) {
    mid = (lo + hi) >>> 1;

    if (value >= array[mid]) {
      lo = -~mid;
    }
    else {
      hi = mid;
    }
  }

  return lo;
};

/**
 * Same as above, but can use a custom comparator function.
 *
 * @param  {function} comparator - Custom comparator function.
 * @param  {array}    array      - Haystack.
 * @param  {any}      value      - Needle.
 * @return {number}
 */
binarySearch.upperBoundWithComparator = function(comparator, array, value) {
  var mid = 0,
      lo = 0,
      hi = array.length;

  while (lo < hi) {
    mid = (lo + hi) >>> 1;

    if (comparator(value, array[mid]) >= 0) {
      lo = -~mid;
    }
    else {
      hi = mid;
    }
  }

  return lo;
};

(function (exports) {
	/**
	 * Mnemonist Merge Helpers
	 * ========================
	 *
	 * Various merge algorithms used to handle sorted lists. Note that the given
	 * functions are optimized and won't accept mixed arguments.
	 *
	 * Note: maybe this piece of code belong to sortilege, along with binary-search.
	 */
	var typed = typedArrays,
	    isArrayLike = iterables$c.isArrayLike,
	    binarySearch$1 = binarySearch,
	    FibonacciHeap = fibonacciHeap;

	// TODO: update to use exponential search
	// TODO: when not knowing final length => should use plain arrays rather than
	// same type as input

	/**
	 * Merge two sorted array-like structures into one.
	 *
	 * @param  {array} a - First array.
	 * @param  {array} b - Second array.
	 * @return {array}
	 */
	function mergeArrays(a, b) {

	  // One of the arrays is empty
	  if (a.length === 0)
	    return b.slice();
	  if (b.length === 0)
	    return a.slice();

	  // Finding min array
	  var tmp;

	  if (a[0] > b[0]) {
	    tmp = a;
	    a = b;
	    b = tmp;
	  }

	  // If array have non overlapping ranges, we can just concatenate them
	  var aEnd = a[a.length - 1],
	      bStart = b[0];

	  if (aEnd <= bStart) {
	    if (typed.isTypedArray(a))
	      return typed.concat(a, b);
	    return a.concat(b);
	  }

	  // Initializing target
	  var array = new a.constructor(a.length + b.length);

	  // Iterating until we overlap
	  var i, l, v;

	  for (i = 0, l = a.length; i < l; i++) {
	    v = a[i];

	    if (v <= bStart)
	      array[i] = v;
	    else
	      break;
	  }

	  // Handling overlap
	  var aPointer = i,
	      aLength = a.length,
	      bPointer = 0,
	      bLength = b.length,
	      aHead,
	      bHead;

	  while (aPointer < aLength && bPointer < bLength) {
	    aHead = a[aPointer];
	    bHead = b[bPointer];

	    if (aHead <= bHead) {
	      array[i++] = aHead;
	      aPointer++;
	    }
	    else {
	      array[i++] = bHead;
	      bPointer++;
	    }
	  }

	  // Filling
	  while (aPointer < aLength)
	    array[i++] = a[aPointer++];
	  while (bPointer < bLength)
	    array[i++] = b[bPointer++];

	  return array;
	}

	/**
	 * Perform the union of two already unique sorted array-like structures into one.
	 *
	 * @param  {array} a - First array.
	 * @param  {array} b - Second array.
	 * @return {array}
	 */
	function unionUniqueArrays(a, b) {

	  // One of the arrays is empty
	  if (a.length === 0)
	    return b.slice();
	  if (b.length === 0)
	    return a.slice();

	  // Finding min array
	  var tmp;

	  if (a[0] > b[0]) {
	    tmp = a;
	    a = b;
	    b = tmp;
	  }

	  // If array have non overlapping ranges, we can just concatenate them
	  var aEnd = a[a.length - 1],
	      bStart = b[0];

	  if (aEnd < bStart) {
	    if (typed.isTypedArray(a))
	      return typed.concat(a, b);
	    return a.concat(b);
	  }

	  // Initializing target
	  var array = new a.constructor();

	  // Iterating until we overlap
	  var i, l, v;

	  for (i = 0, l = a.length; i < l; i++) {
	    v = a[i];

	    if (v < bStart)
	      array.push(v);
	    else
	      break;
	  }

	  // Handling overlap
	  var aPointer = i,
	      aLength = a.length,
	      bPointer = 0,
	      bLength = b.length,
	      aHead,
	      bHead;

	  while (aPointer < aLength && bPointer < bLength) {
	    aHead = a[aPointer];
	    bHead = b[bPointer];

	    if (aHead <= bHead) {

	      if (array.length === 0 || array[array.length - 1] !== aHead)
	        array.push(aHead);

	      aPointer++;
	    }
	    else {
	      if (array.length === 0 || array[array.length - 1] !== bHead)
	        array.push(bHead);

	      bPointer++;
	    }
	  }

	  // Filling
	  // TODO: it's possible to optimize a bit here, since the condition is only
	  // relevant the first time
	  while (aPointer < aLength) {
	    aHead = a[aPointer++];

	    if (array.length === 0 || array[array.length - 1] !== aHead)
	      array.push(aHead);
	  }
	  while (bPointer < bLength) {
	    bHead = b[bPointer++];

	    if (array.length === 0 || array[array.length - 1] !== bHead)
	      array.push(bHead);
	  }

	  return array;
	}

	/**
	 * Perform the intersection of two already unique sorted array-like structures into one.
	 *
	 * @param  {array} a - First array.
	 * @param  {array} b - Second array.
	 * @return {array}
	 */
	exports.intersectionUniqueArrays = function(a, b) {

	  // One of the arrays is empty
	  if (a.length === 0 || b.length === 0)
	    return new a.constructor(0);

	  // Finding min array
	  var tmp;

	  if (a[0] > b[0]) {
	    tmp = a;
	    a = b;
	    b = tmp;
	  }

	  // If array have non overlapping ranges, there is no intersection
	  var aEnd = a[a.length - 1],
	      bStart = b[0];

	  if (aEnd < bStart)
	    return new a.constructor(0);

	  // Initializing target
	  var array = new a.constructor();

	  // Handling overlap
	  var aPointer = binarySearch$1.lowerBound(a, bStart),
	      aLength = a.length,
	      bPointer = 0,
	      bLength = binarySearch$1.upperBound(b, aEnd),
	      aHead,
	      bHead;

	  while (aPointer < aLength && bPointer < bLength) {
	    aHead = a[aPointer];
	    bHead = b[bPointer];

	    if (aHead < bHead) {
	      aPointer = binarySearch$1.lowerBound(a, bHead, aPointer + 1);
	    }
	    else if (aHead > bHead) {
	      bPointer = binarySearch$1.lowerBound(b, aHead, bPointer + 1);
	    }
	    else {
	      array.push(aHead);
	      aPointer++;
	      bPointer++;
	    }
	  }

	  return array;
	};

	/**
	 * Merge k sorted array-like structures into one.
	 *
	 * @param  {array<array>} arrays - Arrays to merge.
	 * @return {array}
	 */
	function kWayMergeArrays(arrays) {
	  var length = 0,
	      max = -Infinity,
	      al,
	      i,
	      l;

	  var filtered = [];

	  for (i = 0, l = arrays.length; i < l; i++) {
	    al = arrays[i].length;

	    if (al === 0)
	      continue;

	    filtered.push(arrays[i]);

	    length += al;

	    if (al > max)
	      max = al;
	  }

	  if (filtered.length === 0)
	    return new arrays[0].constructor(0);

	  if (filtered.length === 1)
	    return filtered[0].slice();

	  if (filtered.length === 2)
	    return mergeArrays(filtered[0], filtered[1]);

	  arrays = filtered;

	  var array = new arrays[0].constructor(length);

	  var PointerArray = typed.getPointerArray(max);

	  var pointers = new PointerArray(arrays.length);

	  // TODO: benchmark vs. a binomial heap
	  var heap = new FibonacciHeap(function(a, b) {
	    a = arrays[a][pointers[a]];
	    b = arrays[b][pointers[b]];

	    if (a < b)
	      return -1;

	    if (a > b)
	      return 1;

	    return 0;
	  });

	  for (i = 0; i < l; i++)
	    heap.push(i);

	  i = 0;

	  var p,
	      v;

	  while (heap.size) {
	    p = heap.pop();
	    v = arrays[p][pointers[p]++];
	    array[i++] = v;

	    if (pointers[p] < arrays[p].length)
	      heap.push(p);
	  }

	  return array;
	}

	/**
	 * Perform the union of k sorted unique array-like structures into one.
	 *
	 * @param  {array<array>} arrays - Arrays to merge.
	 * @return {array}
	 */
	function kWayUnionUniqueArrays(arrays) {
	  var max = -Infinity,
	      al,
	      i,
	      l;

	  var filtered = [];

	  for (i = 0, l = arrays.length; i < l; i++) {
	    al = arrays[i].length;

	    if (al === 0)
	      continue;

	    filtered.push(arrays[i]);

	    if (al > max)
	      max = al;
	  }

	  if (filtered.length === 0)
	    return new arrays[0].constructor(0);

	  if (filtered.length === 1)
	    return filtered[0].slice();

	  if (filtered.length === 2)
	    return unionUniqueArrays(filtered[0], filtered[1]);

	  arrays = filtered;

	  var array = new arrays[0].constructor();

	  var PointerArray = typed.getPointerArray(max);

	  var pointers = new PointerArray(arrays.length);

	  // TODO: benchmark vs. a binomial heap
	  var heap = new FibonacciHeap(function(a, b) {
	    a = arrays[a][pointers[a]];
	    b = arrays[b][pointers[b]];

	    if (a < b)
	      return -1;

	    if (a > b)
	      return 1;

	    return 0;
	  });

	  for (i = 0; i < l; i++)
	    heap.push(i);

	  var p,
	      v;

	  while (heap.size) {
	    p = heap.pop();
	    v = arrays[p][pointers[p]++];

	    if (array.length === 0 || array[array.length - 1] !== v)
	      array.push(v);

	    if (pointers[p] < arrays[p].length)
	      heap.push(p);
	  }

	  return array;
	}

	/**
	 * Perform the intersection of k sorted array-like structures into one.
	 *
	 * @param  {array<array>} arrays - Arrays to merge.
	 * @return {array}
	 */
	exports.kWayIntersectionUniqueArrays = function(arrays) {
	  var maxStart = -Infinity,
	      minEnd = Infinity,
	      first,
	      last,
	      al,
	      i,
	      l;

	  for (i = 0, l = arrays.length; i < l; i++) {
	    al = arrays[i].length;

	    // If one of the arrays is empty, so is the intersection
	    if (al === 0)
	      return [];

	    first = arrays[i][0];
	    last = arrays[i][al - 1];

	    if (first > maxStart)
	      maxStart = first;

	    if (last < minEnd)
	      minEnd = last;
	  }

	  // Full overlap is impossible
	  if (maxStart > minEnd)
	    return [];

	  // Only one value
	  if (maxStart === minEnd)
	    return [maxStart];

	  // NOTE: trying to outsmart I(D,I(C,I(A,B))) is pointless unfortunately...
	  // NOTE: I tried to be very clever about bounds but it does not seem
	  // to improve the performance of the algorithm.
	  var a, b,
	      array = arrays[0],
	      aPointer,
	      bPointer,
	      aLimit,
	      bLimit,
	      aHead,
	      bHead,
	      start = maxStart;

	  for (i = 1; i < l; i++) {
	    a = array;
	    b = arrays[i];

	    // Change that to `[]` and observe some perf drops on V8...
	    array = new Array();

	    aPointer = 0;
	    bPointer = binarySearch$1.lowerBound(b, start);

	    aLimit = a.length;
	    bLimit = b.length;

	    while (aPointer < aLimit && bPointer < bLimit) {
	      aHead = a[aPointer];
	      bHead = b[bPointer];

	      if (aHead < bHead) {
	        aPointer = binarySearch$1.lowerBound(a, bHead, aPointer + 1);
	      }
	      else if (aHead > bHead) {
	        bPointer = binarySearch$1.lowerBound(b, aHead, bPointer + 1);
	      }
	      else {
	        array.push(aHead);
	        aPointer++;
	        bPointer++;
	      }
	    }

	    if (array.length === 0)
	      return array;

	    start = array[0];
	  }

	  return array;
	};

	/**
	 * Variadic merging all of the given arrays.
	 *
	 * @param  {...array}
	 * @return {array}
	 */
	exports.merge = function() {
	  if (arguments.length === 2) {
	    if (isArrayLike(arguments[0]))
	      return mergeArrays(arguments[0], arguments[1]);
	  }
	  else {
	    if (isArrayLike(arguments[0]))
	      return kWayMergeArrays(arguments);
	  }

	  return null;
	};

	/**
	 * Variadic function performing the union of all the given unique arrays.
	 *
	 * @param  {...array}
	 * @return {array}
	 */
	exports.unionUnique = function() {
	  if (arguments.length === 2) {
	    if (isArrayLike(arguments[0]))
	      return unionUniqueArrays(arguments[0], arguments[1]);
	  }
	  else {
	    if (isArrayLike(arguments[0]))
	      return kWayUnionUniqueArrays(arguments);
	  }

	  return null;
	};

	/**
	 * Variadic function performing the intersection of all the given unique arrays.
	 *
	 * @param  {...array}
	 * @return {array}
	 */
	exports.intersectionUnique = function() {
	  if (arguments.length === 2) {
	    if (isArrayLike(arguments[0]))
	      return exports.intersectionUniqueArrays(arguments[0], arguments[1]);
	  }
	  else {
	    if (isArrayLike(arguments[0]))
	      return exports.kWayIntersectionUniqueArrays(arguments);
	  }

	  return null;
	};
} (merge));

var Iterator$b = iterator,
    forEach$d = foreach,
    helpers = merge;

function identity(x) {
  return x;
}

/**
 * InvertedIndex.
 *
 * @constructor
 * @param {function} tokenizer - Tokenizer function.
 */
function InvertedIndex(descriptor) {
  this.clear();

  if (Array.isArray(descriptor)) {
    this.documentTokenizer = descriptor[0];
    this.queryTokenizer = descriptor[1];
  }
  else {
    this.documentTokenizer = descriptor;
    this.queryTokenizer = descriptor;
  }

  if (!this.documentTokenizer)
    this.documentTokenizer = identity;
  if (!this.queryTokenizer)
    this.queryTokenizer = identity;

  if (typeof this.documentTokenizer !== 'function')
    throw new Error('mnemonist/InvertedIndex.constructor: document tokenizer is not a function.');

  if (typeof this.queryTokenizer !== 'function')
    throw new Error('mnemonist/InvertedIndex.constructor: query tokenizer is not a function.');
}

/**
 * Method used to clear the InvertedIndex.
 *
 * @return {undefined}
 */
InvertedIndex.prototype.clear = function() {

  // Properties
  this.items = [];
  this.mapping = new Map();
  this.size = 0;
  this.dimension = 0;
};

/**
 * Method used to add a document to the index.
 *
 * @param  {any} doc - Item to add.
 * @return {InvertedIndex}
 */
InvertedIndex.prototype.add = function(doc) {

  // Increasing size
  this.size++;

  // Storing document
  var key = this.items.length;
  this.items.push(doc);

  // Tokenizing the document
  var tokens = this.documentTokenizer(doc);

  if (!Array.isArray(tokens))
    throw new Error('mnemonist/InvertedIndex.add: tokenizer function should return an array of tokens.');

  // Indexing
  var done = new Set(),
      token,
      container;

  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];

    if (done.has(token))
      continue;

    done.add(token);

    container = this.mapping.get(token);

    if (!container) {
      container = [];
      this.mapping.set(token, container);
    }

    container.push(key);
  }

  this.dimension = this.mapping.size;

  return this;
};

/**
 * Method used to query the index in a AND fashion.
 *
 * @param  {any} query - Query
 * @return {Set}       - Intersection of documents matching the query.
 */
InvertedIndex.prototype.get = function(query) {

  // Early termination
  if (!this.size)
    return [];

  // First we need to tokenize the query
  var tokens = this.queryTokenizer(query);

  if (!Array.isArray(tokens))
    throw new Error('mnemonist/InvertedIndex.query: tokenizer function should return an array of tokens.');

  if (!tokens.length)
    return [];

  var results = this.mapping.get(tokens[0]),
      c,
      i,
      l;

  if (typeof results === 'undefined' || results.length === 0)
    return [];

  if (tokens.length > 1) {
    for (i = 1, l = tokens.length; i < l; i++) {
      c = this.mapping.get(tokens[i]);

      if (typeof c === 'undefined' || c.length === 0)
        return [];

      results = helpers.intersectionUniqueArrays(results, c);
    }
  }

  var docs = new Array(results.length);

  for (i = 0, l = docs.length; i < l; i++)
    docs[i] = this.items[results[i]];

  return docs;
};

/**
 * Method used to iterate over each of the documents.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
InvertedIndex.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  for (var i = 0, l = this.documents.length; i < l; i++)
    callback.call(scope, this.documents[i], i, this);
};

/**
 * Method returning an iterator over the index's documents.
 *
 * @return {Iterator}
 */
InvertedIndex.prototype.documents = function() {
  var documents = this.items,
      l = documents.length,
      i = 0;

  return new Iterator$b(function() {
    if (i >= l)
      return {
        done: true
      };

      var value = documents[i++];

      return {
        value: value,
        done: false
      };
  });
};

/**
 * Method returning an iterator over the index's tokens.
 *
 * @return {Iterator}
 */
InvertedIndex.prototype.tokens = function() {
  return this.mapping.keys();
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  InvertedIndex.prototype[Symbol.iterator] = InvertedIndex.prototype.documents;

/**
 * Convenience known methods.
 */
InvertedIndex.prototype.inspect = function() {
  var array = this.items.slice();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: InvertedIndex,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  InvertedIndex.prototype[Symbol.for('nodejs.util.inspect.custom')] = InvertedIndex.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a InvertedIndex.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @param  {function} tokenizer - Tokenizer function.
 * @return {InvertedIndex}
 */
InvertedIndex.from = function(iterable, descriptor) {
  var index = new InvertedIndex(descriptor);

  forEach$d(iterable, function(doc) {
    index.add(doc);
  });

  return index;
};

/**
 * Exporting.
 */
var invertedIndex = InvertedIndex;

var quick = {};

var LOS = new Float64Array(64),
    HIS = new Float64Array(64);

function inplaceQuickSort(array, lo, hi) {
  var p, i, l, r, swap;

  LOS[0] = lo;
  HIS[0] = hi;
  i = 0;

  while (i >= 0) {
    l = LOS[i];
    r = HIS[i] - 1;

    if (l < r) {
      p = array[l];

      while (l < r) {
        while (array[r] >= p && l < r)
          r--;

        if (l < r)
          array[l++] = array[r];

        while (array[l] <= p && l < r)
          l++;

        if (l < r)
          array[r--] = array[l];
      }

      array[l] = p;
      LOS[i + 1] = l + 1;
      HIS[i + 1] = HIS[i];
      HIS[i++] = l;

      if (HIS[i] - LOS[i] > HIS[i - 1] - LOS[i - 1]) {
        swap = LOS[i];
        LOS[i] = LOS[i - 1];
        LOS[i - 1] = swap;

        swap = HIS[i];
        HIS[i] = HIS[i - 1];
        HIS[i - 1] = swap;
      }
    }
    else {
      i--;
    }
  }

  return array;
}

quick.inplaceQuickSort = inplaceQuickSort;

function inplaceQuickSortIndices$2(array, indices, lo, hi) {
  var p, i, l, r, t, swap;

  LOS[0] = lo;
  HIS[0] = hi;
  i = 0;

  while (i >= 0) {
    l = LOS[i];
    r = HIS[i] - 1;

    if (l < r) {
      t = indices[l];
      p = array[t];

      while (l < r) {
        while (array[indices[r]] >= p && l < r)
          r--;

        if (l < r)
          indices[l++] = indices[r];

        while (array[indices[l]] <= p && l < r)
          l++;

        if (l < r)
          indices[r--] = indices[l];
      }

      indices[l] = t;
      LOS[i + 1] = l + 1;
      HIS[i + 1] = HIS[i];
      HIS[i++] = l;

      if (HIS[i] - LOS[i] > HIS[i - 1] - LOS[i - 1]) {
        swap = LOS[i];
        LOS[i] = LOS[i - 1];
        LOS[i - 1] = swap;

        swap = HIS[i];
        HIS[i] = HIS[i - 1];
        HIS[i - 1] = swap;
      }
    }
    else {
      i--;
    }
  }

  return indices;
}

quick.inplaceQuickSortIndices = inplaceQuickSortIndices$2;

var iterables$6 = iterables$c;
var typed$6 = typedArrays;
var createTupleComparator = comparators$3.createTupleComparator;
var FixedReverseHeap$1 = fixedReverseHeap;
var inplaceQuickSortIndices$1 = quick.inplaceQuickSortIndices;

/**
 * Helper function used to compute the squared distance between a query point
 * and an indexed points whose values are stored in a tree's axes.
 *
 * Note that squared distance is used instead of euclidean to avoid
 * costly sqrt computations.
 *
 * @param  {number} dimensions - Number of dimensions.
 * @param  {array}  axes       - Axes data.
 * @param  {number} pivot      - Pivot.
 * @param  {array}  point      - Query point.
 * @return {number}
 */
function squaredDistanceAxes(dimensions, axes, pivot, b) {
  var d;

  var dist = 0,
      step;

  for (d = 0; d < dimensions; d++) {
    step = axes[d][pivot] - b[d];
    dist += step * step;
  }

  return dist;
}

/**
 * Helper function used to reshape input data into low-level axes data.
 *
 * @param  {number} dimensions - Number of dimensions.
 * @param  {array}  data       - Data in the shape [label, [x, y, z...]]
 * @return {object}
 */
function reshapeIntoAxes(dimensions, data) {
  var l = data.length;

  var axes = new Array(dimensions),
      labels = new Array(l),
      axis;

  var PointerArray = typed$6.getPointerArray(l);

  var ids = new PointerArray(l);

  var d, i, row;

  var f = true;

  for (d = 0; d < dimensions; d++) {
    axis = new Float64Array(l);

    for (i = 0; i < l; i++) {
      row = data[i];
      axis[i] = row[1][d];

      if (f) {
        labels[i] = row[0];
        ids[i] = i;
      }
    }

    f = false;
    axes[d] = axis;
  }

  return {axes: axes, ids: ids, labels: labels};
}

/**
 * Helper function used to build a kd-tree from axes data.
 *
 * @param  {number} dimensions - Number of dimensions.
 * @param  {array}  axes       - Axes.
 * @param  {array}  ids        - Indices to sort.
 * @param  {array}  labels     - Point labels.
 * @return {object}
 */
function buildTree(dimensions, axes, ids, labels) {
  var l = labels.length;

  // NOTE: +1 because we need to keep 0 as null pointer
  var PointerArray = typed$6.getPointerArray(l + 1);

  // Building the tree
  var pivots = new PointerArray(l),
      lefts = new PointerArray(l),
      rights = new PointerArray(l);

  var stack = [[0, 0, ids.length, -1, 0]],
      step,
      parent,
      direction,
      median,
      pivot,
      lo,
      hi;

  var d, i = 0;

  while (stack.length !== 0) {
    step = stack.pop();

    d = step[0];
    lo = step[1];
    hi = step[2];
    parent = step[3];
    direction = step[4];

    inplaceQuickSortIndices$1(axes[d], ids, lo, hi);

    l = hi - lo;
    median = lo + (l >>> 1); // Fancy floor(l / 2)
    pivot = ids[median];
    pivots[i] = pivot;

    if (parent > -1) {
      if (direction === 0)
        lefts[parent] = i + 1;
      else
        rights[parent] = i + 1;
    }

    d = (d + 1) % dimensions;

    // Right
    if (median !== lo && median !== hi - 1) {
      stack.push([d, median + 1, hi, i, 1]);
    }

    // Left
    if (median !== lo) {
      stack.push([d, lo, median, i, 0]);
    }

    i++;
  }

  return {
    axes: axes,
    labels: labels,
    pivots: pivots,
    lefts: lefts,
    rights: rights
  };
}

/**
 * KDTree.
 *
 * @constructor
 */
function KDTree(dimensions, build) {
  this.dimensions = dimensions;
  this.visited = 0;

  this.axes = build.axes;
  this.labels = build.labels;

  this.pivots = build.pivots;
  this.lefts = build.lefts;
  this.rights = build.rights;

  this.size = this.labels.length;
}

/**
 * Method returning the query's nearest neighbor.
 *
 * @param  {array}  query - Query point.
 * @return {any}
 */
KDTree.prototype.nearestNeighbor = function(query) {
  var bestDistance = Infinity,
      best = null;

  var dimensions = this.dimensions,
      axes = this.axes,
      pivots = this.pivots,
      lefts = this.lefts,
      rights = this.rights;

  var visited = 0;

  function recurse(d, node) {
    visited++;

    var left = lefts[node],
        right = rights[node],
        pivot = pivots[node];

    var dist = squaredDistanceAxes(
      dimensions,
      axes,
      pivot,
      query
    );

    if (dist < bestDistance) {
      best = pivot;
      bestDistance = dist;

      if (dist === 0)
        return;
    }

    var dx = axes[d][pivot] - query[d];

    d = (d + 1) % dimensions;

    // Going the correct way?
    if (dx > 0) {
      if (left !== 0)
        recurse(d, left - 1);
    }
    else {
      if (right !== 0)
        recurse(d, right - 1);
    }

    // Going the other way?
    if (dx * dx < bestDistance) {
      if (dx > 0) {
        if (right !== 0)
          recurse(d, right - 1);
      }
      else {
        if (left !== 0)
          recurse(d, left - 1);
      }
    }
  }

  recurse(0, 0);

  this.visited = visited;
  return this.labels[best];
};

var KNN_HEAP_COMPARATOR_3 = createTupleComparator(3);
var KNN_HEAP_COMPARATOR_2 = createTupleComparator(2);

/**
 * Method returning the query's k nearest neighbors.
 *
 * @param  {number} k     - Number of nearest neighbor to retrieve.
 * @param  {array}  query - Query point.
 * @return {array}
 */

// TODO: can do better by improving upon static-kdtree here
KDTree.prototype.kNearestNeighbors = function(k, query) {
  if (k <= 0)
    throw new Error('mnemonist/kd-tree.kNearestNeighbors: k should be a positive number.');

  k = Math.min(k, this.size);

  if (k === 1)
    return [this.nearestNeighbor(query)];

  var heap = new FixedReverseHeap$1(Array, KNN_HEAP_COMPARATOR_3, k);

  var dimensions = this.dimensions,
      axes = this.axes,
      pivots = this.pivots,
      lefts = this.lefts,
      rights = this.rights;

  var visited = 0;

  function recurse(d, node) {
    var left = lefts[node],
        right = rights[node],
        pivot = pivots[node];

    var dist = squaredDistanceAxes(
      dimensions,
      axes,
      pivot,
      query
    );

    heap.push([dist, visited++, pivot]);

    var point = query[d],
        split = axes[d][pivot],
        dx = point - split;

    d = (d + 1) % dimensions;

    // Going the correct way?
    if (point < split) {
      if (left !== 0) {
        recurse(d, left - 1);
      }
    }
    else {
      if (right !== 0) {
        recurse(d, right - 1);
      }
    }

    // Going the other way?
    if (dx * dx < heap.peek()[0] || heap.size < k) {
      if (point < split) {
        if (right !== 0) {
          recurse(d, right - 1);
        }
      }
      else {
        if (left !== 0) {
          recurse(d, left - 1);
        }
      }
    }
  }

  recurse(0, 0);

  this.visited = visited;

  var best = heap.consume();

  for (var i = 0; i < best.length; i++)
    best[i] = this.labels[best[i][2]];

  return best;
};

/**
 * Method returning the query's k nearest neighbors by linear search.
 *
 * @param  {number} k     - Number of nearest neighbor to retrieve.
 * @param  {array}  query - Query point.
 * @return {array}
 */
KDTree.prototype.linearKNearestNeighbors = function(k, query) {
  if (k <= 0)
    throw new Error('mnemonist/kd-tree.kNearestNeighbors: k should be a positive number.');

  k = Math.min(k, this.size);

  var heap = new FixedReverseHeap$1(Array, KNN_HEAP_COMPARATOR_2, k);

  var i, l, dist;

  for (i = 0, l = this.size; i < l; i++) {
    dist = squaredDistanceAxes(
      this.dimensions,
      this.axes,
      this.pivots[i],
      query
    );

    heap.push([dist, i]);
  }

  var best = heap.consume();

  for (i = 0; i < best.length; i++)
    best[i] = this.labels[this.pivots[best[i][1]]];

  return best;
};

/**
 * Convenience known methods.
 */
KDTree.prototype.inspect = function() {
  var dummy = new Map();

  dummy.dimensions = this.dimensions;

  Object.defineProperty(dummy, 'constructor', {
    value: KDTree,
    enumerable: false
  });

  var i, j, point;

  for (i = 0; i < this.size; i++) {
    point = new Array(this.dimensions);

    for (j = 0; j < this.dimensions; j++)
      point[j] = this.axes[j][i];

    dummy.set(this.labels[i], point);
  }

  return dummy;
};

if (typeof Symbol !== 'undefined')
  KDTree.prototype[Symbol.for('nodejs.util.inspect.custom')] = KDTree.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @param  {number}   dimensions - Space dimensions.
 * @return {KDTree}
 */
KDTree.from = function(iterable, dimensions) {
  var data = iterables$6.toArray(iterable);

  var reshaped = reshapeIntoAxes(dimensions, data);

  var result = buildTree(dimensions, reshaped.axes, reshaped.ids, reshaped.labels);

  return new KDTree(dimensions, result);
};

/**
 * Static @.from function building a KDTree from given axes.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @param  {number}   dimensions - Space dimensions.
 * @return {KDTree}
 */
KDTree.fromAxes = function(axes, labels) {
  if (!labels)
    labels = typed$6.indices(axes[0].length);

  var dimensions = axes.length;

  var result = buildTree(axes.length, axes, typed$6.indices(labels.length), labels);

  return new KDTree(dimensions, result);
};

/**
 * Exporting.
 */
var kdTree = KDTree;

var Iterator$a = iterator,
    forEach$c = foreach;

/**
 * Linked List.
 *
 * @constructor
 */
function LinkedList() {
  this.clear();
}

/**
 * Method used to clear the list.
 *
 * @return {undefined}
 */
LinkedList.prototype.clear = function() {

  // Properties
  this.head = null;
  this.tail = null;
  this.size = 0;
};

/**
 * Method used to get the first item of the list.
 *
 * @return {any}
 */
LinkedList.prototype.first = function() {
  return this.head ? this.head.item : undefined;
};
LinkedList.prototype.peek = LinkedList.prototype.first;

/**
 * Method used to get the last item of the list.
 *
 * @return {any}
 */
LinkedList.prototype.last = function() {
  return this.tail ? this.tail.item : undefined;
};

/**
 * Method used to add an item at the end of the list.
 *
 * @param  {any}    item - The item to add.
 * @return {number}
 */
LinkedList.prototype.push = function(item) {
  var node = {item: item, next: null};

  if (!this.head) {
    this.head = node;
    this.tail = node;
  }
  else {
    this.tail.next = node;
    this.tail = node;
  }

  this.size++;

  return this.size;
};

/**
 * Method used to add an item at the beginning of the list.
 *
 * @param  {any}    item - The item to add.
 * @return {number}
 */
LinkedList.prototype.unshift = function(item) {
  var node = {item: item, next: null};

  if (!this.head) {
    this.head = node;
    this.tail = node;
  }
  else {
    if (!this.head.next)
      this.tail = this.head;
    node.next = this.head;
    this.head = node;
  }

  this.size++;

  return this.size;
};

/**
 * Method used to retrieve & remove the first item of the list.
 *
 * @return {any}
 */
LinkedList.prototype.shift = function() {
  if (!this.size)
    return undefined;

  var node = this.head;

  this.head = node.next;
  this.size--;

  return node.item;
};

/**
 * Method used to iterate over the list.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
LinkedList.prototype.forEach = function(callback, scope) {
  if (!this.size)
    return;

  scope = arguments.length > 1 ? scope : this;

  var n = this.head,
      i = 0;

  while (n) {
    callback.call(scope, n.item, i, this);
    n = n.next;
    i++;
  }
};

/**
 * Method used to convert the list into an array.
 *
 * @return {array}
 */
LinkedList.prototype.toArray = function() {
  if (!this.size)
    return [];

  var array = new Array(this.size);

  for (var i = 0, l = this.size, n = this.head; i < l; i++) {
    array[i] = n.item;
    n = n.next;
  }

  return array;
};

/**
 * Method used to create an iterator over a list's values.
 *
 * @return {Iterator}
 */
LinkedList.prototype.values = function() {
  var n = this.head;

  return new Iterator$a(function() {
    if (!n)
      return {
        done: true
      };

    var value = n.item;
    n = n.next;

    return {
      value: value,
      done: false
    };
  });
};

/**
 * Method used to create an iterator over a list's entries.
 *
 * @return {Iterator}
 */
LinkedList.prototype.entries = function() {
  var n = this.head,
      i = 0;

  return new Iterator$a(function() {
    if (!n)
      return {
        done: true
      };

    var value = n.item;
    n = n.next;
    i++;

    return {
      value: [i - 1, value],
      done: false
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  LinkedList.prototype[Symbol.iterator] = LinkedList.prototype.values;

/**
 * Convenience known methods.
 */
LinkedList.prototype.toString = function() {
  return this.toArray().join(',');
};

LinkedList.prototype.toJSON = function() {
  return this.toArray();
};

LinkedList.prototype.inspect = function() {
  var array = this.toArray();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: LinkedList,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  LinkedList.prototype[Symbol.for('nodejs.util.inspect.custom')] = LinkedList.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a list.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @return {LinkedList}
 */
LinkedList.from = function(iterable) {
  var list = new LinkedList();

  forEach$c(iterable, function(value) {
    list.push(value);
  });

  return list;
};

/**
 * Exporting.
 */
var linkedList = LinkedList;

var Iterator$9 = iterator,
    forEach$b = foreach,
    typed$5 = typedArrays,
    iterables$5 = iterables$c;

/**
 * LRUCache.
 *
 * @constructor
 * @param {function} Keys     - Array class for storing keys.
 * @param {function} Values   - Array class for storing values.
 * @param {number}   capacity - Desired capacity.
 */
function LRUCache$3(Keys, Values, capacity) {
  if (arguments.length < 2) {
    capacity = Keys;
    Keys = null;
    Values = null;
  }

  this.capacity = capacity;

  if (typeof this.capacity !== 'number' || this.capacity <= 0)
    throw new Error('mnemonist/lru-cache: capacity should be positive number.');
  else if (!isFinite(this.capacity) || Math.floor(this.capacity) !== this.capacity)
      throw new Error('mnemonist/lru-cache: capacity should be a finite positive integer.');

  var PointerArray = typed$5.getPointerArray(capacity);

  this.forward = new PointerArray(capacity);
  this.backward = new PointerArray(capacity);
  this.K = typeof Keys === 'function' ? new Keys(capacity) : new Array(capacity);
  this.V = typeof Values === 'function' ? new Values(capacity) : new Array(capacity);

  // Properties
  this.size = 0;
  this.head = 0;
  this.tail = 0;
  this.items = {};
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
LRUCache$3.prototype.clear = function() {
  this.size = 0;
  this.head = 0;
  this.tail = 0;
  this.items = {};
};

/**
 * Method used to splay a value on top.
 *
 * @param  {number}   pointer - Pointer of the value to splay on top.
 * @return {LRUCache}
 */
LRUCache$3.prototype.splayOnTop = function(pointer) {
  var oldHead = this.head;

  if (this.head === pointer)
    return this;

  var previous = this.backward[pointer],
      next = this.forward[pointer];

  if (this.tail === pointer) {
    this.tail = previous;
  }
  else {
    this.backward[next] = previous;
  }

  this.forward[previous] = next;

  this.backward[oldHead] = pointer;
  this.head = pointer;
  this.forward[pointer] = oldHead;

  return this;
};

/**
 * Method used to set the value for the given key in the cache.
 *
 * @param  {any} key   - Key.
 * @param  {any} value - Value.
 * @return {undefined}
 */
LRUCache$3.prototype.set = function(key, value) {

  var pointer = this.items[key];

  // The key already exists, we just need to update the value and splay on top
  if (typeof pointer !== 'undefined') {
    this.splayOnTop(pointer);
    this.V[pointer] = value;

    return;
  }

  // The cache is not yet full
  if (this.size < this.capacity) {
    pointer = this.size++;
  }

  // Cache is full, we need to drop the last value
  else {
    pointer = this.tail;
    this.tail = this.backward[pointer];
    delete this.items[this.K[pointer]];
  }

  // Storing key & value
  this.items[key] = pointer;
  this.K[pointer] = key;
  this.V[pointer] = value;

  // Moving the item at the front of the list
  this.forward[pointer] = this.head;
  this.backward[this.head] = pointer;
  this.head = pointer;
};

/**
 * Method used to set the value for the given key in the cache
 *
 * @param  {any} key   - Key.
 * @param  {any} value - Value.
 * @return {{evicted: boolean, key: any, value: any}} An object containing the
 * key and value of an item that was overwritten or evicted in the set
 * operation, as well as a boolean indicating whether it was evicted due to
 * limited capacity. Return value is null if nothing was evicted or overwritten
 * during the set operation.
 */
LRUCache$3.prototype.setpop = function(key, value) {
  var oldValue = null;
  var oldKey = null;

  var pointer = this.items[key];

  // The key already exists, we just need to update the value and splay on top
  if (typeof pointer !== 'undefined') {
    this.splayOnTop(pointer);
    oldValue = this.V[pointer];
    this.V[pointer] = value;
    return {evicted: false, key: key, value: oldValue};
  }

  // The cache is not yet full
  if (this.size < this.capacity) {
    pointer = this.size++;
  }

  // Cache is full, we need to drop the last value
  else {
    pointer = this.tail;
    this.tail = this.backward[pointer];
    oldValue = this.V[pointer];
    oldKey = this.K[pointer];
    delete this.items[this.K[pointer]];
  }

  // Storing key & value
  this.items[key] = pointer;
  this.K[pointer] = key;
  this.V[pointer] = value;

  // Moving the item at the front of the list
  this.forward[pointer] = this.head;
  this.backward[this.head] = pointer;
  this.head = pointer;

  // Return object if eviction took place, otherwise return null
  if (oldKey) {
    return {evicted: true, key: oldKey, value: oldValue};
  }
  else {
    return null;
  }
};

/**
 * Method used to check whether the key exists in the cache.
 *
 * @param  {any} key   - Key.
 * @return {boolean}
 */
LRUCache$3.prototype.has = function(key) {
  return key in this.items;
};

/**
 * Method used to get the value attached to the given key. Will move the
 * related key to the front of the underlying linked list.
 *
 * @param  {any} key   - Key.
 * @return {any}
 */
LRUCache$3.prototype.get = function(key) {
  var pointer = this.items[key];

  if (typeof pointer === 'undefined')
    return;

  this.splayOnTop(pointer);

  return this.V[pointer];
};

/**
 * Method used to get the value attached to the given key. Does not modify
 * the ordering of the underlying linked list.
 *
 * @param  {any} key   - Key.
 * @return {any}
 */
LRUCache$3.prototype.peek = function(key) {
    var pointer = this.items[key];

    if (typeof pointer === 'undefined')
        return;

    return this.V[pointer];
};

/**
 * Method used to iterate over the cache's entries using a callback.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
LRUCache$3.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  var i = 0,
      l = this.size;

  var pointer = this.head,
      keys = this.K,
      values = this.V,
      forward = this.forward;

  while (i < l) {

    callback.call(scope, values[pointer], keys[pointer], this);
    pointer = forward[pointer];

    i++;
  }
};

/**
 * Method used to create an iterator over the cache's keys from most
 * recently used to least recently used.
 *
 * @return {Iterator}
 */
LRUCache$3.prototype.keys = function() {
  var i = 0,
      l = this.size;

  var pointer = this.head,
      keys = this.K,
      forward = this.forward;

  return new Iterator$9(function() {
    if (i >= l)
      return {done: true};

    var key = keys[pointer];

    i++;

    if (i < l)
      pointer = forward[pointer];

    return {
      done: false,
      value: key
    };
  });
};

/**
 * Method used to create an iterator over the cache's values from most
 * recently used to least recently used.
 *
 * @return {Iterator}
 */
LRUCache$3.prototype.values = function() {
  var i = 0,
      l = this.size;

  var pointer = this.head,
      values = this.V,
      forward = this.forward;

  return new Iterator$9(function() {
    if (i >= l)
      return {done: true};

    var value = values[pointer];

    i++;

    if (i < l)
      pointer = forward[pointer];

    return {
      done: false,
      value: value
    };
  });
};

/**
 * Method used to create an iterator over the cache's entries from most
 * recently used to least recently used.
 *
 * @return {Iterator}
 */
LRUCache$3.prototype.entries = function() {
  var i = 0,
      l = this.size;

  var pointer = this.head,
      keys = this.K,
      values = this.V,
      forward = this.forward;

  return new Iterator$9(function() {
    if (i >= l)
      return {done: true};

    var key = keys[pointer],
        value = values[pointer];

    i++;

    if (i < l)
      pointer = forward[pointer];

    return {
      done: false,
      value: [key, value]
    };
  });
};

/**
 * Attaching the #.entries method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  LRUCache$3.prototype[Symbol.iterator] = LRUCache$3.prototype.entries;

/**
 * Convenience known methods.
 */
LRUCache$3.prototype.inspect = function() {
  var proxy = new Map();

  var iterator = this.entries(),
      step;

  while ((step = iterator.next(), !step.done))
    proxy.set(step.value[0], step.value[1]);

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: LRUCache$3,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  LRUCache$3.prototype[Symbol.for('nodejs.util.inspect.custom')] = LRUCache$3.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @param  {function} Keys     - Array class for storing keys.
 * @param  {function} Values   - Array class for storing values.
 * @param  {number}   capacity - Cache's capacity.
 * @return {LRUCache}
 */
LRUCache$3.from = function(iterable, Keys, Values, capacity) {
  if (arguments.length < 2) {
    capacity = iterables$5.guessLength(iterable);

    if (typeof capacity !== 'number')
      throw new Error('mnemonist/lru-cache.from: could not guess iterable length. Please provide desired capacity as last argument.');
  }
  else if (arguments.length === 2) {
    capacity = Keys;
    Keys = null;
    Values = null;
  }

  var cache = new LRUCache$3(Keys, Values, capacity);

  forEach$b(iterable, function(value, key) {
    cache.set(key, value);
  });

  return cache;
};

/**
 * Exporting.
 */
var lruCache = LRUCache$3;

var LRUCache$2 = lruCache,
    forEach$a = foreach,
    typed$4 = typedArrays,
    iterables$4 = iterables$c;

// The only complication with deleting items is that the LRU's
// performance depends on having a fixed-size list of pointers; the
// doubly-linked-list is happy to expand and contract.
//
// On delete, we record the position of the former item's pointer in a
// list of "holes" in the pointer array. On insert, if there is a hole
// the new pointer slots in to fill the hole; otherwise, it is
// appended as usual. (Note: we are only talking here about the
// internal pointer list. setting or getting an item promotes it
// to the top of the LRU ranking no matter what came before)

function LRUCacheWithDelete(Keys, Values, capacity) {
  if (arguments.length < 2) {
    LRUCache$2.call(this, Keys);
  }
  else {
    LRUCache$2.call(this, Keys, Values, capacity);
  }
  var PointerArray = typed$4.getPointerArray(this.capacity);
  this.deleted = new PointerArray(this.capacity);
  this.deletedSize = 0;
}

for (var k$1 in LRUCache$2.prototype)
  LRUCacheWithDelete.prototype[k$1] = LRUCache$2.prototype[k$1];
if (typeof Symbol !== 'undefined')
  LRUCacheWithDelete.prototype[Symbol.iterator] = LRUCache$2.prototype[Symbol.iterator];

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
 LRUCacheWithDelete.prototype.clear = function() {
  LRUCache$2.prototype.clear.call(this);
  this.deletedSize = 0;
};

/**
 * Method used to set the value for the given key in the cache.
 *
 * @param  {any} key   - Key.
 * @param  {any} value - Value.
 * @return {undefined}
 */
LRUCacheWithDelete.prototype.set = function(key, value) {

  var pointer = this.items[key];

  // The key already exists, we just need to update the value and splay on top
  if (typeof pointer !== 'undefined') {
    this.splayOnTop(pointer);
    this.V[pointer] = value;

    return;
  }

  // The cache is not yet full
  if (this.size < this.capacity) {
    if (this.deletedSize > 0) {
      // If there is a "hole" in the pointer list, reuse it
      pointer = this.deleted[--this.deletedSize];
    }
    else {
      // otherwise append to the pointer list
      pointer = this.size;
    }
    this.size++;
  }

  // Cache is full, we need to drop the last value
  else {
    pointer = this.tail;
    this.tail = this.backward[pointer];
    delete this.items[this.K[pointer]];
  }

  // Storing key & value
  this.items[key] = pointer;
  this.K[pointer] = key;
  this.V[pointer] = value;

  // Moving the item at the front of the list
  this.forward[pointer] = this.head;
  this.backward[this.head] = pointer;
  this.head = pointer;
};

/**
 * Method used to set the value for the given key in the cache
 *
 * @param  {any} key   - Key.
 * @param  {any} value - Value.
 * @return {{evicted: boolean, key: any, value: any}} An object containing the
 * key and value of an item that was overwritten or evicted in the set
 * operation, as well as a boolean indicating whether it was evicted due to
 * limited capacity. Return value is null if nothing was evicted or overwritten
 * during the set operation.
 */
LRUCacheWithDelete.prototype.setpop = function(key, value) {
  var oldValue = null;
  var oldKey = null;

  var pointer = this.items[key];

  // The key already exists, we just need to update the value and splay on top
  if (typeof pointer !== 'undefined') {
    this.splayOnTop(pointer);
    oldValue = this.V[pointer];
    this.V[pointer] = value;
    return {evicted: false, key: key, value: oldValue};
  }

  // The cache is not yet full
  if (this.size < this.capacity) {
    if (this.deletedSize > 0) {
      // If there is a "hole" in the pointer list, reuse it
      pointer = this.deleted[--this.deletedSize];
    }
    else {
      // otherwise append to the pointer list
      pointer = this.size;
    }
    this.size++;
  }

  // Cache is full, we need to drop the last value
  else {
    pointer = this.tail;
    this.tail = this.backward[pointer];
    oldValue = this.V[pointer];
    oldKey = this.K[pointer];
    delete this.items[this.K[pointer]];
  }

  // Storing key & value
  this.items[key] = pointer;
  this.K[pointer] = key;
  this.V[pointer] = value;

  // Moving the item at the front of the list
  this.forward[pointer] = this.head;
  this.backward[this.head] = pointer;
  this.head = pointer;

  // Return object if eviction took place, otherwise return null
  if (oldKey) {
    return {evicted: true, key: oldKey, value: oldValue};
  }
  else {
    return null;
  }
};

/**
 * Method used to delete the entry for the given key in the cache.
 *
 * @param  {any} key   - Key.
 * @return {boolean}   - true if the item was present
 */
LRUCacheWithDelete.prototype.delete = function(key) {

  var pointer = this.items[key];

  if (typeof pointer === 'undefined') {
    return false;
  }

  delete this.items[key];

  if (this.size === 1) {
    this.size = 0;
    this.head = 0;
    this.tail = 0;
    this.deletedSize = 0;
    return true;
  }

  var previous = this.backward[pointer],
      next = this.forward[pointer];

  if (this.head === pointer) {
    this.head = next;
  }
  if (this.tail === pointer) {
    this.tail = previous;
  }

  this.forward[previous] = next;
  this.backward[next] = previous;

  this.size--;
  this.deleted[this.deletedSize++] = pointer;

  return true;
};

/**
 * Method used to remove and return the value for the given key in the cache.
 *
 * @param  {any} key                 - Key.
 * @param  {any} [missing=undefined] - Value to return if item is absent
 * @return {any} The value, if present; the missing indicator if absent
 */
LRUCacheWithDelete.prototype.remove = function(key, missing = undefined) {

  var pointer = this.items[key];

  if (typeof pointer === 'undefined') {
    return missing;
  }

  var dead = this.V[pointer];
  delete this.items[key];

  if (this.size === 1) {
    this.size = 0;
    this.head = 0;
    this.tail = 0;
    this.deletedSize = 0;
    return dead;
  }

  var previous = this.backward[pointer],
      next = this.forward[pointer];

  if (this.head === pointer) {
    this.head = next;
  }
  if (this.tail === pointer) {
    this.tail = previous;
  }

  this.forward[previous] = next;
  this.backward[next] = previous;

  this.size--;
  this.deleted[this.deletedSize++] = pointer;

  return dead;
};

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @param  {function} Keys     - Array class for storing keys.
 * @param  {function} Values   - Array class for storing values.
 * @param  {number}   capacity - Cache's capacity.
 * @return {LRUCacheWithDelete}
 */
 LRUCacheWithDelete.from = function(iterable, Keys, Values, capacity) {
  if (arguments.length < 2) {
    capacity = iterables$4.guessLength(iterable);

    if (typeof capacity !== 'number')
      throw new Error('mnemonist/lru-cache.from: could not guess iterable length. Please provide desired capacity as last argument.');
  }
  else if (arguments.length === 2) {
    capacity = Keys;
    Keys = null;
    Values = null;
  }

  var cache = new LRUCacheWithDelete(Keys, Values, capacity);

  forEach$a(iterable, function(value, key) {
    cache.set(key, value);
  });

  return cache;
};

var lruCacheWithDelete = LRUCacheWithDelete;

var LRUCache$1 = lruCache,
    forEach$9 = foreach,
    typed$3 = typedArrays,
    iterables$3 = iterables$c;

/**
 * LRUMap.
 *
 * @constructor
 * @param {function} Keys     - Array class for storing keys.
 * @param {function} Values   - Array class for storing values.
 * @param {number}   capacity - Desired capacity.
 */
function LRUMap$1(Keys, Values, capacity) {
  if (arguments.length < 2) {
    capacity = Keys;
    Keys = null;
    Values = null;
  }

  this.capacity = capacity;

  if (typeof this.capacity !== 'number' || this.capacity <= 0)
    throw new Error('mnemonist/lru-map: capacity should be positive number.');
  else if (!isFinite(this.capacity) || Math.floor(this.capacity) !== this.capacity)
    throw new Error('mnemonist/lru-map: capacity should be a finite positive integer.');

  var PointerArray = typed$3.getPointerArray(capacity);

  this.forward = new PointerArray(capacity);
  this.backward = new PointerArray(capacity);
  this.K = typeof Keys === 'function' ? new Keys(capacity) : new Array(capacity);
  this.V = typeof Values === 'function' ? new Values(capacity) : new Array(capacity);

  // Properties
  this.size = 0;
  this.head = 0;
  this.tail = 0;
  this.items = new Map();
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
LRUMap$1.prototype.clear = function() {
  this.size = 0;
  this.head = 0;
  this.tail = 0;
  this.items.clear();
};

/**
 * Method used to set the value for the given key in the cache.
 *
 * @param  {any} key   - Key.
 * @param  {any} value - Value.
 * @return {undefined}
 */
LRUMap$1.prototype.set = function(key, value) {

  var pointer = this.items.get(key);

  // The key already exists, we just need to update the value and splay on top
  if (typeof pointer !== 'undefined') {
    this.splayOnTop(pointer);
    this.V[pointer] = value;

    return;
  }

  // The cache is not yet full
  if (this.size < this.capacity) {
    pointer = this.size++;
  }

  // Cache is full, we need to drop the last value
  else {
    pointer = this.tail;
    this.tail = this.backward[pointer];
    this.items.delete(this.K[pointer]);
  }

  // Storing key & value
  this.items.set(key, pointer);
  this.K[pointer] = key;
  this.V[pointer] = value;

  // Moving the item at the front of the list
  this.forward[pointer] = this.head;
  this.backward[this.head] = pointer;
  this.head = pointer;
};

/**
 * Method used to set the value for the given key in the cache.
 *
 * @param  {any} key   - Key.
 * @param  {any} value - Value.
 * @return {{evicted: boolean, key: any, value: any}} An object containing the
 * key and value of an item that was overwritten or evicted in the set
 * operation, as well as a boolean indicating whether it was evicted due to
 * limited capacity. Return value is null if nothing was evicted or overwritten
 * during the set operation.
 */
LRUMap$1.prototype.setpop = function(key, value) {
  var oldValue = null;
  var oldKey = null;

  var pointer = this.items.get(key);

  // The key already exists, we just need to update the value and splay on top
  if (typeof pointer !== 'undefined') {
    this.splayOnTop(pointer);
    oldValue = this.V[pointer];
    this.V[pointer] = value;
    return {evicted: false, key: key, value: oldValue};
  }

  // The cache is not yet full
  if (this.size < this.capacity) {
    pointer = this.size++;
  }

  // Cache is full, we need to drop the last value
  else {
    pointer = this.tail;
    this.tail = this.backward[pointer];
    oldValue = this.V[pointer];
    oldKey = this.K[pointer];
    this.items.delete(this.K[pointer]);
  }

  // Storing key & value
  this.items.set(key, pointer);
  this.K[pointer] = key;
  this.V[pointer] = value;

  // Moving the item at the front of the list
  this.forward[pointer] = this.head;
  this.backward[this.head] = pointer;
  this.head = pointer;

  // Return object if eviction took place, otherwise return null
  if (oldKey) {
    return {evicted: true, key: oldKey, value: oldValue};
  }
  else {
    return null;
  }
};

/**
 * Method used to check whether the key exists in the cache.
 *
 * @param  {any} key   - Key.
 * @return {boolean}
 */
LRUMap$1.prototype.has = function(key) {
  return this.items.has(key);
};

/**
 * Method used to get the value attached to the given key. Will move the
 * related key to the front of the underlying linked list.
 *
 * @param  {any} key   - Key.
 * @return {any}
 */
LRUMap$1.prototype.get = function(key) {
  var pointer = this.items.get(key);

  if (typeof pointer === 'undefined')
    return;

  this.splayOnTop(pointer);

  return this.V[pointer];
};

/**
 * Method used to get the value attached to the given key. Does not modify
 * the ordering of the underlying linked list.
 *
 * @param  {any} key   - Key.
 * @return {any}
 */
LRUMap$1.prototype.peek = function(key) {
  var pointer = this.items.get(key);

  if (typeof pointer === 'undefined')
    return;

  return this.V[pointer];
};

/**
 * Methods that can be reused as-is from LRUCache.
 */
LRUMap$1.prototype.splayOnTop = LRUCache$1.prototype.splayOnTop;
LRUMap$1.prototype.forEach = LRUCache$1.prototype.forEach;
LRUMap$1.prototype.keys = LRUCache$1.prototype.keys;
LRUMap$1.prototype.values = LRUCache$1.prototype.values;
LRUMap$1.prototype.entries = LRUCache$1.prototype.entries;

/**
 * Attaching the #.entries method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  LRUMap$1.prototype[Symbol.iterator] = LRUMap$1.prototype.entries;

/**
 * Convenience known methods.
 */
LRUMap$1.prototype.inspect = LRUCache$1.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @param  {function} Keys     - Array class for storing keys.
 * @param  {function} Values   - Array class for storing values.
 * @param  {number}   capacity - Cache's capacity.
 * @return {LRUMap}
 */
LRUMap$1.from = function(iterable, Keys, Values, capacity) {
  if (arguments.length < 2) {
    capacity = iterables$3.guessLength(iterable);

    if (typeof capacity !== 'number')
      throw new Error('mnemonist/lru-cache.from: could not guess iterable length. Please provide desired capacity as last argument.');
  }
  else if (arguments.length === 2) {
    capacity = Keys;
    Keys = null;
    Values = null;
  }

  var cache = new LRUMap$1(Keys, Values, capacity);

  forEach$9(iterable, function(value, key) {
    cache.set(key, value);
  });

  return cache;
};

/**
 * Exporting.
 */
var lruMap = LRUMap$1;

var LRUMap = lruMap,
    forEach$8 = foreach,
    typed$2 = typedArrays,
    iterables$2 = iterables$c;

// The only complication with deleting items is that the LRU's
// performance depends on having a fixed-size list of pointers; the
// doubly-linked-list is happy to expand and contract.
//
// On delete, we record the position of the former item's pointer in a
// list of "holes" in the pointer array. On insert, if there is a hole
// the new pointer slots in to fill the hole; otherwise, it is
// appended as usual. (Note: we are only talking here about the
// internal pointer list. setting or getting an item promotes it
// to the top of the LRU ranking no matter what came before)

function LRUMapWithDelete(Keys, Values, capacity) {
  if (arguments.length < 2) {
    LRUMap.call(this, Keys);
  }
  else {
    LRUMap.call(this, Keys, Values, capacity);
  }
  var PointerArray = typed$2.getPointerArray(this.capacity);
  this.deleted = new PointerArray(this.capacity);
  this.deletedSize = 0;
}

for (var k in LRUMap.prototype)
  LRUMapWithDelete.prototype[k] = LRUMap.prototype[k];
if (typeof Symbol !== 'undefined')
  LRUMapWithDelete.prototype[Symbol.iterator] = LRUMap.prototype[Symbol.iterator];

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
 LRUMapWithDelete.prototype.clear = function() {
  LRUMap.prototype.clear.call(this);
  this.deletedSize = 0;
};

/**
 * Method used to set the value for the given key in the cache.
 *
 * @param  {any} key   - Key.
 * @param  {any} value - Value.
 * @return {undefined}
 */
LRUMapWithDelete.prototype.set = function(key, value) {

  var pointer = this.items.get(key);

  // The key already exists, we just need to update the value and splay on top
  if (typeof pointer !== 'undefined') {
    this.splayOnTop(pointer);
    this.V[pointer] = value;

    return;
  }

  // The cache is not yet full
  if (this.size < this.capacity) {
    if (this.deletedSize > 0) {
      // If there is a "hole" in the pointer list, reuse it
      pointer = this.deleted[--this.deletedSize];
    }
    else {
      // otherwise append to the pointer list
      pointer = this.size;
    }
    this.size++;
  }

  // Cache is full, we need to drop the last value
  else {
    pointer = this.tail;
    this.tail = this.backward[pointer];
    this.items.delete(this.K[pointer]);
  }

  // Storing key & value
  this.items.set(key, pointer);
  this.K[pointer] = key;
  this.V[pointer] = value;

  // Moving the item at the front of the list
  this.forward[pointer] = this.head;
  this.backward[this.head] = pointer;
  this.head = pointer;
};

/**
 * Method used to set the value for the given key in the cache
 *
 * @param  {any} key   - Key.
 * @param  {any} value - Value.
 * @return {{evicted: boolean, key: any, value: any}} An object containing the
 * key and value of an item that was overwritten or evicted in the set
 * operation, as well as a boolean indicating whether it was evicted due to
 * limited capacity. Return value is null if nothing was evicted or overwritten
 * during the set operation.
 */
LRUMapWithDelete.prototype.setpop = function(key, value) {
  var oldValue = null;
  var oldKey = null;

  var pointer = this.items.get(key);

  // The key already exists, we just need to update the value and splay on top
  if (typeof pointer !== 'undefined') {
    this.splayOnTop(pointer);
    oldValue = this.V[pointer];
    this.V[pointer] = value;
    return {evicted: false, key: key, value: oldValue};
  }

  // The cache is not yet full
  if (this.size < this.capacity) {
    if (this.deletedSize > 0) {
      // If there is a "hole" in the pointer list, reuse it
      pointer = this.deleted[--this.deletedSize];
    }
    else {
      // otherwise append to the pointer list
      pointer = this.size;
    }
    this.size++;
  }

  // Cache is full, we need to drop the last value
  else {
    pointer = this.tail;
    this.tail = this.backward[pointer];
    oldValue = this.V[pointer];
    oldKey = this.K[pointer];
    this.items.delete(this.K[pointer]);
  }

  // Storing key & value
  this.items.set(key, pointer);
  this.K[pointer] = key;
  this.V[pointer] = value;

  // Moving the item at the front of the list
  this.forward[pointer] = this.head;
  this.backward[this.head] = pointer;
  this.head = pointer;

  // Return object if eviction took place, otherwise return null
  if (oldKey) {
    return {evicted: true, key: oldKey, value: oldValue};
  }
  else {
    return null;
  }
};

/**
 * Method used to delete the entry for the given key in the cache.
 *
 * @param  {any} key   - Key.
 * @return {boolean}   - true if the item was present
 */
LRUMapWithDelete.prototype.delete = function(key) {

  var pointer = this.items.get(key);

  if (typeof pointer === 'undefined') {
    return false;
  }

  this.items.delete(key);

  if (this.size === 1) {
    this.size = 0;
    this.head = 0;
    this.tail = 0;
    this.deletedSize = 0;
    return true;
  }

  var previous = this.backward[pointer],
      next = this.forward[pointer];

  if (this.head === pointer) {
    this.head = next;
  }
  if (this.tail === pointer) {
    this.tail = previous;
  }

  this.forward[previous] = next;
  this.backward[next] = previous;

  this.size--;
  this.deleted[this.deletedSize++] = pointer;

  return true;
};

/**
 * Method used to remove and return the value for the given key in the cache.
 *
 * @param  {any} key                 - Key.
 * @param  {any} [missing=undefined] - Value to return if item is absent
 * @return {any} The value, if present; the missing indicator if absent
 */
LRUMapWithDelete.prototype.remove = function(key, missing = undefined) {

  var pointer = this.items.get(key);

  if (typeof pointer === 'undefined') {
    return missing;
  }

  var dead = this.V[pointer];
  this.items.delete(key);

  if (this.size === 1) {
    this.size = 0;
    this.head = 0;
    this.tail = 0;
    this.deletedSize = 0;
    return dead;
  }

  var previous = this.backward[pointer],
      next = this.forward[pointer];

  if (this.head === pointer) {
    this.head = next;
  }
  if (this.tail === pointer) {
    this.tail = previous;
  }

  this.forward[previous] = next;
  this.backward[next] = previous;

  this.size--;
  this.deleted[this.deletedSize++] = pointer;

  return dead;
};

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @param  {function} Keys     - Array class for storing keys.
 * @param  {function} Values   - Array class for storing values.
 * @param  {number}   capacity - Cache's capacity.
 * @return {LRUMapWithDelete}
 */
 LRUMapWithDelete.from = function(iterable, Keys, Values, capacity) {
  if (arguments.length < 2) {
    capacity = iterables$2.guessLength(iterable);

    if (typeof capacity !== 'number')
      throw new Error('mnemonist/lru-map.from: could not guess iterable length. Please provide desired capacity as last argument.');
  }
  else if (arguments.length === 2) {
    capacity = Keys;
    Keys = null;
    Values = null;
  }

  var cache = new LRUMapWithDelete(Keys, Values, capacity);

  forEach$8(iterable, function(value, key) {
    cache.set(key, value);
  });

  return cache;
};

var lruMapWithDelete = LRUMapWithDelete;

var Iterator$8 = iterator,
    forEach$7 = foreach,
    FixedReverseHeap = fixedReverseHeap;

/**
 * Helpers.
 */
var MULTISET_ITEM_COMPARATOR = function(a, b) {
  if (a[1] > b[1])
    return -1;
  if (a[1] < b[1])
    return 1;

  return 0;
};

// TODO: helper functions: union, intersection, sum, difference, subtract

/**
 * MultiSet.
 *
 * @constructor
 */
function MultiSet() {
  this.items = new Map();

  Object.defineProperty(this.items, 'constructor', {
    value: MultiSet,
    enumerable: false
  });

  this.clear();
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
MultiSet.prototype.clear = function() {

  // Properties
  this.size = 0;
  this.dimension = 0;
  this.items.clear();
};

/**
 * Method used to add an item to the set.
 *
 * @param  {any}    item  - Item to add.
 * @param  {number} count - Optional count.
 * @return {MultiSet}
 */
MultiSet.prototype.add = function(item, count) {
  if (count === 0)
    return this;

  if (count < 0)
    return this.remove(item, -count);

  count = count || 1;

  if (typeof count !== 'number')
    throw new Error('mnemonist/multi-set.add: given count should be a number.');

  this.size += count;

  const currentCount = this.items.get(item);

  if (currentCount === undefined)
    this.dimension++;
  else
    count += currentCount;

  this.items.set(item, count);

  return this;
};

/**
 * Method used to set the multiplicity of an item in the set.
 *
 * @param  {any}    item  - Target item.
 * @param  {number} count - Desired multiplicity.
 * @return {MultiSet}
 */
MultiSet.prototype.set = function(item, count) {
  var currentCount;

  if (typeof count !== 'number')
    throw new Error('mnemonist/multi-set.set: given count should be a number.');

  // Setting an item to 0 or to a negative number means deleting it from the set
  if (count <= 0) {
    currentCount = this.items.get(item);

    if (typeof currentCount !== 'undefined') {
      this.size -= currentCount;
      this.dimension--;
    }

    this.items.delete(item);
    return this;
  }

  count = count || 1;

  currentCount = this.items.get(item);

  if (typeof currentCount === 'number') {
    this.items.set(item, currentCount + count);
  }
  else {
    this.dimension++;
    this.items.set(item, count);
  }

  this.size += count;

  return this;
};

/**
 * Method used to return whether the item exists in the set.
 *
 * @param  {any} item  - Item to check.
 * @return {boolan}
 */
MultiSet.prototype.has = function(item) {
  return this.items.has(item);
};

/**
 * Method used to delete an item from the set.
 *
 * @param  {any} item  - Item to delete.
 * @return {boolan}
 */
MultiSet.prototype.delete = function(item) {
  var count = this.items.get(item);

  if (count === 0)
    return false;

  this.size -= count;
  this.dimension--;
  this.items.delete(item);

  return true;
};

/**
 * Method used to remove an item from the set.
 *
 * @param  {any} item  - Item to delete.
 * @param  {number} count - Optional count.
 * @return {undefined}
 */
MultiSet.prototype.remove = function(item, count) {
  if (count === 0)
    return;

  if (count < 0)
    return this.add(item, -count);

  count = count || 1;

  if (typeof count !== 'number')
    throw new Error('mnemonist/multi-set.remove: given count should be a number.');

  var currentCount = this.multiplicity(item),
      newCount = Math.max(0, currentCount - count);

  if (newCount === 0) {
    this.delete(item);
  }
  else {
    this.items.set(item, newCount);
    this.size -= (currentCount - newCount);
  }

  return;
};

/**
 * Method used to change a key into another one, merging counts if the target
 * key already exists.
 *
 * @param  {any} a - From key.
 * @param  {any} b - To key.
 * @return {MultiSet}
 */
MultiSet.prototype.edit = function(a, b) {
  var am = this.multiplicity(a);

  // If a does not exist in the set, we can stop right there
  if (am === 0)
    return;

  var bm = this.multiplicity(b);

  this.items.set(b, am + bm);
  this.items.delete(a);

  return this;
};

/**
 * Method used to return the multiplicity of the given item.
 *
 * @param  {any} item  - Item to get.
 * @return {number}
 */
MultiSet.prototype.multiplicity = function(item) {
  var count = this.items.get(item);

  if (typeof count === 'undefined')
    return 0;

  return count;
};
MultiSet.prototype.get = MultiSet.prototype.multiplicity;
MultiSet.prototype.count = MultiSet.prototype.multiplicity;

/**
 * Method used to return the frequency of the given item in the set.
 *
 * @param  {any} item - Item to get.
 * @return {number}
 */
MultiSet.prototype.frequency = function(item) {
  if (this.size === 0)
    return 0;

  var count = this.multiplicity(item);

  return count / this.size;
};

/**
 * Method used to return the n most common items from the set.
 *
 * @param  {number} n - Number of items to retrieve.
 * @return {array}
 */
MultiSet.prototype.top = function(n) {
  if (typeof n !== 'number' || n <= 0)
    throw new Error('mnemonist/multi-set.top: n must be a number > 0.');

  var heap = new FixedReverseHeap(Array, MULTISET_ITEM_COMPARATOR, n);

  var iterator = this.items.entries(),
      step;

  while ((step = iterator.next(), !step.done))
    heap.push(step.value);

  return heap.consume();
};

/**
 * Method used to iterate over the set's values.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
MultiSet.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  var i;

  this.items.forEach(function(multiplicity, value) {

    for (i = 0; i < multiplicity; i++)
      callback.call(scope, value, value);
  });
};

/**
 * Method used to iterate over the set's multiplicities.
 *
 * @param  {function}  callback - Function to call for each multiplicity.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
MultiSet.prototype.forEachMultiplicity = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  this.items.forEach(callback, scope);
};

/**
 * Method returning an iterator over the set's keys. I.e. its unique values,
 * in a sense.
 *
 * @return {Iterator}
 */
MultiSet.prototype.keys = function() {
  return this.items.keys();
};

/**
 * Method returning an iterator over the set's values.
 *
 * @return {Iterator}
 */
MultiSet.prototype.values = function() {
  var iterator = this.items.entries(),
      inContainer = false,
      step,
      value,
      multiplicity,
      i;

  return new Iterator$8(function next() {
    if (!inContainer) {
      step = iterator.next();

      if (step.done)
        return {done: true};

      inContainer = true;
      value = step.value[0];
      multiplicity = step.value[1];
      i = 0;
    }

    if (i >= multiplicity) {
      inContainer = false;
      return next();
    }

    i++;

    return {
      done: false,
      value: value
    };
  });
};

/**
 * Method returning an iterator over the set's multiplicities.
 *
 * @return {Iterator}
 */
MultiSet.prototype.multiplicities = function() {
  return this.items.entries();
};

/**
 * Attaching the #.entries method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  MultiSet.prototype[Symbol.iterator] = MultiSet.prototype.values;

/**
 * Convenience known methods.
 */
MultiSet.prototype.inspect = function() {
  return this.items;
};

if (typeof Symbol !== 'undefined')
  MultiSet.prototype[Symbol.for('nodejs.util.inspect.custom')] = MultiSet.prototype.inspect;
MultiSet.prototype.toJSON = function() {
  return this.items;
};

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @return {MultiSet}
 */
MultiSet.from = function(iterable) {
  var set = new MultiSet();

  forEach$7(iterable, function(value) {
    set.add(value);
  });

  return set;
};

/**
 * Function returning whether the multiset A is a subset of the multiset B.
 *
 * @param  {MultiSet} A - First set.
 * @param  {MultiSet} B - Second set.
 * @return {boolean}
 */
MultiSet.isSubset = function(A, B) {
  var iterator = A.multiplicities(),
      step,
      key,
      mA;

  // Shortcuts
  if (A === B)
    return true;

  if (A.dimension > B.dimension)
    return false;

  while ((step = iterator.next(), !step.done)) {
    key = step.value[0];
    mA = step.value[1];

    if (B.multiplicity(key) < mA)
      return false;
  }

  return true;
};

/**
 * Function returning whether the multiset A is a superset of the multiset B.
 *
 * @param  {MultiSet} A - First set.
 * @param  {MultiSet} B - Second set.
 * @return {boolean}
 */
MultiSet.isSuperset = function(A, B) {
  return MultiSet.isSubset(B, A);
};

/**
 * Exporting.
 */
var multiSet = MultiSet;

var Iterator$7 = iterator,
    forEach$6 = foreach;

// TODO: leveraging BagDistance as an upper bound of Levenshtein
// TODO: leverage n-grams recursive indexing
// TODO: try the MultiArray as a memory backend
// TODO: what about damerau levenshtein

/**
 * Helpers.
 */

/**
 * Function returning the number of substrings that will be selected by the
 * multi-match-aware selection scheme for theshold `k`, for a string of length
 * `s` to match strings of length `l`.
 *
 * @param   {number} k - Levenshtein distance threshold.
 * @param   {number} s - Length of target strings.
 * @param   {number} l - Length of strings to match.
 * @returns {number}   - The number of selected substrings.
 */
function countSubstringsL(k, s, l) {
  return (((Math.pow(k, 2) - Math.pow(Math.abs(s - l), 2)) / 2) | 0) + k + 1;
}

/**
 * Function returning the minimum number of substrings that will be selected by
 * the multi-match-aware selection scheme for theshold `k`, for a string of
 * length `s` to match any string of relevant length.
 *
 * @param   {number} k - Levenshtein distance threshold.
 * @param   {number} s - Length of target strings.
 * @returns {number}   - The number of selected substrings.
 */
function countKeys(k, s) {
  var c = 0;

  for (var l = 0, m = s + 1; l < m; l++)
    c += countSubstringsL(k, s, l);

  return c;
}

/**
 * Function used to compare two keys in order to sort them first by decreasing
 * length and then alphabetically as per the "4.2 Effective Indexing Strategy"
 * point of the paper.
 *
 * @param   {number} k - Levenshtein distance threshold.
 * @param   {number} s - Length of target strings.
 * @returns {number}   - The number of selected substrings.
 */
function comparator$1(a, b) {
  if (a.length > b.length)
    return -1;
  if (a.length < b.length)
    return 1;

  if (a < b)
    return -1;
  if (a > b)
    return 1;

  return 0;
}

/**
 * Function partitioning a string into k + 1 uneven segments, the shorter
 * ones, then the longer ones.
 *
 * @param   {number} k - Levenshtein distance threshold.
 * @param   {number} l - Length of the string.
 * @returns {Array}    - The partition tuples (start, length).
 */
function partition(k, l) {
  var m = k + 1,
      a = (l / m) | 0,
      b = a + 1,
      i,
      j;

  var largeSegments = l - a * m,
      smallSegments = m - largeSegments;

  var tuples = new Array(k + 1);

  for (i = 0; i < smallSegments; i++)
    tuples[i] = [i * a, a];

  var offset = (i - 1) * a + a;

  for (j = 0; j < largeSegments; j++)
    tuples[i + j] = [offset + j * b, b];

  return tuples;
}

/**
 * Function yielding a string's k + 1 passjoin segments to index.
 *
 * @param   {number} k      - Levenshtein distance threshold.
 * @param   {string} string - Target string.
 * @returns {Array}         - The string's segments.
 */
function segments(k, string) {
  var l = string.length,
      m = k + 1,
      a = (l / m) | 0,
      b = a + 1,
      o,
      i,
      j;

  var largeSegments = l - a * m,
      smallSegments = m - largeSegments;

  var S = new Array(k + 1);

  for (i = 0; i < smallSegments; i++) {
    o = i * a;
    S[i] = string.slice(o, o + a);
  }

  var offset = (i - 1) * a + a;

  for (j = 0; j < largeSegments; j++) {
    o = offset + j * b;
    S[i + j] = string.slice(o, o + b);
  }

  return S;
}

// TODO: jsdocs
function segmentPos(k, i, string) {
  if (i === 0)
    return 0;

  var l = string.length;

  var m = k + 1,
      a = (l / m) | 0,
      b = a + 1;

  var largeSegments = l - a * m,
      smallSegments = m - largeSegments;

  if (i <= smallSegments - 1)
    return i * a;

  var offset = i - smallSegments;

  return smallSegments * a + offset * b;
}

/**
 * Function returning the interval of relevant substrings to lookup using the
 * multi-match-aware substring selection scheme described in the paper.
 *
 * @param   {number} k      - Levenshtein distance threshold.
 * @param   {number} delta  - Signed length difference between both considered strings.
 * @param   {number} i      - k + 1 segment index.
 * @param   {number} s      - String's length.
 * @param   {number} pi     - k + 1 segment position in target string.
 * @param   {number} li     - k + 1 segment length.
 * @returns {Array}         - The interval (start, stop).
 */
function multiMatchAwareInterval(k, delta, i, s, pi, li) {
  var start1 = pi - i,
      end1 = pi + i;

  var o = k - i;

  var start2 = pi + delta - o,
      end2 = pi + delta + o;

  var end3 = s - li;

  return [Math.max(0, start1, start2), Math.min(end1, end2, end3)];
}

/**
 * Function yielding relevant substrings to lookup using the multi-match-aware
 * substring selection scheme described in the paper.
 *
 * @param   {number} k      - Levenshtein distance threshold.
 * @param   {string} string  - Target string.
 * @param   {number} l      - Length of strings to match.
 * @param   {number} i      - k + 1 segment index.
 * @param   {number} pi     - k + 1 segment position in target string.
 * @param   {number} li     - k + 1 segment length.
 * @returns {Array}         - The contiguous substrings.
 */
function multiMatchAwareSubstrings(k, string, l, i, pi, li) {
  var s = string.length;

  // Note that we need to keep the non-absolute delta for this function
  // to work in both directions, up & down
  var delta = s - l;

  var interval = multiMatchAwareInterval(k, delta, i, s, pi, li);

  var start = interval[0],
      stop = interval[1];

  var currentSubstring = '';

  var substrings = [];

  var substring, j, m;

  for (j = start, m = stop + 1; j < m; j++) {
    substring = string.slice(j, j + li);

    // We skip identical consecutive substrings (to avoid repetition in case
    // of contiguous letter duplication)
    if (substring === currentSubstring)
      continue;

    substrings.push(substring);

    currentSubstring = substring;
  }

  return substrings;
}

/**
 * PassjoinIndex.
 *
 * @note I tried to apply the paper's optimizations regarding Levenshtein
 * distance computations but it did not provide a performance boost, quite
 * the contrary. This is because since we are mostly using the index for small k
 * here, most of the strings we work on are quite small and the bookkeeping
 * induced by Ukkonen's method and the paper's one are slowing us down more than
 * they actually help us go faster.
 *
 * @note This implementation does not try to ensure that you add the same string
 * more than once.
 *
 * @constructor
 * @param {function} levenshtein - Levenshtein distance function.
 * @param {number}   k           - Levenshtein distance threshold.
 */
function PassjoinIndex(levenshtein, k) {
  if (typeof levenshtein !== 'function')
    throw new Error('mnemonist/passjoin-index: `levenshtein` should be a function returning edit distance between two strings.');

  if (typeof k !== 'number' || k < 1)
    throw new Error('mnemonist/passjoin-index: `k` should be a number > 0');

  this.levenshtein = levenshtein;
  this.k = k;
  this.clear();
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
PassjoinIndex.prototype.clear = function() {

  // Properties
  this.size = 0;
  this.strings = [];
  this.invertedIndices = {};
};

/**
 * Method used to add a new value to the index.
 *
 * @param  {string|Array} value - Value to add.
 * @return {PassjoinIndex}
 */
PassjoinIndex.prototype.add = function(value) {
  var l = value.length;

  var stringIndex = this.size;

  this.strings.push(value);
  this.size++;

  var S = segments(this.k, value);

  var Ll = this.invertedIndices[l];

  if (typeof Ll === 'undefined') {
    Ll = {};
    this.invertedIndices[l] = Ll;
  }

  var segment,
      matches,
      key,
      i,
      m;

  for (i = 0, m = S.length; i < m; i++) {
    segment = S[i];
    key = segment + i;
    matches = Ll[key];

    if (typeof matches === 'undefined') {
      matches = [stringIndex];
      Ll[key] = matches;
    }
    else {
      matches.push(stringIndex);
    }
  }

  return this;
};

/**
 * Method used to search for string matching the given query.
 *
 * @param  {string|Array} query - Query string.
 * @return {Array}
 */
PassjoinIndex.prototype.search = function(query) {
  var s = query.length,
      k = this.k;

  var M = new Set();

  var candidates,
      candidate,
      queryPos,
      querySegmentLength,
      key,
      S,
      P,
      l,
      m,
      i,
      n1,
      j,
      n2,
      y,
      n3;

  for (l = Math.max(0, s - k), m = s + k + 1; l < m; l++) {
    var Ll = this.invertedIndices[l];

    if (typeof Ll === 'undefined')
      continue;

    P = partition(k, l);

    for (i = 0, n1 = P.length; i < n1; i++) {
      queryPos = P[i][0];
      querySegmentLength = P[i][1];

      S = multiMatchAwareSubstrings(
        k,
        query,
        l,
        i,
        queryPos,
        querySegmentLength
      );

      // Empty string edge case
      if (!S.length)
        S = [''];

      for (j = 0, n2 = S.length; j < n2; j++) {
        key = S[j] + i;
        candidates = Ll[key];

        if (typeof candidates === 'undefined')
          continue;

        for (y = 0, n3 = candidates.length; y < n3; y++) {
          candidate = this.strings[candidates[y]];

          // NOTE: first condition is here not to compute Levenshtein
          // distance for tiny strings

          // NOTE: maintaining a Set of rejected candidate is not really useful
          // because it consumes more memory and because non-matches are
          // less likely to be candidates agains
          if (
            s <= k && l <= k ||
            (
              !M.has(candidate) &&
              this.levenshtein(query, candidate) <= k
            )
          )
            M.add(candidate);
        }
      }
    }
  }

  return M;
};

/**
 * Method used to iterate over the index.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
PassjoinIndex.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  for (var i = 0, l = this.strings.length; i < l; i++)
    callback.call(scope, this.strings[i], i, this);
};

/**
 * Method used to create an iterator over a index's values.
 *
 * @return {Iterator}
 */
PassjoinIndex.prototype.values = function() {
  var strings = this.strings,
      l = strings.length,
      i = 0;

  return new Iterator$7(function() {
    if (i >= l)
      return {
        done: true
      };

    var value = strings[i];
    i++;

    return {
      value: value,
      done: false
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  PassjoinIndex.prototype[Symbol.iterator] = PassjoinIndex.prototype.values;

/**
 * Convenience known methods.
 */
PassjoinIndex.prototype.inspect = function() {
  var array = this.strings.slice();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: PassjoinIndex,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  PassjoinIndex.prototype[Symbol.for('nodejs.util.inspect.custom')] = PassjoinIndex.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @return {PassjoinIndex}
 */
PassjoinIndex.from = function(iterable, levenshtein, k) {
  var index = new PassjoinIndex(levenshtein, k);

  forEach$6(iterable, function(string) {
    index.add(string);
  });

  return index;
};

/**
 * Exporting.
 */
PassjoinIndex.countKeys = countKeys;
PassjoinIndex.comparator = comparator$1;
PassjoinIndex.partition = partition;
PassjoinIndex.segments = segments;
PassjoinIndex.segmentPos = segmentPos;
PassjoinIndex.multiMatchAwareInterval = multiMatchAwareInterval;
PassjoinIndex.multiMatchAwareSubstrings = multiMatchAwareSubstrings;

var passjoinIndex = PassjoinIndex;

var Iterator$6 = iterator,
    forEach$5 = foreach;

/**
 * Queue
 *
 * @constructor
 */
function Queue() {
  this.clear();
}

/**
 * Method used to clear the queue.
 *
 * @return {undefined}
 */
Queue.prototype.clear = function() {

  // Properties
  this.items = [];
  this.offset = 0;
  this.size = 0;
};

/**
 * Method used to add an item to the queue.
 *
 * @param  {any}    item - Item to enqueue.
 * @return {number}
 */
Queue.prototype.enqueue = function(item) {

  this.items.push(item);
  return ++this.size;
};

/**
 * Method used to retrieve & remove the first item of the queue.
 *
 * @return {any}
 */
Queue.prototype.dequeue = function() {
  if (!this.size)
    return;

  var item = this.items[this.offset];

  if (++this.offset * 2 >= this.items.length) {
    this.items = this.items.slice(this.offset);
    this.offset = 0;
  }

  this.size--;

  return item;
};

/**
 * Method used to retrieve the first item of the queue.
 *
 * @return {any}
 */
Queue.prototype.peek = function() {
  if (!this.size)
    return;

  return this.items[this.offset];
};

/**
 * Method used to iterate over the queue.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
Queue.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  for (var i = this.offset, j = 0, l = this.items.length; i < l; i++, j++)
    callback.call(scope, this.items[i], j, this);
};

/*
 * Method used to convert the queue to a JavaScript array.
 *
 * @return {array}
 */
Queue.prototype.toArray = function() {
  return this.items.slice(this.offset);
};

/**
 * Method used to create an iterator over a queue's values.
 *
 * @return {Iterator}
 */
Queue.prototype.values = function() {
  var items = this.items,
      i = this.offset;

  return new Iterator$6(function() {
    if (i >= items.length)
      return {
        done: true
      };

    var value = items[i];
    i++;

    return {
      value: value,
      done: false
    };
  });
};

/**
 * Method used to create an iterator over a queue's entries.
 *
 * @return {Iterator}
 */
Queue.prototype.entries = function() {
  var items = this.items,
      i = this.offset,
      j = 0;

  return new Iterator$6(function() {
    if (i >= items.length)
      return {
        done: true
      };

    var value = items[i];
    i++;

    return {
      value: [j++, value],
      done: false
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  Queue.prototype[Symbol.iterator] = Queue.prototype.values;

/**
 * Convenience known methods.
 */
Queue.prototype.toString = function() {
  return this.toArray().join(',');
};

Queue.prototype.toJSON = function() {
  return this.toArray();
};

Queue.prototype.inspect = function() {
  var array = this.toArray();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: Queue,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  Queue.prototype[Symbol.for('nodejs.util.inspect.custom')] = Queue.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a queue.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @return {Queue}
 */
Queue.from = function(iterable) {
  var queue = new Queue();

  forEach$5(iterable, function(value) {
    queue.enqueue(value);
  });

  return queue;
};

/**
 * Static @.of function taking an arbitrary number of arguments & converting it
 * into a queue.
 *
 * @param  {...any} args
 * @return {Queue}
 */
Queue.of = function() {
  return Queue.from(arguments);
};

/**
 * Exporting.
 */
var queue = Queue;

var Iterator$5 = iterator,
    forEach$4 = foreach;

/**
 * Stack
 *
 * @constructor
 */
function Stack() {
  this.clear();
}

/**
 * Method used to clear the stack.
 *
 * @return {undefined}
 */
Stack.prototype.clear = function() {

  // Properties
  this.items = [];
  this.size = 0;
};

/**
 * Method used to add an item to the stack.
 *
 * @param  {any}    item - Item to add.
 * @return {number}
 */
Stack.prototype.push = function(item) {
  this.items.push(item);
  return ++this.size;
};

/**
 * Method used to retrieve & remove the last item of the stack.
 *
 * @return {any}
 */
Stack.prototype.pop = function() {
  if (this.size === 0)
    return;

  this.size--;
  return this.items.pop();
};

/**
 * Method used to get the last item of the stack.
 *
 * @return {any}
 */
Stack.prototype.peek = function() {
  return this.items[this.size - 1];
};

/**
 * Method used to iterate over the stack.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
Stack.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  for (var i = 0, l = this.items.length; i < l; i++)
    callback.call(scope, this.items[l - i - 1], i, this);
};

/**
 * Method used to convert the stack to a JavaScript array.
 *
 * @return {array}
 */
Stack.prototype.toArray = function() {
  var array = new Array(this.size),
      l = this.size - 1,
      i = this.size;

  while (i--)
    array[i] = this.items[l - i];

  return array;
};

/**
 * Method used to create an iterator over a stack's values.
 *
 * @return {Iterator}
 */
Stack.prototype.values = function() {
  var items = this.items,
      l = items.length,
      i = 0;

  return new Iterator$5(function() {
    if (i >= l)
      return {
        done: true
      };

    var value = items[l - i - 1];
    i++;

    return {
      value: value,
      done: false
    };
  });
};

/**
 * Method used to create an iterator over a stack's entries.
 *
 * @return {Iterator}
 */
Stack.prototype.entries = function() {
  var items = this.items,
      l = items.length,
      i = 0;

  return new Iterator$5(function() {
    if (i >= l)
      return {
        done: true
      };

    var value = items[l - i - 1];

    return {
      value: [i++, value],
      done: false
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  Stack.prototype[Symbol.iterator] = Stack.prototype.values;


/**
 * Convenience known methods.
 */
Stack.prototype.toString = function() {
  return this.toArray().join(',');
};

Stack.prototype.toJSON = function() {
  return this.toArray();
};

Stack.prototype.inspect = function() {
  var array = this.toArray();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: Stack,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  Stack.prototype[Symbol.for('nodejs.util.inspect.custom')] = Stack.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a stack.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @return {Stack}
 */
Stack.from = function(iterable) {
  var stack = new Stack();

  forEach$4(iterable, function(value) {
    stack.push(value);
  });

  return stack;
};

/**
 * Static @.of function taking an arbitrary number of arguments & converting it
 * into a stack.
 *
 * @param  {...any} args
 * @return {Stack}
 */
Stack.of = function() {
  return Stack.from(arguments);
};

/**
 * Exporting.
 */
var stack = Stack;

var set = {};

(function (exports) {
	// TODO: optimize versions for less variadicities

	/**
	 * Variadic function computing the intersection of multiple sets.
	 *
	 * @param  {...Set} sets - Sets to intersect.
	 * @return {Set}         - The intesection.
	 */
	exports.intersection = function() {
	  if (arguments.length < 2)
	    throw new Error('mnemonist/Set.intersection: needs at least two arguments.');

	  var I = new Set();

	  // First we need to find the smallest set
	  var smallestSize = Infinity,
	      smallestSet = null;

	  var s, i, l = arguments.length;

	  for (i = 0; i < l; i++) {
	    s = arguments[i];

	    // If one of the set has no items, we can stop right there
	    if (s.size === 0)
	      return I;

	    if (s.size < smallestSize) {
	      smallestSize = s.size;
	      smallestSet = s;
	    }
	  }

	  // Now we need to intersect this set with the others
	  var iterator = smallestSet.values(),
	      step,
	      item,
	      add,
	      set;

	  // TODO: we can optimize by iterating each next time over the current intersection
	  // but this probably means more RAM to consume since we'll create n-1 sets rather than
	  // only the one.
	  while ((step = iterator.next(), !step.done)) {
	    item = step.value;
	    add = true;

	    for (i = 0; i < l; i++) {
	      set = arguments[i];

	      if (set === smallestSet)
	        continue;

	      if (!set.has(item)) {
	        add = false;
	        break;
	      }
	    }

	    if (add)
	      I.add(item);
	  }

	  return I;
	};

	/**
	 * Variadic function computing the union of multiple sets.
	 *
	 * @param  {...Set} sets - Sets to unite.
	 * @return {Set}         - The union.
	 */
	exports.union = function() {
	  if (arguments.length < 2)
	    throw new Error('mnemonist/Set.union: needs at least two arguments.');

	  var U = new Set();

	  var i, l = arguments.length;

	  var iterator,
	      step;

	  for (i = 0; i < l; i++) {
	    iterator = arguments[i].values();

	    while ((step = iterator.next(), !step.done))
	      U.add(step.value);
	  }

	  return U;
	};

	/**
	 * Function computing the difference between two sets.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 * @return {Set}   - The difference.
	 */
	exports.difference = function(A, B) {

	  // If first set is empty
	  if (!A.size)
	    return new Set();

	  if (!B.size)
	    return new Set(A);

	  var D = new Set();

	  var iterator = A.values(),
	      step;

	  while ((step = iterator.next(), !step.done)) {
	    if (!B.has(step.value))
	      D.add(step.value);
	  }

	  return D;
	};

	/**
	 * Function computing the symmetric difference between two sets.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 * @return {Set}   - The symmetric difference.
	 */
	exports.symmetricDifference = function(A, B) {
	  var S = new Set();

	  var iterator = A.values(),
	      step;

	  while ((step = iterator.next(), !step.done)) {
	    if (!B.has(step.value))
	      S.add(step.value);
	  }

	  iterator = B.values();

	  while ((step = iterator.next(), !step.done)) {
	    if (!A.has(step.value))
	      S.add(step.value);
	  }

	  return S;
	};

	/**
	 * Function returning whether A is a subset of B.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 * @return {boolean}
	 */
	exports.isSubset = function(A, B) {
	  var iterator = A.values(),
	      step;

	  // Shortcuts
	  if (A === B)
	    return true;

	  if (A.size > B.size)
	    return false;

	  while ((step = iterator.next(), !step.done)) {
	    if (!B.has(step.value))
	      return false;
	  }

	  return true;
	};

	/**
	 * Function returning whether A is a superset of B.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 * @return {boolean}
	 */
	exports.isSuperset = function(A, B) {
	  return exports.isSubset(B, A);
	};

	/**
	 * Function adding the items of set B to the set A.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 */
	exports.add = function(A, B) {
	  var iterator = B.values(),
	      step;

	  while ((step = iterator.next(), !step.done))
	    A.add(step.value);

	  return;
	};

	/**
	 * Function subtracting the items of set B from the set A.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 */
	exports.subtract = function(A, B) {
	  var iterator = B.values(),
	      step;

	  while ((step = iterator.next(), !step.done))
	    A.delete(step.value);

	  return;
	};

	/**
	 * Function intersecting the items of A & B.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 */
	exports.intersect = function(A, B) {
	  var iterator = A.values(),
	      step;

	  while ((step = iterator.next(), !step.done)) {
	    if (!B.has(step.value))
	      A.delete(step.value);
	  }

	  return;
	};

	/**
	 * Function disjuncting the items of A & B.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 */
	exports.disjunct = function(A, B) {
	  var iterator = A.values(),
	      step;

	  var toRemove = [];

	  while ((step = iterator.next(), !step.done)) {
	    if (B.has(step.value))
	      toRemove.push(step.value);
	  }

	  iterator = B.values();

	  while ((step = iterator.next(), !step.done)) {
	    if (!A.has(step.value))
	      A.add(step.value);
	  }

	  for (var i = 0, l = toRemove.length; i < l; i++)
	    A.delete(toRemove[i]);

	  return;
	};

	/**
	 * Function returning the size of the intersection of A & B.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 * @return {number}
	 */
	exports.intersectionSize = function(A, B) {
	  var tmp;

	  // We need to know the smallest set
	  if (A.size > B.size) {
	    tmp = A;
	    A = B;
	    B = tmp;
	  }

	  if (A.size === 0)
	    return 0;

	  if (A === B)
	    return A.size;

	  var iterator = A.values(),
	      step;

	  var I = 0;

	  while ((step = iterator.next(), !step.done)) {
	    if (B.has(step.value))
	      I++;
	  }

	  return I;
	};

	/**
	 * Function returning the size of the union of A & B.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 * @return {number}
	 */
	exports.unionSize = function(A, B) {
	  var I = exports.intersectionSize(A, B);

	  return A.size + B.size - I;
	};

	/**
	 * Function returning the Jaccard similarity between A & B.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 * @return {number}
	 */
	exports.jaccard = function(A, B) {
	  var I = exports.intersectionSize(A, B);

	  if (I === 0)
	    return 0;

	  var U = A.size + B.size - I;

	  return I / U;
	};

	/**
	 * Function returning the overlap coefficient between A & B.
	 *
	 * @param  {Set} A - First set.
	 * @param  {Set} B - Second set.
	 * @return {number}
	 */
	exports.overlap = function(A, B) {
	  var I = exports.intersectionSize(A, B);

	  if (I === 0)
	    return 0;

	  return I / Math.min(A.size, B.size);
	};
} (set));

var Iterator$4 = iterator,
    getPointerArray$3 = typedArrays.getPointerArray;

/**
 * SparseQueueSet.
 *
 * @constructor
 */
function SparseQueueSet(capacity) {

  var ByteArray = getPointerArray$3(capacity);

  // Properties
  this.start = 0;
  this.size = 0;
  this.capacity = capacity;
  this.dense = new ByteArray(capacity);
  this.sparse = new ByteArray(capacity);
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
SparseQueueSet.prototype.clear = function() {
  this.start = 0;
  this.size = 0;
};

/**
 * Method used to check the existence of a member in the queue.
 *
 * @param  {number} member - Member to test.
 * @return {SparseQueueSet}
 */
SparseQueueSet.prototype.has = function(member) {
  if (this.size === 0)
    return false;

  var index = this.sparse[member];

  var inBounds = (
    index < this.capacity &&
    (
      index >= this.start &&
      index < this.start + this.size
    ) ||
    (
      index < ((this.start + this.size) % this.capacity)
    )
  );

  return (
    inBounds &&
    this.dense[index] === member
  );
};

/**
 * Method used to add a member to the queue.
 *
 * @param  {number} member - Member to add.
 * @return {SparseQueueSet}
 */
SparseQueueSet.prototype.enqueue = function(member) {
  var index = this.sparse[member];

  if (this.size !== 0) {
    var inBounds = (
      index < this.capacity &&
      (
        index >= this.start &&
        index < this.start + this.size
      ) ||
      (
        index < ((this.start + this.size) % this.capacity)
      )
    );

    if (inBounds && this.dense[index] === member)
      return this;
  }

  index = (this.start + this.size) % this.capacity;

  this.dense[index] = member;
  this.sparse[member] = index;
  this.size++;

  return this;
};

/**
 * Method used to remove the next member from the queue.
 *
 * @param  {number} member - Member to delete.
 * @return {boolean}
 */
SparseQueueSet.prototype.dequeue = function() {
  if (this.size === 0)
    return;

  var index = this.start;

  this.size--;
  this.start++;

  if (this.start === this.capacity)
    this.start = 0;

  var member = this.dense[index];

  this.sparse[member] = this.capacity;

  return member;
};

/**
 * Method used to iterate over the queue's values.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
SparseQueueSet.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  var c = this.capacity,
      l = this.size,
      i = this.start,
      j = 0;

  while (j < l) {
    callback.call(scope, this.dense[i], j, this);
    i++;
    j++;

    if (i === c)
      i = 0;
  }
};

/**
 * Method used to create an iterator over a set's values.
 *
 * @return {Iterator}
 */
SparseQueueSet.prototype.values = function() {
  var dense = this.dense,
      c = this.capacity,
      l = this.size,
      i = this.start,
      j = 0;

  return new Iterator$4(function() {
    if (j >= l)
      return {
        done: true
      };

    var value = dense[i];

    i++;
    j++;

    if (i === c)
      i = 0;

    return {
      value: value,
      done: false
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  SparseQueueSet.prototype[Symbol.iterator] = SparseQueueSet.prototype.values;

/**
 * Convenience known methods.
 */
SparseQueueSet.prototype.inspect = function() {
  var proxy = [];

  this.forEach(function(member) {
    proxy.push(member);
  });

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: SparseQueueSet,
    enumerable: false
  });

  proxy.capacity = this.capacity;

  return proxy;
};

if (typeof Symbol !== 'undefined')
  SparseQueueSet.prototype[Symbol.for('nodejs.util.inspect.custom')] = SparseQueueSet.prototype.inspect;

/**
 * Exporting.
 */
var sparseQueueSet = SparseQueueSet;

var Iterator$3 = iterator,
    getPointerArray$2 = typedArrays.getPointerArray;

/**
 * SparseMap.
 *
 * @constructor
 */
function SparseMap(Values, length) {
  if (arguments.length < 2) {
    length = Values;
    Values = Array;
  }

  var ByteArray = getPointerArray$2(length);

  // Properties
  this.size = 0;
  this.length = length;
  this.dense = new ByteArray(length);
  this.sparse = new ByteArray(length);
  this.vals = new Values(length);
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
SparseMap.prototype.clear = function() {
  this.size = 0;
};

/**
 * Method used to check the existence of a member in the set.
 *
 * @param  {number} member - Member to test.
 * @return {SparseMap}
 */
SparseMap.prototype.has = function(member) {
  var index = this.sparse[member];

  return (
    index < this.size &&
    this.dense[index] === member
  );
};

/**
 * Method used to get the value associated to a member in the set.
 *
 * @param  {number} member - Member to test.
 * @return {any}
 */
SparseMap.prototype.get = function(member) {
  var index = this.sparse[member];

  if (index < this.size && this.dense[index] === member)
    return this.vals[index];

  return;
};

/**
 * Method used to set a value into the map.
 *
 * @param  {number} member - Member to set.
 * @param  {any}    value  - Associated value.
 * @return {SparseMap}
 */
SparseMap.prototype.set = function(member, value) {
  var index = this.sparse[member];

  if (index < this.size && this.dense[index] === member) {
    this.vals[index] = value;
    return this;
  }

  this.dense[this.size] = member;
  this.sparse[member] = this.size;
  this.vals[this.size] = value;
  this.size++;

  return this;
};

/**
 * Method used to remove a member from the set.
 *
 * @param  {number} member - Member to delete.
 * @return {boolean}
 */
SparseMap.prototype.delete = function(member) {
  var index = this.sparse[member];

  if (index >= this.size || this.dense[index] !== member)
    return false;

  index = this.dense[this.size - 1];
  this.dense[this.sparse[member]] = index;
  this.sparse[index] = this.sparse[member];
  this.size--;

  return true;
};

/**
 * Method used to iterate over the set's values.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
SparseMap.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  for (var i = 0; i < this.size; i++)
    callback.call(scope, this.vals[i], this.dense[i]);
};

/**
 * Method used to create an iterator over a set's members.
 *
 * @return {Iterator}
 */
SparseMap.prototype.keys = function() {
  var size = this.size,
      dense = this.dense,
      i = 0;

  return new Iterator$3(function() {
    if (i < size) {
      var item = dense[i];
      i++;

      return {
        value: item
      };
    }

    return {
      done: true
    };
  });
};

/**
 * Method used to create an iterator over a set's values.
 *
 * @return {Iterator}
 */
SparseMap.prototype.values = function() {
  var size = this.size,
      values = this.vals,
      i = 0;

  return new Iterator$3(function() {
    if (i < size) {
      var item = values[i];
      i++;

      return {
        value: item
      };
    }

    return {
      done: true
    };
  });
};

/**
 * Method used to create an iterator over a set's entries.
 *
 * @return {Iterator}
 */
SparseMap.prototype.entries = function() {
  var size = this.size,
      dense = this.dense,
      values = this.vals,
      i = 0;

  return new Iterator$3(function() {
    if (i < size) {
      var item = [dense[i], values[i]];
      i++;

      return {
        value: item
      };
    }

    return {
      done: true
    };
  });
};

/**
 * Attaching the #.entries method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  SparseMap.prototype[Symbol.iterator] = SparseMap.prototype.entries;

/**
 * Convenience known methods.
 */
SparseMap.prototype.inspect = function() {
  var proxy = new Map();

  for (var i = 0; i < this.size; i++)
    proxy.set(this.dense[i], this.vals[i]);

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: SparseMap,
    enumerable: false
  });

  proxy.length = this.length;

  if (this.vals.constructor !== Array)
    proxy.type = this.vals.constructor.name;

  return proxy;
};

if (typeof Symbol !== 'undefined')
  SparseMap.prototype[Symbol.for('nodejs.util.inspect.custom')] = SparseMap.prototype.inspect;

/**
 * Exporting.
 */
var sparseMap = SparseMap;

var Iterator$2 = iterator,
    getPointerArray$1 = typedArrays.getPointerArray;

/**
 * SparseSet.
 *
 * @constructor
 */
function SparseSet(length) {

  var ByteArray = getPointerArray$1(length);

  // Properties
  this.size = 0;
  this.length = length;
  this.dense = new ByteArray(length);
  this.sparse = new ByteArray(length);
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
SparseSet.prototype.clear = function() {
  this.size = 0;
};

/**
 * Method used to check the existence of a member in the set.
 *
 * @param  {number} member - Member to test.
 * @return {SparseSet}
 */
SparseSet.prototype.has = function(member) {
  var index = this.sparse[member];

  return (
    index < this.size &&
    this.dense[index] === member
  );
};

/**
 * Method used to add a member to the set.
 *
 * @param  {number} member - Member to add.
 * @return {SparseSet}
 */
SparseSet.prototype.add = function(member) {
  var index = this.sparse[member];

  if (index < this.size && this.dense[index] === member)
    return this;

  this.dense[this.size] = member;
  this.sparse[member] = this.size;
  this.size++;

  return this;
};

/**
 * Method used to remove a member from the set.
 *
 * @param  {number} member - Member to delete.
 * @return {boolean}
 */
SparseSet.prototype.delete = function(member) {
  var index = this.sparse[member];

  if (index >= this.size || this.dense[index] !== member)
    return false;

  index = this.dense[this.size - 1];
  this.dense[this.sparse[member]] = index;
  this.sparse[index] = this.sparse[member];
  this.size--;

  return true;
};

/**
 * Method used to iterate over the set's values.
 *
 * @param  {function}  callback - Function to call for each item.
 * @param  {object}    scope    - Optional scope.
 * @return {undefined}
 */
SparseSet.prototype.forEach = function(callback, scope) {
  scope = arguments.length > 1 ? scope : this;

  var item;

  for (var i = 0; i < this.size; i++) {
    item = this.dense[i];

    callback.call(scope, item, item);
  }
};

/**
 * Method used to create an iterator over a set's values.
 *
 * @return {Iterator}
 */
SparseSet.prototype.values = function() {
  var size = this.size,
      dense = this.dense,
      i = 0;

  return new Iterator$2(function() {
    if (i < size) {
      var item = dense[i];
      i++;

      return {
        value: item
      };
    }

    return {
      done: true
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  SparseSet.prototype[Symbol.iterator] = SparseSet.prototype.values;

/**
 * Convenience known methods.
 */
SparseSet.prototype.inspect = function() {
  var proxy = new Set();

  for (var i = 0; i < this.size; i++)
    proxy.add(this.dense[i]);

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: SparseSet,
    enumerable: false
  });

  proxy.length = this.length;

  return proxy;
};

if (typeof Symbol !== 'undefined')
  SparseSet.prototype[Symbol.for('nodejs.util.inspect.custom')] = SparseSet.prototype.inspect;

/**
 * Exporting.
 */
var sparseSet = SparseSet;

/**
 * Mnemonist SymSpell
 * ===================
 *
 * JavaScript implementation of the Symmetric Delete Spelling dictionary to
 * efficiently index & query expression based on edit distance.
 * Note that the current implementation target the v3.0 of the algorithm.
 *
 * [Reference]:
 * http://blog.faroo.com/2012/06/07/improved-edit-distance-based-spelling-correction/
 * https://github.com/wolfgarbe/symspell
 *
 * [Author]:
 * Wolf Garbe
 */
var forEach$3 = foreach;

/**
 * Constants.
 */
var DEFAULT_MAX_DISTANCE = 2,
    DEFAULT_VERBOSITY = 2;

var VERBOSITY = new Set([
  // Returns only the top suggestion
  0,
  // Returns suggestions with the smallest edit distance
  1,
  // Returns every suggestion (no early termination)
  2
]);

var VERBOSITY_EXPLANATIONS = {
  0: 'Returns only the top suggestion',
  1: 'Returns suggestions with the smallest edit distance',
  2: 'Returns every suggestion (no early termination)'
};

/**
 * Functions.
 */

/**
 * Function creating a dictionary item.
 *
 * @param  {number} [value] - An optional suggestion.
 * @return {object}         - The created item.
 */
function createDictionaryItem(value) {
  var suggestions = new Set();

  if (typeof value === 'number')
    suggestions.add(value);

  return {
    suggestions,
    count: 0
  };
}

/**
 * Function creating a suggestion item.
 *
 * @return {object} - The created item.
 */
function createSuggestionItem(term, distance, count) {
  return {
    term: term || '',
    distance: distance || 0,
    count: count || 0
  };
}

/**
 * Simplified edit function.
 *
 * @param {string} word      - Target word.
 * @param {number} distance  - Distance.
 * @param {number} max       - Max distance.
 * @param {Set}    [deletes] - Set mutated to store deletes.
 */
function edits(word, distance, max, deletes) {
  deletes = deletes || new Set();
  distance++;

  var deletedItem,
      l = word.length,
      i;

  if (l > 1) {
    for (i = 0; i < l; i++) {
      deletedItem = word.substring(0, i) + word.substring(i + 1);

      if (!deletes.has(deletedItem)) {
        deletes.add(deletedItem);

        if (distance < max)
          edits(deletedItem, distance, max, deletes);
      }
    }
  }

  return deletes;
}

/**
 * Function used to conditionally add suggestions.
 *
 * @param {array}  words       - Words list.
 * @param {number} verbosity   - Verbosity level.
 * @param {object} item        - The target item.
 * @param {string} suggestion  - The target suggestion.
 * @param {number} int         - Integer key of the word.
 * @param {object} deletedItem - Considered deleted item.
 * @param {SymSpell}
 */
function addLowestDistance(words, verbosity, item, suggestion, int, deletedItem) {
  var first = item.suggestions.values().next().value;

  if (verbosity < 2 &&
      item.suggestions.size > 0 &&
      words[first].length - deletedItem.length > suggestion.length - deletedItem.length) {
    item.suggestions = new Set();
    item.count = 0;
  }

  if (verbosity === 2 ||
      !item.suggestions.size ||
      words[first].length - deletedItem.length >= suggestion.length - deletedItem.length) {
    item.suggestions.add(int);
  }
}

/**
 * Custom Damerau-Levenshtein used by the algorithm.
 *
 * @param  {string} source - First string.
 * @param  {string} target - Second string.
 * @return {number}        - The distance.
 */
function damerauLevenshtein(source, target) {
  var m = source.length,
      n = target.length,
      H = [[]],
      INF = m + n,
      sd = new Map(),
      i,
      l,
      j;

  H[0][0] = INF;

  for (i = 0; i <= m; i++) {
    if (!H[i + 1])
      H[i + 1] = [];
    H[i + 1][1] = i;
    H[i + 1][0] = INF;
  }

  for (j = 0; j <= n; j++) {
    H[1][j + 1] = j;
    H[0][j + 1] = INF;
  }

  var st = source + target,
      letter;

  for (i = 0, l = st.length; i < l; i++) {
    letter = st[i];

    if (!sd.has(letter))
      sd.set(letter, 0);
  }

  // Iterating
  for (i = 1; i <= m; i++) {
    var DB = 0;

    for (j = 1; j <= n; j++) {
      var i1 = sd.get(target[j - 1]),
          j1 = DB;

      if (source[i - 1] === target[j - 1]) {
        H[i + 1][j + 1] = H[i][j];
        DB = j;
      }
      else {
        H[i + 1][j + 1] = Math.min(
          H[i][j],
          H[i + 1][j],
          H[i][j + 1]
        ) + 1;
      }

      H[i + 1][j + 1] = Math.min(
        H[i + 1][j + 1],
        H[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1)
      );
    }

    sd.set(source[i - 1], i);
  }

  return H[m + 1][n + 1];
}

/**
 * Lookup function.
 *
 * @param  {object} dictionary  - A SymSpell dictionary.
 * @param  {array}  words       - Unique words list.
 * @param  {number} verbosity   - Verbosity level.
 * @param  {number} maxDistance - Maximum distance.
 * @param  {number} maxLength   - Maximum word length in the dictionary.
 * @param  {string} input       - Input string.
 * @return {array}              - The list of suggestions.
 */
function lookup(dictionary, words, verbosity, maxDistance, maxLength, input) {
  var length = input.length;

  if (length - maxDistance > maxLength)
    return [];

  var candidates = [input],
      candidateSet = new Set(),
      suggestionSet = new Set();

  var suggestions = [],
      candidate,
      item;

  // Exhausting every candidates
  while (candidates.length > 0) {
    candidate = candidates.shift();

    // Early termination
    if (
      verbosity < 2 &&
      suggestions.length > 0 &&
      length - candidate.length > suggestions[0].distance
    )
      break;

    item = dictionary[candidate];

    if (item !== undefined) {
      if (typeof item === 'number')
        item = createDictionaryItem(item);

      if (item.count > 0 && !suggestionSet.has(candidate)) {
        suggestionSet.add(candidate);

        var suggestItem = createSuggestionItem(
          candidate,
          length - candidate.length,
          item.count
        );

        suggestions.push(suggestItem);

        // Another early termination
        if (verbosity < 2 && length - candidate.length === 0)
          break;
      }

      // Iterating over the item's suggestions
      item.suggestions.forEach(index => {
        var suggestion = words[index];

        // Do we already have this suggestion?
        if (suggestionSet.has(suggestion))
          return;

        suggestionSet.add(suggestion);

        // Computing distance between candidate & suggestion
        var distance = 0;

        if (input !== suggestion) {
          if (suggestion.length === candidate.length) {
            distance = length - candidate.length;
          }
          else if (length === candidate.length) {
            distance = suggestion.length - candidate.length;
          }
          else {
            var ii = 0,
                jj = 0;

            var l = suggestion.length;

            while (
              ii < l &&
              ii < length &&
              suggestion[ii] === input[ii]
            ) {
              ii++;
            }

            while (
              jj < l - ii &&
              jj < length &&
              suggestion[l - jj - 1] === input[length - jj - 1]
            ) {
              jj++;
            }

            if (ii > 0 || jj > 0) {
              distance = damerauLevenshtein(
                suggestion.substr(ii, l - ii - jj),
                input.substr(ii, length - ii - jj)
              );
            }
            else {
              distance = damerauLevenshtein(suggestion, input);
            }
          }
        }

        // Removing suggestions of higher distance
        if (verbosity < 2 &&
            suggestions.length > 0 &&
            suggestions[0].distance > distance) {
          suggestions = [];
        }

        if (verbosity < 2 &&
            suggestions.length > 0 &&
            distance > suggestions[0].distance) {
          return;
        }

        if (distance <= maxDistance) {
          var target = dictionary[suggestion];

          if (target !== undefined) {
            suggestions.push(createSuggestionItem(
              suggestion,
              distance,
              target.count
            ));
          }
        }
      });
    }

    // Adding edits
    if (length - candidate.length < maxDistance) {

      if (verbosity < 2 &&
          suggestions.length > 0 &&
          length - candidate.length >= suggestions[0].distance)
        continue;

      for (var i = 0, l = candidate.length; i < l; i++) {
        var deletedItem = (
          candidate.substring(0, i) +
          candidate.substring(i + 1)
        );

        if (!candidateSet.has(deletedItem)) {
          candidateSet.add(deletedItem);
          candidates.push(deletedItem);
        }
      }
    }
  }

  if (verbosity === 0)
    return suggestions.slice(0, 1);

  return suggestions;
}

/**
 * SymSpell.
 *
 * @constructor
 */
function SymSpell(options) {
  options = options || {};

  this.clear();

  // Properties
  this.maxDistance = typeof options.maxDistance === 'number' ?
    options.maxDistance :
    DEFAULT_MAX_DISTANCE;
  this.verbosity = typeof options.verbosity === 'number' ?
    options.verbosity :
    DEFAULT_VERBOSITY;

  // Sanity checks
  if (typeof this.maxDistance !== 'number' || this.maxDistance <= 0)
    throw Error('mnemonist/SymSpell.constructor: invalid `maxDistance` option. Should be a integer greater than 0.');

  if (!VERBOSITY.has(this.verbosity))
    throw Error('mnemonist/SymSpell.constructor: invalid `verbosity` option. Should be either 0, 1 or 2.');
}

/**
 * Method used to clear the structure.
 *
 * @return {undefined}
 */
SymSpell.prototype.clear = function() {

  // Properties
  this.size = 0;
  this.dictionary = Object.create(null);
  this.maxLength = 0;
  this.words = [];
};

/**
 * Method used to add a word to the index.
 *
 * @param {string} word - Word to add.
 * @param {SymSpell}
 */
SymSpell.prototype.add = function(word) {
  var item = this.dictionary[word];

  if (item !== undefined) {
    if (typeof item === 'number') {
      item = createDictionaryItem(item);
      this.dictionary[word] = item;
    }

    item.count++;
  }

  else {
    item = createDictionaryItem();
    item.count++;

    this.dictionary[word] = item;

    if (word.length > this.maxLength)
      this.maxLength = word.length;
  }

  if (item.count === 1) {
    var number = this.words.length;
    this.words.push(word);

    var deletes = edits(word, 0, this.maxDistance);

    deletes.forEach(deletedItem => {
      var target = this.dictionary[deletedItem];

      if (target !== undefined) {
        if (typeof target === 'number') {
          target = createDictionaryItem(target);

          this.dictionary[deletedItem] = target;
        }

        if (!target.suggestions.has(number)) {
          addLowestDistance(
            this.words,
            this.verbosity,
            target,
            word,
            number,
            deletedItem
          );
        }
      }
      else {
        this.dictionary[deletedItem] = number;
      }
    });
  }

  this.size++;

  return this;
};

/**
 * Method used to search the index.
 *
 * @param  {string} input - Input query.
 * @return {array}        - The found suggestions.
 */
SymSpell.prototype.search = function(input) {
  return lookup(
    this.dictionary,
    this.words,
    this.verbosity,
    this.maxDistance,
    this.maxLength,
    input
  );
};

/**
 * Convenience known methods.
 */
SymSpell.prototype.inspect = function() {
  var array = [];

  array.size = this.size;
  array.maxDistance = this.maxDistance;
  array.verbosity = this.verbosity;
  array.behavior = VERBOSITY_EXPLANATIONS[this.verbosity];

  for (var k in this.dictionary) {
    if (typeof this.dictionary[k] === 'object' && this.dictionary[k].count)
      array.push([k, this.dictionary[k].count]);
  }

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: SymSpell,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  SymSpell.prototype[Symbol.for('nodejs.util.inspect.custom')] = SymSpell.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a structure.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @return {SymSpell}
 */
SymSpell.from = function(iterable, options) {
  var index = new SymSpell(options);

  forEach$3(iterable, function(value) {
    index.add(value);
  });

  return index;
};

/**
 * Exporting.
 */
var symspell = SymSpell;

var forEach$2 = foreach,
    Iterator$1 = iterator;

/**
 * Constants.
 */
var SENTINEL$1 = String.fromCharCode(0);

/**
 * TrieMap.
 *
 * @constructor
 */
function TrieMap$1(Token) {
  this.mode = Token === Array ? 'array' : 'string';
  this.clear();
}

/**
 * Method used to clear the trie.
 *
 * @return {undefined}
 */
TrieMap$1.prototype.clear = function() {

  // Properties
  this.root = {};
  this.size = 0;
};

/**
 * Method used to set the value of the given prefix in the trie.
 *
 * @param  {string|array} prefix - Prefix to follow.
 * @param  {any}          value  - Value for the prefix.
 * @return {TrieMap}
 */
TrieMap$1.prototype.set = function(prefix, value) {
  var node = this.root,
      token;

  for (var i = 0, l = prefix.length; i < l; i++) {
    token = prefix[i];

    node = node[token] || (node[token] = {});
  }

  // Do we need to increase size?
  if (!(SENTINEL$1 in node))
    this.size++;

  node[SENTINEL$1] = value;

  return this;
};

/**
 * Method used to update the value of the given prefix in the trie.
 *
 * @param  {string|array} prefix - Prefix to follow.
 * @param  {(oldValue: any | undefined) => any} updateFunction - Update value visitor callback.
 * @return {TrieMap}
 */
TrieMap$1.prototype.update = function(prefix, updateFunction) {
  var node = this.root,
      token;

  for (var i = 0, l = prefix.length; i < l; i++) {
    token = prefix[i];

    node = node[token] || (node[token] = {});
  }

  // Do we need to increase size?
  if (!(SENTINEL$1 in node))
    this.size++;

  node[SENTINEL$1] = updateFunction(node[SENTINEL$1]);

  return this;
};

/**
 * Method used to return the value sitting at the end of the given prefix or
 * undefined if none exist.
 *
 * @param  {string|array} prefix - Prefix to follow.
 * @return {any|undefined}
 */
TrieMap$1.prototype.get = function(prefix) {
  var node = this.root,
      token,
      i,
      l;

  for (i = 0, l = prefix.length; i < l; i++) {
    token = prefix[i];
    node = node[token];

    // Prefix does not exist
    if (typeof node === 'undefined')
      return;
  }

  if (!(SENTINEL$1 in node))
    return;

  return node[SENTINEL$1];
};

/**
 * Method used to delete a prefix from the trie.
 *
 * @param  {string|array} prefix - Prefix to delete.
 * @return {boolean}
 */
TrieMap$1.prototype.delete = function(prefix) {
  var node = this.root,
      toPrune = null,
      tokenToPrune = null,
      parent,
      token,
      i,
      l;

  for (i = 0, l = prefix.length; i < l; i++) {
    token = prefix[i];
    parent = node;
    node = node[token];

    // Prefix does not exist
    if (typeof node === 'undefined')
      return false;

    // Keeping track of a potential branch to prune
    if (toPrune !== null) {
      if (Object.keys(node).length > 1) {
        toPrune = null;
        tokenToPrune = null;
      }
    }
    else {
      if (Object.keys(node).length < 2) {
        toPrune = parent;
        tokenToPrune = token;
      }
    }
  }

  if (!(SENTINEL$1 in node))
    return false;

  this.size--;

  if (toPrune)
    delete toPrune[tokenToPrune];
  else
    delete node[SENTINEL$1];

  return true;
};

// TODO: add #.prune?

/**
 * Method used to assert whether the given prefix exists in the TrieMap.
 *
 * @param  {string|array} prefix - Prefix to check.
 * @return {boolean}
 */
TrieMap$1.prototype.has = function(prefix) {
  var node = this.root,
      token;

  for (var i = 0, l = prefix.length; i < l; i++) {
    token = prefix[i];
    node = node[token];

    if (typeof node === 'undefined')
      return false;
  }

  return SENTINEL$1 in node;
};

/**
 * Method used to retrieve every item in the trie with the given prefix.
 *
 * @param  {string|array} prefix - Prefix to query.
 * @return {array}
 */
TrieMap$1.prototype.find = function(prefix) {
  var isString = typeof prefix === 'string';

  var node = this.root,
      matches = [],
      token,
      i,
      l;

  for (i = 0, l = prefix.length; i < l; i++) {
    token = prefix[i];
    node = node[token];

    if (typeof node === 'undefined')
      return matches;
  }

  // Performing DFS from prefix
  var nodeStack = [node],
      prefixStack = [prefix],
      k;

  while (nodeStack.length) {
    prefix = prefixStack.pop();
    node = nodeStack.pop();

    for (k in node) {
      if (k === SENTINEL$1) {
        matches.push([prefix, node[SENTINEL$1]]);
        continue;
      }

      nodeStack.push(node[k]);
      prefixStack.push(isString ? prefix + k : prefix.concat(k));
    }
  }

  return matches;
};

/**
 * Method returning an iterator over the trie's values.
 *
 * @param  {string|array} [prefix] - Optional starting prefix.
 * @return {Iterator}
 */
TrieMap$1.prototype.values = function(prefix) {
  var node = this.root,
      nodeStack = [],
      token,
      i,
      l;

  // Resolving initial prefix
  if (prefix) {
    for (i = 0, l = prefix.length; i < l; i++) {
      token = prefix[i];
      node = node[token];

      // If the prefix does not exist, we return an empty iterator
      if (typeof node === 'undefined')
        return Iterator$1.empty();
    }
  }

  nodeStack.push(node);

  return new Iterator$1(function() {
    var currentNode,
        hasValue = false,
        k;

    while (nodeStack.length) {
      currentNode = nodeStack.pop();

      for (k in currentNode) {
        if (k === SENTINEL$1) {
          hasValue = true;
          continue;
        }

        nodeStack.push(currentNode[k]);
      }

      if (hasValue)
        return {done: false, value: currentNode[SENTINEL$1]};
    }

    return {done: true};
  });
};

/**
 * Method returning an iterator over the trie's prefixes.
 *
 * @param  {string|array} [prefix] - Optional starting prefix.
 * @return {Iterator}
 */
TrieMap$1.prototype.prefixes = function(prefix) {
  var node = this.root,
      nodeStack = [],
      prefixStack = [],
      token,
      i,
      l;

  var isString = this.mode === 'string';

  // Resolving initial prefix
  if (prefix) {
    for (i = 0, l = prefix.length; i < l; i++) {
      token = prefix[i];
      node = node[token];

      // If the prefix does not exist, we return an empty iterator
      if (typeof node === 'undefined')
        return Iterator$1.empty();
    }
  }
  else {
    prefix = isString ? '' : [];
  }

  nodeStack.push(node);
  prefixStack.push(prefix);

  return new Iterator$1(function() {
    var currentNode,
        currentPrefix,
        hasValue = false,
        k;

    while (nodeStack.length) {
      currentNode = nodeStack.pop();
      currentPrefix = prefixStack.pop();

      for (k in currentNode) {
        if (k === SENTINEL$1) {
          hasValue = true;
          continue;
        }

        nodeStack.push(currentNode[k]);
        prefixStack.push(isString ? currentPrefix + k : currentPrefix.concat(k));
      }

      if (hasValue)
        return {done: false, value: currentPrefix};
    }

    return {done: true};
  });
};
TrieMap$1.prototype.keys = TrieMap$1.prototype.prefixes;

/**
 * Method returning an iterator over the trie's entries.
 *
 * @param  {string|array} [prefix] - Optional starting prefix.
 * @return {Iterator}
 */
TrieMap$1.prototype.entries = function(prefix) {
  var node = this.root,
      nodeStack = [],
      prefixStack = [],
      token,
      i,
      l;

  var isString = this.mode === 'string';

  // Resolving initial prefix
  if (prefix) {
    for (i = 0, l = prefix.length; i < l; i++) {
      token = prefix[i];
      node = node[token];

      // If the prefix does not exist, we return an empty iterator
      if (typeof node === 'undefined')
        return Iterator$1.empty();
    }
  }
  else {
    prefix = isString ? '' : [];
  }

  nodeStack.push(node);
  prefixStack.push(prefix);

  return new Iterator$1(function() {
    var currentNode,
        currentPrefix,
        hasValue = false,
        k;

    while (nodeStack.length) {
      currentNode = nodeStack.pop();
      currentPrefix = prefixStack.pop();

      for (k in currentNode) {
        if (k === SENTINEL$1) {
          hasValue = true;
          continue;
        }

        nodeStack.push(currentNode[k]);
        prefixStack.push(isString ? currentPrefix + k : currentPrefix.concat(k));
      }

      if (hasValue)
        return {done: false, value: [currentPrefix, currentNode[SENTINEL$1]]};
    }

    return {done: true};
  });
};

/**
 * Attaching the #.entries method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  TrieMap$1.prototype[Symbol.iterator] = TrieMap$1.prototype.entries;

/**
 * Convenience known methods.
 */
TrieMap$1.prototype.inspect = function() {
  var proxy = new Array(this.size);

  var iterator = this.entries(),
      step,
      i = 0;

  while ((step = iterator.next(), !step.done))
    proxy[i++] = step.value;

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: TrieMap$1,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  TrieMap$1.prototype[Symbol.for('nodejs.util.inspect.custom')] = TrieMap$1.prototype.inspect;

TrieMap$1.prototype.toJSON = function() {
  return this.root;
};

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a trie.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @return {TrieMap}
 */
TrieMap$1.from = function(iterable) {
  var trie = new TrieMap$1();

  forEach$2(iterable, function(value, key) {
    trie.set(key, value);
  });

  return trie;
};

/**
 * Exporting.
 */
TrieMap$1.SENTINEL = SENTINEL$1;
var trieMap = TrieMap$1;

var forEach$1 = foreach,
    TrieMap = trieMap;

/**
 * Constants.
 */
var SENTINEL = String.fromCharCode(0);

/**
 * Trie.
 *
 * @constructor
 */
function Trie(Token) {
  this.mode = Token === Array ? 'array' : 'string';
  this.clear();
}

// Re-using TrieMap's prototype
for (var methodName in TrieMap.prototype)
  Trie.prototype[methodName] = TrieMap.prototype[methodName];

// Dropping irrelevant methods
delete Trie.prototype.set;
delete Trie.prototype.get;
delete Trie.prototype.values;
delete Trie.prototype.entries;

/**
 * Method used to add the given prefix to the trie.
 *
 * @param  {string|array} prefix - Prefix to follow.
 * @return {TrieMap}
 */
Trie.prototype.add = function(prefix) {
  var node = this.root,
      token;

  for (var i = 0, l = prefix.length; i < l; i++) {
    token = prefix[i];

    node = node[token] || (node[token] = {});
  }

  // Do we need to increase size?
  if (!(SENTINEL in node))
    this.size++;

  node[SENTINEL] = true;

  return this;
};

/**
 * Method used to retrieve every item in the trie with the given prefix.
 *
 * @param  {string|array} prefix - Prefix to query.
 * @return {array}
 */
Trie.prototype.find = function(prefix) {
  var isString = typeof prefix === 'string';

  var node = this.root,
      matches = [],
      token,
      i,
      l;

  for (i = 0, l = prefix.length; i < l; i++) {
    token = prefix[i];
    node = node[token];

    if (typeof node === 'undefined')
      return matches;
  }

  // Performing DFS from prefix
  var nodeStack = [node],
      prefixStack = [prefix],
      k;

  while (nodeStack.length) {
    prefix = prefixStack.pop();
    node = nodeStack.pop();

    for (k in node) {
      if (k === SENTINEL) {
        matches.push(prefix);
        continue;
      }

      nodeStack.push(node[k]);
      prefixStack.push(isString ? prefix + k : prefix.concat(k));
    }
  }

  return matches;
};

/**
 * Attaching the #.keys method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  Trie.prototype[Symbol.iterator] = Trie.prototype.keys;

/**
 * Convenience known methods.
 */
Trie.prototype.inspect = function() {
  var proxy = new Set();

  var iterator = this.keys(),
      step;

  while ((step = iterator.next(), !step.done))
    proxy.add(step.value);

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: Trie,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  Trie.prototype[Symbol.for('nodejs.util.inspect.custom')] = Trie.prototype.inspect;

Trie.prototype.toJSON = function() {
  return this.root;
};

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a trie.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @return {Trie}
 */
Trie.from = function(iterable) {
  var trie = new Trie();

  forEach$1(iterable, function(value) {
    trie.add(value);
  });

  return trie;
};

/**
 * Exporting.
 */
Trie.SENTINEL = SENTINEL;
var trie = Trie;

var Iterator = iterator,
    forEach = foreach,
    iterables$1 = iterables$c,
    typed$1 = typedArrays;

/**
 * Defaults.
 */
var DEFAULT_GROWING_POLICY = function(currentCapacity) {
  return Math.max(1, Math.ceil(currentCapacity * 1.5));
};

var pointerArrayFactory = function(capacity) {
  var PointerArray = typed$1.getPointerArray(capacity);

  return new PointerArray(capacity);
};

/**
 * Vector.
 *
 * @constructor
 * @param {function}      ArrayClass             - An array constructor.
 * @param {number|object} initialCapacityOrOptions - Self-explanatory:
 * @param {number}        initialCapacity          - Initial capacity.
 * @param {number}        initialLength            - Initial length.
 * @param {function}      policy                   - Allocation policy.
 */
function Vector(ArrayClass, initialCapacityOrOptions) {
  if (arguments.length < 1)
    throw new Error('mnemonist/vector: expecting at least a byte array constructor.');

  var initialCapacity = initialCapacityOrOptions || 0,
      policy = DEFAULT_GROWING_POLICY,
      initialLength = 0,
      factory = false;

  if (typeof initialCapacityOrOptions === 'object') {
    initialCapacity = initialCapacityOrOptions.initialCapacity || 0;
    initialLength = initialCapacityOrOptions.initialLength || 0;
    policy = initialCapacityOrOptions.policy || policy;
    factory = initialCapacityOrOptions.factory === true;
  }

  this.factory = factory ? ArrayClass : null;
  this.ArrayClass = ArrayClass;
  this.length = initialLength;
  this.capacity = Math.max(initialLength, initialCapacity);
  this.policy = policy;
  this.array = new ArrayClass(this.capacity);
}

/**
 * Method used to set a value.
 *
 * @param  {number} index - Index to edit.
 * @param  {any}    value - Value.
 * @return {Vector}
 */
Vector.prototype.set = function(index, value) {

  // Out of bounds?
  if (this.length < index)
    throw new Error('Vector(' + this.ArrayClass.name + ').set: index out of bounds.');

  // Updating value
  this.array[index] = value;

  return this;
};

/**
 * Method used to get a value.
 *
 * @param  {number} index - Index to retrieve.
 * @return {any}
 */
Vector.prototype.get = function(index) {
  if (this.length < index)
    return undefined;

  return this.array[index];
};

/**
 * Method used to apply the growing policy.
 *
 * @param  {number} [override] - Override capacity.
 * @return {number}
 */
Vector.prototype.applyPolicy = function(override) {
  var newCapacity = this.policy(override || this.capacity);

  if (typeof newCapacity !== 'number' || newCapacity < 0)
    throw new Error('mnemonist/vector.applyPolicy: policy returned an invalid value (expecting a positive integer).');

  if (newCapacity <= this.capacity)
    throw new Error('mnemonist/vector.applyPolicy: policy returned a less or equal capacity to allocate.');

  // TODO: we should probably check that the returned number is an integer
  return newCapacity;
};

/**
 * Method used to reallocate the underlying array.
 *
 * @param  {number}       capacity - Target capacity.
 * @return {Vector}
 */
Vector.prototype.reallocate = function(capacity) {
  if (capacity === this.capacity)
    return this;

  var oldArray = this.array;

  if (capacity < this.length)
    this.length = capacity;

  if (capacity > this.capacity) {
    if (this.factory === null)
      this.array = new this.ArrayClass(capacity);
    else
      this.array = this.factory(capacity);

    if (typed$1.isTypedArray(this.array)) {
      this.array.set(oldArray, 0);
    }
    else {
      for (var i = 0, l = this.length; i < l; i++)
        this.array[i] = oldArray[i];
    }
  }
  else {
    this.array = oldArray.slice(0, capacity);
  }

  this.capacity = capacity;

  return this;
};

/**
 * Method used to grow the array.
 *
 * @param  {number}       [capacity] - Optional capacity to match.
 * @return {Vector}
 */
Vector.prototype.grow = function(capacity) {
  var newCapacity;

  if (typeof capacity === 'number') {

    if (this.capacity >= capacity)
      return this;

    // We need to match the given capacity
    newCapacity = this.capacity;

    while (newCapacity < capacity)
      newCapacity = this.applyPolicy(newCapacity);

    this.reallocate(newCapacity);

    return this;
  }

  // We need to run the policy once
  newCapacity = this.applyPolicy();
  this.reallocate(newCapacity);

  return this;
};

/**
 * Method used to resize the array. Won't deallocate.
 *
 * @param  {number}       length - Target length.
 * @return {Vector}
 */
Vector.prototype.resize = function(length) {
  if (length === this.length)
    return this;

  if (length < this.length) {
    this.length = length;
    return this;
  }

  this.length = length;
  this.reallocate(length);

  return this;
};

/**
 * Method used to push a value into the array.
 *
 * @param  {any}    value - Value to push.
 * @return {number}       - Length of the array.
 */
Vector.prototype.push = function(value) {
  if (this.capacity === this.length)
    this.grow();

  this.array[this.length++] = value;

  return this.length;
};

/**
 * Method used to pop the last value of the array.
 *
 * @return {number} - The popped value.
 */
Vector.prototype.pop = function() {
  if (this.length === 0)
    return;

  return this.array[--this.length];
};

/**
 * Method used to create an iterator over a vector's values.
 *
 * @return {Iterator}
 */
Vector.prototype.values = function() {
  var items = this.array,
      l = this.length,
      i = 0;

  return new Iterator(function() {
    if (i >= l)
      return {
        done: true
      };

    var value = items[i];
    i++;

    return {
      value: value,
      done: false
    };
  });
};

/**
 * Method used to create an iterator over a vector's entries.
 *
 * @return {Iterator}
 */
Vector.prototype.entries = function() {
  var items = this.array,
      l = this.length,
      i = 0;

  return new Iterator(function() {
    if (i >= l)
      return {
        done: true
      };

    var value = items[i];

    return {
      value: [i++, value],
      done: false
    };
  });
};

/**
 * Attaching the #.values method to Symbol.iterator if possible.
 */
if (typeof Symbol !== 'undefined')
  Vector.prototype[Symbol.iterator] = Vector.prototype.values;

/**
 * Convenience known methods.
 */
Vector.prototype.inspect = function() {
  var proxy = this.array.slice(0, this.length);

  proxy.type = this.array.constructor.name;
  proxy.items = this.length;
  proxy.capacity = this.capacity;

  // Trick so that node displays the name of the constructor
  Object.defineProperty(proxy, 'constructor', {
    value: Vector,
    enumerable: false
  });

  return proxy;
};

if (typeof Symbol !== 'undefined')
  Vector.prototype[Symbol.for('nodejs.util.inspect.custom')] = Vector.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a vector.
 *
 * @param  {Iterable} iterable   - Target iterable.
 * @param  {function} ArrayClass - Byte array class.
 * @param  {number}   capacity   - Desired capacity.
 * @return {Vector}
 */
Vector.from = function(iterable, ArrayClass, capacity) {

  if (arguments.length < 3) {

    // Attempting to guess the needed capacity
    capacity = iterables$1.guessLength(iterable);

    if (typeof capacity !== 'number')
      throw new Error('mnemonist/vector.from: could not guess iterable length. Please provide desired capacity as last argument.');
  }

  var vector = new Vector(ArrayClass, capacity);

  forEach(iterable, function(value) {
    vector.push(value);
  });

  return vector;
};

/**
 * Exporting.
 */
function subClass(ArrayClass) {
  var SubClass = function(initialCapacityOrOptions) {
    Vector.call(this, ArrayClass, initialCapacityOrOptions);
  };

  for (var k in Vector.prototype) {
    if (Vector.prototype.hasOwnProperty(k))
      SubClass.prototype[k] = Vector.prototype[k];
  }

  SubClass.from = function(iterable, capacity) {
    return Vector.from(iterable, ArrayClass, capacity);
  };

  if (typeof Symbol !== 'undefined')
    SubClass.prototype[Symbol.iterator] = SubClass.prototype.values;

  return SubClass;
}

Vector.Int8Vector = subClass(Int8Array);
Vector.Uint8Vector = subClass(Uint8Array);
Vector.Uint8ClampedVector = subClass(Uint8ClampedArray);
Vector.Int16Vector = subClass(Int16Array);
Vector.Uint16Vector = subClass(Uint16Array);
Vector.Int32Vector = subClass(Int32Array);
Vector.Uint32Vector = subClass(Uint32Array);
Vector.Float32Vector = subClass(Float32Array);
Vector.Float64Vector = subClass(Float64Array);
Vector.PointerVector = subClass(pointerArrayFactory);

var vector = Vector;

var iterables = iterables$c,
    typed = typedArrays,
    inplaceQuickSortIndices = quick.inplaceQuickSortIndices,
    lowerBoundIndices = binarySearch.lowerBoundIndices,
    Heap$1 = heap;

var getPointerArray = typed.getPointerArray;

// TODO: implement vantage point selection techniques (by swapping with last)
// TODO: is this required to implement early termination for k <= size?

/**
 * Heap comparator used by the #.nearestNeighbors method.
 */
function comparator(a, b) {
  if (a.distance < b.distance)
    return 1;

  if (a.distance > b.distance)
    return -1;

  return 0;
}

/**
 * Function used to create the binary tree.
 *
 * @param  {function}     distance - Distance function to use.
 * @param  {array}        items    - Items to index (will be mutated).
 * @param  {array}        indices  - Indexes of the items.
 * @return {Float64Array}          - The flat binary tree.
 */
function createBinaryTree(distance, items, indices) {
  var N = indices.length;

  var PointerArray = getPointerArray(N);

  var C = 0,
      nodes = new PointerArray(N),
      lefts = new PointerArray(N),
      rights = new PointerArray(N),
      mus = new Float64Array(N),
      stack = [0, 0, N],
      distances = new Float64Array(N),
      nodeIndex,
      vantagePoint,
      medianIndex,
      lo,
      hi,
      mid,
      mu,
      i,
      l;

  while (stack.length) {
    hi = stack.pop();
    lo = stack.pop();
    nodeIndex = stack.pop();

    // Getting our vantage point
    vantagePoint = indices[hi - 1];
    hi--;

    l = hi - lo;

    // Storing vantage point
    nodes[nodeIndex] = vantagePoint;

    // We are in a leaf
    if (l === 0)
      continue;

    // We only have two elements, the second one has to go right
    if (l === 1) {

      // We put remaining item to the right
      mu = distance(items[vantagePoint], items[indices[lo]]);

      mus[nodeIndex] = mu;

      // Right
      C++;
      rights[nodeIndex] = C;
      nodes[C] = indices[lo];

      continue;
    }

    // Computing distance from vantage point to other points
    for (i = lo; i < hi; i++)
      distances[indices[i]] = distance(items[vantagePoint], items[indices[i]]);

    inplaceQuickSortIndices(distances, indices, lo, hi);

    // Finding median of distances
    medianIndex = lo + (l / 2) - 1;

    // Need to interpolate?
    if (medianIndex === (medianIndex | 0)) {
      mu = (
        distances[indices[medianIndex]] +
        distances[indices[medianIndex + 1]]
      ) / 2;
    }
    else {
      mu = distances[indices[Math.ceil(medianIndex)]];
    }

    // Storing mu
    mus[nodeIndex] = mu;

    mid = lowerBoundIndices(distances, indices, mu, lo, hi);

    // console.log('Vantage point', items[vantagePoint], vantagePoint);
    // console.log('mu =', mu);
    // console.log('lo =', lo);
    // console.log('hi =', hi);
    // console.log('mid =', mid);

    // console.log('need to split', Array.from(indices).slice(lo, hi).map(i => {
    //   return [distances[i], distance(items[vantagePoint], items[i]), items[i]];
    // }));

    // Right
    if (hi - mid > 0) {
      C++;
      rights[nodeIndex] = C;
      stack.push(C, mid, hi);
      // console.log('Went right with ', Array.from(indices).slice(mid, hi).map(i => {
      //   return [distances[i], distance(items[vantagePoint], items[i]), items[i]];
      // }));
    }

    // Left
    if (mid - lo > 0) {
      C++;
      lefts[nodeIndex] = C;
      stack.push(C, lo, mid);
      // console.log('Went left with', Array.from(indices).slice(lo, mid).map(i => {
      //   return [distances[i], distance(items[vantagePoint], items[i]), items[i]];
      // }));
    }

    // console.log();
  }

  return {
    nodes: nodes,
    lefts: lefts,
    rights: rights,
    mus: mus
  };
}

/**
 * VPTree.
 *
 * @constructor
 * @param {function} distance - Distance function to use.
 * @param {Iterable} items    - Items to store.
 */
function VPTree(distance, items) {
  if (typeof distance !== 'function')
    throw new Error('mnemonist/VPTree.constructor: given `distance` must be a function.');

  if (!items)
    throw new Error('mnemonist/VPTree.constructor: you must provide items to the tree. A VPTree cannot be updated after its creation.');

  // Properties
  this.distance = distance;
  this.heap = new Heap$1(comparator);
  this.D = 0;

  var arrays = iterables.toArrayWithIndices(items);
  this.items = arrays[0];
  var indices = arrays[1];

  // Creating the binary tree
  this.size = indices.length;

  var result = createBinaryTree(distance, this.items, indices);

  this.nodes = result.nodes;
  this.lefts = result.lefts;
  this.rights = result.rights;
  this.mus = result.mus;
}

/**
 * Function used to retrieve the k nearest neighbors of the query.
 *
 * @param  {number} k     - Number of neighbors to retrieve.
 * @param  {any}    query - The query.
 * @return {array}
 */
VPTree.prototype.nearestNeighbors = function(k, query) {
  var neighbors = this.heap,
      stack = [0],
      tau = Infinity,
      nodeIndex,
      itemIndex,
      vantagePoint,
      leftIndex,
      rightIndex,
      mu,
      d;

  this.D = 0;

  while (stack.length) {
    nodeIndex = stack.pop();
    itemIndex = this.nodes[nodeIndex];
    vantagePoint = this.items[itemIndex];

    // Distance between query & the current vantage point
    d = this.distance(vantagePoint, query);
    this.D++;

    if (d < tau) {
      neighbors.push({distance: d, item: vantagePoint});

      // Trimming
      if (neighbors.size > k)
        neighbors.pop();

      // Adjusting tau (only if we already have k items, else it stays Infinity)
      if (neighbors.size >= k)
       tau = neighbors.peek().distance;
    }

    leftIndex = this.lefts[nodeIndex];
    rightIndex = this.rights[nodeIndex];

    // We are a leaf
    if (!leftIndex && !rightIndex)
      continue;

    mu = this.mus[nodeIndex];

    if (d < mu) {
      if (leftIndex && d < mu + tau)
        stack.push(leftIndex);
      if (rightIndex && d >= mu - tau) // Might not be necessary to test d
        stack.push(rightIndex);
    }
    else {
      if (rightIndex && d >= mu - tau)
        stack.push(rightIndex);
      if (leftIndex && d < mu + tau) // Might not be necessary to test d
        stack.push(leftIndex);
    }
  }

  var array = new Array(neighbors.size);

  for (var i = neighbors.size - 1; i >= 0; i--)
    array[i] = neighbors.pop();

  return array;
};

/**
 * Function used to retrieve every neighbors of query in the given radius.
 *
 * @param  {number} radius - Radius.
 * @param  {any}    query  - The query.
 * @return {array}
 */
VPTree.prototype.neighbors = function(radius, query) {
  var neighbors = [],
      stack = [0],
      nodeIndex,
      itemIndex,
      vantagePoint,
      leftIndex,
      rightIndex,
      mu,
      d;

  this.D = 0;

  while (stack.length) {
    nodeIndex = stack.pop();
    itemIndex = this.nodes[nodeIndex];
    vantagePoint = this.items[itemIndex];

    // Distance between query & the current vantage point
    d = this.distance(vantagePoint, query);
    this.D++;

    if (d <= radius)
      neighbors.push({distance: d, item: vantagePoint});

    leftIndex = this.lefts[nodeIndex];
    rightIndex = this.rights[nodeIndex];

    // We are a leaf
    if (!leftIndex && !rightIndex)
      continue;

    mu = this.mus[nodeIndex];

    if (d < mu) {
      if (leftIndex && d < mu + radius)
        stack.push(leftIndex);
      if (rightIndex && d >= mu - radius) // Might not be necessary to test d
        stack.push(rightIndex);
    }
    else {
      if (rightIndex && d >= mu - radius)
        stack.push(rightIndex);
      if (leftIndex && d < mu + radius) // Might not be necessary to test d
        stack.push(leftIndex);
    }
  }

  return neighbors;
};

/**
 * Convenience known methods.
 */
VPTree.prototype.inspect = function() {
  var array = this.items.slice();

  // Trick so that node displays the name of the constructor
  Object.defineProperty(array, 'constructor', {
    value: VPTree,
    enumerable: false
  });

  return array;
};

if (typeof Symbol !== 'undefined')
  VPTree.prototype[Symbol.for('nodejs.util.inspect.custom')] = VPTree.prototype.inspect;

/**
 * Static @.from function taking an arbitrary iterable & converting it into
 * a tree.
 *
 * @param  {Iterable} iterable - Target iterable.
 * @param  {function} distance - Distance function to use.
 * @return {VPTree}
 */
VPTree.from = function(iterable, distance) {
  return new VPTree(distance, iterable);
};

/**
 * Exporting.
 */
var vpTree = VPTree;

var Heap = heap,
    FibonacciHeap = fibonacciHeap,
    SuffixArray = suffixArray;

var mnemonist = {
  BiMap: biMap,
  BitSet: bitSet,
  BitVector: bitVector,
  BloomFilter: bloomFilter,
  BKTree: bkTree,
  CircularBuffer: circularBuffer,
  DefaultMap: defaultMap,
  DefaultWeakMap: defaultWeakMap,
  FixedDeque: fixedDeque,
  StaticDisjointSet: staticDisjointSet,
  FibonacciHeap: FibonacciHeap,
  MinFibonacciHeap: FibonacciHeap.MinFibonacciHeap,
  MaxFibonacciHeap: FibonacciHeap.MaxFibonacciHeap,
  FixedReverseHeap: fixedReverseHeap,
  FuzzyMap: fuzzyMap,
  FuzzyMultiMap: fuzzyMultiMap,
  HashedArrayTree: hashedArrayTree,
  Heap: Heap,
  MinHeap: Heap.MinHeap,
  MaxHeap: Heap.MaxHeap,
  StaticIntervalTree: staticIntervalTree,
  InvertedIndex: invertedIndex,
  KDTree: kdTree,
  LinkedList: linkedList,
  LRUCache: lruCache,
  LRUCacheWithDelete: lruCacheWithDelete,
  LRUMap: lruMap,
  LRUMapWithDelete: lruMapWithDelete,
  MultiMap: multiMap,
  MultiSet: multiSet,
  PassjoinIndex: passjoinIndex,
  Queue: queue,
  FixedStack: fixedStack,
  Stack: stack,
  SuffixArray: SuffixArray,
  GeneralizedSuffixArray: SuffixArray.GeneralizedSuffixArray,
  Set: set,
  SparseQueueSet: sparseQueueSet,
  SparseMap: sparseMap,
  SparseSet: sparseSet,
  SymSpell: symspell,
  Trie: trie,
  TrieMap: trieMap,
  Vector: vector,
  VPTree: vpTree
};

const LRUCache = mnemonist.LRUCache;

/**
 * Field Value Components
 * Most HTTP header field values are defined using common syntax
 * components (token, quoted-string, and comment) separated by
 * whitespace or specific delimiting characters.  Delimiters are chosen
 * from the set of US-ASCII visual characters not allowed in a token
 * (DQUOTE and "(),/:;<=>?@[\]{}").
 *
 * field-name    = token
 * token         = 1*tchar
 * tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
 *               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
 *               / DIGIT / ALPHA
 *               ; any VCHAR, except delimiters
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7230#section-3.2.6
 */

const validFieldnameRE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function validateFieldname (fieldname) {
  if (validFieldnameRE.test(fieldname) === false) {
    throw new TypeError('Fieldname contains invalid characters.')
  }
}

function parse (header) {
  header = header.trim().toLowerCase();
  const result = [];

  if (header.length === 0) ; else if (header.indexOf(',') === -1) {
    result.push(header);
  } else {
    const il = header.length;
    let i = 0;
    let pos = 0;
    let char;

    // tokenize the header
    for (i = 0; i < il; ++i) {
      char = header[i];
      // when we have whitespace set the pos to the next position
      if (char === ' ') {
        pos = i + 1;
      // `,` is the separator of vary-values
      } else if (char === ',') {
        // if pos and current position are not the same we have a valid token
        if (pos !== i) {
          result.push(header.slice(pos, i));
        }
        // reset the positions
        pos = i + 1;
      }
    }

    if (pos !== i) {
      result.push(header.slice(pos, i));
    }
  }

  return result
}

function createAddFieldnameToVary (fieldname) {
  const headerCache = new LRUCache(1000);

  validateFieldname(fieldname);

  return function (reply) {
    let header = reply.getHeader('Vary');

    if (!header) {
      reply.header('Vary', fieldname);
      return
    }

    if (header === '*') {
      return
    }

    if (fieldname === '*') {
      reply.header('Vary', '*');
      return
    }

    if (Array.isArray(header)) {
      header = header.join(', ');
    }

    if (!headerCache.has(header)) {
      const vals = parse(header);

      if (vals.indexOf('*') !== -1) {
        headerCache.set(header, '*');
      } else if (vals.indexOf(fieldname.toLowerCase()) === -1) {
        headerCache.set(header, header + ', ' + fieldname);
      } else {
        headerCache.set(header, null);
      }
    }
    const cached = headerCache.get(header);
    if (cached !== null) {
      reply.header('Vary', cached);
    }
  }
}

vary.createAddFieldnameToVary = createAddFieldnameToVary;
vary.addOriginToVaryHeader = createAddFieldnameToVary('Origin');
vary.addAccessControlRequestHeadersToVaryHeader = createAddFieldnameToVary('Access-Control-Request-Headers');
vary.parse = parse;

const fp = FastifyPlugin__default["default"];
const {
  addAccessControlRequestHeadersToVaryHeader,
  addOriginToVaryHeader
} = vary;

const defaultOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: false,
  exposedHeaders: null,
  allowedHeaders: null,
  maxAge: null,
  preflight: true,
  strictPreflight: true
};

function fastifyCors (fastify, opts, next) {
  fastify.decorateRequest('corsPreflightEnabled', false);

  let hideOptionsRoute = true;
  if (typeof opts === 'function') {
    handleCorsOptionsDelegator(opts, fastify);
  } else {
    if (opts.hideOptionsRoute !== undefined) hideOptionsRoute = opts.hideOptionsRoute;
    const corsOptions = Object.assign({}, defaultOptions, opts);
    fastify.addHook('onRequest', function onRequestCors (req, reply, next) {
      onRequest(fastify, corsOptions, req, reply, next);
    });
  }

  // The preflight reply must occur in the hook. This allows fastify-cors to reply to
  // preflight requests BEFORE possible authentication plugins. If the preflight reply
  // occurred in this handler, other plugins may deny the request since the browser will
  // remove most headers (such as the Authentication header).
  //
  // This route simply enables fastify to accept preflight requests.
  fastify.options('*', { schema: { hide: hideOptionsRoute } }, (req, reply) => {
    if (!req.corsPreflightEnabled) {
      // Do not handle preflight requests if the origin option disabled CORS
      reply.callNotFound();
      return
    }

    reply.send();
  });

  next();
}

function handleCorsOptionsDelegator (optionsResolver, fastify) {
  fastify.addHook('onRequest', function onRequestCors (req, reply, next) {
    if (optionsResolver.length === 2) {
      handleCorsOptionsCallbackDelegator(optionsResolver, fastify, req, reply, next);
      return
    } else {
      // handle delegator based on Promise
      const ret = optionsResolver(req);
      if (ret && typeof ret.then === 'function') {
        ret.then(options => Object.assign({}, defaultOptions, options))
          .then(corsOptions => onRequest(fastify, corsOptions, req, reply, next)).catch(next);
        return
      }
    }
    next(new Error('Invalid CORS origin option'));
  });
}

function handleCorsOptionsCallbackDelegator (optionsResolver, fastify, req, reply, next) {
  optionsResolver(req, (err, options) => {
    if (err) {
      next(err);
    } else {
      const corsOptions = Object.assign({}, defaultOptions, options);
      onRequest(fastify, corsOptions, req, reply, next);
    }
  });
}

function onRequest (fastify, options, req, reply, next) {
  // Always set Vary header
  // https://github.com/rs/cors/issues/10
  addOriginToVaryHeader(reply);
  const resolveOriginOption = typeof options.origin === 'function' ? resolveOriginWrapper(fastify, options.origin) : (_, cb) => cb(null, options.origin);

  resolveOriginOption(req, (error, resolvedOriginOption) => {
    if (error !== null) {
      return next(error)
    }

    // Disable CORS and preflight if false
    if (resolvedOriginOption === false) {
      return next()
    }

    // Falsy values are invalid
    if (!resolvedOriginOption) {
      return next(new Error('Invalid CORS origin option'))
    }

    addCorsHeaders(req, reply, resolvedOriginOption, options);

    if (req.raw.method === 'OPTIONS' && options.preflight === true) {
      // Strict mode enforces the required headers for preflight
      if (options.strictPreflight === true && (!req.headers.origin || !req.headers['access-control-request-method'])) {
        reply.status(400).type('text/plain').send('Invalid Preflight Request');
        return
      }

      req.corsPreflightEnabled = true;

      addPreflightHeaders(req, reply, options);

      if (!options.preflightContinue) {
        // Do not call the hook callback and terminate the request
        // Safari (and potentially other browsers) need content-length 0,
        // for 204 or they just hang waiting for a body
        reply
          .code(options.optionsSuccessStatus)
          .header('Content-Length', '0')
          .send();
        return
      }
    }

    return next()
  });
}

function addCorsHeaders (req, reply, originOption, corsOptions) {
  const origin = getAccessControlAllowOriginHeader(req.headers.origin, originOption);
  // In the case of origin not allowed the header is not
  // written in the response.
  // https://github.com/fastify/fastify-cors/issues/127
  if (origin) {
    reply.header('Access-Control-Allow-Origin', origin);
  }

  if (corsOptions.credentials) {
    reply.header('Access-Control-Allow-Credentials', 'true');
  }

  if (corsOptions.exposedHeaders !== null) {
    reply.header(
      'Access-Control-Expose-Headers',
      Array.isArray(corsOptions.exposedHeaders) ? corsOptions.exposedHeaders.join(', ') : corsOptions.exposedHeaders
    );
  }
}

function addPreflightHeaders (req, reply, corsOptions) {
  reply.header(
    'Access-Control-Allow-Methods',
    Array.isArray(corsOptions.methods) ? corsOptions.methods.join(', ') : corsOptions.methods
  );

  if (corsOptions.allowedHeaders === null) {
    addAccessControlRequestHeadersToVaryHeader(reply);
    const reqAllowedHeaders = req.headers['access-control-request-headers'];
    if (reqAllowedHeaders !== undefined) {
      reply.header('Access-Control-Allow-Headers', reqAllowedHeaders);
    }
  } else {
    reply.header(
      'Access-Control-Allow-Headers',
      Array.isArray(corsOptions.allowedHeaders) ? corsOptions.allowedHeaders.join(', ') : corsOptions.allowedHeaders
    );
  }

  if (corsOptions.maxAge !== null) {
    reply.header('Access-Control-Max-Age', String(corsOptions.maxAge));
  }
}

function resolveOriginWrapper (fastify, origin) {
  return function (req, cb) {
    const result = origin.call(fastify, req.headers.origin, cb);

    // Allow for promises
    if (result && typeof result.then === 'function') {
      result.then(res => cb(null, res), cb);
    }
  }
}

function getAccessControlAllowOriginHeader (reqOrigin, originOption) {
  if (originOption === '*') {
    // allow any origin
    return '*'
  }

  if (typeof originOption === 'string') {
    // fixed origin
    return originOption
  }

  // reflect origin
  return isRequestOriginAllowed(reqOrigin, originOption) ? reqOrigin : false
}

function isRequestOriginAllowed (reqOrigin, allowedOrigin) {
  if (Array.isArray(allowedOrigin)) {
    for (let i = 0; i < allowedOrigin.length; ++i) {
      if (isRequestOriginAllowed(reqOrigin, allowedOrigin[i])) {
        return true
      }
    }
    return false
  } else if (typeof allowedOrigin === 'string') {
    return reqOrigin === allowedOrigin
  } else if (allowedOrigin instanceof RegExp) {
    allowedOrigin.lastIndex = 0;
    return allowedOrigin.test(reqOrigin)
  } else {
    return !!allowedOrigin
  }
}

var cors$1 = fp(fastifyCors, {
  fastify: '4.x',
  name: '@fastify/cors'
});

var cors = FastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(cors$1, {});
}, {
  name: "cors",
});

var swagger = FastifyPlugin__default["default"](async (fastify) => {
  fastify.register(fastifySwagger__default["default"], {});
}, {
  name: "swagger",
});

var websocket = FastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(fastifyWebsocket__default["default"], {});
}, {
  name: "websocket",
});

var plugins = FastifyPlugin__default["default"](async (instance) => {
  await instance.register(cors);
  await instance.register(websocket);

  await instance.register(swagger);
}, {
  name: "plugins",
});

var auth = FastifyPlugin__default["default"](async (fastify) => {
  fastify.route({
    url: "/sign",
    method: "GET",
    async handler() {
    },
  });
}, {name: "auth-route"});

var bitmap = FastifyPlugin__default["default"](async (fastify, opts) => {
  const emptyBitmap = Buffer.from(Uint8ClampedArray.from(
    new Array(480 * 270),
    (_, i) => i % 2 ? 255 : 0,
  ));
  const paramsSchema = typebox.Type.Object({
    x: typebox.Type.Any(),
    y: typebox.Type.Integer(),
  });
  fastify.route

({
    url: `${opts.prefix}/bitmap/:x-:y`,
    method: "GET",
    schema: {
      params: paramsSchema,
    },
    async handler(req, reply) {
      // 480*270
      const {redis} = fastify;
      const {x, y} = req.params;

      let bitmap = await redis.get(
        client.commandOptions({returnBuffers: true}),
        `place_bitmap_${x}:${y}`,
      );
      if (bitmap == null) {
        bitmap = emptyBitmap;
        await redis.set(`place_bitmap_${x}:${y}`, emptyBitmap);
      }
      reply.type("application/octet-stream");
      reply.send(bitmap.subarray(0, 480 * 270));
    },
  });
});

var draw = FastifyPlugin__default["default"](async (fastify, opts) => {
  fastify.route({
    url: `${opts.prefix}/draw`,
    method: "GET",
    async handler() {
    },
  });
});

var pixel = FastifyPlugin__default["default"](async (fastify, opts) => {
  fastify.route({
    url: `${opts.prefix}/pixel/:id`,
    method: "GET",
    async handler(req, reply) {
      reply.send({hello: "world"});
    },
  });
});

var ws = FastifyPlugin__default["default"](async (fastify, opts) => {
  fastify.get(`${opts.prefix}/`, {websocket: true}, async (connect) => {
    connect.socket.on("message", (message) => {
      console.log(message);
    });
  });
});

var board = FastifyPlugin__default["default"](async (fastify, opts) => {
  await fastify.register(bitmap, opts);
  await fastify.register(pixel, opts);
  await fastify.register(draw, opts);
  await fastify.register(ws, opts);
}, {name: "board-route"});

var routes = FastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(auth, {prefix: "/auth"});
  await fastify.register(board, {prefix: "/board"});
}, {name: "routes"});

var redis = FastifyPlugin__default["default"](async (fastify, opts) => {
  const {namespace, ...redisOptions} = opts;
  const client$1 = client.createClient(redisOptions);
  if (namespace) {
    if (!fastify.redis) {
      fastify.decorate("redis", {});
    }
    if (fastify.redis[namespace]) {
      throw new Error(`Redis '${namespace}' instance namespace has already been registered`);
    }
    fastify.redis[namespace] = client$1;
    fastify.addHook("onClose", () => {
      fastify.redis[namespace].quit();
    });
  } else {
    if (fastify.redis) {
      throw new Error("redis has already been registered");
    }
    fastify.decorate("redis", client$1);
    fastify.addHook("onClose", () => {
      fastify.redis.quit();
    });
  }
  try {
    await client$1.connect();
    await client$1.ping();
  } catch (error) {
    fastify.log.error(error, `[redis plugin]: ${(error ).message}`);
  }
});

var storage = FastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(redis, {});
}, {name: "routes"});

const fastify = Fastify__default["default"]({logger: pino__default["default"](pinoPretty__default["default"]({singleLine: true}))});
fastify.register(plugins);
fastify.register(storage);
fastify.register(routes);
fastify.listen({port: 8080}, (error) => {
  if (!error) {
    process.on("uncaughtException", (error) => {
      fastify.log.error(error, `[uncaughtException]: ${(error ).message}`);
    });
    process.on("unhandledRejection", (error) => {
      fastify.log.error(error, `[unhandledRejection]: ${(error ).message}`);
    });
  } else {
    fastify.log.error(error);
    process.exit(1);
  }
});
//# sourceMappingURL=index.js.map
