import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export interface IToken {
  id: string;
  token: string;

  created_at: Date;
  updated_at: Date;
}

@Entity("tokens")
export class Token implements IToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  token!: string;

  @Column({ type: "text" })
  ciphertext: string;
  @Column({ type: "text" })
  iv: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
