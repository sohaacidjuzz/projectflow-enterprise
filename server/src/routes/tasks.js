const router=require('express').Router();
const prisma=require('../prisma');
const {auth}=require('../middleware/auth');
const {canAccessProject}=require('../services/access');
const {notify}=require('../services/notify');
router.use(auth);

router.get('/project/:projectId',async(req,res,next)=>{
  try{
    if(!(await canAccessProject(req.user,req.params.projectId))) return res.status(403).json({message:'Forbidden'});
    res.json(await prisma.task.findMany({
      where:{projectId:Number(req.params.projectId)},
      orderBy:[{status:'asc'},{position:'asc'},{createdAt:'asc'}],
      include:{
        assignee:{select:{id:true,name:true,email:true}},
        creator:{select:{id:true,name:true}},
        _count:{select:{comments:true,attachments:true}}
      }
    }));
  }catch(e){next(e)}
});

router.post('/project/:projectId',async(req,res,next)=>{
  try{
    if(!(await canAccessProject(req.user,req.params.projectId))) return res.status(403).json({message:'Forbidden'});
    if(req.user.role==='DEVELOPER') return res.status(403).json({message:'Only Admin/Manager can create tasks'});
    const {title,description,status='TODO',priority='MEDIUM',dueDate,assigneeId}=req.body;
    const task=await prisma.task.create({data:{
      projectId:Number(req.params.projectId),title,description,status,priority,
      dueDate:dueDate?new Date(dueDate):null,
      assigneeId:assigneeId?Number(assigneeId):null,creatorId:req.user.id
    }});
    if(task.assigneeId) await notify(task.assigneeId,`Task assigned: ${task.title}`);
    res.status(201).json(task);
  }catch(e){next(e)}
});

router.patch('/:id',async(req,res,next)=>{
  try{
    const existing=await prisma.task.findUnique({where:{id:Number(req.params.id)}});
    if(!existing) return res.status(404).json({message:'Task not found'});
    if(!(await canAccessProject(req.user,existing.projectId))) return res.status(403).json({message:'Forbidden'});
    if(req.user.role==='DEVELOPER'){
      const allowed=['status','position'];
      if(Object.keys(req.body).some(k=>!allowed.includes(k))) return res.status(403).json({message:'Developers can update task status/order only'});
    }
    const {title,description,status,priority,position,dueDate,assigneeId}=req.body;
    const task=await prisma.task.update({where:{id:existing.id},data:{
      ...(title!==undefined&&{title}),...(description!==undefined&&{description}),
      ...(status!==undefined&&{status}),...(priority!==undefined&&{priority}),
      ...(position!==undefined&&{position:Number(position)}),
      ...(dueDate!==undefined&&{dueDate:dueDate?new Date(dueDate):null}),
      ...(assigneeId!==undefined&&{assigneeId:assigneeId?Number(assigneeId):null})
    }});
    if(assigneeId&&Number(assigneeId)!==existing.assigneeId) await notify(Number(assigneeId),`Task assigned: ${task.title}`);
    res.json(task);
  }catch(e){next(e)}
});

router.post('/reorder',async(req,res,next)=>{
  try{
    const {projectId,changes}=req.body;
    if(!(await canAccessProject(req.user,projectId))) return res.status(403).json({message:'Forbidden'});
    await prisma.$transaction(changes.map(c=>prisma.task.update({
      where:{id:Number(c.id)},data:{status:c.status,position:Number(c.position)}
    })));
    res.json({ok:true});
  }catch(e){next(e)}
});

router.delete('/:id',async(req,res,next)=>{
  try{
    if(req.user.role==='DEVELOPER') return res.status(403).json({message:'Forbidden'});
    const t=await prisma.task.findUnique({where:{id:Number(req.params.id)}});
    if(!t) return res.status(404).json({message:'Task not found'});
    if(!(await canAccessProject(req.user,t.projectId))) return res.status(403).json({message:'Forbidden'});
    await prisma.task.delete({where:{id:t.id}});
    res.status(204).end();
  }catch(e){next(e)}
});
module.exports=router;
