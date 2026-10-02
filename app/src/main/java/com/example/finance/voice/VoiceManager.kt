package com.example.finance.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import java.util.Locale

class VoiceManager(private val context: Context) {

    private var speechRecognizer: SpeechRecognizer? = null
    var isListening: Boolean = false
        private set

    fun startListening(
        onResult: (String) -> Unit,
        onError: (String) -> Unit,
        onStateChanged: (Boolean) -> Unit
    ) {
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            onError("Голосовое распознавание недоступно на вашем устройстве")
            return
        }

        stopListening()

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    isListening = true
                    onStateChanged(true)
                }

                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {
                    isListening = false
                    onStateChanged(false)
                }

                override fun onError(error: Int) {
                    isListening = false
                    onStateChanged(false)
                    val message = when (error) {
                        SpeechRecognizer.ERROR_NO_MATCH -> "Речь не распознана, попробуйте ещё раз"
                        SpeechRecognizer.ERROR_AUDIO -> "Ошибка записи аудио"
                        SpeechRecognizer.ERROR_NETWORK -> "Ошибка сети при распознавании"
                        SpeechRecognizer.ERROR_CLIENT -> "Ошибка приложения"
                        SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Нет разрешения на запись аудио"
                        else -> "Ошибка распознавания речи (код $error)"
                    }
                    onError(message)
                }

                override fun onResults(results: Bundle?) {
                    isListening = false
                    onStateChanged(false)
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        onResult(matches[0])
                    } else {
                        onError("Речь не распознана")
                    }
                }

                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ru-RU")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "ru-RU")
            putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, "ru-RU")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Скажите команду...")
        }

        try {
            speechRecognizer?.startListening(intent)
        } catch (e: Exception) {
            isListening = false
            onStateChanged(false)
            onError("Не удалось запустить микрофон: ${e.localizedMessage}")
        }
    }

    fun stopListening() {
        if (isListening) {
            try {
                speechRecognizer?.stopListening()
                speechRecognizer?.destroy()
            } catch (_: Exception) {}
            speechRecognizer = null
            isListening = false
        }
    }
}
