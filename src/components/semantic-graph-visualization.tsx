"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ForceGraph2D } from "react-force-graph";
import { SemanticGraph, SemanticNode, SemanticLink, DEFAULT_GRAPH_CONFIG } from "@/types/semantic-graph";
import { SectionalErrorBoundary } from "@/lib/error-handling/error-boundaries";
import { useErrorHandling } from "@/context/error-context";
import { toast } from "sonner";

/**
 * Props for the SemanticGraphVisualization component
 */
interface SemanticGraphVisualizationProps
{
  word?: string;
  className?: string;
}

/**
 * SemanticGraphVisualization component
 *
 * This component displays a force-directed graph visualization of semantic relationships
 * between words. It fetches data from the semantic-graph API endpoint.
 */
export function SemanticGraphVisualization ( { word, className = "" }: SemanticGraphVisualizationProps )
{
  return (
    <SectionalErrorBoundary>
      <SemanticGraphVisualizationContent word={ word } className={ className } />
    </SectionalErrorBoundary>
  );
}

/**
 * SemanticGraphVisualizationContent component
 *
 * The actual implementation of the semantic graph visualization.
 * Separated from the main component to allow error boundary wrapping.
 */
function SemanticGraphVisualizationContent ( { word, className = "" }: SemanticGraphVisualizationProps )
{
  // Error handling
  const { captureError } = useErrorHandling();

  // State for graph data and UI
  const [ graphData, setGraphData ] = useState<SemanticGraph | null>( null );
  const [ isLoading, setIsLoading ] = useState<boolean>( false );
  const [ selectedNode, setSelectedNode ] = useState<SemanticNode | null>( null );
  const [ dimensions, setDimensions ] = useState( { width: 800, height: 600 } );

  // Refs
  const containerRef = useRef<HTMLDivElement>( null );
  const graphRef = useRef<any>( null );

  // Fetch graph data when word changes
  useEffect( () =>
  {
    if ( !word )
    {
      setGraphData( null );
      return;
    }

    const fetchGraphData = async () =>
    {
      setIsLoading( true );

      try
      {
        console.log( `Fetching semantic graph for word: ${ word }` );
        const response = await fetch( `/api/semantic-graph?word=${ encodeURIComponent( word ) }` );

        if ( !response.ok )
        {
          const errorData = await response.json();
          throw new Error( errorData.message || `Error: ${ response.status }` );
        }

        const data = await response.json();
        console.log( "Fetched semantic graph data:", data );
        setGraphData( data );
      } catch ( error )
      {
        console.error( "Error fetching semantic graph:", error );

        captureError(
          error instanceof Error ? error : new Error( String( error ) ),
          "SemanticGraphVisualization.fetchGraphData"
        );

        toast.error( error instanceof Error ? error.message : "Failed to load semantic graph" );
      } finally
      {
        setIsLoading( false );
      }
    };

    fetchGraphData();
  }, [ word, captureError ] );

  // Update dimensions on resize
  useEffect( () =>
  {
    const updateDimensions = () =>
    {
      if ( containerRef.current )
      {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions( { width, height } );
      }
    };

    // Initial update
    updateDimensions();

    // Add resize listener
    window.addEventListener( "resize", updateDimensions );

    // Cleanup
    return () =>
    {
      window.removeEventListener( "resize", updateDimensions );
    };
  }, [] );

  // Node color accessor function
  const getNodeColor = useCallback( ( node: any ) =>
  {
    const typedNode = node as SemanticNode;
    return typedNode.color ||
      DEFAULT_GRAPH_CONFIG.nodeColorMap[ typedNode.type ] ||
      DEFAULT_GRAPH_CONFIG.defaultNodeColor;
  }, [] );

  // Node size accessor function
  const getNodeSize = useCallback( ( node: any ) =>
  {
    const typedNode = node as SemanticNode;
    const baseSize = typedNode.id === word ?
      DEFAULT_GRAPH_CONFIG.maxNodeSize * 1.5 :
      DEFAULT_GRAPH_CONFIG.minNodeSize +
      ( DEFAULT_GRAPH_CONFIG.maxNodeSize - DEFAULT_GRAPH_CONFIG.minNodeSize ) * typedNode.weight;

    // Increase size for selected node
    return selectedNode && selectedNode.id === typedNode.id ? baseSize * 1.3 : baseSize;
  }, [ selectedNode, word ] );

  // Link color accessor function
  const getLinkColor = useCallback( ( link: any ) =>
  {
    const typedLink = link as SemanticLink;
    return typedLink.color ||
      DEFAULT_GRAPH_CONFIG.linkColorMap[ typedLink.type ] ||
      DEFAULT_GRAPH_CONFIG.defaultLinkColor;
  }, [] );

  // Link width accessor function
  const getLinkWidth = useCallback( ( link: any ) =>
  {
    const typedLink = link as SemanticLink;
    return DEFAULT_GRAPH_CONFIG.minLinkWidth +
      ( DEFAULT_GRAPH_CONFIG.maxLinkWidth - DEFAULT_GRAPH_CONFIG.minLinkWidth ) * typedLink.weight;
  }, [] );

  // Node click handler
  const handleNodeClick = useCallback( ( node: any ) =>
  {
    const typedNode = node as SemanticNode;
    setSelectedNode( prevNode =>
      prevNode && prevNode.id === typedNode.id ? null : typedNode
    );

    // Center view on node
    if ( graphRef.current )
    {
      graphRef.current.centerAt( node.x, node.y, 1000 );
      graphRef.current.zoom( 2, 1000 );
    }
  }, [] );

  // Node right-click handler for navigation
  const handleNodeRightClick = useCallback( ( node: any ) =>
  {
    const typedNode = node as SemanticNode;
    // Navigate to the word's exploration page
    window.open( `/explore?word=${ encodeURIComponent( typedNode.word ) }`, '_blank' );
  }, [] );

  // Custom node canvas object
  const nodeCanvasObject = useCallback( ( node: any, ctx: CanvasRenderingContext2D, globalScale: number ) =>
  {
    const typedNode = node as SemanticNode;
    const label = typedNode.word;
    const fontSize = 16 / globalScale;
    const nodeSize = getNodeSize( node );

    // Node circle
    ctx.beginPath();
    ctx.fillStyle = getNodeColor( node );
    ctx.arc( node.x, node.y, nodeSize, 0, 2 * Math.PI );
    ctx.fill();

    // Node border (thicker for selected node)
    ctx.strokeStyle = selectedNode && selectedNode.id === typedNode.id ?
      '#ffffff' : 'rgba(255,255,255,0.5)';
    ctx.lineWidth = selectedNode && selectedNode.id === typedNode.id ?
      2 / globalScale : 1 / globalScale;
    ctx.stroke();

    // Node label
    ctx.font = `${ fontSize }px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';

    // Text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillText( label, node.x, node.y + nodeSize + fontSize );

    // Reset shadow
    ctx.shadowColor = 'transparent';
  }, [ getNodeColor, getNodeSize, selectedNode ] );

  // Render loading state
  if ( isLoading )
  {
    return (
      <div className={ `flex items-center justify-center ${ className }` } style={ { minHeight: '400px' } }>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Generating semantic graph...</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if ( !word )
  {
    return (
      <div className={ `flex items-center justify-center ${ className }` } style={ { minHeight: '400px' } }>
        <p className="text-muted-foreground">Enter a word to visualize its semantic relationships</p>
      </div>
    );
  }

  // Render error state
  if ( !graphData && !isLoading )
  {
    return (
      <div className={ `flex items-center justify-center ${ className }` } style={ { minHeight: '400px' } }>
        <p className="text-muted-foreground">No semantic data available for this word</p>
      </div>
    );
  }

  return (
    <div className={ `relative ${ className }` } ref={ containerRef } style={ { minHeight: '400px' } }>
      {/* Graph Visualization */ }
      { graphData && (
        <ForceGraph2D
          ref={ graphRef }
          graphData={ graphData }
          width={ dimensions.width }
          height={ dimensions.height }
          nodeColor={ getNodeColor }
          nodeVal={ getNodeSize }
          linkColor={ getLinkColor }
          linkWidth={ getLinkWidth }
          nodeCanvasObject={ nodeCanvasObject }
          onNodeClick={ handleNodeClick }
          onNodeRightClick={ handleNodeRightClick }
          linkDirectionalParticles={ 2 }
          linkDirectionalParticleWidth={ 2 }
          linkDirectionalParticleSpeed={ 0.005 }
          cooldownTime={ 3000 }
          d3AlphaDecay={ 0.02 }
          d3VelocityDecay={ 0.3 }
          nodeRelSize={ 6 }
          backgroundColor="rgba(0,0,0,0)"
        />
      ) }

      {/* Selected Node Info Panel */ }
      { selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 glass-effect p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-1">{ selectedNode.word }</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
              { selectedNode.type }
            </span>
          </div>
          { selectedNode.definitions && selectedNode.definitions.length > 0 && (
            <p className="text-sm text-muted-foreground mb-2">{ selectedNode.definitions[ 0 ] }</p>
          ) }
          { selectedNode.etymology && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Etymology:</span> { selectedNode.etymology }
            </div>
          ) }
        </div>
      ) }
    </div>
  );
}