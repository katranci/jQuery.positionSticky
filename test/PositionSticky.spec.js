describe("PositionSticky", function() {

  describe("#init", function() {

    it("sets the element as the element property", function() {
      var instance = PositionStickyFactory.create();
      var element = document.getElementById('element');
      expect(instance.element).toBe(element);
    });

    it("sets the sticky element's parent as the container property", function() {
      var instance = PositionStickyFactory.create();
      var container = document.getElementById('container');
      expect(instance.container).toBe(container);
    });

    it("validates container's positioning scheme", function() {
      spyOn(PositionSticky, 'validateContainerPosScheme');
      var instance = PositionStickyFactory.create();
      expect(instance.validateContainerPosScheme).toHaveBeenCalled();
    });

    it("calls #setOffsetTop", function() {
      spyOn(PositionSticky, 'setOffsetTop');
      var instance = PositionStickyFactory.create();
      expect(instance.setOffsetTop).toHaveBeenCalled();
    });

    it("calls #setOffsetBottom", function() {
      spyOn(PositionSticky, 'setOffsetBottom');
      var instance = PositionStickyFactory.create();
      expect(instance.setOffsetBottom).toHaveBeenCalled();
    });

    it("calls #calcThreshold", function() {
      spyOn(PositionSticky, 'calcThreshold');
      var instance = PositionStickyFactory.create();
      expect(instance.calcThreshold).toHaveBeenCalled();
    });

    it("calls #setElementWidth", function() {
      spyOn(PositionSticky, 'setElementWidth');
      var instance = PositionStickyFactory.create();
      expect(instance.setElementWidth).toHaveBeenCalled();
    });

    it("calls #setBoundingBoxHeight", function() {
      spyOn(PositionSticky, 'setBoundingBoxHeight');
      var instance = PositionStickyFactory.create();
      expect(instance.setBoundingBoxHeight).toHaveBeenCalled();
    });

    it("calls #createPlaceholder", function() {
      spyOn(PositionSticky, 'createPlaceholder');
      var instance = PositionStickyFactory.create();
      expect(instance.createPlaceholder).toHaveBeenCalled();
    });

    it("calls #subscribeToWindowScroll", function() {
      spyOn(PositionSticky, 'subscribeToWindowScroll');
      var instance = PositionStickyFactory.create();
      expect(instance.subscribeToWindowScroll).toHaveBeenCalled();
    });

  });

  describe("#validateContainerPosScheme", function() {

    describe("when container's positioning scheme is not either relative or absolute", function() {

      it("sets container's position to relative", function() {
        var container = document.getElementById('container');
        var mock = { container: container };
        var validateContainerPosScheme = PositionSticky.validateContainerPosScheme.bind(mock);

        validateContainerPosScheme();

        expect(container.style.position).toEqual('relative');
      });

    });

    describe("otherwise", function() {

      it("doesn't change container's positioning scheme", function() {
        var container = document.getElementById('container');
        container.style.position = 'absolute';
        var mock = { container: container };
        var validateContainerPosScheme = PositionSticky.validateContainerPosScheme.bind(mock);

        validateContainerPosScheme();

        expect(container.style.position).toEqual('absolute');
      });

    });

  });

  describe("#setOffsetTop", function() {

    describe("when offsetTop is given in options and it is zero or a positive integer", function() {
      it("assigns that to 'offsetTop'", function() {
        var instance;

        instance = PositionStickyFactory.create(null, {offsetTop: 0});
        expect(instance.offsetTop).toEqual(0);

        instance = PositionStickyFactory.create(null, {offsetTop: 1});
        expect(instance.offsetTop).toEqual(1);
      });
    });

    describe("otherwise", function() {
      it("calculates container's padding-top and border-top-width and sets that as 'offsetTop'", function() {
        var setOffsetTopSpy = spyOn(PositionSticky, 'setOffsetTop');
        var instance = PositionStickyFactory.create();

        instance.container.style.padding = '20px';
        instance.container.style.border = '10px solid black';

        setOffsetTopSpy.and.callThrough();
        instance.setOffsetTop();

        expect(instance.offsetTop).toEqual(30);
      });
    });

  });

  describe("#setOffsetBottom", function() {
    it("sets container's padding-bottom and border-bottom-width as 'offsetBottom'", function() {
      var instance = PositionStickyFactory.create();

      instance.container.style.padding = '20px';
      instance.container.style.border = '10px solid black';

      instance.setOffsetBottom();
      expect(instance.offsetBottom).toEqual(30);
    });
  });

  describe("#calcThreshold", function() {

    it("returns #getElementDistanceFromDocumentTop - 'offsetTop'", function() {
      var instance = PositionStickyFactory.create();

      spyOn(instance, 'getElementDistanceFromDocumentTop').and.returnValue(100);
      instance.offsetTop = 10;
      instance.calcThreshold();

      expect(instance.threshold).toEqual(90);
    });

  });

  describe("#setElementWidth", function() {
    it("calculates element's computed width and applies it as inline style", function() {
      var spy = spyOn(PositionSticky, 'setElementWidth');
      var instance = PositionStickyFactory.create();

      instance.container.style.width = '1000px';
      instance.element.style.padding = '25px';
      instance.element.style.border = '25px solid black';

      spy.and.callThrough();
      instance.setElementWidth();

      expect(instance.element.style.width).toEqual('900px');
    });
  });

  describe("#setBoundingBoxHeight", function() {
    it("calculates element's bounding box height and sets it to 'boundingBoxHeight'", function() {
      var instance = PositionStickyFactory.create();

      var child = document.createElement('DIV');
      child.style.height = '500px';
      instance.element.appendChild(child);

      instance.element.style.overflow = 'scroll';
      instance.element.style.height = '100px';
      instance.element.style.padding = '10px';
      instance.element.style.border = '10px solid black';

      instance.setBoundingBoxHeight();
      expect(instance.boundingBoxHeight).toEqual(140);
    });

    it("updates placeholder height when 'updatePlaceholder' parameter is set to true", function() {
      var instance = PositionStickyFactory.create();
      instance.element.style.height = '100px';
      instance.setBoundingBoxHeight(true);
      expect(instance.placeholder.style.height).toEqual('100px');
    });
  });

  describe("#createPlaceholder", function() {

    var instance, createPlaceholderSpy;

    beforeEach(function() {
      createPlaceholderSpy = spyOn(PositionSticky, 'createPlaceholder');
    });

    it("creates a hidden div with the same box model properties as the sticky element and inserts it just before the sticky element", function() {
      spyOn(PositionSticky, 'setElementWidth');

      instance = PositionStickyFactory.create();
      instance.container.style.width = '100px';
      instance.boundingBoxHeight = 200;
      instance.element.style.margin = '10px';

      createPlaceholderSpy.and.callThrough();
      instance.createPlaceholder();

      expect(instance.element.previousElementSibling).toBe(instance.placeholder);
      expect(instance.placeholder.style.display).toEqual('none');
      expect(instance.placeholder.style.width).toEqual('80px');
      expect(instance.placeholder.style.height).toEqual('200px');
      expect(instance.placeholder.style.margin).toEqual('10px');
    });

    it("applies sticky element's floating to the placeholder", function() {
      instance = PositionStickyFactory.create();
      instance.element.style.float = 'left';

      createPlaceholderSpy.and.callThrough();
      instance.createPlaceholder();

      expect(instance.placeholder.style.float).toEqual('left');
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
      instance = PositionStickyFactory.create();
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
      instance = PositionStickyFactory.create();
    });

    it("sets sticky element's position to 'static'", function() {
      instance.makeStatic();
      expect(instance.element.style.position).toEqual('static');
    });

    it("hides placeholder", function() {
      instance.placeholder.style.display = 'block';
      instance.makeStatic();
      expect(instance.placeholder.style.display).toEqual('none');
    });

    it("updates posScheme to PositionSticky.POS_SCHEME_STATIC", function() {
      instance.makeStatic();
      expect(instance.posScheme).toBe(PositionSticky.POS_SCHEME_STATIC);
    });

  });

  describe("#isFixed", function() {

    var instance;

    beforeEach(function() {
      instance = PositionStickyFactory.create();
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
      instance = PositionStickyFactory.create();
    });

    it("removes bottom property in case sticky element had absolute positioning before", function() {
      instance.element.style.bottom = '0px';
      instance.makeFixed();
      expect(instance.element.style.bottom).toEqual('');
    });

    it("sets sticky element's position to 'fixed'", function() {
      instance.makeFixed();
      expect(instance.element.style.position).toEqual('fixed');
    });

    it("assigns 'offsetTop' top element's top style property", function() {
      instance.offsetTop = 50;
      instance.makeFixed();
      expect(instance.element.style.top).toEqual('50px');
    });

    it("shows placeholder", function() {
      instance.placeholder.style.display = 'none';
      instance.makeFixed();
      expect(instance.placeholder.style.display).toEqual('block');
    });

    it("updates posScheme to PositionSticky.POS_SCHEME_FIXED", function() {
      instance.makeFixed();
      expect(instance.posScheme).toBe(PositionSticky.POS_SCHEME_FIXED);
    });

  });

  describe("#isAbsolute", function() {

    var instance;

    beforeEach(function() {
      instance = PositionStickyFactory.create();
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
      instance = PositionStickyFactory.create();
    });

    it("removes top property in case sticky element had fixed positioning before", function() {
      instance.element.style.top = '0px';
      instance.makeAbsolute();
      expect(instance.element.style.top).toEqual('');
    });

    it("sets sticky element's position to 'absolute'", function() {
      instance.makeAbsolute();
      expect(instance.element.style.position).toEqual('absolute');
    });

    it("assigns 'offsetBottom' to sticky element's bottom css property", function() {
      instance.offsetBottom = 50;
      instance.makeAbsolute();
      expect(instance.element.style.bottom).toEqual('50px');
    });

    it("shows placeholder", function() {
      instance.placeholder.style.display = 'none';
      instance.makeAbsolute();
      expect(instance.placeholder.style.display).toEqual('block');
    });

    it("updates posScheme to PositionSticky.POS_SCHEME_ABSOLUTE", function() {
      instance.makeAbsolute();
      expect(instance.posScheme).toBe(PositionSticky.POS_SCHEME_ABSOLUTE);
    });

  });

  describe("#update", function() {

    var instance;

    beforeEach(function() {
      instance = PositionStickyFactory.create();
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

    var instance;

    beforeEach(function() {
      instance = PositionStickyFactory.create();
      instance.threshold = 100;
    });

    it("returns true when latestKnownScrollY is smaller than the threshold", function() {
      instance.latestKnownScrollY = 99;
      expect(instance.isBelowThreshold()).toBe(true);
    });

    it("returns false otherwise", function() {
      instance.latestKnownScrollY = 100;
      expect(instance.isBelowThreshold()).toBe(false);

      instance.latestKnownScrollY = 101;
      expect(instance.isBelowThreshold()).toBe(false);
    });
  });

  describe("#canStickyFitInContainer", function() {
    var instance, getAvailableSpaceInContainerSpy;

    beforeEach(function() {
      instance = PositionStickyFactory.create();
      instance.boundingBoxHeight = 100;
      getAvailableSpaceInContainerSpy = spyOn(instance, 'getAvailableSpaceInContainer');
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
      var instance = PositionStickyFactory.create();

      instance.offsetTop = 15;
      instance.offsetBottom = 15;
      spyOn(instance.container, 'getBoundingClientRect').and.returnValue({bottom: 100});

      expect(instance.getAvailableSpaceInContainer()).toEqual(70);
    });
  });

  describe("#getElementDistanceFromDocumentTop", function() {

    it("returns total offsetTop", function() {
      var instance = PositionStickyFactory.create();

      instance.window.scrollTo(0, 100);

      instance.container.ownerDocument.body.style.marginTop = '100px';
      instance.container.ownerDocument.body.style.borderTop = '10px solid black';
      instance.container.ownerDocument.body.style.paddingTop = '100px';
      instance.container.style.marginTop = '100px';
      instance.container.style.borderTop = '10px solid black';
      instance.container.style.paddingTop = '100px';
      instance.element.style.marginTop = '100px';

      expect(instance.getElementDistanceFromDocumentTop()).toEqual(520);

      instance.container.ownerDocument.body.style.marginTop = null;
      instance.container.ownerDocument.body.style.borderTop = null;
      instance.container.ownerDocument.body.style.paddingTop = null;
    });

    it("uses placeholder in calculations when the element is not static", function() {
      var instance = PositionStickyFactory.create();

      instance.latestKnownScrollY = 0;
      instance.placeholder.style.marginTop = '123px';
      instance.makeFixed();

      expect(instance.getElementDistanceFromDocumentTop()).toEqual(123);
    });

  });

  describe("#refresh", function() {
    it("re-measures necessary positions/dimensions", function() {
      var instance = PositionStickyFactory.create();

      spyOn(instance, 'calcThreshold');
      spyOn(instance, 'setBoundingBoxHeight');

      instance.refresh();

      expect(instance.calcThreshold).toHaveBeenCalled();
      expect(instance.setBoundingBoxHeight).toHaveBeenCalledWith(true);
    });
  });

});