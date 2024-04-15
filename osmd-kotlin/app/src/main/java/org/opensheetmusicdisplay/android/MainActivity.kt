package org.opensheetmusicdisplay.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.SmallFloatingActionButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONObject
import org.opensheetmusicdisplay.android.ui.theme.OSMDTheme
import org.opensheetmusicdisplay.osmd.kotlin.OSMD

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // music xml files loaded locally from assets folder
        val sheets = mapOf(
            "An die ferne Geliebte" to "https://appassets.androidplatform.net/assets/Beethoven_AnDieFerneGeliebte.xml",
            "Silent Night" to "https://appassets.androidplatform.net/assets/Original_Silent_Night.xml",
            "Abide (MXL)" to "https://appassets.androidplatform.net/assets/AbideWithMe.mxl",
        )

        // osmd object controlling playback, zoom & cursor
        val osmd = OSMD()

        // set any options supported by OSMD here
        val options = JSONObject()
        options.put("drawTitle", true)

        setContent {
            var currentXML by remember {
                mutableStateOf<Map.Entry<String, String>?>(null)
            }

            var loading by remember {
                mutableStateOf(false)
            }

            var playing by remember {
                mutableStateOf(false)
            }

            var zoomScale by remember {
                mutableFloatStateOf(1.0f)
            }

            var cursorColor by remember {
                mutableStateOf("#00ff00")
            }

            OSMDTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = Color.White) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(64.dp)
                                .padding(vertical = 8.dp)
                        ) {
                            if (currentXML != null) {
                                TextButton(
                                    onClick = {
                                        currentXML = null
                                        loading = true
                                    },
                                    contentPadding = PaddingValues(0.dp),
                                    modifier = Modifier.defaultMinSize(minWidth = 1.dp)
                                ) {
                                    Image(
                                        painter = painterResource(id = R.drawable.ic_back),
                                        contentDescription = "Back"
                                    )
                                }
                            }
                            Text(
                                currentXML?.key ?: "OSMD Native",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier
                                    .weight(1F)
                                    .padding(start = if (currentXML == null) 8.dp else 0.dp)
                            )
                            if (currentXML != null) {
                                TextButton(
                                    onClick = {
                                        cursorColor =
                                            if (cursorColor == "#00ff00") "#ff0000" else "#00ff00"
                                        osmd.setCursorColor(cursorColor)
                                    },
                                    contentPadding = PaddingValues(0.dp),
                                    modifier = Modifier.defaultMinSize(minWidth = 1.dp)
                                ) {
                                    Image(
                                        painter = painterResource(id = R.drawable.ic_cursor),
                                        contentDescription = "Change Cursor Color"
                                    )
                                }
                                TextButton(
                                    onClick = {
                                        zoomScale += 0.1f
                                        osmd.setZoom(zoomScale)
                                    },
                                    contentPadding = PaddingValues(0.dp),
                                    modifier = Modifier.defaultMinSize(minWidth = 1.dp)
                                ) {
                                    Image(
                                        painter = painterResource(id = R.drawable.ic_zoom_in),
                                        contentDescription = "Zoom In"
                                    )
                                }
                                TextButton(
                                    onClick = {
                                        zoomScale -= 0.1f
                                        osmd.setZoom(zoomScale)
                                    },
                                    contentPadding = PaddingValues(0.dp),
                                    modifier = Modifier.defaultMinSize(minWidth = 1.dp)
                                ) {
                                    Image(
                                        painter = painterResource(id = R.drawable.ic_zoom_out),
                                        contentDescription = "Zoom Out"
                                    )
                                }
                            }
                        }
                        Divider(
                            color = Color.Black, modifier = Modifier
                                .height(1.dp)
                                .fillMaxWidth()
                        )
                        if (currentXML != null) {
                            Box(
                                modifier = Modifier.fillMaxSize()
                            ) {
                                osmd.OSMDView(currentXML!!.value,
                                    options,
                                    onRender = { loading = false })
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .align(Alignment.BottomCenter)
                                        .offset(y = -(32).dp)
                                ) {
                                    if (!loading) {
                                        SmallFloatingActionButton(
                                            onClick = {
                                                playing = false
                                                osmd.stop()
                                            },
                                            shape = CircleShape,
                                            containerColor = Color(255, 102, 0),
                                        ) {
                                            Image(
                                                painter = painterResource(id = R.drawable.ic_reset),
                                                contentDescription = "Play / Pause"
                                            )
                                        }
                                    }
                                    FloatingActionButton(
                                        onClick = {
                                            if (!loading) {
                                                playing = if (playing) {
                                                    osmd.pause()
                                                    false
                                                } else {
                                                    osmd.play()
                                                    true
                                                }
                                            }
                                        },
                                        shape = CircleShape,
                                        containerColor = Color(255, 102, 0),
                                    ) {
                                        if (loading) {
                                            CircularProgressIndicator(color = Color.White)
                                        } else {
                                            Image(
                                                painter = if (playing) painterResource(id = R.drawable.ic_pause) else painterResource(
                                                    id = R.drawable.ic_play
                                                ), contentDescription = "Play / Pause"
                                            )
                                        }
                                    }
                                }
                            }
                        } else {
                            for (sheet in sheets) {
                                Row {
                                    TextButton(
                                        onClick = {
                                            currentXML = sheet
                                            loading = true
                                        },
                                        contentPadding = PaddingValues(
                                            vertical = 16.dp, horizontal = 8.dp
                                        ),
                                    ) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Image(
                                                painter = painterResource(id = R.drawable.ic_music),
                                                contentDescription = sheet.key
                                            )
                                            Text(
                                                text = sheet.key,
                                                fontSize = 20.sp,
                                                color = Color(255, 102, 0),
                                                modifier = Modifier.padding(start = 8.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
