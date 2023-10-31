/* eslint-disable import/no-anonymous-default-export */
import Cookie from 'js-cookie';

const isProd = process.env.NODE_ENV === 'production';

export default {
    logOut() {
        if (isProd) {
            Cookie.remove('MechaAuth_UserStore', { domain: 'mecha.software', secure: true, sameSite: "none" });
            Cookie.remove('MechaAuth_TokenStore', { domain: 'mecha.software', secure: true, sameSite: "none" });
        } else {
            Cookie.remove('MechaAuth_UserStore', { domain: 'localhost' });
            Cookie.remove('MechaAuth_TokenStore', { domain: 'localhost' });
        }
    },
    storeToken(token: string) {
        if (isProd) {
            Cookie.set('MechaAuth_TokenStore', token, { domain: 'mecha.software', secure: true, sameSite: "none" });
        } else {
            Cookie.set('MechaAuth_TokenStore', token, { domain: 'localhost' });
        }
    },
    storeUser(user: { id: string, username: string, email: string }) {
        if (isProd) {
            Cookie.set('MechaAuth_UserStore', JSON.stringify(user), { domain: 'mecha.software', secure: true, sameSite: "none" });
        } else {
            Cookie.set('MechaAuth_UserStore', JSON.stringify(user), { domain: 'localhost' });
        }
    },
    getUserStore() {
        return Cookie.get("MechaAuth_UserStore");
    },
    getTokenStore() {
        return Cookie.get("MechaAuth_TokenStore");
    }
}