# npm-library-setup Specification

## Purpose
TBD - created by archiving change setup-npm-library. Update Purpose after archive.
## Requirements
### Requirement: Package Metadata

Package metadata MUST include author, repository, homepage, bug tracker, license, and semantic versioning.

#### Scenario: Complete package.json
Given a TypeScript type guard library,  
When packaged for npm distribution,  
Then `package.json` MUST contain:
- `name`: valid npm package name (scoped or public)
- `version`: semantic version string (e.g., `1.0.0`)
- `description`: clear library purpose
- `author`: package author name or object
- `license`: SPDX identifier (e.g., `MIT`)
- `repository`: GitHub/git URL
- `homepage`: project documentation URL
- `bugs`: issue tracker URL
- `engines.node`: minimum Node.js version (e.g., `>=14.0.0`)
- `keywords`: array of searchable terms

---

### Requirement: Dual Module Export

Package MUST export both ES modules (ESM) and CommonJS (CJS) from a single TypeScript source, with TypeScript type definitions resolved to the ESM variant.

#### Scenario: Conditional exports via package.json
Given source code in `src/index.ts`,  
When package is built,  
Then `package.json` exports field MUST define:
```json
"exports": {
  ".": {
    "types": "./dist/esm/index.d.ts",
    "import": "./dist/esm/index.js",
    "require": "./dist/cjs/index.js"
  }
}
```

#### Scenario: ESM distribution
Given `npm run build:esm` is executed,  
When TypeScript compiles with `--module esnext --target esnext`,  
Then output MUST produce:
- `dist/esm/index.js` (ES module syntax: import/export)
- `dist/esm/index.d.ts` (TypeScript definitions)
- `dist/esm/index.d.ts.map` (source maps for types)

#### Scenario: CommonJS distribution
Given `npm run build:cjs` is executed,  
When TypeScript compiles with `--module commonjs --target es2015`,  
Then output MUST produce:
- `dist/cjs/index.js` (CommonJS syntax: require/module.exports)
- No separate type definitions (reused from ESM)

---

### Requirement: Universal Environment Support

Type guard implementations MUST work in both Node.js and DOM (browser) environments without bundling or environment-specific variants.

#### Scenario: TypeScript lib configuration
Given a TypeScript project,  
When `tsconfig.json` is configured,  
Then `compilerOptions.lib` MUST include both:
- `"ES2020"` (for modern JavaScript features)
- `"DOM"` (for browser APIs like `window`, `document`)

#### Scenario: Environment detection guards
Given the type guard library,  
When consumer calls `isNode()` or `isDOM()`,  
Then it MUST:
- `isNode()`: return `true` if `process.versions.node` is defined, `false` otherwise
- `isDOM()`: return `true` if `window` and `document` are defined, `false` otherwise

#### Scenario: Cross-platform import
Given ESM code running in Node.js,  
When importing from the library: `import { isString, isNode } from 'typescript-guard'`,  
---

### Requirement: Build System

Package MUST include npm scripts to build, clean, and prepare distributions.

#### Scenario: Build commands
Given the source code in `src/`,  
When `npm run build` is executed,  
Then it MUST:
1. Run `npm run clean` first
2. Run both `npm run build:esm` and `npm run build:cjs` sequentially
3. Complete without errors
4. Produce both `dist/esm/` and `dist/cjs/` directories

#### Scenario: Type checking
Given TypeScript source files,  
When `npm run lint` is executed,  
Then TypeScript compiler MUST run with `--noEmit` flag and report any:
- Type errors
- Missing type annotations
- Unused variables/imports

---

### Requirement: Type Definitions

All exported functions and utilities MUST have complete TypeScript type definitions with proper generic support and JSDoc documentation.

#### Scenario: Guard function signatures
Given type guard functions in the library,  
When TypeScript definitions are generated,  
Then each guard MUST have:
- Clear input type: `(value: unknown) => value is <TargetType>`
- JSDoc comments describing behavior
- Examples in comments where applicable

