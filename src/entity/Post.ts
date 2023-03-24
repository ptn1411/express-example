import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryColumn,
  OneToMany,
} from "typeorm";
import { ObjectType, Field } from "type-graphql";
import { User } from "./User";
import { Like } from "./Like";
import { Comment } from "./Comment";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryColumn()
  uuid!: string;

  @ManyToOne(() => User, (user) => user.posts)
  user!: User;

  @OneToMany(() => Like, (like) => like.post)
  likes!: Like[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];

  @Field()
  @Column()
  content!: string;

  @Field()
  @Column()
  shares!: number;

  @Field((_type) => [String])
  @Column({ type: "simple-array" })
  images?: string[];

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
