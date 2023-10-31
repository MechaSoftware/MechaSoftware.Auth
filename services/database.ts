"use server"

import mongoose, { ConnectOptions } from 'mongoose';
import { Snowflake } from "@theinternetfolks/snowflake";
import nodemailer from 'nodemailer';
import Accounts from '../schemas/Accounts';
import { NewUserReturn } from '../interfaces/NewUserReturn';
import { UserTags, UserStatus, UserStatusIndicator, UserStatusMood, UserProfile, UserVerificationCodeType } from '../interfaces/Accounts';

import bcrypt from "bcrypt";

const MONGOOSE_USER = process.env.MONGOOSE_USER!;
const MONGOOSE_PWD = process.env.MONGOOSE_PWD!;
const MONGOOSE_DB = process.env.MONGOOSE_DB!;

const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = process.env.SMTP_PORT!;
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PWD = process.env.SMTP_PWD!;

if (!MONGOOSE_USER) {
  throw new Error('Please define the MONGOOSE_USER environment variable inside .env');
}

if (!MONGOOSE_PWD) {
    throw new Error('Please define the MONGOOSE_PWD environment variable inside .env');
}

if (!MONGOOSE_DB) {
    throw new Error('Please define the MONGOOSE_DB environment variable inside .env');
}

if (!SMTP_HOST) {
    throw new Error('Please define the SMTP_HOST environment variable inside .env');
}

if (!SMTP_PORT) {
    throw new Error('Please define the SMTP_PORT environment variable inside .env');
}

if (!SMTP_USER) {
    throw new Error('Please define the SMTP_USER environment variable inside .env');
}

if (!SMTP_PWD) {
    throw new Error('Please define the SMTP_PWD environment variable inside .env');
}

const isProd = process.env.NODE_ENV === 'production';

const localProdDomain = isProd ? "https://auth.mecha.software" : "http://localhost:3000";

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: true,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: SMTP_USER,
        pass: SMTP_PWD
    }
});

export async function mongooseInit() {
    const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: true,
    } as ConnectOptions;

    const conn = await mongoose.connect(`mongodb://${MONGOOSE_USER}:${MONGOOSE_PWD}@mongoose.mecha.software:65345/${MONGOOSE_DB}`, opts).then(mongoose => {
        return mongoose;
    });

    const connection = conn.connection;

    connection.on('error', console.log.bind(console, 'Mongoose Error: '));

    return connection;
}

