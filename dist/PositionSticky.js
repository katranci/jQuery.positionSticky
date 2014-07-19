// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
var PositionSticky = {

  POS_SCHEME_STATIC:   100,
  POS_SCHEME_FIXED:    200,
  POS_SCHEME_ABSOLUTE: 300,

  create: function(element, options) {
    if (typeof options === 'undefined') {
      options = {};
    }
    return Object.create(PositionSticky).init(element, options);
  },

  init: function(element, options) {
    this.constructor = PositionSticky;
    this.window = window;
    this.element = element;
    this.container = element.parentNode;
    this.posScheme = PositionSticky.POS_SCHEME_STATIC;
    this.isTicking = false;
    this.threshold = null;
    this.options = options;
    this.boundingBoxHeight = null;
    this.latestKnownScrollY = this.window.pageYOffset;

    this.validateContainerPosScheme();
    this.setOffsetTop();
    this.setOffsetBottom();
    this.calcThreshold();
    this.setElementWidth();
    this.setBoundingBoxHeight();
    this.createPlaceholder();
    this.subscribeToWindowScroll();

    return this;
  },

  validateContainerPosScheme: function() {
    var containerPosScheme = this.container.style.position;
    if (containerPosScheme != 'relative' && containerPosScheme != 'absolute') {
      this.container.style.position = 'relative';
    }
  },

  setOffsetTop: function() {
    if (typeof this.options.offsetTop === 'number' && this.options.offsetTop >= 0) {
      this.offsetTop = this.options.offsetTop;
    } else {
      var topBorderWidth = parseInt(this.window.getComputedStyle(this.container).borderTopWidth, 10);
      var topPadding = parseInt(this.window.getComputedStyle(this.container).paddingTop, 10);
      this.offsetTop = topBorderWidth + topPadding;
    }
  },

  setOffsetBottom: function() {
    var bottomBorderWidth = parseInt(this.window.getComputedStyle(this.container).borderBottomWidth, 10);
    var bottomPadding = parseInt(this.window.getComputedStyle(this.container).paddingBottom, 10);
    this.offsetBottom = bottomBorderWidth + bottomPadding;
  },

  calcThreshold: function() {
    this.threshold = this.getElementDistanceFromDocumentTop() - this.offsetTop;
  },

  setElementWidth: function() {
    var width = this.window.getComputedStyle(this.element).width;
    this.element.style.width = width;
  },

  setBoundingBoxHeight: function(updatePlaceholder) {
    this.boundingBoxHeight = this.element.getBoundingClientRect().height;
    if (updatePlaceholder === true) {
      this.placeholder.style.height = this.boundingBoxHeight + 'px';
    }
  },

  createPlaceholder: function() {
    var placeholder = document.createElement('DIV');

    var width   = this.element.getBoundingClientRect().width + 'px';
    var height  = this.boundingBoxHeight + 'px';
    var margin  = this.window.getComputedStyle(this.element).margin;
    var float   = this.window.getComputedStyle(this.element).float; // TODO: Doesn't work on Firefox

    placeholder.style.display = 'none';
    placeholder.style.width   = width;
    placeholder.style.height  = height;
    placeholder.style.margin  = margin;
    placeholder.style.float   = float;

    this.container.insertBefore(placeholder, this.element);
    this.placeholder = placeholder;
  },

  subscribeToWindowScroll: function() {
    this.window.addEventListener('scroll', this.onScroll.bind(this));
  },

  /**
   * TODO: Don't run update when container is not visible
   */
  onScroll: function() {
    if (!this.isTicking) {
      this.latestKnownScrollY = this.window.pageYOffset;
      this.window.requestAnimationFrame(this.update.bind(this));
      this.isTicking = true;
    }
  },

  isStatic: function() {
    return this.posScheme === PositionSticky.POS_SCHEME_STATIC;
  },

  makeStatic: function() {
    this.element.style.position = 'static';
    this.placeholder.style.display = 'none';
    this.posScheme = PositionSticky.POS_SCHEME_STATIC;
  },

  isFixed: function() {
    return this.posScheme === PositionSticky.POS_SCHEME_FIXED;
  },

  makeFixed: function() {
    this.element.style.bottom = null;
    this.element.style.position = 'fixed';
    this.element.style.top = this.offsetTop + 'px';
    this.placeholder.style.display = 'block';
    this.posScheme = PositionSticky.POS_SCHEME_FIXED;
  },

  isAbsolute: function() {
    return this.posScheme === PositionSticky.POS_SCHEME_ABSOLUTE;
  },

  makeAbsolute: function() {
    this.element.style.top = null;
    this.element.style.position = 'absolute';
    this.element.style.bottom = this.offsetBottom + 'px';
    this.placeholder.style.display = 'block';
    this.posScheme = PositionSticky.POS_SCHEME_ABSOLUTE;
  },

  update: function() {
    this.isTicking = false;

    if (this.isBelowThreshold()) {
      if (!this.isStatic()) {
        this.makeStatic();
      }
    } else if (this.canStickyFitInContainer()) {
      if (!this.isFixed()) {
        this.makeFixed();
      }
    } else {
      if (!this.isAbsolute()) {
        this.makeAbsolute();
      }
    }
  },

  isBelowThreshold: function() {
    if (this.latestKnownScrollY < this.threshold) {
      return true;
    }
    return false;
  },

  canStickyFitInContainer: function() {
    return this.getAvailableSpaceInContainer() >= this.boundingBoxHeight;
  },

  getAvailableSpaceInContainer: function() {
    return this.container.getBoundingClientRect().bottom - this.offsetBottom - this.offsetTop;
  },

  getElementDistanceFromDocumentTop: function() {
    var element = (this.isStatic() ? this.element : this.placeholder);
    var totalOffsetTop = this.latestKnownScrollY + element.getBoundingClientRect().top;
    return totalOffsetTop;
  },

  refresh: function() {
    this.calcThreshold();
    this.setBoundingBoxHeight(true);
  }

};