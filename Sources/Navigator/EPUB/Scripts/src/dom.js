//
//  Copyright 2022 Readium Foundation. All rights reserved.
//  Use of this source code is governed by the BSD-style license
//  available in the top-level LICENSE file of the project.
//

import { isScrollModeEnabled } from "./utils";
import { getCssSelector } from "css-selector-generator";

// Returns `element` or its first parent that is considered "user interactive".
// For example a link, a video clip or a text field.
//
// See. https://github.com/JayPanoz/architecture/tree/touch-handling/misc/touch-handling
export function findNearestInteractiveElement(element) {
  if (element == null) {
    return null;
  }

  var interactiveTags = [
    "a",
    "audio",
    "button",
    "canvas",
    "details",
    "input",
    "label",
    "option",
    "select",
    "submit",
    "textarea",
    "video",
  ];
  if (interactiveTags.indexOf(element.nodeName.toLowerCase()) !== -1) {
    return element.outerHTML;
  }

  // Checks whether the element is editable by the user.
  if (
    element.hasAttribute("contenteditable") &&
    element.getAttribute("contenteditable").toLowerCase() != "false"
  ) {
    return element.outerHTML;
  }

  // Checks parents recursively because the touch might be for example on an <em> inside a <a>.
  if (element.parentElement) {
    return findNearestInteractiveElement(element.parentElement);
  }

  return null;
}

/// Returns the `Locator` object to the first block element that is visible on
/// the screen.
export function findFirstVisibleLocator() {
  const element = findElement(document.body);
  if (!element) {
    return undefined;
  }

  return {
    href: "#",
    type: "application/xhtml+xml",
    locations: {
      cssSelector: getCssSelector(element),
    },
    text: {
      highlight: element.textContent,
    },
  };
}

function findElement(rootElement) {
  var foundElement = undefined;
  for (var i = rootElement.children.length - 1; i >= 0; i--) {
    const child = rootElement.children[i];
    const position = elementRelativePosition(child, undefined);
    if (position == 0) {
      if (!shouldIgnoreElement(child)) {
        foundElement = child;
      }
    } else if (position < 0) {
      if (!foundElement) {
        foundElement = child;
      }
      break;
    }
  }

  if (foundElement) {
    return findElement(foundElement);
  }
  return rootElement;
}

// See computeVisibility_() in r2-navigator-js
function elementRelativePosition(element, domRect /* nullable */) {
  if (readium.isFixedLayout) return true;

  if (element === document.body || element === document.documentElement) {
    return -1;
  }
  if (!document || !document.documentElement || !document.body) {
    return 1;
  }

  const rect = domRect || element.getBoundingClientRect();

  if (isScrollModeEnabled()) {
    return rect.top >= 0 && rect.top <= document.documentElement.clientHeight;
  } else {
    const pageWidth = window.innerWidth;
    if (rect.left >= pageWidth) {
      return 1;
    } else if (rect.left >= 0) {
      return 0;
    } else {
      return -1;
    }
  }
}

function shouldIgnoreElement(element) {
  const elStyle = getComputedStyle(element);
  if (elStyle) {
    const display = elStyle.getPropertyValue("display");
    if (display === "none") {
      return true;
    }
    // Cannot be relied upon, because web browser engine reports invisible when out of view in
    // scrolled columns!
    // const visibility = elStyle.getPropertyValue("visibility");
    // if (visibility === "hidden") {
    //     return false;
    // }
    const opacity = elStyle.getPropertyValue("opacity");
    if (opacity === "0") {
      return true;
    }
  }

  return false;
}
