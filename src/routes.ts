import Router from 'koa-router';
import { ChartService } from './chartService';
import { IBody } from './types';

const router = new Router();
const chartService = new ChartService();

router.post('/export', async (ctx) => {
  try {
    const body = ctx.request.body as IBody;

    if (!body.spec) {
      ctx.status = 400;
      ctx.body = { error: 'spec is required' };
      return;
    }

    const result = await chartService.exportChart(
      body.spec,
      body.type,
      body.option
    );

    ctx.body = {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Export error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
});

// 提供静态文件访问
router.get('/output/:filename', async (ctx) => {
  const filename = ctx.params.filename;
  const filePath = require('path').join('./output', filename);

  if (require('fs').existsSync(filePath)) {
    ctx.type = filename.endsWith('.html') ? 'text/html' : 'image/png';
    ctx.body = require('fs').createReadStream(filePath);
  } else {
    ctx.status = 404;
    ctx.body = { error: 'File not found' };
  }
});

export default router;