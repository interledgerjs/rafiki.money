import axios from 'axios'
import { App, Invoice } from '../../../src'
import Knex = require('knex')
import { refreshDatabase } from '../../db'
import { AgreementBucketMock } from '../../mocks/agreementBucketMock'
import uuidv4 from 'uuid/v4'
import { cloneDeep } from 'lodash'
import { hydra } from '../../../src/services/hydra'
import * as winston from 'winston'

jest.mock('../../../src/services/hydra', () => ({
  hydra: {
    introspectToken: jest.fn((token:string) => new Promise((resolve) => {
      if (token === 'token1') resolve ({sub: '1'})
      else if (token === 'token2') resolve ({sub: '2'})
      else resolve ({})
    }))
  }
}))

const agreementBucketMock = new AgreementBucketMock

describe('Invoice CRUD tests', () => {
  let app: App
  let db: Knex
  let validInvoiceBody: any
  let returnedObject:  any
  let validAuthData: Object

  beforeAll(() => {
    app = new App(agreementBucketMock)
    app.listen(4000)
    validInvoiceBody = {
      description: 'This is a description',
      amount: '123456',
      currencyCode: 'USD',
      balance: '1234567',
      userId: '1'
    }
    returnedObject = {
      description: 'This is a description',
      amount: 123456,
      balance: 1234567,
      currencyCode: 'USD',
      userId: '1',
      deletedAt: null
    }
    validAuthData = {
      headers: {
        authorization: 'Bearer token1'
      }
    }
    
    const stringify = (value: any): string => typeof value === 'bigint' ? value.toString() : JSON.stringify(value)
    const formatter = winston.format.printf(({ service, level, message, component, timestamp, ...metaData }) => {
      return `${timestamp} [${service}${component ? '-' + component : ''}] ${level}: ${message}` + (metaData ? ' meta data: ' + stringify(metaData) : '')
    })

    winston.configure({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.align(),
        formatter
      ),
      defaultMeta: { service: 'ishara' },
      transports: [
        new winston.transports.Console()
      ]
    })
  })

  beforeEach(async () => {
    db = await refreshDatabase()
  })

  afterEach(async () => {
    await Invoice.query().delete()
    await db.destroy()
  })

  afterAll(() => {
    app.shutdown()
  })

  test('Can create an invoice', async () => {
    const response = await axios.post('http://localhost:4000/invoices', validInvoiceBody, validAuthData)
    const invoice = await Invoice.query().where('id', response.data.id).first()
    
    returnedObject.id = invoice!.id
    returnedObject.createdAt = invoice!.createdAt
    returnedObject.updatedAt = invoice!.updatedAt
    expect(response.status).toEqual(201)
    expect(invoice).toBeDefined()
    expect(invoice).toEqual(returnedObject)
  })
  test('Handle an attempt to create with a bad body', async () => {
    const invalidInvoice = cloneDeep(validInvoiceBody)
    invalidInvoice.des = 'invalid-uuid'
    const response = await axios.post('http://localhost:4000/invoices', invalidInvoice, validAuthData)
    .catch((error) => {
      expect(error.response.status).toEqual(400)
    })
    expect(response).toBeUndefined()
  })
  test('Handle an unauthorized attempt to create', async () => {
    const response = await axios.post('http://localhost:4000/invoices', validInvoiceBody)
    .catch((error) => {
      expect(error.response.status).toEqual(401)
    })
    expect(response).toBeUndefined()
  })

  test('Can get invoices', async () => {
    await Invoice.query().insert(validInvoiceBody as Object)
    const response = await axios.get('http://localhost:4000/invoices/?userId=userId', validAuthData)
    
    returnedObject.id = response.data[0]!.id
    returnedObject.createdAt = response.data[0]!.createdAt
    returnedObject.updatedAt = response.data[0]!.updatedAt
    expect(response).toBeDefined()
    expect(response.status).toEqual(200)
    expect(response.data[0]).toEqual(returnedObject)
  })
  test('Can get an invoice by id', async () => {
    const insertedInvoice = await Invoice.query().insertAndFetch(validInvoiceBody as Object) 
    const response = await axios.get(`http://localhost:4000/invoices/${insertedInvoice.id}`, validAuthData)
    
    returnedObject.id = insertedInvoice.id
    returnedObject.createdAt = insertedInvoice.createdAt
    returnedObject.updatedAt = insertedInvoice.updatedAt
    expect(response.status).toEqual(200)
    expect(response.data).toEqual(returnedObject)
  })
  test('Return 404 on unrecognized id', async () => {
     const response = await axios.get(`http://localhost:4000/invoices/invalidId`, validAuthData)
     .catch( (error) => {
       expect(error.response.status).toEqual(404)
     })
     expect(response).toBeUndefined()
  })
  test('Handle an unauthorized attempt to get invoices', async () => {
    await Invoice.query().insert(validInvoiceBody as Object)
    const response = await axios.get(`http://localhost:4000/invoices`)
    .catch((error) => {
      expect(error.response.status).toEqual(401)
    })
    expect(response).toBeUndefined()
  })
  test('Handle an unauthorized attempt to get an invoice by id', async () => {
    const insertedInvoice = await Invoice.query().insertAndFetch(validInvoiceBody as Object) 
    const response = await axios.get(`http://localhost:4000/invoices/${insertedInvoice.id}`)
    .catch((error) => {
      expect(error.response.status).toEqual(401)
    })
    expect(response).toBeUndefined()
  })

  test('Can delete an invoice by id', async () => {
    const insertedInvoice = await Invoice.query().insertAndFetch(validInvoiceBody as Object) 
    const response = await axios.delete(`http://localhost:4000/invoices/${insertedInvoice.id}`, validAuthData)
    expect(response.status).toEqual(200)
    const invoice = await Invoice.query().where('id', insertedInvoice.id).first()
    expect(invoice!.deletedAt).toBeTruthy()
  })
  test('Return 404 on unrecognized id', async () => {
    const response = await axios.delete(`http://localhost:4000/invoices/${uuidv4()}`, validAuthData)
    .catch((error) => {
      expect(error.response.status).toEqual(404)
    })
    expect(response).toBeUndefined()
  })
  test('Handle an unauthorized attempt to delete an invoice by id', async () => {
    await Invoice.query().insert(validInvoiceBody as Object)
    const response = await axios.delete(`http://localhost:4000/invoices/${validInvoiceBody.id}`)
    .catch((error) => {
      expect(error.response.status).toEqual(401)
    })
    expect(response).toBeUndefined()
  })

})