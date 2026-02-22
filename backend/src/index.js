require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { migrate } = require('./db/migrate');
const { seed } = require('./db/seed');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const inquiryRoutes = require('./routes/inquiries');
const { router: remarkRoutes, deleteRemark } = require('./routes/remarks');
const dashboardRoutes = require('./routes/dashboard');
const consolidationRoutes = require('./routes/consolidation');
const importRoutes = require('./routes/import');
const userRoutes = require('./routes/users');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/inquiries/:id/remarks', remarkRoutes);
app.delete('/api/v1/remarks/:remarkId', authenticate, deleteRemark);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/consolidation-opportunities', consolidationRoutes);
app.use('/api/v1/import', importRoutes);
app.use('/api/v1/users', userRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

async function start() {
  try {
    await migrate();
    await seed();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`LogiSense IMS Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
