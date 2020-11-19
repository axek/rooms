import { ObjectID } from 'mongodb'

import { ENTITY_NAME, COLLECTION_NAME } from './_entity'
import { CError } from '../../../_lib/tools'
import { IProfile } from '../../../_lib/types'
import { MongoDB } from '../../../_lib/infra/mongo'
import { ENV } from '../../../_lib/infra/env'
import { CONSTANTS } from '../../../_lib/infra/constants'

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = CONSTANTS.HTTP_STATUS

async function readProfile(id: string): Promise<IProfile> {
  const dbClient = await MongoDB.getInstance().getDbClient()

  let result
  try {
    const database = dbClient.db(ENV.ROOMS_DB_NAME)
    const collection = database.collection(COLLECTION_NAME)

    const query = { _id: new ObjectID(id) }

    const options = {
      projection: {
        _id: 1,
        email: 1,
        name: 1,
        phone: 1,
        oneTimePassword: 1,
        sessionToken: 1,
        role: 1,
        hotelId: 1,
      },
    }

    result = await collection.findOne(query, options)
  } catch (err) {
    throw new CError(INTERNAL_SERVER_ERROR, `An error occurred while retrieving a '${ENTITY_NAME}'.`)
  }

  if (!result) {
    throw new CError(NOT_FOUND, `A '${ENTITY_NAME}' was not found.`)
  }

  const profile: IProfile = {
    id: result._id,
    email: result.email,
    name: result.name,
    phone: result.phone,
    oneTimePassword: result.oneTimePassword,
    sessionToken: result.sessionToken,
    role: result.role,
    hotelId: result.hotelId,
  }

  return profile
}

export {
  readProfile,
}