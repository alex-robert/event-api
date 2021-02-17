import { IConfig } from 'config'
import { MongoClient, Db } from 'mongodb'

const debug = require('debug')('ac:db')

const createDbClient = async (config: IConfig): Promise<Db> => {
  try {
    const uri: string = config.get("mongo.uri")
    const client = new MongoClient(uri, { useUnifiedTopology: true, poolSize: 5 })

    await client.connect()
    debug("db connected")
    return client.db('acracy')
  } catch (err) {
    throw err
  }
}

export {
  createDbClient
}
