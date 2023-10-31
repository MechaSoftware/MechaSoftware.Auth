import { NextResponse, NextRequest } from "next/server";

import { AuthenticateUser } from '../../../../services/database';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const _usernameEmail = formData.get('UsernameEmail')!.toString();
    const _encryptedPassword = formData.get('EncryptedPassword')!.toString();
    const _isEmail = formData.get('IsEmail')!.toString();

    const result = await AuthenticateUser(_usernameEmail, _encryptedPassword, _isEmail).then((status) => {
        if (status.success) {
            return new Response(status.data!, {
                status: 200
            });
        } else {
            return new Response(status.statusText, {
                status: status.status,
                statusText: status.statusText
            });
        }
    });

    await wait(3000);

    return result;
}

function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}