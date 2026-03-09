use rusqlite::{params, Connection};
use std::path::Path;

use crate::error::{BrainMapError, Result};
use crate::model::{Edge, EdgeKind, Note, RelativePath};

pub struct Index {
    conn: Connection,
}

#[derive(Debug, Clone)]
pub struct SearchResult {
    pub path: String,
    pub title: String,
    pub note_type: String,
    pub snippet: String,
    pub rank: f64,
}

#[derive(Debug, Default)]
pub struct SearchFilters {
    pub note_type: Option<String>,
    pub tag: Option<String>,
    pub status: Option<String>,
}

impl Index {
    pub fn open(db_path: &Path) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        let index = Self { conn };
        index.create_schema()?;
        Ok(index)
    }

    pub fn open_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        let index = Self { conn };
        index.create_schema()?;
        Ok(index)
    }

    fn create_schema(&self) -> Result<()> {
        self.conn.execute_batch(
            "CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
                path, title, type, tags, content, summary
            );

            CREATE TABLE IF NOT EXISTS notes_meta (
                path TEXT PRIMARY KEY,
                id TEXT,
                type TEXT,
                status TEXT,
                created TEXT,
                modified TEXT,
                file_mtime INTEGER
            );

            CREATE TABLE IF NOT EXISTS edges (
                source TEXT,
                target TEXT,
                rel TEXT,
                implicit INTEGER,
                PRIMARY KEY (source, target, rel)
            );",
        )?;
        Ok(())
    }

    pub fn add_note(&self, note: &Note, file_mtime: i64) -> Result<()> {
        let path = note.path.as_str();
        let tags = note.frontmatter.tags.join(", ");
        let content = strip_markdown(&note.body);
        let status = note
            .frontmatter
            .status
            .as_ref()
            .map(|s| format!("{:?}", s).to_lowercase())
            .unwrap_or_default();

        self.conn.execute(
            "INSERT INTO notes_fts (path, title, type, tags, content, summary)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                path,
                note.frontmatter.title,
                note.frontmatter.note_type,
                tags,
                content,
                note.frontmatter.summary.as_deref().unwrap_or(""),
            ],
        )?;

        self.conn.execute(
            "INSERT OR REPLACE INTO notes_meta (path, id, type, status, created, modified, file_mtime)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                path,
                note.frontmatter.id.to_string(),
                note.frontmatter.note_type,
                status,
                note.frontmatter.created.to_string(),
                note.frontmatter.modified.to_string(),
                file_mtime,
            ],
        )?;

        Ok(())
    }

    pub fn remove_note(&self, path: &RelativePath) -> Result<()> {
        self.conn.execute(
            "DELETE FROM notes_fts WHERE path = ?1",
            params![path.as_str()],
        )?;
        self.conn.execute(
            "DELETE FROM notes_meta WHERE path = ?1",
            params![path.as_str()],
        )?;
        self.conn.execute(
            "DELETE FROM edges WHERE source = ?1 OR target = ?1",
            params![path.as_str()],
        )?;
        Ok(())
    }

    pub fn update_note(&self, note: &Note, file_mtime: i64) -> Result<()> {
        self.remove_note(&note.path)?;
        self.add_note(note, file_mtime)?;
        Ok(())
    }

    pub fn add_edges(&self, edges: &[Edge]) -> Result<()> {
        let tx = self.conn.unchecked_transaction()?;
        for edge in edges {
            let implicit = match edge.kind {
                EdgeKind::Implicit => 1,
                _ => 0,
            };
            tx.execute(
                "INSERT OR IGNORE INTO edges (source, target, rel, implicit) VALUES (?1, ?2, ?3, ?4)",
                params![edge.source.as_str(), edge.target.as_str(), edge.rel, implicit],
            )?;
        }
        tx.commit()?;
        Ok(())
    }

    pub fn search(&self, query: &str, filters: &SearchFilters) -> Result<Vec<SearchResult>> {
        let mut sql = String::from(
            "SELECT f.path, f.title, f.type, snippet(notes_fts, 4, '<b>', '</b>', '...', 32) as snip,
                    rank
             FROM notes_fts f
             JOIN notes_meta m ON f.path = m.path
             WHERE notes_fts MATCH ?1",
        );

        let mut param_values: Vec<String> = vec![query.to_string()];

        if let Some(ref t) = filters.note_type {
            param_values.push(t.clone());
            sql.push_str(&format!(" AND m.type = ?{}", param_values.len()));
        }
        if let Some(ref s) = filters.status {
            param_values.push(s.clone());
            sql.push_str(&format!(" AND m.status = ?{}", param_values.len()));
        }

        sql.push_str(" ORDER BY rank LIMIT 50");

        let mut stmt = self.conn.prepare(&sql)?;

        let params: Vec<&dyn rusqlite::types::ToSql> =
            param_values.iter().map(|v| v as &dyn rusqlite::types::ToSql).collect();

        let results = stmt
            .query_map(params.as_slice(), |row| {
                Ok(SearchResult {
                    path: row.get(0)?,
                    title: row.get(1)?,
                    note_type: row.get(2)?,
                    snippet: row.get(3)?,
                    rank: row.get(4)?,
                })
            })?
            .collect::<std::result::Result<Vec<_>, _>>()
            .map_err(|e| BrainMapError::IndexCorrupt(e.to_string()))?;

        Ok(results)
    }

    pub fn backlinks(&self, path: &RelativePath) -> Result<Vec<(String, String)>> {
        let mut stmt = self.conn.prepare(
            "SELECT source, rel FROM edges WHERE target = ?1",
        )?;

        let results = stmt
            .query_map(params![path.as_str()], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })?
            .collect::<std::result::Result<Vec<_>, _>>()
            .map_err(|e| BrainMapError::IndexCorrupt(e.to_string()))?;

        Ok(results)
    }

    pub fn is_stale(&self, path: &RelativePath, current_mtime: i64) -> Result<bool> {
        let stored: std::result::Result<i64, _> = self.conn.query_row(
            "SELECT file_mtime FROM notes_meta WHERE path = ?1",
            params![path.as_str()],
            |row| row.get(0),
        );

        match stored {
            Ok(mtime) => Ok(mtime != current_mtime),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(true),
            Err(e) => Err(e.into()),
        }
    }

    pub fn rebuild(&self, notes: &[(&Note, i64)], edges: &[Edge]) -> Result<()> {
        self.conn.execute_batch(
            "DELETE FROM notes_fts;
             DELETE FROM notes_meta;
             DELETE FROM edges;",
        )?;

        for (note, mtime) in notes {
            self.add_note(note, *mtime)?;
        }
        self.add_edges(edges)?;

        Ok(())
    }
}

