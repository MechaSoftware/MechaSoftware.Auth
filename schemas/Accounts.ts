import mongoose from 'mongoose';
import { UserProfile, UserStatus, UserTags, UserVerificationCodeType } from '../interfaces/Accounts';

const AccountsSchema = new mongoose.Schema({
    UserId: {
        type: String,
        required: true
    },
    UserName: {
        type: String,
        required: true
    },
    UserEmail: {
        type: String,
        required: true
    },
    UserPassword: {
        type: String,
        required: true
    },
    UserAgeVerified: {
        type: Boolean,
        required: true
    },
    UserEmailVerified: {
        type: Boolean,
        required: true
    },
    UserVerificationCodes: {
        type: Array<UserVerificationCodeType>,
        required: true
    },
    UserTags: {
        type: Array<UserTags>,
        required: true
    },
    UserStatus: {
        type: Array<UserStatus>,
        required: true
    },
    UserProfile: {
        type: Array<UserProfile>,
        required: true
    },
    UserAccessToken: {
        type: String,
        required: true
    },
});

export default mongoose.models.Accounts || mongoose.model('Accounts', AccountsSchema);