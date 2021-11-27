package main

import (
	"fmt"
	"strings"
	"time"

	"ahui2016.github.com/dictplus/util"
	"github.com/labstack/echo/v4"
)

// Text 用于向前端返回一个简单的文本消息。
// 为了保持一致性，总是向前端返回 JSON, 因此即使是简单的文本消息也使用 JSON.
type Text struct {
	Message string `json:"message"`
}

type Number struct {
	N int64 `json:"n"`
}

type SearchForm struct {
	Pattern string   `json:"pattern"`
	Fields  []string `json:"fields"`
	Limit   int      `json:"limit"`
}

func sleep(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		time.Sleep(time.Second)
		return next(c)
	}
}

func jsFile(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if strings.HasSuffix(c.Request().RequestURI, ".js") {
			c.Response().Header().Set(echo.HeaderContentType, "application/javascript")
		}
		return next(c)
	}
}

func errorHandler(err error, c echo.Context) {
	if e, ok := err.(*echo.HTTPError); ok {
		c.JSON(e.Code, e.Message)
	}
	util.Panic(c.JSON(500, Text{err.Error()}))
}

func getWordHandler(c echo.Context) error {
	id := c.FormValue("id")
	w, err := db.GetWordByID(id)
	if err != nil {
		return err
	}
	return c.JSON(OK, w)
}

func deleteWordHandler(c echo.Context) error {
	id := c.FormValue("id")
	if _, err := db.GetWordByID(id); err != nil {
		return err
	}
	return db.DeleteWord(id)
}

func addWordHandler(c echo.Context) error {
	w, err := getWordValue(c)
	if err != nil {
		return err
	}
	if err := db.InsertNewWord(w); err != nil {
		return err
	}
	return c.JSON(OK, Text{w.ID})
}

func updateWordHandler(c echo.Context) error {
	w, err := getWordValue(c)
	if err != nil {
		return err
	}
	if w.ID == "" {
		return fmt.Errorf("id is empty, need an id")
	}
	// 确保 w.ID 存在于数据库中
	if _, err = db.GetWordByID(w.ID); err != nil {
		return err
	}
	return db.UpdateWord(w)
}

func countHandler(c echo.Context) error {
	n, err := db.CountAllWords()
	if err != nil {
		return err
	}
	return c.JSON(OK, Number{n})
}

func searchHandler(c echo.Context) error {
	f := new(SearchForm)
	if err := c.Bind(f); err != nil {
		return err
	}
	if f.Limit == 0 {
		f.Limit = DefaultPageLimit
	}
	words, err := db.GetWords(strings.TrimSpace(f.Pattern), f.Fields, f.Limit)
	if err != nil {
		return err
	}
	return c.JSON(OK, words)
}

func getAllLabels(c echo.Context) error {
	labels, err := db.GetAllLabels()
	if err != nil {
		return err
	}
	return c.JSON(OK, labels)
}

func getRecentLabels(c echo.Context) error {
	labels, err := db.GetRecentLabels()
	if err != nil {
		return err
	}
	return c.JSON(OK, strings.Fields(labels))
}

func getHistoryHandler(c echo.Context) error {
	history, err := db.GetHistory()
	if err != nil {
		return err
	}
	return c.JSON(OK, strings.Fields(history))
}

func updateHistory(c echo.Context) error {
	history, err := getFormValue(c, "history")
	if err != nil {
		return err
	}
	return db.UpdateHistory(history)
}

func getSettingsHandler(c echo.Context) error {
	s, err := db.GetSettings()
	if err != nil {
		return err
	}
	return c.JSON(OK, s)
}

func updateSettings(c echo.Context) error {
	addr1, e1 := getFormValue(c, "addr1")
	addr2, e2 := getFormValue(c, "addr2")
	if err := util.WrapErrors(e1, e2); err != nil {
		return err
	}
	return db.UpdateSettings(Settings{
		DictplusAddr:  addr1,
		LocaltagsAddr: addr2,
	})
}

func publicFileHandler(c echo.Context) error {
	filename := c.Param("filename")
	return c.File("public/" + filename)
}

func scriptsFileHandler(c echo.Context) error {
	filename := c.Param("filename")
	c.Response().Header().Set(echo.HeaderContentType, "application/javascript")
	return c.File("public/ts/dist/" + filename)
}

// getFormValue gets the c.FormValue(key), trims its spaces,
// and checks if it is empty or not.
func getFormValue(c echo.Context, key string) (string, error) {
	value := strings.TrimSpace(c.FormValue(key))
	if value == "" {
		return "", fmt.Errorf("form value [%s] is empty", key)
	}
	return value, nil
}

func getWordValue(c echo.Context) (word *Word, err error) {
	w := new(Word)
	if err = c.Bind(w); err != nil {
		return
	}
	word = new(Word)
	word.ID = strings.TrimSpace(w.ID)
	word.CN = strings.TrimSpace(w.CN)
	word.EN = strings.TrimSpace(w.EN)
	word.JP = strings.TrimSpace(w.JP)
	word.Kana = strings.TrimSpace(w.Kana)
	word.Other = strings.TrimSpace(w.Other)
	if word.EN+word.CN+word.JP+word.Other == "" {
		return nil, fmt.Errorf("必须至少填写一个: CN, EN, JP, Other")
	}
	if word.Kana != "" && word.JP == "" {
		return nil, fmt.Errorf("如果填写了 Kana, 就必须填写 JP")
	}
	word.Label = normalizeLabel(w.Label)
	word.Notes = strings.TrimSpace(w.Notes)
	word.Links = strings.TrimSpace(w.Links)
	word.Images = strings.TrimSpace(w.Images)
	return
}

// Label 由用户自由输入，但可以用分隔符 ("-" 或 "/" 或空格) 来区分大类与小类，
// 第一个分隔符之前的内容被视为大类，后面的都是小类。
// 在 Label 专属的搜索页面对大类和小类有合理的特殊处理。
func normalizeLabel(label string) string {
	label = strings.TrimSpace(label)
	label = strings.Join(strings.Fields(label), " ")
	label = strings.Join(strings.FieldsFunc(label, func(c rune) bool {
		return c == '-'
	}), "-")
	label = strings.Join(strings.FieldsFunc(label, func(c rune) bool {
		return c == '/'
	}), "/")
	return label
}
