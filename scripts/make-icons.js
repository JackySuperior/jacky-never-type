/**
 * 從 resources/app-icon.png 產生 Mac 用的 resources/app-icon.icns
 * 使用方式：node scripts/make-icons.js
 * 需要先安裝：npm install --save-dev png2icons
 */

const png2icons = require('png2icons');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../resources/app-icon.png');
const outputPath = path.join(__dirname, '../resources/app-icon.icns');

if (!fs.existsSync(inputPath)) {
  console.error('❌ 找不到 resources/app-icon.png');
  process.exit(1);
}

console.log('🔄 正在產生 .icns...');
const input = fs.readFileSync(inputPath);
const icns = png2icons.createICNS(input, png2icons.BILINEAR, 0);

if (!icns) {
  console.error('❌ 產生 .icns 失敗');
  process.exit(1);
}

fs.writeFileSync(outputPath, icns);
console.log(`✅ 已產生：${outputPath}`);
