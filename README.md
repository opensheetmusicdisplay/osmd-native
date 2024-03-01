# react-native-osmd

OpenSheetMusicDisplay for React Native  
Currently supports:
- setting OSMDOptions via props
- setting a musicXML string or URL via props
- playing audio & controlling playback

![Screenshot](screenshot.jpg)

## Table of contents
* [Installation](#installation)
* [Usage](#usage)
* [Example](#example)
* [Development](#development)
* [Setup](#setup)
* [Structure](#structure)
* [Interface](#interface)
* [Updating OSMD](#updating-osmd)
* [Building & Publishing](#building--publishing)

## Installation

```sh
npm install react-native-osmd
```

## Usage

Simplest usage rendering a music sheet:
```js
import { OSMDView } from 'react-native-osmd';
// this is a .ts file exporting a string
import { beethoven_geliebte } from '../assets/beethoven_geliebte';

// ...
<OSMDView
  options={{
    // optional, use whatever options you wish as supported by IOSMDOptions
    backend: 'svg',
    drawTitle: true,
    drawingParameters: 'leadsheet',
  }}
  musicXML={beethoven_geliebte}
/>
```

**Note**: Currently, you need to pass either a remote URL or a string to `musicXML` - passing a .xml file directly is not yet possible.

## Examples
See `./example` for an example app using this library, you can run it by running `yarn example android` or `yarn example ios` (if on macOS).  
Some usage scenario examples:

#### Controlling audio playback
```js
// @todo
```
#### Setting custom options
```js
// @todo
```
#### Changing cursor color
```js
// @todo
```
## Development

### Setup
Make sure your environment is setup for node.js & react-native.
Check https://reactnative.dev/docs/environment-setup  _(do **not** use expo)_.

**Note**: This project was scaffolded using [react-native-builder-bob](https://github.com/callstack/react-native-builder-bob), it uses yarn with a monorepo configuration so you'll need to use yarn instead of npm. 

1. Clone the repo
2. Switch into the project folder & install dependencies: `yarn`
3. Run the example app: `yarn example android` or `yarn example ios` (depending on your OS & target)

This will run the example app from `example/` which imports the library into a very simple client app to showcase the functionality. You can then modifiy the library source code in `src/` and test your changes via hot-reload inside the example app.


### Structure
The project directory has the following structure:
```
[root]                      (root project directory)
 ├─ android           (native android source files) 
 ├─ example          (example client app using this library)
 ├─ ios                   (native ios source files)
 ├─ src                   (typescript source files) 
 ├── assets              (static or generated assets like osmd_min.ts) 
 ├── injection          (js code that is injected into the webview containing OSMD) 
 ├── index.tsx          (main entry point: exports interfaces and views of the lib) 
 ├─ generate_osmd_min_as_string.js  (updates the osmd build asset which is loaded into the webview) 
```
The architecture of this lib can be summarized like this:
- An [OSMD build](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay) is encapsulated inside a skeleton react-native webview that loads nothing but an empty html string with a single div inside to load OSMD into
- The `injection_scripts.ts` file contains js that can be passed to and launched inside the webview to load OSMD, set options, load & render a music sheet and control playback by passing messages between the webview context & react-native. These scripts essentially expose the actual OSMD functionality

With that setup, the react native library is defined via `index.tsx` -  it exports type interfaces and the central `OSMDView` which is the main react-native component that renders a given music xml and exposes methods to the parent component via a [forwardRef](https://react.dev/reference/react/forwardRef).

### Interface

#### Component Props
```typescript
export interface OSMDProps {
  /** The music document to render.
   *  It needs to either be a URL to a MusicXML file or
   *  a string of the MusicXML content
   */
  musicXML: string;
  /** (optional) Options to set on OSMD */
  options?: IOSMDOptions;
  /** (optional) Custom styling to be applied to the content container */
  style?: StyleProp<ViewStyle>;
  /** (optional) Callback that is called once the content is rendered.
   *  Can be used to show/hide loading indicators, etc.
   */
  onRender?: () => void;
}
```
#### Component Ref Methods
```typescript
export interface OSMDRef {
  /** starts audio playback */
  play: () => void;
  /** pauses audio playback at the current position */
  pause: () => void;
  /** stops audio playback and resets to initial position */
  stop: () => void;
  /** sets the osmd cursor color */
  setCursorColor: (color: string) => void;
}
```

### Updating OSMD
Since `react-native-webview` does not support import of local scripts inside the webview html, we need to pass the osmd build by injecting it as a string via the `injectedJavaScript` prop.  

If a new OSMD build is available, you'll need to update `opensheetmusicdisplay.min.js` and then run `node generate_osmd_min_as_string.js` to make sure the `src/assets/osmd_min.ts` file gets updated. 

### Building & Publishing

**TBC**
- run `yarn prepare` to build the lib (it will generate a `lib/` folder)
- run `yarn release` to publish a release via [release-it](https://github.com/release-it/release-it)