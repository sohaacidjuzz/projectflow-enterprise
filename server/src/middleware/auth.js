const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'dev-only-change-me';

function auth(req,res,next){
  const h=req.headers.authorization||'';
  const token=h.startsWith('Bearer ')?h.slice(7):null;
  if(!token) return res.status(401).json({message:'Authentication required'});
  try{ req.user=jwt.verify(token,secret); next(); }
  catch{ return res.status(401).json({message:'Invalid or expired token'}); }
}
function allow(...roles){
  return (req,res,next)=> roles.includes(req.user.role) ? next() : res.status(403).json({message:'Forbidden'});
}
module.exports={auth,allow,secret};
