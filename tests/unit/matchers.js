// Native isPlainObject check (no lodash dependency needed)
function isPlainObject (val) {
  if (val === null || typeof val !== 'object') return false;
  const proto = Object.getPrototypeOf(val);
  return proto === Object.prototype || proto === null;
}

export const customMatchers = {
  toBeAComponent (received) {
    // In Vue 3, compiled SFCs export component definitions that may have __vccOpts or be objects
    const isComponent = isPlainObject(received) &&
      (typeof received.render === 'function' || typeof received.setup === 'function' || received.__vccOpts);
    if (isComponent) {
      return {
        message: () => `expected ${this.utils.printReceived(received)} not to be a Vue component`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${this.utils.printReceived(received)} to be a valid Vue component`,
        pass: false,
      };
    }
  },
};
