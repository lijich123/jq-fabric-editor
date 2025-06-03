/**
 * 事件管理类
 * 用于处理编辑器的事件
 */
class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {Function} listener - 监听器函数
     * @returns {EventEmitter} 当前实例
     */
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(listener);
        return this;
    }

    /**
     * 注册一次性事件监听器
     * @param {string} event - 事件名称
     * @param {Function} listener - 监听器函数
     * @returns {EventEmitter} 当前实例
     */
    once(event, listener) {
        const onceListener = (...args) => {
            this.off(event, onceListener);
            listener.apply(this, args);
        };
        return this.on(event, onceListener);
    }

    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {Function} listener - 监听器函数
     * @returns {EventEmitter} 当前实例
     */
    off(event, listener) {
        if (this.events.has(event)) {
            this.events.get(event).delete(listener);
            if (this.events.get(event).size === 0) {
                this.events.delete(event);
            }
        }
        return this;
    }

    /**
     * 移除所有事件监听器
     * @param {string} [event] - 事件名称，如果不传则移除所有事件
     * @returns {EventEmitter} 当前实例
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
        return this;
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {...*} args - 事件参数
     * @returns {boolean} 是否有监听器被触发
     */
    emit(event, ...args) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(listener => {
                listener.apply(this, args);
            });
            return true;
        }
        return false;
    }

    /**
     * 获取事件监听器数量
     * @param {string} event - 事件名称
     * @returns {number} 监听器数量
     */
    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).size : 0;
    }

    /**
     * 获取所有事件名称
     * @returns {string[]} 事件名称数组
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
}

export default EventEmitter; 