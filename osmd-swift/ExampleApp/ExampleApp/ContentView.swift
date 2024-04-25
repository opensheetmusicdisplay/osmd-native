//
//  ContentView.swift
//  OSMD-swift
//
//  Created by Paul Deny on 15.04.24.
//

import SwiftUI
import osmd_swift

struct ContentView: View {
    @Environment(\.colorScheme) var colorScheme
    var sheets = [
        "An die ferne Geliebte": "sheets/Beethoven_AnDieFerneGeliebte",
        "Silent Night": "sheets/Original_Silent_Night",
        "Abide (MXL)": "sheets/AbideWithMe"
    ]
    
    init() {
        sheets["An die ferne Geliebte"] =  "sheets/Beethoven_AnDieFerneGeliebte.xml"
        sheets["Silent Night"] = "sheets/Original_Silent_Night.xml"
        sheets["Abide (MXL)"] = "sheets/AbideWithMe.mxl"
    }
    
    let osmd = OSMD()
    
    @State private var currentXML: (String, String)? = nil
    @State private var loading = false
    @State private var playing = false
    @State private var zoomScale: CGFloat = 1.0
    @State private var cursorColor = "#00ff00"
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                if currentXML != nil {
                    HStack {
                        if let _ = currentXML {
                            Button(action: {
                                currentXML = nil
                                loading = true
                            }) {
                                Image(colorScheme == .dark ? "ic_back_white" : "ic_back")
                                    .resizable()
                                    .frame(width: 24, height: 24)
                            }
                        }
                        Text(currentXML?.0 ?? "OSMD Native")
                            .font(.title)
                            .fontWeight(.bold)
                            .padding(.leading, currentXML == nil ? 8 : 0)
                        if let _ = currentXML {
                            Button(action: {
                                cursorColor = cursorColor == "#00ff00" ? "#ff0000" : "#00ff00"
                                osmd.setCursorColor(color: cursorColor)
                            }) {
                                Image("ic_cursor")
                                    .resizable()
                                    .frame(width: 24, height: 24)
                            }
                            Button(action: {
                                zoomScale += 0.1
                                osmd.setZoom(scale: Float(zoomScale))
                            }) {
                                Image("ic_zoom_in")
                                    .resizable()
                                    .frame(width: 24, height: 24)
                            }
                            Button(action: {
                                zoomScale -= 0.1
                                osmd.setZoom(scale: Float(zoomScale))
                            }) {
                                Image("ic_zoom_out")
                                    .resizable()
                                    .frame(width: 24, height: 24)
                            }
                        }
                    }
                    .frame(height: 64)
                    .padding(.vertical, 8)
                    .padding(.horizontal)
                    Divider()
                        .background(Color.black)
                }
                if currentXML != nil {
                    ZStack {
                        osmd.OSMDView(musicXML: currentXML!.1, options: ["drawTitle":false], onRender: {
                            loading = false
                        }).frame(width: UIScreen.main.bounds.width, height: UIScreen.main.bounds.height)
                        VStack {
                            Spacer()
                            Spacer()
                            Spacer()
                            Spacer()
                            HStack {
                                if !loading {
                                    Button(action: {
                                        playing = false
                                        osmd.stop()
                                    }) {
                                        Image("ic_reset")
                                            .resizable()
                                            //.aspectRatio(contentMode: .fit)
                                            .frame(width: 40, height: 40)
                                    }.background(Color(red: 225/225, green: 104/225, blue: 1/225))
                                        .clipShape(Circle())
                                }
                                Button(action: {
                                    if !loading {
                                        playing.toggle()
                                        if playing {
                                            osmd.play()
                                        } else {
                                            osmd.pause()
                                        }
                                    }
                                }) {
                                    if loading {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                            .padding(10)
                                    } else {
                                        Image(playing ? "ic_pause" : "ic_play")
                                            .resizable()
                                            .aspectRatio(contentMode: .fit)
                                            .frame(width: 30, height: 30)
                                            .foregroundColor(.white)
                                            .padding(10)
                                    }
                                }.background(Color(red: 225/225, green: 104/225, blue: 1/225))
                                    .clipShape(Circle())
                            }
                            .padding()
                            Spacer()
                        }
                    }
                } else {
                    ForEach(sheets.sorted(by: { $0.0 < $1.0 }), id: \.key) { sheet in
                        Button(action: {
                            currentXML = sheet
                            loading = true
                        }) {
                            HStack {
                                Image("ic_music")
                                    .resizable()
                                    .frame(width: 24, height: 24)
                                Text(sheet.key)
                                    .foregroundColor(Color(red: 255 / 255, green: 102 / 255, blue: 0 / 255))
                            }
                            .padding(.vertical, 16)
                            .padding(.horizontal, 8)
                        }
                    }
                }
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
