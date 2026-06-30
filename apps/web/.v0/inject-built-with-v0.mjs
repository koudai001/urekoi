// Build-step helper expected by the deploy pipeline:
//   node .v0/inject-built-with-v0.mjs && next build
//
// The pipeline runs this before `next build`. If it is missing the whole
// build command fails with ERR_MODULE_NOT_FOUND. Keep it as a safe no-op so
// the build always proceeds; extend later if a real injection step is needed.

try {
  // Intentionally a no-op. Place any pre-build injection logic here.
} catch (error) {
  // Never fail the build because of this optional helper.
  console.warn('[v0] inject-built-with-v0 skipped:', error?.message ?? error)
}

process.exit(0)
