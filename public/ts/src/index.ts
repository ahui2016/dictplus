// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { mjElement, mjComponent, m, cc, span, appendToList } from './mj.js';
import * as util from './util.js';

let isAllChecked = false;

const titleArea = m('div').addClass('text-center').append(
  m('h1').append(
    'dict', span('+').addClass('Plus'),
  ),
  m('div').text('dictplus, 一个词典程序，但不只是一个词典程序'),
);

const CN_Box = create_box('checked');
const EN_Box = create_box('checked');
const JP_Box = create_box('checked');
const Kana_Box = create_box('checked');
const Other_Box = create_box('checked');
const Label_Box = create_box();
const Notes_Box = create_box();
const CheckAllBtn = cc('a', {
  text:'[all]', classes:'ml-3',
  attr:{title:'check all / uncheck all', href:'#'}});
const SearchInput = cc('input', {attr:{type:'text'}});
const SearchAlerts = util.CreateAlerts(2);
const SearchBtn = cc('button', {text:'Search',classes:'btn btn-fat text-right'})
const SearchForm = cc('form', {attr:{autocomplete:'off'}, children: [
  create_check(CN_Box, 'CN'),
  create_check(EN_Box, 'EN'),
  create_check(JP_Box, 'JP'),
  create_check(Kana_Box, 'Kana'),
  create_check(Other_Box, 'Other'),
  create_check(Label_Box, 'Label'),
  create_check(Notes_Box, 'Notes'),
  m(CheckAllBtn).on('click', e => {
    e.preventDefault();
    $('input[type=checkbox]').prop('checked', !isAllChecked);
    isAllChecked = !isAllChecked;
  }),
  m(SearchInput).addClass('form-textinput form-textinput-fat'),
  m(SearchAlerts),
  m('div').addClass('text-center mt-2').append(
    m(SearchBtn).on('click', e => {
      e.preventDefault();
    })
  ),
]});

$('#root').append(
  titleArea,
  m(SearchForm).addClass('my-5'),
  m('ul').append(
    m('li').append(util.LinkElem('/public/edit-word.html', {text:'Add a new item'})),
  ),
);

init();

function init() {
  const v = $('input[type=checkbox]:checked').val();
  console.log(v);
  
}

function create_check(box:mjComponent, name:string): mjElement {
  return m('div').addClass('form-check-inline').append(
    m(box).attr({type:'checkbox',value:name}),
    m('label').text(name).attr({for:box.raw_id}),
  );
}

function create_box(checked: 'checked'|'' = ''): mjComponent {
  const c = checked ? true : false;
  return cc('input', {attr:{type:'checkbox'},prop:{checked:c}});
}
