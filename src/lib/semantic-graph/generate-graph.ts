import { SemanticGraph, SemanticNode, SemanticLink } from "@/types/semantic-graph";

/**
 * Generates a semantic graph from word data
 *
 * This function takes word data from the API and transforms it into
 * a graph structure that can be visualized.
 *
 * @param wordData - The word data from the API
 * @returns A semantic graph structure
 */
export function generateSemanticGraph ( wordData: any ): SemanticGraph
{
  if ( !wordData )
  {
    console.error( "Cannot generate semantic graph: No word data provided" );
    return { nodes: [], links: [] };
  }

  console.log( "Generating semantic graph for:", wordData.word );

  // Create the primary node for the main word
  const primaryNode: SemanticNode = {
    id: wordData.word,
    word: wordData.word,
    type: 'primary',
    weight: 1,
    definitions: [ wordData.coreMeaning ],
    etymology: wordData.etymology,
  };

  const nodes: SemanticNode[] = [ primaryNode ];
  const links: SemanticLink[] = [];

  // Process related words
  if ( wordData.relatedWords && Array.isArray( wordData.relatedWords ) )
  {
    wordData.relatedWords.forEach( ( related: any, index: number ) =>
    {
      // Skip if no word
      if ( !related.word ) return;

      // Determine node type based on the relationship
      let nodeType: SemanticNode[ 'type' ] = 'related';
      let linkType: SemanticLink[ 'type' ] = 'related';

      // Map relationship types
      if ( related.type?.toLowerCase().includes( 'synonym' ) )
      {
        nodeType = 'synonym';
        linkType = 'synonym';
      } else if ( related.type?.toLowerCase().includes( 'antonym' ) )
      {
        nodeType = 'antonym';
        linkType = 'antonym';
      } else if ( related.type?.toLowerCase().includes( 'root' ) ||
        related.type?.toLowerCase().includes( 'etymology' ) )
      {
        nodeType = 'root';
        linkType = 'derivation';
      }

      // Create node for the related word
      const node: SemanticNode = {
        id: related.word,
        word: related.word,
        type: nodeType,
        // Weight decreases with index to show importance
        weight: Math.max( 0.3, 1 - ( index * 0.1 ) ),
        definitions: related.meaning ? [ related.meaning ] : undefined,
      };

      // Create link between primary word and related word
      const link: SemanticLink = {
        source: primaryNode.id,
        target: node.id,
        type: linkType,
        // Weight matches node weight
        weight: node.weight,
      };

      nodes.push( node );
      links.push( link );
    } );
  }

  // Add connections between related words based on similarity
  // This creates a more interesting graph structure
  for ( let i = 1; i < nodes.length; i++ )
  {
    for ( let j = i + 1; j < nodes.length; j++ )
    {
      // Only connect nodes of the same type with some probability
      if ( nodes[ i ].type === nodes[ j ].type && Math.random() > 0.7 )
      {
        links.push( {
          source: nodes[ i ].id,
          target: nodes[ j ].id,
          type: nodes[ i ].type as SemanticLink[ 'type' ],
          weight: 0.3, // Weaker connections between related words
        } );
      }
    }
  }

  console.log( `Generated semantic graph with ${ nodes.length } nodes and ${ links.length } links` );

  return {
    nodes,
    links,
  };
}

/**
 * Enriches a semantic graph with additional data
 *
 * This function would typically call an AI service to enhance
 * the graph with additional relationships and information.
 * Currently returns the original graph as a placeholder.
 *
 * @param graph - The semantic graph to enrich
 * @returns The enriched semantic graph
 */
export async function enrichSemanticGraph ( graph: SemanticGraph ): Promise<SemanticGraph>
{
  // This is a placeholder for future AI-based graph enrichment
  // In a real implementation, this would call Perplexity or another AI service
  // to add more nodes and links based on deeper semantic analysis

  console.log( "Enriching semantic graph (placeholder)" );

  return graph;
}