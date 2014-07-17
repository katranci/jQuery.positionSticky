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

    it("calls #setOffsetBottom", function() {
      spyOn(PositionSticky, 'setOffsetBottom');
      var instance = PositionSticky.create(element);
      expect(instance.setOffsetBottom).toHaveBeenCalled();
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

    describe("when offsetTop is given in options and it is zero or a positive integer", function() {
      it("assigns that to 'offsetTop'", function() {
        var instance;

        instance = PositionSticky.create(element, {offsetTop: 0});
        expect(instance.offsetTop).toEqual(0);

        instance = PositionSticky.create(element, {offsetTop: 1});
        expect(instance.offsetTop).toEqual(1);
      });
    });

    describe("otherwise", function() {
      it("calculates container's padding-top and border-top-width and sets that as 'offsetTop'", function() {
        var setOffsetTopSpy = spyOn(PositionSticky, 'setOffsetTop');
        var instance = PositionSticky.create(element);

        instance.container.style.setProperty('padding', '20px');
        instance.container.style.setProperty('border', '10px solid black');

        setOffsetTopSpy.and.callThrough();
        instance.setOffsetTop();

        expect(instance.offsetTop).toEqual(30);

        instance.container.style.removeProperty('padding');
        instance.container.style.removeProperty('border');
      });
    });

  });

  describe("#setOffsetBottom", function() {
    it("sets container's padding-bottom and border-bottom-width as 'offsetBottom'", function() {
      var instance = PositionSticky.create(element);

      instance.container.style.setProperty('padding', '20px');
      instance.container.style.setProperty('border', '10px solid black');

      instance.setOffsetBottom();
      expect(instance.offsetBottom).toEqual(30);

      instance.container.style.removeProperty('padding');
      instance.container.style.removeProperty('border');
    });
  });

  describe("#calcThreshold", function() {

    it("returns #getElementDistanceFromDocumentTop - 'offsetTop'", function() {
      var instance = PositionSticky.create(element);

      spyOn(instance, 'getElementDistanceFromDocumentTop').and.returnValue(100);
      instance.offsetTop = 10;
      instance.calcThreshold();

      expect(instance.threshold).toEqual(90);
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

    it("assigns 'offsetTop' top element's top style property", function() {
      instance.offsetTop = 50;
      instance.makeFixed();
      expect(instance.element.style.getPropertyValue('top')).toEqual('50px');
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

    it("assigns 'offsetBottom' to sticky element's bottom css property", function() {
      instance.offsetBottom = 50;
      instance.makeAbsolute();
      expect(instance.element.style.getPropertyValue('bottom')).toEqual('50px');
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
    var instance, getAvailableSpaceInContainerSpy;

    beforeEach(function() {
      instance = PositionSticky.create(element);
      instance.element.style.setProperty('height', '100px');
      getAvailableSpaceInContainerSpy = spyOn(instance, 'getAvailableSpaceInContainer');
    });

    afterEach(function() {
      instance.element.style.removeProperty('height');
    });

    it("returns true when visible portion of container's content height is equal or bigger than element's height", function() {
      getAvailableSpaceInContainerSpy.and.returnValue(100);
      expect(instance.canStickyFitInContainer()).toBe(true);

      getAvailableSpaceInContainerSpy.and.returnValue(101);
      expect(instance.canStickyFitInContainer()).toBe(true);
    });

    it("returns false otherwise", function() {
      getAvailableSpaceInContainerSpy.and.returnValue(99);
      expect(instance.canStickyFitInContainer()).toBe(false);
    })
  });

  describe("#getAvailableSpaceInContainer", function() {
    it("calculates and returns available visible portion of the container's height", function() {
      var instance = PositionSticky.create(element);

      instance.offsetTop = 15;
      instance.offsetBottom = 15;
      spyOn(instance.container, 'getBoundingClientRect').and.returnValue({bottom: 100});

      expect(instance.getAvailableSpaceInContainer()).toEqual(70);
    });
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