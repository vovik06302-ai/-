package com.example.ui.theme

import androidx.compose.ui.graphics.Color

enum class AppTheme(val label: String, val primaryColor: Color) {
    BLUE("Синяя", Color(0xFF1565C0)),
    GREEN("Зелёная", Color(0xFF2E7D32)),
    PURPLE("Фиолетовая", Color(0xFF7B1FA2)),
    ORANGE("Оранжевая", Color(0xFFE65100)),
    RED("Красная", Color(0xFFC62828))
}

// Light Schemes
val BlueLightPrimary = Color(0xFF1565C0)
val BlueLightContainer = Color(0xFFD0E4FF)

val GreenLightPrimary = Color(0xFF2E7D32)
val GreenLightContainer = Color(0xFFC8E6C9)

val PurpleLightPrimary = Color(0xFF7B1FA2)
val PurpleLightContainer = Color(0xFFE1BEE7)

val OrangeLightPrimary = Color(0xFFE65100)
val OrangeLightContainer = Color(0xFFFFE0B2)

val RedLightPrimary = Color(0xFFC62828)
val RedLightContainer = Color(0xFFFFCDD2)

// Dark Schemes
val BlueDarkPrimary = Color(0xFF90CAF9)
val BlueDarkContainer = Color(0xFF0D47A1)

val GreenDarkPrimary = Color(0xFFA5D6A7)
val GreenDarkContainer = Color(0xFF1B5E20)

val PurpleDarkPrimary = Color(0xFFCE93D8)
val PurpleDarkContainer = Color(0xFF4A148C)

val OrangeDarkPrimary = Color(0xFFFFCC80)
val OrangeDarkContainer = Color(0xFFBF360C)

val RedDarkPrimary = Color(0xFFEF9A9A)
val RedDarkContainer = Color(0xFFB71C1C)
