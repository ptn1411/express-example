import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Not, In } from "typeorm";
import { User } from "../entity/User";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { LoginInput } from "../types/LoginInput";
import {
  hideEmailElement,
  hidePhoneElement,
  removeKeyObject,
  validateEmail,
  validatePassword,
} from "../utils";
import { Context } from "../types/Context";
import {
  COOKIE_NAME,
  DAY_TIME,
  KEY_PREFIX,
  LevelPassword,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../constants";
import {
  JwtGenerateTokens,
  JwtSignAccessToken,
  JwtVerifyAccessToken,
  JwtVerifyRefreshToken,
} from "../utils/jwt";

import { checkAccessToken } from "../middleware/checkAuth";
import { UserQueryResponse } from "../types/UserQueryResponse";
import { sendHtmlEmail } from "../services/email";
import { AppDataSource } from "../data-source";
import { UpdateUserInput } from "../types/UpdateUserInput";
import { validateUpdateUserInput } from "../utils/validateUpdateUserInput";

import { getFriends } from "../services/friend";
import redisClient from "../redis";

@Resolver()
export class UserResolver {
  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput") registerInput: RegisterInput
  ): Promise<UserMutationResponse> {
    const validateRegisterInputErrors = validateRegisterInput(registerInput);
    if (validateRegisterInputErrors !== null) {
      return {
        code: 400,
        success: false,
        ...validateRegisterInputErrors,
      };
    }
    try {
      const {
        username,
        password,
        email,
        birthday,
        sex,
        fullName,
        phone,
        firstName,
        lastName,
        avatar,
        coverImage,
      } = registerInput;
      const existingUser = await User.findOne({
        where: [{ username }, { email }],
      });

      if (existingUser) {
        return {
          code: 400,
          success: false,
          message: "user da ton tai",
          errors: [
            {
              field: existingUser.username === username ? "username" : "email",
              message: `${
                existingUser.username === username ? "Username" : "Email"
              } da ton tai`,
            },
          ],
        };
      }
      const tokenLink = await JwtSignAccessToken(
        {
          user: {
            email: email,
            username: username,
          },
        },
        DAY_TIME
      );
      if (tokenLink.error) {
        return {
          code: 500,
          success: false,
        };
      }
      const existingEmail = await sendHtmlEmail(
        { to: email },
        "Email Confirmation",
        "email-confirmation.ejs",
        {
          data: {
            link: `${process.env.FRONTEND_URL}/confirmation/${tokenLink.data}`,
            fullName: fullName,
          },
        }
      );
      await sendHtmlEmail(
        { to: email },
        "Welcome to Pham Thanh Nam!",
        "welcome.ejs",
        {}
      );
      if (!existingEmail) {
        return {
          code: 500,
          success: false,
          message: `error sending email`,
        };
      }

      const hashPassword = await argon2.hash(password);
      const newUser = User.create({
        username,
        password: hashPassword,
        email,
        fullName,
        phone,
        firstName,
        lastName,
        birthday,
        sex,
        avatar,
        coverImage,
        statusEmail: "pending",
      });
      await User.save(newUser);

      const dataUser = removeKeyObject(newUser, ["password"]);

      const token = await JwtGenerateTokens({ user: dataUser }, { rememberMe: false });
      if (token.error || !token.jti) {
        return { code: 500, success: false, message: `error token` };
      }
      await redisClient.set(`${KEY_PREFIX}rtoken:${newUser.id}:${token.jti}`, "1", "EX", DAY_TIME);

      return {
        code: 200,
        success: true,
        message: "User tao thanh cong ",
        user: newUser,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput") { usernameOrEmail, password, rememberMe }: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const isEmail = validateEmail(usernameOrEmail);

      const existingUser = await User.findOne({
        where: { [isEmail ? "email" : "username"]: usernameOrEmail },
      });
      if (!existingUser) {
        return {
          code: 400,
          success: false,
          message: "User không tồn tại",
          errors: [{ field: "usernameOrEmail", message: "Username hoặc email không tồn tại" }],
        };
      }

      const passwordValid = await argon2.verify(existingUser.password, password);
      if (!passwordValid) {
        return {
          code: 400,
          success: false,
          message: "Mật khẩu sai",
          errors: [{ field: "password", message: "Mật khẩu không đúng" }],
        };
      }

      // Track last login
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "";
      existingUser.lastLoginAt = new Date();
      existingUser.lastLoginIp = ip;
      await existingUser.save();

      existingUser.email = hideEmailElement(existingUser.email).emailHide;
      existingUser.phone = hidePhoneElement(existingUser.phone).phoneHide;
      const dataUser = removeKeyObject(existingUser, ["password"]);

      const token = await JwtGenerateTokens({ user: dataUser }, { rememberMe: rememberMe ?? false });
      if (token.error || !token.jti) {
        return { code: 500, success: false, message: "Lỗi tạo token" };
      }

      // Store jti in Redis so we can revoke it later
      // TTL mirrors the refresh token expiry: 30 days or 1 day
      const ttl = rememberMe ? DAY_TIME * 30 : DAY_TIME;
      await redisClient.set(`${KEY_PREFIX}rtoken:${existingUser.id}:${token.jti}`, "1", "EX", ttl);

      return {
        code: 200,
        success: true,
        user: existingUser,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
      };
    } catch (error) {
      return { code: 500, success: false, message: `server ${error}` };
    }
  }
  @Mutation((_return) => Boolean)
  async logout(
    @Arg("refreshToken") refreshToken: string,
    @Ctx() { req, res }: Context
  ): Promise<boolean> {
    res.clearCookie(COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    const userId = req.user?.id;
    if (userId) {
      // Revoke this specific refresh token by deleting its jti from Redis
      const decoded = await JwtVerifyRefreshToken(refreshToken);
      if (decoded.data?.jti) {
        await redisClient.del(`${KEY_PREFIX}rtoken:${userId}:${decoded.data.jti}`);
      }
      await redisClient.del(`${KEY_PREFIX}userid:${userId}`);
      await redisClient.del(`${KEY_PREFIX}socketid:${userId}`);
    }
    return true;
  }

  @Mutation((_return) => Boolean)
  @UseMiddleware(checkAccessToken)
  async logoutAll(@Ctx() { req, res }: Context): Promise<boolean> {
    res.clearCookie(COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    const userId = req.user?.id;
    if (userId) {
      // Delete all refresh tokens for this user from Redis
      const keys = await redisClient.keys(`${KEY_PREFIX}rtoken:${userId}:*`);
      if (keys.length > 0) await redisClient.del(...keys);
      await redisClient.del(`${KEY_PREFIX}userid:${userId}`);
      await redisClient.del(`${KEY_PREFIX}socketid:${userId}`);
    }
    return true;
  }
  @UseMiddleware(checkAccessToken)
  @Query((_return) => UserMutationResponse)
  async user(@Ctx() { req }: Context): Promise<UserMutationResponse> {
    try {
      const id = req.user?.id;

      const existingUser = await User.findOneBy({
        id,
      });
      if (!existingUser) {
        return {
          code: 404,
          success: false,
        };
      }
      existingUser.email = hideEmailElement(existingUser.email).emailHide;
      existingUser.phone = hidePhoneElement(existingUser.phone).phoneHide;

      return {
        code: 200,
        success: true,
        user: existingUser,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }
  @UseMiddleware(checkAccessToken)
  @Query((_return) => UserMutationResponse)
  async getUser(
    @Arg("username") username: string
  ): Promise<UserMutationResponse> {
    try {
      const existingUser = await User.findOneBy({
        username,
      });
      if (!existingUser) {
        return {
          code: 404,
          success: false,
        };
      }

      existingUser.email = "";
      existingUser.phone = "";
      existingUser.birthday = "";
      existingUser.sex = false;
      existingUser.createAt = new Date();
      existingUser.updateAt = new Date();

      return {
        code: 200,
        success: true,
        user: existingUser,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }
  @UseMiddleware(checkAccessToken)
  @Query((_return) => UserMutationResponse)
  async getUserByUuid(
    @Arg("userUuid") userUuid: string
  ): Promise<UserMutationResponse> {
    try {
      const existingUser = await User.findOneBy({
        id: userUuid,
      });
      if (!existingUser) {
        return {
          code: 404,
          success: false,
        };
      }

      existingUser.email = "";
      existingUser.phone = "";
      existingUser.birthday = "";
      existingUser.sex = false;
      existingUser.createAt = new Date();
      existingUser.updateAt = new Date();

      return {
        code: 200,
        success: true,
        user: existingUser,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }
  @UseMiddleware(checkAccessToken)
  @Query((_return) => UserQueryResponse)
  async getUsers(): Promise<UserQueryResponse> {
    try {
      const existingUsers = await User.find({
        select: {
          id: true,
          username: true,
          avatar: true,
          fullName: true,
        },
        take: 20,
        order: {
          fullName: "ASC",
          id: "DESC",
        },
      });
      if (!existingUsers) {
        return {
          code: 404,
          success: false,
        };
      }

      return {
        code: 200,
        success: true,
        users: existingUsers,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }
  @UseMiddleware(checkAccessToken)
  @Query((_return) => UserQueryResponse)
  async getUsersYouMayKnow(
    @Ctx() { req }: Context
  ): Promise<UserQueryResponse> {
    try {
      const uuid = req.user?.id as string;
      const friendsId = await getFriends(uuid);
      const excludeIds = [...friendsId, uuid];

      const suggestions = await User.find({
        select: { id: true, username: true, avatar: true, fullName: true },
        where: { id: Not(In(excludeIds)) },
        order: { createAt: "DESC" },
        take: 20,
      });

      return {
        code: 200,
        success: true,
        users: suggestions,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }
  @Query((_return) => Boolean)
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    try {
      const existingUser = await User.findOne({
        where: {
          email,
        },
      });
      if (!existingUser) {
        return false;
      }

      const token = await JwtSignAccessToken(
        {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username,
          },
        },
        DAY_TIME
      );
      if (token.error) {
        return false;
      }
      const link = `${process.env.FRONTEND_URL}/resetpassword/${token.data}`;

      await sendHtmlEmail(
        { to: existingUser.email },
        "Forgot Password",
        "password-reset.ejs",
        {
          data: {
            link: link,
          },
        }
      );

      return true;
    } catch (error) {
      return false;
    }
  }
  @Mutation((_return) => Boolean)
  async resetPassword(
    @Arg("token") token: string,
    @Arg("password") password: string
  ): Promise<boolean> {
    try {
      const decodedUser = await JwtVerifyAccessToken(token as string);
      if (decodedUser.error) {
        return false;
      }
      const existingUser = await User.findOne({
        where: {
          id: decodedUser.data?.user.id,
        },
      });
      if (!existingUser) {
        return false;
      }
      if (!validatePassword(LevelPassword.LOW, password)) {
        return false;
      }
      const hashPassword = await argon2.hash(password);
      existingUser.password = hashPassword;
      await AppDataSource.manager.save(existingUser);
      return true;
    } catch (error) {
      return false;
    }
  }
  @UseMiddleware(checkAccessToken)
  @Mutation((_return) => UserMutationResponse)
  async updateUser(
    @Arg("updateUserInput") updateUserInput: UpdateUserInput,

    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const uuid = req.user?.id;
      const validateUpdateUserInputError =
        validateUpdateUserInput(updateUserInput);

      if (validateUpdateUserInputError !== null) {
        return {
          code: 400,
          success: false,
          ...validateUpdateUserInputError,
        };
      }
      const existingUser = await User.findOneBy({
        id: uuid,
      });
      if (!existingUser) {
        return {
          code: 404,
          success: false,
        };
      }

      existingUser.avatar = updateUserInput.avatar || existingUser.avatar;
      existingUser.coverImage =
        updateUserInput.coverImage || existingUser.coverImage;
      existingUser.firstName =
        updateUserInput.firstName || existingUser.firstName;
      existingUser.lastName = updateUserInput.lastName || existingUser.lastName;

      existingUser.fullName = updateUserInput.fullName || existingUser.fullName;
      await AppDataSource.manager.save(existingUser);
      return {
        code: 200,
        success: true,
        user: existingUser,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `server`,
      };
    }
  }
  @Query((_return) => Boolean)
  async confirmation(@Arg("token") token: string): Promise<boolean> {
    try {
      const decodedUser = await JwtVerifyAccessToken(token as string);
      if (decodedUser.error) {
        return false;
      }
      const existingUser = await User.findOneBy({
        email: decodedUser.data?.user.email,
      });
      if (!existingUser) {
        return false;
      }
      existingUser.statusEmail = "confirmed";
      await AppDataSource.manager.save(existingUser);
      return true;
    } catch (error) {
      return false;
    }
  }
}
