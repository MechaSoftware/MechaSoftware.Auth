import { NextResponse, NextRequest } from "next/server";

import bcrypt from "bcrypt";

import { ResetPassword } from '../../../../services/database';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const _code = formData.get('Code')!.toString();
    const _email = formData.get('Email')!.toString();
    const _encryptedPassword = formData.get('EncryptedPassword')!.toString();

    const _passwordNormal = Buffer.from(_encryptedPassword, 'base64').toString('binary');

    var result = await bcrypt.hash(_passwordNormal, 10).then(async (hash) => {
        return ResetPassword(_email, _code, hash).then((status) => {
            if (status.success) {
                return new Response(status.statusText, {
                    status: 200
                });
            } else {
                return new Response(status.statusText, {
                    status: status.status,
                    statusText: status.statusText
                });
            }
        });
    }).catch((err) => {
        console.log(err);
        return new Response("Something went wrong", {
            status: 400,
            statusText: "Something went wrong"
        });
    });

    await wait(3000);

    return result;
}

function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}