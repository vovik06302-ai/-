package com.example.finance.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun RainbowProgressBar(
    progress: Int,
    modifier: Modifier = Modifier
) {
    val animatedProgress by animateFloatAsState(
        targetValue = (progress.coerceIn(0, 100) / 100f),
        label = "RainbowProgressAnimation"
    )

    // Rainbow Gradient: Red -> Orange -> Yellow -> Green -> Cyan -> Blue -> Purple
    val rainbowColors = listOf(
        Color(0xFFFF0000), // Красный
        Color(0xFFFF7F00), // Оранжевый
        Color(0xFFFFFF00), // Жёлтый
        Color(0xFF00FF00), // Зелёный
        Color(0xFF00FFFF), // Голубой (Cyan)
        Color(0xFF0000FF), // Синий
        Color(0xFF8B00FF)  // Фиолетовый
    )

    val rainbowBrush = Brush.horizontalGradient(colors = rainbowColors)

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(20.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(animatedProgress)
                    .height(20.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(rainbowBrush)
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = "$progress%",
            style = MaterialTheme.typography.bodyMedium.copy(
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            ),
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}
