//
//  OSMD.swift
//  OSMD-swift
//
//  Created by Paul Deny on 15.04.24.
//

import Foundation
import WebKit
import SwiftUI
import GCDWebServer

@available(iOS 13.0, *)
class OSMD {
    var osmdWebView: WKWebView!
    var webServer: GCDWebServer?
    var osmdWebViewRepresentable: WebViewRepresentable?
    
    init(){
        osmdWebView = WKWebView()
        // Create a GCDWebServer instance
        webServer = GCDWebServer()
        
        // Add a handler to serve local files
        webServer?.addDefaultHandler(forMethod: "GET", request: GCDWebServerRequest.self) { (request, completionBlock) in
            // Get the path of the requested file
            let pathURL = NSString(string: request.path)
            let pathSuffix = pathURL.pathExtension;
            let pathWithoutSuffix = pathURL.deletingPathExtension;
            let filePath = Bundle.main.path(forResource: pathWithoutSuffix, ofType: pathSuffix)
            
            // Check if the file exists
            guard let path = filePath else {
                completionBlock(GCDWebServerErrorResponse(statusCode: 404))
                return
            }
            // Create a file response with the requested file
            let response = GCDWebServerFileResponse(file: path)
            // Add CORS headers to allow requests from any origin
            response?.setValue("null", forAdditionalHeader: "Access-Control-Allow-Origin")
            response?.setValue("GET, POST, OPTIONS", forAdditionalHeader: "Access-Control-Allow-Methods")
            response?.setValue("Content-Type", forAdditionalHeader: "Access-Control-Allow-Headers")
            // Call the completion block with the response
            completionBlock(response)
        }
        // Start the web server
        webServer?.start(withPort: 8080, bonjourName: "GCD Web Server")
        print("Local server running on port \(webServer?.port ?? 8080)")
        
    }
    
    /** starts audio playback */
    func play() {
        if let webView = osmdWebView {
            webView.evaluateJavaScript(startPlayback, completionHandler: nil)
        }
    }
    
    /** pauses audio playback at the current position */
    func pause() {
        if let webView = osmdWebView {
            webView.evaluateJavaScript(pausePlayback, completionHandler: nil)
        }
    }
    
    /** stops audio playback and resets to initial position */
    func stop() {
        if let webView = osmdWebView {
            webView.evaluateJavaScript(stopPlayback, completionHandler: nil)
        }
    }
    
    /** sets the osmd cursor color */
    func setCursorColor(color: String) {
        if let webView = osmdWebView {
            webView.evaluateJavaScript(setCursor(color: color), completionHandler: nil)
        }
    }
    
    /** sets the zoom scale */
    func setZoom(scale: Float) {
        if let webView = osmdWebView {
            webView.evaluateJavaScript(setZoomScale(zoom: scale), completionHandler: nil)
        }
    }
    
    /**
     * The composable OSMDView rendering a music sheet.
     *
     * @param musicXML the path to the music sheet file (.xml or .mxl inside assets folder)
     * @param options optional list of OSMD options
     * @param onRender optional function callback to be after render
     */
    @available(iOS 13.0, *)
    func OSMDView(musicXML: String, options: [String: Any]? = nil, onRender: (() -> Void)? = nil) -> some View {
        if (osmdWebViewRepresentable != nil){
            if(musicXML == osmdWebViewRepresentable?.musicXML){
                return osmdWebViewRepresentable
            }
        }
        osmdWebViewRepresentable = WebViewRepresentable(webView: osmdWebView, musicXML: musicXML, options: options, onRender: onRender)
        return osmdWebViewRepresentable
    }
    
    @available(iOS 13.0, *)
    struct WebViewRepresentable: UIViewRepresentable {
        let webView: WKWebView
        let musicXML: String
        let options: [String: Any]?
        let onRender: (() -> Void)?
        
        func makeUIView(context: Context) -> WKWebView {
            let webView = webView
            webView.configuration.allowsInlineMediaPlayback = true
            webView.configuration.mediaTypesRequiringUserActionForPlayback = []
            webView.configuration.dataDetectorTypes = []
            webView.configuration.suppressesIncrementalRendering = true
            
            webView.navigationDelegate = context.coordinator
            
            return webView
        }
        
        func updateUIView(_ webView: WKWebView, context: Context) {
            if let htmlPath = Bundle.main.path(forResource: "assets/index", ofType: "html") {
                let htmlURL = URL(fileURLWithPath: htmlPath)
                webView.loadFileURL(htmlURL, allowingReadAccessTo: htmlURL.deletingLastPathComponent())
            }
        }
        
        func makeCoordinator() -> Coordinator {
            return Coordinator(musicXML: musicXML, options: options, onRender: onRender)
        }
        
        class Coordinator: NSObject, WKNavigationDelegate {
            let musicXML: String
            let options: [String: Any]?
            let onRender: (() -> Void)?
            
            init(musicXML: String, options: [String: Any]?, onRender: (() -> Void)?) {
                self.musicXML = musicXML
                self.options = options
                self.onRender = onRender
            }
            
            func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
                var js = ""
                if let options = options {
                    js += setOptions(options: options)
                }
                let functionString = "setTimeout(function() {\(loadMusicXML(musicXML: musicXML))}, 0);"
                let jsString = js + functionString
                webView.evaluateJavaScript(jsString) { (result, error) in
                    if error == nil {
                        self.onRender?()
                        print(result!)
                    }
                    else{
                        print(error!)
                    }
                }
            }
        }
    }
}
