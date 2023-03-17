import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { ObjectType, Field } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryColumn()
  uuid!: string;

  @ManyToOne(() => User, (user) => user.posts)
  user!: User;

  @Field()
  @Column()
  content!: string;

  @Field()
  @Column()
  likes!: number;

  @Field()
  @Column()
  shares!: number;

  @Field((_type) => [String])
  @Column({ type: "simple-array", nullable: true })
  images!: string[];

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
