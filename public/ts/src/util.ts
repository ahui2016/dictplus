// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { mjElement, mjComponent, m, cc, span } from './mj.js';

export interface Text {
  message: string;
}
export interface Num {
  n: number;
}
export interface Word {
  ID     :string; // ShortID
	CN     :string;
	EN     :string;
	JP     :string;
	Kana   :string; // 与 JP 对应的平假名
  Other  :string; // 其他任何语种
	Label  :string; // 每个单词只有一个标签，通常用来记录出处（书名或文章名）
	Notes  :string;
	Links  :string; // 用换行符分隔的网址
	Images :string; // 用逗号分隔的图片 ID, 与 localtags 搭配使用
	CTime  :number;
}
export interface Settings {
  DictplusAddr  :string;
	LocaltagsAddr :string;
}

// 获取地址栏的参数。
export function getUrlParam(param: string): string {
  const queryString = new URLSearchParams(document.location.search);
  return queryString.get(param) ?? ''
}

/**
 * @param name is a mjComponent or the mjComponent's id
 */
export function disable(name: string|mjComponent): void {
  const id = typeof name == 'string' ? name : name.id;
  const nodeName = $(id).prop('nodeName');
  if (nodeName == 'BUTTON' || nodeName == 'INPUT') {
    $(id).prop('disabled', true);
  } else {
    $(id).css('pointer-events', 'none');
  }
}

/**
 * @param name is a mjComponent or the mjComponent's id
 */
 export function enable(name: string|mjComponent): void {
  const id = typeof name == 'string' ? name : name.id;
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
  contentType?: string;
}

/**
 * 注意：当 options.contentType 设为 json 时，options.body 应该是一个未转换为 JSON 的 object,
 * 因为在 ajax 里会对 options.body 使用 JSON.stringfy
 */
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

  if (options.contentType) {
    if (options.contentType == 'json') options.contentType = 'application/json';
    xhr.setRequestHeader('Content-Type', options.contentType);
  }

  if (options.contentType == 'application/json') {
    xhr.send(JSON.stringify(options.body));
  } else if (options.body && !(options.body instanceof FormData)) {
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
export function ajaxPromise(options: AjaxOptions, n: number=5): Promise<any> {
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

export function val(obj: mjElement | mjComponent, trim?:'trim'): string {
  let s = '';
  if ('elem' in obj) {
    s = obj.elem().val() as string;
  } else {
    s = obj.val() as string
  }
  if (trim) {
    return s.trim();
  } else {
    return s;
  }
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

export function create_textarea(rows: number=3): mjComponent {
  return cc('textarea', {classes:'form-textarea', attr:{'rows': rows}});
}
export function create_input(type:string='text'): mjComponent {
  return cc('input', {attr:{type:type}});
}
export function create_item(comp: mjComponent, name: string, description: string, classes='mb-3'): mjElement {
  return m('div').addClass(classes).append(
    m('label').addClass('form-label').attr({for:comp.raw_id}).text(name),
    m(comp).addClass('form-textinput form-textinput-fat'),
    m('div').addClass('form-text').text(description),
  );
}

export function badge(name:string): mjElement {
  return span(name).addClass('badge-grey');
}

/**
 * @param item is a checkbox or a radio button
 */
export function create_check(
  item: mjComponent,
  label: string,
  title?: string,
  value?: string // 由于 value 通常等于 label，因此 value 不常用，放在最后
): mjElement {
  value = value ? value : label;
  return m('div')
    .addClass('form-check-inline')
    .append(
      m(item).attr({value: value, title: title}),
      m('label').text(label).attr({for: item.raw_id, title: title})
    );
}

export function create_box(
  type: 'checkbox' | 'radio',
  name: string,
  checked: 'checked' | '' = ''
): mjComponent {
  const c = checked ? true : false;
  return cc('input', {attr: {type: type, name: name}, prop: {checked: c}});
}

export function noCaseIndexOf(arr: string[], s: string): number {
  return arr.findIndex(x => x.toLowerCase() === s.toLowerCase());
}
