import React, { useEffect, useRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

import { osmd_min_str } from './assets/osmd_min';
import type { IOSMDOptions } from 'opensheetmusicdisplay';
import {
  initOSMD,
  loadMusicXML,
  setOptions,
} from './injection/injection_scripts';

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

export function OSMDView({
  musicXML,
  options,
  style,
  onRender,
}: OSMDProps): React.ReactElement {
  const webview = useRef<WebView>(null);

  /** Handles messages received from the webview.
   *  @param message a stringified JSON object (see injection scripts for how they are triggered)
   */
  const handleMessage = (message: string) => {
    const data = JSON.parse(message);

    // @todo: remove, debug only
    console.log('reveived from webview:', data);

    switch (data.event) {
      /** `onInit` is called when an OSMD instance is created.
       *  Once the instance is ready, we setup options & load music xml.
       */
      case 'onInit': {
        console.log(`OSMD Version: ${data.version}`);

        let js = ``;
        if (options) js += setOptions(options);
        js += loadMusicXML(musicXML);
        webview.current?.injectJavaScript(js);

        break;
      }
      /** `onRender` is called when the music sheet is rendered.
       * A client can use this callback to react, i.e. hide a loading indicator etc.
       */
      case 'onRender': {
        if (onRender) onRender();
        break;
      }
    }
  };

  /** Any time options or musicXML changes, we re-inject the new js */
  useEffect(() => {
    if (options) {
      webview.current?.injectJavaScript(setOptions(options));
    }
    webview.current?.injectJavaScript(loadMusicXML(musicXML));
  }, [options, musicXML]);

  return (
    <WebView
      ref={webview}
      injectedJavaScript={osmd_min_str}
      source={{
        html: '<body><div id="osmdContainer"/></div></body>',
      }}
      containerStyle={style ?? styles.container}
      onLoad={() => {
        webview.current?.injectJavaScript(initOSMD);
      }}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        throw nativeEvent;
      }}
      onMessage={(event) => {
        handleMessage(event.nativeEvent.data);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: '100%' },
});
