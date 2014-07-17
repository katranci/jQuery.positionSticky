describe("PositionSticky", function() {

  var $html, element;

  beforeEach(function() {
    $html = jQuery('<div class="container"><div class="sticky"></div></div>').appendTo('body');
    element = $html.children('.sticky')[0];
  });

  describe("#init", function() {

    it("sets the element as the element property", function() {
      var instance = PositionSticky.create(element);
      expect(instance.element).toBe(element);
    });

    it("sets the sticky element's parent as the container property", function() {
      var instance = PositionSticky.create(element);
      expect(instance.container).toEqual($html[0]);
    });

    it("validates container's positioning scheme", function() {
      spyOn(PositionSticky, 'validateContainerPosScheme');
      var instance = PositionSticky.create(element);
      expect(instance.validateContainerPosScheme).toHaveBeenCalled();
    });

    it("calls #setOffsetTop", function() {
      spyOn(PositionSticky, 'setOffsetTop');
      var instance = PositionSticky.create(element);
      expect(instance.setOffsetTop).toHaveBeenCalled();
    });

    it("calls #calcThreshold", function() {
      spyOn(PositionSticky, 'calcThreshold');
      var instance = PositionSticky.create(element);
      expect(instance.calcThreshold).toHaveBeenCalled();
    });

    it("calls #createPlaceholder", function() {
      spyOn(PositionSticky, 'createPlaceholder');
      var instance = PositionSticky.create(element);
      expect(instance.createPlaceholder).toHaveBeenCalled();
    });

    it("calls #subscribeToWindowScroll", function() {
      spyOn(PositionSticky, 'subscribeToWindowScroll');
      var instance = PositionSticky.create(element);
      expect(instance.subscribeToWindowScroll).toHaveBeenCalled();
    });

  });

  describe("#validateContainerPosScheme", function() {

    describe("when container's positioning scheme is not either relative or absolute", function() {

      it("sets container's position to relative", function() {
        var $container = jQuery('<div></div>').appendTo('body');
        var container = $container[0];
        var mock = { container: container };
        var validateContainerPosScheme = PositionSticky.validateContainerPosScheme.bind(mock);

        validateContainerPosScheme();

        expect(container.style.getPropertyValue('position')).toEqual('relative');
      });

    });

    describe("otherwise", function() {

      it("doesn't change container's positioning scheme", function() {
        var $container = jQuery('<div></div>').css('position', 'absolute').appendTo('body');
        var container = $container[0];
        var mock = { container: container };
        var validateContainerPosScheme = PositionSticky.validateContainerPosScheme.bind(mock);

        validateContainerPosScheme();

        expect(container.style.getPropertyValue('position')).toEqual('absolute');
      });

    });

  });

  describe("#setOffsetTop", function() {

    describe("when element's computed 'top' css property value is not auto", function() {
      it("assigns that to 'offsetTop'", function() {
        element.style.setProperty('top', '15px');
        var instance = PositionSticky.create(element);
        expect(instance.offsetTop).toEqual(15);
        element.style.removeProperty('top');
      })
    });

    describe("otherwise", function() {
      it("sets 'offsetTop' as 0", function() {
        var instance = PositionSticky.create(element);
        expect(instance.offsetTop).toEqual(0);
      });
    });

  });

  describe("#calcThreshold", function() {

    it("returns sum of #getElementDistanceFromDocumentTop and 'offsetTop'", function() {
      var instance = PositionSticky.create(element);

      spyOn(instance, 'getElementDistanceFromDocumentTop').and.returnValue(100);
      instance.offsetTop = 10;
      instance.calcThreshold();

      expect(instance.threshold).toEqual(110);
    });

  });

  describe("#createPlaceholder", function() {

    var spy, instance;

    beforeEach(function() {
      // Prevent createPlaceholder to run on object initialization
      spy = spyOn(PositionSticky, 'createPlaceholder');

      instance = PositionSticky.create(element);
      instance.container.style.setProperty('width', '100px');
      instance.element.style.setProperty('height', '200px');
    });

    afterEach(function() {
      instance.container.style.removeProperty('width');
      instance.element.style.removeProperty('height');
    });

    it("creates a hidden div with the same dimensions as the sticky element and inserts it just before the sticky element", function() {
      // Now run createPlaceholder
      spy.and.callThrough();
      instance.createPlaceholder();

      expect(instance.element.previousElementSibling).toBe(instance.placeholder);
      expect(instance.placeholder.style.getPropertyValue('display')).toEqual('none');
      expect(instance.placeholder.style.getPropertyValue('width')).toEqual('100px');
      expect(instance.placeholder.style.getPropertyValue('height')).toEqual('200px');
    });

    it("applies element's computed width to its inline styling", function() {
      // Now run createPlaceholder
      spy.and.callThrough();
      instance.createPlaceholder();

      expect(instance.element.style.getPropertyValue('width')).toEqual('100px');
    });
  });

  describe("#subscribeToWindowScroll", function() {
    it("attaches #onScroll to Window.onscroll event", function() {
      var mockWindow = { addEventListener: function(event, callback) { callback(); }};
      var mock = { window: mockWindow, onScroll: function() {} };
      var subscribeToWindowScroll = PositionSticky.subscribeToWindowScroll.bind(mock);
      spyOn(mock, 'onScroll');

      subscribeToWindowScroll();

      expect(mock.onScroll).toHaveBeenCalled();
    });
  });

  describe("#onScroll", function() {

    var mockWindow, mock, onScroll;

    beforeEach(function() {
      mockWindow = { requestAnimationFrame: function(callback) { callback(); }};
      mock = { window: mockWindow, isTicking: false, update: function() {} };
      onScroll = PositionSticky.onScroll.bind(mock);
      spyOn(mock, 'update');
    });

    it("runs #update on every animation frame", function() {
      onScroll();
      expect(mock.update).toHaveBeenCalled();
    });

    it("doesn't run #update more than once in the same animation frame", function() {
      onScroll();
      onScroll();
      onScroll();

      expect(mock.update.calls.count()).toBe(1);
    });
  });

  describe("#isStatic", function() {

    var instance;

    beforeEach(function() {
      instance = PositionSticky.create(element);
    });

    it("returns true if posScheme is PositionSticky.POS_SCHEME_STATIC", function() {
      instance.posScheme = PositionSticky.POS_SCHEME_STATIC;
      expect(instance.isStatic()).toBe(true);
    });

    it("returns false otherwise", function() {
      instance.posScheme = PositionSticky.POS_SCHEME_FIXED;
      expect(instance.isStatic()).toBe(false);

      instance.posScheme = PositionSticky.POS_SCHEME_ABSOLUTE;
      expect(instance.isStatic()).toBe(false);
    });
  });

  describe("#makeStatic", function() {

    var instance;

    beforeEach(function() {
      instance = PositionSticky.create(element);
    });

    it("sets sticky element's position to 'static'", function() {
      instance.makeStatic();
      expect(instance.element.style.getPropertyValue('position')).toEqual('static');
    });

    it("hides placeholder", function() {
      instance.placeholder.style.setProperty('display', 'block');
      instance.makeStatic();
      expect(instance.placeholder.style.getPropertyValue('display')).toEqual('none');
    });

    it("updates posScheme to PositionSticky.POS_SCHEME_STATIC", function() {
      instance.makeStatic();
      expect(instance.posScheme).toBe(PositionSticky.POS_SCHEME_STATIC);
    });

  });

  describe("#isFixed", function() {

    var instance;

    beforeEach(function() {
      instance = PositionSticky.create(element);
    });

    it("returns true if posScheme is PositionSticky.POS_SCHEME_FIXED", function() {
      instance.posScheme = PositionSticky.POS_SCHEME_FIXED;
      expect(instance.isFixed()).toBe(true);
    });

    it("returns false otherwise", function() {
      instance.posScheme = PositionSticky.POS_SCHEME_STATIC;
      expect(instance.isFixed()).toBe(false);

      instance.posScheme = PositionSticky.POS_SCHEME_ABSOLUTE;
      expect(instance.isFixed()).toBe(false);
    });
  });

  describe("#makeFixed", function() {

    var instance;

    beforeEach(function() {
      instance = PositionSticky.create(element);
    });

    it("removes bottom property in case sticky element had absolute positioning before", function() {
      instance.element.style.setProperty('bottom', '0px');
      instance.makeFixed();
      expect(instance.element.style.getPropertyValue('bottom')).toBeNull();
    });

    it("sets sticky element's position to 'fixed'", function() {
      instance.makeFixed();
      expect(instance.element.style.getPropertyValue('position')).toEqual('fixed');
    });

    it("sets sticky element's top to 0", function() {
      instance.makeFixed();
      expect(instance.element.style.getPropertyValue('top')).toEqual('0px');
    });

    it("shows placeholder", function() {
      instance.placeholder.style.setProperty('display', 'none');
      instance.makeFixed();
      expect(instance.placeholder.style.getPropertyValue('display')).toEqual('block');
    });

    it("updates posScheme to PositionSticky.POS_SCHEME_FIXED", function() {
      instance.makeFixed();
      expect(instance.posScheme).toBe(PositionSticky.POS_SCHEME_FIXED);
    });

  });

  describe("#isAbsolute", function() {

    var instance;

    beforeEach(function() {
      instance = PositionSticky.create(element);
    });

    it("returns true if posScheme is PositionSticky.POS_SCHEME_ABSOLUTE", function() {
      instance.posScheme = PositionSticky.POS_SCHEME_ABSOLUTE;
      expect(instance.isAbsolute()).toBe(true);
    });

    it("returns false otherwise", function() {
      instance.posScheme = PositionSticky.POS_SCHEME_STATIC;
      expect(instance.isAbsolute()).toBe(false);

      instance.posScheme = PositionSticky.POS_SCHEME_FIXED;
      expect(instance.isAbsolute()).toBe(false);
    });
  });

  describe("#makeAbsolute", function() {

    var instance;

    beforeEach(function() {
      instance = PositionSticky.create(element);
    });

    it("removes top property in case sticky element had static positioning before", function() {
      instance.element.style.setProperty('top', '0px');
      instance.makeAbsolute();
      expect(instance.element.style.getPropertyValue('top')).toBeNull();
    });

    it("sets sticky element's position to 'absolute'", function() {
      instance.makeAbsolute();
      expect(instance.element.style.getPropertyValue('position')).toEqual('absolute');
    });

    it("sets sticky element's bottom to 0", function() {
      instance.makeAbsolute();
      expect(instance.element.style.getPropertyValue('bottom')).toEqual('0px');
    });

    it("shows placeholder", function() {
      instance.placeholder.style.setProperty('display', 'none');
      instance.makeAbsolute();
      expect(instance.placeholder.style.getPropertyValue('display')).toEqual('block');
    });

    it("updates posScheme to PositionSticky.POS_SCHEME_ABSOLUTE", function() {
      instance.makeAbsolute();
      expect(instance.posScheme).toBe(PositionSticky.POS_SCHEME_ABSOLUTE);
    });

  });

  describe("#update", function() {

    var instance;

    beforeEach(function() {
      instance = PositionSticky.create(element);
    });

    describe("when element is below the threshold", function() {

      beforeEach(function() {
        spyOn(instance, 'isBelowThreshold').and.returnValue(true);
      });

      it("sets the position to static if it is not already", function() {
        spyOn(instance, 'isStatic').and.returnValue(false);
        spyOn(instance, 'makeStatic');

        instance.update();

        expect(instance.makeStatic).toHaveBeenCalled();
      });

    });

    describe("when container is above the viewport and sticky can fit inside the visible portion of the container", function() {

      beforeEach(function() {
        spyOn(instance, 'isBelowThreshold').and.returnValue(false);
        spyOn(instance, 'canStickyFitInContainer').and.returnValue(true);
      });

      it("sets the position to fixed if it is not already", function() {
        spyOn(instance, 'isFixed').and.returnValue(false);
        spyOn(instance, 'makeFixed');

        instance.update();

        expect(instance.makeFixed).toHaveBeenCalled();
      });

    });

    describe("otherwise", function() {

      beforeEach(function() {
        spyOn(instance, 'isBelowThreshold').and.returnValue(false);
        spyOn(instance, 'canStickyFitInContainer').and.returnValue(false);
      });

      it("sets the position to absolute if it is not already", function() {
        spyOn(instance, 'isAbsolute').and.returnValue(false);
        spyOn(instance, 'makeAbsolute');

        instance.update();

        expect(instance.makeAbsolute).toHaveBeenCalled();
      });

    });

  });

  describe("#isBelowThreshold", function() {

    var isBelowThreshold, mockWindow;

    beforeEach(function() {
      mockWindow = { scrollY: 0 };
      var mock = { window: mockWindow, threshold: 100 };
      isBelowThreshold = PositionSticky.isBelowThreshold.bind(mock);
    });

    it("returns true when window.scrollY is smaller than the threshold", function() {
      mockWindow.scrollY = 99;
      expect(isBelowThreshold()).toBe(true);
    });

    it("returns false otherwise", function() {
      mockWindow.scrollY = 100;
      expect(isBelowThreshold()).toBe(false);

      mockWindow.scrollY = 101;
      expect(isBelowThreshold()).toBe(false);
    });
  });

  describe("#canStickyFitInContainer", function() {
    var instance;

    beforeEach(function() {
      instance = PositionSticky.create(element);
    });

    it("returns true when container.getBoundingClientRect().bottom is equal or bigger than sticky element's height", function() {
      var containerSpy = spyOn(instance.container, 'getBoundingClientRect');
      spyOn(instance.element, 'getBoundingClientRect').and.returnValue({height: 100});

      containerSpy.and.returnValue({bottom: 100});
      expect(instance.canStickyFitInContainer()).toBe(true);

      containerSpy.and.returnValue({bottom: 101});
      expect(instance.canStickyFitInContainer()).toBe(true);
    });

    it("returns false otherwise", function() {
      spyOn(instance.element, 'getBoundingClientRect').and.returnValue({height: 99});
      expect(instance.canStickyFitInContainer()).toBe(false);
    })
  });

  describe("#getElementDistanceFromDocumentTop", function() {

    describe("if the page is not scrolled", function() {
      it("returns element.getBoundingClientRect().top", function() {
        spyOn(element, 'getBoundingClientRect').and.returnValue({top: 1000});

        var mockWindow = { scrollY: 0 };
        var mock = { element: element, window: mockWindow };

        getElementDistanceFromDocumentTop = PositionSticky.getElementDistanceFromDocumentTop.bind(mock);

        expect(getElementDistanceFromDocumentTop()).toEqual(1000);
      });
    });

    describe("if the page is scrolled", function() {
      it("returns total offsetTop", function() {
        var instance = PositionSticky.create(element);

        instance.container.ownerDocument.body.style.setProperty('margin-top', '100px');
        instance.container.ownerDocument.body.style.setProperty('padding-top', '100px');
        instance.container.style.setProperty('margin-top', '100px');
        instance.container.style.setProperty('padding-top', '100px');
        instance.element.style.setProperty('margin-top', '100px');

        expect(instance.getElementDistanceFromDocumentTop()).toEqual(500);

        instance.container.style.removeProperty('margin-top');
        instance.container.style.removeProperty('padding-top');
        instance.element.style.removeProperty('margin-top');
      });
    });

  });

});