// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { mjElement, mjComponent, m, cc, span, appendToList } from './mj.js';
import * as util from './util.js';

const NotesLimit = 64;
let isAllChecked = false;

const Loading = util.CreateLoading('center');
const Alerts = util.CreateAlerts();

const titleArea = m('div').addClass('text-center').append(
  m('h1').append(
    'dict', span('+').addClass('Plus'),
  ),
  m('div').text('dictplus, 一个词典程序，但不只是一个词典程序'),
);

const naviBar = m('div').addClass('text-right').append(
  util.LinkElem('/public/edit-word.html', {text:'Add', title:'Add a new item'}),
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

const WordList = cc('div');

$('#root').append(
  titleArea,
  naviBar,
  m(Loading).addClass('my-5'),
  m(Alerts).addClass('my-5'),
  m(SearchForm).addClass('my-5').hide(),
  m(WordList).addClass('my-5'),
);

init();

function init() {
  count_words();
  getNewWords();

  const v = $('input[type=checkbox]:checked').val();
  console.log(v);  
}

function getNewWords() {
  util.ajax({method:'GET',url:'/api/get-new-words',alerts:Alerts},
    resp => {
      const words = resp as util.Word[]
      if (words && words.length > 0) {
        appendToList(WordList, words.map(WordItem));
      }
    });
}

function WordItem(w: util.Word): mjComponent {
  const self = cc('div', {id:w.ID, classes:'WordItem', children:[
    m('div').addClass('WordIDArea').append(
      span(`[id:${w.ID}]`),
      util.LinkElem('/public/edit-word.html?id='+w.ID,{text:'edit',blank:true}).addClass('ml-2'),
      util.LinkElem('/public/word-info.html?id='+w.ID,{text:'view',blank:true}).addClass('ml-2'),
    ),
    m('div').addClass('WordLangs'),
    m('div').addClass('WordNotes').hide(),
  ]});
  self.init = () => {
    if (w.Links) {
      self.elem().find('.WordIDArea').append(badge('links').addClass('ml-2'));
    }
    if (w.Images) {
      self.elem().find('.WordIDArea').append(badge('images').addClass('ml-2'));
    }
    if (w.Label) {
      self.elem().find('.WordIDArea').append(badge(w.Label).addClass('ml-2'));
    }
    ['CN','EN','JP','Other'].forEach(lang => {
      const word = w as any;
      if (word[lang]) {
        self.elem().find('.WordLangs').append(
          span(lang+': ').addClass('text-grey'),
          word[lang], ' ',
        );
      }
    });
    if (w.Notes) {
      self.elem().find('.WordNotes').show()
        .append(limited_notes(w.Notes)).addClass('text-grey');
    }
  }
  return self;
}

function limited_notes(notes: string): string {
  if (notes.length <= NotesLimit) {
    return notes;
  }
  return notes.substr(0, NotesLimit) + '...';
}

function count_words(): void {
  util.ajax({method:'GET',url:'/api/count-words',alerts:Alerts},
    resp => {
      const n = (resp as util.Num).n;
      if (n < 1) {
        Alerts.insert('danger', '这是一个全新的数据库，请点击右上角的 Add 按钮添加数据。');
        return;
      }
      const count = n.toLocaleString('en-US');
      Alerts.insert('success', `数据库中已有 ${count} 条数据`);
      SearchForm.elem().show();
    }, undefined, () => {
      Loading.hide();
    });
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

function badge(name:string): mjElement {
  return span(name).addClass('badge-grey');
}