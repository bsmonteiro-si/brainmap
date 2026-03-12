use brainmap_core::BrainMapError;
use serde::Serialize;

#[derive(Serialize)]
struct Response<T: Serialize> {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<ErrorPayload>,
}

#[derive(Serialize)]
struct ErrorPayload {
    code: String,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<serde_json::Value>,
}

pub fn print_json<T: Serialize>(data: &T) {
    let response = Response {
        success: true,
        data: Some(data),
        error: None::<ErrorPayload>,
    };
    println!("{}", serde_json::to_string_pretty(&response).unwrap());
}

pub fn print_json_error(err: &BrainMapError) {
    let extra_data = match err {
        BrainMapError::HasBacklinks { backlinks, .. } => {
            let links: Vec<serde_json::Value> = backlinks
                .iter()
                .map(|(source, rel)| {
                    serde_json::json!({ "source": source, "rel": rel })
                })
                .collect();
            Some(serde_json::Value::Array(links))
        }
        _ => None,
    };

    let response: Response<()> = Response {
        success: false,
        data: None,
        error: Some(ErrorPayload {
            code: err.error_code().to_string(),
            message: err.to_string(),
            data: extra_data,
        }),
    };
    eprintln!("{}", serde_json::to_string_pretty(&response).unwrap());
}

pub fn print_text(message: &str) {
    println!("{}", message);
}

pub fn print_text_error(err: &BrainMapError) {
    eprintln!("error: {}", err);
}

pub fn print_yaml<T: Serialize>(data: &T) {
    let response = Response {
        success: true,
        data: Some(data),
        error: None::<ErrorPayload>,
    };
    println!("{}", serde_yaml::to_string(&response).unwrap_or_else(|e| format!("error: {e}")));
}

pub fn print_yaml_error(err: &BrainMapError) {
    let extra_data = match err {
        BrainMapError::HasBacklinks { backlinks, .. } => {
            let links: Vec<serde_json::Value> = backlinks
                .iter()
                .map(|(source, rel)| {
                    serde_json::json!({ "source": source, "rel": rel })
                })
                .collect();
            Some(serde_json::Value::Array(links))
        }
        _ => None,
    };

    let response: Response<()> = Response {
        success: false,
        data: None,
        error: Some(ErrorPayload {
            code: err.error_code().to_string(),
            message: err.to_string(),
            data: extra_data,
        }),
    };
    eprintln!("{}", serde_yaml::to_string(&response).unwrap_or_else(|e| format!("error: {e}")));
}
