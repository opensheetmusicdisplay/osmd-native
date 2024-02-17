import type { IOSMDOptions } from 'opensheetmusicdisplay';

/** initializes the OSMD instance within the webview. should only happen once when the webview loads.  */
export const initOSMD = `
var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay('osmdContainer');
window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'onInit', version: osmd.version }));
`;

/** sets any supported IOSMDOptions   */
export const setOptions = (options: IOSMDOptions) =>
  `osmd.setOptions(${JSON.stringify(options)});`;

/** loads the actual music xml */
export const loadMusicXML = (musicXML: string) => `
osmd
  .load(${JSON.stringify(musicXML)})
  .then(() => {
    osmd.render();
    window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'onRender' }));
  })
  .catch((error) => {
    window.ReactNativeWebView.postMessage(JSON.stringify(error));
  });
`;
