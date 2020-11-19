import { v4 as uuidv4 } from 'uuid'

import { readProfileByEmail, createProfile, updateProfile } from '../../../../_lib/data/profile'
import { createHotel } from '../../../../_lib/data/hotel'
import { CONSTANTS } from '../../../../_lib/infra/constants'
import { IProfile, IBaseHotel } from '../../../../_lib/types'

const { OWNER } = CONSTANTS.PROFILE_ROLE

async function getClientAppOneTimePassword(email: string, sessionToken: string): Promise<string> {
  const oneTimePassword: string = uuidv4()

  let profile: IProfile|null
  try {
    profile = await readProfileByEmail(email)
  } catch (err) {
    // Maybe a profile for the given email does not exist? We will try to create a new one below.
    profile = null
  }

  if (profile === null) {
    const profileId: string = await createProfile({
      email,
      name: '',
      phone: '',
      oneTimePassword,
      sessionToken,
      role: OWNER,
      hotelId: '',
    })

    const hotel: IBaseHotel = {
      ownerId: profileId,
      name: '',
      address: '',
      location: { lat: 0, lng: 0 },
    }
    const hotelId: string = await createHotel(hotel)    

    updateProfile(profileId, { hotelId })
  } else {
    await updateProfile(profile.id, { oneTimePassword, sessionToken })
  }

  return oneTimePassword
}

export {
  getClientAppOneTimePassword,
}