var PositionStickyFactory = {

  create: function(element, options) {
    element = element || this.createElement();
    return PositionSticky.create(element, options);
  },

  createElement: function() {
    this.removeExisting();

    var container = document.createElement('DIV');
    var element = document.createElement('DIV');

    container.setAttribute('id', 'container');
    element.setAttribute('id', 'element');

    container.appendChild(element);
    document.body.appendChild(container);

    return element;
  },

  removeExisting: function() {
    var existing = document.getElementById('container');
    if (existing) {
      existing.remove();
    }
  }
};