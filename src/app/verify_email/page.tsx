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

    useEffect(() => {
      setIsClient(true);
    }, []);
  
    return isClient ? (
      <main className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <form className="flex flex-col rounded-xl border border-border bg-slate-700 px-[35px] py-[15px] w-[600px]">
          <div className="form-group">
            <Image src={MechaSoftwareLogo} alt="Mecha Software Logo" className="mx-auto pt-[15px]" width={300} height={300} />

            <h2 className="text-center text-2xl font-semibold mt-[15px]">Activate Account</h2>
            <h4 className="text-center text-1xl font-semibold mt-[5px]">Thank you for joining Mecha Software!</h4>
            <h4 className="text-center text-1xl font-semibold mb-[15px]">Please check your emails for an activation link.<br></br>If you cannot find the email, check your spam folder!</h4>

            <div className="form-field">
			        <div className="form-control justify-between">
				        <button type="button" id="createNewUserBtn" className="btn btn-primary w-full" onClick={() => router.push("/login")}>Login Now</button>
			        </div>
		        </div>
          </div>
        </form>
      </main>
    ) : (
      <></>
    )
  }
  