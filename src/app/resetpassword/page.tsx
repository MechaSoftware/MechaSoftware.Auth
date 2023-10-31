/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/rules-of-hooks */
"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import Image from "next/image";
import MechaSoftwareLogo from "../../../public/assets/MechaSoftware_Transparent.png";
import { AuthContext } from "../../../contexts/AuthContext";
import UserActions from "../../../helpers/UserActions";
import toast from "react-hot-toast";

export default function Page() {
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);
    const [getCode, setCode] = useState("");
    const [getEmail, setEmail] = useState("");

    const [getPasswordA, setPasswordA] = useState("");
    const [getPasswordB, setPasswordB] = useState("");

    const emailParam = useSearchParams().get("email");
    const codeParam = useSearchParams().get("code");

    useEffect(() => {
      if (codeParam) {
        setCode(codeParam);
      } else {
        setCode("");
      }

      if (emailParam) {
        setEmail(emailParam);
      } else {
        setEmail("");
      }

      setIsClient(true);
    }, [emailParam, codeParam]);

    const resetPassword = async () => {
      const passwordResetFormData = new FormData();

      if (getPasswordA.length < 6 || getPasswordB.length < 6) {
        toast.error("Password is too short (6 or more characters)!");
        return;
      }

      if (getPasswordA !== getPasswordB) {
        toast.error("Passwords do not match!")
        return;
      }

      const decodeURIEmail = decodeURIComponent(getEmail);

      const encryptedPassword = Buffer.from(getPasswordA, 'binary').toString('base64');

		  passwordResetFormData.append("Code", getCode);
		  passwordResetFormData.append("Email", decodeURIEmail);
		  passwordResetFormData.append("EncryptedPassword", encryptedPassword);
	
		  const res = await fetch('/api/resetpassword', { method: "POST", body: passwordResetFormData });

		  if (res.status != 200) {
        toast.error(res.statusText)
			  return;
		  };

      router.push('/login');
      toast.success("Password Reset");
    }
  
    return isClient ? (
      <main className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        {
          getCode.length > 0 && getEmail.length > 0 ? (
            <>
              <form className="flex flex-col rounded-xl border border-border bg-slate-700 px-[35px] py-[15px] w-[600px]">
                <div className="form-group">
                  <Image src={MechaSoftwareLogo} alt="Mecha Software Logo" className="mx-auto pt-[15px]" width={300} height={300} />

                  <h2 className="text-center text-2xl font-semibold mt-[15px]">Reset Password</h2>

                  <div className="form-field mt-[15px]">
                    <label className="form-label">New Password</label>

                    <input type="password" className="input input-solid input-ghost-primary max-w-full" value={getPasswordA} onChange={(e) => setPasswordA(e.target.value)} />
                  </div>

                  <div className="form-field mt-[15px] mb-[15px]">
                    <label className="form-label">Verify New Password</label>

                    <input type="password" className="input input-solid input-ghost-primary max-w-full" value={getPasswordB} onChange={(e) => setPasswordB(e.target.value)} />
                  </div>

                  <div className="form-field">
			              <div className="form-control justify-between">
				              <button type="button" id="createNewUserBtn" className="btn btn-primary w-full" onClick={() => resetPassword()}>Reset Password</button>
			              </div>
		              </div>
                </div>
              </form>
            </>
          ) : (
            <>
              No params found!
            </>
          )
        }
      </main>
    ) : (
      <></>
    )
  }
  