PositionSticky = {

  create: function(element) {
    return Object.create(PositionSticky).init(element);
  },

  init: function(element) {
    this.constructor = PositionSticky;
    this.element = element;
    this.container = element.parentNode;
    return this;
  },

  isStatic: function() {

  },

  makeStatic: function() {

  },

  isFixed: function() {

  },

  makeFixed: function() {

  },

  isAbsolute: function() {

  },

  makeAbsolute: function() {

  },

  update: function() {
    if (this.isContainerBelowViewport()) {
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

  isContainerBelowViewport: function() {
    if (this.container.getBoundingClientRect().top >= 0) {
      return true;
    }
    return false;
  },

  canStickyFitInContainer: function() {
    return this.container.getBoundingClientRect().bottom >= this.element.getBoundingClientRect().height;
  }

};