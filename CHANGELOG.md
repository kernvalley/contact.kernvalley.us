<!-- markdownlint-disable -->
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.1.3] - 2023-03-08

### Changed
- Update to node 18.13.0

### Added
- Support & enforce `TrustedTypes`

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
