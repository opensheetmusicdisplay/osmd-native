//
//  InjectionScripts.swift
//  OSMD-swift
//
//  Created by Paul Deny on 15.04.24.
//

import Foundation

/** sets any supported IOSMDOptions   */
func setOptions(options: [String: Any]) -> String {
    let jsonString = try! JSONSerialization.data(withJSONObject: options)
    let optionsString = String(data: jsonString, encoding: .utf8)!
    return """
       osmd.setOptions(\(optionsString));
    """
}

/** loads the actual music xml */
func loadMusicXML(musicXML: String) -> String {
    return """
    try {
          if (osmd.drawer?.backend?.ctx != undefined) {
            osmd.clear();
          }
          osmd
            .load("http://localhost:8080/\(musicXML)")
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

let startPlayback = """
osmd.PlaybackManager.playDummySound();
osmd.PlaybackManager.play();
"""

let pausePlayback = """
osmd.PlaybackManager.pause();
"""

let stopPlayback = """
osmd.PlaybackManager.pause();
osmd.PlaybackManager.reset();
"""

func setCursor(color: String) -> String {
    return """
    osmd.cursor.CursorOptions.color = "\(color)";
    osmd.cursor.update();
    """
}

func setZoomScale(zoom: Float) -> String {
    return """
    osmd.Zoom = \(zoom);
    osmd.render();
    """
}
