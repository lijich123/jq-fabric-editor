# jQuery Fabric Editor

一个基于 jQuery + Fabric.js 的高级图形编辑器，采用插件化架构，使用 Layui 实现界面布局。

## 特性

- 插件化架构，易于扩展
- 支持导入/导出多种格式（JSON/PSD/PNG/SVG）
- 完整的图层管理
- 丰富的图形编辑功能
- 快捷键支持
- 右键菜单
- 辅助线和标尺
- 自定义模板和素材库
- 国际化支持

## 安装

```bash
npm install jq-fabric-editor
```

## 快速开始

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="path/to/layui.css">
    <link rel="stylesheet" href="path/to/jq-fabric-editor.css">
</head>
<body>
    <div id="editor"></div>
    
    <script src="path/to/jquery.min.js"></script>
    <script src="path/to/fabric.min.js"></script>
    <script src="path/to/layui.js"></script>
    <script src="path/to/jq-fabric-editor.js"></script>
    <script>
        $(function() {
            $('#editor').fabricEditor({
                // 配置选项
            });
        });
    </script>
</body>
</html>
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 插件开发

插件开发文档请参考 [插件开发指南](./docs/plugin-guide.md)

## 许可证

MIT 