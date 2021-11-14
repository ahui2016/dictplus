// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { mjElement, mjComponent, m, cc, span, appendToList } from './mj.js';
import * as util from './util.js';

const titleArea = m('div').addClass('text-center').append(
  m('h1').append(
    'dict', span('+').addClass('Plus'),
  ),
  m('div').text('dictplus, 一个词典程序，但不只是一个词典程序'),
);

$('#root').append(
  titleArea,
  m('ul').append(
    m('li').append(util.LinkElem('/public/edit-word.html', {text:'Add a new item'})),
  ),
);

init();

function init() {
}
