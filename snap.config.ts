import type { SnapConfig } from '@metamask/snaps-cli'

const config: SnapConfig = {
  bundler: 'webpack',
  input: './src/index.tsx',
  server: {
    port: 8080,
  },
  polyfills: true,
}

export default config
