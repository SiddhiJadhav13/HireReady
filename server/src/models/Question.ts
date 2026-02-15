import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
    role: string;
    skill: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

const questionSchema = new Schema<IQuestion>(
    {
        role: {
            type: String,
            required: true,
        },
        skill: {
            type: String,
            required: true,
        },
        question: {
            type: String,
            required: true,
        },
        options: {
            type: [String],
            required: true,
        },
        correctAnswer: {
            type: String,
            required: true,
        },
        explanation: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
