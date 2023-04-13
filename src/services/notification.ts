import webPush from "web-push";
import { Device } from "../entity/Device";

webPush.setVapidDetails(
  process.env.URL_APP as string,
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
  webPush.sendNotification(subscription, payload);
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
      const payload = JSON.stringify({
        title,
        message: body,
      });
      const subscription: webPush.PushSubscription = JSON.parse(
        existingDevice.subscription
      );

      await webPush.sendNotification(subscription, payload, {});
    }
  } catch (error) {
    console.log(error);
  }
};
