# dictplus
一个词典程序，但不只是一个词典程序

## 更新记录

这里只是简单记录最近的更新情况，更详细的更新说明请看 [Releases](https://github.com/ahui2016/dictplus/releases)

- `2021-12-05` 修复了一个 html 标签注入的 bug (由于本软件是本地单用户使用，因此这个 bug 不算严重)
- `2021-11-29` 添加了 Delay 选项、"无标签"按钮、数据库文件下载按钮
- `2021-11-27` 修复了 [issues/1](https://github.com/ahui2016/dictplus/issues/1), 另外 Label 高级搜索增加了自动切换模式功能
- `2021-11-26` 添加了 Label 高级搜索页面（当最近标签超过 10 个时才会出现入口）, 添加了 gitee 仓库方便国内使用
- `2021-11-25` 在 README 添加了 dark mode 截图（受到 [https://v2ex.com/t/817790](https://v2ex.com/t/817790) 的启发）
- `2021-11-20` 添加了 Settings 页面，可设置默认端口

![screenshot-01](screenshots/screenshot-01.webp#gh-light-mode-only)
![screenshot-01](screenshots/screenshot-dark-01.webp#gh-dark-mode-only)

## 用途/目的

1. 记录一些不容易查到的单词
2. 记录一些一两句话就能说清楚的知识 (包括编程、常识、冷知识，甚至当作书签也很好用)

## 安装使用

- Windows 用户可
[直接下载 exe 文件](https://github.com/ahui2016/dictplus/releases) (国内下载地址 https://gitee.com/ipelago/dictplus/releases)
- Mac 或 Linux 先正确安装 [git](https://git-scm.com/downloads) 和 [Go 语言环境](https://golang.google.cn/doc/install) 然后在终端执行以下命令:  
  (国内用户可使用 `https://gitee.com/ipelago/dictplus.git` 来替换下面 git clone 后的网址)
  ```
  $ cd ~
  $ git clone https://github.com/ahui2016/dictplus.git
  $ cd dictplus
  $ git checkout tags/2021-12-05 -b 2021-12-05
  $ go build
  $ ./dictplus
  ```
- 如果一切顺利，用浏览器访问 http://127.0.0.1 即可进行本地访问。如有端口冲突，可使用参数 `-addr` 更改端口，比如:
  ```
  $ ./dictplus -addr 127.0.0.1:955
  ```

## 搜索

- 搜索不区分大小写。
- 在首页的 Recent Labels (最近标签) 末尾有一个 all labels 按钮，点击该按钮可进入 Search by Label 页面。
- 在 Search by Label 页面列出了全部标签，并且区分了大类小类，还能选择不同的搜索方式，非常方便。

## 链接

- 每个词条可以拥有多个链接，在输入框中用回车区分（即每行一个链接）
- 一个词条如果有链接，在搜索结果列表中就会有 link 按钮
- 点击 link 按钮相当于点击该词条的第一个链接，更多链接则需要点击 view 查看详细内容
- 如果该词条有多个链接, 那么 link 按钮的文字会变成 links, 因此如果看到 link 没有复数就知道不需要点击 view 按钮去查看更多链接了
- 这样设计是为了兼顾功能性与界面的简洁

## 插图

- 插图功能需要与 [localtags](https://github.com/ahui2016/localtags) 搭配使用，把图片上传到 localtags 后可获得文件 ID。
- 在添加或编辑词条时，可在 Images 栏内填写 localtags 里的图片文件的 ID。
- 点击 view 按钮查看词条的详细信息即可看到图片，点击图片名称可跳转到 localtags, 方便更改图片名称或删除图片。（参考下面的截图1）

## 备份

- 第一次运行程序后，会在程序所在文件夹内自动生成 db-dictplus.sqlite 文件，只要备份这一个文件即可。
- 在 Settings 页面也可下载 db-dictplus.sqlite 文件。
- 以后会增加将整个数据库导出为一个 json 文件的功能。

## 更新

- 更新前请先备份 db-dictplus.sqlite 文件（通常不备份也不影响更新，只是以防万一，总之常备份准没错）
- 如果你是下载 zip 包在 Windows 里使用，直接用新文件覆盖旧文件即可（注意别覆盖 db-dictplus.sqlite 文件）。
- 如果你是通过源码安装，可使用以下命令 
  ```
  $ cd ~/dictplus
  $ git pull
  $ git checkout tags/2021-12-05 -b 2021-12-05
  $ go build
  $ ./dictplus
  ```
- 更新后有时前端会受缓存影响，可在浏览器里按 Ctrl-Shift-R 强制刷新。


## 本站前端使用 mj.js

- mj.js 是一个受 Mithril.js 启发的基于 jQuery 实现的极简框架，对于曾经用过 jQuery 的人来说，学习成本接近零。详见 https://github.com/ahui2016/mj.js
- 如果需要修改本软件的前端代码，可以直接修改 public/ts/dist 里的 js 文件。
- 也可修改 public/ts/src 文件夹内的 ts 文件，修改后在 public/ts/ 文件夹内执行 tsc 命令即可重新生成必要的 js 文件。

## 截图

- 本页面的图片会跟随 github 的 light mode / dark mode 设定而自动切换，参考 [https://v2ex.com/t/817790](https://v2ex.com/t/817790)
- dictplus 本身也会跟随系统的 light mode / dark mode 设定而自动切换主题。

图1：

![screenshot-03](screenshots/screenshot-03.webp#gh-light-mode-only)
![screenshot-03](screenshots/screenshot-dark-03.webp#gh-dark-mode-only)

图2：

![screenshot-04](screenshots/screenshot-04.webp#gh-light-mode-only)
![screenshot-04](screenshots/screenshot-dark-04.webp#gh-dark-mode-only)

图3：

![screenshot-02](screenshots/screenshot-02.webp#gh-light-mode-only)
![screenshot-02](screenshots/screenshot-dark-02.webp#gh-dark-mode-only)
