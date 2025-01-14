import { v4 as uuidv4 } from 'uuid'
import * as moment from 'moment'

import { AppConfig } from '../../app/config'
import { emailNewBooking } from '../../app/email'

import { BookingRepo } from '../../data/booking/BookingRepo'
import { OfferRepo } from '../../data/offer/OfferRepo'
import { getPaymentInfo, claimGuarantee } from '../../data/simard'

import { CONSTANTS } from '../../common/constants'
import { CError, isObject } from '../../common/tools'
import {
  IPostCreateOrderPayload,
  ICreateOrderResult,
  IOrgDetails,
  IOffer,
  IBaseBooking,
  ISimardPaymentInfo,
} from '../../common/types'

const { BAD_REQUEST } = CONSTANTS.HTTP_STATUS

const offerRepo = new OfferRepo()
const bookingRepo = new BookingRepo()

async function createOrder(requester: IOrgDetails, payload: IPostCreateOrderPayload): Promise<ICreateOrderResult> {
  const paymentInfo: ISimardPaymentInfo = await getPaymentInfo(payload.guaranteeId)

  const appConfig = await AppConfig.getInstance().getConfig()

  if (paymentInfo.creditorOrgId !== appConfig.WT_ROOMS_ORGID) {
    throw new CError(
      BAD_REQUEST,
      'Guarantee not meant for Rooms organization.',
      new Error(`appConfig.WT_ROOMS_ORGID = ${appConfig.WT_ROOMS_ORGID}; paymentInfo.creditorOrgId = ${paymentInfo.creditorOrgId}.`)
    )
  }

  const offer: IOffer = await offerRepo.readOfferByOfferId(payload.offerId)

  if (paymentInfo.debtorOrgId !== offer.debtorOrgId) {
    throw new CError(
      BAD_REQUEST,
      'Guarantee not created by offer requestor.',
      new Error(`offer.debtorOrgId = ${offer.debtorOrgId}; paymentInfo.debtorOrgId = ${paymentInfo.debtorOrgId}.`)
    )
  } else if (paymentInfo.currency !== offer.offer.price.currency) {
    throw new CError(
      BAD_REQUEST,
      'Invalid Guarantee currency.',
      new Error(`offer.offer.price.currency = ${offer.offer.price.currency}; paymentInfo.currency = ${paymentInfo.currency}.`)
    )
  } else if (
    (
      (typeof paymentInfo.amount === 'number') &&
      (paymentInfo.amount < offer.offer.price.public)
    ) ||
    (
      (typeof paymentInfo.amount === 'string') &&
      (
        (Number.isNaN(parseFloat(paymentInfo.amount))) ||
        (parseFloat(paymentInfo.amount) < offer.offer.price.public)
      )
    )
  ) {
    throw new CError(
      BAD_REQUEST,
      'Invalid Guarantee amount.',
      new Error(`offer.offer.price.public = ${offer.offer.price.public}; paymentInfo.amount = ${paymentInfo.amount}.`)
    )
  } else if (
    (!moment.utc(paymentInfo.expiration).isValid()) ||
    (moment.utc(paymentInfo.expiration).diff(moment.utc(new Date()), 'hours') <= 72)
  ) {
    throw new CError(
      BAD_REQUEST,
      'Guarantee expiration is too short.',
      new Error(`paymentInfo.expiration = ${paymentInfo.expiration}.`)
    )
  }

  let numberOfGuests = 0
  if (isObject(payload.passengers)) {
    const passengerList = Object.keys(payload.passengers)

    if (Array.isArray(passengerList)) {
      const numOfPassengers = passengerList.length

      if (numOfPassengers > 0) {
        numberOfGuests = numOfPassengers
      }
    }
  }

  const orderId = uuidv4()
  const baseBooking: IBaseBooking = {
    orderId,
    hotelId: offer.offer.pricePlansReferences.BAR.accommodation,
    roomTypeId: offer.offer.pricePlansReferences.BAR.roomType,
    checkInDate: offer.arrival,
    checkOutDate: offer.departure,
    guestName: payload.travellerName || '',
    guestEmail: payload.travellerEmail || '',
    phoneNumber: payload.travellerPhone || '',
    numberOfGuests,
    price: offer.offer.price.public || -1,
    currency: offer.offer.price.currency || '',
  }
  await bookingRepo.createBooking(baseBooking)
  await offerRepo.deleteOfferByOfferId(payload.offerId)

  await claimGuarantee(payload.guaranteeId)

  if (typeof offer.hotelEmail === 'string' && offer.hotelEmail.length > 0) {
    await emailNewBooking(requester.organization.did, orderId, offer.hotelEmail)
  }

  const result: ICreateOrderResult = {
    orderId,
    order: {
      passengers: payload.passengers,
      price: {
        currency: offer.offer.price.currency,
        public: offer.offer.price.public,
      },
      restrictions: {
        exchangeable: false,
        refundable: false,
      },
      status: 'OK',
      response: 'Committed',
      reservationNumber: orderId.split('-')[0].toUpperCase(),
    },
  }

  return result
}

export { createOrder }
