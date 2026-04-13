import { prismaAdapter } from "better-auth/adapters/prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { prisma } from "./prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
import { envVars } from "../config/env";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,

      mapProfileToUser: () => {
        return {
          role: Role.PATIENT,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null,
        }
      }
    }
  },
  emailVerification: {
    sendOnSignIn: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === 'email-verification') {
          const user = await prisma.user.findUnique({
            where: {
              email,
            }
          });
          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your Email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              }
            })
          }
        } else if (type === 'forget-password') {
          const user = await prisma.user.findUnique({
            where: {
              email,
            }
          });
          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              }
            })
          }
        }
      },
      expiresIn: 2 * 60,
      otpLength: 6,
    }),
  ],

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.PATIENT
      },

      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },

      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },

      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      },

      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      },
    }
  },



  session: {
    expiresIn: 60 * 60 * 60 * 24, // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24, // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1 day in seconds
    }
  },

  advanced: {
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        }
      }

    }
  },

  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/login/google/success`,
  },
  trustedOrigins: [envVars.BETTER_AUTH_URL || "http://localhost:5000", envVars.FRONTEND_URL],

});