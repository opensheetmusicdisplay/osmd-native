package org.opensheetmusicdisplay.osmd.kotlin

import android.annotation.SuppressLint
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject

@SuppressLint("SetJavaScriptEnabled")

/**
 * Defines the OSMD interface, exposing both the composable [OSMDView]
 * and the control functions [play], [pause], [stop], [setCursorColor] & [setZoom].
 */
class OSMD {
    private lateinit var webview: WebView

    /** starts audio playback */
    fun play() {
        if (::webview.isInitialized) {
            webview.evaluateJavascript(startPlayback, null)
        }
    }

    /** pauses audio playback at the current position */
    fun pause() {
        if (::webview.isInitialized) {
            webview.evaluateJavascript(pausePlayback, null)
        }
    }

    /** stops audio playback and resets to initial position */
    fun stop() {
        if (::webview.isInitialized) {
            webview.evaluateJavascript(stopPlayback, null)
        }
    }

    /** sets the osmd cursor color */
    fun setCursorColor(color: String) {
        if (::webview.isInitialized) {
            webview.evaluateJavascript(setCursor(color), null)
        }
    }

    /** sets the zoom scale */
    fun setZoom(scale: Float) {
        if (::webview.isInitialized) {
            webview.evaluateJavascript(setZoomScale(scale), null)
        }
    }

    /**
     * The composable OSMDView rendering a music sheet.
     *
     * @param musicXML the path to the music sheet file (.xml or .mxl inside assets folder)
     * @param options optional list of OSMD options (see [IOSMDTypes](https://github.com/opensheetmusicdisplay/osmd-types-player))
     * @param onRender optional function callback to be after render (i.e., for loading indicators etc.)
     */
    @Composable
    fun OSMDView(musicXML: String, options: JSONObject? = null, onRender: (() -> Unit)? = null) {
        AndroidView(factory = { c ->
            return@AndroidView WebView(c).apply {
                settings.loadWithOverviewMode = true
                settings.useWideViewPort = true
                settings.setSupportZoom(false)
                settings.builtInZoomControls = false
                settings.javaScriptEnabled = true
                settings.mediaPlaybackRequiresUserGesture = false
                settings.mixedContentMode = MIXED_CONTENT_ALWAYS_ALLOW

                val assetLoader = WebViewAssetLoader.Builder()
                    .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(c)).build()

                val wvClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView, request: WebResourceRequest
                    ): WebResourceResponse? {
                        return assetLoader.shouldInterceptRequest(request.url)
                    }

                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        if (view != null) {
                            webview = view
                            var js = ""
                            if (options != null) {
                                js += setOptions(options)
                            }
                            webview.evaluateJavascript(
                                js + loadMusicXML(musicXML), null
                            )
                            if (onRender != null) {
                                onRender()
                            }
                        }
                    }
                }

                webViewClient = wvClient
            }
        }, update = {
            it.loadUrl("https://appassets.androidplatform.net/assets/index.html")
        })
    }
}