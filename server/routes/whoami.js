import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  const token = res.locals.token;
  const roles = token?.roles || [];

  const isInstructor = roles.some(role =>
    role.includes('Instructor')
  );

  const isLearner = roles.some(role =>
    role.includes('Learner')
  );

  res.json({
    user: token?.user,
    role: isInstructor ? 'instructor' : isLearner ? 'learner' : 'unknown'
  });
});

export default router;
