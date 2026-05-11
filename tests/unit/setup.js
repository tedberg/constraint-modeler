import { mount, shallowMount } from '@vue/test-utils';
import { customMatchers } from './matchers.js';
import { expect } from 'vitest';

expect.extend(customMatchers);

// Make mount/shallowMount available globally (used in some specs)
global.mount = mount;
global.shallowMount = shallowMount;

// createComponentMocks helper (simplified — createLocalVue is gone in VTU v2)
global.createComponentMocks = ({ mocks = {}, stubs = {} } = {}) => {
  return {
    global: {
      mocks,
      stubs,
    },
  };
};
