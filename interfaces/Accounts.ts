export enum UserStatusMood {
    Happy,
    Sad,
    Tired,
    Sleeping
}

export enum UserTags {
    U = "User Account",
    S = "Supporter",
    MS = "Mecha Staff",
    MF = "Mecha Founder",
    B = "Bot Account",
    D = "Deleted Account",
    T = "Terminated Account"
}

export enum UserStatusIndicator {
    O = "Online",
    DND = "Do Not Disturb",
    I = "Idle",
    OF = "Invisible"
}

export type UserVerificationCodeType = {
    email: string | null,
    passwordReset: string | null
}

export type UserProfile = {
    name: string,
    picture: string,
    theme: string
}

export type UserStatus = {
    indicator: UserStatusIndicator,
    message: string,
    mood: UserStatusMood
}