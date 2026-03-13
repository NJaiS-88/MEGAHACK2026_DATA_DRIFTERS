import { useMemo, useRef, useEffect, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
import SpriteText from 'three-spritetext'
import { parseHierarchyToGraph } from '../utils/graphParser'

/**
 * ConceptGraph
 * Renders a force-directed knowledge graph from the hierarchy JSON.
 *
 * Props:
 * - data: hierarchy JSON object returned by the backend (data.hierarchy)
 */
function ConceptGraph({ data, onSelectNode, knowledgeStates }) {
  const graphData = useMemo(() => parseHierarchyToGraph(data), [data])
  const fgRef = useRef(null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [mode3D, setMode3D] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 800 })
  const containerRef = useRef(null)

  // Track container size to prevent the graph from defaulting to window width
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Make the layout more spacious by tuning the underlying forces.
  useEffect(() => {
    if (!fgRef.current) return
    const fg = fgRef.current
    // Spread nodes out more and reduce collisions.
    fg.d3Force('charge').strength(-400)
    fg.d3Force('link').distance(180)
  }, [mode3D])

  // Ensure the whole graph fits inside the panel (for both 2D and 3D).
  useEffect(() => {
    if (!fgRef.current || !graphData.nodes.length) return
    const fg = fgRef.current
    const id = setTimeout(() => {
      if (typeof fg.zoomToFit === 'function') {
        fg.zoomToFit(400, 80)
      }
    }, 400)
    return () => clearTimeout(id)
  }, [graphData, mode3D])

  // Node size based on group
  // Returns radius for 2D, but we'll scale it up for 3D inside the 3D object creator
  const nodeVal = (node) => {
    if (node.group === 'root') return mode3D ? 40 : 15
    if (node.group === 'subtopic') return mode3D ? 25 : 10
    return mode3D ? 15 : 6 // concept
  }

  // Node color based on group and student knowledge state
  const nodeColor = (node) => {
    // Sanitize node ID for lookup (dots are underscores in DB keys)
    const stateKey = node.id ? String(node.id).replace(/\./g, '_') : '';
    
    // If we have knowledge state for this node, use it
    if (knowledgeStates && knowledgeStates[stateKey]) {
      const state = knowledgeStates[stateKey];
      if (state === 'green') return '#22c55e'; // Mastering Green
      if (state === 'yellow') return '#eab308'; // Learning Yellow
      if (state === 'red') return '#ef4444'; // Struggling Red
    }

    if (node.group === 'root') return '#2563eb'; // blue
    if (node.group === 'subtopic') return '#f97316'; // orange
    return '#9ca3af'; // gray
  }

  // Custom canvas rendering so labels are always visible & styled.
  const nodeCanvasObject = (node, ctx, globalScale) => {
    const label = String(node.id)
    const fontSize = 11 / globalScale

    // Draw node circle
    const radius = nodeVal(node)
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = nodeColor(node)
    ctx.fill()

    // Subtle outline for depth
    ctx.strokeStyle = '#ffffff33'
    ctx.lineWidth = 1 / globalScale
    ctx.stroke()

    // Draw label
    ctx.font = `${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#f9fafb'
    ctx.fillText(label, node.x, node.y + radius + 2)
  }

  if (!graphData.nodes.length) {
    return <p style={{ marginTop: '1rem' }}>No concept graph available.</p>
  }

  const handleNodeClick = (node) => {
    const id = String(node.id)
    setSelectedNodeId(id)

    // Notify parent about selection
    if (onSelectNode) {
      onSelectNode(node)
      return
    }

    // Keep root interactions focused in-place
    if (node.group === 'root' && fgRef.current && typeof node.x === 'number' && typeof node.y === 'number') {
      if (!mode3D) {
        fgRef.current.centerAt(node.x, node.y, 800)
        fgRef.current.zoom(3, 800)
      }
      return
    }

    // Fallback or legacy behavior (can be removed if not needed)
    const url = `/concept?node=${encodeURIComponent(id)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const commonProps = {
    ref: fgRef,
    graphData,
    nodeRelSize: 1,
    nodeVal,
    nodeColor,
    linkColor: () => '#f9fafb',
    linkOpacity: 0.6,
    linkDirectionalParticles: 0,
    linkWidth: 1,
    warmupTicks: 80,
    cooldownTicks: 200,
    d3VelocityDecay: 0.25,
    enableNodeDrag: true,
    onNodeClick: handleNodeClick,
    width: dimensions.width,
    height: dimensions.height,
    nodeRelSize: 1, // Keep base size 1, we use nodeVal directly
  }

  // 3D Node + Label styling
  const nodeThreeObject = (node) => {
    // Basic sphere for the node
    const geometry = new THREE.SphereGeometry(nodeVal(node))
    const material = new THREE.MeshLambertMaterial({ 
      color: nodeColor(node),
      transparent: true,
      opacity: 0.9
    })
    const sphere = new THREE.Mesh(geometry, material)

    // Add white text label
    const sprite = new SpriteText(String(node.id))
    sprite.color = '#ffffff'
    sprite.textHeight = mode3D ? 12 : 8
    sprite.position.y = nodeVal(node) + 5 // Position just above the sphere
    
    const group = new THREE.Group()
    group.add(sphere)
    group.add(sprite)
    return group
  }

  return (
    <>
      <div className="graph-toolbar">
        <button
          type="button"
          className={!mode3D ? 'graph-mode-btn graph-mode-btn--active' : 'graph-mode-btn'}
          onClick={() => setMode3D(false)}
        >
          2D
        </button>
        <button
          type="button"
          className={mode3D ? 'graph-mode-btn graph-mode-btn--active' : 'graph-mode-btn'}
          onClick={() => setMode3D(true)}
        >
          3D
        </button>
      </div>
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '800px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          background: '#000',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {dimensions.width > 0 && (
          mode3D ? (
            <ForceGraph3D
              {...commonProps}
              backgroundColor="#000000"
              nodeThreeObject={nodeThreeObject}
              onEngineStop={() => {
                const fg = fgRef.current
                if (fg && typeof fg.zoomToFit === 'function') {
                  fg.zoomToFit(400, 80)
                }
              }}
            />
          ) : (
            <ForceGraph2D
              {...commonProps}
              nodeCanvasObject={nodeCanvasObject}
              onEngineStop={() => {
                const fg = fgRef.current
                if (fg && typeof fg.zoomToFit === 'function') {
                  fg.zoomToFit(400, 80)
                }
              }}
            />
          )
        )}
      </div>
      {selectedNodeId && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#e5e7eb' }}>
          Selected: <strong>{selectedNodeId}</strong>
        </p>
      )}
    </>
  )
}

export default ConceptGraph

