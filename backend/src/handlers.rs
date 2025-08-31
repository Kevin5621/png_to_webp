use axum::{
    extract::Multipart,
    response::Json,
};
use serde_json::{json, Value};
use base64::{Engine as _, engine::general_purpose};
use crate::services::image_processor;
use crate::services::video_processor;
use crate::models::ConvertResponse;
use crate::errors::AppError;

/// Health check endpoint
pub async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "healthy",
        "service": "png-to-webp-converter",
        "version": "0.1.0",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

/// Convert PNG image to WebP format
/// 
/// Accepts multipart/form-data with 'image' field containing PNG file
/// Returns converted WebP image as base64 encoded string
pub async fn convert_image(mut multipart: Multipart) -> Result<Json<ConvertResponse>, AppError> {
    tracing::info!("🖼️  Received image conversion request");

    let mut image_data: Option<Vec<u8>> = None;
    let mut filename: Option<String> = None;

    // Parse multipart form data
    while let Some(field) = multipart.next_field().await.map_err(|e| {
        tracing::error!("Failed to parse multipart field: {}", e);
        AppError::BadRequest("Invalid multipart data".to_string())
    })? {
        let field_name = field.name().unwrap_or("unknown");
        
        match field_name {
            "image" => {
                filename = field.file_name().map(|s| s.to_string());
                let data = field.bytes().await.map_err(|e| {
                    tracing::error!("Failed to read image data: {}", e);
                    AppError::BadRequest("Failed to read image data".to_string())
                })?;
                image_data = Some(data.to_vec());
                tracing::info!("📁 Received file: {:?}, size: {} bytes", filename, data.len());
            }
            _ => {
                tracing::warn!("🚫 Ignored unknown field: {}", field_name);
            }
        }
    }

    // Validate that we received image data
    let image_bytes = image_data.ok_or_else(|| {
        tracing::error!("No image field found in request");
        AppError::BadRequest("No image field found".to_string())
    })?;

    // Validate file is PNG
    if !image_processor::is_valid_png(&image_bytes) {
        tracing::error!("📸 Invalid PNG file received");
        return Err(AppError::BadRequest("File is not a valid PNG image".to_string()));
    }

    // Convert PNG to WebP
    let webp_data = image_processor::convert_png_to_webp(&image_bytes).await?;
    
    // Generate output filename
    let original_filename = filename.clone();
    let output_filename = filename
        .and_then(|f| f.strip_suffix(".png").map(|s| s.to_string()))
        .unwrap_or_else(|| "converted".to_string()) + ".webp";

    tracing::info!("✅ Successfully converted image: {} -> {}", 
                   original_filename.unwrap_or_else(|| "unknown.png".to_string()), 
                   output_filename);

    // Encode WebP data as base64
    let webp_base64 = general_purpose::STANDARD.encode(&webp_data);
    
    let response = ConvertResponse {
        success: true,
        message: "Image converted successfully".to_string(),
        filename: output_filename,
        webp_data: webp_base64,
        original_size: image_bytes.len(),
        converted_size: webp_data.len(),
        compression_ratio: (1.0 - (webp_data.len() as f64 / image_bytes.len() as f64)) * 100.0,
    };

    tracing::info!("📡 Sending response: {} bytes -> {} bytes ({}% reduction)", 
                   response.original_size, 
                   response.converted_size,
                   response.compression_ratio);

    Ok(Json(response))
}

/// Convert MP4 video to WebM
///
/// Accepts multipart/form-data with 'video' field containing MP4 file
/// Returns converted WebM as base64 encoded string
pub async fn convert_video(mut multipart: Multipart) -> Result<Json<ConvertResponse>, AppError> {
    tracing::info!("🎬 Received video conversion request");

    let mut video_data: Option<Vec<u8>> = None;
    let mut filename: Option<String> = None;

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        tracing::error!("Failed to parse multipart field: {}", e);
        AppError::BadRequest("Invalid multipart data".to_string())
    })? {
        let field_name = field.name().unwrap_or("unknown");

        match field_name {
            "video" => {
                filename = field.file_name().map(|s| s.to_string());
                let data = field.bytes().await.map_err(|e| {
                    tracing::error!("Failed to read video data: {}", e);
                    AppError::BadRequest("Failed to read video data".to_string())
                })?;
                video_data = Some(data.to_vec());
                tracing::info!("📁 Received file: {:?}, size: {} bytes", filename, data.len());
            }
            _ => {
                tracing::warn!("🚫 Ignored unknown field: {}", field_name);
            }
        }
    }

    let video_bytes = video_data.ok_or_else(|| {
        tracing::error!("No video field found in request");
        AppError::BadRequest("No video field found".to_string())
    })?;

    // Call service to convert MP4 -> WebM using ffmpeg (runs in blocking thread)
    let original_len = video_bytes.len();
    let webm_data = video_processor::convert_mp4_to_webm(video_bytes).await?;

    // Generate output filename
    let output_filename = filename
        .and_then(|f| f.rsplit_once('.').map(|(s, _)| format!("{}.webm", s)))
        .unwrap_or_else(|| "converted.webm".to_string());

    // Encode WebM to base64
    let webm_base64 = general_purpose::STANDARD.encode(&webm_data);

    let response = ConvertResponse {
        success: true,
        message: "Video converted successfully".to_string(),
        filename: output_filename,
        webp_data: webm_base64,
        original_size: original_len,
        converted_size: webm_data.len(),
        compression_ratio: (1.0 - (webm_data.len() as f64 / original_len as f64)) * 100.0,
    };

    tracing::info!("✅ Video conversion completed, output size: {} bytes", response.converted_size);

    Ok(Json(response))
}
