/**
 * 图层管理插件
 * 提供图层显示/隐藏、锁定等功能的插件
 */
class LayerManager {
    /**
     * 构造函数
     */
    constructor() {
        this.editor = null;
        this.layerList = [];
        this.selectedLayer = null;
    }

    /**
     * 初始化插件
     * @param {Editor} editor - 编辑器实例
     */
    init(editor) {
        this.editor = editor;
        this._initLayerList();
        this._bindEvents();
    }

    /**
     * 初始化图层列表
     * @private
     */
    _initLayerList() {
        const canvas = this.editor.canvas;
        this.layerList = canvas.getObjects().map(obj => ({
            id: obj.id || this._generateId(),
            name: obj.name || 'Layer',
            visible: true,
            locked: false,
            object: obj
        }));
    }

    /**
     * 生成唯一ID
     * @private
     * @returns {string} 唯一ID
     */
    _generateId() {
        return 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 绑定事件
     * @private
     */
    _bindEvents() {
        const canvas = this.editor.canvas;
        
        // 监听对象添加事件
        canvas.on('object:added', (e) => {
            const obj = e.target;
            this.layerList.push({
                id: obj.id || this._generateId(),
                name: obj.name || 'Layer',
                visible: true,
                locked: false,
                object: obj
            });
            this._updateLayerList();
        });

        // 监听对象移除事件
        canvas.on('object:removed', (e) => {
            const obj = e.target;
            this.layerList = this.layerList.filter(layer => layer.object !== obj);
            this._updateLayerList();
        });
    }

    /**
     * 更新图层列表
     * @private
     */
    _updateLayerList() {
        // 触发图层列表更新事件
        this.editor._triggerPluginEvent('layer:updated', this.layerList);
    }

    /**
     * 设置图层可见性
     * @param {string} layerId - 图层ID
     * @param {boolean} visible - 是否可见
     */
    setLayerVisible(layerId, visible) {
        const layer = this.layerList.find(l => l.id === layerId);
        if (layer) {
            layer.visible = visible;
            layer.object.visible = visible;
            this.editor.canvas.renderAll();
            this._updateLayerList();
        }
    }

    /**
     * 设置图层锁定状态
     * @param {string} layerId - 图层ID
     * @param {boolean} locked - 是否锁定
     */
    setLayerLocked(layerId, locked) {
        const layer = this.layerList.find(l => l.id === layerId);
        if (layer) {
            layer.locked = locked;
            layer.object.selectable = !locked;
            layer.object.evented = !locked;
            this.editor.canvas.renderAll();
            this._updateLayerList();
        }
    }

    /**
     * 重命名图层
     * @param {string} layerId - 图层ID
     * @param {string} newName - 新名称
     */
    renameLayer(layerId, newName) {
        const layer = this.layerList.find(l => l.id === layerId);
        if (layer) {
            layer.name = newName;
            layer.object.name = newName;
            this._updateLayerList();
        }
    }

    /**
     * 获取图层列表
     * @returns {Array} 图层列表
     */
    getLayerList() {
        return this.layerList;
    }

    /**
     * 获取当前选中的图层
     * @returns {Object|null} 当前选中的图层
     */
    getSelectedLayer() {
        return this.selectedLayer;
    }

    /**
     * 选择图层
     * @param {string} layerId - 图层ID
     */
    selectLayer(layerId) {
        const layer = this.layerList.find(l => l.id === layerId);
        if (layer && !layer.locked) {
            this.selectedLayer = layer;
            this.editor.canvas.setActiveObject(layer.object);
            this.editor.canvas.renderAll();
        }
    }
}

export default LayerManager; 