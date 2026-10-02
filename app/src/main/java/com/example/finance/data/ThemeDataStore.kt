package com.example.finance.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.ui.theme.AppTheme
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore by preferencesDataStore(name = "theme_settings")

class ThemeDataStore(private val context: Context) {

    private val THEME_KEY = stringPreferencesKey("selected_app_theme")

    val selectedTheme: Flow<AppTheme> = context.dataStore.data.map { prefs ->
        val themeName = prefs[THEME_KEY] ?: AppTheme.BLUE.name
        try {
            AppTheme.valueOf(themeName)
        } catch (e: Exception) {
            AppTheme.BLUE
        }
    }

    suspend fun saveTheme(theme: AppTheme) {
        context.dataStore.edit { prefs ->
            prefs[THEME_KEY] = theme.name
        }
    }
}
