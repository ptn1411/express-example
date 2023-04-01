import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";
import { Like } from "./Like";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  post?: Post;

  @OneToMany(() => Like, (like) => like.comment, { onDelete: "CASCADE" })
  likes!: Like[];

  @ManyToOne(() => Comment, (comment) => comment.comments, {
    onDelete: "CASCADE",
  })
  comment?: Comment;

  @OneToMany(() => Comment, (comment) => comment.comment)
  comments?: Comment[];

  @Field()
  @Column({
    type: "text",
  })
  content!: string;

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;
}
