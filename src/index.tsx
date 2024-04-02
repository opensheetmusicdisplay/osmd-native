import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import type { IOSMDOptions } from 'opensheetmusicdisplay';

import { osmd_min_str } from './assets/osmd_min';
import {
  initOSMD,
  loadMusicXML,
  setOptions,
  startPlayback,
  pausePlayback,
  stopPlayback,
  setCursorColor,
  passErrorToRN,
  setZoom,
} from './injection/injection_scripts';

export interface OSMDRef {
  /** starts audio playback */
  play: () => void;
  /** pauses audio playback at the current position */
  pause: () => void;
  /** stops audio playback and resets to initial position */
  stop: () => void;
  /** sets the osmd cursor color */
  setCursorColor: (color: string) => void;
  /** sets the zoom scale */
  setZoom: (scale: number) => void;
}

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

export const OSMDView = forwardRef<OSMDRef, OSMDProps>(function OSMDView(
  { musicXML, options, style, onRender }: OSMDProps,
  ref
): React.ReactElement {
  const webview = useRef<WebView>(null);
  const initialized = useRef(false);

  /** Handles messages received from the webview.
   *  @param message a stringified JSON object (see injection scripts for how they are triggered)
   */
  const handleMessage = (message: string) => {
    const data = JSON.parse(message);

    // @todo: remove, debug only
    // console.log('received from webview:', data, message);

    switch (data.event) {
      /** `onInit` is called when an OSMD instance is created.
       *  Once the instance is ready, we setup options & load music xml.
       */
      case 'onInit': {
        console.log(`OSMD Version: ${data.version}`);
        if (initialized.current === false) {
          initialized.current = true;
          let js = ``;
          if (options) js += setOptions(options);
          js += loadMusicXML(musicXML);
          webview.current?.injectJavaScript(js);
        }
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

  useImperativeHandle(
    ref,
    () => {
      return {
        play() {
          webview.current?.injectJavaScript(startPlayback);
        },
        pause() {
          webview.current?.injectJavaScript(pausePlayback);
        },
        stop() {
          webview.current?.injectJavaScript(stopPlayback);
        },
        setCursorColor(color) {
          webview.current?.injectJavaScript(setCursorColor(color));
        },
        setZoom(scale) {
          webview.current?.injectJavaScript(setZoom(scale));
        },
      };
    },
    []
  );

  return (
    <WebView
      ref={webview}
      injectedJavaScriptBeforeContentLoaded={passErrorToRN}
      injectedJavaScript={osmd_min_str}
      setBuiltInZoomControls={false}
      source={{
        html: '<body><div id="osmdContainer"/></div></body>',
      }}
      containerStyle={style ?? styles.container}
      onShouldStartLoadWithRequest={() => {
        /** stop any navigation attempt inside the webview - we only load our own html canvas */
        return false;
      }}
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
});

const styles = StyleSheet.create({
  rootView: { flex: 1 },
  container: { width: '100%', height: '100%' },
});
