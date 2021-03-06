import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  startOfDay,
  endOfDay,
  startOfHour,
  parseISO,
  isBefore,
} from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
      limit: 10,
      offset: 10 * page - 10,
      order: ['date'],
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * Check for past dates
     */
    const hourStart = startOfHour(parseISO(req.body.date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted. ' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    /**
     * Checks if logged user is the owner
     */
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to edit this meetup.",
      });
    }

    /**
     * Check for past dates
     */

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Invalid date.' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'You cannot edit a past meetup.' });
    }

    const {
      id,
      title,
      description,
      location,
      date,
      banner_id,
    } = await meetup.update(req.body);

    return res.json({
      id,
      title,
      description,
      location,
      date,
      banner_id,
    });
  }

  async show(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetup, {
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(meetup);
  }

  async delete(req, res) {
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    /**
     * Checks if logged user is the owner
     */
    if (meetup.user_id !== user_id) {
      return res.status(401).json({
        error: "You don't have permission to cancel this meetup",
      });
    }

    /**
     * Check for past dates
     */

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'You cannot delete a past meetup. ' });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
