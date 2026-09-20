const router=require('express').Router();
const prisma=require('../prisma');
const {auth}=require('../middleware/auth');
const {canAccessProject}=require('../services/access');
const {notify}=require('../services/notify');
router.use(auth);

router.get('/task/:taskId',async(req,res,next)=>{
  try{
    const task=await prisma.task.findUnique({where:{id:Number(req.params.taskId)}});
    if(!task) return res.status(404).json({message:'Task not found'});
    if(!(await canAccessProject(req.user,task.projectId))) return res.status(403).json({message:'Forbidden'});
    res.json(await prisma.comment.findMany({where:{taskId:task.id},orderBy:{createdAt:'asc'},
      include:{user:{select:{id:true,name:true,role:true}}}}));
  }catch(e){next(e)}
});

router.post('/task/:taskId',async(req,res,next)=>{
  try{
    const task=await prisma.task.findUnique({where:{id:Number(req.params.taskId)}});
    if(!task) return res.status(404).json({message:'Task not found'});
    if(!(await canAccessProject(req.user,task.projectId))) return res.status(403).json({message:'Forbidden'});
    if(!req.body.body?.trim()) return res.status(400).json({message:'Comment required'});
    const c=await prisma.comment.create({data:{taskId:task.id,userId:req.user.id,body:req.body.body.trim()},
      include:{user:{select:{id:true,name:true,role:true}}}});
    if(task.assigneeId&&task.assigneeId!==req.user.id) await notify(task.assigneeId,`New comment on task: ${task.title}`);
    res.status(201).json(c);
  }catch(e){next(e)}
});
module.exports=router;
