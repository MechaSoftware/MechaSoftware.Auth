import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcrypt";

import { CreateUser } from '../../../../services/database';
import { NewUserReturn } from "../../../../interfaces/NewUserReturn";

export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const _username = formData.get('Username')!.toString();
    const _email = formData.get('EmailAddress')!.toString();
    const _encryptedPassword = formData.get('EncryptedPassword')!.toString();

    const _passwordNormal = Buffer.from(_encryptedPassword, 'base64').toString('binary');

    var result = await bcrypt.hash(_passwordNormal, 10).then(async (hash) => {
        return CreateUser(_username, _email, hash).then((status) => {
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