import {createProxy} from './ai-proxy.mjs';
export function createHandler(options={}){return createProxy({...options,project:"sid-cos-lio-northstar-20261021",task:"cos.lio.gtm-experiment.v1"});}
export default async function handler(req,res){return createHandler()(req,res);}