#### Scenario: Generic type guards
Given advanced guards like `isArray<T>` and `isRecord<T>`,  
When used in TypeScript code,  
Then generic type parameters MUST be properly inferred or explicitly specified:
```typescript
isArray<number>(value)  // value is number[] if true
isRecord<User>(obj, ['name', 'id'])  // obj is User if true
```

---

### Requirement: Package Distribution

Package MUST be properly configured for npm distribution with correct file inclusion and exclusion.

#### Scenario: npm pack contents
Given the repository with `package.json`, `.npmignore`, and `dist/`,  
When `npm pack` is run,  
Then the tarball MUST contain only:
- `dist/` directory (compiled output)
- `package.json`
- `README.md`
- `LICENSE`
- No source files (`src/`), build config, or git files

#### Scenario: Files field
Given the distributed package,  
When installed via `npm install`,  
Then only files listed in `package.json` "files" field MUST be extracted:
```json
"files": ["dist", "README.md", "LICENSE"]
```

---

### Requirement: npm Registry Publishing

Package MUST be publishable to npm registry with proper authentication and metadata.

#### Scenario: Dry-run publication
Given built distributions and valid `package.json`,  
When `npm publish --dry-run` is executed,  
Then it MUST:
- Validate package structure
- Check all required files are present
- Report no errors or warnings
- Not actually publish

#### Scenario: Live publication
Given `npm login` has been run with valid credentials,  
When `npm publish` is executed,  
Then the package MUST:
- Upload to npm registry
- Be accessible via `npm info <package-name>`
- Be installable via `npm install <package-name>`
- Show correct version and metadata

---

### Requirement: Documentation

README MUST provide complete usage guide, API reference, and publishing instructions.

#### Scenario: Usage examples
Given consumers installing the library,  
When they read README.md,  
Then it MUST contain:
- Installation instructions
- Basic usage examples (isString, isNumber, etc.)
- Advanced usage examples (isRecord, isOneOf, isEnum)
- Environment detection examples
- Both ESM and CommonJS import syntax

#### Scenario: Publishing guide
Given a developer wanting to update and republish the library,  
When they read README.md,  
Then it MUST document:
- `npm login` process
- Version management (`npm version patch|minor|major`)
- `npm publish` command
- Verification via `npm info`
- Scoped vs public package naming

---

### Requirement: GitHub Actions CI/CD Workflows

Automated build validation and npm publishing MUST be performed via GitHub Actions workflows.

#### Scenario: PR validation workflow
Given pull requests and pushes to main branch,  
When GitHub Actions triggers the validation workflow,  
Then it MUST run `npm run lint` and fail if there are TypeScript errors, run `npm run build` and verify both ESM and CJS outputs exist, verify `dist/esm/index.d.ts` type definitions are valid, run `npm pack` and verify tarball contents, and complete without publishing to npm.

#### Scenario: Release publishing workflow
Given a git tag is pushed (e.g., `git tag v1.0.0 && git push --tags`),  
When GitHub Actions triggers the release workflow,  
Then it MUST checkout code at the tag, install Node.js 18+, run lint and build validation, authenticate to npm using `NPM_TOKEN` secret, run `npm publish` with provided credentials, create GitHub release with version and changelog, and verify package is accessible on npm registry.

#### Scenario: Manual dispatch workflow
Given a developer manually triggers the workflow via GitHub UI,  
When the manual dispatch workflow runs,  
Then it MUST:
- Accept optional version/tag input parameter
- Perform same validation as PR workflow
- Authenticate and publish to npm
- Support hotfixes and emergency releases without tag creation

#### Scenario: Secret configuration
Given the ne accept optional version/tag input parameter, perform same validation as PR workflow, authenticate and publish to npm, and support hotfixes and emergency releases without tag creation.
- Fail safely if token is missing or invalid
- Support both scoped and unscoped packages

---

