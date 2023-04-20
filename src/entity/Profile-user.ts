import {
  BaseEntity,
  Column,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from "typeorm";
import { User } from "./User";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity("profile_user")
export class ProfileUser extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  city!: string;

  @Field()
  @Column()
  education!: string;

  @Field()
  @Column()
  from!: string;

  @Field()
  @Column()
  relationship!: string;

  @Field()
  @Column()
  workplace!: string;

  @OneToOne(() => User, (user) => user.profile)
  user!: User;

  @Field()
  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updateAt!: Date;
}
