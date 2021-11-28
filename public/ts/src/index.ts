// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import {mjElement, mjComponent, m, cc, span, appendToList} from './mj.js';
import * as util from './util.js';

const NotesLimit = 80;
const HistoryLimit = 30;
const PageLimit = 100;
let History: Array<string> = [];
let isAllChecked = false;
let SuccessOnce = false;

let mode = util.getUrlParam('mode');
let search = util.getUrlParam('search');
const searchLimit = util.getUrlParam('limit');

const Loading = util.CreateLoading('center');
const Alerts = util.CreateAlerts();

const SubTitle = cc('div');
const titleArea = m('div')
  .addClass('text-center')
  .append(
    m('h1')
      .addClass('cursor-pointer')
      .append('dict', span('+').addClass('Plus'))
      .on('click', () => {
        location.href = '/';
      }),
    m(SubTitle).text('dictplus, 不只是一个词典程序')
  );

const LimitInput = cc('input', {
  classes: 'form-textinput',
  attr: {type: 'number', min: 1, max: 9999},
});
const LimitInputArea = cc('div', {
  classes: 'text-right',
  children: [
    m('label').text('Page Limit').attr('for', LimitInput.raw_id),
    m(LimitInput).val(PageLimit).addClass('ml-1').css('width', '4em'),
  ],
});

const LimitBtn = cc('a', {
  text: 'Limit',
  attr: {href: '#', title: '搜索结果条数上限'},
  classes: 'ml-2',
});
const NaviBar = cc('div', {
  classes: 'text-right',
  children: [
    util.LinkElem('/public/edit-word.html', {text: 'Add', title: 'Add a new item', blank: true}),
    util.LinkElem('/public/settings.html', {text: 'Settings'}).addClass('ml-2'),
    m(LimitBtn).on('click', e => {
      e.preventDefault();
      LimitBtn.elem().css('visibility', 'hidden');
      LimitInputArea.elem().show();
    }),
  ],
});

const ResultTitle = cc('h3', {text: 'Recently Added (最近添加)'});
const ResultAlerts = util.CreateAlerts(1);
const HR = cc('hr');
const WordList = cc('div');

const HistoryItems = cc('div');
const HistoryArea = cc('div', {
  children: [m('h3').text('History (检索历史)'), m('hr'), m(HistoryItems)],
});

const AllLabelsBtn = cc('button', {text: 'all labels', classes: '.btn ml-3'});
AllLabelsBtn.init = () => {
  AllLabelsBtn.elem().on('click', e => {
    e.preventDefault();
    location.href = '/public/labels.html';
  });
};
const RecentLabels = cc('div');
const RecentLabelsArea = cc('div', {
  children: [m('h3').text('Recent Labels (最近标签)'), m('hr'), m(RecentLabels)],
});

const boxName = 'field';
const CN_Box = util.create_box('checkbox', boxName, 'checked');
const EN_Box = util.create_box('checkbox', boxName, 'checked');
const JP_Box = util.create_box('checkbox', boxName, 'checked');
const Kana_Box = util.create_box('checkbox', boxName, 'checked');
const Other_Box = util.create_box('checkbox', boxName, 'checked');
const Label_Box = util.create_box('checkbox', boxName, 'checked');
const Notes_Box = util.create_box('checkbox', boxName);
const CheckAllBtn = cc('a', {
  text: '[all]',
  classes: 'ml-3',
  attr: {title: 'check all / uncheck all', href: '#'},
});
const SearchInput = cc('input', {attr: {type: 'text'}, prop: {autofocus: true}});
const SearchAlerts = util.CreateAlerts(2);
const SearchBtn = cc('button', {text: 'Search', classes: 'btn btn-fat text-right'});
const SearchForm = cc('form', {
  attr: {autocomplete: 'off'},
  children: [
    util.create_check(CN_Box, 'CN'),
    util.create_check(EN_Box, 'EN'),
    util.create_check(JP_Box, 'JP'),
    util.create_check(Kana_Box, 'Kana'),
    util.create_check(Other_Box, 'Other'),
    util.create_check(Label_Box, 'Label'),
    util.create_check(Notes_Box, 'Notes'),
    m(CheckAllBtn).on('click', e => {
      e.preventDefault();
      $(`input[name=${boxName}]`).prop('checked', !isAllChecked);
      isAllChecked = !isAllChecked;
    }),
    m(SearchInput).addClass('form-textinput form-textinput-fat'),
    m(SearchAlerts),
    m('div')
      .addClass('text-center mt-2')
      .append(
        m(SearchBtn).on('click', e => {
          e.preventDefault();
          const pattern = util.val(SearchInput, 'trim');
          if (!pattern) {
            SearchInput.elem().trigger('focus');
            return;
          }

          SearchAlerts.insert('primary', 'searching: ' + pattern);
          updateHistory(pattern);
          let limit = parseInt(util.val(LimitInput), 10);
          if (limit < 1) {
            limit = 1;
            LimitInput.elem().val(1);
          }
          searchWords(pattern, limit);
        })
      ),
  ],
});

