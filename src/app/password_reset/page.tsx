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
	const [getEmail, setEmail] = useState("");

	const emailExpression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
 
    useEffect(() => {
      setIsClient(true)
    }, [])

	const sendPasswordReset = async () => {
		const passwordReset = new FormData();

		if (getEmail.length <= 0 || !emailExpression.test(getEmail)) {
			return;
		}
  
		passwordReset.append("Email", getEmail);
	  
		const res = await fetch('/api/sendpasswordreset', { method: "POST", body: passwordReset });
  
		router.push('/password_reset');
		toast.success(await res.text());
	  }
    
    return isClient ? (
        <main className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <form className="flex flex-col rounded-xl border border-border bg-slate-700 px-[35px] py-[15px] w-[600px]" autoComplete="off">
	            <div className="form-group">
					<Image src={MechaSoftwareLogo} alt="Mecha Software Logo" className="mx-auto pt-[15px]" width={300} height={300} />

					<h2 className="text-center text-2xl font-semibold mb-[15px] mt-[15px]">Forgot Password</h2>

		            <div className="form-field mt-[15px]">
			            <label className="form-label">Email Address</label>

			            <input placeholder="username@example.com" type="email" className="input input-solid input-ghost-primary max-w-full" onChange={(e) => setEmail(e.target.value)} required={true} />
		            </div>

		            <div className="form-field mt-[15px]">
			            <div className="form-control justify-between">
				            <button type="button" className="btn btn-primary w-full" onClick={() => sendPasswordReset()}>Send Password Reset Link</button>
			            </div>
		            </div>

                    <div className="form-field pb-[15px]">
			            <div className="form-control justify-between">
                            <label className="form-label">
					            <a className="link link-underline-hover link-primary text-sm" type="submit" onClick={() => router.push(`/login`)}>Back to Login</a>
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
