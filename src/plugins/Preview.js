import EventEmitter from '../utils/EventEmitter';

/**
 * 预览插件
 * 用于实时预览编辑器内容
 */
class Preview extends EventEmitter {
    constructor() {
        super();
        this.editor = null;
        this.previewContainer = null;
        this.previewCanvas = null;
        this.scale = 1;
        this.enabled = true;
    }

    /**
     * 初始化插件
     * @param {Editor} editor - 编辑器实例
     */
    init(editor) {
        this.editor = editor;
        this._createPreviewContainer();
        this._bindEvents();
    }

    /**
     * 创建预览容器
     * @private
     */
    _createPreviewContainer() {
        // 创建预览容器
        this.previewContainer = document.createElement('div');
        this.previewContainer.className = 'preview-container';
        this.previewContainer.style.display = 'none';

        // 创建预览画布
        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.className = 'preview-canvas';
        this.previewContainer.appendChild(this.previewCanvas);

        // 创建预览控制栏
        const controls = document.createElement('div');
        controls.className = 'preview-controls';
        
        // 缩放控制
        const scaleControl = document.createElement('div');
        scaleControl.className = 'preview-scale';
        scaleControl.innerHTML = `
            <button class="preview-scale-btn" data-action="zoom-out">-</button>
            <span class="preview-scale-text">100%</span>
            <button class="preview-scale-btn" data-action="zoom-in">+</button>
        `;
        controls.appendChild(scaleControl);

        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.className = 'preview-close';
        closeBtn.innerHTML = '×';
        controls.appendChild(closeBtn);

        this.previewContainer.appendChild(controls);
        document.body.appendChild(this.previewContainer);

        // 绑定控制事件
        this._bindControlEvents(controls);
    }

    /**
     * 绑定控制事件
     * @private
     * @param {HTMLElement} controls - 控制栏元素
     */
    _bindControlEvents(controls) {
        // 缩放按钮事件
        controls.querySelectorAll('.preview-scale-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'zoom-in') {
                    this._zoomIn();
                } else if (action === 'zoom-out') {
                    this._zoomOut();
                }
            });
        });

        // 关闭按钮事件
        controls.querySelector('.preview-close').addEventListener('click', () => {
            this.hide();
        });
    }

    /**
     * 绑定事件
     * @private
     */
    _bindEvents() {
        // 监听画布变化
        this.editor.canvas.on('object:modified', () => this._updatePreview());
        this.editor.canvas.on('object:added', () => this._updatePreview());
        this.editor.canvas.on('object:removed', () => this._updatePreview());
        this.editor.canvas.on('object:moving', () => this._updatePreview());
        this.editor.canvas.on('object:scaling', () => this._updatePreview());
        this.editor.canvas.on('object:rotating', () => this._updatePreview());
    }

    /**
     * 更新预览
     * @private
     */
    _updatePreview() {
        if (!this.enabled || !this.previewContainer.style.display === 'block') return;

        const canvas = this.editor.canvas;
        const previewCtx = this.previewCanvas.getContext('2d');

        // 设置预览画布尺寸
        this.previewCanvas.width = canvas.width * this.scale;
        this.previewCanvas.height = canvas.height * this.scale;

        // 清空预览画布
        previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

        // 设置缩放
        previewCtx.scale(this.scale, this.scale);

        // 绘制画布内容
        previewCtx.drawImage(canvas.lowerCanvasEl, 0, 0);
    }

    /**
     * 放大预览
     * @private
     */
    _zoomIn() {
        if (this.scale < 2) {
            this.scale += 0.1;
            this._updateScaleText();
            this._updatePreview();
        }
    }

    /**
     * 缩小预览
     * @private
     */
    _zoomOut() {
        if (this.scale > 0.2) {
            this.scale -= 0.1;
            this._updateScaleText();
            this._updatePreview();
        }
    }

    /**
     * 更新缩放文本
     * @private
     */
    _updateScaleText() {
        const scaleText = this.previewContainer.querySelector('.preview-scale-text');
        scaleText.textContent = `${Math.round(this.scale * 100)}%`;
    }

    /**
     * 显示预览
     */
    show() {
        this.previewContainer.style.display = 'block';
        this._updatePreview();
        this.emit('show');
    }

    /**
     * 隐藏预览
     */
    hide() {
        this.previewContainer.style.display = 'none';
        this.emit('hide');
    }

    /**
     * 启用预览
     */
    enable() {
        this.enabled = true;
    }

    /**
     * 禁用预览
     */
    disable() {
        this.enabled = false;
    }

    /**
     * 销毁插件
     */
    destroy() {
        this.hide();
        document.body.removeChild(this.previewContainer);
        this.removeAllListeners();
    }
}

export default Preview; 