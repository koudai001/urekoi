import path from 'node:path'

function relativeTo(dir) {
  return (files) => files.map((f) => path.relative(dir, f))
}

export default {
  'apps/web/**/*.{js,jsx,ts,tsx}': (files) => {
    const rel = relativeTo('apps/web')(files)
    return [
      `pnpm --dir apps/web exec prettier --write ${rel.join(' ')}`,
      `pnpm --dir apps/web exec eslint --fix ${rel.join(' ')}`,
    ]
  },
  'apps/api/**/*.go': (files) => {
    return [`gofmt -l -w ${files.join(' ')}`]
  },
}
