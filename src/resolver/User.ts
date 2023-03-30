import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { User } from "../entity/User";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { LoginInput } from "../types/LoginInput";
import { hideEmailElement, hidePhoneElement, validateEmail } from "../utils";
import { Context } from "../types/Context";
import { COOKIE_NAME, DAY_TIME, REFRESH_TOKEN_COOKIE_NAME } from "../constants";
import { JwtSendRefreshToken, JwtSignAccessToken } from "../utils/jwt";
import jsonP from "@ptndev/json";
import { checkAuth } from "../middleware/checkAuth";
import { UserQueryResponse } from "../types/UserQueryResponse";

@Resolver()
export class UserResolver {
  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req, res }: Context
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
      });
      await User.save(newUser);
      req.session.userId = newUser.id;
      const dataUser = jsonP.removeKeyObject(newUser, ["password"]);

      const accessToken = JwtSignAccessToken({ user: dataUser }, DAY_TIME);
      if (!accessToken) {
        return {
          code: 500,
          success: false,
          message: `error token`,
        };
      }
      JwtSendRefreshToken(res, { user: dataUser });
      return {
        code: 200,
        success: true,
        message: "User tao thanh cong ",
        user: newUser,
        accessToken: accessToken,
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
    @Arg("loginInput") { usernameOrEmail, password }: LoginInput,
    @Ctx() { req, res }: Context
  ): Promise<UserMutationResponse> {
    try {
      const isEmail = validateEmail(usernameOrEmail);

      const existingUser = await User.findOne({
        where: {
          [isEmail ? "email" : "username"]: usernameOrEmail,
        },
      });
      if (!existingUser) {
        return {
          code: 400,
          success: false,
          message: "User khong toi tai",
          errors: [
            {
              field: "usernameOrEmail",
              message: "username or email khong ton tai",
            },
          ],
        };
      }
      const passwordValid = await argon2.verify(
        existingUser.password,
        password
      );
      if (!passwordValid) {
        return {
          code: 400,
          success: false,
          message: "password sai",
          errors: [{ field: "password", message: "password sai" }],
        };
      }

      req.session.userId = existingUser.id;
      existingUser.email = hideEmailElement(existingUser.email).emailHide;
      existingUser.phone = hidePhoneElement(existingUser.phone).phoneHide;
      const dataUser = jsonP.removeKeyObject(existingUser, ["password"]);

      const accessToken = JwtSignAccessToken({ user: dataUser }, DAY_TIME);
      if (!accessToken) {
        return {
          code: 500,
          success: false,
          message: `error token`,
        };
      }
      JwtSendRefreshToken(res, { user: dataUser });
      return {
        code: 200,
        success: true,
        user: existingUser,
        accessToken: accessToken,
      };
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
        message: `server ${error}`,
      };
    }
  }
  @Mutation((_return) => Boolean)
  async logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }
  @UseMiddleware(checkAuth)
  @Query((_return) => UserMutationResponse)
  async user(@Ctx() { req }: Context): Promise<UserMutationResponse> {
    try {
      const id = req.session.userId;

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
  @UseMiddleware(checkAuth)
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
      existingUser.id = 0;
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
  @UseMiddleware(checkAuth)
  @Query((_return) => UserQueryResponse)
  async getUsers(): Promise<UserQueryResponse> {
    try {
      const existingUsers = await User.find({
        select: {
          username: true,
          fullName: true,
          avatar: true,
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
}
