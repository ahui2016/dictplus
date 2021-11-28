// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { mjElement, mjComponent, m, cc, span, appendToList } from './mj.js';
import * as util from './util.js';

const Loading = util.CreateLoading('center');
const Alerts = util.CreateAlerts();

const Title = cc('h1', {text: 'Settings'});

const naviBar = m('div').addClass('text-right').append(
  util.LinkElem('/', {text:'Home'}),
);

const DictplusAddrInput = util.create_input();
const LocaltagsAddrInput = util.create_input();
const DelayInput = util.create_box('checkbox', 'delay', 'checked');
const delayCheck = util.create_check(DelayInput, 'Delay', '延迟');

const SubmitAlerts = util.CreateAlerts();
const SubmitBtn = cc('button', {id:'submit',text:'submit'}); // 这个按钮是隐藏不用的，为了防止按回车键提交表单
const UpdateBtn = cc('button', {text:'Update',classes:'btn btn-fat'});

const Form = cc('form', {attr:{'autocomplete':'off'}, children:[
  util.create_item(DictplusAddrInput, 'Dictplus Address', 'dictplus 的默认网址，修改后下次启动时生效。'),
  util.create_item(LocaltagsAddrInput, 'Localtags Address', 'localtags 的网址，详细说明请看 README.md 中的 "插图" 部分。'),
  m('div').addClass('mb-3').append(
    delayCheck,
    m('div').addClass('form-text').text('延迟效果。有延迟可看到一部分渐变过程，没有延迟则程序反应速度会更快。'),
  ),
  m(SubmitAlerts),
  m('div').addClass('text-center my-5').append(
    m(SubmitBtn).hide().on('click', e => {
      e.preventDefault();
      return false; // 这个按钮是隐藏不用的，为了防止按回车键提交表单。
    }),
    m(UpdateBtn).on('click', e => {
      e.preventDefault();
      const delay = DelayInput.elem().prop('checked');
      const body: util.Settings = {
        DictplusAddr: util.val(DictplusAddrInput, 'trim'),
        LocaltagsAddr: util.val(LocaltagsAddrInput, 'trim'),
        Delay: delay,
      };
      util.ajax({method:'POST',url:'/api/update-settings',alerts:SubmitAlerts,buttonID:UpdateBtn.id,contentType:'json',body:body},
        () => {
          SubmitAlerts.insert('success', '更新成功');
        });
    }),
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
  util.ajax({method:'GET',url:'/api/get-settings',alerts:Alerts},
    resp => {
      const settings = resp as util.Settings;
      Form.elem().show();
      DictplusAddrInput.elem().val(settings.DictplusAddr);
      LocaltagsAddrInput.elem().val(settings.LocaltagsAddr);
      DelayInput.elem().prop('checked', settings.Delay);
    }, undefined, () => {
      Loading.hide();
    });
}