export async function CreateUser(name: string, email: string, password: string) {
    await mongooseInit();

    const dbUserEmail = await Accounts.findOne({
        UserEmail: email
    });

    const dbUserName = await Accounts.findOne({
        UserName: name
    });

    if (dbUserName) {
        return new NewUserReturn(false, 408, "Username is taken");
    } else if (dbUserEmail) {
        return new NewUserReturn(false, 409, "Email is already registered to an account");
    } else {
        const identifer = await GenerateUserId();

        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const longstring = Array.from({length: 50}, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
        const longBase64 = Buffer.from(longstring, 'ascii');
        const longBase64Str = longBase64.toString('base64', 0, 50);

        const newUser = Accounts.create({
            UserId: identifer,
            UserName: name,
            UserEmail: email,
            UserPassword: password,
            UserAgeVerified: false,
            UserEmailVerified: false,
            UserVerificationCodes: { email: longstring, passwordReset: null } as UserVerificationCodeType,
            UserTags: [ UserTags.U ],
            UserStatus: { indicator: UserStatusIndicator.OF, message: "", mood: UserStatusMood.Happy } as UserStatus,
            UserProfile: { name: name, picture: "default", theme: "default" } as UserProfile,
            UserAccessToken: longBase64Str
        });

        var activationLink = `${localProdDomain}/activate?code=${longstring}&email=${encodeURIComponent(email)}`

        var message = {
            from: "Mecha Software <noreply@mecha.software>",
            to: `${name} <${email}>`,
            replyTo: "support@mecha.software",
            subject: "Account Verification",
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
            <head>
            <meta charset="UTF-8">
            <meta content="width=device-width, initial-scale=1" name="viewport">
            <meta name="x-apple-disable-message-reformatting">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="telephone=no" name="format-detection">
            <title>New message</title><!--[if (mso 16)]>
            <style type="text/css">
            a {text-decoration: none;}
            </style>
            <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
            <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG></o:AllowPNG>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            <style type="text/css">
            #outlook a {
            padding:0;
            }
            .es-button {
            mso-style-priority:100!important;
            text-decoration:none!important;
            }
            a[x-apple-data-detectors] {
            color:inherit!important;
            text-decoration:none!important;
            font-size:inherit!important;
            font-family:inherit!important;
            font-weight:inherit!important;
            line-height:inherit!important;
            }
            .es-desk-hidden {
            display:none;
            float:left;
            overflow:hidden;
            width:0;
            max-height:0;
            line-height:0;
            mso-hide:all;
            }
            @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
            </style>
            </head>
            <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
            <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6"><!--[if gte mso 9]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
            <v:fill type="tile" color="#f6f6f6"></v:fill>
            </v:background>
            <![endif]-->
            <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6">
            <tr>
            <td valign="top" style="padding:0;Margin:0">
            <table class="es-header" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
            <tr>
            <td align="center" style="padding:0;Margin:0">
            <table class="es-header-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
            <tr>
            <td align="left" style="padding:0;Margin:0">
            <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr>
            <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:600px">
            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr>
            <td align="center" style="padding:10px;Margin:0;font-size:0px"><img class="adapt-img" src="https://ebitfhg.stripocdn.email/content/guids/CABINET_9a1c59a8f3d9c56c77ad1cd4c45c9907652419e2f88e25acda98b11223eb9bfd/images/mechasoftware_transparent_Xm6.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="230" height="77"></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table>
            <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr>
            <td align="center" style="padding:0;Margin:0">
            <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
            <tr>
            <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
            <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr>
            <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr>
            <td align="center" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;color:#333333;font-size:16px">Hey ${name},<br><br>Thank you for joining Mecha Software! To activate your account and start using our services, please click the verification button below:</p></td>
            </tr>
            <tr>
            <td align="center" style="padding:20px;Margin:0;font-size:0">
            <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr>
            <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:unset;height:1px;width:100%;margin:0px"></td>
            </tr>
            </table></td>
            </tr>
            <tr>
            <td align="center" style="padding:0;Margin:0"><!--[if mso]><a href="${activationLink}" target="_blank" hidden>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="${activationLink}"
            style="height:41px; v-text-anchor:middle; width:192px" arcsize="15%" stroke="f" fillcolor="#3579d0">
            <w:anchorlock></w:anchorlock>
            <center style='color:#ffffff; font-family:arial, "helvetica neue", helvetica, sans-serif; font-size:15px; font-weight:400; line-height:15px; mso-text-raise:1px'>Activate Account</center>
            </v:roundrect></a>
            <![endif]--><!--[if !mso]><!-- --><span class="msohide es-button-border" style="border-style:solid;border-color:#2cb543;background:#3579d0;border-width:0px;display:inline-block;border-radius:6px;width:auto;mso-hide:all"><a href="${activationLink}" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;display:inline-block;background:#3579d0;border-radius:6px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center;padding:10px 20px 10px 20px;mso-padding-alt:0;mso-border-alt:10px solid #31CB4B">Activate Account</a></span><!--<![endif]--></td>
            </tr>
            <tr>
            <td align="center" style="padding:10px;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:23px;color:#333333;font-size:15px">If the button isn’t clickable, you can copy and paste this link into your browser:<br>${activationLink}</p></td>
            </tr>
            <tr>
            <td align="center" style="padding:20px;Margin:0;font-size:0">
            <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr>
            <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:unset;height:1px;width:100%;margin:0px"></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            <tr>
            <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr>
            <td align="center" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;color:#333333;font-size:16px">Best Regards,<br>Mecha Software Team</p></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table></td>
            </tr>
            </table>
            </div>
            </body>
            </html>`
        };

        await transporter.sendMail(message);

        return new NewUserReturn(true, 200, "Account Created");
    }
}

export async function ActivateAccount(email: string, code: string) {
    await mongooseInit();

    const dbUserEmail = await Accounts.findOne({
        UserEmail: email
    });

    if (dbUserEmail) {
        if (dbUserEmail.UserVerificationCodes[0].email === code) {
            const updateAccount = await Accounts.updateOne({ _id: dbUserEmail._id }, {
                UserEmailVerified: true,
                UserVerificationCodes: { email: null, passwordReset: dbUserEmail.UserVerificationCodes.passwordReset } as UserVerificationCodeType
            });

            return new NewUserReturn(true, 200, "Account Activated");
        } else {
            return new NewUserReturn(false, 404, "Email or Code is invalid");
        }
    } else {
        return new NewUserReturn(false, 404, "Email or Code is invalid");
    }
}

export async function ResetPassword(email: string, code: string, password: string) {
    await mongooseInit();

    const dbUserEmail = await Accounts.findOne({
        UserEmail: email
    });

    if (dbUserEmail) {
        if (dbUserEmail.UserVerificationCodes[0].passwordReset === code) {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            const longstring = Array.from({length: 50}, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
            const longBase64 = Buffer.from(longstring, 'ascii');
            const longBase64Str = longBase64.toString('base64', 0, 50);

            const updateAccount = await Accounts.updateOne({ _id: dbUserEmail._id }, {
                UserPassword: password,
                UserVerificationCodes: { email: dbUserEmail.UserVerificationCodes.email, passwordReset: null } as UserVerificationCodeType,
                UserAccessToken: longBase64Str
            });

            return new NewUserReturn(true, 200, "Password Reset");
        } else {
            return new NewUserReturn(false, 404, "Email or Code is invalid");
        }
    } else {
        return new NewUserReturn(false, 404, "Email or Code is invalid");
    }
}

export async function Authenticate(email: string, accessToken: string) {
    await mongooseInit();

    const dbUserEmail = await Accounts.findOne({
        UserEmail: email
    });

    if (dbUserEmail) {
        if (dbUserEmail.UserAccessToken === accessToken) {
            return new NewUserReturn(true, 200, "Authenticated");
        } else {
            return new NewUserReturn(false, 404, "Invalid Token");
        }
    } else {
        return new NewUserReturn(false, 404, "Invalid Token");
    }
}

export async function SendPasswordReset(email: string) {
    await mongooseInit();

    const dbUserEmail = await Accounts.findOne({
        UserEmail: email
    });

    if (dbUserEmail) {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const longstring = Array.from({length: 50}, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');

        const updateAccount = await Accounts.updateOne({ _id: dbUserEmail._id }, {
            UserVerificationCodes: { email: dbUserEmail.UserVerificationCodes.email, passwordReset: longstring } as UserVerificationCodeType
        });

        var resetLink = `${localProdDomain}/resetpassword?code=${longstring}&email=${encodeURIComponent(email)}`

        var message = {
            from: "Mecha Software <noreply@mecha.software>",
            to: `${dbUserEmail.UserName} <${email}>`,
            replyTo: "support@mecha.software",
            subject: "Password Reset",
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
              <head>
                <meta charset="UTF-8">
                <meta content="width=device-width, initial-scale=1" name="viewport">
                <meta name="x-apple-disable-message-reformatting">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta content="telephone=no" name="format-detection">
                <title>New message</title>
                <!--[if (mso 16)]>
                                        <style type="text/css">
                        a {text-decoration: none;}
                        </style>
                                        <![endif]-->
                <!--[if gte mso 9]>
                                        <style>sup { font-size: 100% !important; }</style>
                                        <![endif]-->
                <!--[if gte mso 9]>
                                        <xml>
                                            <o:OfficeDocumentSettings>
                                                <o:AllowPNG></o:AllowPNG>
                                                <o:PixelsPerInch>96</o:PixelsPerInch>
                                            </o:OfficeDocumentSettings>
                                        </xml>
                                        <![endif]-->
                <style type="text/css">
                  #outlook a {
                    padding: 0;
                  }
            
                  .es-button {
                    mso-style-priority: 100 !important;
                    text-decoration: none !important;
                  }
            
                  a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: none !important;
                    font-size: inherit !important;
                    font-family: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                  }
            
                  .es-desk-hidden {
                    display: none;
                    float: left;
                    overflow: hidden;
                    width: 0;
                    max-height: 0;
                    line-height: 0;
                    mso-hide: all;
                  }
            
                  @media only screen and (max-width:600px) {
            
                    p,
                    ul li,
                    ol li,
                    a {
                      line-height: 150% !important
                    }
            
                    h1,
                    h2,
                    h3,
                    h1 a,
                    h2 a,
                    h3 a {
                      line-height: 120% !important
                    }
            
                    h1 {
                      font-size: 30px !important;
                      text-align: left
                    }
            
                    h2 {
                      font-size: 24px !important;
                      text-align: left
                    }
            
                    h3 {
                      font-size: 20px !important;
                      text-align: left
                    }
            
                    .es-header-body h1 a,
                    .es-content-body h1 a,
                    .es-footer-body h1 a {
                      font-size: 30px !important;
                      text-align: left
                    }
            
                    .es-header-body h2 a,
                    .es-content-body h2 a,
                    .es-footer-body h2 a {
                      font-size: 24px !important;
                      text-align: left
                    }
            
                    .es-header-body h3 a,
                    .es-content-body h3 a,
                    .es-footer-body h3 a {
                      font-size: 20px !important;
                      text-align: left
                    }
            
                    .es-menu td a {
                      font-size: 14px !important
                    }
            
                    .es-header-body p,
                    .es-header-body ul li,
                    .es-header-body ol li,
                    .es-header-body a {
                      font-size: 14px !important
                    }
            
                    .es-content-body p,
                    .es-content-body ul li,
                    .es-content-body ol li,
                    .es-content-body a {
                      font-size: 14px !important
                    }
            
                    .es-footer-body p,
                    .es-footer-body ul li,
                    .es-footer-body ol li,
                    .es-footer-body a {
                      font-size: 14px !important
                    }
            
                    .es-infoblock p,
                    .es-infoblock ul li,
                    .es-infoblock ol li,
                    .es-infoblock a {
                      font-size: 12px !important
                    }
            
                    *[class="gmail-fix"] {
                      display: none !important
                    }
            
                    .es-m-txt-c,
                    .es-m-txt-c h1,
                    .es-m-txt-c h2,
                    .es-m-txt-c h3 {
                      text-align: center !important
                    }
            
                    .es-m-txt-r,
                    .es-m-txt-r h1,
                    .es-m-txt-r h2,
                    .es-m-txt-r h3 {
                      text-align: right !important
                    }
            
                    .es-m-txt-l,
                    .es-m-txt-l h1,
                    .es-m-txt-l h2,
                    .es-m-txt-l h3 {
                      text-align: left !important
                    }
            
                    .es-m-txt-r img,
                    .es-m-txt-c img,
                    .es-m-txt-l img {
                      display: inline !important
                    }
            
                    .es-button-border {
                      display: inline-block !important
                    }
            
                    a.es-button,
                    button.es-button {
                      font-size: 18px !important;
                      display: inline-block !important
                    }
            
                    .es-adaptive table,
                    .es-left,
                    .es-right {
                      width: 100% !important
                    }
            
                    .es-content table,
                    .es-header table,
                    .es-footer table,
                    .es-content,
                    .es-footer,
                    .es-header {
                      width: 100% !important;
                      max-width: 600px !important
                    }
            
                    .es-adapt-td {
                      display: block !important;
                      width: 100% !important
                    }
            
                    .adapt-img {
                      width: 100% !important;
                      height: auto !important
                    }
            
                    .es-m-p0 {
                      padding: 0px !important
                    }
            
                    .es-m-p0r {
                      padding-right: 0px !important
                    }
            
                    .es-m-p0l {
                      padding-left: 0px !important
                    }
            
                    .es-m-p0t {
                      padding-top: 0px !important
                    }
            
                    .es-m-p0b {
                      padding-bottom: 0 !important
                    }
            
                    .es-m-p20b {
                      padding-bottom: 20px !important
                    }
            
                    .es-mobile-hidden,
                    .es-hidden {
                      display: none !important
                    }
            
                    tr.es-desk-hidden,
                    td.es-desk-hidden,
                    table.es-desk-hidden {
                      width: auto !important;
                      overflow: visible !important;
                      float: none !important;
                      max-height: inherit !important;
                      line-height: inherit !important
                    }
            
                    tr.es-desk-hidden {
                      display: table-row !important
                    }
            
                    table.es-desk-hidden {
                      display: table !important
                    }
            
                    td.es-desk-menu-hidden {
                      display: table-cell !important
                    }
            
                    .es-menu td {
                      width: 1% !important
                    }
            
                    table.es-table-not-adapt,
                    .esd-block-html table {
                      width: auto !important
                    }
            
                    table.es-social {
                      display: inline-block !important
                    }
            
                    table.es-social td {
                      display: inline-block !important
                    }
            
                    .es-desk-hidden {
                      display: table-row !important;
                      width: auto !important;
                      overflow: visible !important;
                      max-height: inherit !important
                    }
                  }
                </style>
              </head>
              <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
                <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6">
                  <!--[if gte mso 9]>
                                            <v:background
                                                xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                                                <v:fill type="tile" color="#f6f6f6"></v:fill>
                                            </v:background>
                                            <![endif]-->
                  <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6">
                    <tr>
                      <td valign="top" style="padding:0;Margin:0">
                        <table class="es-header" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                          <tr>
                            <td align="center" style="padding:0;Margin:0">
                              <table class="es-header-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                                <tr>
                                  <td align="left" style="padding:0;Margin:0">
                                    <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                      <tr>
                                        <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:600px">
                                          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                            <tr>
                                              <td align="center" style="padding:10px;Margin:0;font-size:0px">
                                                <img class="adapt-img" src="https://ebitfhg.stripocdn.email/content/guids/CABINET_9a1c59a8f3d9c56c77ad1cd4c45c9907652419e2f88e25acda98b11223eb9bfd/images/mechasoftware_transparent_Xm6.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="230" height="77">
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                          <tr>
                            <td align="center" style="padding:0;Margin:0">
                              <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                                <tr>
                                  <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
                                    <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                      <tr>
                                        <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                                          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                            <tr>
                                              <td align="center" style="padding:0;Margin:0">
                                                <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;color:#333333;font-size:16px">Hey ${dbUserEmail.UserName}, <br>
                                                  <br>There was a request to change your password! <br>If you did not make this request then please ignore this email. <br>
                                                  <br>Otherwise, please click the button below to change your password:
                                                </p>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td align="center" style="padding:20px;Margin:0;font-size:0">
                                                <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                  <tr>
                                                    <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:unset;height:1px;width:100%;margin:0px"></td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td align="center" style="padding:0;Margin:0">
                                                <!--[if mso]>
                                                                                                                                <a href="${resetLink}" target="_blank" hidden>
                                                                                                                                    <v:roundrect
                                                                                                                                        xmlns:v="urn:schemas-microsoft-com:vml"
                                                                                                                                        xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="${resetLink}"
                        style="height:41px; v-text-anchor:middle; width:192px" arcsize="15%" stroke="f" fillcolor="#3579d0">
                                                                                                                                        <w:anchorlock></w:anchorlock>
                                                                                                                                        <center style='color:#ffffff; font-family:arial, "helvetica neue", helvetica, sans-serif; font-size:15px; font-weight:400; line-height:15px; mso-text-raise:1px'>Activate Account</center>
                                                                                                                                    </v:roundrect>
                                                                                                                                </a>
                                                                                                                                <![endif]-->
                                                <!--[if !mso]>
                                                                                                                                <!-- -->
                                                <span class="msohide es-button-border" style="border-style:solid;border-color:#2cb543;background:#3579d0;border-width:0px;display:inline-block;border-radius:6px;width:auto;mso-hide:all">
                                                  <a href="${resetLink}" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;display:inline-block;background:#3579d0;border-radius:6px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center;padding:10px 20px 10px 20px;mso-padding-alt:0;mso-border-alt:10px solid #31CB4B">Reset Password</a>
                                                </span>
                                                <!--
                                                                                                                    
                                                                                                                                <![endif]-->
                                              </td>
                                            </tr>
                                            <tr>
                                              <td align="center" style="padding:10px;Margin:0">
                                                <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:23px;color:#333333;font-size:15px">If the button isn’t clickable, you can copy and paste this link into your browser: <br>${resetLink} </p>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td align="center" style="padding:20px;Margin:0;font-size:0">
                                                <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                  <tr>
                                                    <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:unset;height:1px;width:100%;margin:0px"></td>
                                                  </tr>
                                                </table>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                                          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                            <tr>
                                              <td align="center" style="padding:0;Margin:0">
                                                <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;color:#333333;font-size:16px">Best Regards, <br>Mecha Software Team </p>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
              </body>
            </html>`
        };

        await transporter.sendMail(message);
    }

    return new NewUserReturn(true, 200, "Password Reset Link Sent");
}

