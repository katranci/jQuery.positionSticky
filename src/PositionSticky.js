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

  createPlaceholder: function() {
    var placeholder = document.createElement('DIV');

    var width   = this.element.getBoundingClientRect().width + 'px';
    var height  = this.element.getBoundingClientRect().height + 'px';
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
      this.latestKnownScrollY = this.window.scrollY;
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