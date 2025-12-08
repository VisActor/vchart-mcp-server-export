import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import path from 'path';
import router from './routes';

const app = new Koa();
const PORT = process.env.PORT || 3000;

// 创建输出目录
const outputDir = path.join(__dirname, '../output');
if (!require('fs').existsSync(outputDir)) {
  require('fs').mkdirSync(outputDir, { recursive: true });
}

// 中间件
app.use(bodyParser({
  jsonLimit: '10mb'
}));

// 静态文件服务
app.use(serve(outputDir, {
  index: false,
  hidden: false,
  defer: false
}));

// 路由
app.use(router.routes());
app.use(router.allowedMethods());

// 错误处理
app.on('error', (err, ctx) => {
  console.error('Server error:', err);
});

app.listen(PORT, () => {
  console.log(`VChart MCP Server Export is running on http://localhost:${PORT}`);
  console.log(`Export endpoint: POST http://localhost:${PORT}/export`);
  console.log(`Output directory: ${outputDir}`);
});