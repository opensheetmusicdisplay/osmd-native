import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { type OSMDRef, OSMDView } from 'react-native-osmd';
import base64 from 'react-native-base64';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';

import { beethoven_geliebte } from '../assets/beethoven_geliebte';
import { silent_night } from '../assets/silent_night';
import { abide } from '../assets/abide';

const sheets = [
  { title: 'An die ferne Geliebte', content: beethoven_geliebte },
  { title: 'Silent Night', content: silent_night },
  { title: 'Abide (MXL)', content: base64.decode(abide) },
];

const cursors = [
  { type: 0, color: '#ff0000', alpha: 0.5, follow: true }, // red
  { type: 0, color: '#00ff00', alpha: 0.5, follow: true }, // green
];

type PlaybackState = 'play' | 'pause' | 'stop';

export default function App() {
  const osmd = useRef<OSMDRef | null>(null);
  const playback = useRef<PlaybackState>('stop');
  const cursor = useRef(cursors[0]);
  const [currentXML, setXML] = React.useState<
    { title: string; content: string } | undefined
  >();

  const [playbackState, setPlaybackState] = React.useState<
    PlaybackState | undefined
  >();

  /** Handles pinch to zoom gesture
   *  we limit the update frequency so osmd has some time to render
   */
  const zoomScale = useRef(new Animated.Value(1)).current;
  const lastUpdateTime = useRef(Date.now());
  const pinch = Gesture.Pinch().onUpdate((event) => {
    zoomScale.setValue(event.scale);
    const now = Date.now();
    const updateTime = now - lastUpdateTime.current;
    if (updateTime > 160) {
      if (osmd.current) {
        zoomScale.stopAnimation((value) => {
          osmd.current?.setZoom(value);
        });
      }
      lastUpdateTime.current = now;
    }
  });
  const options = {
    backend: 'svg',
    drawTitle: true,
    drawingParameters: 'default',
  };

  const iconBack = require('../assets/icon_back.png');
  const iconMusic = require('../assets/icon_music.png');
  const iconCursor = require('../assets/icon_cursor.png');
  const iconZoomIn = require('../assets/icon_zoom_in.png');
  const iconZoomOut = require('../assets/icon_zoom_out.png');
  const iconPlay = require('../assets/icon_play.png');
  const iconPause = require('../assets/icon_pause.png');
  const iconReset = require('../assets/icon_reset.png');

  const onSelectSheet = (selected: { title: string; content: string }) => {
    if (selected.title === currentXML?.title) {
      return;
    }
    setPlaybackState(undefined);
    setXML(selected);
  };

  const onBack = () => {
    setXML(undefined);
    setPlaybackState(undefined);
  };

  const onPlayPause = () => {
    switch (playback.current) {
      case undefined:
      case 'pause':
      case 'stop':
        osmd.current?.play();
        playback.current = 'play';
        setPlaybackState(playback.current);
        break;
      case 'play':
        osmd.current?.pause();
        playback.current = 'pause';
        setPlaybackState(playback.current);
        break;
    }
  };

  const onReset = () => {
    osmd.current?.stop();
    playback.current = 'stop';
    setPlaybackState(playback.current);
  };

  const onToggleCursor = () => {
    const newCursor = cursors.filter((c) => c.color !== cursor.current?.color);
    if (newCursor[0]?.color !== undefined) {
      osmd.current?.setCursorColor(newCursor[0].color);
      cursor.current = newCursor[0];
    }
  };

  const onRender = () => {
    setPlaybackState('stop');
  };

  const onZoomButton = (direction: 'in' | 'out') => {
    zoomScale.stopAnimation((value) => {
      const newZoom = value + (direction === 'in' ? 0.1 : -0.1);
      zoomScale.setValue(newZoom);
      osmd.current?.setZoom(newZoom);
    });
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <View style={styles.topBar}>
          {currentXML !== undefined && (
            <Pressable onPress={onBack} style={styles.topBarIconContainer}>
              <Image style={styles.iconSmall} source={iconBack} />
            </Pressable>
          )}
          <Text style={styles.headline}>
            {currentXML?.title ?? 'OSMD Native'}
          </Text>
          {currentXML !== undefined && (
            <Pressable
              onPress={onToggleCursor}
              style={styles.topBarIconContainer}
            >
              <Image style={styles.iconSmall} source={iconCursor} />
            </Pressable>
          )}
          {currentXML !== undefined && (
            <Pressable
              onPress={() => onZoomButton('in')}
              style={styles.topBarIconContainer}
            >
              <Image style={styles.iconSmall} source={iconZoomIn} />
            </Pressable>
          )}
          {currentXML !== undefined && (
            <Pressable
              onPress={() => onZoomButton('out')}
              style={styles.topBarIconContainer}
            >
              <Image style={styles.iconSmall} source={iconZoomOut} />
            </Pressable>
          )}
        </View>
        {currentXML === undefined &&
          sheets.map((sheet) => (
            <Pressable
              key={sheet.title}
              style={styles.sheet}
              onPress={() => onSelectSheet(sheet)}
            >
              <View style={styles.sheetContainer}>
                <Image style={styles.iconSmall} source={iconMusic} />
                <Text style={styles.sheetName}>{sheet.title} </Text>
              </View>
            </Pressable>
          ))}
        {currentXML && (
          <GestureDetector gesture={pinch}>
            <OSMDView
              ref={osmd}
              options={options}
              musicXML={currentXML.content}
              onRender={onRender}
            />
          </GestureDetector>
        )}
        {currentXML !== undefined && (
          <View style={styles.buttonContainer}>
            {playbackState !== undefined && (
              <Pressable
                onPress={onReset}
                style={[styles.resetButton, styles.shadow]}
              >
                <View>
                  <Image style={styles.iconSmall} source={iconReset} />
                </View>
              </Pressable>
            )}
            {currentXML !== undefined && playbackState === undefined && (
              <View style={[styles.playButton, styles.shadow]}>
                <ActivityIndicator />
              </View>
            )}
            {playbackState !== undefined && (
              <Pressable
                onPress={onPlayPause}
                style={[styles.playButton, styles.shadow]}
              >
                <View>
                  <Image
                    style={styles.icon}
                    source={playbackState === 'play' ? iconPause : iconPlay}
                  />
                </View>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    width: '100%',
    height: 64,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  topBarIconContainer: {
    paddingHorizontal: 8,
  },
  headline: {
    flex: 1,
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sheetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheet: {
    padding: 16,
  },
  sheetName: {
    fontSize: 20,
    color: '#FF6600',
    marginLeft: 8,
  },
  osmdContainer: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    borderRadius: 100,
    backgroundColor: '#FF6600',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
  },
  iconSmall: {
    width: 24,
    height: 24,
  },
  resetButton: {
    borderRadius: 100,
    backgroundColor: '#FF6600',
    width: 48,
    height: 48,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});
