import resetDb from './lib/reset-db'

beforeAll(async () => {
  await resetDb()
})

afterAll(async () => {
//   await resetDb()
})
