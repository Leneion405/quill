import { PLANS } from '@/config/stripe'
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import Stripe from 'stripe'


export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-04-10',
  typescript: true,
})

export async function getUserSubscriptionPlan() {

  const { getUser } = getKindeServerSession()
  const user = await getUser()


  if (!user || !user.id) {
    return {  
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    }
  }

  // Query the database for the user
  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  })

  // If user is not found in the database, return the default plan
  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    }
  }

  // Check if the user is subscribed
  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
    dbUser.stripeCurrentPeriodEnd &&
    dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  )

  // Find the corresponding plan
  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
    : null

  // Check if the subscription is canceled
  let isCanceled = false
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dbUser.stripeSubscriptionId
    )
    isCanceled = stripePlan.cancel_at_period_end
  }

  // Return the subscription details
  return {
    ...plan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  }
}
