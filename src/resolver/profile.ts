import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { ProfileResponse } from "../types/ProfileResponse";
import { checkAccessToken } from "../middleware/checkAuth";
import { ProfileInput } from "../types/ProfileInput";
import { validateProfileInput } from "../utils/validateProfileInput";
import { ProfileUser } from "../entity/Profile-user";
import { Context } from "../types/Context";

@Resolver()
export class ProfileResolver {
  @UseMiddleware(checkAccessToken)
  @Mutation((_return) => ProfileResponse)
  async updateProfile(
    @Arg("profileInput")
    profileInput: ProfileInput,
    @Ctx() { req }: Context
  ) {
    const uuid = req.user?.id;
    const validateProfileInputError = validateProfileInput(profileInput);
    if (validateProfileInputError !== null) {
      return {
        code: 400,
        success: false,
        ...validateProfileInputError,
      };
    }
    try {
      const existingProfile = await ProfileUser.findOne({
        where: {
          user: {
            id: uuid,
          },
        },
      });
      if (!existingProfile) {
        const newProfile = await ProfileUser.create({
          user: {
            id: uuid,
          },
          ...profileInput,
        });
        await newProfile.save();
        return {
          code: 200,
          success: true,
          profile: newProfile,
        };
      }
      existingProfile.city = profileInput.city || existingProfile.city;

      existingProfile.relationship =
        profileInput.relationship || existingProfile.relationship;

      existingProfile.workplace =
        profileInput.workplace || existingProfile.workplace;

      existingProfile.education =
        profileInput.education || existingProfile.education;

      existingProfile.from = profileInput.from || existingProfile.from;
      await existingProfile.save();
      return {
        code: 200,
        success: true,
        profile: existingProfile,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
      };
    }
  }
  @UseMiddleware(checkAccessToken)
  @Query((_return) => ProfileResponse)
  async profile(@Ctx() { req }: Context) {
    const uuid = req.user?.id;
    try {
      const profile = await ProfileUser.findOne({
        where: {
          user: {
            id: uuid,
          },
        },
      });
      return {
        code: 200,
        success: true,
        profile,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
      };
    }
  }
  @UseMiddleware(checkAccessToken)
  @Query((_return) => ProfileResponse)
  async profileByUser(@Arg("username") username: string) {
    try {
      const profile = await ProfileUser.findOne({
        where: {
          user: {
            username: username,
          },
        },
      });
      return {
        code: 200,
        success: true,
        profile,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
      };
    }
  }
}
