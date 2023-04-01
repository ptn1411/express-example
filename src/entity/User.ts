import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ObjectType, Field } from "type-graphql";
import { Post } from "./Post";
import { Image } from "./Image";
import { Like } from "./Like";
import { Comment } from "./Comment";
import { Bookmark } from "./Bookmark";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column({ unique: true })
  phone!: string;

  @Column()
  password!: string;

  @Field()
  @Column()
  firstName!: string;

  @Field()
  @Column()
  lastName!: string;

  @Field()
  @Column()
  fullName!: string;

  @Field()
  @Column()
  birthday!: string;

  @Field()
  @Column()
  sex!: boolean;

  @Field()
  @Column()
  avatar!: string;

  @Field()
  @Column()
  coverImage!: string;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  @OneToMany(() => Image, (image) => image.user)
  images!: Image[];

  @OneToMany(() => Like, (like) => like.user)
  likes!: Like[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks!: Bookmark[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;

  @Field()
  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updateAt!: Date;
}
