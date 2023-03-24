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

  @ManyToOne(() => User, (user) => user.comments)
  user!: User;

  @ManyToOne(() => Post, (post) => post.comments)
  post?: Post;

  @OneToMany(() => Like, (like) => like.comment)
  likes!: Like[];

  @ManyToOne(() => Comment, (comment) => comment.comments)
  comment?: Comment;

  @OneToMany(() => Comment, (comment) => comment.comment)
  comments?: Comment[];

  @Field()
  @Column()
  content!: string;

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;
}
