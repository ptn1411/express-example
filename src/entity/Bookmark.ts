import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  Unique,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
@Entity()
@Unique(["user", "post"])
export class Bookmark extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: "CASCADE" })
  user!: User;

  @Index()
  @ManyToOne(() => Post, (post) => post.bookmarks, { onDelete: "CASCADE" })
  post!: Post;

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
