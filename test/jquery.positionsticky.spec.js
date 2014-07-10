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

    xit("attaches #update to the Window.onscroll event", function() {

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

    it("updates posScheme to PositionSticky.POS_SCHEME_FIXED", function() {
      instance.makeFixed();
      expect(instance.posScheme).toBe(PositionSticky.POS_SCHEME_FIXED);
    });

  });

  describe("#update", function() {

    var instance;

    beforeEach(function() {
      instance = PositionSticky.create(element);
    });

    describe("when container is below the viewport", function() {

      beforeEach(function() {
        spyOn(instance, 'isContainerBelowViewport').and.returnValue(true);
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
        spyOn(instance, 'isContainerBelowViewport').and.returnValue(false);
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
        spyOn(instance, 'isContainerBelowViewport').and.returnValue(false);
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

  describe("#isContainerBelowViewport", function() {

    var instance;

    beforeEach(function() {
      instance = PositionSticky.create(element);
    });

    it("returns true when container.getBoundingClientRect().top is equal or bigger than zero", function() {
      var containerSpy = spyOn(instance.container, 'getBoundingClientRect');

      containerSpy.and.returnValue({top: 0});
      expect(instance.isContainerBelowViewport()).toBe(true);

      containerSpy.and.returnValue({top: 1});
      expect(instance.isContainerBelowViewport()).toBe(true);
    });

    it("returns false otherwise", function() {
      spyOn(instance.container, 'getBoundingClientRect').and.returnValue({top: -1});
      expect(instance.isContainerBelowViewport()).toBe(false);
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

});