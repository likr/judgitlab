import React, { useEffect, useState } from 'react'
import * as d3 from 'd3'
import { EgRenderer } from 'react-eg-renderer'
import networkLayout from './network-layout'

const setColor = (data) => {
  const ministries = Array.from(
    new Set(data.nodes.map(({ ministry }) => ministry))
  )
  ministries.sort()
  const colorScale = d3
    .scaleSequential()
    .domain([0, ministries.length - 1])
    .interpolator(d3.interpolateRainbow)
  const colors = new Map()
  ministries.forEach((ministry, i) => {
    colors.set(ministry, colorScale(i))
  })
  for (const node of data.nodes) {
    node.fillColor = colors.get(node.ministry)
  }
}

const setLabel = (data) => {
  const words = new Set()
  for (const node of data.nodes) {
    for (const word of node.words) {
      words.add(word)
    }
  }
  const documentCount = {}
  for (const word of words) {
    documentCount[word] = 0
  }
  for (const node of data.nodes) {
    for (const word of new Set(node.words)) {
      documentCount[word] += 1
    }
  }
  const idf = {}
  for (const word of words) {
    idf[word] = Math.log(words.size / documentCount[word])
  }
  for (const node of data.nodes) {
    const nodeWords = Array.from(new Set(node.words))
    nodeWords.sort((w1, w2) => idf[w2] - idf[w1])
    node.label = nodeWords[0]
  }
}

const setLinkStroke = (data) => {
  const strokeWidthScale = d3
    .scaleLinear()
    .domain(d3.extent(data.links, (link) => link.weight))
    .range([1, 5])
  for (const link of data.links) {
    link.strokeWidth = strokeWidthScale(link.weight)
    link.strokeOpacity = link.weight >= 150 ? 0.7 : 0.3
  }
}

const decorate = (data) => {
  setColor(data)
  setLabel(data)
  setLinkStroke(data)
}

const RootPage = () => {
  const [graph, setGraph] = useState({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState(null)

  useEffect(() => {
    window
      .fetch('/data/project-network.json')
      .then((response) => response.json())
      .then((data) => networkLayout(data))
      .then((data) => {
        decorate(data)
        setGraph(data)
      })
  }, [])

  return (
    <section className='section'>
      <div className='container'>
        <div>
          <p>府省庁：{selectedNode && selectedNode.ministry}</p>
          <p>事業名：{selectedNode && selectedNode.projectName}</p>
        </div>
        <div>
          <EgRenderer
            data={graph}
            width='960'
            height='960'
            node-id-property='id'
            default-node-fill-opacity='0.5'
            default-node-stroke-width='0'
            default-node-label-font-size='8'
            default-link-stroke-color='#888'
            onNodeClick={({ id }) => {
              const node = graph.nodes.find((node) => node.id === +id)
              setSelectedNode(node)
            }}
          />
        </div>
      </div>
    </section>
  )
}

export default RootPage
