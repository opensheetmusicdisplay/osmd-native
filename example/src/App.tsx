import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type OSMDRef, OSMDView } from 'react-native-osmd';
// import base64 from 'react-native-base64';

import { beethoven_geliebte } from '../assets/beethoven_geliebte';
// import { singsing } from '../assets/singsing';
// import { breakfree } from '../assets/breakfree';
import { silent_night } from '../assets/silent_night';
import { abide } from '../assets/abide';

const sheets = [
  { title: 'An die ferne Geliebte', content: beethoven_geliebte },
  { title: 'Silent Night', content: silent_night },
  { title: 'Abide (MXL)', content: abide },
];

const cursors = [
  { type: 0, color: '#ff0000', alpha: 0.5, follow: true }, // red
  { type: 0, color: '#00ff00', alpha: 0.5, follow: true }, // green
];

type PlaybackState = 'play' | 'pause' | 'stop';

export default function App() {
  const osmd = useRef<OSMDRef>(null);
  const playback = useRef<PlaybackState>('stop');
  const cursor = useRef(cursors[0]);

  const [currentXML, setXML] = React.useState<
    { title: string; content: string } | undefined
  >();

  const [playbackState, setPlaybackState] = React.useState<
    PlaybackState | undefined
  >();

  const options = {
    backend: 'svg',
    drawTitle: true,
    drawingParameters: 'default',
  };

  const onSelectSheet = (selected: { title: string; content: string }) => {
    if (selected.title === currentXML?.title) {
      return;
    }
    setPlaybackState(undefined);
    setXML(selected);
  };

  const onPlayPause = () => {
    switch (playback.current) {
      case undefined:
      case 'pause':
      case 'stop':
        osmd.current?.play();
        playback.current = 'play';
        break;
      case 'play':
        osmd.current?.pause();
        playback.current = 'pause';
        break;
    }
  };

  const onToggleCursor = () => {
    const newCursor = cursors.filter((c) => c.color !== cursor.current?.color);
    console.log(newCursor);
    if (newCursor[0]?.color !== undefined) {
      osmd.current?.setCursorColor(newCursor[0].color);
      cursor.current = newCursor[0];
    }
  };

  const onRender = () => {
    setPlaybackState('stop');
  };

  return (
    <View style={styles.container}>
      {sheets.map((sheet) => (
        <Pressable
          key={sheet.title}
          style={
            currentXML?.title === sheet.title
              ? styles.sheetActive
              : styles.sheet
          }
          onPress={() => onSelectSheet(sheet)}
        >
          <Text style={styles.sheetName}>
            {currentXML?.title === sheet.title ? '▶️' : '🎵'} {sheet.title}
          </Text>
        </Pressable>
      ))}
      {currentXML && (
        <OSMDView
          ref={osmd}
          options={options}
          musicXML={currentXML.content}
          onRender={onRender}
        />
      )}
      {currentXML !== undefined && playbackState === undefined && (
        <View style={styles.playButton}>
          <ActivityIndicator />
        </View>
      )}
      {playbackState !== undefined && (
        <Pressable onPress={onPlayPause} style={styles.playButton}>
          <View>
            <Text>{playbackState === 'play' ? '⏸️' : '▶️'}</Text>
          </View>
        </Pressable>
      )}
      {playbackState !== undefined && (
        <Pressable onPress={onToggleCursor} style={styles.cursorButton}>
          <View>
            <Text>CSR</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sheet: {
    backgroundColor: '#01a9db',
    padding: 16,
  },
  sheetActive: {
    padding: 16,
    backgroundColor: '#90ee90',
  },
  sheetName: {
    fontSize: 20,
    color: '#fff',
  },
  playButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#01a9db',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cursorButton: {
    position: 'absolute',
    bottom: 32,
    right: 110,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#01a9db',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
