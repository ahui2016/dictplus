package model

// localtags 的 IP 和端口，与 Images 里的 ID 组成一个完整网址
const ImageLocalIP = ""

// Word 可以是一个单词或一个短句
type Word struct {
	ID     string // ShortID
	EN     string
	CN     string
	JP     string
	Kana   string // 与 JP 对应的平假名
	Label  string // 每个单词只有一个标签，一般用来记录出处（书名或文章名）
	Notes  string
	Links  []byte // json array
	Images []byte // 图片 ID 数组，与 localtags 搭配使用
	CTime  int64
}