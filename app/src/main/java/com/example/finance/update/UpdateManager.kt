package com.example.finance.update

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.concurrent.TimeUnit

// OWNER/REPO constant as requested
const val GITHUB_REPO = "vovik06302/finance-app"

sealed class UpdateState {
    object Idle : UpdateState()
    object Checking : UpdateState()
    data class UpToDate(val currentVersion: String) : UpdateState()
    data class UpdateAvailable(
        val latestVersion: String,
        val downloadUrl: String,
        val releaseNotes: String
    ) : UpdateState()
    data class Downloading(val progress: Int) : UpdateState()
    data class Downloaded(val apkFile: File) : UpdateState()
    data class Error(val message: String) : UpdateState()
}

class UpdateManager(private val context: Context) {

    private val _updateState = MutableStateFlow<UpdateState>(UpdateState.Idle)
    val updateState: StateFlow<UpdateState> = _updateState.asStateFlow()

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    val currentVersionName: String
        get() = try {
            val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            pInfo.versionName ?: "1.0.0"
        } catch (e: Exception) {
            "1.0.0"
        }

    suspend fun checkForUpdates() {
        _updateState.value = UpdateState.Checking
        withContext(Dispatchers.IO) {
            try {
                val url = "https://api.github.com/repos/$GITHUB_REPO/releases/latest"
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", "FinanceApp-Android")
                    .header("Accept", "application/vnd.github.v3+json")
                    .build()

                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        _updateState.value = UpdateState.Error("Релиз не найден на GitHub (${response.code})")
                        return@use
                    }

                    val bodyString = response.body?.string() ?: ""
                    val json = JSONObject(bodyString)
                    val tagName = json.optString("tag_name", "").removePrefix("v")
                    val body = json.optString("body", "Описание изменений отсутствует")

                    val assets = json.optJSONArray("assets")
                    var downloadUrl = ""

                    if (assets != null) {
                        for (i in 0 until assets.length()) {
                            val asset = assets.getJSONObject(i)
                            val name = asset.optString("name", "")
                            if (name.endsWith(".apk")) {
                                downloadUrl = asset.optString("browser_download_url", "")
                                break
                            }
                        }
                    }

                    if (downloadUrl.isEmpty()) {
                        // Fallback URL if asset not explicitly listed
                        downloadUrl = "https://github.com/$GITHUB_REPO/releases/download/v$tagName/app-release.apk"
                    }

                    if (isVersionNewer(tagName, currentVersionName)) {
                        _updateState.value = UpdateState.UpdateAvailable(
                            latestVersion = tagName,
                            downloadUrl = downloadUrl,
                            releaseNotes = body
                        )
                    } else {
                        _updateState.value = UpdateState.UpToDate(currentVersionName)
                    }
                }
            } catch (e: Exception) {
                _updateState.value = UpdateState.Error("Ошибка сети: ${e.localizedMessage ?: "не удалось связаться с GitHub"}")
            }
        }
    }

    suspend fun downloadAndInstallApk(downloadUrl: String) {
        _updateState.value = UpdateState.Downloading(0)
        withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder().url(downloadUrl).build()
                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        _updateState.value = UpdateState.Error("Ошибка скачивания файла (Код ${response.code})")
                        return@use
                    }

                    val body = response.body ?: run {
                        _updateState.value = UpdateState.Error("Пустой ответ при скачивании APK")
                        return@use
                    }

                    val contentLength = body.contentLength()
                    val apkFile = File(context.cacheDir, "update.apk")
                    if (apkFile.exists()) apkFile.delete()

                    val inputStream: InputStream = body.byteStream()
                    val outputStream = FileOutputStream(apkFile)

                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    var totalRead: Long = 0

                    while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                        totalRead += bytesRead
                        outputStream.write(buffer, 0, bytesRead)

                        if (contentLength > 0) {
                            val progress = ((totalRead * 100) / contentLength).toInt()
                            _updateState.value = UpdateState.Downloading(progress)
                        }
                    }

                    outputStream.flush()
                    outputStream.close()
                    inputStream.close()

                    _updateState.value = UpdateState.Downloaded(apkFile)
                    installApk(apkFile)
                }
            } catch (e: Exception) {
                _updateState.value = UpdateState.Error("Ошибка загрузки: ${e.localizedMessage}")
            }
        }
    }

    fun installApk(apkFile: File) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.packageManager.canRequestPackageInstalls()) {
                    val settingsIntent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                        data = Uri.parse("package:${context.packageName}")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(settingsIntent)
                    return
                }
            }

            val apkUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                apkFile
            )

            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(apkUri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(installIntent)
        } catch (e: Exception) {
            _updateState.value = UpdateState.Error("Ошибка установки: ${e.localizedMessage}")
        }
    }

    private fun isVersionNewer(newVer: String, currentVer: String): Boolean {
        val newParts = newVer.split(".").mapNotNull { it.toIntOrNull() }
        val currentParts = currentVer.split(".").mapNotNull { it.toIntOrNull() }

        for (i in 0 until maxOf(newParts.size, currentParts.size)) {
            val np = newParts.getOrElse(i) { 0 }
            val cp = currentParts.getOrElse(i) { 0 }
            if (np > cp) return true
            if (np < cp) return false
        }
        return false
    }

    fun resetState() {
        _updateState.value = UpdateState.Idle
    }
}
