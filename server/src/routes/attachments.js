const router=require('express').Router();
const path=require('path');
const fs=require('fs');
const crypto=require('crypto');
const multer=require('multer');
const prisma=require('../prisma');
const {auth}=require('../middleware/auth');
const {canAccessProject}=require('../services/access');

const uploadDir=path.resolve(process.env.UPLOAD_DIR||path.join(__dirname,'..','..','uploads'));
fs.mkdirSync(uploadDir,{recursive:true});
const storage=multer.diskStorage({
  destination:(_,__,cb)=>cb(null,uploadDir),
  filename:(_,file,cb)=>cb(null,`${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`)
});
const max=Number(process.env.MAX_UPLOAD_MB||10)*1024*1024;
const upload=multer({storage,limits:{fileSize:max}});
router.use(auth);

router.post('/task/:taskId',upload.single('file'),async(req,res,next)=>{
  try{
    const task=await prisma.task.findUnique({where:{id:Number(req.params.taskId)}});
    if(!task) return res.status(404).json({message:'Task not found'});
    if(!(await canAccessProject(req.user,task.projectId))) return res.status(403).json({message:'Forbidden'});
    if(!req.file) return res.status(400).json({message:'File required'});
    const a=await prisma.attachment.create({data:{
      taskId:task.id,uploadedById:req.user.id,originalName:req.file.originalname,
      storedName:req.file.filename,mimeType:req.file.mimetype,size:req.file.size
    }});
    res.status(201).json(a);
  }catch(e){next(e)}
});

router.get('/:id/download',async(req,res,next)=>{
  try{
    const a=await prisma.attachment.findUnique({where:{id:Number(req.params.id)},include:{task:true}});
    if(!a) return res.status(404).json({message:'Attachment not found'});
    if(!(await canAccessProject(req.user,a.task.projectId))) return res.status(403).json({message:'Forbidden'});
    res.download(path.join(uploadDir,a.storedName),a.originalName);
  }catch(e){next(e)}
});
module.exports=router;
