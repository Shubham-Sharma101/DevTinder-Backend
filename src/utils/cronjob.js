const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("./sendEmail");
const ConnectionRequestModel = require("../models/connectionRequest");

cron.schedule("0 8 * * *", async () => {
  // Send emails to all people who get requests the previous day
  try {
    const yesterday = subDay(new Date(), 1);

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lte: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];
    for (const email of listOfEmails) {
      try {
        const res = await sendEmail.run(
          "New Friend Requests pending for " + email,
          "There are so many friend requests are pending, please login to DevTinder and accept 0r reject the request. ",
        );
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
});
