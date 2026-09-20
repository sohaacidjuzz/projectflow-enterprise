const express=require('express');
const cors=require('cors');
const path=require('path');
const fs=require('fs');

const app=express();
app.use(cors());
app.use(express.json({limit:'2mb'}));

app.get('/api/health',(req,res)=>res.json({ok:true,service:'projectflow-enterprise-api'}));
app.use('/api/auth',require('./routes/auth'));
app.use('/api/users',require('./routes/users'));
app.use('/api/projects',require('./routes/projects'));
app.use('/api/tasks',require('./routes/tasks'));
app.use('/api/comments',require('./routes/comments'));
app.use('/api/attachments',require('./routes/attachments'));
app.use('/api/notifications',require('./routes/notifications'));

app.use((err,req,res,next)=>{
  console.error(err);
  if(err.code==='LIMIT_FILE_SIZE') return res.status(413).json({message:'File too large'});
  res.status(500).json({message:'Internal server error'});
});

const publicDir=path.join(__dirname,'..','public');
if(fs.existsSync(publicDir)){
  app.use(express.static(publicDir));
  app.get('*',(req,res)=>res.sendFile(path.join(publicDir,'index.html')));
}
const port=Number(process.env.PORT||3000);
app.listen(port,()=>console.log(`ProjectFlow Enterprise listening on ${port}`));
