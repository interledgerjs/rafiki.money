import React, { useState, useReducer, useContext } from 'react'
import { AuthContext } from '../App'
import { UsersService } from '../services/users'

type FormValues = {
  id: string
  name: string
  logo: string
  scope: string
  grantTypes: string
  responseTypes: string
  redirectUris: string
}

const OauthRegistration: React.FC = () => {

  const { token, handleAuthError } = useContext(AuthContext)
  const [bannerColour, setBannerColour] = useState('green')
  const [bannerMessage, setBannerMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputs, setInputs] = useReducer(updateInput, {
    id: '',
    name: '',
    logo: '',
    scope: 'openid offline intents.* mandates.*',
    grantTypes: 'authorization_code refresh_token implicit',
    responseTypes: 'token code id_token id',
    redirectUris: ''
  })
  const [errors, setErrors] = useReducer(updateError, {
    id: '',
    name: '',
    logo: '',
    scope: '',
    grantTypes: '',
    responseTypes: '',
    redirectUris: ''
  })
  const users = UsersService()

  function updateError(prevError: FormValues, update: { field: string, value: string }) {
    return Object.assign({}, prevError, { [ update.field ]: update.value })
  }
  
  function updateInput(prevInputs: FormValues, update: { field: string, value: string }) {
    return Object.assign({}, prevInputs, { [ update.field ]: update.value })
  }

  function clearErrors () {
    Object.keys(errors).forEach(key => setErrors({ field: key, value: '' }))
  }

  async function submit (): Promise<void> {
    try {
      setIsSubmitting(true)
      clearErrors()
      if (isInvalid(inputs)) {
        throw new Error('Invalid inputs')
      }
      let clientData = {
        client_id: inputs.id,
        client_name: inputs.name,
        scope: inputs.scope,
        grant_types: inputs.grantTypes.split(' '),
        response_types: inputs.responseTypes.split(' '),
        redirect_uris: inputs.redirectUris.split(' '),
      }

      if (inputs.logo !== '') {
        clientData = Object.assign(clientData, { logo_uri: inputs.logo })
      }
      // TODO: For now make them public clients.
      clientData = Object.assign(clientData, { token_endpoint_auth_method: 'none' })
      console.log('client data', clientData)

      await users.registerOauth2Client(clientData, token).then(resp => {
        setBannerColour('green')
        setBannerMessage('Client has been registered.')
        setIsSubmitting(false)
      }).catch(error => {
        setBannerColour('red')
        setBannerMessage('Could not register the client on the oauth provider.')
      })
    } catch (error) {
      setIsSubmitting(false)
      console.log('error creating client', error.response ? error.response : error)
      console.log('errors', errors)
    }
  }

  function isInvalid (input: FormValues): boolean {
    let isInvalid = false

    if (input.id === '') {
      setErrors({ field: 'id', value: 'required' })
      isInvalid = true
    }
    if (input.name === '') {
      setErrors({ field: 'name', value: 'required' })
      isInvalid = true
    }

    if (input.logo !== '') {
      try {
        new URL(input.logo)
      } catch (error) {
        setErrors({ field: 'logo', value: 'Invalid URL' })
        isInvalid = true
      }
    }

    if (input.scope.split(' ').filter((scopeValue: string) => !scopeValue.match(/offline|openid|intents.*|mandates.*/)).length > 0) {
      setErrors({ field: 'scope', value: 'Scope can only be: offline, openid, intents.*, mandates.*' })
      isInvalid = true
    }

    if (input.grantTypes.split(' ').filter((grantValue: string) => !grantValue.match(/authorization_code|refresh_token|implicit/)).length > 0) {
      console.log('grant types errors', input.grantTypes.split(' ').filter((grantValue: string) => !grantValue.match(/authorization_code|refresh_token|implicit/)))
      setErrors({ field: 'grantTypes', value: 'grantTypes can only be: authorization_code, refresh_token, implicit' })
      isInvalid = true
    }

    if (input.responseTypes.split(' ').filter((responseValue: string) => !responseValue.match(/token|code|id|id_token/)).length > 0) {
      setErrors({ field: 'responseTypes', value: 'responseTypes can only be: token, code, id, id_token'})
      isInvalid = true
    }

    try {
      input.redirectUris.split(' ').map(url => new URL(url).toString())
    } catch (error) {
      setErrors({ field: 'redirectUris', value: 'Need to be space separated URLs'})
      isInvalid = true
    }

    return isInvalid
  }

  return (
    <div className='mx-auto max-w-md px-2'>
      <div className='my-8 flex items-center border-b border-black capitalize font-sans font-bold text-grey-darkest text-2xl'>
        Oauth Client Registration
      </div>
      <Banner colour={bannerColour} message={bannerMessage}/>
      <TextInputRow inputTitle={'Id'} value={inputs.id} onInputChange={(value: string) => { setInputs({ field: 'id', value }) }} placeholder='rafiki.shop' error={errors.id}/>
      <TextInputRow inputTitle={'Name'} value={inputs.name} onInputChange={(value: string) => { setInputs({ field: 'name', value }) }} placeholder='ILP Demo Merchant' error={errors.name}/>
      <TextInputRow inputTitle={'Logo'} value={inputs.logo} onInputChange={(value: string) => { setInputs({ field: 'logo', value }) }} placeholder='https://rafiki.shop/static/logo.png' error={errors.logo}/>
      <TextInputRow inputTitle={'Scope'} value={inputs.scope} onInputChange={(value: string) => { setInputs({ field: 'scope', value }) }} placeholder='openid offline intents.* mandates.*'  error={errors.scope}/>
      <TextInputRow inputTitle={'Grant Types'} value={inputs.grantTypes} onInputChange={(value: string) => { setInputs({ field: 'grantTypes', value }) }} placeholder='authorization_code refresh_code implicit' error={errors.grantTypes}/>
      <TextInputRow inputTitle={'Response Types'} value={inputs.responseTypes} onInputChange={(value: string) => { setInputs({ field: 'responseTypes', value }) }} placeholder='token code id_token id' error={errors.responseTypes}/>
      <TextInputRow inputTitle={'Redirect URIs'} value={inputs.redirectUris} onInputChange={(value: string) => { setInputs({ field: 'redirectUris', value }) }} placeholder='https://rafiki.shop/callback' error={errors.redirectUris}/>
      <div className='flex mt-6'>
        <div className='w-1/3 flex items-center'/>
        <button type='button' className='border rounded border-black hover:shadow-md px-2 py-2 w-1/4' onClick={() => { if (!isSubmitting) submit() }}>{ isSubmitting ? '...' : 'Create' }</button>
      </div>
    </div>
  )
}

const TextInputRow: React.FC<{ onInputChange: (value: string) => void, value: string, inputTitle: string, placeholder: string, error?: string }> = ({ onInputChange, inputTitle, placeholder, error, value }) => {
  return (
    <div className='flex w-full my-2'>
        <div className='w-1/3 flex items-center'>
          { inputTitle }
        </div>
        <div className='flex-1'>
          <input className="shadow appearance-none border rounded w-full pl-2 py-2 text-grey-darkest leading-tight focus:outline-none focus:shadow-outline" id={inputTitle} type="text" placeholder={placeholder} value={value} onChange={(event) => onInputChange(event.target.value)} />
          <p className='text-sm text-red'>{error}</p>
        </div>
    </div>
  )
}

const Banner: React.FC<{ colour: string, message: string }> = ({ colour, message }) => {
  if (message === '') {
    return null
  }

  return (
    <div className={`bg-${colour}-lightest border-l-4 border-${colour} text-${colour}-dark p-4`} role="alert">
      <p>{message}</p>
    </div>
  )
}

export default OauthRegistration