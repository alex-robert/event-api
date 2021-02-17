import { IConfig } from 'config'

import { createDbClient } from './db'
import { Db, Collection, ObjectID } from 'mongodb';

export enum EventStatus {
  GOING,
  MAYBE,
  UNAVAILABLE
}

export interface EventSchema {
  description: String,
  start_date: Number,
  end_date: Number,
  status: EventStatus,
  reminder: Number,
  ownerId?: Number,
}

const get_mongo_id = (id:string) => new ObjectID(id)

export const eventModel = async (config: IConfig) => {

  const db: Db = await createDbClient(config)
  const collection: Collection = db.collection("events")

  return {
    find_one_by_id: async(id): Promise<EventSchema> | undefined => {
      return collection.findOne({
        _id: get_mongo_id(id)
      }).then((result) => result || undefined)
    },

    create: async (event: EventSchema): Promise<EventSchema> | undefined => {
      return collection.insertOne(event).then((result) => {
        return result && result.ops.length && result.ops[0] || undefined
      })
    },

    update: async (id, event: Partial<EventSchema>): Promise<EventSchema> | undefined => {
      return collection.findOneAndUpdate({
        _id: get_mongo_id(id)
      },
      {
        $set: event
      },
      {
        returnOriginal: false,
        upsert: false
      }).then((result) => {
        return result && result.value || undefined
      })
    },

    delete: async (id: string): Promise<Boolean> => {
      return collection.deleteOne({
        _id: get_mongo_id(id)
      }).then((result) => !!result.deletedCount)
    }
  }
}
