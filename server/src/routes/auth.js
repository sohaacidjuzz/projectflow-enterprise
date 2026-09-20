const router=require('express').Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const prisma=require('../prisma');
const {secret,auth}=require('../middleware/auth');

router.post('/register',async(req,res,next)=>{
  try{
    const {name,email,password}=req.body;
    if(!name||!email||!password||password.length<8)
      return res.status(400).json({message:'Name, email and password (8+ chars) are required'});
    const exists=await prisma.user.findUnique({where:{email:email.toLowerCase().trim()}});
    if(exists) return res.status(409).json({message:'Email already registered'});
    const user=await prisma.user.create({data:{
      name:name.trim(),email:email.toLowerCase().trim(),
      passwordHash:await bcrypt.hash(password,12),role:'DEVELOPER'
    },select:{id:true,name:true,email:true,role:true}});
    const token=jwt.sign(user,secret,{expiresIn:'8h'});
    res.status(201).json({token,user});
  }catch(e){next(e)}
});

router.post('/login',async(req,res,next)=>{
  try{
    const user=await prisma.user.findUnique({where:{email:(req.body.email||'').toLowerCase().trim()}});
    if(!user||!(await bcrypt.compare(req.body.password||'',user.passwordHash)))
      return res.status(401).json({message:'Invalid email or password'});
    const safe={id:user.id,name:user.name,email:user.email,role:user.role};
    res.json({token:jwt.sign(safe,secret,{expiresIn:'8h'}),user:safe});
  }catch(e){next(e)}
});

router.get('/me',auth,(req,res)=>res.json(req.user));
module.exports=router;
