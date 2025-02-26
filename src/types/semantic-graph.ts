/**
 * Semantic Graph Types
 *
 * Type definitions for the semantic clustering visualization feature.
 * These types define the data structure for representing word relationships
 * in a graph format that can be visualized using D3.js or react-force-graph.
 */

/**
 * Represents a node in the semantic graph (a word or concept)
 */
export interface SemanticNode {
  id: string;          // Unique identifier for the node
  word: string;        // The actual word
  type: 'primary' | 'synonym' | 'antonym' | 'related' | 'root';  // Type of node
  weight: number;      // Relationship strength (0-1)
  definitions?: string[];  // Optional definitions
  etymology?: string;  // Optional etymology information
  color?: string;      // Optional color for visualization
}

/**
 * Represents a link between two nodes in the semantic graph
 */
export interface SemanticLink {
  source: string;      // Source node ID
  target: string;      // Target node ID
  type: 'synonym' | 'antonym' | 'related' | 'derivation';  // Type of relationship
  weight: number;      // Relationship strength (0-1)
  color?: string;      // Optional color for visualization
}

/**
 * Represents the complete semantic graph structure
 */
export interface SemanticGraph {
  nodes: SemanticNode[];  // Array of nodes
  links: SemanticLink[];  // Array of links between nodes
}

/**
 * Configuration options for the semantic graph visualization
 */
export interface SemanticGraphConfig {
  minNodeSize: number;    // Minimum node size
  maxNodeSize: number;    // Maximum node size
  minLinkWidth: number;   // Minimum link width
  maxLinkWidth: number;   // Maximum link width
  nodeColorMap: Record<SemanticNode['type'], string>;  // Color mapping for node types
  linkColorMap: Record<SemanticLink['type'], string>;  // Color mapping for link types
  defaultNodeColor: string;  // Default node color
  defaultLinkColor: string;  // Default link color
}

/**
 * Default configuration for semantic graph visualization
 */
export const DEFAULT_GRAPH_CONFIG: SemanticGraphConfig = {
  minNodeSize: 4,
  maxNodeSize: 12,
  minLinkWidth: 1,
  maxLinkWidth: 3,
  nodeColorMap: {
    primary: '#6366f1',  // Indigo
    synonym: '#8b5cf6',  // Violet
    antonym: '#ec4899',  // Pink
    related: '#10b981',  // Emerald
    root: '#f59e0b',     // Amber
  },
  linkColorMap: {
    synonym: '#8b5cf6',  // Violet
    antonym: '#ec4899',  // Pink
    related: '#10b981',  // Emerald
    derivation: '#f59e0b',  // Amber
  },
  defaultNodeColor: '#6366f1',  // Indigo
  defaultLinkColor: '#94a3b8',  // Slate
};