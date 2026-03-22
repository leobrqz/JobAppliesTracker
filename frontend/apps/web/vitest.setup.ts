import "@testing-library/jest-dom/vitest"

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

// Radix Select (and related primitives) expect Pointer Capture APIs; jsdom omits them.
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = function () {
      return false
    }
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = function () {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = function () {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () {}
  }
}