function searchWords(pattern: string, limit: number): void {
  const body = {pattern: pattern, fields: getFields(), limit: limit};
  if (search) {
    body.fields = ['SearchByLabel', mode];
  }
  util.ajax(
    {
      method: 'POST',
      url: '/api/search-words',
      alerts: SearchAlerts,
      buttonID: SearchBtn.id,
      contentType: 'json',
      body: body,
    },
    resp => {
      const words = resp as util.Word[];
      if (!resp || words.length == 0) {
        if (!search) {
          SearchAlerts.insert('danger', '找不到 (not found)');
        } else {
          ResultAlerts.insert('danger', '找不到 (not found)');
          if (mode == 'StartsWith') {
            Alerts.insert('danger', '"StartsWith" 方式无结果，自动转换为 "Contains" 方式搜索...');
            mode = 'Contains';
            SearchBtn.elem().trigger('click');
          }
        }
        return;
      }
      if (!search) {
        Alerts.clear();
      }
      let searchLimitWarning =
        '已达到搜索结果条数的上限, 点击右上角的 Limit 按钮可临时更改上限 (刷新页面会变回默认值)';
      if (searchLimit) {
        searchLimitWarning =
          '已达到搜索结果条数的上限，可按后退键退回 Search by Label 页面点击右上角的 Limit 按钮修改上限';
      }
      if (words.length >= body.limit) {
        Alerts.insert('danger', searchLimitWarning);
      }
      SearchAlerts.insert('success', `找到 ${words.length} 条结果`);
      ResultTitle.elem().text('Results (结果)');
      let successMsg = '';
      if (search) {
        successMsg = `Search by label ${mode} [${pattern}]`;
      } else {
        successMsg = `Search [${pattern}] in ${body.fields.join(', ')}`;
      }
      ResultAlerts.insert('success', successMsg);
      clear_list(WordList);
      appendToList(WordList, words.map(WordItem));
      if (!SuccessOnce) {
        SuccessOnce = true;
        HistoryArea.elem().insertAfter(WordList.elem());
        RecentLabelsArea.elem().insertAfter(HistoryArea.elem());
      }
    }
  );
}

function clear_list(list: mjComponent): void {
  list.elem().html('');
}

const Footer = cc('div', {
  classes: 'text-center',
  children: [
    // util.LinkElem('https://github.com/ahui2016/dictplus',{blank:true}),
    m('br'),
    span('version: 2021-11-27').addClass('text-grey'),
  ],
});

$('#root').append(
  titleArea,
  m(NaviBar),
  m(LimitInputArea).hide(),
  m(Loading).addClass('my-5'),
  m(Alerts).addClass('my-5'),
  m(SearchForm).addClass('my-5').hide(),
  m(HistoryArea).addClass('my-5').hide(),
  m(RecentLabelsArea).addClass('my-5').hide(),
  m(ResultTitle).hide(),
  m(ResultAlerts),
  m(HR).hide(),
  m(WordList).addClass('mt-3'),
  m(Footer).addClass('my-5')
);

init();

function init() {
  if (!search) {
    count_words();
    initNewWords();
    initHistory();
    initLabels();
  } else {
    Loading.hide();
    SubTitle.elem().text('Label 高级搜索结果专用页面');
    NaviBar.elem().hide();
    initSearchByLabel();
  }
}

function initSearchByLabel(): void {
  Alerts.insert('primary', '可按浏览器的后退键回到 Search by Label 页面重新搜索');
  Alerts.insert('primary', `正在采用 ${mode} 方式检索 Label[${search}]...`);

  ResultTitle.elem().show().text('Results (结果)');
  HR.elem().show();
  search = decodeURIComponent(search);
  mode = !mode ? 'StartsWith' : mode;
  if (searchLimit) {
    LimitInput.elem().val(parseInt(searchLimit, 10));
  }
  SearchInput.elem().val(search);
  SearchBtn.elem().trigger('click');
}

function initNewWords(): void {
  const body = {pattern: 'Recently-Added', fields: ['Recently-Added']};
  util.ajax(
    {method: 'POST', url: '/api/search-words', alerts: Alerts, contentType: 'json', body: body},
    resp => {
      const words = resp as util.Word[];
      if (words && words.length > 0) {
        ResultTitle.elem().show();
        HR.elem().show();
        appendToList(WordList, words.map(WordItem));
      }
    }
  );
}

