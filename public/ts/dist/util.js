// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { m, cc } from './mj.js';
// 获取地址栏的参数。
export function getUrlParam(param) {
    var _a;
    const queryString = new URLSearchParams(document.location.search);
    return (_a = queryString.get(param)) !== null && _a !== void 0 ? _a : '';
}
/**
 * @param name is a mjComponent or the mjComponent's id
 */
export function disable(name) {
    const id = typeof name == 'string' ? name : name.id;
    const nodeName = $(id).prop('nodeName');
    if (nodeName == 'BUTTON' || nodeName == 'INPUT') {
        $(id).prop('disabled', true);
    }
    else {
        $(id).css('pointer-events', 'none');
    }
}
/**
 * @param name is a mjComponent or the mjComponent's id
 */
export function enable(name) {
    const id = typeof name == 'string' ? name : name.id;
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
/**
 * 注意：当 options.contentType 设为 json 时，options.body 应该是一个未转换为 JSON 的 object,
 * 因为在 ajax 里会对 options.body 使用 JSON.stringfy
 */
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
    if (options.contentType) {
        if (options.contentType == 'json')
            options.contentType = 'application/json';
        xhr.setRequestHeader('Content-Type', options.contentType);
    }
    if (options.contentType == 'application/json') {
        xhr.send(JSON.stringify(options.body));
    }
    else if (options.body && !(options.body instanceof FormData)) {
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
export function ajaxPromise(options, n = 5) {
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
export function val(obj, trim) {
    let s = '';
    if ('elem' in obj) {
        s = obj.elem().val();
    }
    else {
        s = obj.val();
    }
    if (trim) {
        return s.trim();
    }
    else {
        return s;
    }
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
export function create_textarea(rows = 3) {
    return cc('textarea', { classes: 'form-textarea', attr: { 'rows': rows } });
}
export function create_input(type = 'text') {
    return cc('input', { attr: { type: type } });
}
export function create_item(comp, name, description) {
    return m('div').addClass('mb-3').append(m('label').addClass('form-label').attr({ for: comp.raw_id }).text(name), m(comp).addClass('form-textinput form-textinput-fat'), m('div').addClass('form-text').text(description));
}
