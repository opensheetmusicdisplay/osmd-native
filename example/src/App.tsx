import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { OSMDView } from 'react-native-osmd';

import { beethoven_geliebte } from '../assets/beethoven_geliebte';

export default function App() {
  return (
    <View style={styles.container}>
      <OSMDView
        options={{
          backend: 'svg',
          drawTitle: true,
          drawingParameters: 'leadsheet',
        }}
        musicXML={beethoven_geliebte}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#01a9db',
  },
});
