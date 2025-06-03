import EventEmitter from '../utils/EventEmitter';

/**
 * 右键菜单插件
 * 用于处理编辑器的右键菜单
 */
class ContextMenu extends EventEmitter {
    constructor() {
        super();
        this.editor = null;
        this.menu = null;
        this.enabled = true;
    }

    /**
     * 初始化插件
     * @param {Editor} editor - 编辑器实例
     */
    init(editor) {
        this.editor = editor;
        this._createMenu();
        this._bindEvents();
    }

    /**
     * 创建菜单
     * @private
     */
    _createMenu() {
        this.menu = document.createElement('div');
        this.menu.className = 'context-menu';
        this.menu.style.display = 'none';
        document.body.appendChild(this.menu);
    }

    /**
     * 绑定事件
     * @private
     */
    _bindEvents() {
        this.editor.canvas.upperCanvasEl.addEventListener('contextmenu', this._handleContextMenu.bind(this));
        document.addEventListener('click', this._handleClick.bind(this));
    }

    /**
     * 处理右键菜单事件
     * @private
     * @param {MouseEvent} e - 鼠标事件
     */
    _handleContextMenu(e) {
        if (!this.enabled) return;

        e.preventDefault();
        const activeObject = this.editor.canvas.getActiveObject();
        this._showMenu(e.clientX, e.clientY, activeObject);
    }

    /**
     * 处理点击事件
     * @private
     * @param {MouseEvent} e - 鼠标事件
     */
    _handleClick(e) {
        if (this.menu.style.display === 'block' && !this.menu.contains(e.target)) {
            this._hideMenu();
        }
    }

    /**
     * 显示菜单
     * @private
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} activeObject - 当前选中的对象
     */
    _showMenu(x, y, activeObject) {
        this.menu.innerHTML = '';
        const items = this._getMenuItems(activeObject);
        
        items.forEach(item => {
            if (item === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'context-menu-separator';
                this.menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.textContent = item.label;
                menuItem.onclick = () => {
                    item.handler();
                    this._hideMenu();
                };
                this.menu.appendChild(menuItem);
            }
        });

        // 调整菜单位置，确保不超出视口
        const rect = this.menu.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) {
            x = window.innerWidth - rect.width;
        }
        if (y + rect.height > window.innerHeight) {
            y = window.innerHeight - rect.height;
        }

        this.menu.style.left = x + 'px';
        this.menu.style.top = y + 'px';
        this.menu.style.display = 'block';
    }

    /**
     * 隐藏菜单
     * @private
     */
    _hideMenu() {
        this.menu.style.display = 'none';
    }

    /**
     * 获取菜单项
     * @private
     * @param {Object} activeObject - 当前选中的对象
     * @returns {Array} 菜单项数组
     */
    _getMenuItems(activeObject) {
        const items = [];

        // 基本操作
        items.push(
            {
                label: '复制',
                handler: () => this._copy(activeObject)
            },
            {
                label: '粘贴',
                handler: () => this._paste()
            },
            {
                label: '删除',
                handler: () => this._delete(activeObject)
            }
        );

        // 如果有选中对象，添加更多操作
        if (activeObject) {
            items.push('separator');

            // 组合/拆分
            if (activeObject.type === 'activeSelection' && activeObject.getObjects().length > 1) {
                items.push({
                    label: '组合',
                    handler: () => this._group(activeObject)
                });
            } else if (activeObject.type === 'group') {
                items.push({
                    label: '拆分',
                    handler: () => this._ungroup(activeObject)
                });
            }

            // 对齐
            items.push(
                {
                    label: '左对齐',
                    handler: () => this._align('left')
                },
                {
                    label: '水平居中',
                    handler: () => this._align('center')
                },
                {
                    label: '右对齐',
                    handler: () => this._align('right')
                },
                {
                    label: '顶对齐',
                    handler: () => this._align('top')
                },
                {
                    label: '垂直居中',
                    handler: () => this._align('middle')
                },
                {
                    label: '底对齐',
                    handler: () => this._align('bottom')
                }
            );

            // 层级
            items.push('separator');
            items.push(
                {
                    label: '上移一层',
                    handler: () => this._bringForward(activeObject)
                },
                {
                    label: '下移一层',
                    handler: () => this._sendBackward(activeObject)
                },
                {
                    label: '移到顶层',
                    handler: () => this._bringToFront(activeObject)
                },
                {
                    label: '移到底层',
                    handler: () => this._sendToBack(activeObject)
                }
            );
        }

        return items;
    }

    /**
     * 复制对象
     * @private
     * @param {Object} activeObject - 当前选中的对象
     */
    _copy(activeObject) {
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
     * 删除对象
     * @private
     * @param {Object} activeObject - 当前选中的对象
     */
    _delete(activeObject) {
        if (activeObject) {
            this.editor.canvas.remove(activeObject);
            this.emit('delete', activeObject);
        }
    }

    /**
     * 组合对象
     * @private
     * @param {Object} activeObject - 当前选中的对象
     */
    _group(activeObject) {
        if (activeObject && activeObject.type === 'activeSelection') {
            activeObject.toGroup();
            this.emit('group', activeObject);
        }
    }

    /**
     * 拆分组合
     * @private
     * @param {Object} activeObject - 当前选中的对象
     */
    _ungroup(activeObject) {
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
     * @param {Object} activeObject - 当前选中的对象
     */
    _sendBackward(activeObject) {
        if (activeObject) {
            this.editor.canvas.sendBackwards(activeObject);
            this.emit('sendBackward', activeObject);
        }
    }

    /**
     * 向前移动一层
     * @private
     * @param {Object} activeObject - 当前选中的对象
     */
    _bringForward(activeObject) {
        if (activeObject) {
            this.editor.canvas.bringForward(activeObject);
            this.emit('bringForward', activeObject);
        }
    }

    /**
     * 移到最底层
     * @private
     * @param {Object} activeObject - 当前选中的对象
     */
    _sendToBack(activeObject) {
        if (activeObject) {
            this.editor.canvas.sendToBack(activeObject);
            this.emit('sendToBack', activeObject);
        }
    }

    /**
     * 移到最顶层
     * @private
     * @param {Object} activeObject - 当前选中的对象
     */
    _bringToFront(activeObject) {
        if (activeObject) {
            this.editor.canvas.bringToFront(activeObject);
            this.emit('bringToFront', activeObject);
        }
    }

    /**
     * 启用右键菜单
     */
    enable() {
        this.enabled = true;
    }

    /**
     * 禁用右键菜单
     */
    disable() {
        this.enabled = false;
        this._hideMenu();
    }

    /**
     * 销毁插件
     */
    destroy() {
        this._hideMenu();
        document.body.removeChild(this.menu);
        this.editor.canvas.upperCanvasEl.removeEventListener('contextmenu', this._handleContextMenu.bind(this));
        document.removeEventListener('click', this._handleClick.bind(this));
        this.removeAllListeners();
    }
}

export default ContextMenu; 