export async function AuthenticateUser(userNameEmail: string, password: string, isEmail: string) {
    await mongooseInit();

    if (isEmail === "true") {
        const dbUserEmail = await Accounts.findOne({
            UserEmail: userNameEmail
        });
    
        if (dbUserEmail) {
            const decryptedPassword = Buffer.from(password, 'base64').toString('binary');

            const result = await bcrypt.compare(decryptedPassword, dbUserEmail.UserPassword).then((result) => {
                if (result) {
                    if (dbUserEmail.UserEmailVerified == true) {
                        return new NewUserReturn(true, 200, "Logged In", JSON.stringify({ userId: dbUserEmail.UserId, userEmail: dbUserEmail.UserEmail, userName: dbUserEmail.UserName, accessToken: dbUserEmail.UserAccessToken }));
                    } else {
                        return new NewUserReturn(false, 401, "Account not verified");
                    }
                } else {
                    return new NewUserReturn(false, 404, "Email or Password is invalid");
                }
            });

            return result;
        } else {
            return new NewUserReturn(false, 404, "Email or Password is invalid");
        }
    } else {
        const dbUserName = await Accounts.findOne({
            UserName: userNameEmail
        });
    
        if (dbUserName) {
            const decryptedPassword = Buffer.from(password, 'base64').toString('binary');

            const result = await bcrypt.compare(decryptedPassword, dbUserName.UserPassword).then((result) => {
                if (result) {
                    if (dbUserName.UserEmailVerified == true) {
                        return new NewUserReturn(true, 200, "Logged In", JSON.stringify({ userId: dbUserName.UserId, userEmail: dbUserName.UserEmail, userName: dbUserName.UserName, accessToken: dbUserName.UserAccessToken }));
                    } else {
                        return new NewUserReturn(false, 401, "Account not verified");
                    }
                } else {
                    return new NewUserReturn(false, 404, "Username or Password is invalid");
                }
            });

            return result;
        } else {
            return new NewUserReturn(false, 404, "Username or Password is invalid");
        }
    }
}

// -------------------------------------------------------------- //
async function GenerateUserId() {
    const identifier = Snowflake.generate({
        timestamp: new Date().getTime(),
        shard_id: 10
    });

    const dbUserId = await Accounts.findOne({
        UserId: identifier
    });

    if (dbUserId) {
        GenerateUserId();
    } else {
        return identifier;
    }
}