const router=require('express').Router();
const prisma=require('../prisma');
const {auth,allow}=require('../middleware/auth');
const {canAccessProject}=require('../services/access');
const {notify}=require('../services/notify');
router.use(auth);

router.get('/',async(req,res,next)=>{
  try{
    const where=req.user.role==='ADMIN'?{}:{
      OR:[{ownerId:req.user.id},{members:{some:{userId:req.user.id}}}]
    };
    const projects=await prisma.project.findMany({
      where,orderBy:{updatedAt:'desc'},
      include:{
        owner:{select:{id:true,name:true,email:true}},
        members:{include:{user:{select:{id:true,name:true,email:true,role:true}}}},
        _count:{select:{tasks:true}}
      }
    });
    res.json(projects);
  }catch(e){next(e)}
});

router.post('/',allow('ADMIN','MANAGER'),async(req,res,next)=>{
  try{
    const {name,description,status='PLANNING',dueDate}=req.body;
    if(!name) return res.status(400).json({message:'Project name required'});
    const p=await prisma.project.create({data:{
      name,description,status,dueDate:dueDate?new Date(dueDate):null,ownerId:req.user.id,
      members:{create:{userId:req.user.id}}
    }});
    res.status(201).json(p);
  }catch(e){next(e)}
});

router.patch('/:id',allow('ADMIN','MANAGER'),async(req,res,next)=>{
  try{
    if(!(await canAccessProject(req.user,req.params.id))) return res.status(403).json({message:'Forbidden'});
    const {name,description,status,dueDate}=req.body;
    const p=await prisma.project.update({where:{id:Number(req.params.id)},data:{
      ...(name!==undefined&&{name}),...(description!==undefined&&{description}),
      ...(status!==undefined&&{status}),...(dueDate!==undefined&&{dueDate:dueDate?new Date(dueDate):null})
    }});
    res.json(p);
  }catch(e){next(e)}
});

router.delete('/:id',allow('ADMIN','MANAGER'),async(req,res,next)=>{
  try{
    if(!(await canAccessProject(req.user,req.params.id))) return res.status(403).json({message:'Forbidden'});
    await prisma.project.delete({where:{id:Number(req.params.id)}});
    res.status(204).end();
  }catch(e){next(e)}
});

router.get('/:id',async(req,res,next)=>{
  try{
    if(!(await canAccessProject(req.user,req.params.id))) return res.status(403).json({message:'Forbidden'});
    const p=await prisma.project.findUnique({where:{id:Number(req.params.id)},include:{
      owner:{select:{id:true,name:true,email:true,role:true}},
      members:{include:{user:{select:{id:true,name:true,email:true,role:true}}}}
    }});
    if(!p) return res.status(404).json({message:'Project not found'});
    res.json(p);
  }catch(e){next(e)}
});

router.post('/:id/members',allow('ADMIN','MANAGER'),async(req,res,next)=>{
  try{
    if(!(await canAccessProject(req.user,req.params.id))) return res.status(403).json({message:'Forbidden'});
    const userId=Number(req.body.userId);
    const member=await prisma.projectMember.upsert({
      where:{projectId_userId:{projectId:Number(req.params.id),userId}},
      update:{},create:{projectId:Number(req.params.id),userId}
    });
    await notify(userId,'You were added to a ProjectFlow project.');
    res.status(201).json(member);
  }catch(e){next(e)}
});

router.delete('/:id/members/:userId',allow('ADMIN','MANAGER'),async(req,res,next)=>{
  try{
    if(!(await canAccessProject(req.user,req.params.id))) return res.status(403).json({message:'Forbidden'});
    await prisma.projectMember.deleteMany({where:{projectId:Number(req.params.id),userId:Number(req.params.userId)}});
    res.status(204).end();
  }catch(e){next(e)}
});

router.get('/:id/analytics',async(req,res,next)=>{
  try{
    if(!(await canAccessProject(req.user,req.params.id))) return res.status(403).json({message:'Forbidden'});
    const projectId=Number(req.params.id);
    const tasks=await prisma.task.findMany({where:{projectId},select:{status:true,priority:true,dueDate:true}});
    const now=new Date();
    const byStatus=Object.fromEntries(['TODO','IN_PROGRESS','REVIEW','DONE'].map(s=>[s,tasks.filter(t=>t.status===s).length]));
    const byPriority=Object.fromEntries(['LOW','MEDIUM','HIGH','CRITICAL'].map(s=>[s,tasks.filter(t=>t.priority===s).length]));
    const overdue=tasks.filter(t=>t.dueDate&&t.dueDate<now&&t.status!=='DONE').length;
    const completion=tasks.length?Math.round((byStatus.DONE/tasks.length)*100):0;
    res.json({total:tasks.length,byStatus,byPriority,overdue,completion});
  }catch(e){next(e)}
});

module.exports=router;
