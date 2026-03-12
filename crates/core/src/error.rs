use thiserror::Error;

pub type Result<T> = std::result::Result<T, BrainMapError>;

#[derive(Debug, Error)]
pub enum BrainMapError {
    #[error("file not found: {0}")]
    FileNotFound(String),

    #[error("duplicate path: {0}")]
    DuplicatePath(String),

    #[error("invalid YAML frontmatter: {0}")]
    InvalidYaml(String),

    #[error("broken link target: {from} -> {to}")]
    BrokenLinkTarget { from: String, to: String },

    #[error("duplicate link: {from} -> {to} ({rel})")]
    DuplicateLink {
        from: String,
        to: String,
        rel: String,
    },

    #[error("link not found: {from} -> {to} ({rel})")]
    LinkNotFound { from: String, to: String, rel: String },

    #[error("invalid argument: {0}")]
    InvalidArgument(String),

    #[error("note has incoming links and cannot be deleted without --force")]
    HasBacklinks { path: String, backlinks: Vec<(String, String)> },

    #[error("invalid workspace: {0}")]
    InvalidWorkspace(String),

    #[error("workspace already exists at {0}")]
    WorkspaceExists(String),

    #[error("index corrupt: {0}")]
    IndexCorrupt(String),

    #[error("config error: {0}")]
    ConfigError(String),

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Yaml(#[from] serde_yaml::Error),

    #[error(transparent)]
    Sqlite(#[from] rusqlite::Error),
}

impl BrainMapError {
    pub fn error_code(&self) -> &str {
        match self {
            BrainMapError::FileNotFound(_) => "FILE_NOT_FOUND",
            BrainMapError::DuplicatePath(_) => "DUPLICATE_PATH",
            BrainMapError::InvalidYaml(_) => "INVALID_YAML",
            BrainMapError::BrokenLinkTarget { .. } => "BROKEN_LINK_TARGET",
            BrainMapError::DuplicateLink { .. } => "DUPLICATE_LINK",
            BrainMapError::LinkNotFound { .. } => "LINK_NOT_FOUND",
            BrainMapError::InvalidArgument(_) => "INVALID_ARGUMENT",
            BrainMapError::HasBacklinks { .. } => "HAS_BACKLINKS",
            BrainMapError::InvalidWorkspace(_) => "INVALID_WORKSPACE",
            BrainMapError::WorkspaceExists(_) => "WORKSPACE_EXISTS",
            BrainMapError::IndexCorrupt(_) => "INDEX_CORRUPT",
            BrainMapError::ConfigError(_) => "CONFIG_ERROR",
            BrainMapError::Io(_) => "IO_ERROR",
            BrainMapError::Yaml(_) => "YAML_ERROR",
            BrainMapError::Sqlite(_) => "SQLITE_ERROR",
        }
    }
}
