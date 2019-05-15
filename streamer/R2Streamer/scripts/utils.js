

// WARNING: iOS 9 requires ES5


// Notify native code that the page has loaded.
window.addEventListener("load", function(){ // on page load
    // Notify native code that the page is loaded.
    webkit.messageHandlers.didLoad.postMessage("");
    window.addEventListener("orientationchange", orientationChanged);
    orientationChanged();
}, false);

var last_known_scrollX_position = 0;
var last_known_scrollY_position = 0;
var ticking = false;
var maxScreenX = 0;

// Position in range [0 - 1].
var update = function(position) {
    var positionString = position.toString()
    webkit.messageHandlers.updateProgression.postMessage(positionString);
};

window.addEventListener('scroll', function(e) {
    last_known_scrollY_position = window.scrollY / document.body.scrollHeight;
    last_known_scrollX_position = window.scrollX / document.body.scrollWidth;
    if (!ticking) {
        window.requestAnimationFrame(function() {
            update(isScrollModeEnabled() ? last_known_scrollY_position : last_known_scrollX_position);
            ticking = false;
        });
    }
    ticking = true;
});

function orientationChanged() {
    maxScreenX = (window.orientation === 0 || window.orientation == 180) ? screen.width : screen.height;
    snapCurrentPosition();
}

function isScrollModeEnabled() {
    return document.documentElement.style.getPropertyValue("--USER__scroll").toString().trim() == 'readium-scroll-on';
}

// Scroll to the given TagId in document and snap.
var scrollToId = function(id) {
    var element = document.getElementById(id);
    var elementOffset = element.scrollLeft // element.getBoundingClientRect().left works for Gutenbergs books
    var offset = window.scrollX + elementOffset;

    document.body.scrollLeft = snapOffset(offset);
};

// Position must be in the range [0 - 1], 0-100%.
var scrollToPosition = function(position, dir) {
    console.log("ScrollToPosition");
    if ((position < 0) || (position > 1)) {
        console.log("InvalidPosition");
        return;
    }

    if (isScrollModeEnabled()) {
        var offset = document.body.scrollHeight * position;
        document.body.scrollTop = offset;
        // window.scrollTo(0, offset);
    } else {
        var offset = 0.0;
        if (dir == 'rtl') {
            offset = -document.body.scrollWidth * (1.0-position);
        } else {
            offset = document.body.scrollWidth * position;
        }
        document.body.scrollLeft = snapOffset(offset);
    }
};

// Returns false if the page is already at the left-most scroll offset.
function scrollLeft(dir) {
    var isRTL = (dir == "rtl");
    var documentWidth = document.body.scrollWidth;
    var pageWidth = window.innerWidth;
    var offset = window.scrollX - pageWidth;
    var minOffset = isRTL ? -(documentWidth - pageWidth) : 0;
    return scrollToOffset(Math.max(offset, minOffset));
}

// Returns false if the page is already at the right-most scroll offset.
function scrollRight(dir) {
    var isRTL = (dir == "rtl");
    var documentWidth = document.body.scrollWidth;
    var pageWidth = window.innerWidth;
    var offset = window.scrollX + pageWidth;
    var maxOffset = isRTL ? 0 : (documentWidth - pageWidth);
    return scrollToOffset(Math.min(offset, maxOffset));
}

// Scrolls to the given left offset.
// Returns false if the page scroll position is already close enough to the given offset.
function scrollToOffset(offset) {
    var currentOffset = window.scrollX;
    var pageWidth = window.innerWidth;
    document.body.scrollLeft = offset;
    // In some case the scrollX cannot reach the position respecting to innerWidth
    var diff = Math.abs(currentOffset - offset) / pageWidth;
    return (diff > 0.01);
}

// Snap the offset to the screen width (page width).
var snapOffset = function(offset) {
    var value = offset + 1;

    return value - (value % maxScreenX);
};

var snapCurrentPosition = function() {
    var currentOffset = window.scrollX;
    var currentOffsetSnapped = snapOffset(currentOffset + 1);
    
    document.body.scrollLeft = currentOffsetSnapped;
};

/// User Settings.

// For setting user setting.
var setProperty = function(key, value) {
    var root = document.documentElement;

    root.style.setProperty(key, value);
};

// For removing user setting.
var removeProperty = function(key) {
    var root = document.documentElement;

    root.style.removeProperty(key);
};
