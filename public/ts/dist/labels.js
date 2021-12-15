// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { m, cc, appendToList } from './mj.js';
import * as util from './util.js';
const PageLimit = 100;
const Loading = util.CreateLoading('center');
const Alerts = util.CreateAlerts();
const titleArea = m('div').addClass('text-center').append(m('h1').text('Search by Label'));
const HintBtn = cc('a', { text: 'Hint', attr: { href: '#', title: '显示说明' } });
const Hint = cc('div', {
    classes: 'Hint',
    children: [
        m('button')
            .text('hide')
            .addClass('btn')
            .on('click', () => {
            Hint.elem().hide();
            HintBtn.elem().css('visibility', 'visible');
        }),
        m('ul').append(m('li').text('在添加或编辑词条时，可采用 "大类-小类" 的形式填写 Label'), m('li').text('比如 "编程-数据库-sql", 其中分隔符可以是 "-" 或 "/" 或空格。'), m('li').text('第一个分隔符前的第一个词被视为大类（比如上面例子中的 "编程"），后面的各个词都是小类（比如上面例子中的 "数据库" 和 "sql"）'), m('li').text('一般建议采用 Starts With 方式，如果搜不到词条，会自动切换成 Contains 方式。')),
    ],
});
const LimitInput = cc('input', {
    classes: 'form-textinput',
    attr: { type: 'number', min: 1, max: 9999 },
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
    attr: { href: '#', title: '搜索结果条数上限' },
    classes: 'ml-2',
});
const naviBar = m('div')
    .addClass('text-right')
    .append(util.LinkElem('/', { text: 'Home' }), m(HintBtn)
    .addClass('ml-2')
    .on('click', e => {
    e.preventDefault();
    HintBtn.elem().css('visibility', 'hidden');
    Hint.elem().show();
}), m(LimitBtn).on('click', e => {
    e.preventDefault();
    LimitBtn.elem().css('visibility', 'hidden');
    LimitInputArea.elem().show();
}));
const radioName = 'mode';
const radioValues = ['StartsWith', 'Contains', 'EndsWith'];
const radioTitles = ['以此开头', '包含', '以此结尾'];
const Radio_StartWith = util.create_box('radio', radioName, 'checked');
const Radio_Contains = util.create_box('radio', radioName);
const Radio_EndWith = util.create_box('radio', radioName);
const SearchInput = cc('input', { attr: { type: 'text' }, prop: { autofocus: true } });
const SearchAlerts = util.CreateAlerts(2);
const SearchBtn = cc('button', { text: 'Search', classes: 'btn btn-fat text-right' });
const SearchForm = cc('form', {
    attr: { autocomplete: 'off' },
    children: [
        util.create_check(Radio_StartWith, radioValues[0], radioTitles[0]),
        util.create_check(Radio_Contains, radioValues[1], radioTitles[1]),
        util.create_check(Radio_EndWith, radioValues[2], radioTitles[2]),
        m(SearchInput).addClass('form-textinput form-textinput-fat'),
        m(SearchAlerts),
        m('div')
            .addClass('text-center mt-2')
            .append(m(SearchBtn).on('click', e => {
            e.preventDefault();
            const pattern = util.val(SearchInput, 'trim');
            if (!pattern) {
                SearchInput.elem().trigger('focus');
                return;
            }
            let href = `/public/index.html/?mode=${getChecked()}&search=${encodeURIComponent(pattern)}`;
            if (parseInt(util.val(LimitInput), 10) != PageLimit) {
                href += `&limit=${util.val(LimitInput)}`;
            }
            location.href = href;
        })),
    ],
});
const MainLabelsList = cc('div', { classes: 'LabelsList' });
const MainLabelsArea = cc('div', {
    classes: 'LabelsArea',
    children: [m('h3').text('Main Labels (大类)'), m('hr'), m(MainLabelsList).addClass('mt-3')],
});
const SubLabelsList = cc('div', { classes: 'LabelsList' });
const SubLabelsArea = cc('div', {
    classes: 'LabelsArea',
    children: [m('h3').text('Sub-Labels (小类)'), m('hr'), m(SubLabelsList).addClass('mt-3')],
});
const AllLabelsList = cc('div', { classes: 'LabelsList' });
const AllLabelsArea = cc('div', {
    classes: 'LabelsArea',
    children: [m('h3').text('All Labels (全部标签)'), m('hr'), m(AllLabelsList).addClass('mt-3')],
});
const EmptyLabelBtn = cc('button', { text: '无标签', classes: 'btn' });
const EmptyLabelArea = cc('div', {
    children: [
        m('h3').text('No Label (无标签)'),
        m('hr'),
        m('p').addClass('mt-3').text('点击下面的按钮可列出无标签的词条'),
        m('p').append(m(EmptyLabelBtn).on('click', e => {
            e.preventDefault();
            let href = `/public/index.html/?mode=EmptyLabel&search=abc`;
            if (parseInt(util.val(LimitInput), 10) != PageLimit) {
                href += `&limit=${util.val(LimitInput)}`;
            }
            location.href = href;
        })),
    ],
});
$('#root').append(titleArea, naviBar, m(LimitInputArea).hide(), m(Loading).addClass('my-5'), m(Alerts).addClass('my-5'), m(Hint).addClass('my-3').hide(), m(SearchForm).addClass('my-5').hide(), m(MainLabelsArea).addClass('my-5').hide(), m(SubLabelsArea).addClass('my-5').hide(), m(AllLabelsArea).addClass('my-5').hide(), m(EmptyLabelArea).addClass('my-5').hide());
init();
function init() {
    initMainLabels();
}
function initMainLabels() {
    util.ajax({ method: 'GET', url: '/api/get-all-labels', alerts: Alerts }, resp => {
        let allLabels = resp;
        if (allLabels.includes('')) {
            EmptyLabelArea.elem().show();
        }
        allLabels = allLabels.filter(x => !!x);
        if (!resp || allLabels.length == 0) {
            Alerts.insert('danger', '数据库中还没有标签，请在添加或编辑词条时在 Label 栏填写内容。');
            return;
        }
        // 注意避免 allLabels 里有字符串而导致产生 undefined 的问题，
        // 因此要确保 allLabels 里没有空字符串（在上面处理了）。
        const mainLabels = allLabels
            .map(label => label.split(/[\s-/]/).filter(x => !!x)[0])
            .filter((v, i, a) => util.noCaseIndexOf(a, v) === i) // 除重并不打乱位置
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        const subLabels = allLabels
            .join(' ')
            .split(/[\s-/]/)
            .filter(x => !!x)
            .filter((v, i, a) => util.noCaseIndexOf(a, v) === i) // 除重并不打乱位置
            .filter(x => util.noCaseIndexOf(mainLabels, x) < 0)
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        allLabels.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        SearchForm.elem().show();
        $('.LabelsArea').show();
        initLabels(AllLabelsList, allLabels);
        initLabels(SubLabelsList, subLabels);
        initLabels(MainLabelsList, mainLabels);
    }, undefined, () => {
        Loading.hide();
    });
}
function initLabels(list, labels) {
    appendToList(list, labels.map(LabelItem));
}
function LabelItem(label) {
    const self = cc('a', {
        text: label,
        attr: { href: '#' },
        classes: 'LabelItem badge-grey',
    });
    self.init = () => {
        self.elem().on('click', e => {
            e.preventDefault();
            SearchInput.elem().val(label).trigger('focus');
        });
    };
    return self;
}
function getChecked() {
    return $(`input[name=${radioName}]:checked`).val();
}
