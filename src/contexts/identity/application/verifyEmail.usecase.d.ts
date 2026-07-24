import type { EmailVerificationTokenRepository } from "../domain/ports/EmailVerificationTokenRepository.js";
export declare function makeVerifyEmail(deps: {
    emailVerificationTokens: EmailVerificationTokenRepository;
}): (rawToken: string) => Promise<{
    verified: boolean;
}>;
//# sourceMappingURL=verifyEmail.usecase.d.ts.map