package model

// localtags 的 IP 和端口，与 Images 里的 ID 组成一个完整网址
const ImageLocalIP = ""

// Word 可以是一个单词或一个短句
type Word struct {
	ID     string // ShortID
	CN     string
	EN     string
	JP     string
	Kana   string // 与 JP 对应的平假名
	Label  string // 每个单词只有一个标签，一般用来记录出处（书名或文章名）
	Notes  string
	Links  string // 用换行符分隔的网址
	Images string // 用逗号分隔的图片 ID, 与 localtags 搭配使用
	CTime  int64
}
