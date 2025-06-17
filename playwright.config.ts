import { defineConfig, devices } from '@playwright/test';

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
    // In CI build a production bundle, then start Next.js in production mode.
    // Locally we still use the fast dev server.
    command: process.env.CI
      ? 'npm run build && next start -p ' + PORT
      : 'npm run dev:next',
    url: baseURL,
    timeout: 2 * 60 * 1000,
    reuseExistingServer: !process.env.CI,
  },
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
