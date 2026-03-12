use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::error::{BrainMapError, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FederatedWorkspace {
    pub name: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceConfig {
    pub name: String,
    pub version: u32,
    pub note_types: Vec<String>,
    pub edge_types: Vec<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub federation: Vec<FederatedWorkspace>,
}

impl WorkspaceConfig {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            version: 1,
            note_types: default_note_types(),
            edge_types: default_edge_types(),
            federation: Vec::new(),
        }
    }

    pub fn register_note_type(&mut self, note_type: &str) -> bool {
        if self.note_types.iter().any(|t| t == note_type) {
            return false;
        }
        self.note_types.push(note_type.to_string());
        true
    }

    pub fn register_edge_type(&mut self, edge_type: &str) -> bool {
        if self.edge_types.iter().any(|t| t == edge_type) {
            return false;
        }
        self.edge_types.push(edge_type.to_string());
        true
    }

    pub fn add_federation(&mut self, name: &str, path: &str) {
        self.federation.retain(|f| f.name != name);
        self.federation.push(FederatedWorkspace {
            name: name.to_string(),
            path: path.to_string(),
        });
    }

    pub fn remove_federation(&mut self, name: &str) -> bool {
        let before = self.federation.len();
        self.federation.retain(|f| f.name != name);
        self.federation.len() < before
    }
}

pub fn load_config(brainmap_dir: &Path) -> Result<WorkspaceConfig> {
    let config_path = brainmap_dir.join("config.yaml");
    let content = std::fs::read_to_string(&config_path).map_err(|_| {
        BrainMapError::InvalidWorkspace(format!(
            "config.yaml not found in {}",
            brainmap_dir.display()
        ))
    })?;
    let config: WorkspaceConfig = serde_yaml::from_str(&content)?;
    Ok(config)
}

pub fn save_config(config: &WorkspaceConfig, brainmap_dir: &Path) -> Result<()> {
    let config_path = brainmap_dir.join("config.yaml");
    let yaml = serde_yaml::to_string(config)?;
    std::fs::write(config_path, yaml)?;
    Ok(())
}

fn default_note_types() -> Vec<String> {
    vec![
        "concept",
        "book-note",
        "question",
        "reference",
        "index",
        "argument",
        "evidence",
        "experiment",
        "person",
        "project",
    ]
    .into_iter()
    .map(String::from)
    .collect()
}

fn default_edge_types() -> Vec<String> {
    vec![
        "contains",
        "part-of",
        "causes",
        "supports",
        "contradicts",
        "extends",
        "depends-on",
        "exemplifies",
        "precedes",
        "leads-to",
        "evolved-from",
        "related-to",
        "authored-by",
        "sourced-from",
        "mentioned-in",
    ]
    .into_iter()
    .map(String::from)
    .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_default_config() {
        let config = WorkspaceConfig::new("test");
        assert_eq!(config.name, "test");
        assert_eq!(config.version, 1);
        assert_eq!(config.note_types.len(), 10);
        assert_eq!(config.edge_types.len(), 15);
    }

    #[test]
    fn test_round_trip() {
        let dir = TempDir::new().unwrap();
        let config = WorkspaceConfig::new("round-trip");
        save_config(&config, dir.path()).unwrap();
        let loaded = load_config(dir.path()).unwrap();

        assert_eq!(loaded.name, "round-trip");
        assert_eq!(loaded.note_types.len(), 10);
    }

    #[test]
    fn test_register_new_type() {
        let mut config = WorkspaceConfig::new("test");
        assert!(config.register_note_type("custom-type"));
        assert!(!config.register_note_type("custom-type"));
        assert_eq!(config.note_types.len(), 11);
    }
}
