#!/usr/bin/env node

/**
 * 配置测试脚本
 * 用于验证环境变量配置是否正确
 */

require('dotenv').config({ path: '.env.local' });

console.log('===== 环境变量配置测试 =====\n');

// 测试单一模型配置
const singleModel = {
  AI_MODEL: process.env.AI_MODEL,
  CUSTOM_BASE_URL: process.env.CUSTOM_BASE_URL,
  CUSTOM_API_KEY: process.env.CUSTOM_API_KEY ? '***已设置***' : undefined
};

console.log('单一模型配置:');
console.log(JSON.stringify(singleModel, null, 2));
console.log('');

// 测试多模型配置
const multiModelsJson = process.env.AI_MODELS;
if (multiModelsJson) {
  console.log('多模型配置原始值:');
  console.log(multiModelsJson);
  console.log('');

  try {
    const models = JSON.parse(multiModelsJson);
    console.log('✅ 多模型配置 JSON 格式正确');
    console.log('模型数量:', models.length);
    console.log('');

    models.forEach((model, index) => {
      console.log(`模型 ${index + 1}:`);
      console.log('  ID:', model.id);
      console.log('  名称:', model.name);
      console.log('  Base URL:', model.baseURL);
      console.log('  API Key:', model.apiKey ? '***已设置***' : '未设置');

      // 检查特殊字符
      const hasSpecialChars = /[&<>"]/.test(model.baseURL + (model.apiKey || ''));
      if (hasSpecialChars) {
        console.log('  ⚠️  警告: 检测到特殊字符，可能导致 XML 解析错误');
      }
      console.log('');
    });
  } catch (error) {
    console.log('❌ 多模型配置 JSON 格式错误:', error.message);
    console.log('');
    console.log('请检查 AI_MODELS 环境变量的格式');
    console.log('正确格式示例:');
    console.log('AI_MODELS=\'[{"id":"gpt-4","name":"GPT-4","baseURL":"http://localhost:1234/v1","apiKey":"sk-xxx"}]\'');
  }
} else {
  console.log('未配置多模型 (AI_MODELS)');
  console.log('');
}

// 检查配置是否完整
console.log('===== 配置验证 =====\n');

if (multiModelsJson) {
  try {
    const models = JSON.parse(multiModelsJson);
    if (models.length > 0 && models.every(m => m.id && m.name && m.baseURL && m.apiKey)) {
      console.log('✅ 配置验证通过 (使用多模型配置)');
    } else {
      console.log('❌ 多模型配置不完整，请确保每个模型都有 id, name, baseURL, apiKey');
    }
  } catch (error) {
    console.log('❌ 多模型配置 JSON 格式错误');
  }
} else if (singleModel.AI_MODEL && singleModel.CUSTOM_BASE_URL && singleModel.CUSTOM_API_KEY) {
  console.log('✅ 配置验证通过 (使用单一模型配置)');
} else {
  console.log('❌ 配置不完整');
  console.log('请在 .env.local 文件中设置:');
  console.log('  - AI_MODEL');
  console.log('  - CUSTOM_BASE_URL');
  console.log('  - CUSTOM_API_KEY');
  console.log('或者设置:');
  console.log('  - AI_MODELS (JSON 格式)');
}

console.log('');
console.log('===== 测试完成 =====');
