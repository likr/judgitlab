import React from 'react'
import * as d3 from 'd3'
import {
  Graph,
  ManyBodyForce,
  LinkForce,
  PositionForce,
  Simulation,
  ForceDirectedEdgeBundling
} from 'egraph'

const BureauPayeeNetwork = () => {
  const renderer = React.useRef()
  React.useEffect(() => {
    ;(async () => {
      const request = await window.fetch('/data/bureau-payee-network.json')
      const data = await request.json()
      const indices = new Map()

      data.nodes.forEach((node, i) => {
        indices.set(node.id, i)
        if (node.isBureau) {
          node.bureau = node.id
        }
        if (node.isPayee) {
          node.payee = node.id
        }
        node.id = i
        node.amount = 0
        node.count = 0
      })
      for (const link of data.links) {
        link.source = indices.get(link.source)
        link.target = indices.get(link.target)
        data.nodes[link.source].amount += link.amount
        data.nodes[link.target].amount += link.amount
        data.nodes[link.source].count += link.count
        data.nodes[link.target].count += link.count
      }

      const graph = new Graph()
      for (const node of data.nodes) {
        graph.addNode(node.id, node)
      }
      for (const link of data.links) {
        graph.addEdge(link.source, link.target, link)
      }

      const manyBodyForce = new ManyBodyForce()
      // manyBodyForce.strength = () => -50
      const linkForce = new LinkForce()
      const positionForce = new PositionForce()
      positionForce.x = () => 0
      positionForce.y = () => 0

      const simulation = new Simulation()
      simulation.add(manyBodyForce)
      simulation.add(linkForce)
      simulation.add(positionForce)
      const layout = simulation.start(graph)

      const edgeBundling = new ForceDirectedEdgeBundling()
      const lines = edgeBundling.call(graph, layout.nodes)

      data.nodes.forEach((node, i) => {
        Object.assign(node, layout.nodes[i])
      })
      data.links.forEach((link, i) => {
        link.bends = lines[i].bends.map(({ x, y }) => [x, y])
      })

      const nodeSizeScale = d3
        .scaleSqrt()
        .domain(d3.extent(data.nodes, (node) => node.count))
        .range([5, 30])
      const linkWidthScale = d3
        .scaleSqrt()
        .domain(d3.extent(data.links, (link) => link.count))
        .range([1, 3])
      const color = d3.scaleOrdinal(d3.schemePaired)
      for (const node of data.nodes) {
        node.strokeWidth = 0
        node.width = node.height = nodeSizeScale(node.count)
        if (node.isBureau) {
          node.fillColor = color(node.ministry)
          node.label = `${node.ministry}\n${node.bureau}`
          node.labelFontSize = 4
        } else {
          node.fillColor = '#ccc'
          node.labelFontSize = 4
          if (graph.inDegree(node.id) + graph.outDegree(node.id) > 1) {
            node.label = node.name
          }
        }
      }
      for (const link of data.links) {
        link.strokeWidth = linkWidthScale(link.count)
        link.strokeColor = '#ccc'
        link.strokeOpacity = 0.5
      }

      renderer.current.load(data)
    })()
  }, [])
  return (
    <section className='section'>
      <div className='container'>
        <eg-renderer ref={renderer} width='2000' height='2000'></eg-renderer>
      </div>
    </section>
  )
}

export default BureauPayeeNetwork
