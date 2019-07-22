import React from 'react'
import { render } from 'react-dom'
import { Link, Router, Route, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'

import RootPage from './pages/root'
import BureauPayeeNetwork from './pages/bureau-payee-network'
import ProjectNetwork from './pages/project-network'

const history = createBrowserHistory()

const App = () => {
  return (
    <Router history={history}>
      <div className='columns'>
        <div className='column is=3'>
          <aside className='menu'>
            <p className='menu-label'>Contents</p>
            <ul className='menu-list'>
              <li>
                <Link to='/project-network'>事業関連ネットワーク</Link>
              </li>
              <li>
                <Link to='/bureau-payee-network'>部局-支出先ネットワーク</Link>
              </li>
            </ul>
          </aside>
        </div>
        <div className='column is-8'>
          <Switch>
            <Route path='/' component={RootPage} exact />
            <Route
              path='/bureau-payee-network'
              component={BureauPayeeNetwork}
            />
            <Route path='/project-network' component={ProjectNetwork} />
          </Switch>
        </div>
      </div>
    </Router>
  )
}

render(<App />, document.querySelector('#content'))
