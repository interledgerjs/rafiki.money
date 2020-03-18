import { parseCookies } from 'nookies'
import { UsersService } from '../services/users'

export const formatCurrency = (value: number, scale: number) => {
  return (value*10**(-scale)).toFixed(scale)
}

const usersService = UsersService()

export const checkUser = async (ctx) => {
  let user, cookies
  try {
    cookies = parseCookies(ctx)
    if (cookies && cookies.token) {
      user = await usersService.getUser(cookies.token)
    } else {
      throw new Error('no token')
    }
  } catch (error) {
    console.log(error)
    if (typeof window === 'undefined') {
      ctx.res.writeHead(302, {
        Location: '/login'
      })
      ctx.res.end()
      return
    }

    window.location.href = '/login'
  }
  return { ...user, token: cookies.token }
}

export const getCurrencySymbol = (code: string): string | undefined => {
  return currencySymbols[code]
}

// taken from https://stackoverflow.com/questions/19373860/convert-currency-names-to-currency-symbol
const currencySymbols = {
  'EUR': '€', // Euro
  'CRC': '₡', // Costa Rican Colón
  'GBP': '£', // British Pound Sterling
  'ILS': '₪', // Israeli New Sheqel
  'INR': '₹', // Indian Rupee
  'JPY': '¥', // Japanese Yen
  'KRW': '₩', // South Korean Won
  'NGN': '₦', // Nigerian Naira
  'PHP': '₱', // Philippine Peso
  'PLN': 'zł', // Polish Zloty
  'PYG': '₲', // Paraguayan Guarani
  'THB': '฿', // Thai Baht
  'UAH': '₴', // Ukrainian Hryvnia
  'USD': '$', // US Dollar
  'VND': '₫', // Vietnamese Dong
  'ZAR': 'R'
};