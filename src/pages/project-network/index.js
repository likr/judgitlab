import React from 'react'
import * as d3 from 'd3'
import { Graph, SimulationBuilder, ForceDirectedEdgeBundling } from 'egraph'

const BureauPayeeNetwork = () => {
  const renderer = React.useRef()
  React.useEffect(() => {
    ;(async () => {
      const request = await window.fetch('/data/project-network.json')
      const data = await request.json()
      const indices = new Map()

      data.links = data.links.filter((link) => link.similarity > 0.6)

      data.nodes.forEach((node, i) => {
        indices.set(node.id, i)
        if (node.isBureau) {
          node.bureau = node.id
        }
        if (node.isPayee) {
          node.payee = node.id
        }
      })

      const graph = new Graph()
      for (const node of data.nodes) {
        graph.addNode(node.id, node)
      }
      for (const link of data.links) {
        graph.addEdge(link.source, link.target, link)
      }

      const color = d3.scaleOrdinal(d3.schemePaired)
      for (const node of data.nodes) {
        node.strokeWidth = 0
        node.fillColor = color(node.ministry)
      }
      for (const link of data.links) {
        link.strokeColor = '#ccc'
        link.strokeOpacity = 0.5
      }

      const builder = SimulationBuilder.defaultSetting()
      const simulation = builder.build(graph)
      simulation.iterations = 1000

      const draw = () => {
        if (simulation.isFinished()) {
          const edgeBundling = new ForceDirectedEdgeBundling()
          const lines = edgeBundling.call(graph, data.nodes)
          data.links.forEach((link, i) => {
            link.bends = lines[i].bends.map(({ x, y }) => [x, y])
          })
          renderer.current.update()
          return
        }
        window.requestAnimationFrame(draw)
        simulation.stepN(10)
        for (const u of graph.nodes()) {
          const node = graph.node(u)
          node.x = simulation.x(u)
          node.y = simulation.y(u)
        }
        renderer.current.update()
      }

      renderer.current.load(data)
      draw()
    })()
  }, [])
  return (
    <section className='section'>
      <div className='container'>
        <eg-renderer ref={renderer} width='1000' height='1000' />
      </div>
    </section>
  )
}

export default BureauPayeeNetwork
