# React Native prebuilt

Prebuilt React Native framework and native modules for iOS, is used to speed up app build

## Usage

1. Get required framework form GitHub releases of the repo (use `ReactNativeLib-Distr.framework` for App Store archive)
2. Add to app's XCode project as a regular framework

## Installation

1. `npm install`
2. `cd ios && pod install`

## Build

1. Use XCode to build debug and release versions of ReactNativeLib for device and simulator (4 artifacts in total)
2. Make a fat framework using debug builds (see https://medium.com/@hassanahmedkhan/a-noobs-guide-to-creating-a-fat-library-for-ios-bafe8452b84b for details, skip Swift-related stuff)
3. Make a fat framework using release builds
4. Keep release build for device separately

## Release a new version

1. Update `package.json` to match app's dependencies and repeat installation steps
2. Bump version number and commit changes
3. Build
4. Archive fat debug framework as `ReactNativeLib-Debug.framework.zip`
5. Archive fat release framework as `ReactNativeLib-Release.framework.zip`
6. Archive release framework for device as `ReactNativeLib-Distr.framework.zip`
7. Create a GitHub release with attached archives
