import React, { useState, useEffect, useContext } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import "react-tabs/style/react-tabs.css"
import { ishara } from '../../services/ishara'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../App'

export interface Agreement {
	id: string
	amount: string
	start: number
	expiry: number
	asset: {
		code: string
		scale: number
	}
	description: string
	balance: number
	interval: string
	cycles: number
	cancelled: number
}

const formatCurrency = (value: number, scale: number) => {
	return (value * 10 ** (-scale)).toFixed(scale)
}

export const Agreements: React.FC = () => {

	return (
		<div className='mx-auto max-w-lg mt-4 border rounded shadow px-6 py-2'>
			<Tabs className="">
				<TabList>
					<Tab>Active</Tab>
					<Tab>Expired</Tab>
					<Tab>Cancelled</Tab>
					<Tab>All</Tab>
				</TabList>

				<TabPanel>
					<AgreementTable state={'active'} />
				</TabPanel>
				<TabPanel>
					<AgreementTable state={'expired'} />
				</TabPanel>
				<TabPanel>
					<AgreementTable state={'cancelled'} />
				</TabPanel>
				<TabPanel>
					<AgreementTable />
				</TabPanel>
			</Tabs>
		</div>
	)
}

type AgreementTableProps = {
	state?: string,
}

const AgreementTable: React.FC<AgreementTableProps> = ({ state }) => {

	const [agreements, setAgreements] = useState<Array<Agreement>>([])
	const [loading, setLoading] = useState<boolean>(true)
	const { getUser, token } = useContext(AuthContext)

	useEffect(() => {
		let isMounted = true
		getUser().then(({ id }) => {
			ishara.getMandates(id, state).then(agreements => {
				if (isMounted) {
					setAgreements(agreements)
					setLoading(false)
				}
			}).catch(error => console.log('error', error))
		})
		return () => { isMounted = false }
	}, [token])

	if (!loading && agreements.length === 0) {
		return (
			<div className="py-2 text-grey-darker text-lg">
				You have no {state} agreements
      </div>
		)
	}

	return loading ? <div></div> : (
		<table className='text-left w-full mt-4 mb-8'>
			<thead>
				<tr className='font-bold uppercase text-md text-grey-darkest border-b border-grey-light'>
					<th className='text-center'>Currency</th>
					<th className='text-center'>Amount</th>
					<th className='text-center'>Balance</th>
					<th className='text-center hidden md:table-cell'>Start</th>
					<th className='text-center hidden md:table-cell'>Expiry</th>
				</tr>
			</thead>
			<tbody>
				{agreements.map(agreement => <AgreementRow key={'agreement' + agreement.id} {...agreement} />)}
			</tbody>
		</table>
	)
}

const AgreementRow: React.FC<Agreement> = ({ id, amount, balance, start, expiry, asset: { code, scale } }) => {
	return (
		<tr className='border-b border-grey-light cursor-pointer hover:bg-grey-lighter'>
			<td className='text-center py-3 text-grey-darker font-semibold'>
				<Link to={`/agreements/${id}`} className="w-full inline-block" style={{ color: 'inherit', textDecoration: 'inherit' }}>
					{code}
				</Link>
			</td>
			<td className='text-center py-3 text-grey-darker font-semibold'>
				<Link to={`/agreements/${id}`} className="w-full inline-block" style={{ color: 'inherit', textDecoration: 'inherit' }}>
					{formatCurrency(parseInt(amount), scale)}
				</Link>
			</td>
			<td className='text-center py-3 text-grey-darkest font-semibold'>
				<Link to={`/agreements/${id}`} className="w-full inline-block" style={{ color: 'inherit', textDecoration: 'inherit' }}>
					{formatCurrency(balance, scale)}
				</Link>
			</td>
			<td className='text-center py-3 text-grey hidden md:table-cell'>
				<Link to={`/agreements/${id}`} className="w-full inline-block" style={{ color: 'inherit', textDecoration: 'inherit' }}>
					{(new Date(start)).toLocaleString()}
				</Link>
			</td>
			<td className='text-center py-3 text-grey hidden md:table-cell'>
				<Link to={`/agreements/${id}`} className="w-full inline-block" style={{ color: 'inherit', textDecoration: 'inherit' }}>
					{(new Date(expiry)).toLocaleString()}
				</Link>
			</td>
		</tr>
	)
}
