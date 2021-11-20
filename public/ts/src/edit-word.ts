// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { mjElement, mjComponent, m, cc, span, appendToList } from './mj.js';
import * as util from './util.js';

let wordID = util.getUrlParam('id');

const Loading = util.CreateLoading('center');
const Alerts = util.CreateAlerts();

const Title = cc('h1', {text: 'Add a new item'});

const ViewBtn = cc('a', {text:'View',classes:'ml-2'});
const naviBar = m('div').addClass('text-right').append(
  util.LinkElem('/', {text:'Home'}),
  m(ViewBtn).hide(),
);

const CN_Input =     util.create_input();
const EN_Input =     util.create_input();
const JP_Input =     util.create_input();
const Kana_Input =   util.create_input();
const Other_Input =  util.create_input();
const Label_Input =  util.create_input();
const Notes_Input =  util.create_textarea();
const Links_Input =  util.create_textarea();
const Images_Input = util.create_textarea(2);

const SubmitAlerts = util.CreateAlerts();
const SubmitBtn = cc('button', {id:'submit',text:'submit'}); // 这个按钮是隐藏不用的，为了防止按回车键提交表单
const AddBtn = cc('button', {text:'Add',classes:'btn btn-fat'});
const UpdateBtn = cc('button', {text:'Update',classes:'btn btn-fat'});
const DelBtn = cc('a', {text:'delete',classes:'ml-2',attr:{href:'#'}});

const Form = cc('form', {attr:{'autocomplete':'off'}, children:[
  util.create_item(CN_Input, 'CN', ''),
  util.create_item(EN_Input, 'EN', ''),
  util.create_item(JP_Input, 'JP', ''),
  util.create_item(Kana_Input, 'Kana', '与 JP 对应的平假名，用于辅助搜索'),
  util.create_item(Other_Input, 'Other', '其他任何语种'),
  util.create_item(Label_Input, 'Label', '一个标签，通常用来记录出处（书名或文章名）'),
  util.create_item(Notes_Input, 'Notes', '备注/详细描述/补充说明 等等'),
  util.create_item(Links_Input, 'Links', '参考网址，请以 http 开头，每行一个网址'),
  util.create_item(Images_Input, 'Images', '参考图片的 ID, 用逗号或空格分隔 (该功能需要与 localtags 搭配使用)'),

  m(SubmitAlerts),
  m('div').addClass('text-center my-5').append(
    m(SubmitBtn).hide().on('click', e => {
      e.preventDefault();
      return false; // 这个按钮是隐藏不用的，为了防止按回车键提交表单。
    }),
    m(AddBtn).on('click', e => {
      e.preventDefault();
      const body = getFormWord();
      util.ajax({method:'POST',url:'/api/add-word',alerts:SubmitAlerts,buttonID:AddBtn.id,contentType:'json',body:body},
        resp => {
          wordID = (resp as util.Text).message;
          Alerts.insert('success', `添加项目成功 (id:${wordID})`);
          Form.elem().hide();
          ViewBtn.elem().show().attr({href:'/public/word-info.html?id='+wordID});
        });
    }),
    m(UpdateBtn).on('click', e => {
      e.preventDefault();
      const body = getFormWord();
      util.ajax({method:'POST',url:'/api/update-word',alerts:SubmitAlerts,buttonID:UpdateBtn.id,contentType:'json',body:body},
        () => {
          SubmitAlerts.insert('success', '更新成功');
        });
    }).hide(),
    m(DelBtn).on('click', e => {
      e.preventDefault();
      util.disable(DelBtn);
      SubmitAlerts.insert('danger', '当 delete 按钮变红时，再点击一次可删除该词条，不可恢复。');
      setTimeout(() => {
        util.enable(DelBtn);
        DelBtn.elem().css('color','red').off().on('click', e => {
          e.preventDefault();
          util.ajax({method:'POST',url:'/api/delete-word',alerts:SubmitAlerts,body:{id:wordID}},
            () => {
              Alerts.clear().insert('success', '已彻底删除该词条。');
              Form.elem().hide();
              ViewBtn.elem().hide();
            });
        });
      }, 2000);
    }).hide(),
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
    $('title').text('Add item - dictplus')
    Loading.hide();
    Form.elem().show();
    CN_Input.elem().trigger('focus');
    return;
  }

  $('title').text('Edit item - dictplus');
  Title.elem().text(`Edit item (id:${wordID})`);

  util.ajax({method:'POST',url:'/api/get-word',alerts:Alerts,body:{id:wordID}},
    resp => {
      const word = resp as util.Word;
      Form.elem().show();
      ViewBtn.elem().show().attr({href:'/public/word-info.html?id='+wordID,target:'_blank'});
      UpdateBtn.elem().show();
      DelBtn.elem().show();
      AddBtn.elem().hide();

      CN_Input.elem().val(word.CN);
      EN_Input.elem().val(word.EN);
      JP_Input.elem().val(word.JP);
      Kana_Input.elem().val(word.Kana);
      Other_Input.elem().val(word.Other);
      Label_Input.elem().val(word.Label);
      Notes_Input.elem().val(word.Notes);
      Links_Input.elem().val(word.Links);
      Images_Input.elem().val(word.Images);

      CN_Input.elem().trigger('focus');
    }, undefined, () => {
      Loading.hide();
    });
}

function getFormWord(): util.Word {
  const links = util.val(Links_Input, 'trim')
    .split(/\s/).map(w => w.trim()).filter(w => !!w).join('\n');

  const images = util.val(Images_Input, 'trim')
    .split(/[,、，\s]/).filter(w => !!w).join(', ');

  return {
    ID: wordID,
    CN: util.val(CN_Input, 'trim'),
    EN: util.val(EN_Input, 'trim'),
    JP: util.val(JP_Input, 'trim'),
    Kana: util.val(Kana_Input, 'trim'),
    Other: util.val(Other_Input, 'trim'),
    Label: util.val(Label_Input, 'trim'),
    Notes: util.val(Notes_Input, 'trim'),
    Links: links,
    Images: images,
    CTime: 0
  }
}