function WordItem(w: util.Word): mjComponent {
  const self = cc('div', {
    id: w.ID,
    classes: 'WordItem',
    children: [
      m('div')
        .addClass('WordIDArea')
        .append(
          span(`[id: ${w.ID}]`).addClass('text-grey'),
          util
            .LinkElem('/public/edit-word.html?id=' + w.ID, {text: 'edit', blank: true})
            .addClass('ml-2'),
          util
            .LinkElem('/public/word-info.html?id=' + w.ID, {text: 'view', blank: true})
            .addClass('ml-2')
        ),
      m('div').addClass('WordLangs'),
      m('div').addClass('WordNotes').hide(),
    ],
  });
  self.init = () => {
    const i = w.Links.indexOf('\n');
    const linkText = i >= 0 ? 'links' : 'link';
    if (w.Links) {
      const firstLink = i >= 0 ? w.Links.substring(0, i) : w.Links;
      self
        .elem()
        .find('.WordIDArea')
        .append(
          util
            .LinkElem(firstLink, {text: linkText, blank: true})
            .addClass('badge-grey ml-2 cursor-pointer')
        );
    }
    if (w.Images) {
      self.elem().find('.WordIDArea').append(util.badge('images').addClass('ml-2'));
    }
    if (w.Label) {
      self
        .elem()
        .find('.WordIDArea')
        .append(
          util
            .badge(w.Label)
            .addClass('ml-2 cursor-pointer')
            .on('click', e => {
              e.preventDefault();
              selectLabelSearch(w.Label);
            })
        );
    }
    ['CN', 'EN', 'JP', 'Other'].forEach(lang => {
      const word = w as any;
      if (word[lang]) {
        const theWord = span(word[lang]);
        if (lang == 'JP' && !!w.Kana) {
          theWord.attr('title', w.Kana)
        } 
        self
          .elem()
          .find('.WordLangs')
          .append(span(lang + ': ').addClass('text-grey'), theWord, ' ');
      }
    });
    if (w.Notes) {
      self.elem().find('.WordNotes').show().append(limited_notes(w.Notes)).addClass('text-grey');
    }
  };
  return self;
}

function selectLabelSearch(label: string): void {
  SearchInput.elem().val(label);
  isAllChecked = true;
  CheckAllBtn.elem().trigger('click');
  $(`input[name=${boxName}][value=Label]`).prop('checked', true);
  SearchBtn.elem().trigger('click');
}

function getFields(): Array<string> {
  const boxes = $(`input[name=${boxName}]:checked`);
  if (boxes.length == 0) {
    return ['CN', 'EN', 'JP', 'Kana', 'Other'];
  }
  const fields: Array<string> = [];
  boxes.each((_, elem) => {
    const v = $(elem).val();
    if (typeof v == 'string') {
      fields.push(v);
    }
  });
  return fields;
}

function isEnglish(s: string): boolean {
  const size = new Blob([s]).size;
  return s.length * 2 >= size;
}

function limited_notes(notes: string): string {
  const limit = isEnglish(notes) ? NotesLimit * 2 : NotesLimit;
  if (notes.length <= limit) {
    return notes;
  }
  return notes.substr(0, limit) + '...';
}

function count_words(): void {
  util.ajax(
    {method: 'GET', url: '/api/count-words', alerts: Alerts},
    resp => {
      const n = (resp as util.Num).n;
      if (n < 1) {
        Alerts.insert('danger', '这是一个全新的数据库，请点击右上角的 Add 按钮添加数据。');
        return;
      }
      const count = n.toLocaleString('en-US');
      Alerts.insert('success', `数据库中已有 ${count} 条数据`);
      SearchForm.elem().show();
      SearchInput.elem().trigger('focus');
    },
    undefined,
    () => {
      Loading.hide();
    }
  );
}

function HistoryItem(h: string): mjComponent {
  const self = cc('a', {text: h, attr: {href: '#'}, classes: 'HistoryItem'});
  self.init = () => {
    self.elem().on('click', e => {
      e.preventDefault();
      SearchInput.elem().val(h);
      SearchBtn.elem().trigger('click');
    });
  };
  return self;
}

function initHistory(): void {
  util.ajax({method: 'GET', url: '/api/get-history', alerts: Alerts}, resp => {
    History = (resp as string[]).filter(x => !!x);
    if (!resp || History.length == 0) {
      return;
    }
    HistoryArea.elem().show();
    refreshHistory();
  });
}

function initLabels() {
  util.ajax({method: 'GET', url: '/api/get-recent-labels', alerts: Alerts}, resp => {
    const labels = (resp as string[])
      .filter(x => !!x)
      .filter((v, i, a) => util.noCaseIndexOf(a, v) === i); // 除重并不打乱位置
    if (!resp || labels.length == 0) {
      return;
    }
    RecentLabelsArea.elem().show();
    const items = labels.map(HistoryItem);
    if (items.length >= 10) {
      items.push(AllLabelsBtn);
    }
    appendToList(RecentLabels, items);
  });
}

function refreshHistory(): void {
  HistoryItems.elem().html('');
  appendToList(HistoryItems, History.map(HistoryItem));
}

function updateHistory(pattern: string): void {
  const i = History.findIndex(x => x.toLowerCase() === pattern.toLowerCase());
  if (i == 0) {
    return;
  }
  if (i > 0) {
    History.splice(i, 1);
  }
  History.unshift(pattern);
  if (History.length > HistoryLimit) {
    History.pop();
  }
  const body = {history: pattern};
  util.ajax({method: 'POST', url: '/api/update-history', alerts: SearchAlerts, body: body}, () => {
    refreshHistory();
  });
}
