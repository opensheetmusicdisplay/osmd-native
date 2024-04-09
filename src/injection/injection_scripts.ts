import type { IOSMDOptions } from 'opensheetmusicdisplay';

/** passes any errors from inside the webview context to the react native context */
export const passErrorToRN = `
window.onerror = function(message, sourcefile, lineno, colno, error) {
  window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'error', message, sourcefile, lineno, colno }));
    return true;
};
true;
`;

/** initializes the OSMD instance within the webview. should only happen once when the webview loads.  */
export const initOSMD = `
var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay('osmdContainer');
osmd.autoResizeEnabled = false;
window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'onInit', version: osmd.version }));
osmd.initPlaybackManager = function () {
  var timingSource = new opensheetmusicdisplay.LinearTimingSource();
  var playbackManager = new opensheetmusicdisplay.PlaybackManager(timingSource, undefined, new opensheetmusicdisplay.BasicAudioPlayer(), undefined);
  playbackManager.DoPlayback = true;
  timingSource.Settings = osmd.Sheet.playbackSettings;
  playbackManager.initialize(osmd.Sheet.musicPartManager);
  playbackManager.addListener(osmd.cursor);
  osmd.PlaybackManager = playbackManager;
}
`;

/** sets any supported IOSMDOptions   */
export const setOptions = (options: IOSMDOptions) =>
  `osmd.setOptions(${JSON.stringify(options)});`;

/** loads the actual music xml */
export const loadMusicXML = (musicXML: string) => `
try {
  if (osmd.drawer?.backend?.ctx != undefined) {
    osmd.clear();
  }
  osmd
    .load(${JSON.stringify(musicXML)})
    .then(() => {
      osmd.initPlaybackManager();
      osmd.render();
      window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'onRender' }));
    })
    .catch((error) => {
      window.ReactNativeWebView.postMessage(JSON.stringify(error));
    });
} catch (error) {
  window.ReactNativeWebView.postMessage(JSON.stringify(error));
}
`;

export const startPlayback = `
window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'play' }));
osmd.PlaybackManager.playDummySound();
osmd.PlaybackManager.play();
`;

export const pausePlayback = `
window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'pause' })); 
osmd.PlaybackManager.pause();
`;

export const stopPlayback = `
window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'stop' })); 
osmd.PlaybackManager.pause();
osmd.PlaybackManager.reset();
`;

export const setCursorColor = (color: string) => `
osmd.cursor.CursorOptions.color = ${JSON.stringify(color)};
osmd.cursor.update();
window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'setCursorColor', color: ${JSON.stringify(
  color
)} })); 
`;

export const setZoom = (zoom: Number) => `
osmd.Zoom = ${JSON.stringify(zoom)};
osmd.render();
window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'setZoom', zoom: ${JSON.stringify(
  zoom
)} })); 
`;
