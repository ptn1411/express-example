import webPush from "web-push";
import { Device } from "../entity/Device";

webPush.setVapidDetails(
  process.env.VAPID_EMAIL ?? "mailto:admin@localhost",
  process.env.WEB_PUSH_PUBLIC_KEY as string,
  process.env.WEB_PUSH_PRIVATE_KEY as string
);

export let sendNotification = async (
  subscription: webPush.PushSubscription,
  title: string,
  body: string
) => {
  const payload = JSON.stringify({
    title,
    message: body,
  });
  try {
    await webPush.sendNotification(subscription, payload);
  } catch (error) {
    console.error("Push notification failed:", error);
  }
};

export let sendNotificationByUser = async (
  userId: string,
  title: string,
  body: string
) => {
  try {
    const existingDevice = await Device.findOneBy({
      user: {
        id: userId,
      },
    });
    if (existingDevice) {
      let subscription: webPush.PushSubscription;
      try {
        subscription = JSON.parse(existingDevice.subscription);
      } catch {
        return;
      }
      const payload = JSON.stringify({ title, message: body });
      await webPush.sendNotification(subscription, payload);
    }
  } catch (error) {
    console.error("sendNotificationByUser failed:", error);
  }
};
