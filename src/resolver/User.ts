import { Arg, Mutation, Resolver } from "type-graphql";
import { User } from "../entity/User";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";

@Resolver()
export class UserResolver {
  @Mutation((_returns) => UserMutationResponse, { nullable: true })
  async register(
    @Arg("registerInput")
    {
      username,
      password,
      email,
      age,
      phone,
      firstName,
      lastName,
    }: RegisterInput
  ): Promise<UserMutationResponse> {
    try {
      const existingUser = await User.findOne({
        where: [{ username }, { email }],
      });

      if (existingUser) {
        return {
          code: 400,
          success: false,
          message: "Username is already in use",
          error: [
            {
              field: existingUser.username === username ? "username" : "email",
              message: "Username or Email",
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
      return {
        code: 200,
        success: true,
        message: "User tao thanh cong ",
        user: await User.save(newUser),
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
//https://youtu.be/1UMNUbtzQXk?t=5668
