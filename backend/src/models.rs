use serde::{Deserialize, Serialize};

/// Response model for successful image conversion
#[derive(Debug, Serialize)]
pub struct ConvertResponse {
    pub success: bool,
    pub message: String,
    pub filename: String,
    pub webp_data: String,  // Base64 encoded WebP data
    pub original_size: usize,
    pub converted_size: usize,
    pub compression_ratio: f64,  // Percentage saved
}

/// Error response model
#[derive(Debug, Serialize)]
pub struct ApiError {
    pub success: bool,
    pub error: String,
    pub code: String,
    pub timestamp: String,
}

/// Request model for image conversion (if using JSON instead of multipart)
#[derive(Debug, Deserialize)]
pub struct ConvertRequest {
    pub image_data: String,  // Base64 encoded PNG data
    pub filename: Option<String>,
}

/// Video compression quality settings
#[derive(Debug, Deserialize, Clone)]
pub struct VideoCompressionSettings {
    pub quality: CompressionQuality,
    pub audio_bitrate: Option<String>,
}

/// Compression quality levels
#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum CompressionQuality {
    /// Maximum compression, smallest file size (CRF 35-40)
    Maximum,
    /// High compression, good balance (CRF 28-32)
    High,
    /// Balanced compression and quality (CRF 23-28)
    Balanced,
    /// Low compression, better quality (CRF 18-23)
    Low,
    /// Minimal compression, highest quality (CRF 15-18)
    Minimal,
}

impl Default for VideoCompressionSettings {
    fn default() -> Self {
        Self {
            quality: CompressionQuality::High,
            audio_bitrate: Some("64k".to_string()),
        }
    }
}

impl CompressionQuality {
    /// Get CRF value for the quality setting
    pub fn crf_value(&self) -> u8 {
        match self {
            CompressionQuality::Maximum => 35,
            CompressionQuality::High => 28,
            CompressionQuality::Balanced => 25,
            CompressionQuality::Low => 20,
            CompressionQuality::Minimal => 18,
        }
    }

    /// Get CPU usage setting for encoding speed vs quality trade-off
    pub fn cpu_used(&self) -> u8 {
        match self {
            CompressionQuality::Maximum => 6,  // Fastest encoding
            CompressionQuality::High => 4,     // Balanced
            CompressionQuality::Balanced => 3,  // Slower but better compression
            CompressionQuality::Low => 2,      // Slow but good quality
            CompressionQuality::Minimal => 1,  // Slowest but best quality
        }
    }

    /// Get deadline setting
    pub fn deadline(&self) -> &'static str {
        match self {
            CompressionQuality::Maximum => "realtime",
            CompressionQuality::High => "good",
            CompressionQuality::Balanced => "good",
            CompressionQuality::Low => "best",
            CompressionQuality::Minimal => "best",
        }
    }
}
