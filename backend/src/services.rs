use crate::errors::AppError;
use image::ImageFormat;

pub mod image_processor {
    use super::*;

    /// Check if the provided bytes represent a valid PNG image
    pub fn is_valid_png(data: &[u8]) -> bool {
        // Check PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
        if data.len() < 8 {
            return false;
        }
        
        let png_signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        &data[0..8] == png_signature
    }

    /// Convert PNG image data to WebP format
    /// 
    /// This function:
    /// 1. Validates the input PNG data
    /// 2. Loads the image using the `image` crate
    /// 3. Converts it to WebP format using the `webp` crate
    /// 4. Returns the WebP bytes
    pub async fn convert_png_to_webp(png_data: &[u8]) -> Result<Vec<u8>, AppError> {
        tracing::info!("🔄 Starting PNG to WebP conversion");

        // Load PNG image
        let img = image::load_from_memory_with_format(png_data, ImageFormat::Png)
            .map_err(|e| {
                tracing::error!("Failed to decode PNG image: {}", e);
                AppError::ProcessingError(format!("Failed to decode PNG: {}", e))
            })?;

        tracing::info!("📐 Image dimensions: {}x{}", img.width(), img.height());

        // Convert to RGB format (WebP encoder expects RGB)
        let rgb_img = img.to_rgb8();
        let (width, height) = rgb_img.dimensions();

        // Encode as WebP
        let encoder = webp::Encoder::from_rgb(&rgb_img, width, height);
        
        // Use quality of 85 for good balance between file size and quality
        let webp_data = encoder.encode(85.0);
        
        tracing::info!("✅ WebP conversion completed, output size: {} bytes", webp_data.len());

        Ok(webp_data.to_vec())
    }

    /// Alternative conversion method using tokio for CPU-intensive tasks
    /// This runs the conversion in a blocking thread pool to avoid blocking the async runtime
    pub async fn convert_png_to_webp_async(png_data: Vec<u8>) -> Result<Vec<u8>, AppError> {
        tokio::task::spawn_blocking(move || {
            convert_png_to_webp_sync(&png_data)
        })
        .await
        .map_err(|e| {
            tracing::error!("Task join error: {}", e);
            AppError::ProcessingError("Conversion task failed".to_string())
        })?
    }

    /// Synchronous version of the conversion for use in blocking context
    fn convert_png_to_webp_sync(png_data: &[u8]) -> Result<Vec<u8>, AppError> {
        let img = image::load_from_memory_with_format(png_data, ImageFormat::Png)
            .map_err(|e| AppError::ProcessingError(format!("Failed to decode PNG: {}", e)))?;

        let rgb_img = img.to_rgb8();
        let (width, height) = rgb_img.dimensions();

        let encoder = webp::Encoder::from_rgb(&rgb_img, width, height);
        let webp_data = encoder.encode(85.0);

        Ok(webp_data.to_vec())
    }
}
