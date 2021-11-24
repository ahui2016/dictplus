// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { m, cc, span } from './mj.js';
import * as util from './util.js';
let isAllChecked = false;
const Loading = util.CreateLoading('center');
const Alerts = util.CreateAlerts();
const titleArea = m('div').addClass('text-center').append(m('h1').text('Search by Labels'));
const naviBar = m('div')
    .addClass('text-right')
    .append(util.LinkElem('/', { text: 'Home' }));
const radioName = 'mode';
const radioValues = ['StartWith', 'Contains', 'EndWith', 'wildcard'];
const radioTitles = ['以此开头', '包含', '以此结尾', '使用通配符'];
const Radio_StartWith = util.create_box('radio', radioName, 'checked');
const Radio_Contains = util.create_box('radio', radioName);
const Radio_EndWith = util.create_box('radio', radioName);
const Radio_wildcard = util.create_box('radio', radioName);
const SearchInput = cc('input', { attr: { type: 'text' }, prop: { autofocus: true } });
const SearchAlerts = util.CreateAlerts(2);
const SearchBtn = cc('button', { text: 'Search', classes: 'btn btn-fat text-right' });
const SearchForm = cc('form', {
    attr: { autocomplete: 'off' },
    children: [
        util.create_check(Radio_StartWith, radioValues[0], radioTitles[0]),
        util.create_check(Radio_Contains, radioValues[1], radioTitles[1]),
        util.create_check(Radio_EndWith, radioValues[2], radioTitles[2]),
        util.create_check(Radio_wildcard, radioValues[3], radioTitles[3]),
        span('('),
        util.LinkElem('https://www.tutorialspoint.com/sqlite/sqlite_like_clause.htm', { text: 'ref', blank: true }),
        span(')'),
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
        })),
    ],
});
$('#root').append(titleArea, naviBar, m(Loading).addClass('my-5'), m(Alerts).addClass('my-5'), m(SearchForm).addClass('my-5').hide());
init();
function init() {
    Loading.hide();
    SearchForm.elem().show();
}
