import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;

const accessTokenExpiry = "1m";
const refreshTokenExpiry = "7d";

export interface UserTokenPayload {
  id: string;
  email: string;
  role: string;
}

export const createAccessToken = (payload: UserTokenPayload) => {
  return jwt.sign(payload, accessTokenSecret, { expiresIn: accessTokenExpiry });
};

export const createRefreshToken = (payload: UserTokenPayload) => {
  return jwt.sign(payload, refreshTokenSecret, {
    expiresIn: refreshTokenExpiry,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, accessTokenSecret) as UserTokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, refreshTokenSecret) as UserTokenPayload;
};
