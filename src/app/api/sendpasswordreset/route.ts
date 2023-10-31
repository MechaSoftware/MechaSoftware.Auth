import { NextResponse, NextRequest } from "next/server";

import { SendPasswordReset } from '../../../../services/database';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const _email = formData.get('Email')!.toString();

    const result = await SendPasswordReset(_email).then((status) => {
        return new Response(status.statusText, {
            status: 200
        });
    });

    await wait(3000);

    return result;
}

function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}