import { NextResponse, NextRequest } from "next/server";

import { ActivateAccount } from '../../../../services/database';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const _code = formData.get('Code')!.toString();
    const _email = formData.get('Email')!.toString();

    const result = await ActivateAccount(_email, _code).then((status) => {
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

    await wait(3000);

    return result;
}

function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}