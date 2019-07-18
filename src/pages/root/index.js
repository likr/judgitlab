import React from 'react'
import { Link } from 'react-router-dom'

const RootPage = () => {
  return (
    <div>
      <h1>hello</h1>
      <Link to='/project-network'>project-network</Link>
      <Link to='/bureau-payee-network'>bureau-payee-network</Link>
    </div>
  )
}

export default RootPage
