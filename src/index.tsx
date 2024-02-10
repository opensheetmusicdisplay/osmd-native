import React, { useRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

import { osmd_min_str } from './assets/osmd_min';
import type { IOSMDOptions } from './assets/OSMDOptions';

export interface OSMDProps {
  /** the music document to render. it needs to either be a URL to a MusicXML file or a string of the MusicXML content */
  musicXML: string;
  options?: IOSMDOptions;
  style?: StyleProp<ViewStyle>;
}

const loadOSMD = (options: IOSMDOptions, musicXML: string) => `
var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay('osmdContainer');
osmd.setOptions(${JSON.stringify(options)});
window.ReactNativeWebView.postMessage('OSMD Version: ' + osmd.version);
osmd
  .load(${JSON.stringify(musicXML)})
  .then(function () {
    window.ReactNativeWebView.postMessage('starting to render...');
    osmd.render();
    window.ReactNativeWebView.postMessage('rendered');
  })
  .catch((error) => {
    window.ReactNativeWebView.postMessage(JSON.stringify(error));
  });
`;

export function OSMDView({
  musicXML,
  options = {},
  style,
}: OSMDProps): React.ReactElement {
  const webview = useRef<WebView>(null);

  return (
    <WebView
      ref={webview}
      originWhitelist={['*']}
      injectedJavaScript={osmd_min_str}
      source={{
        html: '<body><div id="osmdContainer"/></div></body>',
      }}
      containerStyle={style ?? styles.container}
      onLoad={() => {
        console.log('injecting loadOSMD');
        const js = loadOSMD(options, musicXML);
        webview.current?.injectJavaScript(js);
      }}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error: ', nativeEvent);
      }}
      onMessage={(event) => {
        console.log(event.nativeEvent.data);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: '100%' },
});
