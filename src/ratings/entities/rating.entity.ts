import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("ratings")
export class Rating {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int", unique: true })
  product_id: number;

  @Column({ type: "decimal", precision: 3, scale: 2 })
  rate: number;

  @Column({ type: "int" })
  count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
