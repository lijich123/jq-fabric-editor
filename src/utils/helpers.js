/**
 * 工具类，提供常用辅助函数
 */
export default {
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * 深拷贝对象
     * @param {Object} obj - 要拷贝的对象
     * @returns {Object} 拷贝后的对象
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * 防抖函数
     * @param {Function} fn - 要执行的函数
     * @param {number} delay - 延迟时间
     * @returns {Function} 防抖后的函数
     */
    debounce(fn, delay) {
        let timer = null;
        return function(...args) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    },

    /**
     * 节流函数
     * @param {Function} fn - 要执行的函数
     * @param {number} delay - 延迟时间
     * @returns {Function} 节流后的函数
     */
    throttle(fn, delay) {
        let last = 0;
        return function(...args) {
            const now = Date.now();
            if (now - last > delay) {
                fn.apply(this, args);
                last = now;
            }
        };
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 获取文件扩展名
     * @param {string} filename - 文件名
     * @returns {string} 扩展名
     */
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    },

    /**
     * 检查是否为图片文件
     * @param {string} filename - 文件名
     * @returns {boolean} 是否为图片
     */
    isImageFile(filename) {
        const ext = this.getFileExtension(filename).toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    },

    /**
     * 检查是否为PSD文件
     * @param {string} filename - 文件名
     * @returns {boolean} 是否为PSD
     */
    isPSDFile(filename) {
        return this.getFileExtension(filename).toLowerCase() === 'psd';
    },

    /**
     * 检查是否为JSON文件
     * @param {string} filename - 文件名
     * @returns {boolean} 是否为JSON
     */
    isJSONFile(filename) {
        return this.getFileExtension(filename).toLowerCase() === 'json';
    },

    /**
     * 检查是否为SVG文件
     * @param {string} filename - 文件名
     * @returns {boolean} 是否为SVG
     */
    isSVGFile(filename) {
        return this.getFileExtension(filename).toLowerCase() === 'svg';
    },

    /**
     * 获取对象在画布中的位置信息
     * @param {Object} obj - Fabric对象
     * @returns {Object} 位置信息
     */
    getObjectPosition(obj) {
        return {
            left: obj.left,
            top: obj.top,
            width: obj.width * obj.scaleX,
            height: obj.height * obj.scaleY,
            angle: obj.angle
        };
    },

    /**
     * 计算两点之间的距离
     * @param {Object} p1 - 点1 {x, y}
     * @param {Object} p2 - 点2 {x, y}
     * @returns {number} 距离
     */
    getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    },

    /**
     * 计算两点之间的角度
     * @param {Object} p1 - 点1 {x, y}
     * @param {Object} p2 - 点2 {x, y}
     * @returns {number} 角度
     */
    getAngle(p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    },

    /**
     * 检查点是否在矩形内
     * @param {Object} point - 点 {x, y}
     * @param {Object} rect - 矩形 {left, top, width, height}
     * @returns {boolean} 是否在矩形内
     */
    isPointInRect(point, rect) {
        return point.x >= rect.left &&
            point.x <= rect.left + rect.width &&
            point.y >= rect.top &&
            point.y <= rect.top + rect.height;
    },

    /**
     * 检查两个矩形是否相交
     * @param {Object} rect1 - 矩形1 {left, top, width, height}
     * @param {Object} rect2 - 矩形2 {left, top, width, height}
     * @returns {boolean} 是否相交
     */
    isRectIntersect(rect1, rect2) {
        return !(rect1.left + rect1.width < rect2.left ||
                rect2.left + rect2.width < rect1.left ||
                rect1.top + rect1.height < rect2.top ||
                rect2.top + rect2.height < rect1.top);
    }
}; 