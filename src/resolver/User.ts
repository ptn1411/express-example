import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { User } from "../entity/User";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { LoginInput } from "../types/LoginInput";
import { validateEmail } from "../utils";
import { Context } from "../types/Context";
import { COOKIE_NAME } from "../constants";

@Resolver()
export class UserResolver {
  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req }: Context
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
      const { username, password, email, age, phone, firstName, lastName } =
        registerInput;
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
        age,
        phone,
        firstName,
        lastName,
      });
      await User.save(newUser);
      req.session.userId = newUser.id;
      return {
        code: 200,
        success: true,
        message: "User tao thanh cong ",
        user: newUser,
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
    @Ctx() { req }: Context
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
  @Mutation((_return) => Boolean)
  async logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }
}
