import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  PrimaryColumn,
  Index,
} from "typeorm";
import { ObjectType, Field } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity()
export class Image extends BaseEntity {
  @Field()
  @PrimaryColumn()
  uuid!: string;

  @Index()
  @ManyToOne(() => User, (user) => user.images)
  user!: User;

  @Field()
  @Column()
  alt!: string;

  @Field()
  @Column()
  path!: string;

  @Field()
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
