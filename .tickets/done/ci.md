# Husky & GitHub Actions導入

## やること

- [x] prettier,eslint未導入なのでFEに追加
- [x] lint直す
- [x] Husky（pre-commit）: lint-staged経由でprettier/eslint（FE）、gofmt（BE）
- [x] GitHub Actions（PR時）: prettier --check / eslint / tsc --noEmit / vitest / next build（FE）、gofmt -check / go vet / golangci-lint / go test ./...（BE）
- [x] READMEに使用技術追加
