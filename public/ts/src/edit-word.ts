// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { mjElement, mjComponent, m, cc, span, appendToList } from './mj.js';
import * as util from './util.js';

let wordID = util.getUrlParam('id');

const Loading = util.CreateLoading('center');
const Alerts = util.CreateAlerts();

const Title = cc('h1', {text: 'Add a new item'});

const InfoBtn = cc('a', {text:'Info',classes:'ml-2',attr:{
  href: '/public/word-info.html?id='+wordID
}});
const naviBar = m('div').addClass('text-right').append(
  util.LinkElem('/', {text:'Index'}),
  m(InfoBtn).hide(),
);

const CN_Input = create_input();
const EN_Input = create_input();
const JP_Input = create_input();
const Kana_Input = create_input();
const Label_Input = create_input();
const Notes_Input = create_textarea();
const Links_Input = create_textarea();
const Images_Input = create_textarea(2);

const SubmitAlerts = util.CreateAlerts();
const SubmitBtn = cc('button', {id:'submit',text:'submit'}); // 这个按钮是隐藏不用的，为了防止按回车键提交表单
const AddBtn = cc('button', {text:'Add',classes:'btn btn-fat'});
const UpdateBtn = cc('button', {text:'Update',classes:'btn btn-fat'});

const Form = cc('form', {attr:{'autocomplete':'off'}, children:[
  create_item(CN_Input, 'CN', ''),
  create_item(EN_Input, 'EN', ''),
  create_item(JP_Input, 'JP', ''),
  create_item(Kana_Input, 'Kana', '与 JP 对应的平假名，用于辅助搜索'),
  create_item(Label_Input, 'Label', '一个标签，通常用来记录出处（书名或文章名）'),
  create_item(Notes_Input, 'Notes', '备注/详细描述/补充说明 等等'),
  create_item(Links_Input, 'Links', '参考网址，请以 http 开头，每行一个网址'),
  create_item(Images_Input, 'Images', '参考图片的 ID, 用逗号或空格分隔 (该功能需要与 localtags 搭配使用)'),

  m(SubmitAlerts),
  m('div').addClass('text-center my-5').append(
    m(SubmitBtn).hide().on('click', e => {
      e.preventDefault();
      return false; // 这个按钮是隐藏不用的，为了防止按回车键提交表单。
    }),
    m(AddBtn).on('click', e => {
      e.preventDefault();
      const word = getItemJson();
      util.ajax({method:'POST',url:'/api/add-word',alerts:SubmitAlerts,buttonID:AddBtn.id,contentType:'json',body:JSON.stringify(word)},
        resp => {
          wordID = (resp as util.Text).message;
          Alerts.insert('success', `添加项目成功 (id:${wordID})`);
          Form.elem().hide();
          InfoBtn.elem().show().attr({href:'/public/word-info.html?id='+wordID});
        });
    }),
    m(UpdateBtn).hide(),
  ),
]});

$('#root').append(
  m(Title),
  naviBar,
  m(Loading),
  m(Alerts),
  m(Form).hide(),
);

init();

function init() {
  if (!wordID) {
    Loading.hide();
    Form.elem().show();
    $('title').text('Add item - dictplus')
    return;
  }

  $('title').text('Edit item - dictplus');
  Title.elem().text(`Edit item (id:${wordID})`);
}

function getItemJson(): util.Word {
  const link = util.val(Links_Input, 'trim')
    .split('\n').map(w => w.trim()).filter(w => !!w);

  const images = util.val(Images_Input, 'trim')
    .split(/[,、， ]/).filter(w => !!w);

  return {
    ID: wordID,
    CN: util.val(CN_Input, 'trim'),
    EN: util.val(EN_Input, 'trim'),
    JP: util.val(JP_Input, 'trim'),
    Kana: util.val(Kana_Input, 'trim'),
    Label: util.val(Label_Input, 'trim'),
    Notes: util.val(Notes_Input, 'trim'),
    Links: link.length ? link : null,
    Images: images.length ? images : null,
    CTime: 0
  }
}

function create_textarea(rows: number=3): mjComponent {
  return cc('textarea', {classes:'form-textarea', attr:{'rows': rows}});
}
function create_input(type:string='text'): mjComponent {
  return cc('input', {attr:{type:type}});
}
function create_item(comp: mjComponent, name: string, description: string): mjElement {
  return m('div').addClass('mb-3').append(
    m('label').attr({for:comp.raw_id}).text(name),
    m(comp).addClass('form-textinput form-textinput-fat'),
    m('div').addClass('form-text').text(description),
  );
}