fn strip_markdown(content: &str) -> String {
    let mut result = String::with_capacity(content.len());
    for ch in content.chars() {
        match ch {
            '#' | '*' | '_' | '`' | '[' | ']' | '(' | ')' | '>' | '!' | '|' => {
                result.push(' ');
            }
            _ => result.push(ch),
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::*;
    use chrono::NaiveDate;

    fn make_test_note(path: &str, title: &str, body: &str) -> Note {
        Note {
            path: RelativePath::new(path),
            frontmatter: Frontmatter {
                id: NoteId::new(),
                title: title.to_string(),
                note_type: "concept".to_string(),
                tags: vec!["test".to_string()],
                status: Some(Status::Draft),
                created: NaiveDate::from_ymd_opt(2025, 1, 15).unwrap(),
                modified: NaiveDate::from_ymd_opt(2025, 1, 15).unwrap(),
                source: None,
                summary: Some("A test note".to_string()),
                links: vec![],
                extra: std::collections::HashMap::new(),
            },
            body: body.to_string(),
            inline_links: vec![],
        }
    }

    #[test]
    fn test_add_and_search() {
        let idx = Index::open_in_memory().unwrap();
        let note = make_test_note("test.md", "Causality", "Causality is the study of cause and effect.");
        idx.add_note(&note, 1000).unwrap();

        let results = idx.search("causality", &SearchFilters::default()).unwrap();
        assert!(!results.is_empty());
        assert_eq!(results[0].path, "test.md");
    }

    #[test]
    fn test_remove_and_search() {
        let idx = Index::open_in_memory().unwrap();
        let note = make_test_note("test.md", "Causality", "content");
        idx.add_note(&note, 1000).unwrap();
        idx.remove_note(&note.path).unwrap();

        let results = idx.search("causality", &SearchFilters::default()).unwrap();
        assert!(results.is_empty());
    }

    #[test]
    fn test_backlinks() {
        let idx = Index::open_in_memory().unwrap();
        let edges = vec![Edge {
            source: RelativePath::new("a.md"),
            target: RelativePath::new("b.md"),
            rel: "supports".to_string(),
            kind: EdgeKind::Explicit,
        }];
        idx.add_edges(&edges).unwrap();

        let backlinks = idx.backlinks(&RelativePath::new("b.md")).unwrap();
        assert_eq!(backlinks.len(), 1);
        assert_eq!(backlinks[0].0, "a.md");
        assert_eq!(backlinks[0].1, "supports");
    }

    #[test]
    fn test_staleness() {
        let idx = Index::open_in_memory().unwrap();
        let note = make_test_note("test.md", "Test", "content");
        idx.add_note(&note, 1000).unwrap();

        assert!(!idx.is_stale(&note.path, 1000).unwrap());
        assert!(idx.is_stale(&note.path, 2000).unwrap());
        assert!(idx.is_stale(&RelativePath::new("missing.md"), 1000).unwrap());
    }
}
