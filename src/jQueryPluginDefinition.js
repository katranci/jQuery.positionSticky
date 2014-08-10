;(function($, PositionSticky) {

  'use strict';

  $.fn.positionSticky = function(options) {

    return this.each(function() {
      var $this = $(this);
      var data  = $this.data('positionSticky');

      if (!data) {
        $this.data('positionSticky', (data = PositionSticky.create(this, options)));
      }

      if (typeof options === 'string') {
        data[options]();
      }
    });

  };

})(jQuery, PositionSticky);
