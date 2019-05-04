# React Native prebuilt

Prebuilt React Native framework and native modules for iOS, is used to speed up app build

## Usage

1. Get required framework form GitHub releases of the repo (use `ReactNativeLib-Distr.framework` for App Store archive)
2. Add to app's XCode project as a regular framework

## Installation

1. `npm install`
1. `cd ios && pod install`

## Build

1. `npm run build`

## Release a new version

1. Update `package.json` to match app's dependencies and repeat installation steps
1. Bump version number and commit changes
1. Build
1. Create a GitHub release with attached archives
