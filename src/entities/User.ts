import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import bcrypt from "bcrypt";

export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export interface IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  mfa_secret?: string;
  role: Role;
  is_mfa_enabled: boolean;
  is_email_verified: boolean;
  last_login_at?: Date;
  totp_secret?: string;
  totp_iv?: string;
  failed_login_attempts: number;
  last_failed_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

@Entity("users")
export class User implements IUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  private _password!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  mfa_secret?: string;

  @Column({ type: "enum", enum: Role, default: Role.USER })
  role!: Role;

  @Column({ default: false })
  is_mfa_enabled!: boolean;

  @Column({ default: false })
  is_email_verified!: boolean;

  @Column({ nullable: true })
  last_login_at?: Date;

  @Column({ nullable: true })
  totp_secret?: string;

  @Column({ nullable: true })
  totp_iv?: string;

  @Column({ default: 0 })
  failed_login_attempts!: number;

  @Column({ nullable: true })
  last_failed_login_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  get password(): string {
    return this._password;
  }

  async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this._password = await bcrypt.hash(password, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this._password);
  }
}
