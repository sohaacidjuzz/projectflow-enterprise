const router=require('express').Router();
const prisma=require('../prisma');
const {auth}=require('../middleware/auth');
router.use(auth);

router.get('/',async(req,res,next)=>{
  try{
    res.json(await prisma.notification.findMany({where:{userId:req.user.id},orderBy:{createdAt:'desc'},take:50}));
  }catch(e){next(e)}
});
router.patch('/:id/read',async(req,res,next)=>{
  try{
    await prisma.notification.updateMany({where:{id:Number(req.params.id),userId:req.user.id},data:{read:true}});
    res.json({ok:true});
  }catch(e){next(e)}
});
router.patch('/read-all',async(req,res,next)=>{
  try{
    await prisma.notification.updateMany({where:{userId:req.user.id,read:false},data:{read:true}});
    res.json({ok:true});
  }catch(e){next(e)}
});
module.exports=router;
