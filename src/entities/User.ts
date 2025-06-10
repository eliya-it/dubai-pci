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

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  mfa_secret: string;

  @Column({ default: false })
  is_mfa_enabled: boolean;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ nullable: true })
  last_login_at: Date;

  @Column({ nullable: true })
  totp_secret: string;

  @Column({ nullable: true })
  totp_iv: string;

  @Column({ default: 0 })
  failed_login_attempts: number;

  @Column({ nullable: true })
  last_failed_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      console.log("Hashing password during insert:", {
        password: this.password,
        currentHash: this.password,
      });
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      console.log("New hash after insert:", this.password);
    }
  }

  async setPassword(password: string) {
    console.log("Setting password:", {
      password,
      currentHash: this.password,
    });
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(password, salt);
    console.log("New password hash:", this.password);
  }

  async validatePassword(password: string): Promise<boolean> {
    console.log("Validating password:", {
      providedPassword: password,
      storedHash: this.password,
    });
    const result = await bcrypt.compare(password, this.password);
    console.log("Password validation result:", result);
    return result;
  }
}
