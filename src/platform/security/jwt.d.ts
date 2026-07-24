import "dotenv/config";
export interface JwtPayload {
    userId: number;
    isOwner: boolean;
}
export declare function signAccessToken(payload: JwtPayload): string;
export declare function verifyAccessToken(token: string): JwtPayload;
//# sourceMappingURL=jwt.d.ts.map