use axum::{
    http::StatusCode,
    response::{IntoResponse, Json},
};
use serde_json::json;
use thiserror::Error;

/// Application-specific error types
#[derive(Error, Debug)]
pub enum AppError {
    #[error("Bad request: {0}")]
    BadRequest(String),
    
    #[error("Processing error: {0}")]
    ProcessingError(String),
    
    #[error("Internal server error: {0}")]
    InternalError(String),
    
    #[error("File not found: {0}")]
    NotFound(String),
}

/// Convert AppError to HTTP response
impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message, error_code) = match self {
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg, "BAD_REQUEST"),
            AppError::ProcessingError(msg) => (StatusCode::UNPROCESSABLE_ENTITY, msg, "PROCESSING_ERROR"),
            AppError::InternalError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg, "INTERNAL_ERROR"),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg, "NOT_FOUND"),
        };

        tracing::error!("❌ API Error: {} - {}", error_code, error_message);

        let body = Json(json!({
            "success": false,
            "error": error_message,
            "code": error_code,
            "timestamp": chrono::Utc::now().to_rfc3339()
        }));

        (status, body).into_response()
    }
}
