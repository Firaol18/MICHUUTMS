import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('newsletter_subscriptions')
export class NewsletterSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ default: 'MICHUU-WELCOME-15' })
  promoCode: string;

  @Column({ type: 'int', default: 15 })
  discountPercent: number;

  @Column({ default: false })
  isRedeemed: boolean;

  @Column({ nullable: true })
  redeemedBookingRef?: string;

  @Column({ type: 'timestamp', nullable: true })
  redeemedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
