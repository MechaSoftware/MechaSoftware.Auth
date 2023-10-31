"use client"

import React, { createContext, useEffect, useState, Dispatch, SetStateAction } from 'react';

import UserActions from '../helpers/UserActions';

export type User = {
    id: string,
    email: string,
    username: string,
} | null;

export type Tokens = {
    access: string,
    //refresh: string
} | null;

interface IAuthContext {
    user: User;

    setUser: Dispatch<SetStateAction<User>>;

    authenticated: boolean;
    setAuthenticated: Dispatch<SetStateAction<boolean>>;

    tokens: Tokens;

    setTokens: Dispatch<SetStateAction<Tokens>>;
}

export const AuthContext = createContext<IAuthContext>({
    user: null,
    setUser: () => {},

    authenticated: false,
    setAuthenticated: () => {},

    tokens: null,
    setTokens: () => {}
});

export default function AuthContextProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>({
        id: "",
        email: "",
        username: "",
    });

    const [authenticated, setAuthenticated] = useState(false);
    const [tokens, setTokens] = useState<Tokens>(null);

    useEffect(() => {
        async function checkAuthentication() {
            if (UserActions.getTokenStore() && UserActions.getUserStore()) {
                const userFormData = new FormData();

                let tokenData = UserActions.getTokenStore();
                let userData = JSON.parse(UserActions.getUserStore()!) as User;
    
                userFormData.append("Email", userData!.email);
                userFormData.append("AccessToken", tokenData!);
    
                const res = await fetch('/api/authenticate', { method: "POST", body: userFormData });
    
                if (res.status != 200) {
                    setAuthenticated(false);
                    setTokens(null);
                    setUser(null);
                    return;
                };
    
                setAuthenticated(true);
                setUser(JSON.parse(UserActions.getUserStore()!) as User);
            } else {
                setAuthenticated(false);
            }
        }
        checkAuthentication();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, authenticated, setAuthenticated, tokens, setTokens }}>
            {children}
        </AuthContext.Provider>
    )
}