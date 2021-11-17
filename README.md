# dictplus
一个词典程序，但不只是一个词典程序

![screenshot-01](public/screenshot-01.webp)

## 用途/目的

1. 记录一些不容易查到的单词
2. 记录一些一两句话就能说清楚的知识（包括编程、常识、冷知识，甚至当作书签也很好用

暂时主要是自用，还没有最终完成，但已经可以正式使用了。


## 安装使用

- Windows 用户可
[直接下载 exe 文件](https://github.com/ahui2016/dictplus/releases)
- Mac 或 Linux 先正确安装 [git](https://git-scm.com/downloads) 和 [Go 语言环境](https://golang.google.cn/doc/install) 然后在终端执行以下命令:
  ```
  $ cd ~
  $ git clone https://github.com/ahui2016/dictplus.git
  $ cd dictplus
  $ go build
  $ ./dictplus
  ```
- 如果一切顺利，用浏览器访问 http://127.0.0.1 即可进行本地访问。如有端口冲突，可使用参数 `-addr` 更改端口，比如:
  ```
  $ ./dictplus -addr 127.0.0.1:955
  ```


## 关于搜索

- 搜索不区分大小写。
- 默认搜索方式是 "包含", 但当单独搜索 Label 时则采用 "begin with" 方式。
- 搜索结果最多只显示 100 条（有计划增加一个解除条数限制的高级功能）


## 本站前端使用 mj.js

- mj.js 是一个受 Mithril.js 启发的基于 jQuery 实现的极简框架，对于曾经用过 jQuery 的人来说，学习成本接近零。详见 https://github.com/ahui2016/mj.js
- 如果需要修改本软件的前端代码，可以直接修改 public/ts/dist 里的 js 文件。
- 也可修改 public/ts/src 文件夹内的 ts 文件，修改后在 public/ts/ 文件夹内执行 tsc 命令即可自动重新生成必要的 js 文件。
