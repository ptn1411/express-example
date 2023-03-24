import { Arg, Ctx, Query, Resolver } from "type-graphql";

import { Context } from "../types/Context";
import { ImageResponse } from "../types/ImageResponse";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { Image } from "../entity/Image";
import { ImageLink } from "../types/ImageLink";
@Resolver()
export class ImageResolver {
  @Query((_return) => ImageResponse)
  async getListImageUser(
    @Arg("start") start: number,
    @Arg("limit") limit: number,
    @Arg("date") date: string,
    @Ctx() { req }: Context
  ): Promise<ImageResponse> {
    const id = req.session.userId;

    if (!id) {
      return {
        code: 400,
        success: false,
      };
    }
    const images = await AppDataSource.createQueryBuilder()
      .relation(User, "images")
      .of(id)
      .loadMany();

    if (!images) {
      return {
        code: 400,
        success: false,
      };
    }
    const data: ImageLink[] = [];
    images.map((image: Image) => {
      data.push({
        link: `${process.env.URL_APP}/image/u/${image.uuid}`,
        alt: date,
      });
    });
    return {
      code: 200,
      start: start,
      limit: limit,
      images: data,
      success: true,
    };
  }
}
