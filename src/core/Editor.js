/**
 * 编辑器核心类
 * 负责初始化画布、管理插件、处理事件等核心功能
 */
class Editor {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.container - 容器选择器
     * @param {number} options.width - 画布宽度
     * @param {number} options.height - 画布高度
     */
    constructor(options = {}) {
        this.options = Object.assign({
            container: '#editor',
            width: 800,
            height: 600
        }, options);

        // 初始化属性
        this.canvas = null;
        this.plugins = new Map();
        this.history = [];
        this.historyIndex = -1;
        
        // 初始化编辑器
        this._init();
    }

    /**
     * 初始化编辑器
     * @private
     */
    _init() {
        // 初始化画布
        this.canvas = new fabric.Canvas('canvas', {
            width: this.options.width,
            height: this.options.height,
            selection: true,
            preserveObjectStacking: true
        });

        // 绑定事件
        this._bindEvents();
    }

    /**
     * 绑定画布事件
     * @private
     */
    _bindEvents() {
        // 对象选择事件
        this.canvas.on('selection:created', (e) => this._onObjectSelected(e));
        this.canvas.on('selection:updated', (e) => this._onObjectSelected(e));
        this.canvas.on('selection:cleared', () => this._onSelectionCleared());

        // 对象修改事件
        this.canvas.on('object:modified', (e) => this._onObjectModified(e));
        this.canvas.on('object:moving', (e) => this._onObjectMoving(e));
        this.canvas.on('object:scaling', (e) => this._onObjectScaling(e));
        this.canvas.on('object:rotating', (e) => this._onObjectRotating(e));
    }

    /**
     * 对象选择事件处理
     * @private
     * @param {Object} e - 事件对象
     */
    _onObjectSelected(e) {
        const selected = this.canvas.getActiveObject();
        if (selected) {
            // 触发插件选择事件
            this._triggerPluginEvent('object:selected', selected);
        }
    }

    /**
     * 清除选择事件处理
     * @private
     */
    _onSelectionCleared() {
        this._triggerPluginEvent('selection:cleared');
    }

    /**
     * 对象修改事件处理
     * @private
     * @param {Object} e - 事件对象
     */
    _onObjectModified(e) {
        this._addHistory();
        this._triggerPluginEvent('object:modified', e.target);
    }

    /**
     * 对象移动事件处理
     * @private
     * @param {Object} e - 事件对象
     */
    _onObjectMoving(e) {
        this._triggerPluginEvent('object:moving', e.target);
    }

    /**
     * 对象缩放事件处理
     * @private
     * @param {Object} e - 事件对象
     */
    _onObjectScaling(e) {
        this._triggerPluginEvent('object:scaling', e.target);
    }

    /**
     * 对象旋转事件处理
     * @private
     * @param {Object} e - 事件对象
     */
    _onObjectRotating(e) {
        this._triggerPluginEvent('object:rotating', e.target);
    }

    /**
     * 添加历史记录
     * @private
     */
    _addHistory() {
        const json = JSON.stringify(this.canvas.toJSON());
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(json);
        this.historyIndex = this.history.length - 1;
    }

    /**
     * 触发插件事件
     * @private
     * @param {string} eventName - 事件名称
     * @param {*} data - 事件数据
     */
    _triggerPluginEvent(eventName, data) {
        this.plugins.forEach(plugin => {
            if (typeof plugin[eventName] === 'function') {
                plugin[eventName](data);
            }
        });
    }

    /**
     * 注册插件
     * @param {string} name - 插件名称
     * @param {Object} plugin - 插件对象
     */
    registerPlugin(name, plugin) {
        if (this.plugins.has(name)) {
            console.warn(`Plugin ${name} already exists`);
            return;
        }
        this.plugins.set(name, plugin);
        plugin.init(this);
    }

    /**
     * 获取插件实例
     * @param {string} name - 插件名称
     * @returns {Object} 插件实例
     */
    getPlugin(name) {
        return this.plugins.get(name);
    }

    /**
     * 撤销操作
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.canvas.loadFromJSON(this.history[this.historyIndex]);
        }
    }

    /**
     * 重做操作
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.canvas.loadFromJSON(this.history[this.historyIndex]);
        }
    }

    /**
     * 导出画布为JSON
     * @returns {string} JSON字符串
     */
    toJSON() {
        return JSON.stringify(this.canvas.toJSON());
    }

    /**
     * 从JSON加载画布
     * @param {string} json - JSON字符串
     */
    fromJSON(json) {
        this.canvas.loadFromJSON(json);
        this._addHistory();
    }

    /**
     * 导出画布为图片
     * @param {Object} options - 导出选项
     * @returns {string} 图片数据URL
     */
    toImage(options = {}) {
        return this.canvas.toDataURL(options);
    }
}

// 导出编辑器类
export default Editor; 