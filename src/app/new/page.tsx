/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable import/no-anonymous-default-export */
"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Image from "next/image";
import MechaSoftwareLogo from "../../../public/assets/MechaSoftware_Transparent.png";
import toast from "react-hot-toast";

export default function Page() {
    const router = useRouter();

	const [isClient, setIsClient] = useState(false)

	const [getUsername, setUsername] = useState("")
	const [getUsernameError, setUsernameError] = useState("")
	const [getEmail, setEmail] = useState("")
	const [getEmailError, setEmailError] = useState("")
	const [getPassword, setPassword] = useState("")
	const [getPasswordError, setPasswordError] = useState("")
	const [getFieldsFail2, setFieldsFail2] = useState(false)

	const emailExpression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

	let areFieldsInvalid1 = false;
 
    useEffect(() => {
      	setIsClient(true);
    }, [])

	const createNewUser = async () => {
		if (getUsername.length == 0) {
			setUsernameError("Username must not be blank!");
			areFieldsInvalid1 = true;
		}

		if (getEmail.length == 0) {
			setEmailError("Email Address must not be blank!");
			areFieldsInvalid1 = true;
		}

		if (getPassword.length == 0) {
			setPasswordError("Password must not be blank!");
			areFieldsInvalid1 = true;
		}

		if (areFieldsInvalid1 || getFieldsFail2) return;

		let createNewUserBtn = document.getElementById("createNewUserBtn") as HTMLButtonElement;

		createNewUserBtn.disabled = true;
		createNewUserBtn.textContent = "Loading...";

		const userFormData = new FormData();

		const encryptedPassword = Buffer.from(getPassword, 'binary').toString('base64');
	
		userFormData.append("Username", getUsername);
		userFormData.append("EmailAddress", getEmail);
		userFormData.append("EncryptedPassword", encryptedPassword);
	
		const res = await fetch('/api/newuser', { method: "POST", body: userFormData });

		if (res.status != 200) {
			toast.error(res.statusText)

			createNewUserBtn.disabled = false;
			createNewUserBtn.textContent = "Create New Account";
			return;
		};
	
		router.push(`/verify_email`);
		toast.success("Account Created");
	}

	const onUsernameInputChange = (username: string) => {
		setUsername(username.toLowerCase());

		if (username.length < 5) {
			setUsernameError("Username is too short (5 or more characters)!");
			setFieldsFail2(true);
		} else {
			setUsernameError("");

			if (getUsernameError.length != 0 || getEmailError.length != 0 || getPasswordError.length != 0) {
				setFieldsFail2(true);
			} else {
				setFieldsFail2(false);
			}
		}
	}

	const onEmailInputChange = (email: string) => {
		setEmail(email);
		
		if (!emailExpression.test(email)) {
			setEmailError("Email Address is not valid!");
			setFieldsFail2(true);
		} else {
			setEmailError("");
			
			if (getUsernameError.length != 0 || getEmailError.length != 0 || getPasswordError.length != 0) {
				setFieldsFail2(true);
			} else {
				setFieldsFail2(false);
			}
		}
	}

	const onPasswordInputChange = (password: string) => {
		setPassword(password);
		
		if (password.length < 6) {
			setPasswordError("Password is too short (6 or more characters)!");
			setFieldsFail2(true);
		} else {
			setPasswordError("");
			
			if (getUsernameError.length != 0 || getEmailError.length != 0 || getPasswordError.length != 0) {
				setFieldsFail2(true);
			} else {
				setFieldsFail2(false);
			}
		}
	}
    
    return isClient ? (
        <main className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <form className="flex flex-col rounded-xl border border-border bg-slate-700 px-[35px] py-[15px] w-[600px]" autoComplete="off">
	            <div className="form-group">
					<Image src={MechaSoftwareLogo} alt="Mecha Software Logo" className="mx-auto pt-[15px]" width={300} height={300} />

					<h2 className="text-center text-2xl font-semibold mb-[15px] mt-[15px]">New Account</h2>

					<div className="form-field">
			            <label className="form-label">Username</label>

			            <input name="username" placeholder="xdgoldentiger" type="text" className="input input-solid input-ghost-primary max-w-full" value={getUsername} onChange={(e) => onUsernameInputChange(e.target.value)} required={true} />
		            	
						{ getUsernameError.length != 0 ? (<p className="text-sm text-red-600 dark:text-red-500">{getUsernameError}</p>) : "" }
					</div>

		            <div className="form-field mt-[15px]">
			            <label className="form-label">Email Address</label>

			            <input name="email" placeholder="username@example.com" type="email" className="input input-solid input-ghost-primary max-w-full" value={getEmail} onChange={(e) => onEmailInputChange(e.target.value)} required={true} />
		            	
						{ getEmailError.length != 0 ? (<p className="text-sm text-red-600 dark:text-red-500">{getEmailError}</p>) : "" }
					</div>

		            <div className="form-field mt-[15px]">
                        <label className="form-label">Password</label>

                        <input name="password" type="password" className="input input-solid input-ghost-primary max-w-full" value={getPassword} onChange={(e) => onPasswordInputChange(e.target.value)} required={true} /> 
		            
						{ getPasswordError.length != 0 ? (<p className="text-sm text-red-600 dark:text-red-500">{getPasswordError}</p>) : "" }
					</div>

		            <div className="form-field mt-[15px]">
			            <div className="form-control justify-between">
				            <button type="button" id="createNewUserBtn" className="btn btn-primary w-full" onClick={() => createNewUser()}>Create New Account</button>
			            </div>
		            </div>

                    <div className="form-field pb-[15px]">
			            <div className="form-control justify-between">
                            <label className="form-label">
					            <a className="link link-underline-hover link-primary text-sm" onClick={() => router.push(`/login`)}>Already have an account? Login!</a>
				            </label>
			            </div>
		            </div>
	            </div>
            </form>
      </main>
    ) : (
		<></>
	)
  }
  