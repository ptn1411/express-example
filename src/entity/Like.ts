import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";
import { Comment } from "./Comment";

@ObjectType()
@Entity()
export class Like extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: "CASCADE" })
  post?: Post;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: "CASCADE" })
  comment?: Comment;

  @Field()
  @Column()
  reactions!: string;

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;
}
