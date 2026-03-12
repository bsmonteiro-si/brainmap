use std::path::Path;

use brainmap_core::Result;
use brainmap_mcp::BrainMapMcp;
use rmcp::ServiceExt;

pub fn execute(workspace_path: &Path) -> Result<()> {
    let mcp = BrainMapMcp::new(workspace_path)?;

    let rt = tokio::runtime::Runtime::new()
        .map_err(|e| brainmap_core::BrainMapError::ConfigError(format!("failed to create async runtime: {}", e)))?;

    rt.block_on(async {
        let transport = tokio::io::join(tokio::io::stdin(), tokio::io::stdout());
        let server = mcp
            .serve(transport)
            .await
            .map_err(|e| brainmap_core::BrainMapError::ConfigError(format!("MCP server error: {}", e)))?;

        server
            .waiting()
            .await
            .map_err(|e| brainmap_core::BrainMapError::ConfigError(format!("MCP server error: {}", e)))?;

        Ok(())
    })
}
