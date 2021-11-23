// 采用受 Mithril 启发的基于 jQuery 实现的极简框架 https://github.com/ahui2016/mj.js
import { m, cc, span } from './mj.js';
import * as util from './util.js';
let wordID = util.getUrlParam('id');
let localtagsAddr = "http://127.0.0.1:53549";
const Loading = util.CreateLoading('center');
const Alerts = util.CreateAlerts();
const titleArea = m('div').addClass('text-center').append(m('h1').text('Details of an item'));
const EditBtn = cc('a', {
    text: 'Edit',
    attr: { href: '/public/edit-word.html?id=' + wordID },
    classes: 'ml-2',
});
const DelBtn = cc('a', { text: 'delete', classes: 'ml-2', attr: { href: '#' } });
const naviBar = m('div').addClass('text-right').append(util.LinkElem('/', { text: 'Home' }), m(EditBtn).hide(), m(DelBtn).on('click', e => {
    e.preventDefault();
    util.disable(DelBtn);
    Alerts.insert('danger', '当 delete 按钮变红时，再点击一次可删除该词条，不可恢复。');
    setTimeout(() => {
        util.enable(DelBtn);
        DelBtn.elem().css('color', 'red').off().on('click', e => {
            e.preventDefault();
            util.ajax({ method: 'POST', url: '/api/delete-word', alerts: Alerts, buttonID: DelBtn.id, body: { id: wordID } }, () => {
                Alerts.clear().insert('success', '已彻底删除该词条。');
                WordInfo.elem().hide();
                EditBtn.elem().hide();
                DelBtn.elem().hide();
            });
        });
    }, 2000);
}).hide());
const WordInfo = cc('table');
WordInfo.append = (key, value) => {
    WordInfo.elem().append(create_table_row(key, value));
    return WordInfo;
};
const ImagesAlerts = util.CreateAlerts();
const ImagesList = cc('div', { classes: 'ImagesPreview' });
const ImagesListArea = cc('div', { children: [
        m('h3').text('Images Preview'),
        m('hr'),
        m(ImagesAlerts),
        m(ImagesList).addClass('my-3'),
    ] });
$('#root').append(titleArea, naviBar, m(Loading), m(Alerts).addClass('my-5'), m(WordInfo).hide(), m(ImagesListArea).addClass('my-5').hide());
init();
function init() {
    if (!wordID) {
        Loading.hide();
        Alerts.insert('danger', 'the blog id is empty, need a blog id');
        return;
    }
    initLocaltagsAddr();
}
function initLocaltagsAddr() {
    util.ajax({ method: 'GET', url: '/api/get-settings', alerts: Alerts }, resp => {
        const settings = resp;
        localtagsAddr = settings.LocaltagsAddr;
        initWord();
    });
}
function initWord() {
    util.ajax({ method: 'POST', url: '/api/get-word', alerts: Alerts, body: { id: wordID } }, resp => {
        const w = resp;
        $('title').text(`Details (id:${wordID}) - dictplus`);
        const Links = cc('div', { classes: 'WordLinks' });
        const Images = cc('div', { classes: 'WordImages' });
        const Notes = cc('pre', { classes: 'WordNotes' });
        const ctime = dayjs.unix(w.CTime).format('YYYY-MM-DD HH:mm:ss');
        EditBtn.elem().show();
        DelBtn.elem().show();
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
            ImagesListArea.elem().show();
            w.Images.split(', ').forEach(id => {
                const img = imageUrl(id);
                Images.elem().append(span(id));
                const ImageItem = cc('div', { id: id, classes: 'mb-4' });
                ImagesList.elem().append(m(ImageItem).append('↓ ', util.LinkElem(`${localtagsAddr}/light/search?fileid=${id}`, { text: id, blank: true }).addClass('ImageName'), m('img').attr({ src: img })));
                fillImageName(id);
            });
        }
    }, undefined, () => {
        Loading.hide();
    });
}
function fillImageName(id) {
    util.ajax({ method: 'POST', url: `${localtagsAddr}/api/search-by-id`, alerts: ImagesAlerts, body: { id: id } }, resp => {
        const files = resp;
        $(`#${id} .ImageName`).text(files[0].Name);
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
function imageUrl(id) {
    return `${localtagsAddr}/mainbucket/${id}`;
}
