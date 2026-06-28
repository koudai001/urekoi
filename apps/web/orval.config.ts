import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: '../../docs/openapi.yaml',
    output: {
      mode: 'tags-split',
      target: './generated',
      client: 'fetch',
      override: {
        mutator: {
          path: './lib/api/custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
})
