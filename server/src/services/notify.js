const prisma = require('../prisma');
async function notify(userId, message){
  if(!userId) return;
  await prisma.notification.create({data:{userId,message}});
}
module.exports={notify};
