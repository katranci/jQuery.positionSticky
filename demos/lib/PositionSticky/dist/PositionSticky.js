(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["PositionSticky"] = factory();
	else
		root["PositionSticky"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @namespace PositionSticky
	 * @author Ahmet Katrancı <ahmet@katranci.co.uk>
	 */
	var Container   = __webpack_require__(1);
	var Placeholder = __webpack_require__(2);
	var Sticky      = __webpack_require__(3);
	var rAF         = __webpack_require__(4);

	var PositionSticky = {

	  /**
	   * @constant
	   */
	  POS_SCHEME_STATIC:   100,

	  /**
	   * @constant
	   */
	  POS_SCHEME_FIXED:    200,

	  /**
	   * @constant
	   */
	  POS_SCHEME_ABSOLUTE: 300,

	  /**
	   * Creates an instance of PositionSticky
	   *
	   * @param element
	   * @param options
	   * @returns {PositionSticky}
	   * @static
	   * @public
	   */
	  create: function(element, options) {
	    if (typeof options === 'undefined') {
	      options = {};
	    }
	    return Object.create(PositionSticky)._init(element, options);
	  },

	  /**
	   * Constructor method
	   *
	   * @param element {HTMLElement}
	   * @param options {Object}
	   * @returns {PositionSticky}
	   * @instance
	   * @private
	   */
	  _init: function(element, options) {
	    this.constructor = PositionSticky;
	    this._window = window;
	    this._sticky = Sticky.create(element);
	    this._container = Container.create(element.parentNode);
	    this._placeholder = null;
	    this._posScheme = PositionSticky.POS_SCHEME_STATIC;
	    this._isTicking = false;
	    this._threshold = null;
	    this._options = options;
	    this._leftPositionWhenAbsolute = null;
	    this._leftPositionWhenFixed = null;
	    this._latestKnownScrollY = this._window.pageYOffset;

	    this._setOffsetTop();
	    this._setOffsetBottom();
	    this._calcThreshold();
	    this._setLeftPositionWhenAbsolute();
	    this._setLeftPositionWhenFixed();
	    this._createPlaceholder();
	    this._subscribeToWindowScroll();

	    return this;
	  },

	  /**
	   * Sets the distance that the sticky element will have from the top of viewport
	   * when it becomes sticky
	   *
	   * @instance
	   * @private
	   */
	  _setOffsetTop: function() {
	    if (typeof this._options.offsetTop === 'number' && this._options.offsetTop >= 0) {
	      this.offsetTop = this._options.offsetTop;
	    } else {
	      this.offsetTop = this._container.borderTopWidth + this._container.paddingTop;
	    }
	  },

	  /**
	   * Sets the amount to subtract in #_canStickyFitInContainer and also sets the
	   * distance that the sticky element will have from the bottom of its container
	   * when it is positioned absolutely
	   *
	   * @instance
	   * @private
	   */
	  _setOffsetBottom: function() {
	    this.offsetBottom = this._container.borderBottomWidth + this._container.paddingBottom;
	  },

	  /**
	   * Calculates the point where the sticky behaviour should start
	   *
	   * @instance
	   * @private
	   */
	  _calcThreshold: function() {
	    this._threshold = this._getStickyDistanceFromDocumentTop() - this.offsetTop;
	  },

	  /**
	   * Gets the element's distance from its offset parent's left
	   * and subtracts any horizontal margins and saves it
	   *
	   * @instance
	   * @private
	   */
	  _setLeftPositionWhenAbsolute: function() {
	    var marginLeft = parseInt(this._window.getComputedStyle(this._sticky.element).marginLeft, 10);
	    this._leftPositionWhenAbsolute = this._sticky.element.offsetLeft - marginLeft;
	  },

	  /**
	   * Gets the element's distance from document left and saves it
	   *
	   * @instance
	   * @private
	   *
	   * @todo Write a test that is covering when the page is scrolled
	   */
	  _setLeftPositionWhenFixed: function() {
	    var marginLeft = parseInt(this._window.getComputedStyle(this._sticky.element).marginLeft, 10);
	    this._leftPositionWhenFixed = this._window.pageXOffset + this._sticky.element.getBoundingClientRect().left - marginLeft;
	  },

	  /**
	   * Creates the placeholder that will be used in place of the element
	   * when the element is positioned absolutely or fixed
	   *
	   * @instance
	   * @private
	   */
	  _createPlaceholder: function() {
	    this._placeholder = Placeholder.create(this._sticky);
	  },

	  /**
	   * Attaches #_onScroll method to Window.onscroll event
	   *
	   * @instance
	   * @private
	   */
	  _subscribeToWindowScroll: function() {
	    this._window.addEventListener('scroll', this._onScroll.bind(this));
	  },

	  /**
	   * Debounces the scroll event
	   *
	   * @see [Debouncing Scroll Events]{@link http://www.html5rocks.com/en/tutorials/speed/animations/#debouncing-scroll-events}
	   * @instance
	   * @private
	   *
	   * @todo Don't run _update when container is not visible
	   */
	  _onScroll: function() {
	    if (!this._isTicking) {
	      this._latestKnownScrollY = this._window.pageYOffset;
	      rAF(this._update.bind(this));
	      this._isTicking = true;
	    }
	  },

	  /**
	   * @returns {boolean}
	   * @instance
	   * @private
	   */
	  _isStatic: function() {
	    return this._posScheme === PositionSticky.POS_SCHEME_STATIC;
	  },

	  /**
	   * @instance
	   * @private
	   */
	  _makeStatic: function() {
	    this._sticky.element.style.position = 'static';
	    this._placeholder.element.style.display = 'none';
	    this._posScheme = PositionSticky.POS_SCHEME_STATIC;
	  },

	  /**
	   * @returns {boolean}
	   * @instance
	   * @private
	   */
	  _isFixed: function() {
	    return this._posScheme === PositionSticky.POS_SCHEME_FIXED;
	  },

	  /**
	   * @instance
	   * @private
	   */
	  _makeFixed: function() {
	    this._sticky.element.style.bottom = null;
	    this._sticky.element.style.position = 'fixed';
	    this._sticky.element.style.top = this.offsetTop + 'px';
	    this._sticky.element.style.left = this._leftPositionWhenFixed + 'px';
	    this._placeholder.element.style.display = 'block';
	    this._posScheme = PositionSticky.POS_SCHEME_FIXED;
	  },

	  /**
	   * @returns {boolean}
	   * @instance
	   * @private
	   */
	  _isAbsolute: function() {
	    return this._posScheme === PositionSticky.POS_SCHEME_ABSOLUTE;
	  },

	  /**
	   * @instance
	   * @private
	   */
	  _makeAbsolute: function() {
	    this._sticky.element.style.top = null;
	    this._sticky.element.style.position = 'absolute';
	    this._sticky.element.style.bottom = this._container.paddingBottom + 'px';
	    this._sticky.element.style.left = this._leftPositionWhenAbsolute + 'px';
	    this._placeholder.element.style.display = 'block';
	    this._posScheme = PositionSticky.POS_SCHEME_ABSOLUTE;
	  },

	  /**
	   * This is the main method that runs on every animation frame during scroll.
	   * It starts with checking whether the element is within the static range.
	   * If not, it checks whether the element is within the fixed range.
	   * Otherwise, it positions the element absolutely.
	   *
	   * @instance
	   * @private
	   */
	  _update: function() {
	    this._isTicking = false;

	    if (this._isBelowThreshold()) {
	      if (!this._isStatic()) {
	        this._makeStatic();
	      }
	    } else if (this._canStickyFitInContainer()) {
	      if (!this._isFixed()) {
	        this._makeFixed();
	      }
	    } else {
	      if (!this._isAbsolute()) {
	        this._makeAbsolute();
	      }
	    }
	  },

	  /**
	   * Returns true when the page hasn't been scrolled to the threshold point yet.
	   * Otherwise, returns false.
	   *
	   * @returns {boolean}
	   * @instance
	   * @private
	   */
	  _isBelowThreshold: function() {
	    if (this._latestKnownScrollY < this._threshold) {
	      return true;
	    }
	    return false;
	  },

	  /**
	   * Checks whether the element can fit inside the visible portion of the container or not
	   *
	   * @returns {boolean}
	   * @instance
	   * @private
	   */
	  _canStickyFitInContainer: function() {
	    return this._getAvailableSpaceInContainer() >= this._sticky.boundingBoxHeight;
	  },

	  /**
	   * Calculates the height of the visible portion of the container
	   * that can be used to fit the sticky element
	   *
	   * @returns {number}
	   * @instance
	   * @private
	   */
	  _getAvailableSpaceInContainer: function() {
	    return this._container.element.getBoundingClientRect().bottom - this.offsetBottom - this.offsetTop;
	  },

	  /**
	   * Calculates sticky element's total offset from the document top.
	   * It uses placeholder if it is called when the sticky element is
	   * not static (e.g. through #refresh)
	   *
	   * @returns {number}
	   * @instance
	   * @private
	   */
	  _getStickyDistanceFromDocumentTop: function() {
	    var element = (this._isStatic() ? this._sticky.element : this._placeholder.element);
	    var totalOffsetTop = this._latestKnownScrollY + element.getBoundingClientRect().top;
	    return totalOffsetTop;
	  },

	  /**
	   * Re-measures the cached positions/dimensions that are used during scroll
	   *
	   * @instance
	   * @public
	   */
	  refresh: function() {
	    this._calcThreshold();
	    this._sticky.refresh();
	    this._placeholder.refresh();
	  }

	};

	module.exports = PositionSticky;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @namespace Container
	 * @author Ahmet Katrancı <ahmet@katranci.co.uk>
	 */
	var Container = {

	  /**
	   * Creates an instance of Container
	   *
	   * @param element
	   * @returns {Container}
	   * @static
	   * @public
	   */
	  create: function(element) {
	    return Object.create(Container)._init(element);
	  },

	  /**
	   * Constructor method
	   *
	   * @param element {HTMLElement}
	   * @returns {Container}
	   * @instance
	   * @private
	   */
	  _init: function(element) {
	    this.constructor = Container;
	    this._window = window;
	    this.element = element;
	    this.paddingTop = null;
	    this.paddingBottom = null;
	    this.borderTopWidth = null;
	    this.borderBottomWidth = null;

	    this._validatePosScheme();
	    this._setLayoutProperties();

	    return this;
	  },

	  /**
	   * Ensures that the container's position is either 'relative' or 'absolute'
	   * so that when the sticky element is positioned absolutely it is positioned within its container
	   *
	   * @instance
	   * @private
	   */
	  _validatePosScheme: function() {
	    var posScheme = this.element.style.position;
	    if (posScheme != 'relative' && posScheme != 'absolute') {
	      this.element.style.position = 'relative';
	    }
	  },

	  /**
	   * Caches several layout properties
	   *
	   * @instance
	   * @private
	   */
	  _setLayoutProperties: function() {
	    var computedStyles = this._window.getComputedStyle(this.element);
	    this.paddingTop = parseInt(computedStyles.paddingTop, 10);
	    this.paddingBottom = parseInt(computedStyles.paddingBottom, 10);
	    this.borderTopWidth = parseInt(computedStyles.borderTopWidth, 10);
	    this.borderBottomWidth = parseInt(computedStyles.borderBottomWidth, 10);
	  }

	};

	module.exports = Container;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @namespace Placeholder
	 * @author Ahmet Katrancı <ahmet@katranci.co.uk>
	 */
	var Placeholder = {

	  /**
	   * Creates an instance of Placeholder
	   *
	   * @param sticky {PositionSticky}
	   * @returns {Placeholder}
	   * @static
	   * @public
	   */
	  create: function(sticky) {
	    return Object.create(Placeholder)._init(sticky);
	  },

	  /**
	   * Constructor method
	   *
	   * @param sticky {PositionSticky}
	   * @returns {Placeholder}
	   * @instance
	   * @private
	   */
	  _init: function(sticky) {
	    this.constructor = Placeholder;
	    this._window = window;
	    this._sticky = sticky;
	    this.element = null;
	    
	    this._createElement();

	    return this;
	  },

	  /**
	   * Creates the placeholder that will be used in place of the element
	   * when the element is positioned absolutely or fixed
	   *
	   * @instance
	   * @private
	   *
	   * @todo Float computation doesn't work on Firefox and IE9
	   */
	  _createElement: function() {
	    var placeholder = document.createElement('DIV');

	    var width   = this._sticky.element.getBoundingClientRect().width + 'px';
	    var height  = this._sticky.boundingBoxHeight + 'px';
	    var margin  = this._window.getComputedStyle(this._sticky.element).margin;
	    var float   = this._window.getComputedStyle(this._sticky.element).float;

	    placeholder.style.display = 'none';
	    placeholder.style.width   = width;
	    placeholder.style.height  = height;
	    placeholder.style.margin  = margin;
	    placeholder.style.float   = float;

	    this._sticky.element.parentNode.insertBefore(placeholder, this._sticky.element);
	    this.element = placeholder;
	  },

	  /**
	   * Re-sets element's height from sticky's boundingBoxHeight. It is called
	   * from PositionSticky#refresh.
	   *
	   * @instance
	   */
	  refresh: function() {
	    this.element.style.height = this._sticky.boundingBoxHeight + 'px';
	  }

	};

	module.exports = Placeholder;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @namespace Sticky
	 * @author Ahmet Katrancı <ahmet@katranci.co.uk>
	 */
	var Sticky = {

	  /**
	   * Creates an instance of Sticky
	   *
	   * @param element
	   * @returns {Sticky}
	   * @static
	   * @public
	   */
	  create: function(element) {
	    return Object.create(Sticky)._init(element);
	  },

	  /**
	   * Constructor method
	   *
	   * @param element {HTMLElement}
	   * @returns {Sticky}
	   * @instance
	   * @private
	   */
	  _init: function(element) {
	    this.constructor = Sticky;
	    this._window = window;
	    this.element = element;
	    this.boundingBoxHeight = null;

	    this._setElementWidth();
	    this._setBoundingBoxHeight();

	    return this;
	  },

	  /**
	   * Applies element's computed width to its inline styling so that when the element
	   * is positioned absolutely or fixed it doesn't lose its shape
	   *
	   * @instance
	   * @private
	   */
	  _setElementWidth: function() {
	    var width = this._window.getComputedStyle(this.element).width;
	    this.element.style.width = width;
	  },

	  /**
	   * Saves element's bounding box height to an instance property so that it is not
	   * calculated on every PositionSticky#_update.
	   *
	   * @instance
	   * @private
	   */
	  _setBoundingBoxHeight: function() {
	    this.boundingBoxHeight = this.element.getBoundingClientRect().height;
	  },

	  /**
	   * Re-measures element's boundingBoxHeight. It is called
	   * from PositionSticky#refresh.
	   *
	   * @instance
	   */
	  refresh: function() {
	    this._setBoundingBoxHeight();
	  }

	};

	module.exports = Sticky;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var now = __webpack_require__(5)
	  , global = typeof window === 'undefined' ? {} : window
	  , vendors = ['moz', 'webkit']
	  , suffix = 'AnimationFrame'
	  , raf = global['request' + suffix]
	  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
	  , native = true

	for(var i = 0; i < vendors.length && !raf; i++) {
	  raf = global[vendors[i] + 'Request' + suffix]
	  caf = global[vendors[i] + 'Cancel' + suffix]
	      || global[vendors[i] + 'CancelRequest' + suffix]
	}

	// Some versions of FF have rAF but not cAF
	if(!raf || !caf) {
	  native = false

	  var last = 0
	    , id = 0
	    , queue = []
	    , frameDuration = 1000 / 60

	  raf = function(callback) {
	    if(queue.length === 0) {
	      var _now = now()
	        , next = Math.max(0, frameDuration - (_now - last))
	      last = next + _now
	      setTimeout(function() {
	        var cp = queue.slice(0)
	        // Clear queue here to prevent
	        // callbacks from appending listeners
	        // to the current frame's queue
	        queue.length = 0
	        for(var i = 0; i < cp.length; i++) {
	          if(!cp[i].cancelled) {
	            try{
	              cp[i].callback(last)
	            } catch(e) {
	              setTimeout(function() { throw e }, 0)
	            }
	          }
	        }
	      }, next)
	    }
	    queue.push({
	      handle: ++id,
	      callback: callback,
	      cancelled: false
	    })
	    return id
	  }

	  caf = function(handle) {
	    for(var i = 0; i < queue.length; i++) {
	      if(queue[i].handle === handle) {
	        queue[i].cancelled = true
	      }
	    }
	  }
	}

	module.exports = function(fn) {
	  // Wrap in a new function to prevent
	  // `cancel` potentially being assigned
	  // to the native rAF function
	  if(!native) {
	    return raf.call(global, fn)
	  }
	  return raf.call(global, function() {
	    try{
	      fn.apply(this, arguments)
	    } catch(e) {
	      setTimeout(function() { throw e }, 0)
	    }
	  })
	}
	module.exports.cancel = function() {
	  caf.apply(global, arguments)
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Generated by CoffeeScript 1.6.3
	(function() {
	  var getNanoSeconds, hrtime, loadTime;

	  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
	    module.exports = function() {
	      return performance.now();
	    };
	  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
	    module.exports = function() {
	      return (getNanoSeconds() - loadTime) / 1e6;
	    };
	    hrtime = process.hrtime;
	    getNanoSeconds = function() {
	      var hr;
	      hr = hrtime();
	      return hr[0] * 1e9 + hr[1];
	    };
	    loadTime = getNanoSeconds();
	  } else if (Date.now) {
	    module.exports = function() {
	      return Date.now() - loadTime;
	    };
	    loadTime = Date.now();
	  } else {
	    module.exports = function() {
	      return new Date().getTime() - loadTime;
	    };
	    loadTime = new Date().getTime();
	  }

	}).call(this);

	/*
	//@ sourceMappingURL=performance-now.map
	*/
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser

	var process = module.exports = {};

	process.nextTick = (function () {
	    var canSetImmediate = typeof window !== 'undefined'
	    && window.setImmediate;
	    var canPost = typeof window !== 'undefined'
	    && window.postMessage && window.addEventListener
	    ;

	    if (canSetImmediate) {
	        return function (f) { return window.setImmediate(f) };
	    }

	    if (canPost) {
	        var queue = [];
	        window.addEventListener('message', function (ev) {
	            var source = ev.source;
	            if ((source === window || source === null) && ev.data === 'process-tick') {
	                ev.stopPropagation();
	                if (queue.length > 0) {
	                    var fn = queue.shift();
	                    fn();
	                }
	            }
	        }, true);

	        return function nextTick(fn) {
	            queue.push(fn);
	            window.postMessage('process-tick', '*');
	        };
	    }

	    return function nextTick(fn) {
	        setTimeout(fn, 0);
	    };
	})();

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	}

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};


/***/ }
/******/ ])
});
