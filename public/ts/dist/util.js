// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { m, cc } from './mj.js';
// 获取地址栏的参数。
export function getUrlParam(param) {
    var _a;
    const queryString = new URLSearchParams(document.location.search);
    return (_a = queryString.get(param)) !== null && _a !== void 0 ? _a : '';
}
export function disable(id) {
    const nodeName = $(id).prop('nodeName');
    if (nodeName == 'BUTTON' || nodeName == 'INPUT') {
        $(id).prop('disabled', true);
    }
    else {
        $(id).css('pointer-events', 'none');
    }
}
export function enable(id) {
    const nodeName = $(id).prop('nodeName');
    if (nodeName == 'BUTTON' || nodeName == 'INPUT') {
        $(id).prop('disabled', false);
    }
    else {
        $(id).css('pointer-events', 'auto');
    }
}
export function CreateLoading(align) {
    let classes = 'Loading';
    if (align == 'center') {
        classes += ' text-center';
    }
    const loading = cc('div', {
        text: 'Loading...', classes: classes
    });
    loading.hide = () => { loading.elem().hide(); };
    loading.show = () => { loading.elem().show(); };
    return loading;
}
/**
 * 当 max == undefined 时，给 max 一个默认值 (比如 3)。
 * 当 max <= 0 时，不限制数量。
 */
export function CreateAlerts(max) {
    const alerts = cc('div');
    alerts.max = max == undefined ? 3 : max;
    alerts.count = 0;
    alerts.insertElem = (elem) => {
        $(alerts.id).prepend(elem);
        alerts.count++;
        if (alerts.max > 0 && alerts.count > alerts.max) {
            $(`${alerts.id} div:last-of-type`).remove();
        }
    };
    alerts.insert = (msgType, msg) => {
        const time = dayjs().format('HH:mm:ss');
        const time_and_msg = `${time} ${msg}`;
        if (msgType == 'danger') {
            console.log(time_and_msg);
        }
        const elem = m('div')
            .addClass(`alert alert-${msgType} my-1`)
            .append(m('span').text(time_and_msg));
        alerts.insertElem(elem);
    };
    alerts.clear = () => {
        $(alerts.id).html('');
        return alerts;
    };
    return alerts;
}
export function ajax(options, onSuccess, onFail, onAlways, onReady) {
    const handleErr = (that, errMsg) => {
        if (onFail) {
            onFail(that, errMsg);
            return;
        }
        if (options.alerts) {
            options.alerts.insert('danger', errMsg);
        }
        else {
            console.log(errMsg);
        }
    };
    if (options.buttonID)
        disable(options.buttonID);
    const xhr = new XMLHttpRequest();
    xhr.timeout = 10 * 1000;
    xhr.ontimeout = () => {
        handleErr(xhr, 'timeout');
    };
    if (options.responseType) {
        xhr.responseType = options.responseType;
    }
    else {
        xhr.responseType = 'json';
    }
    xhr.open(options.method, options.url);
    xhr.onerror = () => {
        handleErr(xhr, 'An error occurred during the transaction');
    };
    xhr.onreadystatechange = function () {
        onReady === null || onReady === void 0 ? void 0 : onReady(this);
    };
    xhr.onload = function () {
        var _a;
        if (this.status == 200) {
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(this.response);
        }
        else {
            let errMsg = `${this.status}`;
            if (this.responseType == 'text') {
                errMsg += ` ${this.responseText}`;
            }
            else {
                errMsg += ` ${(_a = this.response) === null || _a === void 0 ? void 0 : _a.message}`;
            }
            handleErr(xhr, errMsg);
        }
    };
    xhr.onloadend = function () {
        if (options.buttonID)
            enable(options.buttonID);
        onAlways === null || onAlways === void 0 ? void 0 : onAlways(this);
    };
    if (options.body && !(options.body instanceof FormData)) {
        const body = new FormData();
        for (const [k, v] of Object.entries(options.body)) {
            body.set(k, v);
        }
        xhr.send(body);
    }
    else {
        xhr.send(options.body);
    }
}
/**
 * @param n 超时限制，单位是秒
 */
export function ajaxPromise(options, n) {
    const second = 1000;
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { reject('timeout'); }, n * second);
        ajax(options, result => { resolve(result); }, // onSuccess
        // onSuccess
        errMsg => { reject(errMsg); }, // onError
        () => { clearTimeout(timeout); } // onAlways
        );
    });
}
export function val(obj) {
    if ('elem' in obj)
        return obj.elem().val();
    return obj.val();
}
export function itemID(id) {
    return `i${id}`;
}
export function LinkElem(href, options) {
    if (!options) {
        return m('a').text(href).attr('href', href);
    }
    if (!options.text)
        options.text = href;
    const link = m('a').text(options.text).attr('href', href);
    if (options.title)
        link.attr('title', options.title);
    if (options.blank)
        link.attr('target', '_blank');
    return link;
}
function newFormData(name, value) {
    const fd = new FormData();
    fd.set(name, value);
    return fd;
}
