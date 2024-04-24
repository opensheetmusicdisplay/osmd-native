/* eslint-disable no-undef */
var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay('osmdContainer');
console.log("event: 'onInit', version: " + osmd.version);

/** initializes the OSMD instance within the webview. should only happen once when the webview loads.  */
osmd.autoResizeEnabled = false;
osmd.initPlaybackManager = function () {
  var timingSource = new opensheetmusicdisplay.LinearTimingSource();
  var playbackManager = new opensheetmusicdisplay.PlaybackManager(
    timingSource,
    undefined,
    new opensheetmusicdisplay.BasicAudioPlayer(),
    undefined
  );
  playbackManager.DoPlayback = true;
  playbackManager.DoPreCount = false;
  timingSource.Settings = osmd.Sheet.playbackSettings;
  playbackManager.initialize(osmd.Sheet.musicPartManager);
  playbackManager.addListener(osmd.cursor);
  osmd.PlaybackManager = playbackManager;
};
