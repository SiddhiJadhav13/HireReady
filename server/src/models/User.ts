import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IMatchedRole {
    role: string;
    matchScore: number;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    resumePath: string;
    resumeText: string;
    extractedSkills: string[];
    selectedRole: string;
    programmingLanguages: string[];
    matchedRoles: IMatchedRole[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name must be at most 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default in queries
        },
        resumePath: {
            type: String,
            default: '',
        },
        resumeText: {
            type: String,
            default: '',
        },
        extractedSkills: {
            type: [String],
            default: [],
        },
        selectedRole: {
            type: String,
            default: '',
        },
        programmingLanguages: {
            type: [String],
            default: [],
        },
        matchedRoles: {
            type: [
                {
                    role: { type: String, required: true },
                    matchScore: { type: Number, required: true },
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
