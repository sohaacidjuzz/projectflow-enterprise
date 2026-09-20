const router=require('express').Router();
const prisma=require('../prisma');
const {auth,allow}=require('../middleware/auth');
router.use(auth);

router.get('/',allow('ADMIN','MANAGER'),async(req,res,next)=>{
  try{
    res.json(await prisma.user.findMany({
      select:{id:true,name:true,email:true,role:true,createdAt:true},orderBy:{name:'asc'}
    }));
  }catch(e){next(e)}
});

router.patch('/:id/role',allow('ADMIN'),async(req,res,next)=>{
  try{
    const roles=['ADMIN','MANAGER','DEVELOPER'];
    if(!roles.includes(req.body.role)) return res.status(400).json({message:'Invalid role'});
    const user=await prisma.user.update({where:{id:Number(req.params.id)},data:{role:req.body.role},
      select:{id:true,name:true,email:true,role:true}});
    res.json(user);
  }catch(e){next(e)}
});
module.exports=router;
