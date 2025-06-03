import EventEmitter from '../utils/EventEmitter';

/**
 * 快捷键管理插件
 * 用于处理编辑器的快捷键
 */
class ShortcutManager extends EventEmitter {
    constructor() {
        super();
        this.editor = null;
        this.shortcuts = new Map();
        this.enabled = true;
    }

    /**
     * 初始化插件
     * @param {Editor} editor - 编辑器实例
     */
    init(editor) {
        this.editor = editor;
        this._bindEvents();
        this._registerDefaultShortcuts();
    }

    /**
     * 绑定事件
     * @private
     */
    _bindEvents() {
        document.addEventListener('keydown', this._handleKeyDown.bind(this));
    }

    /**
     * 注册默认快捷键
     * @private
     */
    _registerDefaultShortcuts() {
        // 撤销/重做
        this.register('ctrl+z', () => this.editor.undo());
        this.register('ctrl+shift+z', () => this.editor.redo());
        this.register('ctrl+y', () => this.editor.redo());

        // 复制/粘贴/删除
        this.register('ctrl+c', () => this._copy());
        this.register('ctrl+v', () => this._paste());
        this.register('delete', () => this._delete());
        this.register('backspace', () => this._delete());

        // 组合/拆分
        this.register('ctrl+g', () => this._group());
        this.register('ctrl+shift+g', () => this._ungroup());

        // 对齐
        this.register('ctrl+shift+l', () => this._align('left'));
        this.register('ctrl+shift+c', () => this._align('center'));
        this.register('ctrl+shift+r', () => this._align('right'));
        this.register('ctrl+shift+t', () => this._align('top'));
        this.register('ctrl+shift+m', () => this._align('middle'));
        this.register('ctrl+shift+b', () => this._align('bottom'));

        // 层级
        this.register('ctrl+[', () => this._sendBackward());
        this.register('ctrl+]', () => this._bringForward());
        this.register('ctrl+shift+[', () => this._sendToBack());
        this.register('ctrl+shift+]', () => this._bringToFront());

        // 全选
        this.register('ctrl+a', () => this._selectAll());
    }

    /**
     * 注册快捷键
     * @param {string} shortcut - 快捷键组合
     * @param {Function} handler - 处理函数
     */
    register(shortcut, handler) {
        this.shortcuts.set(this._normalizeShortcut(shortcut), handler);
    }

    /**
     * 注销快捷键
     * @param {string} shortcut - 快捷键组合
     */
    unregister(shortcut) {
        this.shortcuts.delete(this._normalizeShortcut(shortcut));
    }

    /**
     * 标准化快捷键
     * @private
     * @param {string} shortcut - 快捷键组合
     * @returns {string} 标准化后的快捷键
     */
    _normalizeShortcut(shortcut) {
        return shortcut.toLowerCase().replace(/\s+/g, '');
    }

    /**
     * 处理键盘按下事件
     * @private
     * @param {KeyboardEvent} e - 键盘事件
     */
    _handleKeyDown(e) {
        if (!this.enabled) return;

        const shortcut = this._getShortcutFromEvent(e);
        const handler = this.shortcuts.get(shortcut);

        if (handler) {
            e.preventDefault();
            handler();
        }
    }

    /**
     * 从事件中获取快捷键
     * @private
     * @param {KeyboardEvent} e - 键盘事件
     * @returns {string} 快捷键
     */
    _getShortcutFromEvent(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        if (e.metaKey) parts.push('meta');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    }

    /**
     * 复制选中对象
     * @private
     */
    _copy() {
        const activeObject = this.editor.canvas.getActiveObject();
        if (activeObject) {
            this.editor.clipboard = activeObject.toJSON();
            this.emit('copy', activeObject);
        }
    }

    /**
     * 粘贴对象
     * @private
     */
    _paste() {
        if (this.editor.clipboard) {
            fabric.util.enlivenObjects([this.editor.clipboard], ([obj]) => {
                obj.left += 10;
                obj.top += 10;
                this.editor.canvas.add(obj);
                this.editor.canvas.setActiveObject(obj);
                this.emit('paste', obj);
            });
        }
    }

