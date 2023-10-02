<!-- markdownlint-disable -->
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Update `api/slack` to use `@shgysk8zer0/netlify-func-utils`, `@shgysk8zer0/http`, & `@shgysk8zer0/consts`

### Removed
- Remove own copy of non-function modules

### Fixed
- Fixed GitHub link in footer

## [v2.1.0] - 2023-09-19

### Changed
- Install & use `@shgysk8zer0/slack` for messages

### Fixed
- Update functions (`/api/`) to use ESModules instead of CommonJS

## [v2.0.1] - 2023-07-05

### Changed
- Update dependencies and config

## [v2.0.0] - 2023-05-16

### Added
- Trusted Types support
- Import map

### Changed
- Switch from KRV CDN to unpkg for scripts/components

## [v1.1.3] - 2023-03-08

### Changed
- Update to node 18.13.0
- Update to netlify-js-app v2.1.1
- Submissions must now be JSON

### Added
- Support & enforce `TrustedTypes`

### Fixed
- `npm run version:bump:major` now correctly creates a new major version

### Removed
- Remove lamdba-multipart

## [v1.1.1] - 2021-02-13

### Added
- Validation and signature to submitted contact from
- Disable form fields on submit, and re-enable when complete

### Changed
- Form now requires JS
- Hide and disable form elements (with `<noscript>` message) until JS executes
- Messages now handled by POST

## [v1.1.0] - 2021-02-12

### Changed
- Use Netlify Function to submit form submissions to Slack

## [v1.0.0] - 2020-12-22

### Added
- Contact from as `share_target` with `autocomplete`
- Implement Google Analytics

### Changed
- Customized various config and skeleton from template
