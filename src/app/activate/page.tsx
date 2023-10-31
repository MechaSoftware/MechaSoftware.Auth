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

    const activateAccount = async () => {
      const activateFormData = new FormData();

      const decodeURIEmail = decodeURIComponent(getEmail);

		  activateFormData.append("Code", getCode);
		  activateFormData.append("Email", decodeURIEmail);
	
		  const res = await fetch('/api/activateaccount', { method: "POST", body: activateFormData });

		  if (res.status != 200) {
        toast.error(res.statusText)
			  return;
		  };

      router.push('/login');
      toast.success("Account Activated");
    }
  
    return isClient ? (
      <main className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        {
          getCode.length > 0 && getEmail.length > 0 ? (
            <>
              <form className="flex flex-col rounded-xl border border-border bg-slate-700 px-[35px] py-[15px] w-[600px]">
                <div className="form-group">
                  <Image src={MechaSoftwareLogo} alt="Mecha Software Logo" className="mx-auto pt-[15px]" width={300} height={300} />

                  <h2 className="text-center text-2xl font-semibold mt-[15px]">Activate Account</h2>
                  <h4 className="text-center text-1xl font-semibold mt-[5px]">Thank you for joining Mecha Software!</h4>
                  <h4 className="text-center text-1xl font-semibold mb-[15px]">Click the button below to finish activating your account!</h4>

                  <div className="form-field">
			              <div className="form-control justify-between">
				              <button type="button" id="createNewUserBtn" className="btn btn-primary w-full" onClick={() => activateAccount()}>Activate Account</button>
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
  