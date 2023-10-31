/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/rules-of-hooks */
"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import Image from "next/image";
import MechaSoftwareLogo from "../../../public/assets/MechaSoftware_Transparent.png";
import { AuthContext, Tokens, User } from "../../../contexts/AuthContext";
import UserActions from "../../../helpers/UserActions";
import toast from "react-hot-toast";

export default function Page() {
    const router = useRouter();

    const { user, setUser, tokens, setTokens, authenticated, setAuthenticated } = useContext(AuthContext);

    const [isClient, setIsClient] = useState(false);

    const [getUsernameEmail, setUsernameEmail] = useState("")
    const [isTextInputEmailUsername, setIsTextInputEmailUsername] = useState("")
    const [getPassword, setPassword] = useState("")

    const emailExpression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    const handleLogout = () => {
      setUser(null);
      setTokens(null);
      setAuthenticated(false);
      UserActions.logOut();
    }

    const loginUser = async () => {
      if (getUsernameEmail.length == 0) {
        setUsernameEmail("blank");
      }

      if (getPassword.length == 0) {
        setPassword("blank");
      }
  
      let loginUserBtn = document.getElementById("loginUserBtn") as HTMLButtonElement;
  
      loginUserBtn.disabled = true;
      loginUserBtn.textContent = "Loading...";
  
      const userFormData = new FormData();
  
      const encryptedPassword = Buffer.from(getPassword, 'binary').toString('base64');
    
      userFormData.append("UsernameEmail", getUsernameEmail);
      userFormData.append("EncryptedPassword", encryptedPassword);
      userFormData.append("IsEmail", isTextInputEmailUsername == "Email" ? "true" : "false");
    
      const res = await fetch('/api/login', { method: "POST", body: userFormData });
  
      if (res.status != 200) {
        toast.error(res.statusText)
  
        loginUserBtn.disabled = false;
        loginUserBtn.innerHTML = "Login to&nbsp;<b>Mecha Software</b>";
        return;
      };

      const userLoginSessionData = await res.json();

      setUser({ id: userLoginSessionData.userId, email: userLoginSessionData.userEmail, username: userLoginSessionData.userName } as User);
      setAuthenticated(true);
      setTokens({ access: userLoginSessionData.accessToken } as Tokens);

      UserActions.storeUser({ id: userLoginSessionData.userId, email: userLoginSessionData.userEmail, username: userLoginSessionData.userName });
      UserActions.storeToken(userLoginSessionData.accessToken);
    
      router.push(`/login`);
      router.refresh();
      toast.success("Logged In")
    }

    const onEmailUsernameInputChange = (emailUsername: string) => {
      setUsernameEmail(emailUsername.toLowerCase());
		
		  if (!emailExpression.test(emailUsername)) {
			  setIsTextInputEmailUsername("Username");
		  } else {
			  setIsTextInputEmailUsername("Email");
		  }
	  }

    const onPasswordInputChange = (password: string) => {
      setPassword(password);
    }

    useEffect(() => {
      setIsClient(true)
    }, []);
  
    return isClient ? (
      <main className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
      {
        authenticated ? (
          <>
            <form className="flex flex-col rounded-xl border border-border bg-slate-700 px-[35px] py-[15px] w-[600px]">
              <div className="form-group">
                <Image src={MechaSoftwareLogo} alt="Mecha Software Logo" className="mx-auto pt-[15px]" width={300} height={300} />

                <h2 className="text-center text-2xl font-semibold mb-[15px] mt-[15px]">User Account</h2>

                <p className="text-center text-lg">Welcome back, {user?.username}</p>

                <div className="form-field pb-[15px]">
                  <div className="form-control justify-between">
                    <button type="button" className="btn btn-primary btn-md w-full text-[17px]">Continue to&nbsp;<b>Mecha Software</b></button>
                  </div>
                  <div className="form-control justify-between">
                    <button type="button" className="btn btn-md w-full text-[17px] btn-outline-error mt-[5px]" onClick={() => handleLogout()}>Logout</button>
                  </div>
                </div>
              </div>
            </form>
          </>
        ) : (
          <>
            <form className="flex flex-col rounded-xl border border-border bg-slate-700 px-[35px] py-[15px] w-[600px]" autoComplete="off">
              <div className="form-group">
                <Image src={MechaSoftwareLogo} alt="Mecha Software Logo" className="mx-auto pt-[15px]" width={300} height={300} />

                <h2 className="text-center text-2xl font-semibold mb-[15px] mt-[15px]">Account Login</h2>

                <div className="form-field">
                  <label className="form-label">Email/Username</label>

                  <input placeholder="username@example.com // xdgoldentiger" type="text" className="input input-solid input-ghost-primary max-w-full" value={getUsernameEmail} onChange={(e) => onEmailUsernameInputChange(e.target.value)} />
                  { isTextInputEmailUsername.length != 0 ? (<p className="mt-0 text-sm text-white text-right">({isTextInputEmailUsername})</p>) : "" }
                </div>

                <div className="form-field mt-[15px]">
                  <label className="form-label">Password</label>

                  <input type="password" className="input input-solid input-ghost-primary max-w-full" value={getPassword} onChange={(e) => onPasswordInputChange(e.target.value)} />
                </div>

                <div className="form-field mt-[15px]">
                  <div className="form-control justify-between">
                    <button id="loginUserBtn" type="button" className="btn btn-primary w-full" onClick={() => loginUser()}>Login to&nbsp;<b>Mecha Software</b></button>
                  </div>
                </div>

                <div className="form-field pb-[15px]">
                  <div className="form-control justify-between">
                    <label className="form-label">
                      <a className="link link-underline-hover link-primary text-sm" onClick={() => router.push(`/new`)}>Don't have an account? Create One!</a>
                    </label>

                    <label className="form-label">
                      <a className="link link-underline-hover link-primary text-sm" onClick={() => router.push(`/password_reset`)}>Forgot your password?</a>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </>
        )
      }
      </main>
    ) : (
      <></>
    )
  }
  