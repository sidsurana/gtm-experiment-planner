// CommonJS Vercel route; the provider-neutral proxy remains ESM.
module.exports=async function handler(req,res){return (await import('../ai-proxy-handler.mjs')).default(req,res);};
module.exports.createHandler=async options=>(await import('../ai-proxy-handler.mjs')).createHandler(options);
