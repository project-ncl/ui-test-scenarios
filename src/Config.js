import dotenv from "dotenv";

dotenv.config();

const config = Object.freeze(Object.assign({}, process.env));

export default config;