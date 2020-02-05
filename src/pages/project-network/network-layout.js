import {
  Graph,
  SimulationBuilder,
  ManyBodyForce,
  LinkForce,
  PositionForce,
  CollideForce,
  connected_components as connectedComponents
} from 'egraph'
import * as d3 from 'd3'

const setSize = (data) => {
  const sizeScale = d3
    .scaleLog()
    .domain([1, d3.max(data.nodes, (node) => node.amount)])
    .range([1, 40])
  for (const node of data.nodes) {
    const size = sizeScale(Math.max(1, node.amount))
    node.width = node.height = size
    node.radius = node.width / 2
  }
}

const initialPlacement = (graph, simulation) => {
  const components = connectedComponents(graph)
  const componentIds = Array.from(
    new Set(Array.from(graph.nodes()).map((u) => components[u]))
  )
  const componentNodes = {}
  for (const id of componentIds) {
    componentNodes[id] = []
  }
  for (const u of graph.nodes()) {
    componentNodes[components[u]].push(u)
  }

  const data = {
    children: componentIds.map((id) => ({ id, nodes: componentNodes[id] }))
  }
  const hierarchy = d3
    .hierarchy(data)
    .sum((group) => (group.nodes ? group.nodes.length : 0))
  const pack = d3
    .pack()
    .size([2000, 2000])
    .padding(3)
  const root = pack(hierarchy)
  console.log(root)

  for (const group of root.children) {
    const n = group.data.nodes.length
    const dt = (2 * Math.PI) / n
    group.data.nodes.forEach((u, i) => {
      const t = dt * i
      simulation.setX(u, group.r * Math.cos(t) + group.x)
      simulation.setY(u, group.r * Math.sin(t) + group.y)
    })
  }
}

export default async (data) => {
  setSize(data)

  const graph = new Graph()
  for (const node of data.nodes) {
    graph.addNode(node.id, node)
  }
  for (const link of data.links) {
    const { source, target } = link
    graph.addEdge(source, target, link)
  }

  const builder = new SimulationBuilder()
  const manyBodyForce = builder.add(new ManyBodyForce())
  builder.get(manyBodyForce).strength = () => -50
  const linkForce = builder.add(new LinkForce())
  builder.get(linkForce).distance = (g, u, v) =>
    g.node(u).radius + g.node(v).radius + 50
  const centerForce = builder.add(new PositionForce())
  builder.get(centerForce).x = () => 0
  builder.get(centerForce).y = () => 0
  const collideForce = builder.add(new CollideForce())
  builder.get(collideForce).radius = (g, u) => g.node(u).radius

  const simulation = builder.build(graph)
  initialPlacement(graph, simulation)
  simulation.run()

  const nodes = data.nodes.map((node) =>
    Object.assign({}, node, {
      x: simulation.x(node.id),
      y: simulation.y(node.id)
    })
  )
  const links = data.links.map((link) => Object.assign({}, link))
  return { nodes, links }
}
