import React, { useEffect } from 'react'
import { RouteComponentProps } from 'react-router'
type LoginProps = {
  authenticate: (token: string) => void
} & RouteComponentProps

const Callback: React.FC<LoginProps> = (props) => {

  useEffect(() => {
    const hashAsObject = parseHash(props.location.hash.substring(1))
    if(hashAsObject['access_token']) {
      props.authenticate(hashAsObject['access_token'])
      props.history.push('/')
    }
  }, []);

  function parseHash(hash: string): {[k: string]: string} {
    return hash.split('&').reduce((result: { [k: string]: string }, item) => {
      var parts = item.split('=');
      result[parts[0]] = parts[1];
      return result;
    }, {});
  } 

  return null
}

export default Callback;
