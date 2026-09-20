const prisma = require('../prisma');

async function canAccessProject(user, projectId) {
  if (user.role === 'ADMIN') return true;
  const id = Number(projectId);
  const project = await prisma.project.findFirst({
    where: {
      id,
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }]
    },
    select: { id: true }
  });
  return !!project;
}

module.exports = { canAccessProject };
