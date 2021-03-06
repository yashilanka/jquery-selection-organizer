(function(factory) {
  if(typeof module === "object" && typeof module.exports === "object") {
    factory(require("jquery"));
  } else {
    factory(jQuery);
  }
}(function($) {
  "use strict";

  var DATA_FIELD_NAME = "data-selection-organizer-selected";
  var EVENT_NAME_SPACE = ".selection-organizer";
  var DEFAULT_SETTINGS = {
    selector: ".selection-organizer-child",
    classSelected: "selection-organizer-selected",
    showAnimation: true,
    animationProperties: {
      opacity: "toggle"
    },
    animationDuration: 300,
    sendToEnd: false,
    callback: function(target) {}
  };

  $.fn.selectionOrganizer = function(options) {
    var settings = this.settings = $.extend({}, DEFAULT_SETTINGS, options);

    return this.each(function(index, element) {
      var $container = $(element);

      // initialize
      addClickEventHandlers();

      function clickEventHandler(event) {
        removeClickEventHandlers();

        var $this = $(this);
        var hasRepositioned = false;

        // toggle data field value
        $this.attr(DATA_FIELD_NAME, ($this.attr(DATA_FIELD_NAME) == "true" ? false : true));

        // update list of selected children
        var $selectedChildrenList = $container.find("["+DATA_FIELD_NAME+"=true"+"]");
        var numSelectedChildren = $selectedChildrenList.length;
        var lastSelectedChild = getChildAtTail($selectedChildrenList, numSelectedChildren);

        // reposition clicked child based on case
        if($this.attr(DATA_FIELD_NAME) == "true") {
          // change since the current lastSelectedChild is the one we just clicked
          numSelectedChildren = numSelectedChildren - 1;
          lastSelectedChild = getChildAtTail($selectedChildrenList, numSelectedChildren);

          if(numSelectedChildren > 0) {
            if(!settings.sendToEnd) {
              // append to end of list of selected children
              if(!($this.prev().is(lastSelectedChild))) {
                repositionChild($this, "insertAfter", lastSelectedChild, addClickEventHandlers);
                hasRepositioned = true;
              }
            }
            else {
              // append to start of list of selected children
              if(!($this.next().is(lastSelectedChild))) {
                repositionChild($this, "insertBefore", lastSelectedChild, addClickEventHandlers);
                hasRepositioned = true;
              }
            }
          }
          // bring to front of whole list
          else {
            var $currentAllChildren = getCurrentOrderOfAllChildren();
            if(!settings.sendToEnd) {
              // only detach and bring to front if it wasn't originally in front
              var $firstChildInContainer = $currentAllChildren[0];
              if(!($this.is($firstChildInContainer))) {
                repositionChild($this, "prependTo", $container, addClickEventHandlers);
                hasRepositioned = true;
              }
            }
            else {
              // only detach and bring to end if it wasn't originally in end
              var $lastChildInContainer = $currentAllChildren[$currentAllChildren.length-1];
              if(!($this.is($lastChildInContainer))) {
                repositionChild($this, "appendTo", $container, addClickEventHandlers);
                hasRepositioned = true;
              }
            }
          }
        }
        else {
          // remove from list of selected children
          if(numSelectedChildren > 0) {
            if(!settings.sendToEnd) {
              // only detach if it wasn't already at end of list of selected children
              if(!($this.prev().is(lastSelectedChild))) {
                repositionChild($this, "insertAfter", lastSelectedChild, addClickEventHandlers);
                hasRepositioned = true;
              }
            }
            else {
              // only detach if it wasn't already at first of list of selected children
              if(!($this.next().is(lastSelectedChild))) {
                repositionChild($this, "insertBefore", lastSelectedChild, addClickEventHandlers);
                hasRepositioned = true;
              }
            }
          }
        }

        if(!hasAnimation() || (hasAnimation() && !hasRepositioned)) {
          $this.toggleClass(settings.classSelected);
          addClickEventHandlers();
          settings.callback($this);
        }
      }

      function repositionChild($el, behavior, target, cb) {
        if(hasAnimation()) {
          var animationProperties = getAnimationProperties();
          $el.animate(animationProperties.start, settings.animationDuration, function() {
            $el.toggleClass(settings.classSelected)
                .detach()[behavior](target)
                .animate(animationProperties.finish, settings.animationDuration, function () {
                  cb();
                  settings.callback($el);
                });
          });
        }
        else {
          $el.detach()[behavior](target);
        }

        return $el;
      }

      function hasAnimation() {
        if(!settings.showAnimation || $.isEmptyObject(settings.animationProperties)) {
          return false;
        }

        return true;
      }

      function getAnimationProperties() {
        if(settings.animationProperties.start && settings.animationProperties.finish) {
          return {start: settings.animationProperties.start, finish: settings.animationProperties.finish};
        }

        if(!settings.animationProperties.start && !settings.animationProperties.finish) {
          return {start: settings.animationProperties, finish: settings.animationProperties};
        }

        return {start: settings.animationProperties.start || DEFAULT_SETTINGS.animationProperties, finish: settings.animationProperties.finish || DEFAULT_SETTINGS.animationProperties};
      }

      function getChildAtTail(childrenList, numChildren) {
        if(settings.sendToEnd) {
          return childrenList[childrenList.length - numChildren] || null;
        }
        return childrenList[numChildren-1] || null;
      }

      function getCurrentOrderOfAllChildren() {
        return $container.children(settings.selector);
      }

      function removeClickEventHandlers() {
        $container.off("click"+EVENT_NAME_SPACE);
      }

      function addClickEventHandlers() {
        $container.on("click"+EVENT_NAME_SPACE, settings.selector, clickEventHandler);
      }
    });
  };
}));
