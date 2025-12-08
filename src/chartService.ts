import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const VCHART_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VChart</title>
  <style>
    html,body{margin:0;padding:0;}
  </style>
  <script src="https://unpkg.com/@visactor/vchart/build/index.min.js"></script>
</head>
<body>
  <div id="chart"></div>
  <script>
    VChart.registerVennChart();
    VChart.registerLiquidChart();
    const dom = document.getElementById('chart');
    dom.style.width = '$[WIDTH]';
    dom.style.height = '$[HEIGHT]';
    const spec = $[SPEC];
    const chart = new VChart.default(spec, { dom, animation: false });
    chart.renderSync();
    window.__pg_suspend_resume__ && window.__pg_suspend_resume__('unic_suspend_wait')
  </script>
</body>
</html>`;
import { ExportType, ChartOption, ExportResult } from './types';

export class ChartService {
  private outputDir: string;
  private baseUrl: string;

  constructor(outputDir: string = './output', baseUrl: string = 'http://localhost:3000') {
    this.outputDir = outputDir;
    this.baseUrl = baseUrl;
    this.ensureOutputDir();
  }

  private ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async exportChart(spec: any, type: ExportType = 'image', option?: ChartOption): Promise<ExportResult> {
    const width = option?.width || '800px';
    const height = option?.height || '600px';

    // 生成HTML内容
    const htmlContent = VCHART_TEMPLATE
      .replace('$[WIDTH]', width)
      .replace('$[HEIGHT]', height)
      .replace('$[SPEC]', JSON.stringify(spec));

    const fileId = uuidv4();

    if (type === 'html') {
      return this.saveHtml(htmlContent, fileId);
    } else {
      return this.saveImage(htmlContent, fileId, width, height);
    }
  }

  private async saveHtml(htmlContent: string, fileId: string): Promise<ExportResult> {
    const fileName = `${fileId}.html`;
    const filePath = path.join(this.outputDir, fileName);

    fs.writeFileSync(filePath, htmlContent);

    return {
      htmlUrl: `${this.baseUrl}/output/${fileName}`,
    };
  }

  private async saveImage(htmlContent: string, fileId: string, width: string, height: string): Promise<ExportResult> {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();

      // 设置视口尺寸
      const viewportWidth = parseInt(width.replace('px', ''));
      const viewportHeight = parseInt(height.replace('px', ''));
      await page.setViewport({ width: viewportWidth, height: viewportHeight });

      // 加载HTML内容
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // 等待图表渲染完成
      await page.waitForTimeout(2000);

      // 截图
      const fileName = `${fileId}.png`;
      const filePath = path.join(this.outputDir, fileName);

      await page.screenshot({
        path: filePath,
        clip: {
          x: 0,
          y: 0,
          width: viewportWidth,
          height: viewportHeight
        }
      });

      return {
        imageUrl: `${this.baseUrl}/output/${fileName}`,
      };
    } finally {
      await browser.close();
    }
  }
}