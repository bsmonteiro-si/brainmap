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

    #[error("link not found: {from} -> {to}")]
    LinkNotFound { from: String, to: String },

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
