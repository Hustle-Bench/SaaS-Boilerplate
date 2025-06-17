import { defineConfig, devices } from '@playwright/test';

// ---------------------------------------------------------------------------
// Inject **dummy** Clerk environment variables when they are missing.
// This prevents the Zod validation in `src/libs/Env.ts` from crashing the
// Playwright dev‑server while still letting real keys override in local runs.
// ---------------------------------------------------------------------------
['CLERK_SECRET_KEY', 'CLERK_API_KEY', 'CLERK_PUBLISHABLE_KEY'].forEach((k) => {
  if (!process.env[k] || process.env[k]?.length === 0) {
    process.env[k] = 'dummy';
  }
});

// Fallback to PORT=3000 when not provided by CI
const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  testMatch: '*.@(spec|e2e).?(c|m)[jt]s?(x)',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  expect: {
    timeout: 10 * 1000,
  },
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev:next',
    url: baseURL,
    timeout: 2 * 60 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL,
    trace: process.env.CI ? 'retain-on-failure' : undefined,
    video: process.env.CI ? 'retain-on-failure' : undefined,
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/, teardown: 'teardown' },
    { name: 'teardown', testMatch: /.*\.teardown\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    ...(process.env.CI
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            dependencies: ['setup'],
          },
        ]
      : []),
  ],
});
