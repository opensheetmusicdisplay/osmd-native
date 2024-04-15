package org.opensheetmusicdisplay.osmd.kotlin

import org.json.JSONObject

/** sets any supported IOSMDOptions   */
fun setOptions(options: JSONObject): String {
    return """
       osmd.setOptions(${options}); 
    """
}

/** loads the actual music xml */
fun loadMusicXML(musicXML: String): String {
    return """
    try {
      if (osmd.drawer?.backend?.ctx != undefined) {
        osmd.clear();
      }
      osmd
        .load("$musicXML")
        .then(() => {
          osmd.initPlaybackManager();
          osmd.render();
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
        console.log(error);
    }
    """
}

const val startPlayback = """
osmd.PlaybackManager.playDummySound();
osmd.PlaybackManager.play();
"""

const val pausePlayback = """
osmd.PlaybackManager.pause();
"""

const val stopPlayback = """
osmd.PlaybackManager.pause();
osmd.PlaybackManager.reset();
"""

fun setCursor(color: String): String {
    return """
    osmd.cursor.CursorOptions.color = "$color";
    osmd.cursor.update();
    """
}

fun setZoomScale(zoom: Float): String {
    return """
    osmd.Zoom = $zoom;
    osmd.render();
    """
}