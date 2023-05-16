let config = process.env ? process.env : import.meta.env;

if(config)
{
  console.log("Loading environment variables...");
  const NODE_ENV = config.NODE_ENV || config.VITE_NODE_ENV || undefined;

  if(process.env && import.meta.env) {
    console.warn("> [WARNING]: Mode is superimposed!");
  } else if(process.env) {
    console.log("> Mode: Node");
  } else if(import.meta.env) {
    console.log("> Mode: Vite");
  } else {
    console.warn("> [WARNING]: Mode is undefined!");
  }

  // Only import dotenv in non-production builds
  if (NODE_ENV) {
    if(NODE_ENV !== "production") {
      const dotenv = require('dotenv');
      dotenv.config();
      config = process.env;
    }
    console.log(`Loaded environment variables for environment: ${NODE_ENV}`);
  } else {
    console.warn("[WARNING]: Undefined environment! Variables may be unstable...");
  }  
} else {
  console.warn("[WARNING]: Failed to load environment variables!");
  config = [];
}

export default config;