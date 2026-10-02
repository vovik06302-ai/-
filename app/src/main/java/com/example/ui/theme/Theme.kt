package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

@Composable
fun MyApplicationTheme(
    appTheme: AppTheme = AppTheme.BLUE,
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        when (appTheme) {
            AppTheme.BLUE -> darkColorScheme(
                primary = BlueDarkPrimary,
                primaryContainer = BlueDarkContainer,
                onPrimary = Color.Black,
                secondary = BlueDarkPrimary
            )
            AppTheme.GREEN -> darkColorScheme(
                primary = GreenDarkPrimary,
                primaryContainer = GreenDarkContainer,
                onPrimary = Color.Black,
                secondary = GreenDarkPrimary
            )
            AppTheme.PURPLE -> darkColorScheme(
                primary = PurpleDarkPrimary,
                primaryContainer = PurpleDarkContainer,
                onPrimary = Color.Black,
                secondary = PurpleDarkPrimary
            )
            AppTheme.ORANGE -> darkColorScheme(
                primary = OrangeDarkPrimary,
                primaryContainer = OrangeDarkContainer,
                onPrimary = Color.Black,
                secondary = OrangeDarkPrimary
            )
            AppTheme.RED -> darkColorScheme(
                primary = RedDarkPrimary,
                primaryContainer = RedDarkContainer,
                onPrimary = Color.Black,
                secondary = RedDarkPrimary
            )
        }
    } else {
        when (appTheme) {
            AppTheme.BLUE -> lightColorScheme(
                primary = BlueLightPrimary,
                primaryContainer = BlueLightContainer,
                onPrimary = Color.White,
                secondary = BlueLightPrimary
            )
            AppTheme.GREEN -> lightColorScheme(
                primary = GreenLightPrimary,
                primaryContainer = GreenLightContainer,
                onPrimary = Color.White,
                secondary = GreenLightPrimary
            )
            AppTheme.PURPLE -> lightColorScheme(
                primary = PurpleLightPrimary,
                primaryContainer = PurpleLightContainer,
                onPrimary = Color.White,
                secondary = PurpleLightPrimary
            )
            AppTheme.ORANGE -> lightColorScheme(
                primary = OrangeLightPrimary,
                primaryContainer = OrangeLightContainer,
                onPrimary = Color.White,
                secondary = OrangeLightPrimary
            )
            AppTheme.RED -> lightColorScheme(
                primary = RedLightPrimary,
                primaryContainer = RedLightContainer,
                onPrimary = Color.White,
                secondary = RedLightPrimary
            )
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
