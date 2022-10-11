import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import { Op, UniqueConstraintError } from "sequelize";
import { IUser } from "../repositories/userRepo";
import ResponseError from "../utils/error";
import jwt, { Secret } from "jsonwebtoken";
import { User } from "../db";
import { Participants } from "../models/Participants";
import { Room } from "../models/Room";

// @api  POST /api/v1/user/register
// @desc Register new user
// @access  public
export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(200).json({ errors: errors.array() });
      return;
    }
    try {
      let result = await User.create(req.body);
      res.status(200).json({
        userId: result.getDataValue("id"),
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return next(new ResponseError("User already exist", 404));
      }

      throw error;
    }
  }
);

// @api  POST /api/v1/user/login
// @desc Login and return the auth token
// @access  public
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(200).json({ errors: errors.array() });
      return;
    }
    const { username, password } = req.body;
    let user = await User.findOne({
      where: {
        username,
        password,
      },
      attributes: {
        exclude: ["password"],
      },
    });
    if (!user)
      return next(new ResponseError("Incorrect username or password", 400));

    const userInfo: IUser = user.get();
    let secret = process.env.JWT_SECRET;
    if (secret == undefined)
      return next(new ResponseError("Missing `JWT_SECRET` env. variable", 500));

    let token = jwt.sign(
      { id: userInfo.id },
      process.env.JWT_SECRET as Secret,
      {
        expiresIn: "7d",
      }
    );

    // Get user friends
    const participants = await Participants.findAll({
      where: {
        userId: userInfo.id,
      },
      attributes: ["roomId"],
    });

    const roomIds = participants.map((p) => p.getDataValue("roomId"));
    const friends = await Participants.findAll({
      where: {
        roomId: {
          [Op.or]: roomIds,
        },
        userId: {
          [Op.not]: userInfo.id,
        },
      },
      attributes: ["roomId"],
      include: [
        {
          model: User,
          foreignKey: "userId",
          attributes: {
            exclude: ["password"],
          },
        },
      ],
    });

    res.status(200).json({
      user,
      token,
      roomIds,
      friends: friends.map((f) => ({
        roomId: f.getDataValue("roomId"),
        user: f.getDataValue("User"),
      })),
    });
  }
);
