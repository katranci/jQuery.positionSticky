PositionSticky = {

  POS_SCHEME_STATIC:   100,
  POS_SCHEME_FIXED:    200,
  POS_SCHEME_ABSOLUTE: 300,

  create: function(element) {
    return Object.create(PositionSticky).init(element);
  },

  init: function(element) {
    this.constructor = PositionSticky;
    this.window = window;
    this.element = element;
    this.container = element.parentNode;
    this.posScheme = null;
    this.isTicking = false;
    this.threshold = null;

    this.validateContainerPosScheme();
    this.setOffsetTop();
    this.calcThreshold();
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
    var top = this.window.getComputedStyle(this.element).getPropertyValue('top');
    if (top === 'auto') {
      top = 0;
    }
    this.offsetTop = parseInt(top, 10);
  },

  calcThreshold: function() {
    this.threshold = this.getElementDistanceFromDocumentTop() + this.offsetTop;
  },

  subscribeToWindowScroll: function() {
    this.window.addEventListener('scroll', this.onScroll.bind(this));
  },

  onScroll: function() {
    if (!this.isTicking) {
      this.window.requestAnimationFrame(this.update.bind(this));
      this.isTicking = true;
    }
  },

  isStatic: function() {
    return this.posScheme === PositionSticky.POS_SCHEME_STATIC;
  },

  makeStatic: function() {
    this.element.style.setProperty('position', 'static');
    this.posScheme = PositionSticky.POS_SCHEME_STATIC;
  },

  isFixed: function() {
    return this.posScheme === PositionSticky.POS_SCHEME_FIXED;
  },

  makeFixed: function() {
    this.element.style.removeProperty('bottom');
    this.element.style.setProperty('position', 'fixed');
    this.element.style.setProperty('top', '0px');
    this.posScheme = PositionSticky.POS_SCHEME_FIXED;
  },

  isAbsolute: function() {
    return this.posScheme === PositionSticky.POS_SCHEME_ABSOLUTE;
  },

  makeAbsolute: function() {
    this.element.style.removeProperty('top');
    this.element.style.setProperty('position', 'absolute');
    this.element.style.setProperty('bottom', '0px');
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
    if (this.window.scrollY < this.threshold) {
      return true;
    }
    return false;
  },

  canStickyFitInContainer: function() {
    return this.container.getBoundingClientRect().bottom >= this.element.getBoundingClientRect().height;
  },

  getElementDistanceFromDocumentTop: function() {
    if (this.window.scrollY === 0) {
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