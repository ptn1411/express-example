import {
  Entity,
  Column,
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
import { Comment } from "./Comment";

@ObjectType()
@Entity()
@Unique(["user", "post"])
export class Like extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  user!: User;

  @Index()
  @ManyToOne(() => Post, (post) => post.likes, { onDelete: "CASCADE" })
  post?: Post;

  @Index()
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

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
