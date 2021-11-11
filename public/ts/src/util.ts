// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { mjElement, mjComponent, m, cc, span } from './mj.js';

export interface Text {
  message: string;
}

export interface Blog {
  ID          :string;
	Name        :string;
	Author      :string;
	Website     :string; // 博客或网站的网址
	Links       :string; // 与博客或作者有关的其他网址，用换行符分隔
	Description :string;
	Feed        :string; // 用来判断网站有无更新的网址 (比如 RSS feed)
	FeedDate    :number; // 上次检查时间 (时间戳)
	FeedSize    :number; // 上次的 Feed 的内容的体积
	LastUpdate  :number; // 上次更新时间 (时间戳)
	Threshold   :number; // 当本次体积与 FeedSize 之差 (绝对值) 大于该阈值时判断为有更新
	Status      :string;
	ErrMsg      :string; // 上次失败原因 (成功时设定为空字符串)
	Category    :string; // 类别
}

// 获取地址栏的参数。
export function getUrlParam(param: string): string {
  const queryString = new URLSearchParams(document.location.search);
  return queryString.get(param) ?? ''
}

export function disable(id: string): void {
  const nodeName = $(id).prop('nodeName');
  if (nodeName == 'BUTTON' || nodeName == 'INPUT') {
    $(id).prop('disabled', true);
  } else {
    $(id).css('pointer-events', 'none');
  }
}

export function enable(id: string): void {
  const nodeName = $(id).prop('nodeName');
  if (nodeName == 'BUTTON' || nodeName == 'INPUT') {
    $(id).prop('disabled', false);
  } else {
    $(id).css('pointer-events', 'auto');
  }
}

export interface mjLoading extends mjComponent {
  hide: () => void;
  show: () => void;
}

export function CreateLoading(align?: 'center'): mjLoading {
  let classes = 'Loading';
  if (align == 'center') { classes += ' text-center'; }

  const loading = cc('div', {
    text:'Loading...',classes:classes}) as mjLoading;

  loading.hide = () => { loading.elem().hide() };
  loading.show = () => { loading.elem().show() };
  return loading;
}

export interface mjAlerts extends mjComponent {
  max: number;
  count: number;
  insertElem: (elem: mjElement) => void;
  insert: (msgType: 'success' | 'danger' | 'info' | 'primary', msg: string) => void;
  clear: () => mjAlerts;
}

/**
 * 当 max == undefined 时，给 max 一个默认值 (比如 3)。
 * 当 max <= 0 时，不限制数量。
 */
export function CreateAlerts(max?: number): mjAlerts {
  const alerts = cc('div') as mjAlerts;
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
      .append( m('span').text(time_and_msg) );
    alerts.insertElem(elem);
  };

  alerts.clear = () => {
    $(alerts.id).html('');
    return alerts;
  };

  return alerts;
}

export interface AjaxOptions {
  method: string;
  url: string;
  body?: FormData | object;
  alerts?: mjAlerts;
  buttonID?: string;
  responseType?: XMLHttpRequestResponseType;
}

export function ajax(
  options: AjaxOptions,
  onSuccess?: (resp: any) => void,
  onFail?: (that: XMLHttpRequest, errMsg: string) => void,
  onAlways?: (that: XMLHttpRequest) => void,
  onReady?: (that: XMLHttpRequest) => void
): void {

  const handleErr = (that: XMLHttpRequest, errMsg: string) => {
    if (onFail) {
      onFail(that, errMsg);
      return;
    }
    if (options.alerts) {
      options.alerts.insert('danger', errMsg);
    } else {
      console.log(errMsg);
    }
  }

  if (options.buttonID) disable(options.buttonID);

  const xhr = new XMLHttpRequest();

  xhr.timeout = 10*1000;
  xhr.ontimeout = () => {
    handleErr(xhr, 'timeout');
  };

  if (options.responseType) {
    xhr.responseType = options.responseType;
  } else {
    xhr.responseType = 'json';
  }

  xhr.open(options.method, options.url);

  xhr.onerror = () => {
    handleErr(xhr, 'An error occurred during the transaction');
  };

  xhr.onreadystatechange = function() {
    onReady?.(this);
  }

  xhr.onload = function() {
    if (this.status == 200) {
      onSuccess?.(this.response);
    } else {
      let errMsg = `${this.status}`;
      if (this.responseType == 'text') {
        errMsg += ` ${this.responseText}`;
      } else {
        errMsg += ` ${this.response?.message!}`;
      }
      handleErr(xhr, errMsg);
    }
  };

  xhr.onloadend = function() {
    if (options.buttonID) enable(options.buttonID);
    onAlways?.(this);
  };

  if (options.body && !(options.body instanceof FormData)) {
    const body = new FormData();
    for (const [k, v] of Object.entries(options.body)) {
      body.set(k, v);
    }
    xhr.send(body);
  } else {
    xhr.send(options.body);
  }
}

/**
 * @param n 超时限制，单位是秒
 */
export function ajaxPromise(options: AjaxOptions, n: number): Promise<any> {
  const second = 1000;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { reject('timeout') }, n*second);
    ajax(options,
      result => { resolve(result) },  // onSuccess
      errMsg => { reject(errMsg) },   // onError
      () => { clearTimeout(timeout) } // onAlways
    );
  });
}

export function val(obj: mjElement | mjComponent): string {
  if ('elem' in obj) return obj.elem().val() as string
  return obj.val() as string
}

export function itemID(id: string): string {
  return `i${id}`;
}

interface LinkOptions {
  text?: string;
  title?: string;
  blank?: boolean;
}
export function LinkElem(href: string,options?:LinkOptions): mjElement {
  if (!options) {
    return m('a').text(href).attr('href', href);
  }
  if (!options.text) options.text = href
  const link = m('a').text(options.text).attr('href', href);
  if (options.title) link.attr('title', options.title);
  if (options.blank) link.attr('target', '_blank');
  return link;
}

function newFormData(name: string, value: string) {
  const fd = new FormData();
  fd.set(name, value);
  return fd;
}
