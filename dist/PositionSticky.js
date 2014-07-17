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
/**
 * TODO: Don't run update when container is not visible
 */
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
    this.posScheme = null;
    this.isTicking = false;
    this.threshold = null;
    this.options = options;
    this.latestKnownScrollY = this.window.scrollY;

    this.validateContainerPosScheme();
    this.setOffsetTop();
    this.setOffsetBottom();
    this.calcThreshold();
    this.setElementWidth();
    this.createPlaceholder();
    this.subscribeToWindowScroll();

    return this;
  },

  validateContainerPosScheme: function() {
    var containerPosScheme = this.container.style.getPropertyValue('position');
    if (containerPosScheme != 'relative' && containerPosScheme != 'absolute') {
      this.container.style.setProperty('position', 'relative');
    }
  },

  setOffsetTop: function() {
    if (typeof this.options.offsetTop === 'number' && this.options.offsetTop >= 0) {
      this.offsetTop = this.options.offsetTop;
    } else {
      var topBorderWidth = parseInt(this.window.getComputedStyle(this.container).getPropertyValue('border-top-width'), 10);
      var topPadding = parseInt(this.window.getComputedStyle(this.container).getPropertyValue('padding-top'), 10);
      this.offsetTop = topBorderWidth + topPadding;
    }
  },

  setOffsetBottom: function() {
    var bottomBorderWidth = parseInt(this.window.getComputedStyle(this.container).getPropertyValue('border-bottom-width'), 10);
    var bottomPadding = parseInt(this.window.getComputedStyle(this.container).getPropertyValue('padding-bottom'), 10);
    this.offsetBottom = bottomBorderWidth + bottomPadding;
  },

  calcThreshold: function() {
    this.threshold = this.getElementDistanceFromDocumentTop() - this.offsetTop;
  },

  setElementWidth: function() {
    var width = this.window.getComputedStyle(this.element).getPropertyValue('width');
    this.element.style.setProperty('width', width);
  },

  createPlaceholder: function() {
    var placeholder = document.createElement('DIV');
    var width = this.element.getBoundingClientRect().width + 'px';
    var height = this.element.getBoundingClientRect().height + 'px';

    placeholder.style.setProperty('display', 'none');
    placeholder.style.setProperty('width', width);
    placeholder.style.setProperty('height', height);

    this.container.insertBefore(placeholder, this.element);
    this.placeholder = placeholder;
  },

  subscribeToWindowScroll: function() {
    this.window.addEventListener('scroll', this.onScroll.bind(this));
  },

  onScroll: function() {
    if (!this.isTicking) {
      this.latestKnownScrollY = this.window.scrollY;
      this.window.requestAnimationFrame(this.update.bind(this));
      this.isTicking = true;
    }
  },

  isStatic: function() {
    return this.posScheme === PositionSticky.POS_SCHEME_STATIC;
  },

  makeStatic: function() {
    this.element.style.setProperty('position', 'static');
    this.placeholder.style.setProperty('display', 'none');
    this.posScheme = PositionSticky.POS_SCHEME_STATIC;
  },

  isFixed: function() {
    return this.posScheme === PositionSticky.POS_SCHEME_FIXED;
  },

  makeFixed: function() {
    this.element.style.removeProperty('bottom');
    this.element.style.setProperty('position', 'fixed');
    this.element.style.setProperty('top', this.offsetTop + 'px');
    this.placeholder.style.setProperty('display', 'block');
    this.posScheme = PositionSticky.POS_SCHEME_FIXED;
  },

  isAbsolute: function() {
    return this.posScheme === PositionSticky.POS_SCHEME_ABSOLUTE;
  },

  makeAbsolute: function() {
    this.element.style.removeProperty('top');
    this.element.style.setProperty('position', 'absolute');
    this.element.style.setProperty('bottom', this.offsetBottom + 'px');
    this.placeholder.style.setProperty('display', 'block');
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
    return this.getAvailableSpaceInContainer() >= this.element.getBoundingClientRect().height;
  },

  getAvailableSpaceInContainer: function() {
    return this.container.getBoundingClientRect().bottom - this.offsetBottom - this.offsetTop;
  },

  getElementDistanceFromDocumentTop: function() {
    if (this.latestKnownScrollY === 0) {
      return this.element.getBoundingClientRect().top;
    }

    var totalOffsetTop = 0;
    var element = this.element;
    do {
      totalOffsetTop = totalOffsetTop + element.offsetTop;
    } while (element = element.offsetParent);

    return totalOffsetTop;
  }

};