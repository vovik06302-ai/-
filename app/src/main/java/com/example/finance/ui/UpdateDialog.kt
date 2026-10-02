package com.example.finance.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.finance.update.UpdateState

@Composable
fun UpdateStatusDialog(
    updateState: UpdateState,
    onDismiss: () -> Unit,
    onCheckUpdate: () -> Unit,
    onStartDownload: (downloadUrl: String) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(text = "Обновление приложения")
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                when (updateState) {
                    is UpdateState.Checking -> {
                        CircularProgressIndicator()
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Проверка обновлений с GitHub...")
                    }

                    is UpdateState.UpToDate -> {
                        Text(
                            text = "Установлена последняя версия (${updateState.currentVersion})",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    is UpdateState.UpdateAvailable -> {
                        Text(
                            text = "Есть обновление ${updateState.latestVersion}",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = updateState.releaseNotes,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    is UpdateState.Downloading -> {
                        Text(
                            text = "Загрузка обновления...",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        RainbowProgressBar(progress = updateState.progress)
                    }

                    is UpdateState.Downloaded -> {
                        Text(
                            text = "Загрузка завершена! Запуск установки...",
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    is UpdateState.Error -> {
                        Text(
                            text = updateState.message,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }

                    else -> {
                        Text("Нажмите «Проверить», чтобы проверить наличие новой версии.")
                    }
                }
            }
        },
        confirmButton = {
            when (updateState) {
                is UpdateState.UpdateAvailable -> {
                    Button(
                        onClick = { onStartDownload(updateState.downloadUrl) }
                    ) {
                        Text("Обновить")
                    }
                }
                is UpdateState.Idle, is UpdateState.UpToDate, is UpdateState.Error -> {
                    Button(onClick = onCheckUpdate) {
                        Text("Проверить снова")
                    }
                }
                else -> {}
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Закрыть")
            }
        }
    )
}
