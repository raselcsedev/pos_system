import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IExpense extends Document {
  title: string;
  category: string;
  amount: number;
  date: Date;
  description?: string;
  branchId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: String,
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Expense: Model<IExpense> =
  mongoose.models.Expense ??
  mongoose.model<IExpense>("Expense", ExpenseSchema);
