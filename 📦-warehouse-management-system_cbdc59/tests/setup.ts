
// tests/setup.ts
import '@testing-library/jest-dom';
import util from 'util';
import { configure } from '@testing-library/react';

// Polyfill TextEncoder/TextDecoder for Node environments
global.TextEncoder = util.TextEncoder;
(global as any).TextDecoder = util.TextDecoder;

// Configure Testing Library with best practices
configure({
    testIdAttribute: 'data-testid',
    getElementError: (message: string | null, container?: Element): Error => 
        new Error(message || ''),
    asyncUtilTimeout: 1000,
    computedStyleSupportsPseudoElements: true,
    defaultHidden: true,  // Only consider visible elements by default
    // Support for event and async wrappers
    eventWrapper: (cb: () => void): void => {
        cb();
    },
    asyncWrapper: async (cb: () => Promise<void>): Promise<void> => {
        await cb();
    }
});
