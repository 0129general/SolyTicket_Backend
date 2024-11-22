import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function processSubscriptions() {
  const now = new Date();

  // Fetch all active subscriptions that need to be renewed
  const subscriptions = await prisma.subscription.findMany({
    where: {
      isActive: true,
      endDate: {
        lte: now,
      },
    },
    include: {
      user: true,
      family: true,
    },
  });

  for (const subscription of subscriptions) {
    try {
      // Simulate payment processing (replace with actual payment logic)
      console.log(`Processing payment for subscription ${subscription.id}`);

      // Extend the subscription end date by 1 month (or your preferred period)
      const newEndDate = new Date(subscription.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + 1);

      // Update the subscription in the database
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { endDate: newEndDate, updatedAt: now },
      });

      console.log(
        `Subscription ${subscription.id} renewed until ${newEndDate}`,
      );
    } catch (error) {
      console.error(
        `Failed to process subscription ${subscription.id}:`,
        error,
      );
    }
  }
}

// Schedule the batch job to run every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running subscription payment batch job");
  processSubscriptions().catch((error) => {
    console.error("Failed to run subscription payment batch job:", error);
  });
});
