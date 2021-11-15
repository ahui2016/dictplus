// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { m, cc } from './mj.js';
import * as util from './util.js';
let wordID = util.getUrlParam('id');
const Loading = util.CreateLoading('center');
const Alerts = util.CreateAlerts();
const titleArea = m('div').addClass('text-center').append(m('h1').text('Details of an item'));
const naviBar = m('div').addClass('text-right').append(util.LinkElem('/', { text: 'Home' }), util.LinkElem('/public/edit-word.html?id=' + wordID, { text: 'Edit' }).addClass('ml-2'));
const WordInfo = cc('table');
WordInfo.append = (key, value) => {
    WordInfo.elem().append(create_table_row(key, value));
    return WordInfo;
};
$('#root').append(titleArea, naviBar, m(Loading), m(Alerts), m(WordInfo).hide());
init();
function init() {
    if (!wordID) {
        Loading.hide();
        Alerts.insert('danger', 'the blog id is empty, need a blog id');
        return;
    }
    util.ajax({ method: 'POST', url: '/api/get-word', alerts: Alerts, body: { id: wordID } }, resp => {
        const w = resp;
        $('title').text(`Edit (id:${wordID}) - dictplus`);
        const Links = cc('div', { classes: 'WordLinks' });
        const Images = cc('div', { classes: 'WordImages' });
        const Notes = cc('pre', { classes: 'WordNotes' });
        const ctime = dayjs.unix(w.CTime).format('YYYY-MM-DD HH:mm:ss');
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
                Links.elem().append(util.LinkElem(link, { blank: true }));
            });
        }
        if (w.Images) {
            w.Images.split(', ').forEach(id => {
                Images.elem().append(util.LinkElem(util.imageUrl(id), { text: id, blank: true }));
            });
        }
    }, undefined, () => {
        Loading.hide();
    });
}
function create_table_row(key, value) {
    const tr = m('tr').append(m('td').addClass('nowrap').text(key));
    if (typeof value == 'string') {
        tr.append(m('td').addClass('pl-2').text(value));
    }
    else {
        tr.append(m('td').addClass('pl-2').append(value));
    }
    return tr;
}
window.delete_forever = () => {
    util.ajax({ method: 'POST', url: '/api/delete-word', alerts: Alerts, body: { id: wordID } }, () => {
        Alerts.clear().insert('danger', '已彻底删除该项目，不可恢复。');
    });
};
