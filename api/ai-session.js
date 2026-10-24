module.exports=async function handler(req,res){return (await import('../ai-session-handler.mjs')).default(req,res);};
module.exports.createHandler=async options=>(await import('../ai-session-handler.mjs')).createHandler(options);
