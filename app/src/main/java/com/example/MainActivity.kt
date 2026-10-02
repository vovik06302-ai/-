package com.example

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.finance.ui.AppScreen
import com.example.finance.ui.MainScreen
import com.example.finance.ui.MainViewModel
import com.example.finance.ui.ReportScreen
import com.example.finance.voice.VoiceManager
import com.example.ui.theme.AppTheme
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()
    private lateinit var voiceManager: VoiceManager
    private var isVoiceListening by mutableStateOf(false)

    private val requestAudioPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            startVoiceRecognition()
        } else {
            Toast.makeText(this, "Разрешение на микрофон необходимо для голосовых команд", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        voiceManager = VoiceManager(this)

        setContent {
            val currentTheme by viewModel.currentTheme.collectAsStateWithLifecycle(initialValue = AppTheme.BLUE)

            MyApplicationTheme(appTheme = currentTheme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val currentScreen by viewModel.currentScreen.collectAsStateWithLifecycle()

                    when (currentScreen) {
                        AppScreen.MAIN -> {
                            MainScreen(
                                viewModel = viewModel,
                                onStartVoiceInput = { checkPermissionAndStartVoice() },
                                isVoiceListening = isVoiceListening,
                                onOpenReport = { viewModel.currentScreen.value = AppScreen.REPORT }
                            )
                        }

                        AppScreen.REPORT -> {
                            ReportScreen(
                                viewModel = viewModel,
                                onNavigateBack = { viewModel.currentScreen.value = AppScreen.MAIN }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun checkPermissionAndStartVoice() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED -> {
                startVoiceRecognition()
            }
            else -> {
                requestAudioPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
            }
        }
    }

    private fun startVoiceRecognition() {
        voiceManager.startListening(
            onResult = { resultText ->
                viewModel.processVoiceInput(resultText)
            },
            onError = { errorMessage ->
                Toast.makeText(this, errorMessage, Toast.LENGTH_SHORT).show()
            },
            onStateChanged = { listening ->
                isVoiceListening = listening
            }
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        voiceManager.stopListening()
    }
}
