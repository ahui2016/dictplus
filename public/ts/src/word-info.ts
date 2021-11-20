// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { mjElement, mjComponent, m, cc, span, appendToList } from './mj.js';
import * as util from './util.js';

let wordID = util.getUrlParam('id');
let localtagAddr = "http://127.0.0.1:53549";

const Loading = util.CreateLoading('center');
const Alerts = util.CreateAlerts();

const titleArea = m('div').addClass('text-center').append(
  m('h1').text('Details of an item')
);

const EditBtn = cc('a', {
  text:'Edit',
  attr:{href:'/public/edit-word.html?id='+wordID},
  classes:'ml-2',
});
const naviBar = m('div').addClass('text-right').append(
  util.LinkElem('/',{text:'Home'}),
  m(EditBtn).hide(),
);

interface WordInfoList extends mjComponent {
  append: (key:string, value:string|mjElement) => WordInfoList;
}
const WordInfo = cc('table') as WordInfoList;
WordInfo.append = (key:string, value:string|mjElement) => {
  WordInfo.elem().append( create_table_row(key, value) );
  return WordInfo;
};

const DelBtn = cc('a', {text:'delete',classes:'ml-2',attr:{href:'#'}});
const SubmitAlerts = util.CreateAlerts();
const BtnArea = cc('div',{classes:'text-center my-5',children:[
  m(SubmitAlerts).addClass('mb-3'),
  m(DelBtn).on('click', e => {
    e.preventDefault();
    util.disable(DelBtn);
    SubmitAlerts.insert('danger', '当 delete 按钮变红时，再点击一次可删除该词条，不可恢复。');
    setTimeout(() => {
      util.enable(DelBtn);
      DelBtn.elem().css('color','red').off().on('click', e => {
        e.preventDefault();
        util.ajax({method:'POST',url:'/api/delete-word',alerts:SubmitAlerts,buttonID:DelBtn.id,body:{id:wordID}},
          () => {
            Alerts.clear().insert('success', '已彻底删除该词条。');
            WordInfo.elem().hide();
            EditBtn.elem().hide();
            BtnArea.elem().hide();
          });
      });
    }, 2000);
  }),
]});

$('#root').append(
  titleArea,
  naviBar,
  m(Loading),
  m(Alerts),
  m(WordInfo).hide(),
  m(BtnArea).hide(),
);

init();

function init() {
  if (!wordID) {
    Loading.hide();
    Alerts.insert('danger', 'the blog id is empty, need a blog id');
    return;
  }

  initLocaltagsAddr();

  util.ajax({method:'POST',url:'/api/get-word',alerts:Alerts,body:{id:wordID}},
    resp => {
      const w = resp as util.Word;
      $('title').text(`Edit (id:${wordID}) - dictplus`);

      const Links = cc('div', {classes:'WordLinks'});
      const Images = cc('div', {classes:'WordImages'});
      const Notes = cc('pre', {classes:'WordNotes'});
      const ctime = dayjs.unix(w.CTime).format('YYYY-MM-DD HH:mm:ss');

      EditBtn.elem().show();
      BtnArea.elem().show();
      WordInfo.elem().show();
      WordInfo
        .append('ID', w.ID)
        .append('CN', w.CN)
        .append('EN', w.EN)
        .append('JP', w.JP)
        .append('Kana', w.Kana)
        .append('Other', w.Other)
        .append('Label', w.Label)
        .append('Links', m(Links))
        .append('Images', m(Images))
        .append('Notes', m(Notes).text(w.Notes))
        .append('CTime', ctime);

      if (w.Links) {
        w.Links.split('\n').forEach(link => {
          Links.elem().append(util.LinkElem(link,{blank:true}));
        });
      }
      if (w.Images) {
        w.Images.split(', ').forEach(id => {
          Images.elem().append(
            util.LinkElem(imageUrl(id), {text:id, blank:true})
          );
        });
      }
    }, undefined, () => {
      Loading.hide();
    });
}

function initLocaltagsAddr(): void {
  util.ajax({method:'GET',url:'/api/get-settings',alerts:Alerts},
    resp => {
      const settings = resp as util.Settings;
      localtagAddr = settings.LocaltagsAddr;
    });
}

function create_table_row(key:string,value:string|mjElement): mjElement {
  const tr = m('tr').append(m('td').addClass('nowrap').text(key));
  if (typeof value == 'string') {
    tr.append(m('td').addClass('pl-2').text(value));
  } else {
    tr.append(m('td').addClass('pl-2').append(value));
  }
  return tr;
}

function imageUrl(id:string): string {
  return `${localtagAddr}/mainbucket/${id}`;
}