import React from 'react'
import {ConsentRequest} from '../pages/consent'

type AgreementConsentProps = {
  acceptConsent: () => void
  consentRequest: ConsentRequest
}

const NormalConsent: React.FC<AgreementConsentProps> = ({consentRequest, acceptConsent}) => {

  return (
      <div className="w-full max-w-sm mx-auto mt-16 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className='w-full flex justify-center align-center mb-4'>

        </div>
        <div className="text-center my-4">
          Authorize <strong className="text-grey-darkest font-bold whitespace-no-wrap">{consentRequest.client.client_name}</strong> to access your ILP Wallet Account
        </div>
        <div className="text-grey-dark font-semibold text-md mb-2">
          Permissions
        </div>
        <div>
          {consentRequest.requestedScopes.map(scope => {
            if(scope === 'intents') {
              return (
                <div key={scope} className="border-b py-4">
                  <div className="text-grey-darkest text-xl">
                    Intents
                  </div>
                  <div className="text-grey-darkest text-md mt-2">
                    This application will be able to create, update and read intents.
                  </div>
                </div>
              )
            }
            if(scope === 'openid') {
              return (
                <div key={scope} className="border-b py-4">
                  <div className="text-grey-darkest text-xl">
                    Access to profile information
                  </div>
                  <div className="text-grey-darkest text-md mt-2">
                    This application will have access to your profile information.
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
        <div className="mt-6">
          <div onClick={acceptConsent}
               className="bg-blue hover:bg-blue-dark cursor-pointer text-white font-bold py-2 px-4 rounded text-center">
            Authorize
          </div>
        </div>
      </div>
    )
}

export default NormalConsent;