    /**
     * 删除选中对象
     * @private
     */
    _delete() {
        const activeObject = this.editor.canvas.getActiveObject();
        if (activeObject) {
            this.editor.canvas.remove(activeObject);
            this.emit('delete', activeObject);
        }
    }

    /**
     * 组合选中对象
     * @private
     */
    _group() {
        const activeObject = this.editor.canvas.getActiveObject();
        if (activeObject && activeObject.type === 'activeSelection') {
            activeObject.toGroup();
            this.emit('group', activeObject);
        }
    }

    /**
     * 拆分组合
     * @private
     */
    _ungroup() {
        const activeObject = this.editor.canvas.getActiveObject();
        if (activeObject && activeObject.type === 'group') {
            activeObject.toActiveSelection();
            this.emit('ungroup', activeObject);
        }
    }

    /**
     * 对齐对象
     * @private
     * @param {string} type - 对齐类型
     */
    _align(type) {
        const activeObject = this.editor.canvas.getActiveObject();
        if (activeObject) {
            const canvas = this.editor.canvas;
            const objects = activeObject.type === 'activeSelection' 
                ? activeObject.getObjects() 
                : [activeObject];

            objects.forEach(obj => {
                switch (type) {
                    case 'left':
                        obj.set('left', 0);
                        break;
                    case 'center':
                        obj.set('left', (canvas.width - obj.width * obj.scaleX) / 2);
                        break;
                    case 'right':
                        obj.set('left', canvas.width - obj.width * obj.scaleX);
                        break;
                    case 'top':
                        obj.set('top', 0);
                        break;
                    case 'middle':
                        obj.set('top', (canvas.height - obj.height * obj.scaleY) / 2);
                        break;
                    case 'bottom':
                        obj.set('top', canvas.height - obj.height * obj.scaleY);
                        break;
                }
            });

            canvas.renderAll();
            this.emit('align', { type, objects });
        }
    }

    /**
     * 向后移动一层
     * @private
     */
    _sendBackward() {
        const activeObject = this.editor.canvas.getActiveObject();
        if (activeObject) {
            this.editor.canvas.sendBackwards(activeObject);
            this.emit('sendBackward', activeObject);
        }
    }

    /**
     * 向前移动一层
     * @private
     */
    _bringForward() {
        const activeObject = this.editor.canvas.getActiveObject();
        if (activeObject) {
            this.editor.canvas.bringForward(activeObject);
            this.emit('bringForward', activeObject);
        }
    }

    /**
     * 移到最底层
     * @private
     */
    _sendToBack() {
        const activeObject = this.editor.canvas.getActiveObject();
        if (activeObject) {
            this.editor.canvas.sendToBack(activeObject);
            this.emit('sendToBack', activeObject);
        }
    }

    /**
     * 移到最顶层
     * @private
     */
    _bringToFront() {
        const activeObject = this.editor.canvas.getActiveObject();
        if (activeObject) {
            this.editor.canvas.bringToFront(activeObject);
            this.emit('bringToFront', activeObject);
        }
    }

    /**
     * 全选
     * @private
     */
    _selectAll() {
        const canvas = this.editor.canvas;
        const objects = canvas.getObjects();
        if (objects.length > 0) {
            canvas.discardActiveObject();
            const selection = new fabric.ActiveSelection(objects, { canvas });
            canvas.setActiveObject(selection);
            this.emit('selectAll', objects);
        }
    }

    /**
     * 启用快捷键
     */
    enable() {
        this.enabled = true;
    }

    /**
     * 禁用快捷键
     */
    disable() {
        this.enabled = false;
    }

    /**
     * 销毁插件
     */
    destroy() {
        document.removeEventListener('keydown', this._handleKeyDown.bind(this));
        this.shortcuts.clear();
        this.removeAllListeners();
    }
}

export default ShortcutManager; 