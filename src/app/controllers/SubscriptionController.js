import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Notification from '../schemas/Notification';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);

    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [User],
    });

    /**
     * Check for past meetup
     */
    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'Cannot subscribe to past meetups.' });
    }

    /**
     * Check if the user is not the meetup organizer
     */
    if (meetup.user_id === user.id) {
      return res
        .status(400)
        .json({ error: 'You cannot subscribe to a meetup organized by you.' });
    }

    /**
     * Check if the user is subscribed to a meetup with the same date and time
     */
    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res.status(400).json({
        error: "Can't subscribe to two meetups with the same date and time.",
      });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    /**
     *  Notifify meetup Organizer
     */
    await Notification.create({
      content: `${user.name} se inscreveu no seu meetup ${meetup.title}`,
      user: meetup.user_id,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
