"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"

interface FlowChartProps {
  nodes: any[]
  edges: any[]
  onNodeClick: (nodeId: string) => void
}

export function FlowChart({ nodes, edges, onNodeClick }: FlowChartProps) {
  const [initialNodes, setInitialNodes] = useState<Node[]>([])
  const [initialEdges, setInitialEdges] = useState<Edge[]>([])
  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([])
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    // Transform the nodes and edges to the format expected by ReactFlow
    const transformedNodes = nodes.map((node, index) => {
      // Calculate position to create a horizontal flow
      const position = {
        x: 250 * index,
        y: 100 + (index % 2 === 0 ? 0 : 50), // Slight zigzag for better visibility
      }

      let className = "bg-background border-2 border-border shadow-md rounded-md"

      // Add styling based on node type
      if (node.type === "start") {
        className += " border-green-500"
      } else if (node.type === "end") {
        className += " border-blue-500"
      } else if (node.type === "advanced") {
        className += " border-orange-500"
      }

      return {
        id: node.id,
        data: { label: node.label },
        position,
        type: "default",
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        className,
        style: {
          width: 180,
          padding: 10,
          borderRadius: 8,
        },
      }
    })

    const transformedEdges = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: "hsl(var(--primary))" },
    }))

    setInitialNodes(transformedNodes)
    setInitialEdges(transformedEdges)
    setNodes(transformedNodes)
    setEdges(transformedEdges)
  }, [nodes, edges, setNodes, setEdges])

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeClick(node.id)
    },
    [onNodeClick],
  )

  return (
    <ReactFlow
      nodes={reactFlowNodes}
      edges={reactFlowEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      fitView
      attributionPosition="bottom-right"
      className="bg-background/50"
    >
      <Background />
      <Controls />
    </ReactFlow>
  )
}

