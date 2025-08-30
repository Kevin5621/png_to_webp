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
