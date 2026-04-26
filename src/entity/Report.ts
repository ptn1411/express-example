import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Report extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @ManyToOne(() => User, (user) => user.report, { onDelete: "CASCADE" })
  user!: User;

  @Index()
  @ManyToOne(() => Post, (post) => post.report, { onDelete: "CASCADE" })
  post?: Post;

  @Field()
  @Column()
  status!: string;

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
