import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { e2eHandlers } from './e2e-handlers';

const activeHandlers = process.env.APP_ENV === 'test' ? e2eHandlers : handlers; // APP_ENV === 'test' only for e2e tests
export const server = setupServer(...activeHandlers);