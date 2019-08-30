import Notification from '../schemas/Notification';
import Meetup from '../models/Meetup';

class NotificationController {
  async index(req, res) {
    const checkIsOrganizer = await Meetup.findOne({
      where: { user_id: req.userId },
    });

    if (!checkIsOrganizer) {
      return res
        .status(401)
        .json({ error: 'Only meetup organizers can load notifications' });
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
      },
      {
        new: true,
      }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
