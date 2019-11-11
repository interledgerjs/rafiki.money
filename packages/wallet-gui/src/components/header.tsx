import { withRouter, RouteComponentProps } from "react-router"
import React from 'react'

const Header: React.FC<RouteComponentProps & { logout: () => void }> = ({ location, history, logout }) => {

  const { pathname } = location
  const renderHeader = pathname !== "/login" && pathname !== "/signup" && pathname !== '/oauth/login' && pathname !== '/oauth/consent' && pathname !== '/payment-handler'

  return renderHeader ? (
    <div className="bg-white border-b border-grey-light">
      <div className="h-16 flex px-4 container mx-auto">
        <div className="flex">
          <div className="my-auto">
            <img className="h-16" src={process.env.PUBLIC_URL + '/logo_transparent.png'}/>
          </div>
        </div>
        <div className="flex-1 flex ml-8">
          <button className={"my-auto mr-4 text-lg" + (pathname === '/' ? 'text-grey-dark' : 'text-grey-dark')} onClick={() => history.push('/')}>
            Home
          </button>
          <button className={"my-auto mr-4 text-lg" + (pathname === '/agreements' ? 'text-grey-dark' : 'text-grey-dark') } onClick={() => history.push('/agreements')}>
            Agreements
          </button>
          <button className={"my-auto mr-4 text-lg" + (pathname === '/oauth2/clients/create' ? 'text-grey-dark' : 'text-grey-dark') } onClick={() => history.push('/oauth2/clients/create')}>
            Add Oauth Client
          </button>
        </div>
        <div className="flex">
          <button className={"my-auto mr-4 text-grey-dark text-lg hover:text-grey-darker"} onClick={() => history.push('/settings')}>
            Settings
          </button>
          <button className={"my-auto mr-4 text-grey-dark text-lg hover:text-grey-darker"} onClick={() => logout()}>
            Logout
          </button>
        </div>
      </div>
    </div>
  ) : null
}

export default withRouter(Header)
