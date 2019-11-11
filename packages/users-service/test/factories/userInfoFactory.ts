import { Factory } from 'rosie'
import Faker from 'faker'
import { UserInfo } from '../../src/models/user'

export const UserInfoFactory = Factory.define<Partial<UserInfo>>('UserInfoFactory').attrs({
  username: Faker.name.firstName(),
  password: Faker.internet.password(24)
})
