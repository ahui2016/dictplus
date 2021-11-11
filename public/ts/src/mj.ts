// 受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js

export type mjElement = JQuery<HTMLElement>;

export interface mjComponent {
  id: string;
  raw_id: string;
  view: mjElement;
  elem: () => mjElement;
  init?: (arg?: any) => void;
}

/** 
 * 函数名 m 来源于 Mithril, 也可以理解为 make 的简称，用来创建一个元素。
 */
export function m(name: string | mjComponent): mjElement {
  if (typeof name == 'string') {
    return $(document.createElement(name));
  }
  return name.view;
}

interface ComponentOptions {
  id?:       string;
  text?:     string;
  children?: mjElement[]; 
  classes?:  string;
  css?:      {[index: string]:any};
  attr?:     {[index: string]:any};
}

function newComponent(name: string, id: string): mjComponent {
  return {
    id: '#'+id,
    raw_id: id,
    view: m(name).attr('id', id),
    elem: () => $('#'+id)
  };
}

/**
 * 函数名 cc 意思是 create a component, 用来创建一个简单的组件。
 */
export function cc(name: string, options?: ComponentOptions): mjComponent {
  let id = `r${Math.round(Math.random() * 100000000)}`;

  // 如果没有 options
  if (!options) {
    return newComponent(name, id);
  }
  // 后面就可以默认有 options

  if (options.id) id = options.id;
  const component = newComponent(name, id);

  if (options.attr)     component.view.attr(options.attr);
  if (options.css)      component.view.css(options.css);
  if (options.classes)  component.view.addClass(options.classes);
  if (options.text) {
    component.view.text(options.text);
  } else if (options.children) {
    component.view.append(options.children);
  }
  return component;
}

export function span(text: string): mjElement {
  return m('span').text(text);
}

export function appendToList(list: mjComponent, items: mjComponent[]): void {
  items.forEach(item => {
    list.elem().append(m(item));
    item.init?.();
  });
}

export async function appendToListAsync(list: mjComponent, items: mjComponent[]) {
  for (const item of items) {
    list.elem().append(m(item));
    await item.init?.();
  }
}
